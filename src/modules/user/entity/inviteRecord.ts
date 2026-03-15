import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../base/entity/base';

/**
 * 邀请记录 - 记录用户使用邀请码注册的信息
 */
@Entity('user_invite_record')
export class InviteRecordEntity extends BaseEntity {
  @Column({ comment: '邀请码', length: 50 })
  code: string;

  @Column({
    comment: '登录方式',
    dict: ['小程序', '公众号', 'H5', 'APP'],
    default: 0,
  })
  loginType: number;

  //主键
  @Index()
  @Column({ comment: 'IP 地址', nullable: true, length: 50 })
  ipAddress: string;

  @Column({ comment: '备注', nullable: true, type: 'text' })
  remark: string;
}
