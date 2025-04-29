import {
  BaseController,
  CoolController,
  CoolUrlTag,
  TagTypes,
} from '@cool-midway/core';
import { ComicImageEntity } from '../../entity/image_comic';

/**
 *
 */

@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: ComicImageEntity,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.user.userId,
    };
  },
  pageQueryOp: {
    // 让title字段支持模糊查询
    keyWordLikeFields: ['name'],
    fieldEq: ['comicId', 'status', 'sequence'],
    addOrderBy: {
      sequence: 'asc',
    },
  },
})
@CoolUrlTag({
  key: TagTypes.IGNORE_TOKEN,
  value: ['page', 'info', 'add'],
})
export class AppImageComicController extends BaseController {}
