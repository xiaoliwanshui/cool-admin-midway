import {
  BaseController,
  CoolController,
  CoolTag,
  TagTypes,
} from '@cool-midway/core';
import { CollectionEntity } from '../../entity/collection';
import { CollectionService } from '../../service/collection';
import { Body, Inject, Post } from '@midwayjs/core';

@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: CollectionEntity,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.admin.userId,
    };
  },
})
export class AdminCollectionController extends BaseController {
  @Inject()
  collectionService: CollectionService;

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/sync_category')
  async sort(@Body() body): Promise<unknown> {
    try {
      return this.ok(await this.collectionService.syncCategory(body));
    } catch (error) {
      return this.fail(error);
    }
  }

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/collection_day')
  async collection(@Body() body): Promise<unknown> {
    try {
      return this.ok({
        data: await this.collectionService.syncVideo(body),
      });
    } catch (error) {
      return this.fail(error);
    }
  }
}
