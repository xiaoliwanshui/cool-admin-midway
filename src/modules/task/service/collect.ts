import {Inject, Logger, Provide} from '@midwayjs/core';
import {BaseService} from '@cool-midway/core';
import {ILogger} from '@midwayjs/logger';
import {CollectionService} from "../../video/service/collection";
import {InjectEntityModel} from "@midwayjs/typeorm";
import {CollectionEntity} from "../../video/entity/collection";
import {Repository} from "typeorm";
import {PlayLineService} from "../../video/service/play_line";
import {TaskLogEntity} from "../entity/log";

/**
 * TaskCollectService
 */
const TAG: String = 'TaskCollectService';

@Provide()
export class TaskCollectService extends BaseService {
  @Logger()
  logger: ILogger;

  @Inject()
  playLineService: PlayLineService;

  @Inject()
  collectionService: CollectionService;


  @InjectEntityModel(CollectionEntity)
  collectionEntity: Repository<CollectionEntity>;


  @InjectEntityModel(TaskLogEntity)
  taskLogEntity: Repository<TaskLogEntity>;


  // 分批处理配置
  private readonly BATCH_SIZE = 5; // 每批处理的采集源数量
  private readonly BATCH_DELAY = 1000; // 批次之间的延迟（毫秒）

  async startCollection(): Promise<void> {
    try {
      await this.collectionService.startCollection();
      await this.taskLogEntity.insert({
        detail: "success",
        status: 1,
        taskId: 1,
      });
    } catch (error) {
      await this.taskLogEntity.insert({
        detail: error.message || "error",
        status: 0,
        taskId: 1,
      });
      throw error;
    }
  }

  /**
   * 处理单个采集源
   */
  private async processSingleCollection(id: number, name: string): Promise<void> {
    try {
      // 调用采集服务的day方法
      await this.collectionService.day(id);
    } catch (error) {
      this.logger.error(TAG, `处理采集源 [${id}] ${name} 时发生错误:`, error);
      // 不抛出错误，让其他采集源继续处理
    }
  }

  /**
   * 执行采集任务（在后台运行）
   */
  async dayCollectionTask(): Promise<void> {
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
      await this.taskLogEntity.insert({
        detail: "success",
        status: 1,
        taskId: 2,
      });
    } catch (error) {
      await this.taskLogEntity.insert({
        detail: error.message || "error",
        status: 0,
        taskId: 2,
      });
      throw error;
    }
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 执行过滤任务（在后台运行）
   */
  async filterTask(): Promise<void> {
    try {
      const SQLQuery =
        'UPDATE video v SET play_url_put_in = CASE WHEN EXISTS (SELECT 1 FROM video_line vl WHERE vl.video_id = v.id) THEN 1 ELSE 0 END;';
      await this.nativeQuery(SQLQuery);
      await this.taskLogEntity.insert({
        detail: "success",
        status: 1,
        taskId: 3,
      });
    } catch (error) {
      await this.taskLogEntity.insert({
        detail: error.message || "error",
        status: 0,
        taskId: 3,
      });
      throw error;
    }
  }


  /**
   * 执行播放线路任务（在后台运行）
   */
  async playLineTask(): Promise<void> {
    try {
      await this.playLineService.merge();
      await this.taskLogEntity.insert({
        detail: "success",
        status: 1,
        taskId: 4,
      });
    } catch (error) {
      await this.taskLogEntity.insert({
        detail: error.message || "error",
        status: 0,
        taskId: 4,
      });
      throw error;
    }
  }
}
