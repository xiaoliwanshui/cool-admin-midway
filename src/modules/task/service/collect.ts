import { Inject, Logger, Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { ILogger } from '@midwayjs/logger';
import { CollectionService } from '../../video/service/collection';
import { tagSQLQuery } from '../../video/service/tagGet';
import { DictInfoService } from '../../dict/service/info';
import { RedisService } from '@midwayjs/redis';

/**
 * TaskCollectService
 */
const TAG: String = 'TaskCollectService';

@Provide()
export class TaskCollectService extends BaseService {
  @Logger()
  logger: ILogger;

  @Inject()
  collectionService: CollectionService;

  @Inject()
  dictInfoService: DictInfoService;

  @Inject()
  redisService: RedisService;

  /**
   * 执行每日采集任务
   * @param id 视频ID
   * @returns 返回任务执行结果
   * @throws 采集任务异常时抛出错误
   */
  async day(id: number) {
    try {
      this.logger.info(TAG, '日采集调用了');
      await this.collectionService.day(id);
      return '任务执行成功';
    } catch (error) {
      this.logger.error(TAG, '日采集任务异常', error);
      throw error;
    }
  }

  async startCollection() {
    try {
      this.logger.info(TAG, '采集调用了');
      await this.collectionService.startCollection();
      return '任务执行成功';
    } catch (error) {
      this.logger.error(TAG, '采集任务异常', error);
      throw error;
    }
  }

  /**
   * 执行每周采集任务
   * @param id 视频ID
   * @returns 返回任务执行结果
   * @throws 采集任务异常时抛出错误
   */
  async week(id: number) {
    try {
      this.logger.info(TAG, '周采集调用了');
      await this.collectionService.week(id);
      return '任务执行成功';
    } catch (error) {
      this.logger.error(TAG, '周采集任务异常', error);
      throw error;
    }
  }

  /**
   * 过滤视频数据并更新数据库
   * @returns 返回任务执行结果
   * @throws 数据分类异常时抛出错误
   */
  async videoFilter() {
    this.logger.info(TAG, '数据分类调用了');
    const SQLQuery =
      'UPDATE video v SET play_url_put_in = CASE WHEN EXISTS (SELECT 1 FROM video_line vl WHERE vl.video_id = v.id) THEN 1 ELSE 0 END;';
    try {
      await this.nativeQuery(SQLQuery);
       return '任务执行成功';
    } catch (error) {
      this.logger.error(TAG, '数据分类异常', error);
      await this.nativeQuery('ROLLBACK;');
      throw error;
    }
  }

  /**
   * 检查视频线路是否正常
   * @returns 返回任务执行结果
   * @throws 检查视频线路异常时抛出错误
   */
  async checkVideoLine() {
    try {
      this.logger.info(TAG, '检查视频线路调用了');
      await this.collectionService.checkVideoLine();
       return '任务执行成功';
    } catch (error) {
      this.logger.error(TAG, '检查视频线路异常', error);
      throw error;
    }
  }

  /**
   * 诊断视频采集问题
   * @returns 返回诊断结果
   */
  async diagnosisCollection() {
    try {
      this.logger.info(TAG, '开始诊断视频采集问题');
      
      const diagnosis = {
        redisStatus: null,
        collectionSources: [],
        categoryMappings: [],
        recentTasks: [],
        systemHealth: {}
      };
      
      // 1. 检查Redis状态
      try {
        const redisExists = await this.redisService.exists('video:collection');
        const redisLength = redisExists ? await this.redisService.llen('video:collection') : 0;
        diagnosis.redisStatus = {
          connected: true,
          queueExists: !!redisExists,
          queueLength: redisLength
        };
        this.logger.info(TAG, `Redis状态: 连接正常，队列长度: ${redisLength}`);
      } catch (error) {
        diagnosis.redisStatus = { connected: false, error: error.message };
        this.logger.error(TAG, 'Redis连接失败', error);
      }
      
      // 2. 检查采集源和分类映射
      const sql = `
        SELECT 
          c.id as collection_id,
          c.name as collection_name,
          c.address,
          c.status,
          COUNT(cc.id) as category_count
        FROM collection c
        LEFT JOIN collection_category cc ON c.id = cc.collection_id
        GROUP BY c.id
        ORDER BY c.id
      `;
      
      const collections = await this.nativeQuery(sql);
      diagnosis.collectionSources = collections;
      
      this.logger.info(TAG, `找到 ${collections.length} 个采集源`);
      collections.forEach(col => {
        if (col.category_count === 0) {
          this.logger.warn(TAG, `采集源 "${col.collection_name}" (ID: ${col.collection_id}) 未配置分类映射`);
        }
      });
      
      // 3. 检查最近的采集任务
      const taskSql = `
        SELECT 
          id, taskName, taskStatus, 
          startDate, endDate, errorMessage
        FROM collection_task
        ORDER BY id DESC
        LIMIT 10
      `;
      
      const recentTasks = await this.nativeQuery(taskSql);
      diagnosis.recentTasks = recentTasks;
      
      // 4. 系统健康检查
      const memoryUsage = process.memoryUsage();
      diagnosis.systemHealth = {
        memory: {
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB'
        },
        uptime: Math.round(process.uptime()) + 's'
      };
      
      this.logger.info(TAG, '诊断完成', diagnosis);
      return diagnosis;
      
    } catch (error) {
      this.logger.error(TAG, '诊断过程失败', error);
      throw error;
    }
  }
  async getVideoTag() {
    try {
      const tags: any[] = await this.nativeQuery(tagSQLQuery);
      this.logger.info(TAG, '获取视频tag成功', tags);
      for (const tag of tags) {
        const tagValues = await this.dictInfoService.findByName(tag.tag);
        if (!tagValues) {
          await this.dictInfoService.insertData(
            {
              name:
              tag.tag,
              orderNum:
                1,
              status:
                1,
              typeId:
                54
            }
          );
          this.logger.info(TAG, '添加视频tag成功', tag.tag);
        } else {
          this.logger.info(TAG, '视频tag已存在', tag.tag);
        }
      }

    } catch (error) {
      this.logger.error(TAG, '获取视频tag异常', error);
      throw error;
    }
  }
}
