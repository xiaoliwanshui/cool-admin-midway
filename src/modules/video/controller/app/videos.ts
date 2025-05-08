import {
  BaseController,
  CoolController,
  CoolTag,
  CoolUrlTag,
  TagTypes,
} from '@cool-midway/core';
import { VideoEntity } from '../../entity/videos';

import { VideosService } from '../../service/videos';
import { Body, Inject, Post } from '@midwayjs/core';

/**
 * 商品
 */

@CoolController({
  api: ['add', 'delete', 'info', 'list', 'page', 'update'],
  entity: VideoEntity,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.user.id,
    };
  },
  pageQueryOp: {
    keyWordLikeFields: ['title'],
    fieldEq: ['category_id', 'cycle', 'year', 'language', 'region'],
    addOrderBy: {
      updateTime: 'desc',
    },
  },
})
@CoolUrlTag({
  key: TagTypes.IGNORE_TOKEN,
  value: ['page', 'info', 'update'],
})
export class AppVideoController extends BaseController {
  @Inject()
  videosService: VideosService;

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/sort')
  async sort(@Body() body): Promise<unknown> {
    try {
      return this.ok(await this.videosService.sort(body));
    } catch (error) {
      return this.fail(error);
    }
  }

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/album')
  async album(@Body() body): Promise<unknown> {
    try {
      return this.ok(await this.videosService.album(body));
    } catch (error) {
      return this.fail(error);
    }
  }

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/week')
  async week(@Body() body): Promise<unknown> {
    try {
      return this.ok(await this.videosService.week(body));
    } catch (error) {
      return this.fail(error);
    }
  }
}
