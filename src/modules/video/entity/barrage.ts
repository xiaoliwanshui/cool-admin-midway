import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../base/entity/base';

@Entity('video_barrage') // 替换 your_table_name 为您的 MySQL 表名
export class BarrageEntity extends BaseEntity {
  @Column({ type: 'bigint', comment: '站点ID', unsigned: true, nullable: true })
  site_id: string;

  @Column({ type: 'varchar', comment: '用户ID', length: 100, nullable: true })
  member_id: string;

  @Column({ type: 'bigint', comment: '视频ID', unsigned: true })
  video_id: number;

  @Column({ type: 'varchar', comment: '资源名称', length: 191, nullable: true })
  resource_name: string;

  @Column({ type: 'bigint', comment: '线路ID', unsigned: true, nullable: true })
  play_line_id: string;

  @Column({ type: 'int', comment: '相对时间', nullable: true })
  relative_time: number;

  @Column({ type: 'int', comment: '发送时间', nullable: true })
  send_time: number;

  @Column({ type: 'varchar', comment: '发送日期', length: 20, nullable: true })
  send_date: string;

  @Column({ type: 'text', comment: '弹幕内容' })
  content: string;

  @Column({ comment: '弹幕字体大小', nullable: true })
  size: number;

  @Column({ comment: '弹幕类型', nullable: true })
  type: number;

  @Column({ type: 'varchar', length: 20, nullable: true, comment: '弹幕颜色' })
  color: string;

  @Column({ type: 'int', default: 0, comment: '点赞数' })
  agree: number;

  @Column({
    type: 'varchar',
    length: 255,
    comment: 'IP地址',
    default: '0.0.0.0',
  })
  ip: string;

  @Column({ type: 'tinyint', default: 1, comment: '状态' })
  status: number;

  @Column({ type: 'varchar', length: 191, nullable: true, comment: '拒绝理由' })
  reject_reason: string;

  // 如果需要自动创建和更新时间戳，可以使用以下装饰器
  @Column({ type: 'bigint', nullable: true, comment: 'createdAt' })
  create_at: number;

  @Column({ type: 'bigint', nullable: true, comment: 'updatedAt' })
  updated_at: number;
}
