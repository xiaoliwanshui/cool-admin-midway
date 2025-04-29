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
    fieldEq: ['video_id', 'tag', 'site_id', 'player_id'],
    addOrderBy: {
      sort: 'desc',
    },
  },
})
export class AdminVideoLineController extends BaseController {}
