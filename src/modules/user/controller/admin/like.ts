import {
  BaseController,
  CoolController,
  CoolUrlTag,
  TagTypes,
} from '@cool-midway/core';
import { LikeEntity } from '../../entity/like';

/**
 * 喜欢控制器
 */
@CoolController({
  api: ['info', 'list', 'page', 'add', 'delete', 'update'],
  entity: LikeEntity,
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
export class AdminLikeController extends BaseController {
  /**
   * 其他接口
   */
}
