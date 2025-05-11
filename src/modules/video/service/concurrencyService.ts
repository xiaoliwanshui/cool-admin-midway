import { ILogger, Inject, Provide } from '@midwayjs/core';
import { CollectionEntity } from '../entity/collection';
import { VideoParams } from '../bean/VideoParams';
import axios from 'axios';
import { VideoResponseData } from '../bean/SourceVideo';
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
      this.collectionTaskTaskEntityId = (
        await this.collectionTaskTaskEntity.insert({
          taskName: collectionEntity.name as string,
          taskType: 1,
          taskStatus: 1,
          collectionSource: JSON.stringify(collectionEntity),
          //获取 当前时间
          startDate: moment().format('YYYY-MM-DD HH:mm:ss'),
          endDate: moment().format('YYYY-MM-DD HH:mm:ss'),
          remark: '采集任务开始',
        })
      )['identifiers'][0].id;
      let collectionCategoryEntityList =
        await this.collectionCategoryEntity.findBy({
          collection_id: collectionEntity.id,
        });
      let areaEntityList: DictInfoEntity[] = (
        await this.dictInfoService.data(['area'])
      )['area'];
      let languageEntityList: DictInfoEntity[] = (
        await this.dictInfoService.data(['language'])
      )['language'];
      if (!collectionCategoryEntityList.length) {
        throw new CoolCommException('未匹配系统分类 无法入库~');
      }
      videoParamsArray.forEach(items => {
        Promise.all(
          items.map(item => {
            return this.promiseLimit(() =>
              this.syncVideoPage(collectionEntity, item)
            )
              .then(result => {
                //删除一条item的数据
                items.splice(videoParamsArray.indexOf(item as any), 1);
                return { success: true, data: result };
              })
              .catch(error => {
                this.logger.error(
                  TAG,
                  ` 采集失败 Promise.all syncVideoPageList error: ${error.message}`
                );
                //删除一条item的数据
                items.splice(videoParamsArray.indexOf(item as any), 1);
                return { success: false, error };
              });
          })
        ).then(results => {
          //删除一条items的数据
          videoParamsArray.splice(videoParamsArray.indexOf(items), 1);
          if (results.length > 0) {
            let videoList: VideoBean[] = [];
            results.forEach(result => {
              if (result.success && result.data) {
                if (!result.data.list) {
                  this.logger.error(TAG, 'result.data.list 是null 采集失败');
                  return;
                }
                result.data.list.forEach(item => {
                  let video: VideoBean = new VideoBean();
                  const category = this.filterCategory(
                    item.type_id,
                    collectionCategoryEntityList
                  );
                  const area = this.filterDict(
                    item.vod_area || item.area,
                    areaEntityList
                  );
                  const language = this.filterDict(
                    item.vod_lang || item.language || item.lang,
                    languageEntityList
                  );
                  if (!category) {
                    this.logger.error(
                      `分类不存在：${item.type_name} ${item.type_id}`
                    );
                    result.data.list.splice(
                      result.data.list.indexOf(item as any),
                      1
                    );
                    return;
                  }
                  video.setCategoryId(category.sys_category_id);
                  video.setTitle(item.vod_name || item.name);
                  video.setAlias(item.vod_alias || item.alias);
                  video.setSurfacePlot(
                    item.vod_surface_plot ||
                      item.surface_plot ||
                      item.pic ||
                      item.vod_pic
                  );
                  video.setDirectors(item.vod_directors || item.director);
                  video.setActors(item.vod_actors || item.actors);
                  video.setStatus(item.vod_status || item.status);
                  video.setEnd(item.vod_isEnd || item.isEnd);
                  video.setIntroduce(
                    item.vod_introduce ||
                      item.introduce ||
                      item.des ||
                      item.vod_content
                  );
                  video.setNumber(item.vod_number || item.number);
                  video.setTrailerTime(
                    item.vod_release_time || item.release_time
                  );
                  video.setShelfAt(item.vod_shelf_time || item.shelf_time);
                  video.setDuration(item.vod_duration || item.duration);
                  video.setImdbScore(item.vod_imdb_score || item.imdb_score);
                  video.setDoubanScore(
                    item.vod_douban_score || item.douban_score
                  );
                  video.setUnit(item.vod_unit || item.unit);
                  video.setLanguage(language.id);
                  video.setRegion(area.id);
                  video.setYear(item.vod_year || item.year);
                  video.setDoubanScoreId(item.vod_douban_id);
                  video.setDoubanScore(item.vod_douban_score);
                  video.setActors(item.vod_actor);
                  video.setDirectors(item.vod_director);
                  video.setPlayUrl(item.vod_play_url || item.play_url);
                  video.setPopularityDay(
                    item.vod_popularity_day ||
                      item.popularity_day ||
                      item.vod_hits_day
                  );
                  video.setPopularityWeek(
                    item.vod_popularity_week ||
                      item.popularity_week ||
                      item.vod_hits_week
                  );
                  video.setPopularityMonth(
                    item.vod_popularity_month ||
                      item.popularity_month ||
                      item.vod_hits_month
                  );
                  video.setHorizontalPoster(
                    item.vod_pic_thumb || item.pic || item.vod_pic
                  );
                  video.setVerticalPoster(
                    item.vod_vertical_poster || item.vertical_poster || item.pic
                  );
                  video.setNote(item.vod_note || item.note);
                  video.setCycle(item.vod_cycle || item.cycle);
                  video.setTitlesTime(0);
                  video.setTotal(
                    this.extractNumber(
                      item.vod_total || item.total || item.note || '0'
                    )
                  );
                  video.setPlayUrlPutIn(0);
                  videoList.push(video);
                  video = null; // 显式释放引用
                  result.data.list.splice(
                    result.data.list.indexOf(item as any),
                    1
                  );
                });
                this.saveVideo(videoList, collectionEntity);
                result = null;
                videoList.length = 0; // 显式释放引用
              } else {
                result = null;
                // Handle error case
              }
              results.splice(videoParamsArray.indexOf(result as any), 1);
            });
            results.length = 0;
          }
        });
      });
      videoParamsArray.length = 0;
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
  ): CollectionCategoryEntity | null {
    try {
      const result = collectionCategoryEntityList.filter(item => {
        if (item.class_id == category_id) {
          return item;
        }
      });
      if (result.length) {
        return result[0];
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
          //将params转成JSON对象
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
      videoList.forEach((item, index) => {
        this.videosService.insert(
          item as unknown as VideoEntity,
          collectionEntity
        );
      });
      // 显式清空数组，释放内存
      videoList.length = 0;
      collectionEntity = null;
    } catch (error) {
      this.logger.error(TAG, error);
    }
  }
}
