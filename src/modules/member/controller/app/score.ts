import {Inject, Post, Provide} from '@midwayjs/core';
import {BaseController, CoolController,CoolUrlTag,
  TagTypes, CoolTag} from '@cool-midway/core';
import {ScoreService} from '../../service/score';
import {Context} from '@midwayjs/koa';
import {ScoreEntity} from "../../entity/score";

/**
 * APP积分控制器
 */
@Provide()
@CoolUrlTag({
  key: TagTypes.IGNORE_TOKEN,
  value: ['total', 'records'],
})
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: ScoreEntity,
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
export class ScoreAppController extends BaseController {
  @Inject()
  scoreService: ScoreService;

  @Inject()
  ctx: Context;

  /**
   * 获取当前用户积分总和
   */
  @Post('/total')
  async getTotal() {
    const total = await this.scoreService.getUserTotalScore(this.ctx.user.id);
    return this.ok(total);
  }

  /**
   * 获取当前用户积分记录
   */
  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/records')
  async getRecords() {
    // 从上下文中获取当前用户ID
    const createUserId = this.ctx.state.user?.id;
    if (!createUserId) {
      return this.fail('用户未登录');
    }
    // 修复TypeScript类型错误
    const body = this.ctx.request.body as Record<string, any>;
    let page = parseInt(body?.page);
    let size = parseInt(body?.size);

    // 确保page和size是有效数字且在合理范围内
    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(size) || size < 1) size = 20;
    if (size > 100) size = 100; // 限制每页最大记录数

    const records = await this.scoreService.getUserScoreRecords(createUserId, page, size);
    return this.ok(records);
  }

}
