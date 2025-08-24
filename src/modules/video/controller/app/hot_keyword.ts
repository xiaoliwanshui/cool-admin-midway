import { BaseController, CoolController, CoolUrlTag, TagTypes } from '@cool-midway/core';
import { VideoHostKeyWordEntity } from '../../entity/hot_keyword';

/**
 * 轮播图
 */
@CoolController({
  api: ['add', 'info', 'list', 'page', 'delete', 'update'],
  entity: VideoHostKeyWordEntity,
  pageQueryOp: {
    keyWordLikeFields: ['keyWord'],
    fieldEq: ['category_id', 'tag'],
    addOrderBy: {
      sort: 'desc'
    }
  }
})

@CoolUrlTag({
  key: TagTypes.IGNORE_TOKEN,
  value: ['page', 'info']
})

export class AppHotKeyWordController extends BaseController {
}
