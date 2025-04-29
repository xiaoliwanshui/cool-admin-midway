import { BaseController, CoolController } from '@cool-midway/core';
import { AdsEntity } from '../../entity/ads';

/**
 *
 */

@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: AdsEntity,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.admin.userId,
    };
  },
  pageQueryOp: {
    fieldEq: ['ads_type', 'state'],
  },
})
export class AdminAdsController extends BaseController {}
