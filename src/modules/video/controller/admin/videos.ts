import { BaseController, CoolController, CoolTag, TagTypes } from '@cool-midway/core';
import { VideoEntity } from '../../entity/videos';
import { VideosService } from '../../service/videos';
import { Body,  Inject, Post } from '@midwayjs/core';

/**
 * 商品
 */
@CoolController({
  api: ['add', 'delete', 'info', 'list', 'page', 'update'],
  entity: VideoEntity,
  service: VideosService,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.admin.userId
    };
  },
  pageQueryOp: {
    keyWordLikeFields: ['title'],
    fieldEq: [
      'category_id',
      'year',
      'language',
      'region',
      'play_url_put_in',
      'category_pid',
      'searchRecommendType'
    ],
    addOrderBy: {
      updateTime: 'desc'
    }
  }
})
export class AdminVideoController extends BaseController {
  @Inject()
  videosService: VideosService;

  

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/sort', { summary: '排序' })
  async sort(@Body() body): Promise<unknown> {
    try {
      return this.ok(await this.videosService.sort(body));
    } catch (error) {
      return this.fail(error);
    }
  }

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/week', { summary: '周数据' })
  async week(@Body() body): Promise<unknown> {
    try {
      return this.ok(await this.videosService.week(body));
    } catch (error) {
      return this.fail(error);
    }
  }

    @CoolTag(TagTypes.IGNORE_TOKEN)
    @Post('/videoEntity',{summary:'获取视频字段信息'})
    async videoEntity(): Promise<unknown> {
      try {
        return this.ok(await this.videosService.getVideoEntityFields());
      } catch (error) {
        return this.fail(error);
      }
    }
}
