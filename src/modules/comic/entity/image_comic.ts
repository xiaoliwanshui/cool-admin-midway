import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../base/entity/base';

/**
 * 文章信息
 */
@Entity('comic_image')
export class ComicImageEntity extends BaseEntity {
  @Column({ comment: '标题', nullable: true })
  title: string;

  @Column({ comment: '漫画', nullable: true })
  comicId: number;

  @Column({ comment: '剧集封面', nullable: true, type: 'text' })
  coverImg: string;

  @Column({ comment: '图片链接', nullable: true, type: 'json' })
  image: string;

  @Column({ comment: '图片在漫画中的顺序', nullable: true })
  sequence: number;

  @Column({ comment: '状态', nullable: true })
  status: number;

  @Column({ comment: '是否收费', default: 0 })
  payStatus: number;

  @Column({ comment: '价格', default: 0 })
  price: number;
}
