import { Body, Inject, Post, Provide } from '@midwayjs/core';
import {BaseController, CoolController, CoolTag, CoolUrlTag, TagTypes} from '@cool-midway/core';
import { ScoreWithdrawalEntity } from '../../entity/scoreWithdrawal';
import { ScoreWithdrawalService } from '../../service/scoreWithdrawal';
import { Context } from '@midwayjs/koa';

/**
 * APP积分提现控制器
 */
@Provide()
@CoolUrlTag({
  key: TagTypes.IGNORE_TOKEN,
  value: [],
})
@CoolController({
  api: ['info', 'list', 'page'],
  entity: ScoreWithdrawalEntity,
  insertParam: ctx => {
    return {
      createUserId: ctx.user.id,
    };
  },
  pageQueryOp: {
    where: async ctx => {
      return [['createUserId =:createUserId', { createUserId: ctx.user.id }]];
    },
  },
})
export class AppScoreWithdrawalController extends BaseController {
  @Inject()
  ctx: Context;

  @Inject()
  scoreWithdrawalService: ScoreWithdrawalService;

  /**
   * 创建提现申请
   */
  @Post('/createWithdrawal', { summary: '创建提现申请' })
  async createWithdrawal(
    @Body('type') type: number,
    @Body('remark') remark?: string
  ) {
      const userId = this.ctx.user.id;
    return this.ok(await this.scoreWithdrawalService.createWithdrawal(
        userId,
        type,
        remark
    ));
  }
  /**
   * 创建提现申请
   */
  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/scoreWithdrawalConfig', { summary: '提取现金配置' })
  async scoreWithdrawalConfig(
  ) {
    try {
      return this.ok(this.scoreWithdrawalService.scoreWithdrawalConfig());
    } catch (e) {
      return this.fail(e);
    }
  }

}
