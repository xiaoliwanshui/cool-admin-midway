import { Inject, Logger, Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { ILogger } from '@midwayjs/logger';
import { CollectionService } from '../../video/service/collection';
import { tagSQLQuery } from '../../video/service/tagGet';
import { DictInfoService } from '../../dict/service/info';

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
    } catch (error) {
      this.logger.error(TAG, '检查视频线路异常', error);
      throw error;
    }
  }

  /**
   * 获取视频tag
   * @returns 获取视频tag
   * @throws 获取视频tag异常时抛出错误
   */
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
