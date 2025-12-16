import {BaseService} from '@cool-midway/core';
import {InjectEntityModel} from '@midwayjs/typeorm';
import {In, Repository} from 'typeorm';
import {ILogger, Inject, Provide} from '@midwayjs/core';
import {PlayLineEntity} from '../entity/play_line';
import {Line} from '../bean/SourceVideo';
import axios from 'axios';
import {VideoLineEntity} from '../entity/video_line';
import {playFileMergeSQL} from "./play_file_merge";

const TAG = 'PlayLineService';

@Provide()
export class PlayLineService extends BaseService {
  @InjectEntityModel(PlayLineEntity)
  playLineEntity: Repository<PlayLineEntity>;

  @InjectEntityModel(VideoLineEntity)
  videoLineEntity: Repository<VideoLineEntity>;

  @Inject()
  logger: ILogger;

  async insert(data: Line): Promise<void> {
    // 如果 data.video_line_id 不存在或无效，就不执行以下逻辑
    // 使用严格检查：null、undefined、0 都视为无效
    if (!data.video_line_id || data.video_line_id === null || data.video_line_id === undefined) {
      return;
    }
    try {
      // 先检查是否存在相同 file 的记录
      const existing = await this.playLineEntity.findOne({
        where: {file: data.file},
      });

      if (existing) {
        // 如果存在，只更新必要的字段
        // 由于前面已经检查过 data.video_line_id 有效，这里直接使用
        const updateData: Partial<Line> = {
          name: data.name,
          file: data.file,
          sub_title: data.sub_title,
          video_id: data.video_id,
          video_name: data.video_name,
          tag: data.tag,
          sort: data.sort,
          collection_id: data.collection_id,
          collection_name: data.collection_name,
          video_line_id: data.video_line_id, // 使用已验证的有效 video_line_id
        };
        await this.playLineEntity.update({file: data.file}, updateData);
        this.logger.info(
          TAG,
          `update ${data.collection_name} ${data.video_name} ${data.name} video_line_id ${data.video_line_id}  success`
        );
      } else {
        // 如果不存在，插入新记录
        await this.playLineEntity.save(data);
        this.logger.info(
          TAG,
          `insert ${data.collection_name} ${data.video_name} ${data.name} video_line_id ${data.video_line_id} success`
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
          // 更新时也要确保 video_line_id 有效
          // 由于前面已经检查过 data.video_line_id 有效，这里直接使用
          const updateData: Partial<Line> = {
            name: data.name,
            file: data.file,
            sub_title: data.sub_title,
            video_id: data.video_id,
            video_name: data.video_name,
            tag: data.tag,
            sort: data.sort,
            collection_id: data.collection_id,
            collection_name: data.collection_name,
            video_line_id: data.video_line_id, // 使用已验证的有效 video_line_id
          };
          await this.playLineEntity.update({file: data.file}, updateData);
          this.logger.info(
            TAG,
            `update (duplicate key) ${data.collection_name} ${data.video_name} ${data.name} video_line_id ${data.video_line_id} success`
          );
        } catch (updateError) {
          // this.logger.error(
          //   TAG,
          //   `update failed for ${data.collection_name} ${data.video_name} ${data.name}:`,
          //   updateError.message
          // );
          throw updateError;
        }
      } else {
        // this.logger.error(
        //   TAG,
        //   `insert failed for ${data.collection_name} ${data.video_name} ${data.name}:`,
        //   error.message
        // );
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
      // this.logger.error(TAG, `链接 ${url} 无法访问:`, error.message);
      return false;
    }
  }

  //根据 传入的  video_id 查询出所有的播放线路  并按照 sort 排序 按照collection_id 进行分组
  async startVip(video_id: number, vipNumber: number): Promise<{ [collection_id: number]: PlayLineEntity[] }> {
    const playLines = await this.playLineEntity.find({
      where: {video_id},
      order: {sort: 'ASC'},
    });
    const groupedPlayLines = playLines.reduce((acc, playLine) => {
      if (!acc[playLine.collection_id]) {
        acc[playLine.collection_id] = [];
      }
      acc[playLine.collection_id].push(playLine);
      return acc;
    }, {} as { [collection_id: number]: PlayLineEntity[] });
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
    await this.playLineEntity.update({video_id: video_id}, {vip: 0});
  }

  //实现一个删除接口删除异常的播放线路 status: 0 的线路 并且video_id相同的线路都删除
  async delete(ids: number[]): Promise<void> {
    const playLine = await this.playLineEntity.findBy({id: In(ids)});
    playLine.forEach(async (line) => {
      await this.playLineEntity.delete(line.id);
      await this.videoLineEntity.delete(line.video_line_id);
    });
  }

  //实现一个合并接口
  async merge(): Promise<string> {
    try {
      await this.nativeQuery(playFileMergeSQL);
      return '任务执行成功';
    } catch (error) {
      this.logger.error(TAG, 'Error occurred during merge operation:', error.message);
      throw error;
    }
  }
}


