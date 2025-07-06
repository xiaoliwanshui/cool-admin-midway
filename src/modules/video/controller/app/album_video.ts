import {
  BaseController,
  CoolController,
  CoolUrlTag,
  TagTypes,
} from '@cool-midway/core';
import { VideoAlbumRelationship } from '../../entity/video_album_relationship';
import { VideoEntity } from '../../entity/videos';

/**
 * 相册-专辑
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: VideoAlbumRelationship,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.user.id,
    };
  },
  pageQueryOp: {
    fieldEq: [
      { column: 'a.album_id', requestParam: 'album_id' },
      { column: 'a.videos_id', requestParam: 'videos_id' },
    ],
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
      'b.remarks',
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
      'b.video_class',
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
export class AppVideoAlbumRelationshipController extends BaseController {}
