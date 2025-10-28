import { CoolController, CoolUrlTag, TagTypes ,BaseController} from '@cool-midway/core';
import { MonthlyCheckinConfigEntity } from '../../entity/monthlyCheckinConfig';
import { Get, Inject, Post, Body, Context } from '@midwayjs/core';
import { MonthlyCheckinConfigService } from '../../service/monthlyCheckinConfig';

/**
 * 月签到配置应用控制器
 */
@CoolController({
  api: ['info', 'list'],
  entity: MonthlyCheckinConfigEntity,
})
@CoolUrlTag({
  key: TagTypes.IGNORE_TOKEN,
  value: ['list'],
})
export class AppUserMonthlyCheckinConfigController extends BaseController {
  @Inject()
  monthlyCheckinConfigService: MonthlyCheckinConfigService;

  /**
   * 获取指定月份的签到配置
   */
  @Get('/getByMonth')
  async getByMonth(@Body('month') month: number) {
    const configs = await this.monthlyCheckinConfigService.getConfigByMonth(month);
    return { code: 200, message: 'success', data: configs };
  }
}