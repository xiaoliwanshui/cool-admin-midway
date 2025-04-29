import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../base/entity/base';

/**
 * 文章信息
 */
@Entity('video_collection')
export class CollectionEntity extends BaseEntity {
  @Column({ comment: '名称', length: 191, nullable: true })
  name: string;

  @Column({ comment: '数据类型:1JSON 2XML', type: 'bigint', nullable: true })
  data_method: number;

  @Column({ comment: '数据类型:1视频 2影人', type: 'bigint', nullable: true })
  data_type: number;

  @Column({ comment: '地址', length: 191, nullable: true })
  address: string;

  @Column({ comment: '参数', type: 'text', nullable: true })
  param: string;

  @Column({
    comment: '收费模式 1免费 2vip免费 3金币点播',
    type: 'bigint',
    nullable: true,
  })
  charging_mode: number;

  @Column({
    comment: '数据操作 1新增+更新 2新增 3更新',
    type: 'bigint',
    nullable: true,
  })
  data_handle: number;

  @Column({ comment: '请求日志id', type: 'bigint', nullable: true })
  log_id: number;
  @Column({ comment: '超管平台资源id', type: 'bigint', nullable: true })
  sr_id: number;

  @Column({ comment: 'COMMENT', type: 'bigint', nullable: true })
  status: number;
  @Column({ comment: '说明', length: 191, nullable: true })
  desc: string;

  @Column({ comment: '来源', length: 191, nullable: true })
  tags: string;

  @Column({ comment: '来源', type: 'text', nullable: true })
  color: string;

  @Column({ comment: '来源', type: 'int', nullable: true })
  bold: number;

  @Column({
    comment:
      '适用系统:sda-精品 mc-苹果cms mc10-苹果10 fei4-飞飞4 sea-海洋cms ct-赤兔 zp-赞片 max-马克思',
    length: 256,
    nullable: true,
  })
  cms: string;

  @Column({ comment: '关联播放器ID', nullable: true, default: 0 })
  player_id: number;

  @Column({
    comment: '是否匹配资源播放器',
    type: 'tinyint',
    default: 0,
    nullable: true,
  })
  match_player: number;

  @Column({
    comment: '是否启用解析,1-是，2-否',
    type: 'int',
    default: 0,
    nullable: true,
  })
  use_parse: number;

  @Column({
    comment: '解析地址，视频播放地址',
    length: 256,
    default: 0,
    nullable: true,
  })
  parse_address: string;

  @Column({ comment: '排序', nullable: true, default: 0 })
  sort: number;

  @Column({ comment: 'create_at', nullable: true, type: 'bigint' })
  create_at: number;

  @Column({ comment: 'update_at', nullable: true, type: 'bigint' })
  update_at: number;
}
