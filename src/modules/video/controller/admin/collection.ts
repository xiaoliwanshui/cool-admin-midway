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
  service:CollectionService,
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
  @Post('/collection_day', { summary: '日更新' })
  async collection(
    @Body('params') params: any,
    @Body('collection') collection: any
  ): Promise<unknown> {
    try {
      return this.ok({
        data: await this.collectionService.syncVideo(collection, params),
      });
    } catch (error) {
      return this.fail(error);
    }
  }

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/collection_keyword', { summary: '根据关键字采集' })
  async keyWord(
    @Body('keyWord') keyWord: string[]
  ): Promise<unknown> {
    try {
      return this.ok({
        data: await this.collectionService.asyncKeyWord(keyWord),
      });
    } catch (error) {
      return this.fail(error);
    }
  }
}
