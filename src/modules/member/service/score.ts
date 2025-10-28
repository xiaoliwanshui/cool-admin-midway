import { Provide, Inject } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { ScoreEntity } from '../entity/score';
import { BaseService, CoolCommException } from '@cool-midway/core';
import { AdsEntity } from '../../application/entity/ads';
import { MemberExchangeConfigEntity } from '../entity/memberExchangeConfig';
import {MonthlyCheckinConfigEntity} from "../entity/monthlyCheckinConfig";
//修改类型枚举
export enum ScoreType {
  ADD = 1,
  REDUCE = 0,
}
//业务类型枚举
export enum BusinessType {
  //广告
  ADVERTISEMENT = 0,
  //签到
  SIGN = 1,
  //积分兑换
  EXCHANGE = 2,
}
/**
 * 积分服务类
 */
@Provide()
export class ScoreService extends BaseService {
  @Inject()
  ctx;

  @InjectEntityModel(ScoreEntity)
  scoreEntity: Repository<ScoreEntity>;

  @InjectEntityModel(AdsEntity)
  adsEntity: Repository<AdsEntity>;

  @InjectEntityModel(MemberExchangeConfigEntity)
  memberExchangeConfigEntity: Repository<MemberExchangeConfigEntity>;

  @InjectEntityModel(MonthlyCheckinConfigEntity)
  monthlyCheckinConfigEntity: Repository<MonthlyCheckinConfigEntity>;

  //定义增减的枚举值

  /**
   * 增加积分
   * @param createUserId 用户ID
   * @param reason 原因
   * @param businessId 业务ID
   * @param businessType 业务类型
   */
  async addScore(
    createUserId: number,
    reason?: string,
    businessId?: number,
    businessType?: BusinessType
  ): Promise<ScoreEntity | CoolCommException> {
    if (businessType === BusinessType.ADVERTISEMENT) {
      const ads = await this.adsEntity.findOneBy({
        id: businessId,
        status: 1,
      });
      if (ads) {
        return await this.scoreEntity.save({
          createUserId,
          score: ads.score,
          reason: reason||'广告',
          type: ScoreType.ADD,
          businessId: businessId,
          businessType: BusinessType.ADVERTISEMENT,
        });
      } else {
        throw new CoolCommException('无效广告ID');
      }
    } else if (businessType === BusinessType.SIGN) {
      const UserSignScore = await this.getUserSignScore(businessId);
      if (UserSignScore) {
        return await this.scoreEntity.save({
          createUserId,
          score: UserSignScore.score,
          reason: reason || '签到',
          type: ScoreType.ADD,
          businessId: businessId,
          businessType: BusinessType.SIGN,
        });
      } else {
        throw new CoolCommException('今日已签到');
      }
    }
  }

  /**
   * 减少积分
   * @param createUserId
   * @param reason 原因
   * @param businessId 业务ID
   * @param businessType 业务类型
   */
  async reduceScore(
    createUserId: number,
    businessId: number,
    businessType: BusinessType,
    reason?: string
  ) {
    if (businessType === BusinessType.EXCHANGE) {
      const memberExchangeConfigEntity =
        await this.memberExchangeConfigEntity.findOneBy({
          id: businessId,
        });
      if (memberExchangeConfigEntity) {
        return await this.scoreEntity.save({
          createUserId,
          businessId,
          businessType,
          reason,
          score: -memberExchangeConfigEntity.requiredScore,
          type: ScoreType.REDUCE,
        });
      }
    }
  }

  /**
   * 获取用户积分总和
   * @param createUserId 用户ID
   */
  async getUserTotalScore(createUserId: number): Promise<number> {
    const result = await this.scoreEntity
      .createQueryBuilder('score')
      .select(
        'SUM(CASE WHEN score.type = 1 THEN score.score ELSE -score.score END)',
        'total'
      )
      .where('score.createUserId = :createUserId', { createUserId })
      .getRawOne();

    return result?.total ? parseInt(result.total) : 0;
  }

  /**
   * 获取用户签到积分记录
   * 条件
   * createTime 在今天
   * businessType 是BusinessType.SIGN
   * type 是ScoreType.ADD
   * businessId 作为入参
   */
  async getUserSignScore(businessId: number): Promise<MonthlyCheckinConfigEntity | null> {
    const result = await this.scoreEntity.findOneBy({
      businessId,
      businessType: BusinessType.SIGN,
      type: ScoreType.ADD,
      createTime: this.ctx.helper.dayjs().format('YYYY-MM-DD'),
    });
    if (result === null) {
      return this.monthlyCheckinConfigEntity.findOneBy({
       id: businessId
      });
    } else {
      return null;
    }
  }

  /**
   * 获取用户积分记录
   * @param createUserId 用户ID
   * @param page 页码
   * @param size 每页数量
   */
  async getUserScoreRecords(
    createUserId: number,
    page: number = 1,
    size: number = 20
  ) {
    return await this.scoreEntity
      .findAndCount({
        where: { createUserId },
        order: { id: 'DESC' },
        skip: (page - 1) * size,
        take: size,
      })
      .then(([records, total]) => {
        return {
          records,
          total,
          page,
          size,
        };
      });
  }
}
