import { BaseController, CoolController, CoolTag, CoolUrlTag, TagTypes } from '@cool-midway/core';
import { Body, Get, Inject, Post, Query } from '@midwayjs/core';
import {Context} from '@midwayjs/koa';
import { VideoEntity } from '../../entity/videos';
import { VideosService } from '../../service/videos';


/**
 * 商品
 */

@CoolController({
  api: ['add', 'delete', 'info', 'list', 'page', 'update'],
  entity: VideoEntity,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.user.id
    };
  },
  pageQueryOp: {
    keyWordLikeFields: ['title','sub_title','directors','actors'],
    fieldEq: [
      'category_id',
      'cycle',
      'year',
      'language',
      'region',
      'category_pid',
      'searchRecommendType'
    ],
    where: ctx => {
      const { directors, actors, video_tag } = ctx.request.body;
      //获取请求头
      const { aldult } = ctx.request.headers;
      const where = [
        [
          'directors like :directors',
          { directors: `%${directors}%` },
          directors
        ],
        ['actors like :actors', { actors: `%${actors}%` }, actors],
        ['video_tag like :video_tag', { video_tag: `%${video_tag}%` }, video_tag]
      ];
      if (aldult === '0') {
        where.push(['category_pid != :category_pid', { category_pid: 643 }]);
      }
      return where;
    },
    addOrderBy: {
      year: 'desc'
    }
  }
})
@CoolUrlTag({
  key: TagTypes.IGNORE_TOKEN,
  value: ['page', 'info', 'update']
})
export class AppVideoController extends BaseController {
  @Inject()
  videosService: VideosService;

    @Inject()
  ctx: Context;

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
  @Post('/week')
  async week(@Body() body): Promise<unknown> {
    try {
      return this.ok(await this.videosService.week(body));
    } catch (error) {
      return this.fail(error);
    }
  }

  /**
   * 根据视频ID获取视频信息和线路资源
   * @param id 视频ID
   */
  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Get('/detail',{summary:'获取视频详情'})
  async detail(@Query('id') id: number): Promise<unknown> {
    try {
      const createUserId = this.ctx.state.user?.id;
      return this.ok(await this.videosService.getVideoDetail(id,createUserId));
    } catch (error) {
      return this.fail(error);
    }
  }

  /**
   * 获取视频VideoEntity字段信息
   */
  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Get('/videoEntity',{summary:'获取视频字段信息'})
  async videoEntity(): Promise<unknown> {
    try {
      return this.ok(await this.videosService.getVideoEntityFields());
    } catch (error) {
      return this.fail(error);
    }
  }

}