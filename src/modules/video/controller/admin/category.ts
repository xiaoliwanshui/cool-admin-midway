import { BaseController, CoolController } from '@cool-midway/core';
import { CategoryEntity } from '../../entity/category';
import { Inject, Post } from '@midwayjs/core';
import { CategoryService } from '../../service/categoryService';

@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: CategoryEntity,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.admin.userId,
    };
  },
  pageQueryOp: {
    // 让title字段支持模糊查询
    fieldEq: ['type', 'parent_id'],
    addOrderBy: {
      sort: 'desc',
    },
  },
})
export class AdminCategoryEntityController extends BaseController {
  @Inject()
  categoryService: CategoryService;

  @Post('/match_category')
  async matchCategory(): Promise<unknown> {
    try {
      return this.ok(await this.categoryService.matchCategory());
    } catch (error) {
      return this.fail(error);
    }
  }
}
