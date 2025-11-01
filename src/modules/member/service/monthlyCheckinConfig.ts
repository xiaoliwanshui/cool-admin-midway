import {Provide, Inject, ILogger} from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm'
import { Between } from 'typeorm';
import { Repository } from 'typeorm';
import { MonthlyCheckinConfigEntity } from '../entity/monthlyCheckinConfig';
import { BaseService } from '@cool-midway/core';
import { BusinessType, ScoreService, ScoreType } from './score';
import { ScoreEntity } from '../entity/score';
import * as moment from "moment/moment";

// 定义返回类型接口
interface InitDefaultConfigResult {
  status: number;
}

// 定义带有签到状态的配置项类型（普通对象，不继承实体）
interface MonthlyCheckinConfigWithStatus {
  id?: number;
  month: number;
  day: number;
  score: number;
  enabled: number;
  remark?: string;
  createTime?: Date;
  updateTime?: Date;
  tenantId?: number;
  createUserId?: number;
  updateUserId?: number;
}

//定义枚举
export enum SignStatus {
  UNSIGNED = 0, // 未签到
  SIGNED = 1, // 已签到
  NOT_SIGN_IN_YET_TODAY = 3, // 当天可签到
}

/**
 * 月签到配置服务类
 */
@Provide()
export class MonthlyCheckinConfigService extends BaseService {
  @InjectEntityModel(MonthlyCheckinConfigEntity)
  monthlyCheckinConfigEntity: Repository<MonthlyCheckinConfigEntity>;
  @InjectEntityModel(ScoreEntity)
  scoreEntity: Repository<ScoreEntity>;
  @Inject()
  ctx;

  @Inject()
  logger: ILogger;

  /**
   * 获取指定月份的所有签到配置
   * @param month 月份 (1-12)
   */
  async getConfigByMonth(month: number): Promise<MonthlyCheckinConfigWithStatus[]> {
    month = month || new Date().getMonth()+ 1;
    //获取当前月份的开始时间startTime
    const startTime = moment().month(month - 1).startOf('month').toDate();
    const endTime = moment().month(month - 1).endOf('month').toDate();
    // 获取当前日期
    const currentDay = new Date().getDate();
    const monthlyCheckinConfigs = await this.monthlyCheckinConfigEntity.find({
      where: {
        month: month,
      },
      order: {
        day: 'ASC',
      },
    });

    if (this.ctx.user && this.ctx.user.id) {
      // 查询积分签到表中该用户有哪些签到记录
      const scores = await this.scoreEntity.find({
        where: {
          createUserId: this.ctx.user.id,
          businessType: BusinessType.SIGN,
          type: ScoreType.ADD,
          createTime: Between(startTime, endTime),
        },
      });

      // 将已签到的businessId（对应monthlyCheckinConfigEntity的id）提取到集合中
      const signedConfigIds = new Set(scores.map(score => score.businessId));


      // 为未签到的配置项设置remark为"未签到"
      return monthlyCheckinConfigs.map(config => {
        // 如果该配置项没有对应的签到记录
        if (!signedConfigIds.has(config.id)) {
          // 判断是否为当天可签到
          if (config.day === currentDay) {
            return {
              ...config,
              isSigned: SignStatus.NOT_SIGN_IN_YET_TODAY, // 当天可签到设置为3
            };
          } else {
            return {
              ...config,
              isSigned: SignStatus.UNSIGNED, // 当天未签到
            };
          }
        }
        return {
          ...config,
          isSigned: SignStatus.SIGNED, // 已签到
        };
      });
    }

    // 如果没有用户信息，直接返回未签到状态
    return monthlyCheckinConfigs.map(config => {
      if (config.day === currentDay) {
        return {
          ...config,
          isSigned: SignStatus.NOT_SIGN_IN_YET_TODAY, // 当天可签到设置为3
        };
      } else {
        return {
          ...config,
          isSigned: SignStatus.UNSIGNED, // 当天未签到
        };
      }
    });
  }


  /**
   * 获取指定月份和日期的签到配置
   * @param month 月份 (1-12)
   * @param day 日期 (1-31)
   */
  async getConfigByDate(month: number, day: number): Promise<MonthlyCheckinConfigEntity | null> {
    return await this.monthlyCheckinConfigEntity.findOne({
      where: {
        month,
        day,
      },
    });
  }

  /**
   * 更新月签到配置
   * @param month 月份 (1-12)
   * @param day 日期 (1-31)
   * @param score 积分数额
   * @param enabled 是否启用
   * @param remark 备注
   */
  async updateConfig(
    month: number,
    day: number,
    score: number,
    enabled: number,
    remark?: string
  ): Promise<MonthlyCheckinConfigEntity> {
    let config = await this.monthlyCheckinConfigEntity.findOne({
      where: {
        month,
        day,
      },
    });

    if (!config) {
      config = new MonthlyCheckinConfigEntity();
      config.month = month;
      config.day = day;
    }

    config.score = score;
    config.enabled = enabled;
    if (remark) {
      config.remark = remark;
    }

    return await this.monthlyCheckinConfigEntity.save(config);
  }

  /**
   * 初始化默认配置（所有月份每天默认10积分）
   * 先查询如果数据库没有任何月份的数据就初始化，如果有就不初始化
   */
  async initDefaultConfig(): Promise<InitDefaultConfigResult> {
    // 每个月份的天数（非闰年）
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // 初始化所有12个月的数据
    for (let month = 1; month <= 12; month++) {
      const days = daysInMonth[month - 1];
      for (let day = 1; day <= days; day++) {
        const config = new MonthlyCheckinConfigEntity();
        config.month = month;
        config.day = day;
        config.score = 10*day; // 默认10积分
        config.enabled = 1; // 默认启用
        if (this.ctx.admin && this.ctx.admin.userId) {
          config.createUserId = this.ctx.admin.userId;
        }
        //判断当前记录是否存在，如果存在就更新，不存在就插入
        const existConfig = await this.monthlyCheckinConfigEntity.findOne({
          where: {
            month,
            day,
          },
        });

        if (existConfig) {
          await this.monthlyCheckinConfigEntity.update(existConfig.id, config);
        }else{
          await this.monthlyCheckinConfigEntity.insert(config);
        }
      }
    }
    return {
      status: 1, // 成功初始化
    };
  }
}
