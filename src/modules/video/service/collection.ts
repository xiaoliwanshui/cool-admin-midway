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

  @InjectEntityModel(CollectionTaskTaskEntity)
  collectionTaskTaskEntity: Repository<CollectionTaskTaskEntity>;

  //采集资源
  async syncVideo(
    collectionEntity: CollectionEntity,
    params: VIDEOPARAMS
  ): Promise<any> {
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

      if (collectionEntity.data_method == 1) {
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
      }

      return videoParamsList;
    } catch (error) {
      this.logger.error(TAG, error);
      return error;
    }
  }
}
