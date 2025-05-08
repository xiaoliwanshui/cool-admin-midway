import { BaseController, CoolController } from '@cool-midway/core';
import { VideoSwiperEntity } from '../../entity/swiper';

/**
 * 轮播图
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: VideoSwiperEntity,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.admin.userId,
    };
  },
  pageQueryOp: {
    keyWordLikeFields: ['title'],
    fieldEq: ['status', 'category'],
    addOrderBy: {
      createTime: 'desc',
    },
  },
})
export class AdminVideoSwiperController extends BaseController {
  /**
   * 其他接口
   */
}
