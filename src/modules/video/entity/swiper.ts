import {Column, Entity, Index} from 'typeorm';
import {BaseEntity} from '../../base/entity/base';

/**
 * 视频轮播
 */

@Entity('video_swiper')
export class VideoSwiperEntity extends BaseEntity {
  @Column({comment: '标题', nullable: true})
  title: string;

  @Column({comment: '图片', nullable: true, type: 'text'})
  image: string;

  @Column({comment: '页面', nullable: true})
  path: string;

  @Column({comment: '颜色', nullable: true})
  color: string;

  @Column({comment: '副标题', nullable: true})
  subTitle: string;

  @Column({comment: '关联ID', nullable: true})
  relatedId: number;

  @Index()
  @Column({comment: 'category', nullable: true})
  category: number;

  @Column({comment: '排序', nullable: true, default: 0})
  sort: number;

  @Column({comment: '状态', default: true})
  status: number;
}
