/**
 * 广告信息
 */
import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../base/entity/base';

@Entity('application_ads')
export class AdsEntity extends BaseEntity {

  @Column({
    comment: '广告类型'
  })
  type: number;


  @Column({ type: 'varchar', comment: '应用ID', length: 255 })
  appId: string;

  @Column({ type: 'varchar', comment: '广告ID', length: 255 })
  adsId: string;
}
