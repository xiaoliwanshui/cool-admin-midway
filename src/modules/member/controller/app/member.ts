import {BaseController, CoolController} from '@cool-midway/core';
import {Body, Inject, Post} from '@midwayjs/core';
import {MemberEntity} from '../../entity/member';
import {MemberService} from '../../service/member';
import {CoolCommException} from '@cool-midway/core';

/**
 * 会员控制器
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: MemberEntity,
  insertParam: ctx => {
    return {
      createUserId: ctx.user.id,
    };
  },
  pageQueryOp: {
    where: async ctx => {
      return [['createUserId =:createUserId', {createUserId: ctx.user.id}]];
    },
  },
})
export class AppUserMemberController extends BaseController {
  @Inject()
  ctx;

  @Inject()
  memberService: MemberService;

  /**
   * 积分兑换会员（简化版）
   * @param score 所需积分
   * @param days 兑换天数
   */
  @Post('/exchangeByScore', {summary: '积分兑换会员'})
  async exchangeByScore(
    @Body('score') score: number,
    @Body('days') days: number
  ) {
    if (!score || !days || score <= 0 || days <= 0) {
      throw new CoolCommException('请输入有效的积分和天数');
    }
    
    return this.ok(
      await this.memberService.exchangeByScore(this.ctx.user.id, score, days)
    );
  }
}
