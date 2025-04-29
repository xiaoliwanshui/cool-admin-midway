import {
  BaseController,
  CoolController,
  CoolUrlTag,
  TagTypes,
} from '@cool-midway/core';
import { ShareEntity } from '../../entity/share';

/**
 * 商品
 */

@CoolController({
  api: ['info', 'list', 'page', 'add', 'delete'],
  entity: ShareEntity,
  insertParam: ctx => {
    console.log(ctx.user);
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.user.id,
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
export class AppShareController extends BaseController {
  /**
   * 其他接口
   */
}
