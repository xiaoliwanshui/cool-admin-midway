import {Column, Entity, Index} from 'typeorm';
import {BaseEntity} from '../../base/entity/base';

/**
 *  视频专辑关系
 */
@Entity('video_album_relationship')
export class VideoAlbumRelationship extends BaseEntity {
  @Index()
  @Column({comment: '专辑id', nullable: true, type: 'bigint'})
  album_id: number;
  @Index()
  @Column({comment: '影片id', nullable: true, type: 'bigint'})
  videos_id: number;
  @Column({comment: '排序', nullable: true, default: 0})
  sort: number;
}
