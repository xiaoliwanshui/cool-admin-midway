import {
  BaseController,
  CoolController,
  CoolUrlTag,
  TagTypes,
} from '@cool-midway/core';
import { CategoryEntity } from '../../entity/category';

/**
 *
 */

@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: CategoryEntity,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.user.userId,
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
@CoolUrlTag({
  key: TagTypes.IGNORE_TOKEN,
  value: ['page', 'info', 'list'],
})
export class AppCategoryEntityController extends BaseController {}
