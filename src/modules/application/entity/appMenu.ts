import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../base/entity/base';

/**
 * 文章信息
 */
@Entity('app_menu')
export class AppMenuEntity extends BaseEntity {
  @Column({ comment: '页面名' })
  name: string;

  @Column({ comment: '别名', nullable: true })
  label: string;

  @Column({ comment: 'icon', type: 'text', nullable: true })
  icon: string;

  @Column({ comment: '页面路径', nullable: true, type: 'text' })
  path: string;

  @Column({ comment: 'condition', nullable: true })
  condition: string;

  @Column({ comment: '启用', nullable: true, default: true })
  status: number;

  @Column({ comment: 'i18n', nullable: true, default: true })
  i18n: string;

  @Column({ comment: '排序', nullable: true, default: 0 })
  sort: number;

  @Column({ comment: '数据来源', nullable: true })
  dataSource: number;

  @Column({ comment: 'component', nullable: true })
  component: string;

  @Column({ comment: 'seo标题', nullable: true })
  seoTitle: string;

  @Column({ comment: 'seo描述', nullable: true })
  seoDescription: string;

  @Column({ comment: 'seo关键字', nullable: true })
  seoKeywords: string;

  @Column({ comment: ' props', nullable: true })
  props: string;

  @Column({ comment: ' show', nullable: true, default: true })
  show: number;

  @Column({ comment: ' appid', nullable: true, default: true })
  appid: number;
}
