import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../base/entity/base';

/**
 * 收藏
 */
@Entity('user_collect')
export class CollectEntity extends BaseEntity {
  @Column({ comment: '标题', nullable: true })
  title: string;

  @Column({ comment: '分类', nullable: true })
  type: number;

  @Column({ comment: '关联id', nullable: true })
  associationId: number;

  @Column({ comment: '封面', nullable: true, type: 'text' })
  cover: string;
}
