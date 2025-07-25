import {
  BaseController,
  CoolController,
  CoolUrlTag,
  TagTypes,
} from '@cool-midway/core';
import { CollectEntity } from '../../entity/collect';

/**
 * 收藏控制器
 */
@CoolController({
  api: ['info', 'list', 'page', 'add', 'delete', 'update'],
  entity: CollectEntity,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.admin.userId,
    };
  },
  pageQueryOp: {
    keyWordLikeFields: ['name'],
    fieldEq: ['associationId', 'title', 'createUserId'],
  },
})
@CoolUrlTag({
  key: TagTypes.IGNORE_TOKEN,
  value: ['page', 'info'],
})
export class AdminCollectController extends BaseController {
  /**
   * 其他接口
   */
}
