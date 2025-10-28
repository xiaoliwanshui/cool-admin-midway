import { MonthlyCheckinConfigEntity } from '../../entity/monthlyCheckinConfig';
import { Get, Inject, Post, Body, Context } from '@midwayjs/core';
import { MonthlyCheckinConfigService } from '../../service/monthlyCheckinConfig';
import { BaseController, CoolController } from '@cool-midway/core';

/**
 * 月签到配置管理控制器
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: MonthlyCheckinConfigEntity,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.admin.userId,
    };
  },
})
export class AdminUserMonthlyCheckinConfigController extends BaseController {
  @Inject()
  monthlyCheckinConfigService: MonthlyCheckinConfigService;

  /**
   * 获取指定月份的签到配置
   */
  @Get('/getByMonth')
  async getByMonth(@Body('month') month: number) {
    const configs = await this.monthlyCheckinConfigService.getConfigByMonth(
      month
    );
    return { code: 200, message: 'success', data: configs };
  }

  /**
   * 批量更新月签到配置
   */
  @Post('/batchUpdate')
  async batchUpdate(@Body('configs') configs: any[]) {
    for (const config of configs) {
      await this.monthlyCheckinConfigService.updateConfig(
        config.month,
        config.day,
        config.score,
        config.enabled,
        config.remark
      );
    }
    return { code: 200, message: '更新成功' };
  }

  /**
   * 初始化默认配置
   */
  @Post('/initDefault')
  async initDefault() {
    try {
      return this.ok(
        await this.monthlyCheckinConfigService.initDefaultConfig()
      );
    } catch (error) {
      return this.fail(error);
    }
  }
}
