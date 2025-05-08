import {
  BaseController,
  CoolController,
  CoolTag,
  CoolUrlTag,
  TagTypes,
} from '@cool-midway/core';
import { CloudDiskEntity } from '../../entity/cloudDisk';
import { CloudDiskService } from '../../service/cloudDisk';
import { Body, Inject, Post } from '@midwayjs/core';

@CoolController({
  api: ['info', 'list', 'page', 'update', 'add'],
  entity: CloudDiskEntity,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.user.id,
    };
  },
  pageQueryOp: {
    // 让title字段支持模糊查询
    keyWordLikeFields: ['title'],
    fieldEq: ['type', 'status'],
  },
})
@CoolUrlTag({
  key: TagTypes.IGNORE_TOKEN,
  value: ['page', 'info', 'add'],
})
export class ApCloudDiskController extends BaseController {
  /**
   * 其他接口
   */
  @Inject()
  cloudDiskService: CloudDiskService;

  /**
   * 其他接口
   */
  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/tag')
  async tagSelect(@Body() body): Promise<unknown> {
    try {
      return this.ok(await this.cloudDiskService.tagSelect(body));
    } catch (error) {
      return this.fail(error);
    }
  }

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/album')
  async album(@Body() body): Promise<unknown> {
    try {
      return this.ok(await this.cloudDiskService.page(body));
    } catch (error) {
      return this.fail(error);
    }
  }
}
