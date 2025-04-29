import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../base/entity/base';

/**
 * 文章信息
 */
@Entity('video_album__relationship')
export class VideoAlbum extends BaseEntity {
  @Column({ comment: '名人id', nullable: true, type: 'bigint' })
  album_id: number;

  @Column({ comment: '影片id', nullable: true, type: 'bigint' })
  videos_id: number;

  @Column({ comment: 'create_at', nullable: true, type: 'bigint' })
  create_at: number;

  @Column({ comment: 'update_at', nullable: true, type: 'bigint' })
  update_at: number;
}
