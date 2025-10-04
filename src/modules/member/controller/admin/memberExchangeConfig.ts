import { BaseController, CoolController } from '@cool-midway/core';
import { Body, Inject, Post } from '@midwayjs/core';
import { MemberExchangeConfigEntity } from '../../entity/memberExchangeConfig';

/**
 * 会员兑换配置管理控制器
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: MemberExchangeConfigEntity,
   insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.admin.userId
    };
  },
})



export class AdminUserMemberExchangeConfigController extends BaseController {

}