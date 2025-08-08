import { BaseController, CoolController } from '@cool-midway/core';
import { WeekEntity } from '../../entity/week';
import { VideoEntity } from '../../entity/videos';

/**
 *
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: WeekEntity,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.admin.userId
    };
  },
  pageQueryOp: {
    fieldEq: ['week'],
    select: [
      'a.*',
      'b.title',
      'b.category_id',
      'b.category_pid',
      'b.surface_plot',
      'b.cycle',
      'b.cycle_img',
      'b.directors',
      'b.actors',
      'b.imdb_score',
      'b.imdb_score_id',
      'b.douban_score',
      'b.douban_score_id',
      'b.introduce',
      'b.popularity',
      'b.popularity_day',
      'b.popularity_week',
      'b.popularity_month',
      'b.popularity_sum',
      'b.note',
      'b.year',
      'b.status',
      'b.duration',
      'b.region',
      'b.language',
      'b.number',
      'b.total',
      'b.horizontal_poster',
      'b.vertical_poster',
      'b.publish',
      'b.pubdate',
      'b.serial_number',
      'b.screenshot',
      'b.end',
      'b.unit',
      'b.play_url',
      'b.play_url_put_in',
      'b.collection_id',
      'b.up',
      'b.down',
      'b.collection_name',
      'b.sub_title',
      'b.video_tag',
      'b.video_class'
    ],
    join: [
      {
        entity: VideoEntity,
        alias: 'b',
        condition: 'a.videoId = b.id',
        type: 'innerJoin'
      }
    ]
  }
})
export class AdminWeekController extends BaseController {
}
