import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../base/entity/base';

/**
 * 文章信息
 */
@Entity('video_category')
export class CategoryEntity extends BaseEntity {
  @Column({ comment: '父id', type: 'bigint' })
  parent_id: number;

  @Column({ comment: '类型 1影片 2名人 3文章', nullable: true, type: 'bigint' })
  type: number;

  @Column({ comment: '分类名称', length: 191, nullable: true })
  name: string;

  @Column({ comment: '排序', nullable: true, type: 'bigint' })
  sort: number;

  @Column({ comment: 'create_at', nullable: true, type: 'bigint' })
  create_at: number;

  @Column({ comment: 'update_at', nullable: true, type: 'bigint' })
  update_at: number;

  @Column({ comment: '是否是竖屏，1-是，0-否', nullable: true, type: 'int' })
  is_vertical: number;

  @Column({ comment: '是否是纯文字，1-是，0-否', nullable: true, type: 'int' })
  is_font: string;

  @Column({ comment: '站点id', nullable: true, type: 'int' })
  site_id: number;

  @Column({ comment: 'status', nullable: true, type: 'int' })
  status: number;
}
