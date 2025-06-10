import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../base/entity/base';

/**
 * 文章信息
 */
@Entity('video_album_relationship')
export class VideoAlbumRelationship extends BaseEntity {
  @Index()
  @Column({ comment: '专辑id', nullable: true, type: 'bigint' })
  album_id: number;
  @Index()
  @Column({ comment: '影片id', nullable: true, type: 'bigint' })
  videos_id: number;
}
