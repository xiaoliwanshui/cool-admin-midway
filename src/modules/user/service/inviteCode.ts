/**
 * @Author: 17691002584 17691002584@163.com
 * @Date: 2026-03-12 22:08:49
 * @LastEditors: 17691002584 17691002584@163.com
 * @LastEditTime: 2026-03-13 13:37:20
 * @FilePath: src/modules/user/service/inviteCode.ts
 * @Description: 这是默认设置,可以在设置》工具》File Description中进行配置
 */

import {ILogger, Inject, Provide} from "@midwayjs/core";
import {BaseService} from "@cool-midway/core";
import {InjectEntityModel} from "@midwayjs/typeorm";
import {Repository} from "typeorm";
import {InviteCodeEntity} from "../entity/inviteCode";
import {InviteRecordEntity} from "../entity/inviteRecord";
import {ScoreService} from "../../member/service/score";

@Provide()
export class InviteCodeService extends BaseService {
  @InjectEntityModel(InviteCodeEntity)
  inviteCodeEntity: Repository<InviteCodeEntity>;

  @InjectEntityModel(InviteRecordEntity)
  inviteRecordEntity: Repository<InviteRecordEntity>;


  @Inject()
  logger: ILogger;

  @Inject()
  scoreService: ScoreService

  //创建InviteCodeEntity
  async createInviteCodeEntity(params) {
    return await this.inviteCodeEntity.save({
      code: Math.random().toString(36).substring(2, 7),
      createUserId: params.userId,
    });
  }

  // 创建InviteRecordEntity
  async createInviteRecordEntity(params) {
    const inviteRecordEntity = await this.inviteRecordEntity.findOneBy({
      ipAddress: params.ipAddress,
    });
    if (inviteRecordEntity) {
      return inviteRecordEntity;
    }
    await this.inviteRecordEntity.save({
      code: params.inviteCode,
      loginType: params.loginType,
      createUserId: params.userId,
      ipAddress: params.ipAddress,
    });
    return this.scoreService.addScore(params.userId, 4, 4,)
  }

  //创建新用户使用邀请码
  async create(params) {

    if (params.inviteCode) {
      await this.createInviteCodeEntity(params);
      await this.createInviteRecordEntity(params);
    }
    await this.createInviteCodeEntity(params);
  }


}
