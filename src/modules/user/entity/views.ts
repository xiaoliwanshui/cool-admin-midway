import { Column, Entity, Unique } from 'typeorm';
import { BaseEntity } from '../../base/entity/base';

/**
 * 文章信息
 */
@Entity('user_views')
@Unique(['type', 'associationId', 'createUserId'])
export class ViewsEntity extends BaseEntity {
  @Column({ comment: '标题', nullable: true })
  title: string;

  @Column({ comment: '分类' })
  type: number;

  @Column({ comment: '关联id' })
  associationId: number;

  @Column({ comment: '视频时长' })
  duration: number;

  @Column({ comment: '观看时长' })
  viewingDuration: number;

  @Column({ comment: '当前观看索引' })
  videoIndex: number;

  @Column({ comment: '封面', nullable: true, type: 'text' })
  cover: string;
}
