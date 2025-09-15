/**
 * 数据库重复键冲突处理工具类
 * 专门处理视频采集过程中的重复键冲突问题
 */

import { ILogger, Inject, Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { VideoEntity } from '../entity/videos';

const TAG = 'DuplicateKeyHandler';

@Provide()
export class DuplicateKeyHandler {
  @Inject()
  logger: ILogger;

  @InjectEntityModel(VideoEntity)
  videoEntity: Repository<VideoEntity>;

  /**
   * 判断是否为重复键错误
   */
  isDuplicateKeyError(error: any): boolean {
    return (
      error.code === 'ER_DUP_ENTRY' ||
      error.errno === 1062 ||
      error.sqlState === '23000' ||
      (error.message && error.message.includes('Duplicate entry')) ||
      (error.driverError && error.driverError.code === 'ER_DUP_ENTRY')
    );
  }
  
  /**
   * 判断是否为数据长度超限错误
   */
  isDataTooLongError(error: any): boolean {
    return (
      error.code === 'ER_DATA_TOO_LONG' ||
      error.errno === 1406 ||
      error.sqlState === '22001' ||
      (error.message && error.message.includes('Data too long for column')) ||
      (error.driverError && error.driverError.code === 'ER_DATA_TOO_LONG')
    );
  }
  
  /**
   * 提取数据超长的字段名
   */
  extractTooLongColumn(error: any): string | null {
    try {
      if (error.message && error.message.includes('Data too long for column')) {
        const match = error.message.match(/Data too long for column '([^']+)'/);
        return match ? match[1] : null;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  /**
   * 提取重复的键值
   */
  extractDuplicateKey(error: any): string | null {
    try {
      if (error.message && error.message.includes('Duplicate entry')) {
        const match = error.message.match(/Duplicate entry '([^']+)'/);
        return match ? match[1] : null;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  /**
   * 安全的视频插入/更新操作
   * 自动处理重复键冲突
   */
  async safeVideoInsert(
    videoData: Partial<VideoEntity>,
    queryRunner?: QueryRunner
  ): Promise<VideoEntity | null> {
    const useQueryRunner = queryRunner || this.videoEntity.manager.connection.createQueryRunner();
    const shouldManageTransaction = !queryRunner;

    try {
      if (shouldManageTransaction) {
        await useQueryRunner.connect();
        await useQueryRunner.startTransaction();
      }

      // 先尝试查找现有记录
      const existingVideo = await useQueryRunner.manager.findOne(VideoEntity, {
        where: { title: videoData.title },
        select: ['id', 'updateTime']
      });

      let result: VideoEntity;

      if (existingVideo) {
        // 更新现有记录
        const updateData = this.prepareUpdateData(videoData);
        await useQueryRunner.manager.update(
          VideoEntity, 
          { id: existingVideo.id }, 
          updateData
        );

        result = await useQueryRunner.manager.findOne(VideoEntity, {
          where: { id: existingVideo.id }
        });

        this.logger.debug(TAG, `更新现有视频: ${videoData.title} (ID: ${existingVideo.id})`);
      } else {
        // 插入新记录
        const insertData = this.prepareInsertData(videoData);
        result = await useQueryRunner.manager.save(VideoEntity, insertData);
        this.logger.debug(TAG, `插入新视频: ${videoData.title} (ID: ${result.id})`);
      }

      if (shouldManageTransaction) {
        await useQueryRunner.commitTransaction();
      }

      return result;
    } catch (error) {
      if (shouldManageTransaction) {
        await useQueryRunner.rollbackTransaction();
      }

      // 处理数据长度超限错误
      if (this.isDataTooLongError(error)) {
        const columnName = this.extractTooLongColumn(error);
        this.logger.warn(TAG, `数据超长错误，字段: ${columnName}, 视频: ${videoData.title}`);
        
        // 截断超长数据并重试
        const truncatedData = this.truncateFieldData(videoData, columnName);
        return await this.safeVideoInsert(truncatedData, queryRunner);
      }

      // 如果仍然是重复键错误，尝试查找并更新
      if (this.isDuplicateKeyError(error)) {
        this.logger.warn(TAG, `检测到重复键冲突，尝试更新记录: ${videoData.title}`);
        return await this.handleDuplicateConflict(videoData, useQueryRunner);
      }

      throw error;
    } finally {
      if (shouldManageTransaction) {
        await useQueryRunner.release();
      }
    }
  }

  /**
   * 处理重复键冲突
   */
  private async handleDuplicateConflict(
    videoData: Partial<VideoEntity>,
    queryRunner: QueryRunner
  ): Promise<VideoEntity | null> {
    try {
      // 等待一小段时间后重试，避免并发冲突
      await new Promise(resolve => setTimeout(resolve, 100));

      const existingVideo = await queryRunner.manager.findOne(VideoEntity, {
        where: { title: videoData.title },
        select: ['id']
      });

      if (existingVideo) {
        const updateData = this.prepareUpdateData(videoData);
        await queryRunner.manager.update(
          VideoEntity,
          { id: existingVideo.id },
          updateData
        );

        const updatedVideo = await queryRunner.manager.findOne(VideoEntity, {
          where: { id: existingVideo.id }
        });

        this.logger.info(TAG, `重复冲突处理成功，已更新视频: ${videoData.title}`);
        return updatedVideo;
      } else {
        this.logger.error(TAG, `无法找到重复的视频记录: ${videoData.title}`);
        return null;
      }
    } catch (error) {
      this.logger.error(TAG, `处理重复键冲突失败: ${videoData.title}`, error);
      return null;
    }
  }

  /**
   * 准备插入数据（移除不应该插入的字段）
   */
  private prepareInsertData(videoData: Partial<VideoEntity>): Partial<VideoEntity> {
    const { id, createTime, updateTime, ...insertData } = videoData;
    return insertData;
  }

  /**
   * 准备更新数据（移除不应该更新的字段）
   */
  private prepareUpdateData(videoData: Partial<VideoEntity>): Partial<VideoEntity> {
    const { id, createTime, createUserId, ...updateData } = videoData;
    return updateData;
  }
  
  /**
   * 截断超长字段数据
   */
  private truncateFieldData(videoData: Partial<VideoEntity>, columnName: string | null): Partial<VideoEntity> {
    const truncatedData = { ...videoData };
    
    if (!columnName) {
      return truncatedData;
    }
    
    // 根据字段名进行相应的截断处理
    switch (columnName) {
      case 'sub_title':
        if (truncatedData.sub_title && truncatedData.sub_title.length > 191) {
          truncatedData.sub_title = truncatedData.sub_title.substring(0, 188) + '...';
          this.logger.warn(TAG, `截断sub_title字段: ${videoData.title}`);
        }
        break;
      case 'title':
        if (truncatedData.title && truncatedData.title.length > 191) {
          truncatedData.title = truncatedData.title.substring(0, 188) + '...';
          this.logger.warn(TAG, `截断title字段: ${videoData.title}`);
        }
        break;
      case 'video_tag':
        if (truncatedData.video_tag && truncatedData.video_tag.length > 191) {
          truncatedData.video_tag = truncatedData.video_tag.substring(0, 188) + '...';
          this.logger.warn(TAG, `截断video_tag字段: ${videoData.title}`);
        }
        break;
      case 'video_class':
        if (truncatedData.video_class && truncatedData.video_class.length > 191) {
          truncatedData.video_class = truncatedData.video_class.substring(0, 188) + '...';
          this.logger.warn(TAG, `截断video_class字段: ${videoData.title}`);
        }
        break;
      case 'collection_name':
        if (truncatedData.collection_name && truncatedData.collection_name.length > 256) {
          truncatedData.collection_name = truncatedData.collection_name.substring(0, 253) + '...';
          this.logger.warn(TAG, `截断collection_name字段: ${videoData.title}`);
        }
        break;
      case 'unit':
        if (truncatedData.unit && truncatedData.unit.length > 32) {
          truncatedData.unit = truncatedData.unit.substring(0, 29) + '...';
          this.logger.warn(TAG, `截断unit字段: ${videoData.title}`);
        }
        break;
      default:
        this.logger.warn(TAG, `未处理的超长字段: ${columnName}, 视频: ${videoData.title}`);
        break;
    }
    
    return truncatedData;
  }

  /**
   * 批量安全插入
   */
  async batchSafeInsert(
    videoList: Partial<VideoEntity>[],
    batchSize: number = 5
  ): Promise<{success: number, failed: number, results: VideoEntity[]}> {
    const results: VideoEntity[] = [];
    let successCount = 0;
    let failedCount = 0;

    this.logger.info(TAG, `开始批量安全插入，共${videoList.length}条记录`);

    for (let i = 0; i < videoList.length; i += batchSize) {
      const batch = videoList.slice(i, i + batchSize);
      
      // 串行处理每个批次，避免并发冲突
      for (const videoData of batch) {
        try {
          const result = await this.safeVideoInsert(videoData);
          if (result) {
            results.push(result);
            successCount++;
          } else {
            failedCount++;
          }
        } catch (error) {
          failedCount++;
          this.logger.error(TAG, `批量插入失败: ${videoData.title}`, error);
        }
      }

      // 批次间添加小延时
      if (i + batchSize < videoList.length) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    this.logger.info(TAG, `批量插入完成，成功: ${successCount}, 失败: ${failedCount}`);

    return {
      success: successCount,
      failed: failedCount,
      results
    };
  }
}