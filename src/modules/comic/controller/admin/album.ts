import { CoolController, BaseController } from '@cool-midway/core';
import { AlbumEntity } from '../../entity/album';

/**
 * 相册-专辑
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
    keyWordLikeFields: ['title'],
    fieldEq: ['status'],
  },
})
export class AdminComicAlbumsController extends BaseController {}
