import { BaseController, CoolController } from '@cool-midway/core';
import { CloudDiskEntity } from '../../entity/cloudDisk';

/**
 * 云盘
 */
@CoolController({
  api: ['info', 'list', 'page', 'update', 'add'],
  entity: CloudDiskEntity,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.admin.userId,
    };
  },
  pageQueryOp: {
    // 让title字段支持模糊查询
    keyWordLikeFields: ['title'],
    fieldEq: ['type', 'status'],
  },
})
export class AdminCloudDiskController extends BaseController {}
