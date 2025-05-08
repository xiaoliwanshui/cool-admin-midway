import {
  BaseController,
  CoolController,
  CoolUrlTag,
  TagTypes,
} from '@cool-midway/core';
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
      createUserId: ctx.user.id,
    };
  },
  pageQueryOp: {
    keyWordLikeFields: ['title'],
    fieldEq: ['status', 'appid', 'type'],
    addOrderBy: {
      createTime: 'desc',
    },
  },
})
@CoolUrlTag({
  key: TagTypes.IGNORE_TOKEN,
  value: ['page', 'info'],
})
export class AppCloudDiskSwiperController extends BaseController {
  /**
   * 其他接口
   */
}
