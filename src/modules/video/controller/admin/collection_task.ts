import { BaseController, CoolController } from '@cool-midway/core';
import { CollectionTaskTaskEntity } from '../../entity/collection_task';

/**
 *
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: CollectionTaskTaskEntity,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.admin.userId,
    };
  },
  pageQueryOp: {
    fieldEq: ['taskStatus', 'taskType'],
  },
})
export class AdminCollectionTaskTaskController extends BaseController {}
