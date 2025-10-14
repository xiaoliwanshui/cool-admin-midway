import {
  BaseController,
  CoolController,
} from '@cool-midway/core';
import { VideoRulesEntity } from '../../entity/video_rules';
import { CollectionEntity } from '../../entity/collection';

/**
 *
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: VideoRulesEntity,
    pageQueryOp: {
      select: [
        'a.*',
        'b.name as collection_name'
      ],
      join: [
        {
          entity: CollectionEntity,
          alias: 'b',
          condition: 'a.collection_id = b.id',
          type: 'innerJoin'
        }
      ]
    },
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
     createUserId: ctx.admin.userId,
    };
  },
})

export class AdminVideoRulesController extends BaseController {}
