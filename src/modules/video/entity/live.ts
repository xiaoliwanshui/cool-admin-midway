import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../base/entity/base';

/**
 * 好友表信息
 */
@Entity('video_live')
export class UserLiveEntity extends BaseEntity {
  @Column({ comment: '图片', nullable: true })
  image: string;
  @Column({ comment: '标题', nullable: true })
  title: string;

  @Column({ comment: '房间号', nullable: true })
  roomId: string;

  @Column({ comment: '分类', nullable: true })
  type: number;

  @Column({ comment: '标签', type: 'json', nullable: true })
  types: number;

  @Column({ comment: '推流地址', nullable: true })
  pushUrl: string;
  @Column({ comment: '拉流地址', nullable: true })
  pullUrl: string;

  @Column({ comment: '推流码', nullable: true })
  pushCode: string;

  @Column({ comment: '状态', nullable: true, default: 369 })
  status: number;
}
