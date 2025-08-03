import { BaseEntity, transformerJson } from '../base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 系统日志
 */
@Entity('base_sys_log')
export class BaseSysLogEntity extends BaseEntity {
  @Index()
  @Column({ comment: '用户ID', nullable: true })
  userId: number;

  @Index()
  @Column({ comment: '行为' })
  action: string;

  @Index()
  @Column({ comment: 'ip', nullable: true })
  ip: string;

  @Column({
    comment: '参数',
    nullable: true,
    type: 'json',
    transformer: transformerJson
  })
  params: string;

  @Column({
    comment: '头部信息',
    nullable: true,
    type: 'json',
    transformer: transformerJson
  })
  headers: string;
}
