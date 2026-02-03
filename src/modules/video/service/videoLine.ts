import {BaseService} from '@cool-midway/core';
import {InjectEntityModel} from '@midwayjs/typeorm';
import {In, Repository} from 'typeorm';
import {VideoEntity} from '../entity/videos';
import {VideoLineEntity} from '../entity/video_line';
import {ILogger, Inject, InjectClient, Provide} from '@midwayjs/core';
import {CollectionEntity} from '../entity/collection';
import {Line} from '../bean/SourceVideo';
import {PlayLineService} from './play_line';
import {CachingFactory, MidwayCache} from '@midwayjs/cache-manager';

const TAG = 'VideoLineService';

@Provide()
export class VideoLineService extends BaseService {
  @InjectEntityModel(VideoLineEntity)
  videoLineEntity: Repository<VideoLineEntity>;
  @Inject()
  playLineService: PlayLineService;

  @Inject()
  logger: ILogger;

  @InjectClient(CachingFactory, 'default')
  midwayCache: MidwayCache;

  private readonly CACHE_TTL = 300; // 缓存时间5分钟

  /**
   * 排序查询（添加缓存）
   */
  async line(query: any): Promise<any> {
    const cacheKey = `videoLine:line:${query.id}`;

    // 尝试从缓存获取数据
    const cachedData = await this.midwayCache.get(cacheKey);
    if (cachedData) {
      this.logger.debug(TAG, `从缓存获取视频线路: ${cacheKey}`);
      return cachedData;
    }

    //通过query.id查询videoLineEntity的数据
    const videoLineEntity = await this.videoLineEntity.findOne({
      where: {
        id: query.id,
      },
    });

    // 缓存结果
    if (videoLineEntity) {
      await this.midwayCache.set(cacheKey, videoLineEntity, this.CACHE_TTL);
      this.logger.debug(TAG, `视频线路已缓存: ${cacheKey}`);
    }

    return videoLineEntity;
  }

  parseVideoList(
    videoEntity: VideoEntity,
    collectionEntity: CollectionEntity,
    videoLineEntityId: number
  ): Array<Line> {
    try {
      // 使用 '#' 分割字符串，得到每一集的字符串
      const episodes = videoEntity.play_url.split('#');

      // 初始化结果数组
      const result: Array<Line> = [];

      // 遍历每一集的字符串
      episodes.forEach((episode, index) => {
        // 使用 '$' 分割字符串，分离出集数和 URL
        const [title, url] = episode.split('$');
        // 去除可能存在的多余空格
        const trimmedTitle = title?.trim();
        const trimmedUrl = url?.trim();

        // 如果集数和 URL 都存在，则添加到结果数组中
        if (trimmedTitle && trimmedUrl) {
          result.push({
            name: trimmedTitle,
            file: trimmedUrl,
            sub_title: trimmedTitle,
            video_id: videoEntity.id,
            video_name: videoEntity.title,
            tag: collectionEntity.param,
            sort: index,
            video_line_id: videoLineEntityId,
            collection_id: collectionEntity.id,
            collection_name: collectionEntity.name,
          });
        }
      });
      return result;
    } catch (error) {
      //  this.logger.error(TAG, error);
      return [];
    }
  }

  /**
   * 批量插入视频线路
   * @param videoEntities 视频实体数组
   * @param collectionEntity 集合实体
   * @returns 插入结果统计
   */
  async batchInsert(
    videoEntities: VideoEntity[],
    collectionEntity: CollectionEntity
  ): Promise<{ successCount: number; skipCount: number }> {
    if (!videoEntities || videoEntities.length === 0) {
      return { successCount: 0, skipCount: 0 };
    }

    let successCount = 0;
    let skipCount = 0;

    try {
      const collectionId = collectionEntity.id;
      const cacheKeyPrefix = `videoLine:exists:${collectionId}:`;

      // 过滤已缓存的视频线路
      const validVideos: VideoEntity[] = [];
      for (const videoEntity of videoEntities) {
        const cacheKey = `${cacheKeyPrefix}${videoEntity.id}`;
        const existsInCache = await this.midwayCache.get(cacheKey);

        if (existsInCache) {
          this.logger.debug(TAG, `视频线路已存在，跳过: ${videoEntity.title}`);
          skipCount++;
          continue;
        }
        validVideos.push(videoEntity);
      }

      if (validVideos.length === 0) {
        this.logger.debug(TAG, '没有有效的视频线路需要插入');
        return { successCount: 0, skipCount: videoEntities.length };
      }

      // 批量准备 video_line 数据
      const videoLineData = validVideos.map(videoEntity => ({
        collection_name: collectionEntity.name,
        tag: collectionEntity.param,
        video_id: videoEntity.id,
        video_name: videoEntity.title,
        collection_id: collectionId,
        sort: collectionEntity.sort,
      }));

      // 批量 upsert video_line 记录
      const upsertResult = await this.videoLineEntity.upsert(
        videoLineData,
        ['collection_id', 'video_id']
      );

      if (upsertResult.identifiers && upsertResult.identifiers.length > 0) {
        successCount = upsertResult.identifiers.length;

        // 批量准备 play_line 数据
        const allPlayLines: Array<any> = [];
        const videoLineIdMap = new Map<number, number>();

        for (let i = 0; i < validVideos.length && i < upsertResult.identifiers.length; i++) {
          const videoEntity = validVideos[i];
          const videoLineEntityId = upsertResult.identifiers[i]?.id;

          if (videoLineEntityId) {
            videoLineIdMap.set(videoEntity.id, videoLineEntityId);
            const playLines = this.parseVideoList(
              videoEntity,
              collectionEntity,
              videoLineEntityId
            );
            allPlayLines.push(...playLines);
          }
        }

        // 批量插入 play_line 记录
        if (allPlayLines.length > 0) {
          await this.playLineService.batchInsert(allPlayLines);
        }

        // 批量缓存存在标记
        const cachePromises = validVideos.map(videoEntity => 
          this.midwayCache.set(`${cacheKeyPrefix}${videoEntity.id}`, true, this.CACHE_TTL)
        );
        await Promise.all(cachePromises);

        this.logger.info(TAG, `批量插入视频线路完成，成功${successCount}条，跳过${skipCount}条`);
      }
    } catch (error) {
      this.logger.error(TAG, '批量插入视频线路异常', error);
      throw error;
    }

    return { successCount, skipCount };
  }

  async insert(
    videoEntity: VideoEntity,
    collectionEntity: CollectionEntity
  ): Promise<void> {
    try {
      const videoId = videoEntity.id;
      const collectionId = collectionEntity.id;

      // 检查缓存中是否已存在该视频线路
      const cacheKey = `videoLine:exists:${videoId}:${collectionId}`;
      const existsInCache = await this.midwayCache.get(cacheKey);

      if (existsInCache) {
        this.logger.debug(TAG, `视频线路已存在，跳过: ${videoEntity.title}`);
        return;
      }

      // 插入或更新数据（优化：使用 upsert 避免重复查询）
      const upsertResult = await this.videoLineEntity.upsert({
        collection_name: collectionEntity.name,
        tag: collectionEntity.param,
        video_id: videoId,
        video_name: videoEntity.title,
        collection_id: collectionId,
        sort: collectionEntity.sort,
      }, ['collection_id', 'video_id']);

      // 从 upsert 结果中获取 videoLineEntity id
      const videoLineEntityId = upsertResult.identifiers[0]?.id || upsertResult.raw?.insertId;

      if (!videoLineEntityId) {
        // 如果 upsert 没有返回 ID，则查询获取
        const videoLineEntity = await this.videoLineEntity.findOne({
          where: {
            video_id: videoId,
            collection_id: collectionId,
          },
        });

        if (!videoLineEntity || !videoLineEntity.id) {
          this.logger.error(TAG, `无法获取 videoLineEntity id: ${videoEntity.title}`);
          return;
        }
      }

      let parseVideoList = this.parseVideoList(
        videoEntity,
        collectionEntity,
        videoLineEntityId
      );

      // 使用 Promise.all 等待所有插入操作完成，确保 video_line_id 正确设置
      await Promise.all(
        parseVideoList.map(item => this.playLineService.insert(item))
      );

      this.logger.info(TAG, `insert ${videoEntity.title} videoLineEntityId ${videoLineEntityId} success`);

      // 缓存存在标记
      await this.midwayCache.set(cacheKey, true, this.CACHE_TTL);

      // 显式释放对象引用
      videoEntity = null;
      parseVideoList = null;
    } catch (error) {
      this.logger.error(TAG, `插入视频线路失败: ${videoEntity?.title}`, error);

      // 更新数据（优化：简化错误处理逻辑）
      const videoId = videoEntity.id;
      const collectionId = collectionEntity.id;
      const cacheKey = `videoLine:exists:${videoId}:${collectionId}`;

      await this.videoLineEntity.update(
        {
          video_id: videoId,
          collection_id: collectionId,
        },
        {
          collection_name: collectionEntity.name,
          tag: collectionEntity.param,
          video_id: videoId,
          video_name: videoEntity.title,
          collection_id: collectionId,
          sort: collectionEntity.sort,
        }
      );

      // 查询获取实际的 videoLineEntity id
      const videoLineEntity = await this.videoLineEntity.findOne({
        where: {
          video_id: videoId,
          collection_id: collectionId,
        },
      });

      if (!videoLineEntity || !videoLineEntity.id) {
        this.logger.error(TAG, `无法获取 videoLineEntity id: ${videoEntity.title}`);
        return;
      }

      let parseVideoList = this.parseVideoList(
        videoEntity,
        collectionEntity,
        videoLineEntity.id
      );

      // 使用 Promise.all 等待所有插入操作完成，确保 video_line_id 正确设置
      await Promise.all(
        parseVideoList.map(item => this.playLineService.insert(item))
      );

      this.logger.info(TAG, `update ${videoEntity.title} videoLineEntityId ${videoLineEntity.id}  success`);

      // 缓存存在标记
      await this.midwayCache.set(cacheKey, true, this.CACHE_TTL);

      // 显式释放对象引用
      videoEntity = null;
      parseVideoList = null;
    }
  }

  updateSort(id: number, sort: number) {
    this.videoLineEntity.update({
      collection_id: id
    }, {
      sort: sort
    });
  }

  idsDelete(ids: number[] | string[]) {
    // 将数字转换为字符串以匹配 bigint 类型
    console.log('ids', typeof ids);
    const stringIds = ids.map(id => id.toString());
    this.videoLineEntity.delete({
      video_id: In(stringIds)
    });
  }
}
