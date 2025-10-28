import { Provide, Inject } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { MonthlyCheckinConfigEntity } from '../entity/monthlyCheckinConfig';
import { BaseService } from '@cool-midway/core';
import { BusinessType, ScoreService, ScoreType } from './score';
import { ScoreEntity } from '../entity/score';

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

  /**
   * 获取指定月份的所有签到配置
   * @param month 月份 (1-12)
   */
  async getConfigByMonth(month: number): Promise<MonthlyCheckinConfigWithStatus[]> {
    const monthlyCheckinConfigs = await this.monthlyCheckinConfigEntity.find({
      where: {
        month,
      },
      order: {
        day: 'ASC',
      },
    });
    if (this.ctx.user.id) {
      // 查询积分签到表中该用户有哪些签到记录
      const scores = await this.scoreEntity.find({
        where: {
          createUserId: this.ctx.user.id,
          businessType: BusinessType.SIGN,
          type: ScoreType.ADD,
          // createTime 是当前月份的
          createTime: this.ctx.helper.dayjs().format('YYYY-MM'),
        },
      });

      // 将已签到的businessId（对应monthlyCheckinConfigEntity的id）提取到集合中
      const signedConfigIds = new Set(scores.map(score => score.businessId));

      // 为未签到的配置项设置remark为"未签到"
      return monthlyCheckinConfigs.map(config => {
        // 如果该配置项没有对应的签到记录，则标记为未签到
        if (!signedConfigIds.has(config.id)) {
          return {
            ...config,
            remark: '未签到',
          };
        }
        return {
          ...config,
          remark: config.remark || ''
        };
      });
    }
    return monthlyCheckinConfigs.map(config => ({
      ...config,
      remark: config.remark || ''
    }));
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
   * 初始化默认配置（当前月份每天默认10积分）
   * 先查询如果数据库没有当前月份的数据就初始化，如果有就不初始化
   */
  async initDefaultConfig(): Promise<InitDefaultConfigResult> {
    const currentMonth = new Date().getMonth() + 1;
    const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // 包含闰年2月的最大天数

    // 检查是否已经存在当前月份的配置数据
    const existingCount = await this.monthlyCheckinConfigEntity.count({
      where: {
        month: currentMonth,
      },
    });

    // 如果当前月份已经存在数据，则不进行初始化
    if (existingCount > 0) {
      return {
        status: 0,
      };
    }

    // 如果当前月份没有数据，则进行初始化
    const days = daysInMonth[currentMonth - 1];
    for (let day = 1; day <= days; day++) {
      const config = new MonthlyCheckinConfigEntity();
      config.month = currentMonth;
      config.day = day;
      config.score = 10; // 默认10积分
      config.enabled = 1; // 默认启用
      config.createUserId = this.ctx.admin.userId;
      await this.monthlyCheckinConfigEntity.save(config);
    }
    return {
      status: 1,
    };
  }
}