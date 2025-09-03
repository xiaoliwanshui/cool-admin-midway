import { BaseController, CoolController } from '@cool-midway/core';
import { NoticeInfoEntity } from '../../entity/noticeInfo';

/**
 * 通知信息
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: NoticeInfoEntity,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.admin.userId
    };
  },
  pageQueryOp: {
    keyWordLikeFields: ['title'],
    fieldEq: ['type', 'status'],
    addOrderBy: {
      createTime: 'desc'
    }
  }
})
export class AdminNoticeInfoController extends BaseController {
}
