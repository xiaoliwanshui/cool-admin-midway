import {BaseController, CoolController, CoolUrlTag, TagTypes,} from '@cool-midway/core';
import {PlayLineEntity} from '../../entity/play_line';

/**
 *
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: PlayLineEntity,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.user.id,
    };
  },
  pageQueryOp: {
    fieldEq: [
      'video_line_id',
      'video_id',
      'video_name',
      'collection_id',
      'collection_name',
    ],
    addOrderBy: {
      sort: 'asc',
    },
  },
})
@CoolUrlTag({
  key: TagTypes.IGNORE_TOKEN,
  value: ['page', 'info', 'update'],
})
export class AppPlayLineController extends BaseController {
}
