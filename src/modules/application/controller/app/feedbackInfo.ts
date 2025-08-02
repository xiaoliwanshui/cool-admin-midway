import {BaseController, CoolController} from '@cool-midway/core';
import {FeedbackInfoEntity} from "../../entity/feedbackInfo";

/**
 * 反馈信息
 */
@CoolController({
  api: ['page', 'info', 'delete', 'update', 'add'],
  entity: FeedbackInfoEntity,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.user.id,
    };
  },
  pageQueryOp: {
    keyWordLikeFields: ['feedbackType', 'videoName'],
  }
})
export class AppFeedbackInfoController extends BaseController {
}
