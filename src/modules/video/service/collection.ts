import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { ILogger, Inject, Provide } from '@midwayjs/core';
import axios from 'axios';
import { CollectionEntity } from '../entity/collection';
import { CollectionCategoryEntity } from '../entity/collection_category';
import { VideoParams } from '../bean/VideoParams';
import { ConcurrencyService } from '../service/concurrencyService';
import { CategoryService } from '../service/categoryService';

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

  //采集资源
  async syncVideo(collectionEntity: CollectionEntity): Promise<any> {
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

      if (collectionEntity.data_method == 1) {
        for (let i = 1; i <= pagecount; i++) {
          let videoParams: VideoParams = new VideoParams();
          videoParams.setPg(i);
          videoParams.setPage(i);
          videoParams.setPs(limit);
          videoParams.setPagesize(limit);
          videoParams.setPagecount(pagecount);
          videoParams.setAc('detail');
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
