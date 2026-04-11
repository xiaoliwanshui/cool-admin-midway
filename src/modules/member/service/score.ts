import { Provide, Inject, ILogger } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ScoreEntity } from '../entity/score';
import { BaseService, CoolCommException } from '@cool-midway/core';
import { AdsEntity } from '../../application/entity/ads';
import { MemberExchangeConfigEntity } from '../entity/memberExchangeConfig';
import { MonthlyCheckinConfigEntity } from '../entity/monthlyCheckinConfig';
import * as moment from 'moment';

// 修改类型枚举
export enum ScoreType {
  ADD = 1,
  REDUCE = 0,
}

// 业务类型枚举
export enum BusinessType {
  // 广告
  ADVERTISEMENT = 0,
  // 签到
  SIGN = 1,
  // 积分兑换
  EXCHANGE = 2,
  // 权限
  PERMISSION = 3,
  // 邀请用户
  INVITE = 4,
  // 积分提现
  WITHDRAWAL = 5,
}

/**
 * 积分服务类
 */
@Provide()
export class ScoreService extends BaseService {
  @Inject()
  ctx;

  @Inject()
  logger: ILogger;

  @InjectEntityModel(ScoreEntity)
  scoreEntity: Repository<ScoreEntity>;

  @InjectEntityModel(AdsEntity)
  adsEntity: Repository<AdsEntity>;

  @InjectEntityModel(MemberExchangeConfigEntity)
  memberExchangeConfigEntity: Repository<MemberExchangeConfigEntity>;

  @InjectEntityModel(MonthlyCheckinConfigEntity)
  monthlyCheckinConfigEntity: Repository<MonthlyCheckinConfigEntity>;

  private readonly TAG = 'ScoreService';
  private readonly DEFAULT_PERMISSION_SCORE = 20;
  private readonly DEFAULT_INVITE_SCORE = 100;

  /**
   * 增加积分
   * @param createUserId 用户ID
   * @param businessId 业务ID
   * @param businessType 业务类型
   * @param reason 原因
   */
  async addScore(
    createUserId: number,
    businessId: number,
    businessType: BusinessType,
    reason?: string
  ): Promise<ScoreEntity> {
    // 输入验证
    if (!createUserId || typeof createUserId !== 'number') {
      throw new CoolCommException('用户ID无效');
    }
    if (!businessId || typeof businessId !== 'number') {
      throw new CoolCommException('业务ID无效');
    }
    if (!businessType || !Object.values(BusinessType).includes(businessType)) {
      throw new CoolCommException('业务类型无效');
    }

    try {
      if (businessType === BusinessType.ADVERTISEMENT) {
        const ads = await this.adsEntity.findOneBy({
          id: businessId,
          status: 1,
        });
        if (ads) {
          const scoreRecord = await this.scoreEntity.save({
            createUserId,
            score: ads.score,
            reason: reason || '广告',
            type: ScoreType.ADD,
            businessId: businessId,
            businessType: BusinessType.ADVERTISEMENT,
          });
          this.logger.info(this.TAG, `用户 ${createUserId} 因广告获得 ${ads.score} 积分`);
          return scoreRecord;
        } else {
          throw new CoolCommException('无效广告ID');
        }
      } else if (businessType === BusinessType.SIGN) {
        this.logger.debug(this.TAG, '增加签到积分');
        const UserSignScore = await this.getUserSignScore(businessId, createUserId);
        if (UserSignScore) {
          const scoreRecord = await this.scoreEntity.save({
            createUserId,
            score: UserSignScore.score,
            reason: reason || '签到',
            type: ScoreType.ADD,
            businessId: businessId,
            businessType: BusinessType.SIGN,
          });
          this.logger.info(this.TAG, `用户 ${createUserId} 签到获得 ${UserSignScore.score} 积分`);
          return scoreRecord;
        } else {
          throw new CoolCommException('今日已签到');
        }
      } else if (businessType === BusinessType.PERMISSION) {
        const scoreRecord = await this.scoreEntity.save({
          createUserId,
          score: this.DEFAULT_PERMISSION_SCORE,
          reason: reason || '权限获取',
          type: ScoreType.ADD,
          businessId: businessId,
          businessType: BusinessType.PERMISSION,
        });
        this.logger.info(this.TAG, `用户 ${createUserId} 因权限获取获得 ${this.DEFAULT_PERMISSION_SCORE} 积分`);
        return scoreRecord;
      } else if (businessType === BusinessType.INVITE) {
        const scoreRecord = await this.scoreEntity.save({
          createUserId,
          score: this.DEFAULT_INVITE_SCORE,
          reason: reason || '邀请码被使用',
          type: ScoreType.ADD,
          businessId: businessId,
          businessType: BusinessType.INVITE,
        });
        this.logger.info(this.TAG, `用户 ${createUserId} 因邀请获得 ${this.DEFAULT_INVITE_SCORE} 积分`);
        return scoreRecord;
      } else {
        throw new CoolCommException('不支持的业务类型');
      }
    } catch (error) {
      this.logger.error(this.TAG, '增加积分失败', error);
      throw error;
    }
  }

  /**
   * 减少积分
   * @param createUserId 用户ID
   * @param businessId 业务ID
   * @param businessType 业务类型
   * @param reason 原因
   * @param score 积分数量
   */
  async reduceScore(
    createUserId: number,
    businessId: number,
    businessType: BusinessType,
    reason?: string,
    score?: number
  ): Promise<ScoreEntity | null> {
    // 输入验证
    if (!createUserId || typeof createUserId !== 'number') {
      throw new CoolCommException('用户ID无效');
    }
    if (!businessId || typeof businessId !== 'number') {
      throw new CoolCommException('业务ID无效');
    }
    if (!businessType || !Object.values(BusinessType).includes(businessType)) {
      throw new CoolCommException('业务类型无效');
    }

    try {
      if (businessType === BusinessType.EXCHANGE) {
        const memberExchangeConfigEntity =
          await this.memberExchangeConfigEntity.findOneBy({
            id: businessId,
          });
        if (memberExchangeConfigEntity) {
          const requiredScore = memberExchangeConfigEntity.requiredScore;
          const scoreRecord = await this.scoreEntity.save({
            createUserId,
            businessId,
            businessType,
            reason,
            score: -requiredScore,
            type: ScoreType.REDUCE,
          });
          this.logger.info(this.TAG, `用户 ${createUserId} 兑换消耗 ${requiredScore} 积分`);
          return scoreRecord;
        } else {
          this.logger.warn(this.TAG, `兑换配置不存在，ID: ${businessId}`);
          return null;
        }
      }

      if (businessType === BusinessType.WITHDRAWAL) {
        if (!score || score <= 0) {
          throw new CoolCommException('提现积分数量无效');
        }
        const scoreRecord = await this.scoreEntity.save({
          createUserId,
          businessId,
          businessType,
          reason,
          score: -score,
          type: ScoreType.REDUCE,
        });
        this.logger.info(this.TAG, `用户 ${createUserId} 提现消耗 ${score} 积分`);
        return scoreRecord;
      }

      this.logger.warn(this.TAG, `不支持的积分减少业务类型: ${businessType}`);
      return null;
    } catch (error) {
      this.logger.error(this.TAG, '减少积分失败', error);
      throw error;
    }
  }

  /**
   * 获取用户积分总和
   * @param createUserId 用户ID
   */
  async getUserTotalScore(createUserId: number): Promise<number> {
    // 输入验证
    if (!createUserId || typeof createUserId !== 'number') {
      this.logger.warn(this.TAG, '用户ID无效');
      return 0;
    }

    try {
      // 优化：使用单个查询计算总积分
      const result = await this.scoreEntity
        .createQueryBuilder('score')
        .select('SUM(score.score)', 'total')
        .where('score.createUserId = :createUserId', { createUserId })
        .getRawOne();

      return result?.total ? parseInt(result.total) : 0;
    } catch (error) {
      this.logger.error(this.TAG, '获取用户积分总和失败', error);
      return 0;
    }
  }

  /**
   * 获取用户签到积分记录
   * 条件
   * createTime 在今天
   * businessType 是BusinessType.SIGN
   * type 是ScoreType.ADD
   * businessId 作为入参
   */
  async getUserSignScore(
    businessId: number,
    createUserId: number
  ): Promise<MonthlyCheckinConfigEntity | null> {
    // 输入验证
    if (!businessId || typeof businessId !== 'number') {
      this.logger.warn(this.TAG, '业务ID无效');
      return null;
    }
    if (!createUserId || typeof createUserId !== 'number') {
      this.logger.warn(this.TAG, '用户ID无效');
      return null;
    }

    try {
      // 获取今天的开始时间
      const startTime = moment().startOf('day').toDate();
      // 获取今天的结束时间
      const endTime = moment().endOf('day').toDate();
      
      const result = await this.scoreEntity.findOneBy({
        businessId,
        businessType: BusinessType.SIGN,
        type: ScoreType.ADD,
        createTime: Between(startTime, endTime),
        createUserId: createUserId
      });
      
      this.logger.debug(this.TAG, '获取用户签到积分记录', result);
      
      if (result === null) {
        const config = await this.monthlyCheckinConfigEntity.findOneBy({
          id: businessId,
        });
        if (!config) {
          this.logger.warn(this.TAG, `签到配置不存在，ID: ${businessId}`);
        }
        return config;
      } else {
        return null;
      }
    } catch (error) {
      this.logger.error(this.TAG, '获取用户签到积分记录失败', error);
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
  ): Promise<{ records: ScoreEntity[]; total: number; page: number; size: number }> {
    // 输入验证
    if (!createUserId || typeof createUserId !== 'number') {
      throw new CoolCommException('用户ID无效');
    }
    if (page < 1) page = 1;
    if (size < 1 || size > 100) size = 20;

    try {
      const [records, total] = await this.scoreEntity
        .findAndCount({
          where: { createUserId },
          order: { id: 'DESC' },
          skip: (page - 1) * size,
          take: size,
        });

      return {
        records,
        total,
        page,
        size,
      };
    } catch (error) {
      this.logger.error(this.TAG, '获取用户积分记录失败', error);
      throw error;
    }
  }
}
