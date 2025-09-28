import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../base/entity/base';

/**
 * 积分记录
 */
@Entity('score_record')
export class ScoreEntity extends BaseEntity {
  @Column({ comment: '积分变化数量' })
  score: number;

  @Column({ comment: '变更原因', type: 'text', nullable: true })
  reason: string;

  @Column({ comment: '变更类型 1:增加 2:减少', default: 1 })
  type: number;

  @Column({ comment: '关联业务ID', nullable: true })
  businessId: number;

  @Column({ comment: '关联业务类型', nullable: true })
  businessType: string;
}
