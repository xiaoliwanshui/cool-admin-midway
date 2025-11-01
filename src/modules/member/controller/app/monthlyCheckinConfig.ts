import {CoolController, CoolUrlTag, TagTypes, BaseController, CoolTag} from '@cool-midway/core';
import { MonthlyCheckinConfigEntity } from '../../entity/monthlyCheckinConfig';
import { Inject, Post, Body } from '@midwayjs/core';
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
  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/getByMonth', { summary: '获取指定月份的签到配置' })
  async getByMonth(@Body('month') month: number) {
    const configs = await this.monthlyCheckinConfigService.getConfigByMonth(month);
    try {
      return this.ok(
        {list:configs}
      );
    } catch (error) {
      return this.fail(error);
    }
  }
}
