import { BaseController, CoolController } from '@cool-midway/core';
import { MemberEntity } from '../../entity/member';

/**
 * 用户信息
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: MemberEntity,
  pageQueryOp: {}
})
export class AdminUserMemberController extends BaseController {
}
