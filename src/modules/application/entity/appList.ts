import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../base/entity/base';

/**
 * 文章信息
 */
@Entity('app_info', { database: 'app' })
export class AppListEntity extends BaseEntity {
  @Column({ comment: '程序名' })
  name: string;

  @Column({ comment: 'logo', type: 'text', nullable: true })
  logo: string;

  @Column({ comment: '封面图', type: 'text', nullable: true })
  cover: string;

  @Column({ comment: '内容', nullable: true, type: 'text' })
  content: string;

  @Column({ comment: '联系人', nullable: true, type: 'text' })
  contact: string;

  @Column({ comment: '联系电话', nullable: true, type: 'text' })
  phone: string;

  @Column({ comment: '状态', nullable: true, default: false })
  status: number;

  @Column({ comment: '排序', nullable: true, default: 0 })
  sort: number;

  @Column({ comment: '域名', nullable: true })
  url: string;
}
