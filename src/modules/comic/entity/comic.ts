import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../base/entity/base';

/**
 * 文章信息
 */
@Entity('comic')
export class ComicEntity extends BaseEntity {
  @Column({ comment: '标题', nullable: true })
  name: string;

  @Column({ comment: '标签', type: 'json', nullable: true })
  tags: number;

  @Column({ comment: '分类', nullable: true })
  type: number;

  @Column({ comment: '人气', nullable: true, default: 0 })
  popularity: number;

  @Column({ comment: '收藏', nullable: true, default: 0 })
  collect: number;

  @Column({ comment: '关联作者', nullable: true })
  author: string;

  @Column({ comment: '封面图片链接', nullable: true, type: 'text' })
  coverImg: string;

  @Column({ comment: '出版社', nullable: true })
  publishingHouse: string;

  @Column({ comment: '出版日期', nullable: true })
  publishingDate: string;

  @Column({ comment: '漫画简介', nullable: true, type: 'text' })
  description: string;

  @Column({ comment: '上架下架状态', default: 1 })
  status: number;

  @Column({ comment: '总卷数', default: 0 })
  volume: number;

  @Column({ comment: '是否直接买断', default: 0 })
  buyoutStatus: number;

  @Column({ comment: '买断价格', default: 0 })
  buyoutPrice: number;

  @Column({ comment: '总章节数', default: 0 })
  chapter: number;

  @Column({ comment: '总页数', default: 0 })
  page: number;

  @Column({ comment: '评分', default: 0, type: 'float' })
  score: number;

  @Column({ comment: '漫画语言', default: 0 })
  language: number;

  @Column({ comment: '漫画更新状态', nullable: true })
  updateStatus: number;
}
