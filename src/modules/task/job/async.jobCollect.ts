/**
 * @Author: 17691002584 17691002584@163.com
 * @Date: 2026-02-02 15:55:14
 * @LastEditors: 17691002584 17691002584@163.com
 * @LastEditTime: 2026-03-05 23:55:12
 * @FilePath: src/modules/task/job/async.jobCollect.ts
 * @Description: 视频采集定时任务，每隔2秒执行一次
 */

import {IJob, Job} from '@midwayjs/cron';
import {Inject, InjectClient, Logger} from '@midwayjs/core';
import {BaseService} from "@cool-midway/core";
import {ILogger} from "@midwayjs/logger";
import {CollectionService} from "../../video/service/collection";
import {InjectEntityModel} from "@midwayjs/typeorm";
import {TaskLogEntity} from "../entity/log";
import {Repository} from "typeorm";
import {RedisService} from '@midwayjs/redis';
const TAG = 'JobCollectStartJob';

@Job("syncJob", {
  cronTime: "*/30 * * * * *", // 每隔 30s 执行（优化：从2秒改为30秒，减少数据库压力）
  start: true,
})
export class JobCollectStartJob extends BaseService implements IJob {
  @Logger()
  logger: ILogger;

  @Inject()
  redisService: RedisService;

  @InjectEntityModel(TaskLogEntity)
  taskLogEntity: Repository<TaskLogEntity>;

  @Inject()
  collectionService: CollectionService;

  // 定义固定的任务ID，避免硬编码
  private readonly COLLECTION_TASK_ID = 1;

  // 标识是否正在执行采集任务，防止任务重叠
  private isExecuting = false;

  private async safeCacheSet(key: string, value: any, ttl?: number) {
    try {
      // 使用 redisService 直接设置，并正确使用传入的 TTL 参数（单位：秒）
      const expireSeconds = ttl ? Math.floor(ttl / 1000) : 30;
      await this.redisService.set(
        key,
        value,
        'EX',
        expireSeconds
      );
      return true;
    } catch (error) {
      // 如果 Redis 是只读副本，记录错误但不抛出
      if (error.message && (error.message.includes('READONLY') || error.message.includes('read only'))) {
        this.logger.warn(`Redis is in read-only mode, skipping cache set for key: ${key}`, error.message);
        return false;
      } else {
        this.logger.error(`Failed to set cache for key: ${key}`, error);
        throw error;
      }
    }
  }

  async onTick() {
    // 检查是否已有任务在执行，如果有则跳过本次执行
    const isRunning = await this.redisService.get("videoJob:job_collect_running",)
    this.isExecuting = !!isRunning;
    if (this.isExecuting) {
      this.logger.info(TAG, "视频采集任务正在执行中，跳过本次执行");
      return;
    }
    await this.safeCacheSet("videoJob:job_collect_running", 30);

    this.logger.info(TAG, "视频采集任务开始执行");

    // 设置执行标志
    this.isExecuting = true;

    // 在后台异步执行采集任务，不阻塞定时任务的执行周期
    this.executeCollectionTask()
      .then(async () => {
        await this.recordTaskLog("视频采集任务执行成功", 1);
        this.logger.info(TAG, "视频采集任务执行成功");
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
    try {
      await this.collectionService.startCollection();
    } catch (error) {
      throw error;
    }
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
      this.logger.error(TAG, "记录任务日志失败:", logError);
    }
  }
}
