import { BaseController, CoolController, CoolUrlTag, TagTypes } from '@cool-midway/core';
import { NoticeInfoEntity } from '../../entity/noticeInfo';

/**
 * 通知信息
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: NoticeInfoEntity,
  pageQueryOp: {
    keyWordLikeFields: ['title'],
    fieldEq: ['type', 'status'],
    addOrderBy: {
      createTime: 'desc'
    }
  }
})
@CoolUrlTag({
  key: TagTypes.IGNORE_TOKEN,
  value: ['page', 'info']
})
export class AppNoticeInfoController extends BaseController {
}
