import { BaseController, CoolController } from '@cool-midway/core';
import { CollectionCategoryEntity } from '../../entity/collection_category';

@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: CollectionCategoryEntity,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.admin.userId,
    };
  },
  pageQueryOp: {
    fieldEq: ['resource_id'],
  },
})
export class AdminCollectionCategoryController extends BaseController {}
