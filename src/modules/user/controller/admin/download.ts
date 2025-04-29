import { BaseController, CoolController } from '@cool-midway/core';
import { DownloadEntity } from '../../entity/download';

/**
 *下载控制器
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: DownloadEntity,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.admin.userId,
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
export class AdminDownloadController extends BaseController {
  /**
   * 其他接口
   */
}
