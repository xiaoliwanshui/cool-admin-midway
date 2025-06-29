import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { ILogger, Inject, Provide } from '@midwayjs/core';
import axios from 'axios';
import { CollectionEntity } from '../entity/collection';
import { CollectionCategoryEntity } from '../entity/collection_category';
import { VIDEOPARAMS, VideoParams } from '../bean/VideoParams';
import { ConcurrencyService } from '../service/concurrencyService';
import { CategoryService } from '../service/categoryService';
import { CollectionTaskTaskEntity } from '../entity/collection_task';
import { VideoEntity } from '../entity/videos';
import { VideoLineService } from './videoLine';

const TAG = 'CollectionService';

@Provide()
export class CollectionService extends BaseService {
  @InjectEntityModel(CollectionEntity)
  collectionEntity: Repository<CollectionEntity>;
  @InjectEntityModel(CollectionCategoryEntity)
  collectionCategoryEntity: Repository<CollectionCategoryEntity>;
  @Inject()
  logger: ILogger;
  @Inject()
  concurrencyService: ConcurrencyService;
  @Inject()
  categoryService: CategoryService;
  @InjectEntityModel(VideoEntity)
  videoEntity: Repository<VideoEntity>;
  @Inject()
  VideoLineService: VideoLineService;

  @InjectEntityModel(CollectionTaskTaskEntity)
  collectionTaskTaskEntity: Repository<CollectionTaskTaskEntity>;

  /**
   * 处理按天同步视频的业务逻辑
   *
   * @param id - 集合实体的唯一标识符
   *
   * 此方法会根据提供的集合ID查找对应的集合实体，
   * 然后调用syncVideo方法，并传入操作类型'day'和小时数24。
   */
  async day(id: number) {
    const collectionEntity = await this.collectionEntity.findOneBy({ id });
    await this.syncVideo(collectionEntity, {
      op: 'day',
      h: 24,
    });
  }

  async week(id: number) {
    const collectionEntity = await this.collectionEntity.findOneBy({ id });
    await this.syncVideo(collectionEntity, {
      op: 'week',
      h: 24 * 7,
    });
  }

  async checkVideoLine() {
    const find = this.videoEntity.createQueryBuilder();
    find.where('play_url_put_in = :play_url_put_in', { play_url_put_in: 0 });
    const data = await this.entityRenderPage(find, { page: 1, size: 10 });
    for (const videoEntity of data.list) {
      let collectionEntity = await this.collectionEntity.findOneBy({
        id: videoEntity.collection_id,
      });
      await this.VideoLineService.insert(videoEntity, collectionEntity);
    }
    //循环videoEntityList 根据
  }

  //采集资源
  async syncVideo(
    collectionEntity: CollectionEntity,
    params: VIDEOPARAMS
  ): Promise<void> {
    try {
      let defaultParams = new VideoParams();
      let result = await axios.get(
        collectionEntity.address + '?' + defaultParams.getQueryString()
      );
      defaultParams = null; // 显式释放引用

      let videoParamsList: VideoParams[] = [];
      const pagecount: number = result.data.pagecount;
      const limit: number = result.data.limit;
      const total: number = result.data.total;
      result = null; // 显式释放引用
      let page = 0;
      let op = 'all';
      let h = 0;
      if (params) {
        if (params.page) {
          page = params.page;
        }
        if (params.op) {
          op = params.op;
          h = params.h;
        }
      }

      for (page; page <= pagecount; page++) {
        let videoParams: VideoParams = new VideoParams();
        videoParams.setPg(page);
        videoParams.setPage(page);
        videoParams.setPs(limit);
        videoParams.setPagesize(limit);
        videoParams.setPagecount(pagecount);
        videoParams.setAc('detail');
        videoParams.setOp(op);
        if (h) {
          videoParams.setH(h);
        }
        videoParams.setTotal(total);
        videoParamsList.push(videoParams);
        videoParams = null; // 显式释放引用
      }
      // 将 videoParamsList 进行分批，每批最大 100 个
      let videoParamsArray: VideoParams[][] = [];
      videoParamsArray = videoParamsList.reduce((acc, cur) => {
        const last = acc[acc.length - 1];
        if (!last || last.length === 100) {
          acc.push([cur]);
        } else {
          last.push(cur);
        }
        return acc;
      }, []);

      await this.concurrencyService.syncVideoPageList(
        collectionEntity,
        videoParamsArray
      );
      videoParamsList = null; // 显式释放引用
      videoParamsArray = null; // 显式释放引用

      return null;
    } catch (error) {
      this.logger.error(TAG, error);
      return null;
    }
  }
}
