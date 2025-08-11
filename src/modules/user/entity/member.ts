import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../base/entity/base';

/**
 * 文章信息
 */
@Entity('user_member')
export class MemberEntity extends BaseEntity {
  @Column({ comment: '开始时间', nullable: true })
  startTime: Date;

  @Column({ comment: '结束时间', nullable: true })
  endTime: Date;
}
