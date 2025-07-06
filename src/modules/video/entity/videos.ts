import { Column, Entity, Index, Unique } from 'typeorm';
import { BaseEntity } from '../../base/entity/base';

/**
 * 订单信息c
 */
@Entity('video')
@Unique(['title'])
export class VideoEntity extends BaseEntity {
  @Index({ fulltext: true }) // 定义全文索引
  @Column({ comment: '影片标题', length: 191, nullable: true })
  title: string;
  @Column({ comment: '影片副标题', length: 191, nullable: true })
  sub_title: string;

  @Column({ comment: '影片标签', length: 191, nullable: true })
  video_tag: string;
  @Column({ comment: '影片类型', length: 191, nullable: true })
  video_class: string;
  //添加索引
  @Index()
  @Column({ comment: '分类', nullable: true })
  category_id: number;
  @Column({ comment: '父级分类', nullable: true })
  category_pid: number;
  @Column({ comment: '影片封面图', type: 'text', nullable: true })
  surface_plot: string;
  @Column({
    comment: '是否轮播 1是 2否',
    type: 'bigint',
    nullable: true,
    default: 2,
  })
  cycle: number;
  @Column({
    comment: '轮播图片',
    type: 'text',
    nullable: true,
  })
  cycle_img: string;
  @Index({ fulltext: true }) // 定义全文索引
  @Column({ comment: '导演', type: 'text', nullable: true })
  directors: string;
  @Index({ fulltext: true }) // 定义全文索引
  @Column({ comment: '演员', type: 'text', nullable: true })
  actors: string;
  @Column({
    comment: 'imd评分.百分制',
    type: 'bigint',
    nullable: true,
    default: 0,
  })
  imdb_score: number;
  @Column({
    comment: 'iimd评分ID',
    length: 256,
    nullable: true,
    default: 0,
  })
  imdb_score_id: string;
  @Column({
    comment: '豆瓣评分.百分制',
    nullable: true,
    type: 'int',
    default: 0,
  })
  douban_score: number;
  @Column({
    comment: '豆瓣评分ID',
    nullable: true,
  })
  douban_score_id: string;
  @Column({
    comment: '简介',
    type: 'text',
    nullable: true,
  })
  introduce: string;
  @Column({
    comment: '总人气',
    type: 'bigint',
    nullable: true,
    default: 0,
  })
  popularity: number;
  @Column({
    comment: '日人气',
    type: 'bigint',
    nullable: true,
    default: 0,
  })
  popularity_day: number;

  @Column({
    comment: '周人气',
    type: 'bigint',
    nullable: true,
    default: 0,
  })
  popularity_week: number;
  @Column({
    comment: '月人气',
    type: 'bigint',
    nullable: true,
    default: 0,
  })
  popularity_month: number;
  @Column({
    comment: '总人气',
    type: 'bigint',
    nullable: true,
    default: 0,
  })
  popularity_sum: number;
  @Column({
    comment: '连载状态',
    length: 256,
    nullable: true,
  })
  note: string;
  @Column({
    comment: '年份',
    default: 0,
  })
  @Index()
  year: number;
  @Column({
    comment: '状态',
    nullable: true,
    type: 'bigint',
  })
  status: number;
  @Column({
    comment: '时长(单位s)',
    nullable: true,
    type: 'bigint',
  })
  duration: number;
  @Index()
  @Column({
    comment: '自定义地区',
    nullable: true,
  })
  region: number;
  @Index()
  @Column({
    comment: '自定义语言',
    nullable: true,
  })
  language: number;
  @Column({
    comment: '总集数',
    nullable: true,
    default: 1,
    type: 'bigint',
  })
  number: number;
  @Column({
    comment: '更新集数',
    nullable: true,
    default: 1,
    type: 'bigint',
  })
  total: number;
  @Column({
    comment: '横屏海报',
    nullable: true,
    type: 'text',
  })
  horizontal_poster: string;
  @Column({
    comment: '备注',
    nullable: true,
    type: 'text',
  })
  remarks: string;
  @Column({
    comment: '竖屏海报',
    nullable: true,
    type: 'text',
  })
  vertical_poster: string;
  @Column({
    comment: '发行商',
    nullable: true,
    type: 'text',
  })
  publish: string;
  @Column({
    comment: '上映日期',
    nullable: true,
    type: 'text',
  })
  pubdate: string;
  @Column({
    comment: '序列号',
    nullable: true,
    type: 'text',
  })
  serial_number: string;
  @Column({
    comment: '截屏',
    nullable: true,
    type: 'text',
  })
  screenshot: string;
  @Column({
    comment: '是否连载完毕 0,1',
    nullable: true,
    type: 'tinyint',
  })
  end: number;
  @Column({
    comment: '单位',
    nullable: true,
    length: 32,
  })
  unit: string;
  @Column({
    comment: '采集的源地址',
    nullable: true,
    type: 'longtext',
  })
  play_url: string;
  @Index()
  @Column({
    comment: '播放地址是否入库1-1已经入库 0未入库',
    nullable: true,
    default: 0, // 默认值是0，
    type: 'int',
  })
  play_url_put_in: number;
  @Index()
  @Column({ comment: '资源id', nullable: true })
  collection_id: number;

  @Index()
  @Column({ comment: '顶数', nullable: true })
  up: number;

  @Index()
  @Column({ comment: '踩数', nullable: true })
  down: number;

  @Column({ comment: '资源名称', nullable: true, length: 256 })
  collection_name: string;
}
