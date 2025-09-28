import {Inject, Provide} from '@midwayjs/core';
import {MemberEntity} from '../entity/member';
import {InjectEntityModel} from '@midwayjs/typeorm';
import {Repository} from 'typeorm';
import {CoolCommException} from '@cool-midway/core';
import {ScoreService} from "./score";

/**
 * 会员服务类
 */
@Provide()
export class MemberService {
  @Inject()
  scoreService: ScoreService;

  @InjectEntityModel(MemberEntity)
  memberEntity: Repository<MemberEntity>;

  /**
   * 积分兑换会员（简化版）
   * @param createUserId 用户ID
   * @param score 所需积分
   * @param days 兑换天数
   */
  async exchangeByScore(createUserId: number, score: number, days: number) {
    // 检查用户积分是否足够
    const userScore = await this.scoreService.getUserTotalScore(createUserId);
    if (userScore < score) {
      throw new CoolCommException('积分不足');
    }

    // 扣除积分
    await this.scoreService.reduceScore(
      createUserId,
      score,
      `兑换会员${days}天`,
      null,
      'exchange_member'
    );

    // 获取用户当前会员信息
    let member = await this.memberEntity.findOne({where: {createUserId: createUserId}});

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

    // 保存会员信息
    await this.memberEntity.save(member);

    return {
      success: true,
      message: `成功兑换${days}天会员`,
      member,
      exchangeInfo: {
        scoreUsed: score,
        daysAdded: days
      }
    };
  }

  /**
   * 检查用户是否为有效会员
   * @param createUserId 用户ID
   * @returns 是否为有效会员
   */
  async isValidMember(createUserId: number): Promise<boolean> {
    const member = await this.memberEntity.findOne({where: {createUserId: createUserId}});
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
    const member = await this.memberEntity.findOne({where: {createUserId: createUserId}});
    if (!member || !member.endTime) {
      return 0;
    }
    
    const now = new Date();
    if (member.endTime <= now) {
      return 0;
    }
    
    const diffTime = member.endTime.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
}
