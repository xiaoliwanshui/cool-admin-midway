import {Body, Get, Inject, Post, Provide} from '@midwayjs/core';
import {BaseController, CoolController, CoolTag, CoolUrlTag, TagTypes,} from '@cool-midway/core';
import {DictInfoService} from '../../service/info';
import {DictInfoEntity} from '../../entity/info';

/**
 * 字典信息
 */
@Provide()
@CoolController({
  api: ['info', 'list', 'page'],
  entity: DictInfoEntity,
  service: DictInfoService,
  listQueryOp: {
    fieldEq: ['typeId'],
    keyWordLikeFields: ['name'],
    addOrderBy: {
      createTime: 'ASC',
    },
    where: ctx => {
      const {aldult} = ctx.request.headers;
      if (aldult === '0') {
        return [['id != :id', {id: 643}]];
      }
      return [[]];
    },
  },
})
@CoolUrlTag({
  key: TagTypes.IGNORE_TOKEN,
  value: ['page', 'info', 'list'],
})
@CoolUrlTag()
export class AppDictInfoController extends BaseController {
  @Inject()
  dictInfoService: DictInfoService;

  @Inject()
  ctx;

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Post('/data', {summary: '获得字典数据'})
  async data(@Body('types') types: string[] = []) {
    const data: any = await this.dictInfoService.data(types);
    const {aldult} = this.ctx.request.headers;
    if ((aldult === undefined || aldult === '0') && data.video_category) {
      data.video_category = data.video_category.filter(e => e.id != 643);
    }
    return this.ok(data);
  }

  @CoolTag(TagTypes.IGNORE_TOKEN)
  @Get('/types', {summary: '获得所有字典类型'})
  async types() {
    return this.ok(await this.dictInfoService.types());
  }
}
