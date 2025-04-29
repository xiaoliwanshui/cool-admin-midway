import {
  CoolController,
  BaseController,
  CoolUrlTag,
  TagTypes,
} from '@cool-midway/core';
import { CloudDiskEntity } from '../../entity/cloudDisk';
import { AlbumCloudDiskEntity } from '../../entity/album_cloudDisk';

/**
 * 相册-专辑
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: AlbumCloudDiskEntity,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.admin.userId,
    };
  },
  pageQueryOp: {
    fieldEq: ['albumId', 'cloudDiskId'],
    select: [
      'a.*',
      'b.title',
      'b.author',
      'b.image',
      'b.tags',
      'b.status',
      'b.content',
      'b.link',
      'b.type',
    ],
    join: [
      {
        entity: CloudDiskEntity,
        alias: 'b',
        condition: 'a.cloudDiskId = b.id',
        type: 'innerJoin',
      },
    ],
  },
})
export class AdminAlbumsCloudDiskController extends BaseController {}
