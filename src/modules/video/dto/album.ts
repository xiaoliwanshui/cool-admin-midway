import { Rule, RuleType } from '@midwayjs/validate';

/**
 * 专辑查询参数
 */
export class AlbumQueryDTO {
  // 页码
  @Rule(RuleType.number().integer().min(1).default(1))
  page?: number;

  // 每页数量
  @Rule(RuleType.number().integer().min(1).max(100).default(10))
  size?: number;

  // 视频每页数量
  @Rule(RuleType.number().integer().min(1).max(100).default(4))
  videoSize?: number;

  // 视频页码
  @Rule(RuleType.number().integer().min(1).default(1))
  videoPage?: number;

  // 分类ID
  @Rule(RuleType.number().integer().optional())
  category_id?: number;
}