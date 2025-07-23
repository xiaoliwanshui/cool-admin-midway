import { BaseController, CoolController } from '@cool-midway/core';
import { UserLiveEntity } from '../../entity/live';

/**
 * 轮播图
 */
@CoolController({
  api: ['add', 'info', 'list', 'page', 'delete', 'update'],
  entity: UserLiveEntity,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.admin.userId,
    };
  },
  pageQueryOp: {
    keyWordLikeFields: ['title'],
    fieldEq: ['category_id', 'status'],
  },
})
export class AdminLiveController extends BaseController {}
