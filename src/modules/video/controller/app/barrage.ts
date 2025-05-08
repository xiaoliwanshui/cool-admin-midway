import {
  BaseController,
  CoolController,
  CoolTag,
  CoolUrlTag,
  TagTypes,
} from '@cool-midway/core';
import { BarrageEntity } from '../../entity/barrage';
import { Get } from '@midwayjs/core';

/**
 *
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: BarrageEntity,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.user.id,
    };
  },
  pageQueryOp: {
    fieldEq: ['type', 'video_id'],
  },
})
@CoolUrlTag({
  key: TagTypes.IGNORE_TOKEN,
  value: ['page', 'info', 'add'],
})
export class AppBarrageController extends BaseController {
  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Get('/other')
  async other() {
    return this.ok('hello, cool-admin!!!');
  }
}
