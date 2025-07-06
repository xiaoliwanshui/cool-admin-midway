import { Inject, Logger, Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { ILogger } from '@midwayjs/logger';
import { EChartService } from '../../echart/service/echart';

/**
 * 描述
 */
const TAG: String = 'TaskEChartService';

@Provide()
export class TaskEChartService extends BaseService {
  @Logger()
  logger: ILogger;

  @Inject()
  eChartService: EChartService;

  /**
   * 描述
   */
  async test() {
    await this.eChartService.getData();
    return '任务执行成功';
  }
}
