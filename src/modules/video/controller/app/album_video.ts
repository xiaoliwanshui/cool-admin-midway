import {
  BaseController,
  CoolController,
  CoolUrlTag,
  TagTypes,
} from '@cool-midway/core';
import { VideoAlbum } from '../../entity/album_video';
import { VideoEntity } from '../../entity/videos';

/**
 * 相册-专辑
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: VideoAlbum,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.user.id,
    };
  },
  pageQueryOp: {
    // fieldEq: ['album_id', 'videos_id'],
    fieldEq: [
      { column: 'a.album_id', requestParam: 'album_id' },
      { column: 'a.videos_id', requestParam: 'videos_id' },
    ],
    select: [
      'a.*',
      ' b.title',
      'b.category_id',
      ' b.surface_plot',
      ' b.recommend',
      'b.cycle',
      'b.cycle_img',
      'b.charging_mode',
      'b.buy_mode',
      'b.gold',
      'b.directors',
      'b.actors',
      'b.imdb_score',
      'b.imdb_score_id',
      'b.douban_score',
      'b.douban_score_id',
      'b.introduce',
      'b.label',
      'b.language',
      'b.region',
      'b.note',
      'b.duration',
      'b.serial_number',
      'b.year',
      'b.alias',
      'b.status',
      'b.popularity_sum',
      'b.popularity_day',
      'b.popularity_month',
      'b.popularity_week',
      'b.release_at',
      'b.shelf_at',
      'b.screenshot',
      'b.play_url',
      'b.play_url_put_in',
      'b.trailer_time',
      'b.unit',
      'b.number',
      'b.total',
      'b.horizontal_poster',
      'b.vertical_poster',
      'b.gif',
    ],
    join: [
      {
        entity: VideoEntity,
        alias: 'b',
        condition: 'a.videos_id = b.id',
        type: 'innerJoin',
      },
    ],
  },
})
@CoolUrlTag({
  key: TagTypes.IGNORE_TOKEN,
  value: ['page', 'info'],
})
export class AppAlbumsVideoController extends BaseController {}
