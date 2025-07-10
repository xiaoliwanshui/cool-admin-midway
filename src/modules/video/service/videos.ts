import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { VideoEntity } from '../entity/videos';
import { VideoAlbumEntity } from '../entity/album';
import { VideoAlbumRelationship } from '../entity/video_album_relationship';
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

  @InjectEntityModel(VideoAlbumRelationship)
  videoAlbumRelationship: Repository<VideoAlbumRelationship>;

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
    query.page = query.page ? query.page : 1;
    query.size = query.size ? query.size : 10;
    let order = {};
    if (query.sort) {
      order[query.sort] = 'DESC';
    }
    const data: VideoEntity[] = await this.videoEntity.find({
      order: {
        ...order,
      },
      //且video_class字段有值
      skip: query.page * (query.page - 1),
      take: query.size,
    });
    return { list: data, pagination: { page: query.page, size: query.size } };
  }

  async week(query: any): Promise<any> {
    let { list } = await this.videoWeekPage(query);
    return await this.videoWeekVideoPage(list, query);
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
  ): Promise<void> {
    try {
      // 插入数据
      const data = await this.videoEntity.upsert(videoEntity, ['title']);
      videoEntity.id = data.raw.insertId;
      // 显式释放对象引用
      await this.VideoLineService.insert(videoEntity, collectionEntity);
      collectionEntity = null;
      videoEntity = null;
    } catch (error) {
      // 更新数据
      const data = await this.videoEntity.update(
        { title: videoEntity.title },
        videoEntity
      );
      videoEntity.id = data.raw.insertId;
      if (videoEntity.id) {
        // 显式释放对象引用
        await this.VideoLineService.insert(videoEntity, collectionEntity);
      }
      collectionEntity = null;
      videoEntity = null;
    }
  }
}
