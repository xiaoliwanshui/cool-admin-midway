import { Column, Entity, Index, Unique } from 'typeorm';
import { BaseEntity,transformerJson } from '../../base/entity/base';


/**
 * 视频信息实体
 */
@Entity('video_rules')
export class VideoRulesEntity extends BaseEntity {

  @Index()
  @Column({ comment: '资源id', nullable: true })
  collection_id: number;

@Column({ comment: '规则', nullable: true, type: 'json', transformer: transformerJson })
  updateRules: string[];



  @Index()
  @Column({ comment: '排序' ,default:0})
  sort: number;
}
