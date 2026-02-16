import {BaseEntity} from '../../base/entity/base';
import {Column, Entity} from 'typeorm';

/**
 * 反馈信息
 */
@Entity('feedback_info')
export class FeedbackInfoEntity extends BaseEntity {
  @Column({comment: '反馈类型',})
  feedbackType: number;

  @Column({comment: '反馈内容', type: 'text'})
  content: string;

  @Column({comment: '影视id', nullable: true})
  videoId: number;

  @Column({comment: '影视名', nullable: true})
  videoName: string;

  @Column({comment: '资源', nullable: true})
  videoUrl: string;

  @Column({comment: '资源id', nullable: true})
  playLineId: number;
}
