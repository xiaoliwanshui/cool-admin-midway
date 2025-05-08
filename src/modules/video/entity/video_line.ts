import { Column, Entity, Index, Unique } from 'typeorm';
import { BaseEntity } from '../../base/entity/base';

/**
 * 文章信息
 */
@Entity('video_line')
@Unique(['collection_id', 'video_id'])
export class VideoLineEntity extends BaseEntity {
  @Index()
  @Column({ comment: '影视ID', nullable: true, type: 'bigint' })
  video_id: number;

  @Column({ comment: '影视名称', nullable: true })
  video_name: string;

  @Column({ comment: '名称', length: 256 })
  collection_name: string;

  @Column({ comment: '资源id', nullable: true })
  collection_id: number;

  @Column({ comment: '关联播放器ID', nullable: true, default: 0 })
  player_id: number;

  @Column({ comment: '排序', nullable: true, default: 0 })
  sort: number;

  @Column({ comment: '标识', nullable: true, length: 191 })
  tag: string;
}
