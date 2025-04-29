import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { VideoEntity } from '../entity/videos';
import { AlbumEntity } from '../entity/album';
import { VideoAlbum } from '../entity/album_video';
import { VideoWeekEntity } from '../entity/week_video';
import { WeekEntity } from '../entity/week';
import { VideoLineEntity } from '../entity/video_line';
import { ILogger, Inject, Provide } from '@midwayjs/core';
import { VideoBean } from '../bean/VideoBean';

const TAG = 'VideosService';

@Provide()
export class VideosService extends BaseService {
  @InjectEntityModel(VideoEntity)
  videoEntity: Repository<VideoEntity>;

  @InjectEntityModel(AlbumEntity)
  albumEntity: Repository<AlbumEntity>;

  @InjectEntityModel(VideoAlbum)
  videoAlbum: Repository<VideoAlbum>;

  @InjectEntityModel(WeekEntity)
  weekEntity: Repository<WeekEntity>;

  @InjectEntityModel(VideoWeekEntity)
  videoWeekEntity: Repository<VideoWeekEntity>;

  @InjectEntityModel(VideoLineEntity)
  videoLineEntity: Repository<VideoLineEntity>;

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
    if (query.type) {
      find.where('type= :type', query).orderBy('sort', 'ASC');
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
  async insertList(data: Array<VideoEntity>): Promise<void> {
    this.logger.info(TAG, '插入数据', JSON.stringify(data));
    await this.videoEntity.save(data);
  }

  //过滤视频如果没有就返回原视频如果有就不返回
  async filterVideo(data: VideoBean): Promise<Object | null> {
    try {
      this.logger.info(TAG, `准备插入 ${data.getTitle()}`);
      const has = await this.videoEntity.findOneBy({
        title: data.getTitle(),
        collection_id: data.getCollectionId(),
      });
      if (has) {
        this.logger.info(TAG, '过滤视频', data.getTitle());
        return null;
      } else {
        //将data转成object
        this.logger.info(TAG, '没有过滤视频', data.getTitle());
        return Object.assign({}, data);
      }
    } catch (error) {
      this.logger.error(TAG, '报错了', error);
      return null;
    }
  }
}
