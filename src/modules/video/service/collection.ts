import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { ILogger, Inject, Provide } from '@midwayjs/core';
import { RedisService } from '@midwayjs/redis';
import { CollectionEntity } from '../entity/collection';
import { CollectionCategoryEntity } from '../entity/collection_category';
import { VIDEOPARAMS, VideoParams } from '../bean/VideoParams';
import { ConcurrencyService } from '../service/concurrencyService';
import { CategoryService } from '../service/categoryService';
import { CollectionTaskTaskEntity } from '../entity/collection_task';
import { VideoEntity } from '../entity/videos';
import { VideoLineService } from './videoLine';
import { NetworkErrorHandler } from './networkErrorHandler';
import { PlayLineService } from './play_line';
import { VideoRulesEntity } from '../entity/video_rules';
import { VideosService } from './videos';
import { BaseService } from '../../base/service/base';

const TAG = 'CollectionService';

@Provide()
export class CollectionService extends BaseService {
  @InjectEntityModel(CollectionEntity)
  collectionEntity: Repository<CollectionEntity>;
  @InjectEntityModel(CollectionCategoryEntity)
  collectionCategoryEntity: Repository<CollectionCategoryEntity>;
  @Inject()
  logger: ILogger;
  @Inject()
  concurrencyService: ConcurrencyService;
  @Inject()
  categoryService: CategoryService;
  @Inject()
  videosService: VideosService;
  @InjectEntityModel(VideoEntity)
  videoEntity: Repository<VideoEntity>;
  @Inject()
  VideoLineService: VideoLineService;

  @InjectEntityModel(CollectionTaskTaskEntity)
  collectionTaskTaskEntity: Repository<CollectionTaskTaskEntity>;

  @Inject()
  redisService: RedisService;

  @Inject()
  networkErrorHandler: NetworkErrorHandler;

  @Inject()
  playLineService: PlayLineService;

  @InjectEntityModel(VideoRulesEntity)
  videoRulesEntity: Repository<VideoRulesEntity>;

  /**
   * 处理按天同步视频的业务逻辑
   *
   * @param id - 集合实体的唯一标识符
   *
   * 此方法会根据提供的集合ID查找对应的集合实体，
   * 然后调用syncVideo方法，并传入操作类型'day'和小时数24。
   */
  async day(id: number) {
    const collectionEntity = await this.collectionEntity.findOneBy({ id });
    await this.syncVideo(collectionEntity, {
      op: 'day',
      h: 24,
    });
  }

  async week(id: number) {
    const collectionEntity = await this.collectionEntity.findOneBy({ id });
    await this.syncVideo(collectionEntity, {
      op: 'week',
      h: 24 * 7,
    });
  }

  async checkVideoLine() {
    const find = this.videoEntity.createQueryBuilder();
    find.where('play_url_put_in = :play_url_put_in', { play_url_put_in: 0 });
    const data = await this.entityRenderPage(find, { page: 1, size: 10 });

    // 分批处理播放线路检查，避免内存溢出
    const batchSize = 20; // 减小批次大小以降低内存占用
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      // 分批获取播放线路
      const playLines = await this.playLineService.playLineEntity.find({
        skip: offset,
        take: batchSize,
      });

      // 如果没有更多数据，结束循环
      if (playLines.length === 0) {
        hasMore = false;
        break;
      }

      // 检查每个播放线路的链接是否可访问
      for (const playLine of playLines) {
        try {
          const isAccessible = await this.playLineService.isUrlAccessible(
            playLine.file
          );
          
          // 根据访问结果更新状态
          if (!isAccessible) {
            // 如果链接不可访问，更新状态为禁用
            await this.playLineService.playLineEntity.update(
              { id: playLine.id },
              { status: 0 }
            );
            this.logger.warn(
              TAG,
              `播放线路 ${playLine.name} 的链接 ${playLine.file} 无法访问，已禁用`
            );
          } else {
            // 如果链接可访问，确保状态为启用
            await this.playLineService.playLineEntity.update(
              { id: playLine.id },
              { status: 1 }
            );
            this.logger.info(
              TAG,
              `播放线路 ${playLine.name} 的链接 ${playLine.file} 访问正常`
            );
          }
        } catch (error) {
          this.logger.error(
            TAG,
            `检查播放线路 ${playLine.name} 时发生错误:`,
            error
          );
          
          // 发生错误时也禁用线路
          await this.playLineService.playLineEntity.update(
            { id: playLine.id },
            { status: 0 }
          );
        }

        // 每处理一条记录后稍微延迟，避免请求过于频繁
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // 更新偏移量
      offset += batchSize;

      // 如果返回的数据少于批次大小，说明已经处理完所有数据
      if (playLines.length < batchSize) {
        hasMore = false;
      }

      // 每处理完一批后，主动触发垃圾回收（如果内存使用过高）
      if (global.gc) {
        const used = process.memoryUsage().heapUsed / 1024 / 1024;
        if (used > 300) { // 降低内存阈值
          // 如果内存使用超过300MB
          this.logger.info(
            TAG,
            `当前内存使用 ${used.toFixed(2)} MB，触发垃圾回收`
          );
          global.gc();
          
          // 短暂延迟让GC完成
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      // 每批处理完成后添加延迟，减轻系统压力
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // 原有的处理逻辑 - 也进行内存优化
    for (const videoEntity of data.list) {
      let collectionEntity = await this.collectionEntity.findOneBy({
        id: videoEntity.collection_id,
      });
      
      // 只有当collectionEntity存在时才执行插入操作
      if (collectionEntity) {
        await this.VideoLineService.insert(videoEntity, collectionEntity);
      }
      
      // 每处理一个视频后稍微延迟
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  //采集资源
  async syncVideo(
    collectionEntity: CollectionEntity,
    params: VIDEOPARAMS
  ): Promise<void> {
    //给list 类型的redis 添加数据
    try {
      let defaultParams = new VideoParams(params ? params : {});
      const requestUrl =
        collectionEntity.address + '?' + defaultParams.getQueryString();

      // 使用网络错误处理器进行请求
      this.logger.info(TAG, `开始采集: ${requestUrl}`);
      let result = await this.networkErrorHandler.requestWithRetry(
        {
          url: requestUrl,
          method: 'GET',
          ...this.networkErrorHandler.getCollectionAxiosConfig(),
        },
        3, // 最大重试3次
        2000 // 初始延迟2秒
      );

      const pagecount: number = result.data.pagecount;
      const limit: number = result.data.limit;
      const total: number = result.data.total;
      result = null; // 显式释放引用
      
      let page = 0;
      let op = 'all';
      let h = 0;
      if (params) {
        if (params.page) {
          page = params.page;
        }
        if (params.op) {
          op = params.op;
          h = params.h;
        }
      }
      
      // 分批处理，避免一次性将所有数据推送到Redis
      const batchPushSize = 100; // 每批推送100个任务到Redis
      let batchCount = 0;
      
      for (page; page <= pagecount; page++) {
        let videoParams: VideoParams = new VideoParams({});
        videoParams.setPg(page);
        videoParams.setPage(page);
        videoParams.setPs(limit);
        videoParams.setPagesize(limit);
        videoParams.setPagecount(pagecount);
        videoParams.setAc('detail');
        videoParams.setOp(op);
        if (h) {
          videoParams.setH(h);
        }
        videoParams.setTotal(total);
        
        // 推送到Redis
        this.redisService.lpush(
          'video:collection',
          JSON.stringify({
            videoParams,
            collectionEntity,
          })
        );
        
        videoParams = null; // 显式释放引用
        batchCount++;
        
        // 每批推送完成后添加延迟并检查是否需要刷新
        if (batchCount >= batchPushSize) {
          // 设置过期时间（只在第一批设置即可）
          if (page < batchPushSize) {
            this.redisService.expire('video:collection', 60 * 60 * 2);
          }
          
          // 批量推送后添加延迟，减轻系统压力
          await new Promise(resolve => setTimeout(resolve, 100));
          batchCount = 0;
          
          // 检查内存使用情况并触发垃圾回收
          if (global.gc) {
            const used = process.memoryUsage().heapUsed / 1024 / 1024;
            if (used > 300) { // 降低内存阈值
              this.logger.info(
                TAG,
                `当前内存使用 ${used.toFixed(2)} MB，触发垃圾回收`
              );
              global.gc();
              
              // 短暂延迟让GC完成
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          }
        }
      }
      
      // 确保设置过期时间
      this.redisService.expire('video:collection', 60 * 60 * 2);
      await this.startCollection();
    } catch (error) {
      if (this.networkErrorHandler.isNetworkError(error)) {
        const errorDetails =
          this.networkErrorHandler.getNetworkErrorDetails(error);
        this.logger.error(TAG, `采集失败 - ${errorDetails}`);

        // 记录采集源状态
        if (this.networkErrorHandler.isDnsError(error)) {
          this.logger.warn(
            TAG,
            `采集源 "${collectionEntity.name}" DNS解析失败，可能需要检查域名状态`
          );
        }
      } else {
        this.logger.error(TAG, `采集异常:`, error);
      }

      // 网络错误不应该返回null，而是抛出异常让上层处理
      throw error;
    }
  }

  async startCollection() {
    try {
      const data = await this.redisService.exists('video:collection');
      if (data) {
        this.logger.info(TAG, 'Redis中存在采集数据，开始处理');
        await this.concurrencyService.syncVideoPageList();
        
        // 处理完成后检查内存使用情况
        if (global.gc) {
          const used = process.memoryUsage().heapUsed / 1024 / 1024;
          if (used > 300) { // 降低内存阈值
            this.logger.info(
              TAG,
              `当前内存使用 ${used.toFixed(2)} MB，触发垃圾回收`
            );
            global.gc();
          }
        }
      } else {
        // 使用debug级别日志，减少在没有数据时的日志输出
        this.logger.debug(TAG, 'Redis中没有采集数据');
      }
    } catch (error) {
      this.logger.error(TAG, 'Redis查询失败', error);
      
      // 发生错误时也尝试触发垃圾回收
      if (global.gc) {
        global.gc();
      }
    }
  }

  /**
   * 修改之前
   * @param data
   * @param type
   */
  async modifyAfter(data: any, type: "delete" | "update" | "add") {
    this.logger.debug(TAG, '插入数据成功');
    if (type == "add") {
      try {
        const fields = await this.videosService.getVideoEntityFields();
        await this.videoRulesEntity.insert({
          collection_id: data.id,
          sort: 0,
          updateRules: fields.map(item => item.value ?? "")
        });
        
        // 检查内存使用情况并在需要时触发垃圾回收
        if (global.gc) {
          const used = process.memoryUsage().heapUsed / 1024 / 1024;
          if (used > 300) { // 降低内存阈值
            this.logger.info(
              TAG,
              `当前内存使用 ${used.toFixed(2)} MB，触发垃圾回收`
            );
            global.gc();
          }
        }
      } catch (error) {
        this.logger.error(TAG, 'modifyAfter方法执行失败:', error);
        
        // 发生错误时也尝试触发垃圾回收
        if (global.gc) {
          global.gc();
        }
      }
    }
  }
}
