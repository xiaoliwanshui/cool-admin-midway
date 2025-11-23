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
      // 先检查是否存在相同 file 的记录
      const existing = await this.playLineEntity.findOne({
        where: { file: data.file },
      });

      if (existing) {
        // 如果存在，更新记录
        await this.playLineEntity.update({ file: data.file }, data);
        this.logger.info(
          TAG,
          `update ${data.collection_name} ${data.video_name} ${data.name} success`
        );
      } else {
        // 如果不存在，插入新记录
        await this.playLineEntity.save(data);
        this.logger.info(
          TAG,
          `insert ${data.collection_name} ${data.video_name} ${data.name} success`
        );
      }
    } catch (error) {
      // 如果仍然出现重复键错误，尝试更新
      if (
        error.code === 'ER_DUP_ENTRY' ||
        error.errno === 1062 ||
        (error.message && error.message.includes('Duplicate entry'))
      ) {
        try {
          await this.playLineEntity.update({ file: data.file }, data);
          this.logger.info(
            TAG,
            `update (duplicate key) ${data.collection_name} ${data.video_name} ${data.name} success`
          );
        } catch (updateError) {
          this.logger.error(
            TAG,
            `update failed for ${data.collection_name} ${data.video_name} ${data.name}:`,
            updateError.message
          );
          throw updateError;
        }
      } else {
        this.logger.error(
          TAG,
          `insert failed for ${data.collection_name} ${data.video_name} ${data.name}:`,
          error.message
        );
        throw error;
      }
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

  //根据 传入的  video_id 查询出所有的播放线路  并按照 sort 排序 按照collection_id 进行分组
  async startVip(video_id: number,vipNumber:number): Promise<{[collection_id: number]: PlayLineEntity[]}> {
    const playLines = await this.playLineEntity.find({
      where: { video_id },
      order: { sort: 'ASC' },
    });
    const groupedPlayLines = playLines.reduce((acc, playLine) => {
      if (!acc[playLine.collection_id]) {
        acc[playLine.collection_id] = [];
      }
      acc[playLine.collection_id].push(playLine);
      return acc;
    }, {} as {[collection_id: number]: PlayLineEntity[]});
    //将每一组的数据以vipNumber为起始index 将后续所有的数据的 vip字段设置为1
    Object.values(groupedPlayLines).forEach((playLines) => {
      // 添加安全检查，确保vipNumber不小于0且不大于数组长度
      if (vipNumber >= 0 && vipNumber < playLines.length) {
        for (let i = vipNumber; i < playLines.length; i++) {
          playLines[i].vip = 1;
        }
      }
    });
    //将数据更新到数据库
    await this.playLineEntity.save(playLines);
    return groupedPlayLines;
  }

  //取消vip
  async cancelVip(video_id: number): Promise<void> {
    await this.playLineEntity.update({ video_id: video_id }, { vip: 0 });
  }
}