import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { VideoEntity } from '../entity/videos';
import { VideoLineEntity } from '../entity/video_line';
import { ILogger, Inject, Provide } from '@midwayjs/core';
import { CollectionEntity } from '../entity/collection';
import { Line } from '../bean/SourceVideo';
import { PlayLineService } from './play_line';

const TAG = 'VideoLineService';

@Provide()
export class VideoLineService extends BaseService {
  @InjectEntityModel(VideoLineEntity)
  videoLineEntity: Repository<VideoLineEntity>;
  @Inject()
  playLineService: PlayLineService;

  @Inject()
  logger: ILogger;

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

  parseVideoList(
    videoEntity: VideoEntity,
    collectionEntity: CollectionEntity,
    videoLineEntity: VideoLineEntity
  ): Array<Line> {
    try {
      // 使用 '#' 分割字符串，得到每一集的字符串
      const episodes = videoEntity.play_url.split('#');

      // 初始化结果数组
      const result: Array<Line> = [];

      // 遍历每一集的字符串
      episodes.forEach((episode, index) => {
        // 使用 '$' 分割字符串，分离出集数和 URL
        const [title, url] = episode.split('$');
        // 去除可能存在的多余空格
        const trimmedTitle = title?.trim();
        const trimmedUrl = url?.trim();

        // 如果集数和 URL 都存在，则添加到结果数组中
        if (trimmedTitle && trimmedUrl) {
          result.push({
            name: trimmedTitle,
            file: trimmedUrl,
            sub_title: trimmedTitle,
            video_id: videoEntity.id,
            tag: collectionEntity.param,
            sort: index,
            video_line_id: videoLineEntity.id,
          });
        }
      });
      return result;
    } catch (error) {
      this.logger.error(TAG, error);
      return [];
    }
  }

  async insert(
    videoEntity: VideoEntity,
    collectionEntity: CollectionEntity
  ): Promise<void> {
    try {
      // 插入或更新数据
      await this.videoLineEntity.insert({
        name: collectionEntity.name,
        tag: collectionEntity.param,
        video_id: videoEntity.id,
      });
      let result = await this.videoLineEntity.findOneBy({
        name: collectionEntity.name,
        tag: collectionEntity.param,
        video_id: videoEntity.id,
      });
      let parseVideoList = this.parseVideoList(
        videoEntity,
        collectionEntity,
        result
      );
      parseVideoList.forEach(item => {
        this.playLineService.insert(item);
      });
      this.logger.info(TAG, `insert ${videoEntity.title} success`);
      // 显式释放对象引用
      videoEntity = null;
      parseVideoList = null;
      result = null;
    } catch (error) {
      // 更新数据
      await this.videoLineEntity.update(
        { name: videoEntity.title, video_id: videoEntity.id },
        {
          name: collectionEntity.name,
          tag: collectionEntity.param,
          video_id: videoEntity.id,
        }
      );
      let result = await this.videoLineEntity.findOneBy({
        name: collectionEntity.name,
        tag: collectionEntity.param,
        video_id: videoEntity.id,
      });
      let parseVideoList = this.parseVideoList(
        videoEntity,
        collectionEntity,
        result
      );
      parseVideoList.forEach(item => {
        this.playLineService.insert(item);
      });
      this.logger.info(TAG, `update ${videoEntity.title} success`);
      // 显式释放对象引用
      videoEntity = null;
      parseVideoList = null;
      result = null;
    }
  }
}
