/**
 * @Author: 17691002584 17691002584@163.com
 * @Date: 2026-02-02 16:40:57
 * @LastEditors: 17691002584 17691002584@163.com
 * @LastEditTime: 2026-03-05 23:58:34
 * @FilePath: src/modules/task/job/async.jobDay.ts
 * @Description: 这是默认设置,可以在设置》工具》File Description中进行配置
 */
/**
 * @Author: 17691002584 17691002584@163.com
 * @Date: 2026-02-02 15:55:14
 * @LastEditors: 17691002584 17691002584@163.com
 * @LastEditTime: 2026-03-05 23:58:34
 * @FilePath: src/modules/task/job/async.jobDay.ts
 * @Description: 日更新采集定时任务，每隔2秒执行一次，遍历所有采集源并分批处理
 */

import {IJob, Job} from '@midwayjs/cron';
import {FORMAT, Inject, Logger} from '@midwayjs/core';
import {BaseService} from "@cool-midway/core";
import {ILogger} from "@midwayjs/logger";
import {CollectionService} from "../../video/service/collection";
import {InjectEntityModel} from "@midwayjs/typeorm";
import {TaskLogEntity} from "../entity/log";
import {Repository} from "typeorm";
import {CollectionEntity} from "../../video/entity/collection";
import {RedisService} from "@midwayjs/redis";

const TAG = 'JobDayCollectJob';

@Job("syncJob", {
  cronTime: FORMAT.CRONTAB.EVERY_PER_10_MINUTE,
  start: true,
})
export class JobDayCollectJob extends BaseService implements IJob {
  @Logger()
  logger: ILogger;

  @InjectEntityModel(TaskLogEntity)
  taskLogEntity: Repository<TaskLogEntity>;

  @InjectEntityModel(CollectionEntity)
  collectionEntity: Repository<CollectionEntity>;

  @Inject()
  collectionService: CollectionService;


  @Inject()
  redisService: RedisService;

  // 定义固定的任务ID，避免硬编码
  private readonly COLLECTION_TASK_ID = 2;

  // 标识是否正在执行采集任务，防止任务重叠
  private isExecuting = false;

  // 分批处理配置
  private readonly BATCH_SIZE = 5; // 每批处理的采集源数量
  private readonly BATCH_DELAY = 1000; // 批次之间的延迟（毫秒）

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
    this.logger.info(TAG, "日更新采集任务开始执行");
    const isRunning = await this.redisService.get("videoJob:job_day_running",)
    this.isExecuting = !!isRunning;
    // 检查是否已有任务在执行，如果有则跳过本次执行
    if (this.isExecuting) {
      this.logger.info(TAG, "日更新采集任务正在执行中，跳过本次执行");
      return;
    }

    await this.safeCacheSet("videoJob:job_day_running", 1, 30 * 1000);

    // 设置执行标志
    this.isExecuting = true;

    // 在后台异步执行采集任务，不阻塞定时任务的执行周期
    this.executeCollectionTask()
      .then(async () => {
        await this.recordTaskLog("日更新采集任务执行成功", 1);
        this.logger.info(TAG, "日更新采集任务执行成功");
      })
      .catch(async (error) => {
        await this.recordTaskLog(`日更新采集任务执行失败: ${error.message}`, 0);
        this.logger.error("日更新采集任务执行失败:", error);
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
      const allCollections = await this.collectionEntity.find({
        select: ['id', 'name']
      });

      if (!allCollections || allCollections.length === 0) {
        this.logger.info(TAG, "没有找到任何采集源");
        return;
      }

      this.logger.info(TAG, `找到 ${allCollections.length} 个采集源，开始分批处理`);

      for (let i = 0; i < allCollections.length; i += this.BATCH_SIZE) {
        const batch = allCollections.slice(i, i + this.BATCH_SIZE);

        this.logger.info(TAG, `处理第 ${Math.floor(i / this.BATCH_SIZE) + 1} 批次，包含 ${batch.length} 个采集源`);

        const promises = batch.map(collection =>
          this.processSingleCollection(collection.id, collection.name)
        );

        await Promise.all(promises);

        if (i + this.BATCH_SIZE < allCollections.length) {
          this.logger.info(TAG, `批次处理完成，等待 ${this.BATCH_DELAY}ms 后继续下一批`);
          await this.delay(this.BATCH_DELAY);
        }
      }

      this.logger.info(TAG, `所有 ${allCollections.length} 个采集源处理完成`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 处理单个采集源
   */
  private async processSingleCollection(id: number, name: string): Promise<void> {
    try {
      this.logger.info(TAG, `开始处理采集源 [${id}] ${name}`);

      // 调用采集服务的day方法
      await this.collectionService.day(id);

      this.logger.info(TAG, `采集源 [${id}] ${name} 处理完成`);
    } catch (error) {
      this.logger.error(TAG, `处理采集源 [${id}] ${name} 时发生错误:`, error);
      // 不抛出错误，让其他采集源继续处理
    }
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
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
