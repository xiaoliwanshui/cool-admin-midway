import { BaseController, CoolController } from '@cool-midway/core';
import { VideoHostKeyWordEntity } from '../../entity/hot_keyword';

/**
 * 轮播图
 */
@CoolController({
  api: ['add', 'info', 'list', 'page', 'delete', 'update'],
  entity: VideoHostKeyWordEntity,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.admin.userId
    };
  },
  pageQueryOp: {
    keyWordLikeFields: ['keyWord'],
    fieldEq: ['category_id', 'tag'],
    addOrderBy: {
      sort: 'desc'
    }
  }
})
export class AdminHotKeyWordController extends BaseController {
}
