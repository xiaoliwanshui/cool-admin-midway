import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../base/entity/base';

/**
 * 采集实体
 */
@Entity('video_collection')
export class CollectionEntity extends BaseEntity {
  @Column({ comment: '名称', length: 191, nullable: true })
  name: string;

  @Column({ comment: '数据类型:1视频 2影人', type: 'bigint', nullable: true })
  data_type: number;

  @Column({ comment: '地址', length: 191, nullable: true })
  address: string;

  @Column({ comment: '参数', type: 'text', nullable: true })
  param: string;

  @Column({comment: '解析地址', type: 'text', nullable: true})
  parseAddress: string;

  @Column({comment: 'apiKey', type: 'text', nullable: true})
  apiKey: string;

  @Column({comment: 'isVip', default: 0})
  isVip: number;


  @Column({ comment: '说明', length: 191, nullable: true })
  desc: string;

  @Column({ comment: '来源', length: 191, nullable: true })
  tags: string;

  @Column({ comment: '关联播放器ID', nullable: true, default: 0 })
  player_id: number;

  @Column({ comment: '排序', nullable: true, default: 0 })
  sort: number;

  @Column({comment: '是否支持模糊查询', nullable: true, default: 0})
  isKeyWord: number;
}
