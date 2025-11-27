import { BaseController, CoolController } from '@cool-midway/core';
import { PlayLineEntity } from '../../entity/play_line';
import { PlayLineService } from '../../service/play_line';

/**
 *
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: PlayLineEntity,
  service: PlayLineService,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.admin.userId
    };
  },
  pageQueryOp: {
    
    fieldEq: [
      'video_line_id',
      'status',
      'video_id',
      'video_name',
      'collection_id',
      'collection_name'
    ],
    keyWordLikeFields: ['name','video_name','collection_name'],
    addOrderBy: {
      sort: 'desc'
    }
  }
})
export class AdminPlayLineController extends BaseController {
}
