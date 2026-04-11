import { ILogger, Inject, Provide } from '@midwayjs/core';
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

  @Inject()
  logger: ILogger;

  private readonly TAG = 'MemberExchangeConfigService';

  /**
   * 获取兑换配置信息
   * @param id 配置ID
   */
  async info(id: number): Promise<MemberExchangeConfigEntity | null> {
    // 输入验证
    if (!id || typeof id !== 'number') {
      this.logger.warn(this.TAG, '配置ID无效');
      return null;
    }

    try {
      const config = await this.memberExchangeConfigEntity.findOne({ where: { id } });
      if (!config) {
        this.logger.debug(this.TAG, `配置ID ${id} 不存在`);
      }
      return config;
    } catch (error) {
      this.logger.error(this.TAG, `获取兑换配置信息失败，ID: ${id}`, error);
      return null;
    }
  }
}