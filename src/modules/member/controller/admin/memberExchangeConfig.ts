import { BaseController, CoolController } from '@cool-midway/core';
import { Body, Inject, Post } from '@midwayjs/core';
import { MemberExchangeConfigEntity } from '../../entity/memberExchangeConfig';

/**
 * 会员兑换配置管理控制器
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: MemberExchangeConfigEntity,
})



export class AdminUserMemberExchangeConfigController extends BaseController {

}