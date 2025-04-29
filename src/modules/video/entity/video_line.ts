import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../base/entity/base';

/**
 * 文章信息
 */
@Entity('video_line')
export class VideoLineEntity extends BaseEntity {
  @Index()
  @Column({ comment: '影视ID', nullable: true, type: 'bigint' })
  video_id: number;

  @Column({ comment: '名称', length: 256 })
  name: string;

  @Column({ comment: '关联播放器ID', nullable: true, default: 0 })
  player_id: number;

  @Column({ comment: '排序', nullable: true, default: 0 })
  sort: number;

  @Column({ comment: 'create_at', nullable: true, type: 'bigint' })
  create_at: number;

  @Column({ comment: 'update_at', nullable: true, type: 'bigint' })
  update_at: number;

  @Column({ comment: '站点id', nullable: true, type: 'int' })
  site_id: number;

  @Column({ comment: '标识', nullable: true, length: 191 })
  tag: string;
}
