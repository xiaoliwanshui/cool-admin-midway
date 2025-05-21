import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../base/entity/base';

/**
 * 文章信息
 */
@Entity('video_album')
export class VideoAlbumEntity extends BaseEntity {
  @Column({ comment: '类型 1影片 2名人 3文章', nullable: true })
  title: string;

  @Column({ comment: '标题', length: 191, nullable: true })
  name: string;

  @Column({ comment: '封面地址', type: 'text', nullable: true })
  surface_plot: string;

  @Column({ comment: '是否推荐 1是 2否', nullable: true, type: 'bigint' })
  recommend: number;

  @Column({
    comment: '是否推荐 1是 2否',
    nullable: true,
    default: 1,
    type: 'bigint',
  })
  status: number;

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

  @Column({ comment: '专题关联类型', nullable: true, default: 0 })
  category_id: number;
}
