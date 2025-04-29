import { BaseEntity } from '@cool-midway/core';
import { Column, Entity } from 'typeorm';

/**
 * 云盘专辑关联表
 */
@Entity('cloud_disk_album_relationship')
export class AlbumCloudDiskEntity extends BaseEntity {
  @Column({ comment: '云盘ID' })
  cloudDiskId: number;

  @Column({ comment: '专辑ID' })
  albumId: number;

  @Column({ comment: '排序', default: 0 })
  sort: number;
}
