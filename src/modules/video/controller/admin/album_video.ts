import { BaseController, CoolController } from '@cool-midway/core';
import { VideoAlbumRelationship } from '../../entity/video_album_relationship';
import { VideoEntity } from '../../entity/videos';
import { Body, Inject, Post } from '@midwayjs/core';
import { AlbumVideoServer } from '../../service/album_video';

/**
 * 相册-专辑
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.admin.userId,
    };
  },
  entity: VideoAlbumRelationship,
  pageQueryOp: {
    // fieldEq: ['album_id', 'videos_id'],
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
export class AdminVideoAlbumRelationshipController extends BaseController {
  @Inject()
  albumVideoServer: AlbumVideoServer;

  @Post('/add_list', { summary: '批量添加专辑' })
  async insertAlbumVideo(
    @Body('id') id: number,
    @Body('titles') titles: [string]
  ): Promise<any> {
    return this.albumVideoServer.insertAlbumVideo(id, titles);
  }
}
