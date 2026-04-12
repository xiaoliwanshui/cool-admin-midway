import {Provide, Inject, ILogger} from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Between } from 'typeorm';
import { Repository } from 'typeorm';
import { MonthlyCheckinConfigEntity } from '../entity/monthlyCheckinConfig';
import { BaseService } from '@cool-midway/core';
import { BusinessType, ScoreType } from './score';
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
  isSigned?: SignStatus;
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

  private readonly TAG = 'MonthlyCheckinConfigService';
  private readonly DEFAULT_SCORE_PER_DAY = 10;

  /**
   * 获取指定月份的所有签到配置
   * @param month 月份 (1-12)
   */
  async getConfigByMonth(month: number): Promise<MonthlyCheckinConfigWithStatus[]> {
    try {
      // 输入验证
      if (!month || month < 1 || month > 12) {
        month = new Date().getMonth() + 1;
        this.logger.debug(this.TAG, '月份参数无效，使用当前月份:', month);
      }

      // 获取当前月份的开始和结束时间
      const startTime = moment().month(month - 1).startOf('month').toDate();
      const endTime = moment().month(month - 1).endOf('month').toDate();
      // 获取当前日期
      const currentDay = new Date().getDate();

      // 获取签到配置
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

        // 为配置项设置签到状态
        return monthlyCheckinConfigs.map(config => {
          if (!signedConfigIds.has(config.id)) {
            // 判断是否为当天可签到
            if (config.day === currentDay) {
              return {
                ...config,
                isSigned: SignStatus.NOT_SIGN_IN_YET_TODAY, // 当天可签到
              };
            } else {
              return {
                ...config,
                isSigned: SignStatus.UNSIGNED, // 未签到
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
            isSigned: SignStatus.NOT_SIGN_IN_YET_TODAY, // 当天可签到
          };
        } else {
          return {
            ...config,
            isSigned: SignStatus.UNSIGNED, // 未签到
          };
        }
      });
    } catch (error) {
      this.logger.error(this.TAG, '获取签到配置失败', error);
      return [];
    }
  }

  /**
   * 获取指定月份和日期的签到配置
   * @param month 月份 (1-12)
   * @param day 日期 (1-31)
   */
  async getConfigByDate(month: number, day: number): Promise<MonthlyCheckinConfigEntity | null> {
    try {
      // 输入验证
      if (!month || month < 1 || month > 12) {
        this.logger.warn(this.TAG, '月份参数无效');
        return null;
      }
      if (!day || day < 1 || day > 31) {
        this.logger.warn(this.TAG, '日期参数无效');
        return null;
      }

      const config = await this.monthlyCheckinConfigEntity.findOne({
        where: {
          month,
          day,
        },
      });

      if (!config) {
        this.logger.debug(this.TAG, `未找到 ${month}月${day}日的签到配置`);
      }

      return config;
    } catch (error) {
      this.logger.error(this.TAG, '获取签到配置失败', error);
      return null;
    }
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
    try {
      // 输入验证
      if (!month || month < 1 || month > 12) {
        throw new Error('月份参数无效');
      }
      if (!day || day < 1 || day > 31) {
        throw new Error('日期参数无效');
      }
      if (!score || score < 0) {
        throw new Error('积分数额无效');
      }
      if (enabled !== 0 && enabled !== 1) {
        throw new Error('启用状态无效');
      }

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
        this.logger.info(this.TAG, `创建新的签到配置: ${month}月${day}日`);
      } else {
        this.logger.info(this.TAG, `更新签到配置: ${month}月${day}日`);
      }

      config.score = score;
      config.enabled = enabled;
      if (remark) {
        config.remark = remark;
      }

      const savedConfig = await this.monthlyCheckinConfigEntity.save(config);
      this.logger.debug(this.TAG, '签到配置保存成功', savedConfig);
      return savedConfig;
    } catch (error) {
      this.logger.error(this.TAG, '更新签到配置失败', error);
      throw error;
    }
  }

  /**
   * 初始化默认配置（所有月份每天默认10积分）
   * 先查询如果数据库没有任何月份的数据就初始化，如果有就不初始化
   */
  async initDefaultConfig(): Promise<InitDefaultConfigResult> {
    try {
      // 检查是否已有配置数据
      const existingConfig = await this.monthlyCheckinConfigEntity.findOne({});
      if (existingConfig) {
        this.logger.info(this.TAG, '已有签到配置数据，跳过初始化');
        return { status: 0 };
      }

      // 每个月份的天数（非闰年）
      const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      const createUserId = this.ctx.admin?.userId;

      // 批量处理配置
      const configsToSave: MonthlyCheckinConfigEntity[] = [];

      // 初始化所有12个月的数据
      for (let month = 1; month <= 12; month++) {
        const days = daysInMonth[month - 1];
        for (let day = 1; day <= days; day++) {
          const config = new MonthlyCheckinConfigEntity();
          config.month = month;
          config.day = day;
          config.score = this.DEFAULT_SCORE_PER_DAY * day; // 默认每天10积分
          config.enabled = 1; // 默认启用
          if (createUserId) {
            config.createUserId = createUserId;
          }
          configsToSave.push(config);
        }
      }

      // 批量插入
      if (configsToSave.length > 0) {
        await this.monthlyCheckinConfigEntity.save(configsToSave);
        this.logger.info(this.TAG, `成功初始化 ${configsToSave.length} 条签到配置`);
      }

      return {
        status: 1, // 成功初始化
      };
    } catch (error) {
      this.logger.error(this.TAG, '初始化签到配置失败', error);
      return {
        status: 0, // 初始化失败
      };
    }
  }
}
