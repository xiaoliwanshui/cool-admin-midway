import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../base/entity/base';

/**
 * 文章信息
 */
@Entity('video_week')
export class WeekEntity extends BaseEntity {
  @Column({ comment: '标题', nullable: true })
  title: string;

  @Column({ comment: '星期几 0-6', type: 'int' })
  week: number;

  @Column({ comment: '封面地址', type: 'text', nullable: true })
  surface_plot: string;

  @Column({ comment: '是否推荐 1是 2否', nullable: true, type: 'bigint' })
  recommend: number;

  @Column({ comment: '简介', type: 'text', nullable: true })
  introduce: string;

  @Column({ comment: '日人气', nullable: true, type: 'bigint' })
  popularity_day: number;

  @Column({ comment: '周人气', nullable: true, type: 'bigint' })
  popularity_week: number;

  @Column({ comment: '月人气', nullable: true, type: 'bigint' })
  popularity_month: number;

  @Column({ comment: '总人气', nullable: true, type: 'bigint' })
  popularity_sum: number;

  @Column({ comment: '备注', nullable: true, type: 'text' })
  note: string;

  @Column({ comment: '排序', nullable: true, default: 0 })
  sort: number;

  @Column({ comment: 'create_at', nullable: true, type: 'bigint' })
  create_at: number;

  @Column({ comment: 'update_at', nullable: true, type: 'bigint' })
  update_at: number;

  @Column({ comment: 'update_at', nullable: true, type: 'int' })
  site_id: number;
}
