import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../base/entity/base';

/**
 * 文章信息
 */
@Entity('video_week_relationship')
export class VideoWeekEntity extends BaseEntity {
  @Column({ comment: '周表id', nullable: true, type: 'bigint' })
  week_id: number;

  @Column({ comment: '影片id', nullable: true, type: 'bigint' })
  videos_id: number;

  @Column({ comment: '排序', nullable: true, type: 'bigint' })
  sort: number;

  @Column({ comment: 'create_at', nullable: true, type: 'bigint' })
  create_at: number;

  @Column({ comment: 'update_at', nullable: true, type: 'bigint' })
  update_at: number;
}
