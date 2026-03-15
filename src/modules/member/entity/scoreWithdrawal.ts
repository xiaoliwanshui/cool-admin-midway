import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../base/entity/base';

/**
 * 积分提现记录
 */
@Entity('score_withdrawal')
export class ScoreWithdrawalEntity extends BaseEntity {

  @Column({ comment: '提现积分数量', default: 0 })
  score: number;

  @Column({ comment: '提现金额', type: 'decimal', precision: 10, scale: 2, default: 0 })
  amount: number;

  @Column({ comment: '提现状态 0:待审核 1:已通过 2:已拒绝 3:已打款', default: 0 })
  status: number;

  @Column({ comment: '审核备注', nullable: true, type: 'text' })
  auditRemark: string;

  @Column({ comment: '收款方式', dict: ['微信', '支付宝', '银行卡'], default: 0 })
  paymentType: number;

  @Column({ comment: '收款账号', length: 100 })
  paymentAccount: string;

  @Column({ comment: '备注', nullable: true, type: 'text' })
  remark: string;

  //主键
  @Column({ comment: 'IP 地址', nullable: true, length: 50 })
  ipAddress: string;
}
