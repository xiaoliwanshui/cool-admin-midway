import { CoolController, BaseController } from '@cool-midway/core';
import { AlbumComicEntity } from '../../entity/album_comic';
import { ComicEntity } from '../../entity/comic';

/**
 * 相册-专辑
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: AlbumComicEntity,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.admin.userId,
    };
  },
  pageQueryOp: {
    fieldEq: ['albumId', 'comicId'],
    select: [
      'a.*',
      'b.name',
      'b.coverImg',
      'b.tags',
      'b.score',
      'b.description',
      'b.status',
      'b.chapter',
      'b.publishingDate',
      'b.publishingHouse',
      'b.buyoutPrice',
      'b.buyoutStatus',
      'b.volume',
      'b.collect',
      'b.page',
      'b.language',
      'b.type',
      'b.updateStatus',
      'b.popularity',
    ],
    join: [
      {
        entity: ComicEntity,
        alias: 'b',
        condition: 'a.comicId = b.id',
        type: 'innerJoin',
      },
    ],
  },
})
export class AdminAlbumsComicController extends BaseController {}
