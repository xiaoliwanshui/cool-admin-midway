import {CoolController, BaseController, CoolUrlTag, TagTypes} from '@cool-midway/core';
import {InviteRecordEntity} from '../../entity/inviteRecord';
import {UserInfoEntity} from "../../entity/info";

/**
 * 邀请记录管理
 */
@CoolController({
  api: ['info', 'list', 'page'],
  entity: InviteRecordEntity,
  pageQueryOp: {
    fieldEq: ['code'],
    select: [
      'a.*',
      'b.avatarUrl',
      'b.nickName',
      'b.phone',
      'b.gender'
    ],
    join: [
      {
        entity: UserInfoEntity,
        alias: 'b',
        condition: 'a.createUserId = b.id',
        type: 'innerJoin',
      },
    ],
  },
})

@CoolUrlTag({
  key: TagTypes.IGNORE_TOKEN,
  value: ['page', 'info'],
})
export class AppInviteRecordController extends BaseController {
}
