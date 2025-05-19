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

  /**
   * 描述
   */
  async day(id: number) {
    this.logger.info(TAG, '日采集调用了');
    await this.collectionService.day(id);
    return '任务执行成功';
  }

  async week(id: number) {
    this.logger.info(TAG, '周采集调用了');
    await this.collectionService.week(id);
    return '任务执行成功';
  }

  async videoFilter() {
    this.logger.info(TAG, '数据分类调用了');
    const SQLQuery =
      'UPDATE video v SET play_url_put_in = CASE WHEN EXISTS (SELECT 1 FROM video_line vl WHERE vl.video_id = v.id) THEN 1 ELSE 0 END;';
    try {
      await this.nativeQuery(SQLQuery);
    } catch (error) {
      this.logger.error(TAG, error);
      await this.nativeQuery('ROLLBACK;'); // 回滚事务
      throw error; // 或者根据业务需求进行其他处理
    }
  }

  async checkVideoLine() {
    this.logger.info(TAG, '检查视频线路调用了');
    await this.collectionService.checkVideoLine();
  }
}
