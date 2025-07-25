/**
 * @Author: 17691002584 17691002584@163.com
 * @Date: 2025-07-23 18:44:30
 * @LastEditors: 17691002584 17691002584@163.com
 * @LastEditTime: 2025-07-25 17:36:30
 * @FilePath: src/modules/user/controller/admin/contacts.ts
 * @Description: 这是默认设置,可以在设置》工具》File Description中进行配置
 */
import {
  BaseController,
  CoolController,
  CoolUrlTag,
  TagTypes,
} from '@cool-midway/core';
import { ContactEntity } from '../../entity/contacts';

/**
 * 商品
 */
@CoolController({
  api: ['info', 'list', 'page', 'add', 'delete', 'update'],
  entity: ContactEntity,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.admin.userId,
    };
  },
  pageQueryOp: {
    keyWordLikeFields: ['name'],
    fieldEq: ['name', 'phone', 'createUserId'],
  },
})
@CoolUrlTag({
  key: TagTypes.IGNORE_TOKEN,
  value: ['page', 'info'],
})
export class AdminContactController extends BaseController {
  /**
   * 其他接口
   */
}
