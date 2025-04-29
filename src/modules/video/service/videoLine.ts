import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { VideoEntity } from '../entity/videos';
import { AlbumEntity } from '../entity/album';
import { VideoAlbum } from '../entity/album_video';
import { VideoWeekEntity } from '../entity/week_video';
import { WeekEntity } from '../entity/week';
import { VideoLineEntity } from '../entity/video_line';

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

  /**
   * 排序查询
   */
  async line(query: any): Promise<any> {
    //通过query.id查询videoLineEntity的数据
    const videoLineEntity = await this.videoLineEntity.findOne({
      where: {
        id: query.id,
      },
    });
    return videoLineEntity;
  }
}
