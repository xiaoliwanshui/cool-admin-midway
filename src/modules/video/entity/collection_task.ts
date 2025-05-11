import { BaseEntity, transformerJson } from '../../base/entity/base';
import { Column, Entity } from 'typeorm';

/**
 * 采集任务记录
 */
@Entity('video_collection_task_')
export class CollectionTaskTaskEntity extends BaseEntity {
  @Column({ comment: '名称', nullable: true })
  taskName: string;

  @Column({
    comment: '任务状态',
    default: 0,
  })
  taskStatus: number;

  @Column({
    comment: '任务类型',
    default: 0,
  })
  taskType: number;

  @Column({
    comment: '执行参数',
    nullable: true,
    type: 'json',
    transformer: transformerJson,
  })
  execParams: string;

  @Column({
    comment: '执行结果',
    nullable: true,
    type: 'json',
    transformer: transformerJson,
  })
  execResult: string;

  @Column({
    comment: '采集源',
    nullable: true,
    type: 'json',
    transformer: transformerJson,
  })
  collectionSource: string;

  @Column({ comment: '开始时间', nullable: true })
  startDate: Date;

  @Column({ comment: '结束时间', nullable: true })
  endDate: Date;

  @Column({ comment: '备注信息', nullable: true })
  remark: string;

  @Column({
    comment: '错误信息',
    nullable: true,
    type: 'json',
    transformer: transformerJson,
  })
  errorMessage: string;
}
