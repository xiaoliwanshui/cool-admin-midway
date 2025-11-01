import { Body, Get, Inject, Post, Query } from '@midwayjs/core';
import { BaseController, CoolController } from '@cool-midway/core';
import { ScoreEntity } from '../../entity/score';
import { BusinessType, ScoreService } from '../../service/score';

/**
 * 积分管理控制器
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: ScoreEntity,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.admin.userId,
    };
  },
})
export class ScoreController extends BaseController {
  @Inject()
  scoreService: ScoreService;

  /**
   * 获取用户积分总和
   */
  @Get('/total')
  async getTotal(@Query('createUserId') createUserId: number) {
    const total = await this.scoreService.getUserTotalScore(createUserId);
    return this.ok(total);
  }

  /**
   * 获取用户积分记录
   */
  @Get('/records')
  async getRecords(@Query('createUserId') createUserId: number) {
    const records = await this.scoreService.getUserScoreRecords(createUserId);
    return this.ok(records);
  }

  /**
   * 增加积分
   */
  @Post('/addScore')
  async addScore(
    @Body('createUserId') createUserId: number,
    @Body('reason') reason: string,
    @Body('businessId') businessId?: number,
    @Body('businessType') businessType?: BusinessType
  ) {
    try {
      return this.ok(
        await this.scoreService.addScore(
          createUserId,
          businessId,
          businessType,
          reason,
        )
      );
    } catch (e) {
      return this.fail(e);
    }
  }
}
