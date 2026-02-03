import {ILogger, Inject, InjectClient, Provide} from '@midwayjs/core';
import {CollectionEntity} from '../entity/collection';
import {VideoParams} from '../bean/VideoParams';
import {VideoBean} from '../bean/VideoBean';
import {CollectionCategoryEntity} from '../entity/collection_category';
import {InjectEntityModel} from '@midwayjs/typeorm';
import {Repository} from 'typeorm';
import {VideoEntity} from '../entity/videos';
import {VideosService} from './videos';
import {CoolCommException} from '@cool-midway/core';
import {DictInfoService} from '../../dict/service/info';
import {DictInfoEntity} from '../../dict/entity/info';
import {RedisService} from '@midwayjs/redis';
import {VIDEO_RESPONSE} from '../bean/video_response';
import {NetworkErrorHandler} from './networkErrorHandler';
import {CachingFactory, MidwayCache} from '@midwayjs/cache-manager';

const TAG = 'ConcurrencyService';

@Provide()
export class ConcurrencyService {
  @Inject()
  logger: ILogger;
  @InjectEntityModel(CollectionCategoryEntity)
  collectionCategoryEntity: Repository<CollectionCategoryEntity>;

  @InjectEntityModel(VideoEntity)
  videoEntity: Repository<VideoEntity>;

  @Inject()
  videosService: VideosService;

  @Inject()
  dictInfoService: DictInfoService;

  @Inject()
  redisService: RedisService;

  @Inject()
  networkErrorHandler: NetworkErrorHandler;

  @InjectClient(CachingFactory, 'default')
  midwayCache: MidwayCache;

  private readonly CACHE_TTL = 300; // 缓存时间5分钟

  private readonly yieldThreshold = 5;
  private readonly listYieldThreshold = 50;

  // 单次处理的最大数量，防止长时间阻塞
  private readonly maxProcessPerCall = 20;

  // 单次处理的最大时间，防止长时间阻塞（毫秒）
  private readonly maxProcessTimePerCall = 10000; // 10秒

  async getRedisData() {
    try {
      const data = await this.redisService.exists('video:collection');
      if (data) {
        const queueData = await this.redisService.lpop('video:collection');
        if (queueData) {
          return JSON.parse(queueData);
        }
      }
      return null;
    } catch (error) {
      // this.logger.error(TAG, 'Redis数据获取失败', error);
      return null;
    }
  }

  async syncVideoPageList(): Promise<any> {
    try {
      // this.logger.info(TAG, '开始处理Redis中的视频采集数据');

      // 记录开始时间用于超时控制
      const startTime = Date.now();
      let processedCount = 0;
      let maxRetries = 100; // 最大重试次数，防止无限循环

      while (processedCount < maxRetries) {
        // 检查是否超出处理限制
        if (processedCount >= this.maxProcessPerCall ||
          Date.now() - startTime > this.maxProcessTimePerCall) {
          // this.logger.info(TAG, `达到单次处理限制，已处理: ${processedCount} 项，用时: ${Date.now() - startTime}ms`);
          break; // 退出循环，让其他任务有机会执行
        }

        const data: any = await this.getRedisData();
        if (!data) {
          if (processedCount === 0) {
            // this.logger.debug(TAG, 'Redis中没有可处理的数据');
          } else {
            // this.logger.info(TAG, `Redis数据处理完成，共处理${processedCount}条数据`);
          }
          break;
        }

        // 验证数据结构
        if (!this.validateRedisData(data)) {
          // this.logger.warn(TAG, `第${processedCount + 1}条数据格式无效，跳过`);
          processedCount++;
          // 及时释放 data 内存
          data.collectionEntity = null;
          data.videoParams = null;
          continue;
        }

        try {
          // this.logger.debug(TAG, `开始处理第${processedCount + 1}条数据`);

          const {
            collectionCategoryEntityList,
            categoryMap,
            areaMap,
            languageMap,
          } = await this.fetchCategoryAndDictData(
            data.collectionEntity as CollectionEntity
          );

          await this.processVideoParamsItems(
            new VideoParams(data.videoParams),
            data.collectionEntity as CollectionEntity,
            categoryMap,
            areaMap,
            languageMap
          );

          // 及时释放 data 内存
          data.collectionEntity = null;
          data.videoParams = null;

          processedCount++;
          // this.logger.debug(TAG, `第${processedCount}条数据处理完成`);

          // 防止内存溢出，每处理一条数据后添加小延时
          await new Promise(resolve => setTimeout(resolve, 100));
          if (processedCount % this.yieldThreshold === 0) {
            await this.yieldToEventLoop();
          }

        } catch (error) {
          // this.logger.error(TAG, `处理第${processedCount + 1}条数据失败`, error);
          processedCount++; // 即使失败也计数，避免无限循环
          // 及时释放 data 内存
          data.collectionEntity = null;
          data.videoParams = null;
        }
      }

      if (processedCount >= maxRetries) {
        // this.logger.warn(TAG, `达到最大处理次数${maxRetries}，停止处理`);
      }

    } catch (error) {
      // this.logger.error(TAG, '处理Redis数据失败', error);
      return error;
    }
  }

  //实现一个提取字符串中数字的函数
  extractNumber(inputString: string): number {
    //判断inputString是不是一个number 如果是number类型就直接返回
    if (!isNaN(Number(inputString))) {
      return Number(inputString);
    }
    // 使用正则表达式匹配数字
    const regex = /\d+/g;
    const matches = inputString.match(regex);

    // 如果匹配到数字，返回第一个匹配的数字
    if (matches && matches.length > 0) {
      return parseInt(matches[0]);
    }

    // 如果没有匹配到数字，返回 NaN
    return NaN;
  }

  //过滤分类
  async syncVideoPage(
    collectionEntity: CollectionEntity,
    params: VideoParams
  ): Promise<VIDEO_RESPONSE | Object> {
    let uri: string = '';

    try {
      uri = collectionEntity.address + '?' + params.getQueryString();
      //删除uri的空格
      uri.replace(/\s+/g, '');
      // this.logger.info(TAG, uri);

      // 使用网络错误处理器进行请求
      const result = await this.networkErrorHandler.requestWithRetry(
        {
          url: uri,
          method: 'GET',
          ...this.networkErrorHandler.getCollectionAxiosConfig()
        },
        2, // 最大重试2次（减少重试次数，因为是在循环中）
        1500 // 初始延迟1.5秒
      );

      return result.data;
    } catch (error) {
      // 网络错误详细信息记录
      let errorMessage = 'Unknown error';
      if (this.networkErrorHandler.isNetworkError(error)) {
        errorMessage = this.networkErrorHandler.getNetworkErrorDetails(error);
        // this.logger.error(TAG, `网络请求失败: ${errorMessage}`);

        if (this.networkErrorHandler.isDnsError(error)) {
          // this.logger.warn(TAG, `采集源 "${collectionEntity.name}" 域名解析失败，可能需要检查URL配置`);
        }
      } else {
        errorMessage = error.message || error.toString();
        // this.logger.error(TAG, `非网络错误: ${errorMessage}`);
      }

      // this.logger.info(
      //   TAG,
      //   `request error ${uri || 'unknown URL'} - ${errorMessage}`
      // );

      return {};
    }
  }

  async saveVideo(videoList: VideoBean[], collectionEntity: CollectionEntity) {
    try {
      // this.logger.info(TAG, `开始保存视频数据，共${videoList.length}条`);

      // 批量处理避免内存问题，同时减少并发冲突
      const batchSize = 5; // 减小批处理大小避免重复键冲突
      let savedCount = 0;
      let errorCount = 0;

      while (videoList.length) {
        const batch = videoList.splice(0, batchSize);

        // 使用串行处理而非并行处理，避免重复键冲突
        for (const item of batch) {
          try {
            await this.videosService.insert(
              item as unknown as VideoEntity,
              collectionEntity
            );
            savedCount++;
          } catch (error) {
            errorCount++;
            // 重复键错误不记录为系统错误，只记录为debug日志
            if (this.isDuplicateKeyError(error)) {
              // this.logger.debug(TAG, `视频已存在，跳过: ${item.getTitle()}`);
            } else {
              // this.logger.error(TAG, `保存视频失败: ${item.getTitle()}`, error);
            }
          }
        }

        // 及时释放 batch 数组内存
        batch.length = 0;

        // 内存管理
        if (process.memoryUsage().heapUsed > 500 * 1024 * 1024) {
          global.gc && global.gc();
          // this.logger.info(TAG, `内存使用超过500MB，触发垃圾回收`);
        }

        // 添加小延时避免数据库连接过载
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // this.logger.info(TAG, `视频保存完成，成功${savedCount}条，失败${errorCount}条`);

      // 显式清空数组，释放内存
      videoList = null;
      collectionEntity = null;
    } catch (error) {
      // this.logger.error(TAG, '批量保存视频数据失败', error);
    }
  }

  /**
   * 验证Redis数据格式
   */
  private validateRedisData(data: any): boolean {
    if (!data || typeof data !== 'object') {
      return false;
    }

    if (!data.collectionEntity || !data.videoParams) {
      // this.logger.warn(TAG, 'Redis数据缺少必要字段: collectionEntity 或 videoParams');
      return false;
    }

    if (!data.collectionEntity.id || !data.collectionEntity.name) {
      // this.logger.warn(TAG, 'collectionEntity缺少必要字段: id 或 name');
      return false;
    }

    return true;
  }

  /**
   * 判断是否为重复键错误
   */
  private isDuplicateKeyError(error: any): boolean {
    return error.code === 'ER_DUP_ENTRY' ||
      error.errno === 1062 ||
      (error.message && error.message.includes('Duplicate entry'));
  }

  // 新增：解耦数据获取逻辑（添加缓存优化）
  private async fetchCategoryAndDictData(collectionEntity: CollectionEntity) {
    const collectionId = collectionEntity.id;

    // 优化：使用缓存避免重复查询分类和字典数据
    const cacheKey = `categoryDict:${collectionId}`;
    const cachedData = await this.midwayCache.get(cacheKey);

    if (cachedData) {
      this.logger.debug(TAG, `从缓存获取分类和字典数据: ${collectionId}`);
      return cachedData as {
        collectionCategoryEntityList: CollectionCategoryEntity[];
        categoryMap: Map<number, { categoryId: number; categoryPid: number }>;
        areaMap: Map<string, number>;
        languageMap: Map<string, number>;
      };
    }

    const collectionCategoryEntityList =
      await this.collectionCategoryEntity.findBy({
        collection_id: collectionId,
      });

    const [areaEntityList, languageEntityList] = await Promise.all([
      this.dictInfoService.data(['area']),
      this.dictInfoService.data(['language']),
    ]);

    // this.logger.info(TAG, `采集源 "${collectionEntity.name}" 匹配到 ${collectionCategoryEntityList.length} 个分类`);

    if (!collectionCategoryEntityList.length) {
      // this.logger.error(TAG, `采集源 "${collectionEntity.name}" (ID: ${collectionEntity.id}) 未匹配系统分类，无法入库`);
      // this.logger.error(TAG, '请先在后台管理系统中为该采集源配置分类映射关系');
      throw new CoolCommException(`采集源 "${collectionEntity.name}" 未匹配系统分类，无法入库`);
    }

    const categoryMap = this.buildCategoryMap(collectionCategoryEntityList);
    const areaMap = this.buildDictMap((areaEntityList['area'] ?? []) as DictInfoEntity[]);
    const languageMap = this.buildDictMap((languageEntityList['language'] ?? []) as DictInfoEntity[]);

    const result = {
      collectionCategoryEntityList,
      categoryMap,
      areaMap,
      languageMap,
    };

    // 缓存结果
    await this.midwayCache.set(cacheKey, result, this.CACHE_TTL);
    this.logger.debug(TAG, `分类和字典数据已缓存: ${collectionId}`);

    return result;
  }

  // 新增：解耦参数处理逻辑
  private async processVideoParamsItems(
    item: VideoParams,
    collectionEntity: CollectionEntity,
    categoryMap: Map<
      number,
      { categoryId: number; categoryPid: number }
    >,
    areaMap: Map<string, number>,
    languageMap: Map<string, number>
  ) {
    const result = await this.processSingleVideoItem(item, collectionEntity);
    await this.handleResultsAndSaves(
      result,
      collectionEntity,
      categoryMap,
      areaMap,
      languageMap
    );
  }

  // 新增：解耦单个视频处理逻辑
  private async processSingleVideoItem(
    item: VideoParams,
    collectionEntity: CollectionEntity
  ) {
    try {
      const result = await this.syncVideoPage(collectionEntity, item);

      return {success: true, data: result};
    } catch (error) {
      // this.logger.error(
      //   TAG,
      //   `采集失败 Promise.all syncVideoPageList error: ${error.message}`
      // );
      return {success: false, error};
    }
  }

  // 新增：解耦结果处理逻辑
  private async handleResultsAndSaves(
    result: any,
    collectionEntity: CollectionEntity,
    categoryMap: Map<
      number,
      { categoryId: number; categoryPid: number }
    >,
    areaMap: Map<string, number>,
    languageMap: Map<string, number>
  ) {
    if (!result) {
      // this.logger.warn(TAG, '无效的API响应结果');
      return;
    }

    const videoList: VideoBean[] = [];
    if (result.success && result.data?.list) {
      // this.logger.info(TAG, `开始处理视频列表，共${result.data.list.length}条数据`);

      let processedCount = 0;
      while (result.data.list.length) {
        let item = result.data.list.shift();
        this.processVideoItem(
          item,
          collectionEntity,
          categoryMap,
          areaMap,
          languageMap,
          videoList
        );
        processedCount++;
        if (processedCount % this.listYieldThreshold === 0) {
          await this.yieldToEventLoop();
        }
      }

      // 及时释放 result.data.list 内存
      result.data.list = null;

      // this.logger.info(TAG, `视频数据处理完成，处理${processedCount}条，有效${videoList.length}条`);
    } else {
      // this.logger.warn(TAG, '无效的视频数据响应', {
      //   success: result.success,
      //   hasData: !!result.data,
      //   hasList: !!result.data?.list,
      //   listLength: result.data?.list?.length
      // });
    }

    if (videoList.length > 0) {
      this.saveVideo(videoList, collectionEntity);
    } else {
      // this.logger.warn(TAG, '没有有效的视频数据需要保存');
    }
  }

  // 新增：解耦结果处理逻辑
  private handleResultsAndSave(
    results: any[],
    collectionEntity: CollectionEntity,
    categoryMap: Map<
      number,
      { categoryId: number; categoryPid: number }
    >,
    areaMap: Map<string, number>,
    languageMap: Map<string, number>
  ) {
    if (!results.length) return;
    const videoList: VideoBean[] = [];
    while (results.length) {
      const result = results.shift();
      if (result.success && result.data?.list) {
        while (result.data.list.length) {
          let item = result.data.list.shift();
          this.processVideoItem(
            item,
            collectionEntity,
            categoryMap,
            areaMap,
            languageMap,
            videoList
          );
        }
        // 及时释放 result.data.list 内存
        result.data.list = null;
      }
    }
    // 及时释放 results 数组
    results = null;
    this.saveVideo(videoList, collectionEntity);
  }

  // 新增：解耦视频项处理逻辑
  private processVideoItem(
    item: any,
    collectionEntity: CollectionEntity,
    categoryMap: Map<number, { categoryId: number; categoryPid: number }>,
    areaMap: Map<string, number>,
    languageMap: Map<string, number>,
    videoList: VideoBean[]
  ) {
    const category = categoryMap.get(this.safeNumber(item.type_id) ?? -1);
    if (!category) {
      // this.logger.warn(TAG, `分类不存在：${item.type_name} ${item.type_id}，跳过该视频: ${item.vod_name || item.name}`);
      return;
    }
    item.categoryId = category.categoryId;
    item.categoryPid = category.categoryPid;
    item.collectionName = collectionEntity.name;
    item.collectionId = collectionEntity.id;

    item.language = this.resolveDictId(
      item.vod_lang || item.language || item.lang,
      languageMap,
      611
    );
    item.area = this.resolveDictId(
      item.vod_area || item.area,
      areaMap,
      570
    );

    try {
      const videoBean = new VideoBean(item);
      videoList.push(videoBean);
      // this.logger.debug(TAG, `视频数据处理成功: ${item.vod_name || item.name}`);
    } catch (error) {
      // this.logger.error(TAG, `创建 VideoBean 失败: ${item.vod_name || item.name}`, error);
    }
  }

  private buildCategoryMap(
    collectionCategoryEntityList: CollectionCategoryEntity[]
  ): Map<number, { categoryId: number; categoryPid: number }> {
    const entityById = new Map<number, CollectionCategoryEntity>();
    collectionCategoryEntityList.forEach(item => {
      if (item?.id) {
        entityById.set(item.id, item);
      }
    });

    const categoryMap = new Map<
      number,
      { categoryId: number; categoryPid: number }
    >();

    collectionCategoryEntityList.forEach(item => {
      const classId = item?.class_id;
      if (!classId) {
        return;
      }
      const parentEntity = item.parentId ? entityById.get(item.parentId) : null;
      categoryMap.set(classId, {
        categoryId: item.sys_category_id ?? 0,
        categoryPid: parentEntity?.sys_category_id ?? 0,
      });
    });

    return categoryMap;
  }

  private buildDictMap(list: DictInfoEntity[]): Map<string, number> {
    const map = new Map<string, number>();
    list.forEach(item => {
      if (item?.name && item?.id) {
        map.set(item.name, item.id);
      }
    });
    return map;
  }

  private resolveDictId(
    value: string,
    map: Map<string, number>,
    fallback: number
  ): number {
    if (!value) {
      return fallback;
    }
    return map.get(value) ?? fallback;
  }

  private safeNumber(value: any): number | null {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      return null;
    }
    return Math.trunc(parsed);
  }

  private async yieldToEventLoop() {
    return new Promise(resolve => setTimeout(resolve, 0));
  }
}
