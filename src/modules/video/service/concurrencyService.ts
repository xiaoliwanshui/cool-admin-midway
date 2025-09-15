import { ILogger, Inject, Provide } from '@midwayjs/core';
import { CollectionEntity } from '../entity/collection';
import { VideoParams } from '../bean/VideoParams';
import axios from 'axios';
import { VideoBean } from '../bean/VideoBean';
import { CollectionCategoryEntity } from '../entity/collection_category';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { VideoEntity } from '../entity/videos';
import { VideosService } from './videos';
import { CoolCommException } from '@cool-midway/core';
import { DictInfoService } from '../../dict/service/info';
import { DictInfoEntity } from '../../dict/entity/info';
import { CollectionTaskTaskEntity } from '../entity/collection_task';
import * as moment from 'moment';
import { RedisService } from '@midwayjs/redis';
import { VIDEO_RESPONSE } from '../bean/video_response';
import { NetworkErrorHandler } from './networkErrorHandler';

const TAG = 'ConcurrencyService';

@Provide()
export class ConcurrencyService {
  @Inject()
  logger: ILogger;
  @InjectEntityModel(CollectionCategoryEntity)
  collectionCategoryEntity: Repository<CollectionCategoryEntity>;

  @InjectEntityModel(VideoEntity)
  videoEntity: Repository<VideoEntity>;

  @InjectEntityModel(CollectionTaskTaskEntity)
  collectionTaskTaskEntity: Repository<CollectionTaskTaskEntity>;

  @Inject()
  videosService: VideosService;

  @Inject()
  dictInfoService: DictInfoService;

  @Inject()
  redisService: RedisService;
  
  @Inject()
  networkErrorHandler: NetworkErrorHandler;

  private collectionTaskTaskEntityId = 0;

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
      this.logger.error(TAG, 'Redis数据获取失败', error);
      return null;
    }
  }

  async syncVideoPageList(): Promise<any> {
    try {
      this.logger.info(TAG, '开始处理Redis中的视频采集数据');
      
      // 循环处理Redis中的所有数据
      let processedCount = 0;
      let maxRetries = 100; // 最大重试次数，防止无限循环
      
      while (processedCount < maxRetries) {
        const data: any = await this.getRedisData();
        if (!data) {
          if (processedCount === 0) {
            this.logger.debug(TAG, 'Redis中没有可处理的数据');
          } else {
            this.logger.info(TAG, `Redis数据处理完成，共处理${processedCount}条数据`);
          }
          break;
        }
        
        // 验证数据结构
        if (!this.validateRedisData(data)) {
          this.logger.warn(TAG, `第${processedCount + 1}条数据格式无效，跳过`);
          processedCount++;
          continue;
        }
        
        try {
          this.logger.debug(TAG, `开始处理第${processedCount + 1}条数据`);
          
          // 解耦任务记录创建逻辑
          await this.createTaskRecord(data.collectionEntity as CollectionEntity);
          
          const {
            collectionCategoryEntityList,
            areaEntityList,
            languageEntityList,
          } = await this.fetchCategoryAndDictData(
            data.collectionEntity as CollectionEntity
          );
          
          await this.processVideoParamsItems(
            new VideoParams(data.videoParams),
            data.collectionEntity as CollectionEntity,
            collectionCategoryEntityList,
            areaEntityList,
            languageEntityList
          );
          
          processedCount++;
          this.logger.debug(TAG, `第${processedCount}条数据处理完成`);
          
          // 防止内存溢出，每处理一条数据后添加小延时
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          this.logger.error(TAG, `处理第${processedCount + 1}条数据失败`, error);
          processedCount++; // 即使失败也计数，避免无限循环
        }
      }
      
      if (processedCount >= maxRetries) {
        this.logger.warn(TAG, `达到最大处理次数${maxRetries}，停止处理`);
      }
      
    } catch (error) {
      this.logger.error(TAG, '处理Redis数据失败', error);
      return error;
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
      this.logger.warn(TAG, 'Redis数据缺少必要字段: collectionEntity 或 videoParams');
      return false;
    }
    
    if (!data.collectionEntity.id || !data.collectionEntity.name) {
      this.logger.warn(TAG, 'collectionEntity缺少必要字段: id 或 name');
      return false;
    }
    
    return true;
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
  filterCategory(
    category_id: number,
    collectionCategoryEntityList: CollectionCategoryEntity[]
  ): { category_id: number; category_pid: number } | null {
    try {
      const result = collectionCategoryEntityList.filter(item => {
        if (item.class_id == category_id) {
          return item;
        }
      });
      if (result.length) {
        //根据 result[0]的parentId 过滤出父分类
        const parentCategory = collectionCategoryEntityList.find(
          item => item.id === result[0].parentId
        );
        return {
          category_id: result[0].sys_category_id,
          category_pid: parentCategory?.sys_category_id
            ? parentCategory.sys_category_id
            : 0,
        };
      }
    } catch (error) {
      return null;
    }
  }

  filterDict(name: string, DictInfoEntityList: DictInfoEntity[]) {
    try {
      const result = DictInfoEntityList.filter(item => item.name === name);
      if (result.length) {
        return result[0];
      } else {
        return DictInfoEntityList[DictInfoEntityList.length - 1];
      }
    } catch (error) {
      this.logger.error(TAG, error);
    }
  }

  async syncVideoPage(
    collectionEntity: CollectionEntity,
    params: VideoParams
  ): Promise<VIDEO_RESPONSE | Object> {
    let uri: string = '';
    
    try {
      uri = collectionEntity.address + '?' + params.getQueryString();
      //删除uri的空格
      uri.replace(/\s+/g, '');
      this.logger.info(TAG, uri);
      
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
      
      if (params.getPagecount() === params.getPage()) {
        await this.collectionTaskTaskEntity.update(
          this.collectionTaskTaskEntityId,
          {
            taskStatus: 2,
            execResult: JSON.stringify(result.data),
            execParams: JSON.stringify(params.getObject()),
            endDate: moment().format('YYYY-MM-DD HH:mm:ss'),
          }
        );
        this.logger.info(TAG, 'request page task finished');
      }
      return result.data;
    } catch (error) {
      // 网络错误详细信息记录
      let errorMessage = 'Unknown error';
      if (this.networkErrorHandler.isNetworkError(error)) {
        errorMessage = this.networkErrorHandler.getNetworkErrorDetails(error);
        this.logger.error(TAG, `网络请求失败: ${errorMessage}`);
        
        if (this.networkErrorHandler.isDnsError(error)) {
          this.logger.warn(TAG, `采集源 "${collectionEntity.name}" 域名解析失败，可能需要检查URL配置`);
        }
      } else {
        errorMessage = error.message || error.toString();
        this.logger.error(TAG, `非网络错误: ${errorMessage}`);
      }
      
      this.logger.info(
        TAG,
        `request error ${uri || 'unknown URL'} - ${errorMessage}`
      );
      
      await this.collectionTaskTaskEntity.update(
        this.collectionTaskTaskEntityId,
        {
          taskStatus: 3,
          execResult: JSON.stringify({
            error: errorMessage,
            code: error.code || 'UNKNOWN',
            isNetworkError: this.networkErrorHandler.isNetworkError(error)
          }),
          execParams: JSON.stringify(params.getObject()),
          endDate: moment().format('YYYY-MM-DD HH:mm:ss'),
          errorMessage: errorMessage,
        }
      );
      return {};
    }
  }

  async saveVideo(videoList: VideoBean[], collectionEntity: CollectionEntity) {
    try {
      this.logger.info(TAG, `开始保存视频数据，共${videoList.length}条`);
      
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
              this.logger.debug(TAG, `视频已存在，跳过: ${item.getTitle()}`);
            } else {
              this.logger.error(TAG, `保存视频失败: ${item.getTitle()}`, error);
            }
          }
        }
        
        // 内存管理
        if (process.memoryUsage().heapUsed > 500 * 1024 * 1024) {
          global.gc && global.gc();
          this.logger.info(TAG, `内存使用超过500MB，触发垃圾回收`);
        }
        
        // 添加小延时避免数据库连接过载
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      this.logger.info(TAG, `视频保存完成，成功${savedCount}条，失败${errorCount}条`);
      
      // 显式清空数组，释放内存
      videoList = null;
      collectionEntity = null;
    } catch (error) {
      this.logger.error(TAG, '批量保存视频数据失败', error);
    }
  }
  
  /**
   * 判断是否为重复键错误
   */
  private isDuplicateKeyError(error: any): boolean {
    return error.code === 'ER_DUP_ENTRY' || 
           error.errno === 1062 ||
           (error.message && error.message.includes('Duplicate entry'));
  }

  // 新增：解耦任务记录创建
  private async createTaskRecord(collectionEntity: CollectionEntity) {
    this.collectionTaskTaskEntityId = (
      await this.collectionTaskTaskEntity.insert({
        taskName: collectionEntity.name as string,
        taskType: 1,
        taskStatus: 1,
        collectionSource: JSON.stringify(collectionEntity),
        startDate: moment().format('YYYY-MM-DD HH:mm:ss'),
        endDate: moment().format('YYYY-MM-DD HH:mm:ss'),
        remark: '采集任务开始',
      })
    )['identifiers'][0].id;
  }

  // 新增：解耦数据获取逻辑
  private async fetchCategoryAndDictData(collectionEntity: CollectionEntity) {
    const collectionCategoryEntityList =
      await this.collectionCategoryEntity.findBy({
        collection_id: collectionEntity.id,
      });

    const [areaEntityList, languageEntityList] = await Promise.all([
      this.dictInfoService.data(['area']),
      this.dictInfoService.data(['language']),
    ]);

    this.logger.info(TAG, `采集源 "${collectionEntity.name}" 匹配到 ${collectionCategoryEntityList.length} 个分类`);
    
    if (!collectionCategoryEntityList.length) {
      this.logger.error(TAG, `采集源 "${collectionEntity.name}" (ID: ${collectionEntity.id}) 未匹配系统分类，无法入库`);
      this.logger.error(TAG, '请先在后台管理系统中为该采集源配置分类映射关系');
      throw new CoolCommException(`采集源 "${collectionEntity.name}" 未匹配系统分类，无法入库`);
    }

    return {
      collectionCategoryEntityList,
      areaEntityList: areaEntityList['area'],
      languageEntityList: languageEntityList['language'],
    };
  }

  // 新增：解耦参数处理逻辑
  private async processVideoParamsItems(
    item: VideoParams,
    collectionEntity: CollectionEntity,
    collectionCategoryEntityList: CollectionCategoryEntity[],
    areaEntityList: DictInfoEntity[],
    languageEntityList: DictInfoEntity[]
  ) {
    const result = await this.processSingleVideoItem(item, collectionEntity);
    this.handleResultsAndSaves(
      result,
      collectionEntity,
      collectionCategoryEntityList,
      areaEntityList,
      languageEntityList
    );
  }

  // 新增：解耦单个视频处理逻辑
  private async processSingleVideoItem(
    item: VideoParams,
    collectionEntity: CollectionEntity
  ) {
    try {
      const result = await this.syncVideoPage(collectionEntity, item);

      return { success: true, data: result };
    } catch (error) {
      this.logger.error(
        TAG,
        `采集失败 Promise.all syncVideoPageList error: ${error.message}`
      );
      return { success: false, error };
    }
  }

  // 新增：解耦结果处理逻辑
  private handleResultsAndSaves(
    result: any,
    collectionEntity: CollectionEntity,
    collectionCategoryEntityList: CollectionCategoryEntity[],
    areaEntityList: DictInfoEntity[],
    languageEntityList: DictInfoEntity[]
  ) {
    if (!result) {
      this.logger.warn(TAG, '无效的API响应结果');
      return;
    }
    
    const videoList: VideoBean[] = [];
    if (result.success && result.data?.list) {
      this.logger.info(TAG, `开始处理视频列表，共${result.data.list.length}条数据`);
      
      let processedCount = 0;
      while (result.data.list.length) {
        let item = result.data.list.shift();
        this.processVideoItem(
          item,
          collectionCategoryEntityList,
          areaEntityList,
          languageEntityList,
          videoList
        );
        processedCount++;
      }
      
      this.logger.info(TAG, `视频数据处理完成，处理${processedCount}条，有效${videoList.length}条`);
    } else {
      this.logger.warn(TAG, '无效的视频数据响应', { 
        success: result.success, 
        hasData: !!result.data, 
        hasList: !!result.data?.list,
        listLength: result.data?.list?.length 
      });
    }

    if (videoList.length > 0) {
      this.saveVideo(videoList, collectionEntity);
    } else {
      this.logger.warn(TAG, '没有有效的视频数据需要保存');
    }
  }

  // 新增：解耦结果处理逻辑
  private handleResultsAndSave(
    results: any[],
    collectionEntity: CollectionEntity,
    collectionCategoryEntityList: CollectionCategoryEntity[],
    areaEntityList: DictInfoEntity[],
    languageEntityList: DictInfoEntity[]
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
            collectionCategoryEntityList,
            areaEntityList,
            languageEntityList,
            videoList
          );
        }
      }
    }
    this.saveVideo(videoList, collectionEntity);
  }

  // 新增：解耦视频项处理逻辑
  private processVideoItem(
    item: any,
    collectionCategoryEntityList: CollectionCategoryEntity[],
    areaEntityList: DictInfoEntity[],
    languageEntityList: DictInfoEntity[],
    videoList: VideoBean[]
  ) {
    const category = this.filterCategory(
      item.type_id,
      collectionCategoryEntityList
    );
    if (!category) {
      this.logger.warn(TAG, `分类不存在：${item.type_name} ${item.type_id}，跳过该视频: ${item.vod_name || item.name}`);
      return;
    }
    item.categoryId = category.category_id;
    item.categoryPid = category.category_pid;
    item.collectionName = collectionCategoryEntityList[0].collection_name;
    item.collectionId = collectionCategoryEntityList[0].collection_id;
    const language = this.filterDict(
      item.vod_lang || item.language || item.lang,
      languageEntityList
    );
    if (language) {
      item.language = this.filterDict(
        item.vod_lang || item.language || item.lang,
        languageEntityList
      ).id;
    } else {
      item.language = 611;
    }
    const area = this.filterDict(item.vod_area || item.area, areaEntityList);
    if (area) {
      item.area = this.filterDict(
        item.vod_area || item.area,
        areaEntityList
      ).id;
    } else {
      item.area = 570;
    }
    
    try {
      const videoBean = new VideoBean(item);
      videoList.push(videoBean);
      this.logger.debug(TAG, `视频数据处理成功: ${item.vod_name || item.name}`);
    } catch (error) {
      this.logger.error(TAG, `创建 VideoBean 失败: ${item.vod_name || item.name}`, error);
    }
  }
}
