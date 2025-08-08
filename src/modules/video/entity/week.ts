import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../base/entity/base';

/**
 * 周更新信息
 */
@Entity('video_week')
export class WeekEntity extends BaseEntity {
  @Column({ comment: '星期几 0-6', type: 'int' })
  week: number;

  @Column({ comment: '影视ID', nullable: false })
  videoId: number;

  @Column({
    comment: '备注',
    nullable: true,
    type: 'text'
  })
  remarks: string;
  
  @Column({
    comment: '时间',
    nullable: true,
    type: 'text'
  })
  time: string;


  @Column({ comment: '排序', nullable: false, default: 0 })
  sort: number;
}
