import { InjectEntityModel } from '@midwayjs/typeorm';
import { In, Repository } from 'typeorm';
import { VideoEntity } from '../entity/videos';
import { VideoAlbumEntity } from '../entity/album';
import { VideoAlbumRelationship } from '../entity/video_album_relationship';
import { VideoWeekEntity } from '../entity/week_video';
import { WeekEntity } from '../entity/week';
import { ILogger, Inject, Provide } from '@midwayjs/core';
import { CollectionEntity } from '../entity/collection';
import { VideoLineService } from './videoLine';
import { PlayLineService } from './play_line';
import { PlayLineEntity } from '../entity/play_line';
import { DuplicateKeyHandler } from './duplicateKeyHandler';
import { MemberService } from '../../member/service/member';
import { BaseService } from '../../base/service/base';
import { DictInfoEntity } from '../../dict/entity/info';
import { DictInfoService } from '../../dict/service/info';

const TAG = 'VideosService';

@Provide()
export class VideosService extends BaseService {
  @InjectEntityModel(VideoEntity)
  videoEntity: Repository<VideoEntity>;

  @InjectEntityModel(VideoAlbumEntity)
  albumEntity: Repository<VideoAlbumEntity>;

  @InjectEntityModel(VideoAlbumRelationship)
  videoAlbumRelationship: Repository<VideoAlbumRelationship>;

  @InjectEntityModel(PlayLineEntity)
  playLineEntity: Repository<PlayLineEntity>;

  @InjectEntityModel(WeekEntity)
  weekEntity: Repository<WeekEntity>;

  @InjectEntityModel(VideoWeekEntity)
  videoWeekEntity: Repository<VideoWeekEntity>;

  @Inject()
  VideoLineService: VideoLineService;

  @Inject()
  memberService: MemberService;

  @Inject()
  playLineService: PlayLineService;

  @Inject()
  logger: ILogger;

  @Inject()
  duplicateKeyHandler: DuplicateKeyHandler;

  @Inject()
  dictInfoService: DictInfoService;

  /**
   * 修改之前
   * @param data
   * @param type
   */
  async modifyAfter(data: any, type: 'delete' | 'update' | 'add') {
    if (type === 'update') {
      if (data.vip && data.vipNumber) {
        this.playLineService.startVip(data.id, data.vipNumber - 1);
      }
      if (!data.vip) {
        this.playLineService.cancelVip(data.id);
      }
    }
  }

  /**
   * 排序查询
   */
  async sort(query: any): Promise<any> {
    query.page = query.page ? query.page : 1;
    query.size = query.size ? query.size : 10;
    let order = {};
    if (query.sort) {
      order[query.sort] = 'DESC';
    }
    const data: VideoEntity[] = await this.videoEntity.find({
      order: {
        ...order,
      },
      //且video_class字段有值
      skip: query.page * (query.page - 1),
      take: query.size,
    });
    return { list: data, pagination: { page: query.page, size: query.size } };
  }

  async week(query: any): Promise<any> {
    let { list } = await this.videoWeekPage(query);
    return await this.videoWeekVideoPage(list, query);
  }

  async videoWeekPage(query: any): Promise<any> {
    const find = this.weekEntity.createQueryBuilder();
    if (query.week) {
      find.where('week= :week', query).orderBy('sort', 'ASC');
    } else {
      find.orderBy('sort', 'DESC');
    }
    return this.entityRenderPage(find, query);
  }

  async videoWeekVideoPage(list: Array<any>, query: any): Promise<any> {
    for (const item of list) {
      let video = [];
      let data = await this.videoWeekEntity.find({
        where: { week_id: item.id },
        take: query.videoSize || 4,
      });
      for (const dataItem of data) {
        video.push(
          await this.videoEntity.findOneBy({
            id: dataItem.videos_id,
          })
        );
      }
      item['list'] = video;
    }
    return { list: list };
  }

  //批量插入
  async insert(
    videoEntity: VideoEntity,
    collectionEntity: CollectionEntity
  ): Promise<void> {
    try {
      this.logger.debug(TAG, `开始保存视频: ${videoEntity.title}`);

      // 检查必要的字段
      if (!videoEntity.title || !videoEntity.title.trim()) {
        this.logger.warn(TAG, '视频标题为空，跳过保存');
        return;
      }

      // 数据清理和验证
      this.cleanVideoData(videoEntity);

      // 使用重复键处理器安全插入
      const savedVideo = await this.duplicateKeyHandler.safeVideoInsert(
        videoEntity
      );

      if (savedVideo && savedVideo.id) {
        videoEntity.id = savedVideo.id;

        // 保存视频线路信息
        try {
          await this.VideoLineService.insert(videoEntity, collectionEntity);
          this.logger.info(TAG, `视频 "${videoEntity.title}" 及其线路保存成功`);
        } catch (lineError) {
          this.logger.error(
            TAG,
            `视频线路保存失败: ${videoEntity.title}`,
            lineError
          );
        }
      } else {
        this.logger.error(
          TAG,
          `视频保存失败，无法获取有效ID: ${videoEntity.title}`
        );
      }
    } catch (error) {
      this.logger.error(TAG, `保存视频异常: ${videoEntity?.title}`, error);

      // 如果重复键处理器也无法处理，则记录错误但不抛出异常，避免影响其他视频的处理
      if (this.duplicateKeyHandler.isDuplicateKeyError(error)) {
        this.logger.warn(TAG, `重复视频跳过: ${videoEntity?.title}`);
      }
    } finally {
      // 显式释放对象引用
      collectionEntity = null;
      videoEntity = null;
    }
  }

  /**
   * 批量更新 searchRecommendType
   * @param ids 视频ID数组
   * @param searchRecommendType 目标 searchRecommendType 值
   */
  async updateSearchRecommendType(
    ids: number[],
    searchRecommendType: number
  ): Promise<void> {
    if (!ids || ids.length === 0) {
      throw new Error('ids 不能为空');
    }
    await this.videoEntity.update({ id: In(ids) }, { searchRecommendType });
  }

  /**
   * 根据视频ID获取视频信息和线路资源
   * @param id 视频ID
   */
  async getVideoDetail(id: number, createUserId?: number): Promise<any> {
    // 获取视频基本信息
    const video = await this.videoEntity.findOne({
      where: { id },
    });

    if (!video) {
      throw new Error('视频不存在');
    }

    // 获取视频线路信息
    const videoLines = await this.VideoLineService.videoLineEntity.find({
      where: { video_id: id },
      order: { sort: 'DESC' },
    });

    // 获取每个线路下的播放资源
    const linesWithSources = [];
    for (const line of videoLines) {
      const playLines = await this.playLineService.playLineEntity.find({
        where: { video_line_id: line.id },
        order: { sort: 'ASC' },
      });

      linesWithSources.push({
        ...line,
        playLines,
      });
    }
    if (video.vip) {
      const shouldReturnLines = await this.memberService.isValidMember(
        createUserId
      );
      this.logger.warn(TAG, `shouldReturnLines: ${shouldReturnLines}`);
      if (!createUserId || !shouldReturnLines) {
        linesWithSources.forEach(item => {
          item.playLines.forEach(items => {
            items.file = '';
          });
        });
      }
    }

    return {
      video,
      lines: linesWithSources,
    };
  }

  //获取视频VideoEntity字段信息
  async getVideoEntityFields(): Promise<{ label: string; value: string }[]> {
    const metadata = this.videoEntity.metadata;
    return metadata.columns
      .map(column => {
        //设置白名单不返回指定字段
        if (
          !(
            column.propertyName === 'id' ||
            column.propertyName === 'createTime' ||
            column.propertyName === 'updateTime' ||
            column.propertyName === 'createUserId' ||
            column.propertyName === 'updateUserId' ||
            column.propertyName === 'tenantId' ||
            column.propertyName === 'title' ||
            column.propertyName === 'vip'
          )
        ) {
          return {
            value: column.propertyName,
            label: column.comment,
          };
        }
      })
      .filter(item => {
        return item !== undefined;
      });
  }

  async getVideoRank(): Promise<any> {
    try {
      //获取字典数据
      let videoCategoryEntityList: DictInfoEntity[] = (
        await this.dictInfoService.data(['search_type'])
      )['search_type'];

      let videoRankList = [];
      for (const item of videoCategoryEntityList) {
        const video = await this.videoEntity.find({
          where: {
            searchRecommendType: item.id,
          },
          take: 7,
          order: {
            sort: 'DESC',
          },
        });
        if (video.length > 0) {
          videoRankList.push({
            ...item,
            list: video,
          });
        }
      }

      return { list: videoRankList };
    } catch (error) {
      // 记录错误日志
      this.logger.error(TAG, '获取视频排行信息失败', error);
      // 抛出错误，让controller层处理并返回给前台
      throw new Error(error?.message || '获取视频排行信息失败');
    }
  }

  /**
   * 清理视频数据
   */
  private cleanVideoData(videoEntity: VideoEntity): void {
    // 确保sort字段有默认值
    if (videoEntity.sort === undefined || videoEntity.sort === null) {
      videoEntity.sort = 0;
    }

    // 清理可能为null的字符串字段
    const stringFields = [
      'video_class',
      'video_tag',
      'sub_title',
      'directors',
      'actors',
      'introduce',
    ];
    stringFields.forEach(field => {
      if (videoEntity[field] === null || videoEntity[field] === undefined) {
        videoEntity[field] = '';
      }
    });
  }

  /**
   * 截断过长的数据
   */
  private truncateVideoData(videoEntity: VideoEntity): void {
    // 字段长度限制映射
    const fieldLimits = {
      title: 191,
      sub_title: 191,
      video_tag: 191,
      video_class: 191,
      collection_name: 256,
    };

    Object.keys(fieldLimits).forEach(field => {
      if (videoEntity[field] && typeof videoEntity[field] === 'string') {
        const limit = fieldLimits[field];
        if (videoEntity[field].length > limit) {
          videoEntity[field] =
            videoEntity[field].substring(0, limit - 3) + '...';
          this.logger.warn(TAG, `字段 ${field} 已截断至 ${limit} 字符`);
        }
      }
    });
  }

  /**
   * 准备插入数据（移除id字段）
   */
  private prepareVideoForInsert(
    videoEntity: VideoEntity
  ): Partial<VideoEntity> {
    const { id, ...insertData } = videoEntity;
    return insertData;
  }

  /**
   * 准备更新数据（移除id字段和时间戳字段）
   */
  private prepareVideoForUpdate(
    videoEntity: VideoEntity
  ): Partial<VideoEntity> {
    const { id, createTime, updateTime, createUserId, ...updateData } =
      videoEntity;
    return updateData;
  }

  /**
   * 检查两个标签是否匹配（支持相似词匹配）
   * @param tag1 标签1
   * @param tag2 标签2
   * @returns 是否匹配
   */
  private isTagMatch(tag1: string, tag2: string): boolean {
    if (!tag1 || !tag2) return false;

    // 完全匹配
    if (tag1 === tag2) return true;

    // 双向包含匹配
    if (tag1.includes(tag2) || tag2.includes(tag1)) return true;

    // 相似词匹配：检查是否有共同的字，且长度相近
    const tag1Chars = Array.from(tag1);
    const tag2Chars = Array.from(tag2);
    const commonChars = tag1Chars.filter(char => tag2Chars.includes(char));
    
    const minLength = Math.min(tag1.length, tag2.length);
    const maxLength = Math.max(tag1.length, tag2.length);
    const lengthDiff = maxLength - minLength;
    
    // 长度相近（相差不超过1）且有足够的共同字符
    if (lengthDiff <= 1 && commonChars.length > 0) {
      // 对于短标签（2-3个字），如果共同字符数 >= 最小长度-1，认为匹配
      // 例如："记录"(2字) 和 "纪录"(2字) 有1个共同字符"录"，1 >= 2-1=1，匹配
      // 例如："记录"(2字) 和 "纪录片"(3字) 有1个共同字符"录"，1 >= 2-1=1，匹配
      if (minLength <= 3 && commonChars.length >= minLength - 1) {
        return true;
      }
      // 对于较长的标签（>3字），要求至少有一半的共同字符
      if (minLength > 3 && commonChars.length >= Math.floor(minLength / 2)) {
        return true;
      }
    }

    return false;
  }

  /**
   * 视频重新匹配分类
   * 为 category_id 为 0 的视频自动匹配分类
   * @returns 返回匹配结果和未匹配成功的视频信息
   */
  async rematchCategory(): Promise<{
    matchedCount: number;
    unmatchedVideos: Array<{
      id: number;
      title?: string;
      video_class: string;
      video_tag: string;
    }>;
  }> {
    try {
      // 查找需要匹配分类的视频
      const videos = await this.videoEntity.find({
        where: {
          category_id: 0,
        },
        take: 100,
      });

      if (!videos || videos.length === 0) {
        this.logger.info(TAG, '没有需要匹配分类的视频');
        return {
          matchedCount: 0,
          unmatchedVideos: [],
        };
      }

      // 获取分类字典数据
      const data: any = await this.dictInfoService.data(['video_category']);
      const categories = data?.video_category || [];

      if (categories.length === 0) {
        this.logger.warn(TAG, '未找到视频分类数据');
        // 返回所有视频作为未匹配
        return {
          matchedCount: 0,
          unmatchedVideos: videos.map(video => ({
            id: video.id,
            title: video.title,
            video_class: video.video_class || '',
            video_tag: video.video_tag || '',
          })),
        };
      }

      // 使用 Map 存储视频ID到分类信息的映射，避免重复更新
      const videoCategoryMap = new Map<
        number,
        { categoryId: number; categoryPid: number }
      >();

      // 遍历视频和分类进行匹配
      for (const videoItem of videos) {
        // 如果已经匹配到分类，跳过
        if (videoCategoryMap.has(videoItem.id)) {
          continue;
        }

        const videoClass = videoItem.video_class || '';
        const videoTag = videoItem.video_tag || '';

        // 如果 video_class 和 video_tag 都为空，随机分配一个分类
        if (!videoClass && !videoTag) {
          if (categories.length > 0) {
            // 随机选择一个分类
            const randomIndex = Math.floor(Math.random() * categories.length);
            const randomCategory = categories[randomIndex];
            videoCategoryMap.set(videoItem.id, {
              categoryId: randomCategory.id,
              categoryPid: randomCategory.parentId || 0,
            });
            this.logger.info(
              TAG,
              `视频 ${videoItem.id} (${videoItem.title}) 随机分配分类: ${randomCategory.name}`
            );
          }
          continue;
        }

        // 将 video_class 按逗号分割成标签数组（去除空格）
        const videoClassTags = videoClass
          ? videoClass
              .split(',')
              .map(tag => tag.trim())
              .filter(tag => tag)
          : [];

        // 将 video_tag 按逗号分割成标签数组（去除空格）
        const videoTagTags = videoTag
          ? videoTag
              .split(',')
              .map(tag => tag.trim())
              .filter(tag => tag)
          : [];

        // 合并 video_class 和 video_tag 的标签数组
        const allVideoTags = [...videoClassTags, ...videoTagTags];

        // 遍历分类进行匹配
        for (const category of categories) {
          const categoryName = category.name || '';
          const categoryRemark = category.remark || '';

          // 匹配规则1: video_class 或 video_tag 包含分类名称
          const matchByName =
            (videoClass && videoClass.includes(categoryName)) ||
            (videoTag && videoTag.includes(categoryName));

          // 匹配规则2: 分类备注与 video_class 或 video_tag 有标签交集
          // 将 categoryRemark 按逗号分割成标签数组（去除空格）
          const categoryRemarkTags = categoryRemark
            ? categoryRemark
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag)
            : [];

          // 检查是否有共同的标签（支持智能匹配，包括相似词匹配）
          const matchByRemark =
            categoryRemarkTags.length > 0 &&
            allVideoTags.length > 0 &&
            allVideoTags.some(videoTag =>
              categoryRemarkTags.some(remarkTag =>
                this.isTagMatch(videoTag, remarkTag)
              )
            );

          if (matchByName || matchByRemark) {
            videoCategoryMap.set(videoItem.id, {
              categoryId: category.id,
              categoryPid: category.parentId || 0,
            });
            // 找到第一个匹配的分类后，跳出内层循环
            break;
          }
        }
      }

      // 批量更新匹配到的视频
      if (videoCategoryMap.size > 0) {
        const updatePromises = Array.from(videoCategoryMap.entries()).map(
          ([videoId, categoryInfo]) =>
            this.videoEntity.update(videoId, {
              category_id: categoryInfo.categoryId,
              category_pid: categoryInfo.categoryPid,
            })
        );

        await Promise.all(updatePromises);
        this.logger.info(TAG, `成功为 ${videoCategoryMap.size} 个视频匹配分类`);
      } else {
        this.logger.info(TAG, '未匹配到任何分类');
      }

      // 收集未匹配成功的视频信息
      const matchedVideoIds = new Set(videoCategoryMap.keys());
      const unmatchedVideos = videos
        .filter(video => !matchedVideoIds.has(video.id))
        .map(video => ({
          id: video.id,
          title: video.title,
          video_class: video.video_class || '',
          video_tag: video.video_tag || '',
        }));

      return {
        matchedCount: videoCategoryMap.size,
        unmatchedVideos,
      };
    } catch (error) {
      this.logger.error(TAG, '视频分类匹配失败', error);
      throw error;
    }
  }
}
