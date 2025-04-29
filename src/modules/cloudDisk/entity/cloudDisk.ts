import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../base/entity/base';

/**
 * 云盘信息
 */
@Entity('cloud_disk')
export class CloudDiskEntity extends BaseEntity {
  @Column({ comment: '标题' })
  title: string;

  @Column({ comment: '作者', nullable: true })
  author: string;

  @Column({ comment: '分类', nullable: true })
  type: number;

  @Column({ comment: '图片', nullable: true, type: 'text' })
  image: string;

  @Column({ comment: '标签', type: 'json', nullable: true })
  tags: number;

  @Column({ comment: '状态', default: true })
  status: number;

  @Column({ comment: '内容', nullable: true, type: 'text' })
  content: string;

  @Column({ comment: '链接', nullable: true, type: 'text' })
  link: string;

  @Column({ comment: '密码', nullable: true })
  password: string;

  @Column({ comment: '金币', nullable: true, default: 0 })
  coin: number;

  @Column({ comment: '浏览量', nullable: true, default: 0 })
  views: number;

  @Column({ comment: '收藏', nullable: true, default: 0 })
  collect: number;

  @Column({ comment: '点赞', nullable: true, default: 0 })
  like: number;

  @Column({ comment: '分享', nullable: true, default: 0 })
  share: number;
}
