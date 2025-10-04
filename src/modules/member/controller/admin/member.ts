import { BaseController, CoolController } from '@cool-midway/core';
import { MemberEntity } from '../../entity/member';

/**
 *
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: MemberEntity,
   insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.admin.userId
    };
  },
  pageQueryOp: {}
})
export class AdminUserMemberController extends BaseController {
}
