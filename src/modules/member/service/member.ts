import {ILogger, Inject, Provide} from '@midwayjs/core';
import {MemberEntity} from '../entity/member';
import {InjectEntityModel} from '@midwayjs/typeorm';
import {Repository} from 'typeorm';
import {CoolCommException} from '@cool-midway/core';
import {BusinessType, ScoreService} from './score';
import {MemberExchangeConfigService} from './memberExchangeConfig';

/**
 * 会员服务类
 */
@Provide()
export class MemberService {
  @Inject()
  scoreService: ScoreService;

  @Inject()
  memberExchangeConfigService: MemberExchangeConfigService;

  @Inject()
  logger: ILogger;

  @InjectEntityModel(MemberEntity)
  memberEntity: Repository<MemberEntity>;

  /**
   * 积分兑换会员（简化版）
   * @param createUserId 用户ID
   * @param userMmemberExchangeId
   */
  async exchangeByScore(createUserId: number, userMmemberExchangeId: number) {
    // 获取兑换配置信息
    const exchangeConfig = await this.memberExchangeConfigService.info(
      userMmemberExchangeId
    );
    this.logger.info('兑换会员配置信息', exchangeConfig);

    if (!exchangeConfig) {
      throw new CoolCommException('无效的兑换配置');
    }

    const { days, requiredScore } = exchangeConfig;

    // 检查用户积分是否足够
    const userScore = await this.scoreService.getUserTotalScore(createUserId);
    if (userScore < requiredScore) {
      throw new CoolCommException('积分不足');
    }

    // 扣除积分
    await this.scoreService.reduceScore(
      createUserId,
      exchangeConfig.id,
      BusinessType.EXCHANGE,
      exchangeConfig.exchangeName
    );

    // 获取用户当前会员信息
    let member = await this.memberEntity.findOne({
      where: { createUserId: createUserId },
    });

    const now = new Date();
    // 如果用户还没有会员记录，则创建新记录
    if (!member) {
      member = new MemberEntity();
      member.createUserId = createUserId;
      member.startTime = now;
      // 计算结束时间
      const endTime = new Date(now.getTime());
      endTime.setDate(endTime.getDate() + days);
      member.endTime = endTime;
    } else {
      // 如果已有会员，则在现有结束时间基础上延长
      const currentEndTime = member.endTime || now;
      // 如果会员已过期，则从现在开始计算
      const baseTime = currentEndTime < now ? now : currentEndTime;
      const newEndTime = new Date(baseTime.getTime());
      newEndTime.setDate(newEndTime.getDate() + days);
      member.endTime = newEndTime;
    }
    member.score = requiredScore;

    // 保存会员信息
    await this.memberEntity.save(member);

    return {
      success: true,
      message: `成功兑换${days}天会员`,
      member,
      exchangeInfo: {
        scoreUsed: requiredScore,
        daysAdded: days,
      },
    };
  }

  /**
   * 检查用户是否为有效会员
   * @param createUserId 用户ID
   * @returns 是否为有效会员
   */
  async isValidMember(createUserId: number): Promise<boolean> {
    const member = await this.memberEntity.findOne({
      where: { createUserId: createUserId },
    });
    if (!member || !member.endTime) {
      return false;
    }
    return member.endTime > new Date();
  }

  /**
   * 获取用户会员剩余天数
   * @param createUserId 用户ID
   * @returns 剩余天数，如果不是会员则返回0
   */
  async getRemainingDays(createUserId: number): Promise<number> {
    const member = await this.memberEntity.findOne({
      where: { createUserId: createUserId },
    });
    if (!member || !member.endTime) {
      return 0;
    }

    const now = new Date();
    if (member.endTime <= now) {
      return 0;
    }

    const diffTime = member.endTime.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
