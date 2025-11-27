import { BaseController, CoolController } from '@cool-midway/core';
import { VideoLineEntity } from '../../entity/video_line';

/**
 *
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: VideoLineEntity,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.admin.userId,
    };
  },
  pageQueryOp: {
    keyWordLikeFields: ['video_name','collection_name'],
    fieldEq: [
      'tag',
      'site_id',
      'player_id',
      'video_id',
      'video_name',
      'collection_name',
      'collection_id',
    ],
    addOrderBy: {
      sort: 'desc',
    },
  },
})
export class AdminVideoLineController extends BaseController {}
