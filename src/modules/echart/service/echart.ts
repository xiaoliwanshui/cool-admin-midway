import { BaseService } from '@cool-midway/core';
import { Inject, Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Between, Not, Repository } from 'typeorm';
import { UserInfoEntity } from '../../user/entity/info';
import { BaseSysLogEntity } from '../../base/entity/sys/log';
import { ViewsEntity } from '../../user/entity/views';
import { VideoEntity } from '../../video/entity/videos';
import { RedisService } from '@midwayjs/redis';
import { DictInfoService } from '../../dict/service/info';
import { PlayLineEntity } from '../../video/entity/play_line';
import { FeedbackInfoEntity } from '../../application/entity/feedbackInfo';

/**
 * 用户信息
 */
@Provide()
export class EChartService extends BaseService {
  @InjectEntityModel(UserInfoEntity)
  userInfoEntity: Repository<UserInfoEntity>;

  @InjectEntityModel(FeedbackInfoEntity)
  feedbackInfoEntity: Repository<FeedbackInfoEntity>;

  @InjectEntityModel(BaseSysLogEntity)
  sysLogEntity: Repository<BaseSysLogEntity>;

  @InjectEntityModel(ViewsEntity)
  viewsEntity: Repository<ViewsEntity>;

  @InjectEntityModel(PlayLineEntity)
  playLineEntity: Repository<PlayLineEntity>;

  @InjectEntityModel(VideoEntity)
  videoEntity: Repository<VideoEntity>;

  @Inject()
  dictInfoService: DictInfoService;


  @Inject()
  redisService: RedisService;

  // 统计user的总数量和今日新增数量
  async user() {
    return {
      total: await this.userInfoEntity.count(),
      today: await this.userInfoEntity.countBy({
        createTime: new Date()
      })
    };
  }

  //统计playLineEntity status =0的数量 和占比(百分比)
  async playLine() {
    const fail: number = await this.playLineEntity.countBy({
      status: 0
    });
    const success: number = await this.playLineEntity.countBy({
      status: 1
    });
    return {
      fail,
      success,
      percent: (fail / (success + fail)) * 100
    };
  }

  //统计feedbackInfoEntity feedbackType =0的数量 和占比(百分比)
  async feedback() {
    //计算feedbackInfoEntity 周同比 日同比
    return {
      week: await this.feedbackInfoEntity.countBy({
        createTime: Between(
          new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
          new Date()
        )
      }),
      day: await this.feedbackInfoEntity.countBy({
        createTime: Between(
          new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
          new Date()
        )
      }),
      sum: await this.feedbackInfoEntity.count()
    };
  }

  // 统计访问的总数量和今日新增数量
  async visit() {
    return {
      total: await this.sysLogEntity.count(),
      today: await this.sysLogEntity.countBy({
        createTime: new Date()
      }),
      data: await this.getUserViewsByHourIntervals()
    };
  }

  /**
   * sysLogEntity实体中的params字段为json数据 统计params中keyWord字段不为空的记录 并统计出对应的次数
   */
  async keyWord() {
    return await this.sysLogEntity
      .createQueryBuilder('sysLog')
      .select('MAX(sysLog.params)', 'params') // 使用 MAX 聚合函数处理非分组字段
      .addSelect('COUNT(sysLog.id)', 'count')
      .where('sysLog.params IS NOT NULL')
      .andWhere('JSON_EXTRACT(sysLog.params, \'$.keyWord\') IS NOT NULL') // 修改 JSON 路径表达式
      .groupBy('JSON_EXTRACT(sysLog.params, \'$.keyWord\')') // 修改 GROUP BY 中的 JSON 路径表达式
      .orderBy('count', 'DESC')
      .limit(12)
      .getRawMany();
  }

  // 新增函数：统计 title 出现次数最多的前十条记录（分今日、本周、本月、本年）
  async statisticTitleCount() {
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const endOfToday = new Date(now.setHours(23, 59, 59, 999));

    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31);

    const getTopTitles = async (startTime: Date, endTime: Date) => {
      return await this.viewsEntity
        .createQueryBuilder('view')
        .select('view.title', 'title')
        .addSelect('COUNT(view.title)', 'count')
        .where('view.createTime BETWEEN :startTime AND :endTime', {
          startTime,
          endTime
        })
        .groupBy('view.title')
        .orderBy('count', 'DESC')
        .limit(10)
        .getRawMany();
    };

    return {
      today: await getTopTitles(startOfToday, endOfToday),
      week: await getTopTitles(startOfWeek, endOfWeek),
      month: await getTopTitles(startOfMonth, endOfMonth),
      year: await getTopTitles(startOfYear, endOfYear)
    };
  }

  //根据视频category_pid分组统计数据并返回
  async videoCategoryPid() {
    const data: any = await this.dictInfoService.data(['video_category']);

    const list = await this.videoEntity
      .createQueryBuilder('video')
      .where({
        category_pid: Not(0)
      })
      .select('video.category_pid', 'category_pid')
      .addSelect('COUNT(video.id)', 'value')
      .groupBy('video.category_pid')
      .getRawMany();
    list.forEach(item => {
      item.name = data.video_category.find(
        item2 => item2.id === item.category_pid
      )?.name;
      item.value = Number(item.value);
    });
    return list;
  }

  // 统计视频的createTime 往后12天的数据量 每一天的新数据量 按天为单位返回
  async videoCreateTime() {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - 11); // 获取过去12天的起始日期
    return {
      update: await this.videoEntity
        .createQueryBuilder('video')
        .select('DATE(video.updateTime)', 'date') // 按天分组日期格式化成年月日格式
        .addSelect('COUNT(video.id)', 'value') // 统计每天的数据量
        .where('video.updateTime BETWEEN :startDate AND :endDate', {
          startDate,
          endDate: now
        })
        .groupBy('DATE(video.updateTime)') // 按日期分组
        .orderBy('DATE(video.updateTime)', 'ASC') // 按日期升序排列
        .limit(12) // 限制返回最多12条数据
        .getRawMany(), // 返回原始数据
      create: await this.videoEntity
        .createQueryBuilder('video')
        .select('DATE(video.createTime)', 'date') // 按天分组日期格式化成年月日格式
        .addSelect('COUNT(video.id)', 'value') // 统计每天的数据量
        .where('video.createTime BETWEEN :startDate AND :endDate', {
          startDate,
          endDate: now
        })
        .andWhere(
          'video.updateTime IS NULL OR video.updateTime = video.createTime'
        ) // 过滤仅包含 createTime 的记录
        .groupBy('DATE(video.createTime)') // 按日期分组
        .orderBy('DATE(video.createTime)', 'ASC') // 按日期升序排列
        .limit(12) // 限制返回最多12条数据
        .getRawMany() // 返回原始数据
    };
  }

  //videoEntity play_url_put_in =0 的数量
  async videoPlayUrlPutInCount() {
    return await this.videoEntity.countBy({
      play_url_put_in: 0
    });
  }

  //调用前面所有的方法并返回数据
  async getData() {
    const data = {
      user: await this.user(),
      visit: await this.visit(),
      statisticTitleCount: await this.statisticTitleCount(),
      videoCategory: await this.videoCategoryPid(),
      videoCreateTime: await this.videoCreateTime(),
      keyWord: await this.keyWord(),
      playLine: await this.playLine(),
      feedback: await this.feedback(),
      videoPlayUrlPutInCount: await this.videoPlayUrlPutInCount()
    };
    //判断redis中是否有数据，有则删除 没有就插入
    if (await this.redisService.exists('video:echarts')) {
      await this.redisService.del('video:echarts');
    }
    this.redisService.lpush('video:echarts', JSON.stringify(data));
    this.redisService.expire('video:echarts', 60 * 60);
    return data;
  }

  //将redis的数据返回出去
  async info() {
    let data = await this.redisService.lpop('video:echarts');
    if (data) {
      return JSON.parse(data);
    } else {
      return await this.getData();
    }
  }

  async getUserViewsByHourIntervals() {
    const hourIntervals = [
      '00:00',
      '2:00',
      '4:00',
      '6:00',
      '8:00',
      '10:00',
      '12:00',
      '14:00',
      '16:00',
      '18:00',
      '20:00',
      '22:00'
    ];

    const now = new Date();
    const results = {};

    for (let i = 0; i < hourIntervals.length; i++) {
      const startTime = new Date(now);
      const endTime = new Date(now);

      // 设置当前小时区间的时间范围
      const [hours] = hourIntervals[i].split(':');
      startTime.setHours(Number(hours), 0, 0, 0);
      endTime.setHours(Number(hours) + 2, 0, 0, 0);

      // 查询对应时间区间的浏览数
      // 将结果存入对应的时间区间
      results[hourIntervals[i]] = await this.sysLogEntity.count({
        where: {
          createTime: Between(startTime, endTime)
        }
      });
    }

    return results;
  }
}
