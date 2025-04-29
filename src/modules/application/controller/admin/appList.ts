import { BaseController, CoolController } from '@cool-midway/core';
import { AppListEntity } from '../../entity/appList';

/**
 * 商品
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: AppListEntity,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.admin.userId,
    };
  },
  pageQueryOp: {
    keyWordLikeFields: ['name'],
    fieldEq: ['appid', 'status'],
    addOrderBy: {
      sort: 'desc',
    },
  },
})
export class AdminAppListController extends BaseController {
  /**
   * 其他接口
   */
}
