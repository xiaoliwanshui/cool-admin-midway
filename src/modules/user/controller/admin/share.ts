import {
  BaseController,
  CoolController,
  CoolUrlTag,
  TagTypes,
} from '@cool-midway/core';
import { ShareEntity } from '../../entity/share';

/**
 * 分享控制器
 */
@CoolController({
  api: ['info', 'list', 'page', 'add', 'delete', 'update'],
  entity: ShareEntity,
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
export class AdminShareController extends BaseController {
  /**
   * 其他接口
   */
}
