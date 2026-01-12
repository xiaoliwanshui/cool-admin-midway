import { BaseController, CoolController } from '@cool-midway/core';
import { CollectionCategoryEntity } from '../../entity/collection_category';
import { Body, Inject, Post } from '@midwayjs/core';
import { CategoryService } from '../../service/categoryService';

@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: CollectionCategoryEntity,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.admin.userId,
    };
  },
  pageQueryOp: {
    fieldEq: ['collection_id'],
  },
  listQueryOp: {
    fieldEq: ['collection_id'],
  },
})
export class AdminCollectionCategoryController extends BaseController {
  @Inject()
  categoryService: CategoryService;

  //导入分类
  @Post('/import_category', { summary: '导入分类' })
  async importCategory(@Body() body): Promise<unknown> {
    try {
      return this.ok(
        await this.categoryService.handleCategoryList(
          body.classList,
          body.query
        )
      );
    } catch (error) {
      return this.fail(error);
    }
  }

  @Post('/sync_category', { summary: '同步分类' })
  async sort(@Body() body): Promise<unknown> {
    try {
      return this.ok(await this.categoryService.syncCategory(body));
    } catch (error) {
      return this.fail(error);
    }
  }

  @Post('/match_category', { summary: '匹配分类' })
  async matchCategory(): Promise<unknown> {
    try {
      return this.ok(await this.categoryService.matchCategory());
    } catch (error) {
      return this.fail(error);
    }
  }
}
