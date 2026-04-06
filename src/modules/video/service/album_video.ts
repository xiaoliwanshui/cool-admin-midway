import { ILogger, Inject, Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { VideoEntity } from '../entity/videos';
import { In, Repository } from 'typeorm';
import { VideoAlbumRelationship } from '../entity/video_album_relationship';
import { VideoAlbumEntity } from '../entity/album';
import { AlbumQueryDTO } from '../dto/album';
import { AlbumResponse, AlbumVideoInfo } from '../dto/album_response';

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

  async album(query: AlbumQueryDTO): Promise<AlbumResponse> {
    let { list } = await this.videoAlbumEntityPage(query);
    const pagination = this.setPageDefault(query);
    return {
      list,
      pagination: {
        page: pagination.page || 1,
        size: pagination.size || 10,
        videoSize: pagination.videoSize || 4,
        videoPage: pagination.videoPage || 1,
      },
    };
  }

  setPageDefault(query: AlbumQueryDTO): AlbumQueryDTO {
    query.page = query.page ? query.page : 1;
    query.size = query.size ? query.size : 10;
    query.videoSize = query.videoSize ? query.videoSize : 4;
    query.videoPage = query.videoPage ? query.videoPage : 1;
    return query;
  }

  //查询albumEntity分页
  async videoAlbumEntityPage(
    query: AlbumQueryDTO
  ): Promise<{ list: AlbumVideoInfo[] }> {
    //给分页设置默认值
    query = this.setPageDefault(query);
    const data: VideoAlbumEntity[] = await this.albumEntity.find({
      where: {
        category_id: query.category_id instanceof Array ? In(query.category_id) : query.category_id,
      },
      order: {
        sort: 'DESC',
      },
      skip: (query.page - 1) * query.size,
      take: query.size,
    });
    if (!data.length) {
      return { list: [] };
    }
    return this.videoAlbumRelationshipPage(data, query);
  }

  async videoAlbumRelationshipPage(
    data: VideoAlbumEntity[],
    query: AlbumQueryDTO
  ): Promise<{
    list: AlbumVideoInfo[];
  }> {
    if (!data.length) {
      return { list: [] };
    }

    // 提取所有专辑ID
    const albumIds = data.map(item => item.id);

    // 一次性查询所有专辑的视频关系
    const allRelationships = await this.videoAlbumRelationship.find({
      where: { album_id: In(albumIds) },
      order: { sort: 'DESC' },
    });

    // 按专辑ID分组
    const relationshipsByAlbum: Record<number, typeof allRelationships> = {};
    for (const rel of allRelationships) {
      if (!relationshipsByAlbum[rel.album_id]) {
        relationshipsByAlbum[rel.album_id] = [];
      }
      relationshipsByAlbum[rel.album_id].push(rel);
    }

    // 提取分页后的视频ID
    const videoIds: number[] = [];
    const videoSkip = (query.videoPage - 1) * query.videoSize;
    for (const item of data) {
      const relationships = relationshipsByAlbum[item.id] || [];
      const paginated = relationships.slice(
        videoSkip,
        videoSkip + query.videoSize
      );
      // 将 bigint 转换为 number
      videoIds.push(...paginated.map(rel => Number(rel.videos_id)));
    }

    // 一次性查询所有视频
    const videoMap = new Map<number, VideoEntity>();
    if (videoIds.length) {
      const videos = await this.videoEntity.findBy({ id: In(videoIds) });
      for (const video of videos) {
        videoMap.set(video.id, video);
      }
    }

    // 组装数据
    for (const item of data) {
      const relationships = relationshipsByAlbum[item.id] || [];
      const paginated = relationships.slice(
        videoSkip,
        videoSkip + query.videoSize
      );
      (item as AlbumVideoInfo)['list'] = paginated
        .map(rel => videoMap.get(Number(rel.videos_id)))
        .filter((v): v is VideoEntity => !!v);
    }

    return { list: data as AlbumVideoInfo[] };
  }
}
