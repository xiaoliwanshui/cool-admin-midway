import { ILogger, Inject, Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { VideoHostKeyWordEntity } from '../entity/hot_keyword';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository, In } from 'typeorm';
import { DictInfoService } from '../../dict/service/info';
import { DictInfoEntity } from '../../dict/entity/info';
@Provide()
export class HotKeywordService extends BaseService {
  @InjectEntityModel(VideoHostKeyWordEntity)
  videoHostKeyWordEntity: Repository<VideoHostKeyWordEntity>;

  @Inject()
  dictInfoService: DictInfoService;

  @Inject()
  logger: ILogger;

  async getVideoHotWords(): Promise<{
    list: Array<{ id: number; name: string; list: any[] }>;
  }> {
    try {
      // 获取字典数据
      const dictData = await this.dictInfoService.data(['video_category']);
      const videoCategoryEntityList: DictInfoEntity[] =
        dictData['video_category'] || [];

      if (videoCategoryEntityList.length === 0) {
        return { list: [] };
      }

      // 提取所有分类ID
      const categoryIds = videoCategoryEntityList.map(item => item.id);

      // 一次性查询所有分类的热门关键词
      const allHotWords = await this.videoHostKeyWordEntity.find({
        where: {
          category_id: In(categoryIds),
        },
        take: categoryIds.length * 8, // 确保获取足够的数据
        order: {
          sort: 'DESC',
        },
      });

      // 按分类ID分组
      const hotWordsByCategory = allHotWords.reduce((acc, word) => {
        const categoryId = word.category_id;
        if (!acc[categoryId]) {
          acc[categoryId] = [];
        }
        // 每个分类最多保留8个
        if (acc[categoryId].length < 8) {
          acc[categoryId].push(word);
        }
        return acc;
      }, {} as Record<number, any[]>);

      // 构建结果
      const videoHotWordsList = videoCategoryEntityList
        .map(item => {
          const list = hotWordsByCategory[item.id] || [];
          return {
            ...item,
            list,
          };
        })
        .filter(item => item.list.length > 0);

      return { list: videoHotWordsList };
    } catch (error) {
      this.logger.error('获取视频热门关键词失败', error);
      return { list: [] };
    }
  }
}
