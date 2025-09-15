import { ILogger, Inject, Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { CollectionCategoryEntity } from '../entity/collection_category';
import axios from 'axios';
import { DictInfoService } from '../../dict/service/info';
import { DictInfoEntity } from '../../dict/entity/info';
import { NetworkErrorHandler } from './networkErrorHandler';

const TAG = 'CategoryService';

@Provide()
export class CategoryService {
  @InjectEntityModel(CollectionCategoryEntity)
  collectionCategoryEntity: Repository<CollectionCategoryEntity>;

  @Inject()
  logger: ILogger;

  @Inject()
  dictInfoService: DictInfoService;
  
  @Inject()
  networkErrorHandler: NetworkErrorHandler;

  /**
   * 同步分类
   *
   * @param query - 请求参数对象
   * @param query.address - 要同步的分类数据地址
   * @param query.data_method - 数据处理方法标识，1 表示启用分类保存逻辑
   * @param query.id - 集合 ID
   * @param query.name - 集合名称
   *
   * @returns 返回同步后的分类列表
   */
  async syncCategory(query: any): Promise<any> {
    try {
      let list = [];
      
      // 使用网络错误处理器进行请求
      this.logger.info(TAG, `开始同步分类: ${query.address}`);
      const result: any = await this.networkErrorHandler.requestWithRetry(
        {
          url: query.address,
          method: 'GET',
          ...this.networkErrorHandler.getCollectionAxiosConfig()
        },
        3, // 最大重试3次
        2000 // 初始延迟2秒
      );
      
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
      let data: CollectionCategoryEntity[] =
        await this.collectionCategoryEntity.findBy({
          collection_id: query.id,
        });
      list = this.updateParentId(data);

      return { list };
    } catch (error) {
      if (this.networkErrorHandler.isNetworkError(error)) {
        const errorDetails = this.networkErrorHandler.getNetworkErrorDetails(error);
        this.logger.error(TAG, `分类同步网络错误: ${errorDetails}`);
        
        if (this.networkErrorHandler.isDnsError(error)) {
          this.logger.warn(TAG, `分类同步DNS解析失败，请检查URL: ${query.address}`);
        }
      } else {
        this.logger.error(TAG, '分类同步失败:', error);
      }
      throw error;
    }
  }

  /**
   * 更新分类的父级 ID，将基于 class_pid 字段查找对应的父级记录，并将其主键 ID 赋值给 parentId 字段。
   *
   * @param data - 分类数据数组，包含当前所有分类信息
   * @returns 返回更新后的分类数据数组
   */
  updateParentId(data: CollectionCategoryEntity[]): CollectionCategoryEntity[] {
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

  /**
   * 保存分类信息到数据库
   *
   * @param category - 分类数据对象
   * @param category.class_id - 分类的唯一标识 ID
   * @param category.class_name - 分类名称
   * @param category.parentId - 父级分类的 ID
   * @param category.collection_id - 所属集合 ID
   * @param category.collection_name - 所属集合名称
   *
   * 如果传入的 category 中缺少 class_id 或 class_name，
   * 将尝试使用 type_id 和 type_name 字段作为替代值。
   */
  async saveCategory(category: any) {
    try {
      this.logger.info(TAG, category);
      await this.collectionCategoryEntity.insert({
        class_id: category.class_id || category.type_id,
        class_name: category.class_name || category.type_name,
        class_pid: category.parentId,
        collection_id: category.collection_id,
        collection_name: category.collection_name,
      });
    } catch (error) {
      this.logger.error(TAG, 'insert error data is has');
    }
  }

  /**
   * 快速匹配分类函数
   * 过滤出所有 sys_category_id 为空的记录，并与字典表中的 video_category 分类进行匹配。
   * 如果 CollectionCategoryEntity 的 class_name 与 DictInfoEntity 的 name 相同，
   * 则将对应的 sys_category_id 更新为字典表中分类的 id。
   */
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
