import { BaseEntity } from '../../base/entity/base';
import { Column, Entity } from 'typeorm';

/**
 * 会员兑换配置实体
 */
@Entity('user_member_exchange_config')
export class MemberExchangeConfigEntity extends BaseEntity {
  @Column({ comment: '兑换名称' })
  exchangeName: string;

  @Column({ comment: '所需积分', default: 0 })
  requiredScore: number;

  @Column({ comment: '兑换天数', default: 0 })
  days: number;

  @Column({ comment: '是否启用', default: 0, })
  enabled: number;

  @Column({ comment: '排序', default: 0 })
  sort: number;

  @Column({ comment: '备注', nullable: true })
  remark: string;
}