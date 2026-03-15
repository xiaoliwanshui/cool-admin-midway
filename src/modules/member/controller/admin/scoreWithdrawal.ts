import { BaseController, CoolController } from '@cool-midway/core';
import { ScoreWithdrawalEntity } from '../../entity/scoreWithdrawal';

/**
 * 积分提现管理控制器
 */
@CoolController({
  api: ['info', 'list', 'page', 'add', 'update', 'delete'],
  entity: ScoreWithdrawalEntity,
})
export class AdminScoreWithdrawalController extends BaseController {

}
