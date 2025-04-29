import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../base/entity/base';

@Entity('cloud_disk_swiper')
export class CloudDiskSwiperEntity extends BaseEntity {
  @Column({ comment: '标题', nullable: true })
  title: string;

  @Column({ comment: '图片', nullable: true, type: 'text' })
  image: string;

  @Column({ comment: '页面', nullable: true })
  path: string;

  @Column({ comment: '关联ID', nullable: true })
  relatedId: number;

  @Column({ comment: 'appid', nullable: true })
  appid: number;

  @Column({ comment: '类型', nullable: true })
  type: number;

  @Column({ comment: '排序', nullable: true, default: 0 })
  sort: number;

  @Column({ comment: '状态', default: true })
  status: number;
}
