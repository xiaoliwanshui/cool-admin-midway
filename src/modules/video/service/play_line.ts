import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { ILogger, Inject, Provide } from '@midwayjs/core';
import { PlayLineEntity } from '../entity/play_line';
import { Line } from '../bean/SourceVideo';
import axios from 'axios';

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
      await this.playLineEntity.save(data);
      // this.logger.info(
      //   TAG,
      //   `insert ${data.collection_name} ${data.video_name} ${data.name} success`
      // );
      // 显式释放对象引用
      data = null;
    } catch (error) {
      // 更新数据
      await this.playLineEntity.update({ file: data.file }, data);
      // this.logger.info(
      //   TAG,
      //   `update ${data.collection_name} ${data.video_name} ${data.name} success`
      // );
      // 显式释放对象引用
      data = null;
    }
  }

  /**
   * 检查链接是否可以访问
   * @param url 要检查的链接
   * @returns 如果链接可访问返回true，否则返回false
   */
  async isUrlAccessible(url: string): Promise<boolean> {
    try {
      // 如果URL为空或不以http开头，则认为不可访问
      if (!url || !url.startsWith('http')) {
        return false;
      }
      
      // 发送HEAD请求检查链接是否可访问
      await axios.head(url, {
        timeout: 5000, // 5秒超时
      });
      return true;
    } catch (error) {
      this.logger.error(TAG, `链接 ${url} 无法访问:`, error.message);
      return false;
    }
  }
}