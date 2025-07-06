import { Provide } from '@midwayjs/core';
import { BaseController, CoolController } from '@cool-midway/core';
import { EChartService } from '../../service/echart';

/**
 * 任务
 */
@Provide()
@CoolController({
  api: ['info'],
  service: EChartService,
})
export class AdminEChartController extends BaseController {}
