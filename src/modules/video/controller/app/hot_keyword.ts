import { BaseController, CoolController, CoolTag, CoolUrlTag, TagTypes } from '@cool-midway/core';
import { VideoHostKeyWordEntity } from '../../entity/hot_keyword';
import { HotKeywordService } from '../../service/hot_keyword';
import { Get, Inject } from '@midwayjs/core';
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
@CoolUrlTag()
/**
 * 视频热词控制器
 */
export class AppHotKeyWordController extends BaseController {
  @Inject()
  hotKeywordService: HotKeywordService;
  /**
   * 获取视频热词
   */
  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Get('/video_hot_words', { summary: '获取视频热词' })
  async videoHotWords(): Promise<unknown> {
    try {
      return this.ok(await this.hotKeywordService.getVideoHotWords());
    } catch (error) {
      return this.fail(error);
    }
  }
}
