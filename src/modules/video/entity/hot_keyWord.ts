import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../base/entity/base';

/**
 * 好友表信息
 */
@Entity('video_hot_keyword')
export class VideoHostKeyWordEntity extends BaseEntity {
  @Column({ comment: '标题', nullable: true })
  keyWord: string;
  @Column({ comment: '分类', nullable: true })
  category_id: number;
  @Column({ comment: '标签', nullable: true })
  tag: string;
  @Column({ comment: '背景颜色', nullable: true })
  bgColor: string;

  @Column({ comment: '字体颜色', nullable: true })
  fontColor: string;
}
