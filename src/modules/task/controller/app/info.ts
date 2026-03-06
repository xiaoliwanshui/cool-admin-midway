/**
 * @Author: 17691002584 17691002584@163.com
 * @Date: 2026-03-07 00:29:58
 * @LastEditors: 17691002584 17691002584@163.com
 * @LastEditTime: 2026-03-07 00:53:10
 * @FilePath: src/modules/task/controller/app/info.ts
 * @Description: 这是默认设置,可以在设置》工具》File Description中进行配置
 */
import {Body, Get, Inject, Post, Provide, Query} from '@midwayjs/core';
import {CoolController, BaseController, CoolTag, TagTypes} from '@cool-midway/core';
import {TaskInfoEntity} from '../../entity/info';
import {TaskInfoService} from '../../service/info';
import {TaskCollectService} from "../../service/collect";

/**
 * 任务
 */
@Provide()
@CoolController({})
export class AppTaskInfoController extends BaseController {
  @Inject()
  TaskCollectService: TaskCollectService;


  /**
   * 手动任务
   */
  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Get('/startCollection', {summary: '开始采集任务'})
  async startCollection(@Query() params: any) {
    return this.ok(await this.TaskCollectService.startCollection());
  }

  /**
   * 手动任务
   */
  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Get('/dayCollectionTask', {summary: '开始日采集任务'})
  async dayCollectionTask(@Query() params: any) {
    return this.ok(await this.TaskCollectService.dayCollectionTask());
  }

  /**
   * 手动任务
   */
  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Get('/filterTask', {summary: '开始入库检查任务'})
  async filterTask(@Query() params: any) {
    return this.ok(await this.TaskCollectService.filterTask());
  }

  /**
   * 手动任务
   */
  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Get('/playLineTask', {summary: '开始线路合并任务'})
  async playLineTask(@Query() params: any) {
    return this.ok(await this.TaskCollectService.playLineTask());
  }
}
