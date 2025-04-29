import {
  CoolController,
  BaseController,
  CoolUrlTag,
  TagTypes,
} from '@cool-midway/core';
import { ViewsEntity } from '../../entity/views';

/**
 * 商品
 */

@CoolController({
  api: ['info', 'list', 'page', 'add', 'delete'],
  entity: ViewsEntity,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.user.userId,
    };
  },
  pageQueryOp: {
    keyWordLikeFields: ['name'],
    fieldEq: ['associationId', 'title', 'createUserId'],
  },
})
@CoolUrlTag({
  key: TagTypes.IGNORE_TOKEN,
  value: ['page', 'info', 'add'],
})
export class AppViewsController extends BaseController {
  /**
   * 其他接口
   */
}
