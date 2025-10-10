// import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../base/entity/base';
/**
 * 播放器
 */
import { Column, Entity } from 'typeorm';

@Entity('video_player')
export class PlayerEntity extends BaseEntity {
  @Column({ comment: '名称' })
  name: string;

  @Column({ comment: '标签' })
  tag: string;

  @Column({ comment: '排序' })
  sort: number;

  @Column({ comment: '类型' })
  type: string;

  @Column({ comment: 'key' })
  key: string;

  @Column({ comment: '状态' })
  status: number;

  @Column({ nullable: true, comment: '介绍' }) // 如果字段可以为空，则添加 nullable: true
  introduce: string;

  @Column({ nullable: true, comment: '代码' })
  code: string;
  @Column({ default: 1, comment: '解析模式' }) // 设置默认值
  parse_mod: number;

  @Column({ nullable: true, comment: '解析地址' })
  parse_address: string;

  @Column({ comment: '解析字段' })
  parse_column: string;

  @Column({ nullable: true, comment: 'json服务器' })
  json_server: string;
}
