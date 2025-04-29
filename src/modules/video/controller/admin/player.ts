import { BaseController, CoolController } from '@cool-midway/core';
import { PlayerEntity } from '../../entity/player';

/**
 *
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: PlayerEntity,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.admin.userId,
    };
  },
  pageQueryOp: {},
})
export class AdminPlayerController extends BaseController {}
