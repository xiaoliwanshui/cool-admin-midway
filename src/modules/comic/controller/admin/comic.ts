import { BaseController, CoolController } from '@cool-midway/core';
import { ComicEntity } from '../../entity/comic';

@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: ComicEntity,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.admin.userId,
    };
  },
  pageQueryOp: {
    // 让title字段支持模糊查询
    keyWordLikeFields: ['name'],
    fieldEq: ['type', 'updateStatus', 'status', 'createUserId', 'author'],
  },
})
export class AdminComicController extends BaseController {
  /**
   * 其他接口
   */
}
