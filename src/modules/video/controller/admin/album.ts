import { BaseController, CoolController } from '@cool-midway/core';
import { AlbumEntity } from '../../entity/album';

/**
 *
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: AlbumEntity,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.admin.userId,
    };
  },
  pageQueryOp: {
    fieldEq: ['type', 'status'],
  },
})
export class AdminAlbumController extends BaseController {}
