import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../base/entity/base';

/**
 * 会员信息
 */
@Entity('user_member')
export class MemberEntity extends BaseEntity {

  @Column({ comment: '积分', default: 0 })
  score: number;

  @Column({ comment: '余额', type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;

  @Column({ comment: '会员等级', default: 0 })
  level: number;

  @Column({ comment: '状态', default: 1 })
  status: number;

  @Column({ comment: '注册时间' })
  registerTime: Date;

  @Column({ comment: '开始时间', nullable: true })
  startTime: Date;

  @Column({ comment: '结束时间', nullable: true })
  endTime: Date;
}
