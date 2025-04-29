import {
  BaseController,
  CoolController,
  CoolUrlTag,
  TagTypes,
} from '@cool-midway/core';
import { WeekEntity } from '../../entity/week';

/**
 *
 */

@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: WeekEntity,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.user.userId,
    };
  },
  pageQueryOp: {
    fieldEq: ['week'],
    addOrderBy: {
      sort: 'desc',
    },
  },
})
@CoolUrlTag({
  key: TagTypes.IGNORE_TOKEN,
  value: ['page', 'info'],
})
export class AppWeekController extends BaseController {}
