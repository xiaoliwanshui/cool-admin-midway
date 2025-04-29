/**
 * 广告信息
 */
import { Column, CreateDateColumn, Entity, UpdateDateColumn } from 'typeorm';
import { BaseEntity } from '../../base/entity/base';

@Entity('video_ads')
export class AdsEntity extends BaseEntity {
  @Column({ type: 'varchar', comment: '广告名称', length: 255 })
  name: string;

  @Column({ type: 'varchar', comment: '位置', length: 50 })
  position: string;

  @Column({
    type: 'varchar',
    comment: '广告类型 image图片 text文字 custom自定义',
    length: 50,
  })
  ads_type: string;

  @Column({ type: 'text', comment: '自定义内容', nullable: true })
  custom: string;

  @Column({ type: 'varchar', comment: '内容', length: 255 })
  content: string;

  @Column({ type: 'text', comment: 'html广告', nullable: true })
  html: string;

  @Column({ type: 'text', comment: '视频广告地址', nullable: true })
  video: string;

  @Column({ type: 'varchar', comment: '链接', length: 255 })
  link: string;

  @Column({ type: 'int', comment: '排序', default: 0 })
  sort: number;

  @Column({ type: 'int', comment: '状态 1显示 2关闭' })
  state: number;

  @Column({ type: 'int', comment: '允许关闭 1允许 2不允许' })
  close: number;

  @Column({ type: 'int', default: 0, comment: '显示时长 单位秒' })
  duration: number;

  @Column({ type: 'text', comment: '链接' })
  url: string;

  @Column({ type: 'int', comment: '是否默认静音', default: 0, nullable: true })
  muted: number;

  @Column({
    type: 'int',
    comment: '须观看的时长，期间不能被跳过',
    default: 0,
    nullable: true,
  })
  playDuration: number;

  @Column({
    type: 'int',
    comment: '广告总时长，单位为秒',
    default: 0,
    nullable: true,
  })
  totalDuration: number;

  @Column({ type: 'bigint', comment: '创建时间', nullable: true })
  create_at: number;

  @Column({ type: 'bigint', comment: '上线时间' })
  online_at: number;

  @Column({ type: 'bigint', comment: '下线时间' })
  offline_at: number;

  @Column({ type: 'bigint', comment: '更新时间', nullable: true })
  update_at: number;

  @Column({ type: 'varchar', length: 50, comment: '打开方式' })
  target: string;

  @Column({
    type: 'int',
    default: false,
    comment: '是否是全站应用,1-是，2-否',
  })
  is_all_site: number;

  @Column({ type: 'int', comment: '定时器', default: 0 })
  ad_timer: number;

  @Column({ type: 'int', comment: '终端web h5 app' })
  terminal: number;

  // 如果需要自动创建和更新时间戳，可以使用以下装饰器
  @CreateDateColumn({ name: 'created_at', comment: 'createdAt' }) // 默认是 "createdAt" 列
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', comment: 'updated_at' }) // 默认是 "updatedAt" 列
  updatedAt: Date;
}
