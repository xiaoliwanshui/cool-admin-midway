import {ILogger, Inject, Provide} from '@midwayjs/core';
import {CollectionEntity} from '../entity/collection';
import {VideoParams} from '../bean/VideoParams';
import axios from 'axios';
import {VideoResponseData} from '../bean/SourceVideo';
import {VideoBean} from '../bean/VideoBean';
import {CollectionCategoryEntity} from '../entity/collection_category';
import {InjectEntityModel} from '@midwayjs/typeorm';
import {Repository} from 'typeorm';
import {VideoEntity} from '../entity/videos';
import {VideosService} from './videos';
import {CoolCommException} from '@cool-midway/core';
import {DictInfoService} from '../../dict/service/info';
import {DictInfoEntity} from '../../dict/entity/info';
import {CollectionTaskTaskEntity} from '../entity/collection_task';
import * as moment from 'moment';

const promiseLimit = require('promise-limit');

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

  private promiseLimit = promiseLimit(15);

  private collectionTaskTaskEntityId = 0;

  //同步结束后的任务
  async syncVideoPageListEnd() {
    this.logger.info(TAG, 'syncVideoPageListEnd');
  }

  async syncVideoPageList(
    collectionEntity: CollectionEntity,
    videoParamsArray: VideoParams[][]
  ): Promise<any> {
    try {
      // 解耦任务记录创建逻辑
      await this.createTaskRecord(collectionEntity);

      // 解耦分类和字典数据获取逻辑
      const {
        collectionCategoryEntityList,
        areaEntityList,
        languageEntityList,
      } = await this.fetchCategoryAndDictData(collectionEntity);

      while (videoParamsArray.length) {
        let items = videoParamsArray.shift();
        this.processVideoParamsItems(
          items,
          collectionEntity,
          collectionCategoryEntityList,
          areaEntityList,
          languageEntityList
        );
      }

      videoParamsArray = null;
    } catch (error) {
      this.logger.error(TAG, error);
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
          category_pid: parentCategory?.sys_category_id ? parentCategory.sys_category_id : 0,
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
  ): Promise<VideoResponseData | Object> {
    try {
      const result = await axios.get(
        collectionEntity.address + '?' + params.getQueryString()
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
      this.logger.info(TAG, `request error ${JSON.stringify(error)}`);
      await this.collectionTaskTaskEntity.update(
        this.collectionTaskTaskEntityId,
        {
          taskStatus: 3,
          execResult: JSON.stringify(error),
          execParams: JSON.stringify(params.getObject()),
          endDate: moment().format('YYYY-MM-DD HH:mm:ss'),
          errorMessage: JSON.stringify(error),
        }
      );
      return {};
    }
  }

  async saveVideo(videoList: VideoBean[], collectionEntity: CollectionEntity) {
    try {
      // 直接使用原对象，避免不必要的复制

      while (videoList.length) {
        const item = videoList.shift();
        this.videosService.insert(
          item as unknown as VideoEntity,
          collectionEntity
        );
      }
      // 显式清空数组，释放内存
      videoList = null;
      collectionEntity = null;
    } catch (error) {
      this.logger.error(TAG, error);
    }
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

    if (!collectionCategoryEntityList.length) {
      throw new CoolCommException('未匹配系统分类 无法入库~');
    }

    return {
      collectionCategoryEntityList,
      areaEntityList: areaEntityList['area'],
      languageEntityList: languageEntityList['language'],
    };
  }

  // 新增：解耦参数处理逻辑
  private async processVideoParamsItems(
    items: VideoParams[],
    collectionEntity: CollectionEntity,
    collectionCategoryEntityList: CollectionCategoryEntity[],
    areaEntityList: DictInfoEntity[],
    languageEntityList: DictInfoEntity[]
  ) {
    while (items.length > 0) {
      let item = items.shift();
      const result = await this.processSingleVideoItem(item, collectionEntity);
      this.handleResultsAndSaves(
        result,
        collectionEntity,
        collectionCategoryEntityList,
        areaEntityList,
        languageEntityList
      )
    }
  }

  // 新增：解耦单个视频处理逻辑
  private async processSingleVideoItem(
    item: VideoParams,
    collectionEntity: CollectionEntity
  ) {
    try {
      const result = await this.promiseLimit(() =>
        this.syncVideoPage(collectionEntity, item)
      );
      return {success: true, data: result};
    } catch (error) {
      this.logger.error(
        TAG,
        `采集失败 Promise.all syncVideoPageList error: ${error.message}`
      );
      return {success: false, error};
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
    if (!result) return;
    const videoList: VideoBean[] = [];
    if (result.success && result.data?.list) {
      while (result.data.list.length) {
        let item = result.data.list.shift();
        this.processVideoItem(
          item,
          collectionCategoryEntityList,
          areaEntityList,
          languageEntityList,
          videoList
        )
      }
    }

    this.saveVideo(videoList, collectionEntity);
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
          )
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
      this.logger.error(`分类不存在：${item.type_name} ${item.type_id}`);
      return;
    }
    item.categoryId = category.category_id;
    item.categoryPid = category.category_pid;
    item.collectionName = collectionCategoryEntityList[0].collection_name;
    item.collectionId = collectionCategoryEntityList[0].collection_id;
    const language = this.filterDict(
      item.vod_lang || item.language || item.lang,
      languageEntityList
    )
    if (language) {
      item.language = this.filterDict(
        item.vod_lang || item.language || item.lang,
        languageEntityList
      ).id;
    } else {
      item.language = 611
    }
    const area = this.filterDict(item.vod_area || item.area, areaEntityList);
    if (area) {
      item.area = this.filterDict(item.vod_area || item.area, areaEntityList).id;
    } else {
      item.area = 570
    }
    videoList.push(new VideoBean(item));
  }
}
