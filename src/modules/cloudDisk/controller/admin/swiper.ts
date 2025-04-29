import { CoolController, BaseController } from '@cool-midway/core';
import { CloudDiskSwiperEntity } from '../../entity/swiper';

/**
 * 轮播图
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: CloudDiskSwiperEntity,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.admin.userId,
    };
  },
  pageQueryOp: {
    keyWordLikeFields: ['title'],
    fieldEq: ['status', 'type', 'appid'],
    addOrderBy: {
      createTime: 'desc',
    },
  },
})
export class AdminCloudDiskSwiperController extends BaseController {
  /**
   * 其他接口
   */
}
