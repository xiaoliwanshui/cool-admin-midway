import { ILogger, Inject, Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { Repository } from 'typeorm';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { ViewsEntity } from '../entity/views';
import { ViewsEntityBean } from '../bean/views';

/**
 * 浏览啦
 */
const TAG = 'ViewsService';

@Provide()
export class ViewsService extends BaseService {
  @InjectEntityModel(ViewsEntity)
  ViewsEntity: Repository<ViewsEntity>;

  @Inject()
  logger: ILogger;

  @Inject()
  ctx;

  /**
   * 列表信息
   */
  async add(params: ViewsEntityBean) {
    const info = await this.ViewsEntity.findOneBy({
      associationId: params.associationId,
      createUserId: this.ctx.user.id,
    });
    if (info) {
      return await this.ViewsEntity.update(info.id, params);
    } else {
      return await this.ViewsEntity.insert({
        ...params,
        createUserId: this.ctx.user.id,
      });
    }
  }
}
