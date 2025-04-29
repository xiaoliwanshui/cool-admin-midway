import {
  BaseController,
  CoolController,
  CoolUrlTag,
  TagTypes,
} from '@cool-midway/core';
import { AppMenuEntity } from '../../entity/appMenu';

/**
 * 商品
 */
@CoolController({
  api: ['info', 'list', 'page'],
  entity: AppMenuEntity,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.user.userId,
    };
  },
  pageQueryOp: {
    keyWordLikeFields: ['name'],
    fieldEq: ['appid', 'type', 'status'],
  },
})
@CoolUrlTag({
  key: TagTypes.IGNORE_TOKEN,
  value: ['page', 'info'],
})
export class AppMenuController extends BaseController {
  /**
   * 其他接口
   */
}
