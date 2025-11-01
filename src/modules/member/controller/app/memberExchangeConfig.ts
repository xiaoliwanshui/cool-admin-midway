import { BaseController, CoolController, CoolUrlTag, TagTypes } from '@cool-midway/core';
import { MemberExchangeConfigEntity } from '../../entity/memberExchangeConfig';

/**
 * 会员兑换配置应用控制器
 */
/**
 * 会员兑换配置管理控制器
 */
@CoolController({
  api: [ 'info', 'list', 'page'],
  entity: MemberExchangeConfigEntity,
})

@CoolUrlTag({
  key: TagTypes.IGNORE_TOKEN,
  value: ['page', 'info'],
})
export class AppUserMemberExchangeConfigController extends BaseController {
}
