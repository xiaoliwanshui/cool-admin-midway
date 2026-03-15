import {Provide, Inject, ILogger} from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService, CoolCommException } from '@cool-midway/core';
import { ScoreWithdrawalEntity } from '../entity/scoreWithdrawal';
import { MemberEntity } from '../entity/member';
import { ScoreService } from './score';
import {UserInfoEntity} from "../../user/entity/info";
import {Utils} from "../../../comm/utils";

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


  @InjectEntityModel(UserInfoEntity)
  userInfoEntity: Repository<UserInfoEntity>;

  @Inject()
  scoreService: ScoreService;

  @Inject()
  logger: ILogger;

  //定义积分兑换现金的配置数组
  private scoreWithdrawalConfigList = [
    {
      id:0,
      score: 1000,
      amount: 1,
    },
    {
      id:1,
      score: 5000,
      amount: 5,
    },
    {
      id:2,
      score: 20000,
      amount: 20,
    },
    {
      id:3,
      score: 50000,
      amount: 50,
    },

  ]

  scoreWithdrawalConfig(){
    return {list:this.scoreWithdrawalConfigList}
  }

  /**
   * 创建提现申请
   * @param userId 用户 ID
   * @param type
   * @param remark 备注
   */
  async createWithdrawal(
    userId: number,
    type: number,
    remark?: string
  ): Promise<void> {
    this.logger.info('提现配置信息',userId,type);
    // 检查用户积分是否足够
    const currentScore = await this.scoreService.getUserTotalScore(userId);
    const scoreWithdrawalConfig =this.scoreWithdrawalConfigList.find(item=>item.id===type)

    if(scoreWithdrawalConfig===undefined){
     throw new CoolCommException('无效的提现方式');
   }
    this.logger.info('用户积分', currentScore);
    if (currentScore < scoreWithdrawalConfig.score) {
      throw new CoolCommException('积分不足');
    }

    const user = await this.userInfoEntity.findOneBy({id:userId });
    // 扣除用户积分
    await this.scoreService.reduceScore(
      userId,
      scoreWithdrawalConfig.id,
      5, // 假设 5 是提现业务类型
      remark||'积分提现申请',
      scoreWithdrawalConfig.score
    );
await this.scoreWithdrawalEntity.save({
  createUserId: userId,
  score: scoreWithdrawalConfig.score,
  amount: scoreWithdrawalConfig.amount,
  paymentAccount: user.phone,
  ipAddress: await this.utils.getReqIP(this.ctx) as string
})
  }

}
