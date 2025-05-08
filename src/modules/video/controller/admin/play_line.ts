import { BaseController, CoolController } from '@cool-midway/core';
import { PlayLineEntity } from '../../entity/play_line';

/**
 *
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: PlayLineEntity,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.admin.userId,
    };
  },
  pageQueryOp: {
    fieldEq: ['video_line_id', 'video_id', 'collection_id'],
    keyWordLikeFields: ['name'],
    addOrderBy: {
      sort: 'desc',
    },
  },
})
export class AdminPlayLineController extends BaseController {}
