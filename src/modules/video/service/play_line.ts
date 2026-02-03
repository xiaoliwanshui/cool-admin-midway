import {BaseService} from '@cool-midway/core';
import {InjectEntityModel} from '@midwayjs/typeorm';
import {In, Repository} from 'typeorm';
import {ILogger, Inject, InjectClient, Provide} from '@midwayjs/core';
import {PlayLineEntity} from '../entity/play_line';
import {Line} from '../bean/SourceVideo';
import axios from 'axios';
import {VideoLineEntity} from '../entity/video_line';
import {playFileMergeSQL} from "./play_file_merge";
import {CachingFactory, MidwayCache} from '@midwayjs/cache-manager';

const TAG = 'PlayLineService';

@Provide()
export class PlayLineService extends BaseService {
  @InjectEntityModel(PlayLineEntity)
  playLineEntity: Repository<PlayLineEntity>;

  @InjectEntityModel(VideoLineEntity)
  videoLineEntity: Repository<VideoLineEntity>;

  @Inject()
  logger: ILogger;

  @InjectClient(CachingFactory, 'default')
  midwayCache: MidwayCache;

  private readonly CACHE_TTL = 300; // 缓存时间5分钟

  async insert(data: Line): Promise<void> {
    // 如果 data.video_line_id 不存在或无效，就不执行以下逻辑
    // 使用严格检查：null、undefined、0 都视为无效
    if (!data.video_line_id || data.video_line_id === null || data.video_line_id === undefined) {
      return;
    }

    // 检查数据源是否可用
    if (!this.playLineEntity) {
      this.logger.error(TAG, `PlayLineEntity 数据源未正确初始化`);
      throw new Error('PlayLineEntity 数据源未正确初始化');
    }

    // 优化：使用缓存避免重复查询
    const cacheKey = `playLine:file:${data.file}`;
    const cachedExists = await this.midwayCache.get(cacheKey);

    if (cachedExists) {
      this.logger.debug(TAG, `播放线路已存在，跳过: ${data.file}`);
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
          video_line_id: data.video_line_id
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
          `insert ${data.collection_name} ${data.video_name} ${data.name} video_line_id ${data.video_line_id}  success`
        );
      }

      // 缓存存在标记
      await this.midwayCache.set(cacheKey, true, this.CACHE_TTL);
    } catch (error) {
      // 检查是否是数据源错误
      if (error && error.message && error.message.includes('DataSource undefined not found')) {
        this.logger.error(TAG, `数据源错误: ${data.collection_name} ${data.video_name} ${data.name}`, error);
        throw error;
      }

      // 如果仍然出现重复键错误，尝试更新
      if (
        error.code === 'ER_DUP_ENTRY' ||
        error.errno === 1062 ||
        (error.message && error.message.includes('Duplicate entry'))
      ) {
        try {
          // 更新时也要确保 video_line_id 有效
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
            video_line_id: data.video_line_id
          };
          await this.playLineEntity.update({file: data.file}, updateData);
          this.logger.info(
            TAG,
            `update (duplicate key) ${data.collection_name} ${data.video_name} ${data.name} video_line_id ${data.video_line_id}  success`
          );

          // 缓存存在标记
          await this.midwayCache.set(cacheKey, true, this.CACHE_TTL);
        } catch (updateError) {
          // 检查是否是数据源错误
          if (updateError && updateError.message && updateError.message.includes('DataSource undefined not found')) {
            this.logger.error(TAG, `数据源错误 (更新阶段): ${data.collection_name} ${data.video_name} ${data.name}`, updateError);
            throw updateError;
          }

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
      // this.logger.error(TAG, `链接 ${url} 无法访问:`, error.message);
      return false;
    }
  }

  //根据 传入的  video_id 查询出所有的播放线路  并按照 sort 排序 按照collection_id 进行分组
  async startVip(video_id: number, vipNumber: number): Promise<{ [collection_id: number]: PlayLineEntity[] }> {
    const cacheKey = `playLines:grouped:${video_id}`;

    // 尝试从缓存获取分组数据
    const cachedData = await this.midwayCache.get(cacheKey);
    if (cachedData) {
      this.logger.debug(TAG, `从缓存获取分组播放线路: ${video_id}`);
      return cachedData as { [collection_id: number]: PlayLineEntity[] };
    }

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

    // 优化：使用批量更新代替逐个保存
    const idsToUpdate: number[] = [];
    Object.values(groupedPlayLines).forEach((playLines) => {
      if (vipNumber >= 0 && vipNumber < playLines.length) {
        for (let i = vipNumber; i < playLines.length; i++) {
          idsToUpdate.push(playLines[i].id);
        }
      }
    });

    if (idsToUpdate.length > 0) {
      await this.playLineEntity.update({id: In(idsToUpdate)}, {vip: 1});
      this.logger.info(TAG, `批量更新VIP状态: ${idsToUpdate.length} 条记录`);
    }

    // 缓存分组数据
    await this.midwayCache.set(cacheKey, groupedPlayLines, this.CACHE_TTL);

    return groupedPlayLines;
  }

  //取消vip
  async cancelVip(video_id: number): Promise<void> {
    await this.playLineEntity.update({video_id: video_id}, {vip: 0});
  }

  //实现一个删除接口删除异常的播放线路 status: 0 的线路 并且video_id相同的线路都删除
  async delete(ids: number[]): Promise<void> {
    const playLine = await this.playLineEntity.findBy({id: In(ids)});
    for (const line of playLine) {
      await this.playLineEntity.delete(line.id);
      if (line.video_line_id) {
        await this.videoLineEntity.delete(line.video_line_id);
      }
    }
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

  idsDelete(ids: number[] | string[]) {
    // 将数字转换为字符串以匹配 bigint 类型
    const stringIds = ids.map(id => id.toString());
    this.playLineEntity.delete({
      video_id: In(stringIds)
    });
  }
}
