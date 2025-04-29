import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../base/entity/base';

/**
 * 文章信息
 */
@Entity('video_play_line')
export class PlayLineEntity extends BaseEntity {
  @Column({ comment: '影视ID', nullable: true, type: 'bigint' })
  video_id: number;

  @Column({ comment: '资源ID', nullable: true, type: 'bigint' })
  video_line_id: number;

  @Column({ comment: '名称', length: 256 })
  name: string;

  @Column({ comment: '文件地址', nullable: true, type: 'text' })
  file: string;

  @Column({
    comment: '收费模式 1免费 2vip免费 3金币点播',
    nullable: true,
    type: 'bigint',
  })
  charging_mode: number;

  @Column({
    comment: '金币数量',
    nullable: true,
    type: 'bigint',
  })
  currency: number;

  @Column({
    comment: '副标题',
    nullable: true,
    length: 256,
  })
  sub_title: string;

  @Column({
    comment: '状态',
    nullable: true,
  })
  status: number;

  @Column({
    comment: '是否是直播源1-是 0-否',
    nullable: true,
  })
  live_source: number;

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
