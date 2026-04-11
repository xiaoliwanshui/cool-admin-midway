import {Provide, Inject, ILogger} from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import {Repository, Between} from 'typeorm';
import { BaseService, CoolCommException } from '@cool-midway/core';
import { ScoreWithdrawalEntity } from '../entity/scoreWithdrawal';
import { MemberEntity } from '../entity/member';
import { ScoreService, BusinessType } from './score';
import {UserInfoEntity} from "../../user/entity/info";
import {Utils} from "../../../comm/utils";
import {InviteCodeEntity} from "../../user/entity/inviteCode";
import {InviteRecordEntity} from "../../user/entity/inviteRecord";


/**
 * 积分提现状态枚举
 */
export enum WithdrawalStatus {
  PENDING = 0,      // 待审核
  APPROVED = 1,     // 已通过
  REJECTED = 2,     // 已拒绝
  PAID = 3,         // 已打款
}

/**
 * 提现配置接口
 */
interface ScoreWithdrawalConfig {
  id: number;
  score: number;
  amount: number;
  member: number;
}

/**
 * 积分提现服务
 */
@Provide()
export class ScoreWithdrawalService extends BaseService {

  @Inject()
  ctx;

  @Inject()
  utils: Utils;

  @InjectEntityModel(ScoreWithdrawalEntity)
  scoreWithdrawalEntity: Repository<ScoreWithdrawalEntity>;

  @InjectEntityModel(MemberEntity)
  memberEntity: Repository<MemberEntity>;

  @InjectEntityModel(InviteCodeEntity)
  inviteCodeEntity: Repository<InviteCodeEntity>;

  @InjectEntityModel(InviteRecordEntity)
  inviteRecordEntity: Repository<InviteRecordEntity>;

  @InjectEntityModel(UserInfoEntity)
  userInfoEntity: Repository<UserInfoEntity>;

  @Inject()
  scoreService: ScoreService;

  @Inject()
  logger: ILogger;

  private readonly TAG = 'ScoreWithdrawalService';

  // 定义积分兑换现金的配置数组
  private scoreWithdrawalConfigList: ScoreWithdrawalConfig[] = [
    {
      id: 0,
      score: 1000,
      amount: 1,
      member: 3
    },
    {
      id: 1,
      score: 5000,
      amount: 5,
      member: 8
    },
    {
      id: 2,
      score: 20000,
      amount: 20,
      member: 25
    },
    {
      id: 3,
      score: 50000,
      amount: 50,
      member: 80
    }
  ];

  /**
   * 获取提现配置
   */
  scoreWithdrawalConfig() {
    return { list: this.scoreWithdrawalConfigList };
  }

  /**
   * 创建提现申请
   * @param userId 用户 ID
   * @param type 提现类型
   * @param remark 备注
   */
  async createWithdrawal(
    userId: number,
    type: number,
    remark?: string
  ): Promise<void> {
    try {
      // 输入验证
      if (!userId || typeof userId !== 'number') {
        throw new CoolCommException('用户ID无效');
      }
      if (!type || typeof type !== 'number') {
        throw new CoolCommException('提现类型无效');
      }

      this.logger.debug(this.TAG, '提现配置信息', { userId, type });

      // 检查用户积分是否足够
      const currentScore = await this.scoreService.getUserTotalScore(userId);
      const scoreWithdrawalConfig = this.scoreWithdrawalConfigList.find(item => item.id === type);

      if (!scoreWithdrawalConfig) {
        throw new CoolCommException('无效的提现方式');
      }

      this.logger.debug(this.TAG, '用户积分', { currentScore, required: scoreWithdrawalConfig.score });
      if (currentScore < scoreWithdrawalConfig.score) {
        throw new CoolCommException('积分不足');
      }

      // 获取用户信息
      const user = await this.userInfoEntity.findOneBy({ id: userId });
      if (!user) {
        throw new CoolCommException('用户不存在');
      }

      // 获取用户邀请码
      const inviteCodeEntity = await this.inviteCodeEntity.findOneBy({ createUserId: userId });
      if (!inviteCodeEntity || !inviteCodeEntity.code) {
        throw new CoolCommException('邀请码不存在');
      }

      // 计算24小时内的邀请记录
      const startTime = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
      const endTime = new Date();
      const inviteRecordCount = await this.inviteRecordEntity.countBy({
        createTime: Between(startTime, endTime),
        code: inviteCodeEntity.code
      });

      this.logger.debug(this.TAG, '邀请记录', { count: inviteRecordCount, required: scoreWithdrawalConfig.member });
      if (inviteRecordCount < scoreWithdrawalConfig.member) {
        throw new CoolCommException(`今天邀请${scoreWithdrawalConfig.member - inviteRecordCount}人即可提现`);
      }

      // 扣除用户积分
      await this.scoreService.reduceScore(
        userId,
        scoreWithdrawalConfig.id,
        BusinessType.WITHDRAWAL,
        remark || '积分提现申请',
        scoreWithdrawalConfig.score
      );

      // 获取IP地址
      const ipAddress = await this.utils.getReqIP(this.ctx) as string;

      // 创建提现记录
      await this.scoreWithdrawalEntity.save({
        createUserId: userId,
        score: scoreWithdrawalConfig.score,
        amount: scoreWithdrawalConfig.amount,
        paymentAccount: user.phone,
        ipAddress: ipAddress,
        status: WithdrawalStatus.PENDING
      });

      this.logger.info(this.TAG, `用户 ${userId} 申请提现 ${scoreWithdrawalConfig.amount} 元，消耗 ${scoreWithdrawalConfig.score} 积分`);
    } catch (error) {
      this.logger.error(this.TAG, '创建提现申请失败', error);
      throw error;
    }
  }

}
