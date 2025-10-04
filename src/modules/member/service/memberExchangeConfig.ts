import { Inject, Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { MemberExchangeConfigEntity } from '../entity/memberExchangeConfig';
import { CoolCommException } from '@cool-midway/core';

/**
 * 会员兑换配置服务
 */
@Provide()
export class MemberExchangeConfigService {
  @InjectEntityModel(MemberExchangeConfigEntity)
  memberExchangeConfigEntity: Repository<MemberExchangeConfigEntity>;

  /**
   * 获取兑换配置信息
   * @param id 配置ID
   */
  async info(id: number) {
    return await this.memberExchangeConfigEntity.findOne({ where: { id } });
  }
}