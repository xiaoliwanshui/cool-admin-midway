import { BaseEntity } from '../../base/entity/base';
import { Column, Index, Entity } from 'typeorm';

/**
 * SQL 执行历史记录
 */
@Entity('database_sql_log')
export class CMSDatabaseSqlLogEntity extends BaseEntity {
  @Column({ comment: 'SQL 语句', type: 'longtext' })
  sql: string;

  @Column({
    comment: 'SQL 类型',
    dict: [
      'SELECT',
      'INSERT',
      'UPDATE',
      'DELETE',
      'CREATE',
      'DROP',
      'ALTER',
      'TRUNCATE',
      'REPLACE',
      'UNKNOWN',
    ],
    default: 'UNKNOWN',
  })
  sqlType: string;

  @Column({ comment: '执行状态 0-失败 1-成功', default: 0 })
  status: number;

  @Column({ comment: '影响行数', default: 0 })
  affectedRows: number;

  @Column({ comment: '执行时间 (毫秒)', default: 0 })
  executionTime: number;

  @Column({ comment: '错误信息', nullable: true, type: 'text' })
  error: string;

  @Column({ comment: '警告信息', nullable: true, type: 'text' })
  warning: string;
}
