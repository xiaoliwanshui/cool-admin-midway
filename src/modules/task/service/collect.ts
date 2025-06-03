import { Inject, Logger, Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { ILogger } from '@midwayjs/logger';
import { CollectionService } from '../../video/service/collection';

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

  async checkVideoLine() {
    try {
      this.logger.info(TAG, '检查视频线路调用了');
      await this.collectionService.checkVideoLine();
    } catch (error) {
      this.logger.error(TAG, '检查视频线路异常', error);
      throw error;
    }
  }
}
