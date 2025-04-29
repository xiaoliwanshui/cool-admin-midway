import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../base/entity/base';

/* 下载信息
 */
@Entity('user_download')
export class DownloadEntity extends BaseEntity {
  @Column({ comment: '关联Id', nullable: true })
  associationId: number;

  @Column({ comment: 'appid', nullable: true })
  appid: number;
}
