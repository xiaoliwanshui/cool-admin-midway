import {
  BaseController,
  CoolController,
  CoolUrlTag,
  TagTypes,
} from '@cool-midway/core';
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
@CoolUrlTag({
  key: TagTypes.IGNORE_TOKEN,
  value: ['page', 'info'],
})
export class AppNoticeInfoController extends BaseController {}
