import {
  BaseController,
  CoolController,
  CoolUrlTag,
  TagTypes,
} from '@cool-midway/core';
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
      createUserId: ctx.user.userId,
    };
  },
  pageQueryOp: {
    // select: ['a.*', ' b.title', 'a.name as line_name'],
    fieldEq: [
      { column: 'a.video_id', requestParam: 'video_id' },
      { column: 'a.name', requestParam: 'name' },
    ],
    keyWordLikeFields: ['name'],
    // join: [
    //   {
    //     entity: VideoEntity,
    //     alias: 'b',
    //     condition: 'a.video_id = b.id',
    //     type: 'innerJoin',
    //   },
    //   {
    //     entity: CollectionEntity,
    //     alias: 'c',
    //     condition: 'a.tag = c.tags',
    //     type: 'innerJoin',
    //   },
    // ],
    addOrderBy: {
      sort: 'desc',
    },
  },
})
@CoolUrlTag({
  key: TagTypes.IGNORE_TOKEN,
  value: ['page', 'info'],
})
export class AppPlayLineController extends BaseController {}
