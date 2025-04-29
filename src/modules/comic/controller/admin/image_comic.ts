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
  pageQueryOp: {
    // 让title字段支持模糊查询
    keyWordLikeFields: ['name'],
    fieldEq: ['comicId', 'status'],
    addOrderBy: {
      sequence: 'asc',
    },
  },
})
@CoolUrlTag({
  key: TagTypes.IGNORE_TOKEN,
  value: ['page', 'info', 'add'],
})
export class AdminImageComicController extends BaseController {}
