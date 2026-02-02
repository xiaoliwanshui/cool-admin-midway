/**
 * @Author: 17691002584 17691002584@163.com
 * @Date: 2026-02-02 15:55:14
 * @LastEditors: 17691002584 17691002584@163.com
 * @LastEditTime: 2026-02-02 16:30:49
 * @FilePath: src/modules/task/job/sync.jobCollect.ts
 * @Description: 视频采集定时任务，每隔2秒执行一次
 */

import {IJob, Job} from '@midwayjs/cron';
import {Inject, Logger} from '@midwayjs/core';
import {BaseService} from "@cool-midway/core";
import {ILogger} from "@midwayjs/logger";
import {CollectionService} from "../../video/service/collection";
import {InjectEntityModel} from "@midwayjs/typeorm";
import {TaskLogEntity} from "../entity/log";
import {Repository} from "typeorm";

@Job("syncJob", {
  cronTime: "*/2 * * * * *", // 每隔 2s 执行
  start: true,
})
export class JobCollectJob extends BaseService implements IJob {
  @Logger()
  logger: ILogger;
  
  @InjectEntityModel(TaskLogEntity)
  taskLogEntity: Repository<TaskLogEntity>;

  @Inject()
  collectionService: CollectionService;

  // 定义固定的任务ID，避免硬编码
  private readonly COLLECTION_TASK_ID = 18;

  // 标识是否正在执行采集任务，防止任务重叠
  private isExecuting = false;

  async onTick() {
    // 检查是否已有任务在执行，如果有则跳过本次执行
    if (this.isExecuting) {
      this.logger.info("视频采集任务正在执行中，跳过本次执行");
      return;
    }

    this.logger.info("视频采集任务开始执行");
    
    // 设置执行标志
    this.isExecuting = true;
    
    // 在后台异步执行采集任务，不阻塞定时任务的执行周期
    this.executeCollectionTask()
      .then(async () => {
        await this.recordTaskLog("视频采集任务执行成功", 1);
        this.logger.info("视频采集任务执行成功");
      })
      .catch(async (error) => {
        await this.recordTaskLog(`视频采集任务执行失败: ${error.message}`, 0);
        this.logger.error("视频采集任务执行失败:", error);
      })
      .finally(() => {
        // 重置执行标志
        this.isExecuting = false;
      });
  }

  /**
   * 执行采集任务（在后台运行）
   */
  private async executeCollectionTask(): Promise<void> {
    return new Promise((resolve, reject) => {
      // 使用 setImmediate 将任务放入事件循环的下一个阶段执行，避免阻塞
      setImmediate(async () => {
        try {
          await this.collectionService.startCollection();
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * 记录任务日志
   * @param detail 日志详情
   * @param status 任务状态 (0-失败 1-成功)
   */
  private async recordTaskLog(detail: string, status: number) {
    try {
      await this.taskLogEntity.insert({
        detail: detail,
        status: status,
        taskId: this.COLLECTION_TASK_ID,
      });
    } catch (logError) {
      // 如果记录日志也失败，至少要在控制台输出
      this.logger.error("记录任务日志失败:", logError);
    }
  }
}