import { CoolController, BaseController } from '@cool-midway/core';
import { InviteCodeEntity } from '../../entity/inviteCode';

/**
 * 邀请码管理
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: InviteCodeEntity,
  pageQueryOp: {
    fieldEq: ['a.status'],
    keyWordLikeFields: ['a.code', 'a.remark'],
  },
})
export class AdminInviteCodeController extends BaseController {}
