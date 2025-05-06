import { ILogger, Inject, Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { CollectionCategoryEntity } from '../entity/collection_category';
import axios from 'axios';

const TAG = 'CategoryService';

@Provide()
export class CategoryService {
  @InjectEntityModel(CollectionCategoryEntity)
  collectionCategoryEntity: Repository<CollectionCategoryEntity>;

  @Inject()
  logger: ILogger;

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
            resource_id: query.id,
          });
        });

        await Promise.all(savePromises);
        let data = await this.collectionCategoryEntity.findBy({
          resource_id: query.id,
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
      const res = await this.collectionCategoryEntity.insert({
        class_id: category.class_id || category.type_id,
        class_name: category.class_name || category.type_name,
        class_pid: category.parentId,
        resource_id: category.resource_id,
      });
      return res;
    } catch (error) {
      this.logger.error(TAG, 'insert error data is has');
    }
  }
}
