import { Provide } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { ScoreEntity } from '../entity/score';
import { BaseService } from '@cool-midway/core';

/**
 * 积分服务类
 */
@Provide()
export class ScoreService extends BaseService {
  @InjectEntityModel(ScoreEntity)
  scoreEntity: Repository<ScoreEntity>;

  /**
   * 增加积分
   * @param createUserId 用户ID
   * @param score 积分数量
   * @param reason 原因
   * @param businessId 业务ID
   * @param businessType 业务类型
   */
  async addScore(
    createUserId: number,
    score: number,
    reason?: string,
    businessId?: number,
    businessType?: string
  ) {
    const record = new ScoreEntity();
    record.createUserId = createUserId;
    record.score = score;
    record.reason = reason;
    record.type = 1; // 增加
    record.businessId = businessId;
    record.businessType = businessType;
    return await this.scoreEntity.save(record);
  }

  /**
   * 减少积分
   * @param createUserId
   * @param score 积分数量
   * @param reason 原因
   * @param businessId 业务ID
   * @param businessType 业务类型
   */
  async reduceScore(
    createUserId: number,
    score: number,
    reason?: string,
    businessId?: number,
    businessType?: string
  ) {
    const record = new ScoreEntity();
    record.createUserId = createUserId;
    record.score = score;
    record.reason = reason;
    record.type = 2; // 减少
    record.businessId = businessId;
    record.businessType = businessType;
    return await this.scoreEntity.save(record);
  }

  /**
   * 获取用户积分总和
   * @param createUserId 用户ID
   */
  async getUserTotalScore(createUserId: number): Promise<number> {
    const result = await this.scoreEntity
      .createQueryBuilder('score')
      .select('SUM(CASE WHEN score.type = 1 THEN score.score ELSE -score.score END)', 'total')
      .where('score.createUserId = :createUserId', { createUserId })
      .getRawOne();

    return result?.total ? parseInt(result.total) : 0;
  }

  /**
   * 获取用户积分记录
   * @param createUserId 用户ID
   * @param page 页码
   * @param size 每页数量
   */
  async getUserScoreRecords(createUserId: number, page: number = 1, size: number = 20) {
    return await this.scoreEntity.findAndCount({
      where: { createUserId },
      order: { id: 'DESC' },
      skip: (page - 1) * size,
      take: size
    }).then(([records, total]) => {
      return {
        records,
        total,
        page,
        size
      };
    });
  }
}