import { ILogger, Inject, Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { VideoHostKeyWordEntity } from '../entity/hot_keyword';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { DictInfoService } from '../../dict/service/info';
import { DictInfoEntity } from '../../dict/entity/info';
@Provide()
export class HotKeywordService extends BaseService {
    @InjectEntityModel(VideoHostKeyWordEntity)
    videoHostKeyWordEntity: Repository<VideoHostKeyWordEntity>;

    @Inject()
    dictInfoService: DictInfoService;

    @Inject()
    logger: ILogger;

    async getVideoHotWords(): Promise<any> {
        //获取字典数据
        let videoCategoryEntityList: DictInfoEntity[] = (
          await this.dictInfoService.data(['video_category'])
        )['video_category'];
    
        let videoHotWordsList = [];
        for (const item of videoCategoryEntityList) {
          const video = await this.videoHostKeyWordEntity.find({
            where: {
              category_id: item.id,
            },
            take: 8,
            order: {
              sort: 'DESC',
            },
          });
          if(video.length > 0) {
            videoHotWordsList.push({
              ...item,
              list: video,
            });
          }
        }
    
        return {list: videoHotWordsList};
      }
}