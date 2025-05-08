import { ILogger, Inject, Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { CollectionCategoryEntity } from '../entity/collection_category';
import axios from 'axios';
import { DictInfoService } from '../../dict/service/info';
import { DictInfoEntity } from '../../dict/entity/info';

const TAG = 'CategoryService';

@Provide()
export class CategoryService {
  @InjectEntityModel(CollectionCategoryEntity)
  collectionCategoryEntity: Repository<CollectionCategoryEntity>;

  @Inject()
  logger: ILogger;

  @Inject()
  dictInfoService: DictInfoService;

  /**
   * 同步分类
   */
  async syncCategory(query: any): Promise<any> {
    try {
      let list = [];
      const result: any = await axios.get(query.address);
      if (query.data_method == 1) {
        const savePromises = result.data.class.map(async item => {
          await this.saveCategory({
            parentId: item.type_pid,
            class_id: item.type_id,
            class_name: item.type_name,
            collection_id: query.id,
            collection_name: query.name,
          });
        });

        await Promise.all(savePromises);
        let data = await this.collectionCategoryEntity.findBy({
          collection_id: query.id,
        });
        list = this.updateParentId(data);
      } else {
      }
      return { list };
    } catch (error) {
      this.logger.error(TAG, error);
    }
  }

  updateParentId(data) {
    // 创建一个映射，用于快速查找 class_id 对应的记录
    const classIdMap = {};
    data.forEach(item => {
      classIdMap[item.class_id] = item;
    });

    // 遍历数据，更新 parentId
    data.forEach(item => {
      if (item.class_pid !== '0') {
        const parentClassId = parseInt(item.class_pid, 10); // 转换为数字
        const parentItem = classIdMap[parentClassId];
        if (parentItem) {
          item.parentId = parentItem.id;
        }
        this.collectionCategoryEntity.update(item.id, item);
      }
    });

    return data;
  }

  async saveCategory(category: any) {
    try {
      this.logger.info(TAG, category);
      const res = await this.collectionCategoryEntity.insert({
        class_id: category.class_id || category.type_id,
        class_name: category.class_name || category.type_name,
        class_pid: category.parentId,
        collection_id: category.collection_id,
        collection_name: category.collection_name,
      });
      return res;
    } catch (error) {
      this.logger.error(TAG, 'insert error data is has');
    }
  }

  //实现一个快速匹配分类的函数
  async matchCategory() {
    //先过滤出所有sys_category_id为空的数据
    const data = await this.collectionCategoryEntity.findBy({
      sys_category_id: null,
    });
    let videoCategoryEntityList: DictInfoEntity[] = (
      await this.dictInfoService.data(['video_category'])
    )['video_category'];
    //遍历data并判断data中的class_name是否和videoCategoryEntityList中的name相同，如果相同则更新sys_category_id为videoCategoryEntityList中的id
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < videoCategoryEntityList.length; j++) {
        if (data[i].class_name == videoCategoryEntityList[j].name) {
          await this.collectionCategoryEntity.update(data[i].id, {
            sys_category_id: videoCategoryEntityList[j].id,
          });
        }
      }
    }
  }
}
