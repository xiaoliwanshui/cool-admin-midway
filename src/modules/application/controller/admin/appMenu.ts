import { CoolController, BaseController } from '@cool-midway/core';
import { AppMenuEntity } from '../../entity/appMenu';

/**
 * 商品
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: AppMenuEntity,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.admin.userId,
    };
  },
  pageQueryOp: {
    keyWordLikeFields: ['name'],
    fieldEq: ['appid', 'type', 'status'],
    addOrderBy: {
      sort: 'desc',
    },
  },
})
export class AdminMenuController extends BaseController {
  /**
   * 其他接口
   */
}
