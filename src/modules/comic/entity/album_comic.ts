import { BaseEntity } from '@cool-midway/core';
import { Entity, Column, Index } from 'typeorm';

/**
 * 壁纸专辑关联ID
 */
@Entity('album_comic', { database: 'comic' })
export class AlbumComicEntity extends BaseEntity {
  @Column({ comment: '漫画ID' })
  comicId: number;

  @Column({ comment: '专题ID' })
  albumId: number;

  @Column({ comment: '排序', default: 0 })
  sort: number;
}
