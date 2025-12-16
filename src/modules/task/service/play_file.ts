/**
 * @Author: 17691002584 17691002584@163.com
 * @Date: 2025-12-16 20:55:40
 * @LastEditors: 17691002584 17691002584@163.com
 * @LastEditTime: 2025-12-16 21:02:12
 * @FilePath: src/modules/task/service/play_file.ts
 * @Description: 这是默认设置,可以在设置》工具》File Description中进行配置
 */
import {Inject, Logger, Provide} from '@midwayjs/core';
import {BaseService} from '@cool-midway/core';
import {ILogger} from '@midwayjs/logger';
import {PlayLineService} from "../../video/service/play_line";

/**
 * 描述
 */
@Provide()
export class TaskPlayLineService extends BaseService {

  @Inject()
  playLineService: PlayLineService;

  @Logger()
  logger: ILogger;

  /**
   * 描述
   */
  async merge() {
    await this.playLineService.merge()
    return '任务执行成功';
  }
}
