import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../base/entity/base';

/**
 *  热词
 */
@Entity('video_hot_keyword')
export class VideoHostKeyWordEntity extends BaseEntity {
  @Column({ comment: '标题', nullable: true })
  keyWord: string;

  @Index()
  @Column({ comment: '分类' })
  category_id: number;
  @Column({ comment: '标签', nullable: true })
  tag: string;
  @Column({ comment: '背景颜色', nullable: true })
  bgColor: string;
  @Column({ comment: '字体颜色', nullable: true })
  fontColor: string;
  //添加排序字段
  @Column({ comment: '排序', default: 0 })
  sort: number;
}
