import {
  BaseController,
  CoolController,
  CoolTag,
  CoolUrlTag,
  TagTypes,
} from '@cool-midway/core';
import { ComicEntity } from '../../entity/comic';
import { ComicService } from '../../service/comic';
import { Body, Inject, Post } from '@midwayjs/core';

/**
 *
 */

@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: ComicEntity,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.user.id,
    };
  },
  pageQueryOp: {
    // 让title字段支持模糊查询
    keyWordLikeFields: ['name'],
    fieldEq: ['type', 'updateStatus', 'status', 'createUserId', 'author'],
  },
})
@CoolUrlTag({
  key: TagTypes.IGNORE_TOKEN,
  value: ['page', 'info', 'add'],
})
export class AppComicController extends BaseController {
  /**
   * 其他接口
   */
  @Inject()
  comicService: ComicService;

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/album')
  async album(@Body() body): Promise<unknown> {
    try {
      return this.ok(await this.comicService.page(body));
    } catch (error) {
      return this.fail(error);
    }
  }
}
