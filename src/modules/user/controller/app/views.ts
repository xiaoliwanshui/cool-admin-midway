import {
  BaseController,
  CoolController,
  CoolUrlTag,
  TagTypes,
} from '@cool-midway/core';
import { ViewsEntity } from '../../entity/views';
import { ViewsService } from '../../service/views';
import { Inject } from '@midwayjs/core';

/**
 * 商品
 */

@CoolController({
  api: ['info', 'list', 'page', 'add', 'delete'],
  entity: ViewsEntity,
  service: ViewsService,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.user.id,
    };
  },
  pageQueryOp: {
    keyWordLikeFields: ['name'],
    fieldEq: ['associationId', 'title', 'createUserId'],
  },
})
@CoolUrlTag({
  key: TagTypes.IGNORE_TOKEN,
  value: ['page', 'info'],
})
export class AppViewsController extends BaseController {
  @Inject()
  viewsService: ViewsService;
  /**
   * 其他接口
   */
}
