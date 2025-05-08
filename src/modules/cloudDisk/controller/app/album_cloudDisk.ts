import {
  BaseController,
  CoolController,
  CoolUrlTag,
  TagTypes,
} from '@cool-midway/core';
import { CloudDiskEntity } from '../../entity/cloudDisk';
import { AlbumCloudDiskEntity } from '../../entity/album_cloudDisk';

@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: AlbumCloudDiskEntity,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.user.id,
    };
  },
  pageQueryOp: {
    fieldEq: ['albumId', 'resourceId'],
    select: [
      'a.*',
      'b.name',
      'b.poster',
      'b.introduction',
      'b.artist',
      'b.src',
    ],
    join: [
      {
        entity: CloudDiskEntity,
        alias: 'b',
        condition: 'a.resourceId = b.id',
        type: 'innerJoin',
      },
    ],
  },
})
@CoolUrlTag({
  key: TagTypes.IGNORE_TOKEN,
  value: ['page', 'info'],
})
export class AppAlbumsCloudDiskController extends BaseController {}
