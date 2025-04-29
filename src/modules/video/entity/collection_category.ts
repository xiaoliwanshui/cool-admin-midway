import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../base/entity/base';

/**
 * 分类映射表
 */
@Entity('video_collection_category')
export class CollectionCategoryEntity extends BaseEntity {
  @Column({ comment: '资源id', nullable: true })
  resource_id: number;
  @Column({ comment: '采集资源分类id', nullable: true })
  class_id: number;
  @Column({ comment: '采集资源分类id', nullable: true })
  category_id: number;
  @Column({ comment: '采集资源分类', nullable: true })
  class_name: string;
  @Column({ comment: '系统分类id', nullable: true })
  category_child_id: number;
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
  @Column({ comment: 'create_at', nullable: true, type: 'bigint' })
  create_at: number;
  @Column({ comment: 'update_at', nullable: true, type: 'bigint' })
  update_at: number;
  @Column({ comment: '站点id', nullable: true, type: 'bigint', default: 1 })
  site_id: number;
}
