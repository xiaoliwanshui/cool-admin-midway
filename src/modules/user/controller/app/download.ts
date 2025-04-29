import {
  BaseController,
  CoolController,
  CoolUrlTag,
  TagTypes,
} from '@cool-midway/core';
import { DownloadEntity } from '../../entity/download';

/**
 * 轮播图
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: DownloadEntity,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.user.userId,
    };
  },
  pageQueryOp: {
    addOrderBy: {
      createTime: 'desc',
    },
    keyWordLikeFields: ['associationId', 'appid'],
    fieldEq: ['associationId', 'appid'],
  },
})
@CoolUrlTag({
  key: TagTypes.IGNORE_TOKEN,
  value: ['page', 'info', 'add'],
})
export class AppDownloadController extends BaseController {
  /**
   * 其他接口
   */
}
