import { Column, Entity, Unique } from 'typeorm';
import { BaseEntity } from '../../base/entity/base';

/**
 * 分类映射表
 */
@Entity('video_collection_category')
@Unique(['class_id', 'resource_id'])
export class CollectionCategoryEntity extends BaseEntity {
  @Column({ comment: '资源id', nullable: true })
  resource_id: number;
  @Column({ comment: '采集资源分类id', nullable: true })
  class_id: number;
  @Column({ comment: '采集资源分类名称', nullable: true })
  class_name: string;
  @Column({ comment: '采集资源分类父id', nullable: true })
  class_pid: string;
  @Column({ comment: '采集资源分类pid', nullable: true })
  parentId: number;
  @Column({ comment: '系统资源分类id', nullable: true })
  sys_category_id: number;
  @Column({
    comment: '收费模式 1免费 2vip免费 3金币点播',
    nullable: true,
    default: 1,
  })
  charging_mode: number;
  @Column({ comment: '金币点播值', nullable: true, default: 0 })
  gold: number;
  @Column({ comment: '购买模式 1按部 2按集', nullable: true, default: 1 })
  buy_mode: number;
}
