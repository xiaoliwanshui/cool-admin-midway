import { BaseEntity } from '../../base/entity/base';
import { Entity, Column } from 'typeorm';

/**
 * 月签到配置实体
 */
@Entity('user_monthly_checkin_config')
export class MonthlyCheckinConfigEntity extends BaseEntity {
  @Column({ comment: '月份 (1-12)' })
  month: number;

  @Column({ comment: '日期 (1-31)' })
  day: number;

  @Column({ comment: '签到获得的积分数额', default: 0 })
  score: number;

  @Column({ comment: '是否启用', default: 1 })
  enabled: number;

  @Column({ comment: '备注', nullable: true })
  remark: string;
}