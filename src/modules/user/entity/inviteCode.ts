import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../base/entity/base';

/**
 * 邀请码
 */
@Entity('user_invite_code')
export class InviteCodeEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ comment: '邀请码', length: 50 })
  code: string;

  @Column({ comment: '最大使用次数 0 表示无限制',dict: ['禁用', '启用'], default: 0, })
  maxUsage: number;

  @Column({ comment: '已使用次数', default: 0 })
  usedCount: number;

  @Column({ comment: '状态', dict: ['禁用', '启用'], default: 1 })
  status: number;

  @Column({ comment: '备注', nullable: true, type: 'text' })
  remark: string;
}
