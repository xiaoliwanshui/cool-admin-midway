import {BaseController, CoolController} from '@cool-midway/core';
import {FeedbackInfoEntity} from "../../entity/feedbackInfo";

/**
 * 反馈信息
 */
@CoolController({
  api: ['page', 'info', 'delete', 'update', 'add'],
  entity: FeedbackInfoEntity,
  pageQueryOp: {
    keyWordLikeFields: ['feedbackType', 'videoName'],
  }
})
export class AdminFeedbackInfoController extends BaseController {
}
