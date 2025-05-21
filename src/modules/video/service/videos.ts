import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { VideoEntity } from '../entity/videos';
import { VideoAlbumEntity } from '../entity/album';
import { VideoAlbum } from '../entity/album_video';
import { VideoWeekEntity } from '../entity/week_video';
import { WeekEntity } from '../entity/week';
import { ILogger, Inject, Provide } from '@midwayjs/core';
import { CollectionEntity } from '../entity/collection';
import { VideoLineService } from './videoLine';
import { PlayLineService } from './play_line';
import { PlayLineEntity } from '../entity/play_line';

const TAG = 'VideosService';

@Provide()
export class VideosService extends BaseService {
  @InjectEntityModel(VideoEntity)
  videoEntity: Repository<VideoEntity>;

  @InjectEntityModel(VideoAlbumEntity)
  albumEntity: Repository<VideoAlbumEntity>;

  @InjectEntityModel(VideoAlbum)
  videoAlbum: Repository<VideoAlbum>;

  @InjectEntityModel(PlayLineEntity)
  playLineEntity: Repository<PlayLineEntity>;

  @InjectEntityModel(WeekEntity)
  weekEntity: Repository<WeekEntity>;

  @InjectEntityModel(VideoWeekEntity)
  videoWeekEntity: Repository<VideoWeekEntity>;

  @Inject()
  VideoLineService: VideoLineService;

  @Inject()
  playLineService: PlayLineService;

  @Inject()
  logger: ILogger;

  /**
   * 排序查询
   */
  async sort(query: any): Promise<any> {
    const find = this.videoEntity.createQueryBuilder();
    const { sort, category_pid } = query;
    delete query.sort;
    find.where(category_pid ? { category_pid } : {}).orderBy(sort, 'DESC');
    return this.entityRenderPage(find, query);
  }

  async album(query: any): Promise<any> {
    let { list } = await this.videoAlbumEntityPage(query);
    return await this.videoAlbumRelationshipPage(list, query);
  }

  async week(query: any): Promise<any> {
    let { list } = await this.videoWeekPage(query);
    return await this.videoWeekVideoPage(list, query);
  }

  /**
   * 执行entity分页
   */
  async videoAlbumEntityPage(query: any): Promise<any> {
    const find = this.albumEntity.createQueryBuilder();
    if (query.category_id) {
      find.where('category_id= :category_id', query).orderBy('sort', 'ASC');
    } else {
      find.orderBy('sort', 'ASC');
    }
    return this.entityRenderPage(find, query);
  }

  async videoWeekPage(query: any): Promise<any> {
    const find = this.weekEntity.createQueryBuilder();
    if (query.week) {
      find.where('week= :week', query).orderBy('sort', 'ASC');
    } else {
      find.orderBy('sort', 'DESC');
    }
    return this.entityRenderPage(find, query);
  }

  async videoAlbumRelationshipPage(list: Array<any>, query: any): Promise<any> {
    for (const item of list) {
      let video = [];
      let data = await this.videoAlbum.find({
        where: { album_id: item.id },
        take: query.videoSize || 4,
      });
      for (const dataItem of data) {
        video.push(
          await this.videoEntity.findOneBy({
            id: dataItem.videos_id,
          })
        );
      }
      item['list'] = video;
    }
    return { list: list };
  }

  async videoWeekVideoPage(list: Array<any>, query: any): Promise<any> {
    for (const item of list) {
      let video = [];
      let data = await this.videoWeekEntity.find({
        where: { week_id: item.id },
        take: query.videoSize || 4,
      });
      for (const dataItem of data) {
        video.push(
          await this.videoEntity.findOneBy({
            id: dataItem.videos_id,
          })
        );
      }
      item['list'] = video;
    }
    return { list: list };
  }

  //批量插入
  async insert(
    videoEntity: VideoEntity,
    collectionEntity: CollectionEntity
  ): Promise<VideoEntity> {
    try {
      // 插入数据
      await this.videoEntity.insert(videoEntity);
      const result = await this.videoEntity.findOneBy({
        title: videoEntity.title,
      });
      this.logger.info(TAG, `insert ${videoEntity.title} success`);
      // 显式释放对象引用
      await this.VideoLineService.insert(result, collectionEntity);
      collectionEntity = null;
      videoEntity = null;
      return result;
    } catch (error) {
      // 更新数据
      await this.videoEntity.update({ title: videoEntity.title }, videoEntity);
      const result = await this.videoEntity.findOneBy({
        title: videoEntity.title,
      });
      // 显式释放对象引用;
      this.logger.info(TAG, `update ${videoEntity.title} success`);
      if (result) {
        // 显式释放对象引用
        await this.VideoLineService.insert(result, collectionEntity);
      }
      collectionEntity = null;
      videoEntity = null;
      return result;
    }
  }
}
