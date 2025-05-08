import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { ILogger, Inject, Provide } from '@midwayjs/core';
import { PlayLineEntity } from '../entity/play_line';
import { Line } from '../bean/SourceVideo';

const TAG = 'PlayLineService';

@Provide()
export class PlayLineService extends BaseService {
  @InjectEntityModel(PlayLineEntity)
  playLineEntity: Repository<PlayLineEntity>;

  @Inject()
  logger: ILogger;

  async insert(data: Line): Promise<void> {
    try {
      // 插入或更新数据
      await this.playLineEntity.insert(data);
      this.logger.info(
        TAG,
        `insert ${data.collection_name} ${data.video_name} ${data.name} success`
      );
      // 显式释放对象引用
      data = null;
    } catch (error) {
      // 更新数据
      await this.playLineEntity.update({ file: data.file }, data);
      this.logger.info(
        TAG,
        `update ${data.collection_name} ${data.video_name} ${data.name} success`
      );
      // 显式释放对象引用
      data = null;
    }
  }
}
