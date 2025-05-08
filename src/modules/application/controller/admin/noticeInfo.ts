import { BaseController, CoolController } from '@cool-midway/core';
import { NoticeInfoEntity } from '../../entity/noticeInfo';

/**
 * 通知信息
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: NoticeInfoEntity,
  pageQueryOp: {
    keyWordLikeFields: ['a.title'],
    fieldEq: ['type', 'status'],
  },
})
export class AdminNoticeInfoController extends BaseController {}
