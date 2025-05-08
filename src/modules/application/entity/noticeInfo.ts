import { BaseEntity } from '../../base/entity/base';
import { Column, Entity, Index } from 'typeorm';

/**
 * 通知信息
 */
@Entity('notice_info')
export class NoticeInfoEntity extends BaseEntity {
  @Column({ comment: '标题' })
  title: string;

  @Column({ comment: '内容', type: 'longtext' })
  content: string;

  @Column({
    comment: '类型',
    dict: ['系统公告', '版本更新', '活动通知'],
    default: 0,
  })
  type: number;

  @Column({ comment: '状态', dict: ['未发布', '已发布'], default: 0 })
  status: number;
}
