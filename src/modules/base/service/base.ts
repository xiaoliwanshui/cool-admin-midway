import { BaseService as CoolBaseService } from '@cool-midway/core';
import { Inject } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';

export class BaseService extends CoolBaseService {
  @Inject()
  ctx: Context;

  /**
   * 修改之前
   * @param data
   * @param type
   */
  async modifyBefore(data: any, type: 'delete' | 'update' | 'add') {
    if (type == 'update') {
      if(this.ctx.admin){
        data.updateUserId = this.ctx.admin.userId;
      }
      if(this.ctx.user){
        data.updateUserId = this.ctx.user.id;
      }
    }
  }

  /**
   * 修改之后
   * @param data
   * @param type
   */
  async modifyAfter(data: any, type: 'delete' | 'update' | 'add') {
    // 你想做的其他事情
  }
}
