import { BaseController, CoolController } from '@cool-midway/core';
import { VideoAlbumEntity } from '../../entity/album';

/**
 *
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: VideoAlbumEntity,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.admin.userId,
    };
  },
  pageQueryOp: {
    fieldEq: ['category_id', 'status'],
    keyWordLikeFields: ['title'],
    addOrderBy: {
      sort: 'desc',
    },
  },
})
export class AdminAlbumController extends BaseController {}
