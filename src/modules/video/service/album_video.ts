import { ILogger, Inject, Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { VideoEntity } from '../entity/videos';
import { In, Repository } from 'typeorm';
import { VideoAlbumRelationship } from '../entity/video_album_relationship';
import { VideoAlbumEntity } from '../entity/album';

const TAG = 'AlbumVideoServer';

@Provide()
export class AlbumVideoServer {
  @InjectEntityModel(VideoEntity)
  videoEntity: Repository<VideoEntity>;

  @InjectEntityModel(VideoAlbumRelationship)
  videoAlbumRelationship: Repository<VideoAlbumRelationship>;

  @InjectEntityModel(VideoAlbumEntity)
  albumEntity: Repository<VideoAlbumEntity>;

  @Inject()
  logger: ILogger;

  //批量添加专辑内容
  async insertAlbumVideo(id: number, title: [string]): Promise<any> {
    const list = await this.videoEntity.findBy({ title: In(title) });
    return await this.videoAlbumRelationship.save(
      list.map(item => {
        return {
          album_id: id,
          videos_id: item.id,
        };
      })
    );
  }

  async album(query: any): Promise<any> {
    let { list } = await this.videoAlbumEntityPage(query);
    return {
      list,
      pagination: this.setPageDefault(query),
    };
  }

  setPageDefault(query: any): any {
    query.page = query.page ? query.page : 1;
    query.size = query.size ? query.size : 10;
    query.videoSize = query.videoSize ? query.videoSize : 4;
    query.videoPage = query.videoPage ? query.videoPage : 1;
    return query;
  }

  //查询albumEntity分页
  async videoAlbumEntityPage(query: any): Promise<any> {
    //给分页设置默认值
    query = this.setPageDefault(query);
    const data: VideoAlbumEntity[] = await this.albumEntity.find({
      where: {
        category_id: query.category_id,
      },
      order: {
        sort: 'ASC',
      },
      skip: query.page * (query.page - 1),
      take: query.size,
    });
    if (!data.length) {
      return { list: data };
    }
    return this.videoAlbumRelationshipPage(data, query);
  }

  async videoAlbumRelationshipPage(data: Array<any>, query: any): Promise<any> {
    if (data.length) {
      for (const item of data) {
        let video = [];
        let data = await this.videoAlbumRelationship.find({
          where: { album_id: item.id },
          skip: query.videoPage * (query.videoPage - 1),
          take: query.videoSize,
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
    } else {
      data = [];
    }
    return { list: data };
  }
}
