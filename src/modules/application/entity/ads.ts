/**
 * 广告信息
 */
import {Column, Entity} from 'typeorm';
import {BaseEntity} from '../../base/entity/base';

@Entity('application_ads')
export class AdsEntity extends BaseEntity {

  @Column({
    comment: '广告类型'
  })
  type: number;


  @Column({type: 'varchar', comment: '应用ID', length: 255})
  appId: string;

  @Column({type: 'varchar', comment: '广告ID', length: 255})
  adsId: number;

  //状态
  @Column({type: 'int', comment: '状态', default: 1})
  status: number;

  //展示页面
  @Column({type: 'int', comment: '展示页面', nullable: true})
  adsPage: number;

  //积分
  @Column({type: 'int', comment: '积分', default: 0})
  score: number;
}
