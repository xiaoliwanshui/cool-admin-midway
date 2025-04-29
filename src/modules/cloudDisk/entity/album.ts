import { BaseEntity } from '@cool-midway/core';
import { Entity, Column, Index } from 'typeorm';

/**
 * 云盘专辑模块
 */
@Entity('cloud_disk_album')
export class AlbumEntity extends BaseEntity {
  @Column({ comment: '标题', length: 255 })
  title: string;

  @Column({ comment: '图片', length: 255 })
  image: string;

  @Column({ comment: '排序', default: 0 })
  sort: number;

  @Column({ comment: '内容', type: 'text', nullable: true })
  content: string;

  @Column({ comment: '状态', default: 1 })
  status: number;

  @Column({ comment: '分类', default: null, nullable: true })
  type: number;
}
