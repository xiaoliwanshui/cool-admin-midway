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

  /**
   * 排序查询
   */
  async syncCategory(query: any): Promise<any> {
    const list = [];
    const result: any = await axios.get(query.address);
    console.log('query.data_method', query.data_method);
    if (query.data_method == 1) {
      const savePromises = result.data.class.map(async item => {
        const res = await this.categoryService.saveCategory(
          {
            class_id: item.type_id,
            class_name: item.type_name,
          },
          query.id
        );

        if (res) {
          list.push({
            class_id: item.type_id,
            class_name: item.type_name,
            create_at: Date.now(),
            update_at: Date.now(),
            resource_id: query.id,
          });
        }
      });

      await Promise.all(savePromises);
    } else {
    }

    return { list };
  }

  //采集资源
  async syncVideo(body: CollectionEntity): Promise<any> {
    try {
      const defaultParams = new VideoParams();
      defaultParams.setH(168);
      const result = await axios.get(
        body.address + '?' + defaultParams.getQueryString()
      );
      let videoParamsList: VideoParams[] = [];
      const pagecount: number = result.data.pagecount;
      const limit: number = result.data.limit;
      const total: number = result.data.total;
      if (body.data_method == 1) {
        for (let i = 1; i <= pagecount; i++) {
          const videoParams: VideoParams = new VideoParams();
          videoParams.setPg(i);
          videoParams.setPage(i);
          videoParams.setPs(limit);
          videoParams.setPagesize(limit);
          videoParams.setPagecount(pagecount);
          videoParams.setAc('detail');
          videoParams.setH(168);
          videoParams.setTotal(total);
          videoParamsList.push(videoParams);
          this.logger.info(
            TAG,
            ` videoParamsList size ${videoParamsList.length}`
          );
        }
        //将videoParamsList进行分批 每批最大100个
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
        await this.concurrencyService.syncVideoPageList(body, videoParamsArray);
      }

      return videoParamsList;
    } catch (error) {
      this.logger.error(TAG, error);
      return error;
    }
  }

  //请求分页
  async syncVideoPage(
    body: CollectionEntity,
    params: VideoParams
  ): Promise<any> {
    try {
      const result = await axios.get(
        body.address + '?' + params.getQueryString()
      );
      this.logger.info(TAG, `request page ${params.getPage()} finished`);
      return result.data;
    } catch (error) {
      this.logger.error(TAG, `request page ${params.getPage()} fail`);
      return error;
    }
  }

  // 查询
  async findClassId(id: number): Promise<any> {
    return await this.collectionCategoryEntity.findOneBy({ category_id: id });
  }
}
