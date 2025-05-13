import {
  BaseController,
  CoolController,
  CoolUrlTag,
  TagTypes,
} from '@cool-midway/core';
import { ViewsEntity } from '../../entity/views';

/**
 * 浏览历史控制器
 */

@CoolController({
  api: ['info', 'list', 'page', 'delete'],
  entity: ViewsEntity,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.admin.userId,
    };
  },
  pageQueryOp: {
    keyWordLikeFields: ['title'],
    fieldEq: ['associationId', 'title', 'createUserId'],
  },
})
@CoolUrlTag({
  key: TagTypes.IGNORE_TOKEN,
  value: ['page', 'info'],
})
export class AdminViewsController extends BaseController {
  /**
   * 其他接口
   */
}
