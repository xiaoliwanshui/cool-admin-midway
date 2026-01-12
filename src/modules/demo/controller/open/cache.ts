import { DemoCacheService } from '../../service/cache';
import { Inject, Post, Provide, Get, InjectClient, Logger } from '@midwayjs/core';
import { CoolController, BaseController } from '@cool-midway/core';
import { CachingFactory, MidwayCache } from '@midwayjs/cache-manager';
import { ILogger } from '@midwayjs/logger';

/**
 * 缓存
 */
@CoolController()
export class OpenDemoCacheController extends BaseController {
  @InjectClient(CachingFactory, 'default')
  midwayCache: MidwayCache;

  @Logger()
  logger: ILogger;

  @Inject()
  demoCacheService: DemoCacheService;

  /**
   * 安全的缓存设置方法，处理Redis只读等错误
   */
  private async safeCacheSet(key: string, value: any, ttl?: number) {
    try {
      if (ttl) {
        await this.midwayCache.set(key, value, ttl);
      } else {
        await this.midwayCache.set(key, value);
      }
      return true;
    } catch (error) {
      // 如果Redis是只读副本，记录错误但不抛出
      if (error.message && error.message.includes('READONLY')) {
        this.logger.warn(`Redis is in read-only mode, skipping cache set for key: ${key}`, error.message);
        return false;
      } else {
        this.logger.error(`Failed to set cache for key: ${key}`, error);
        throw error;
      }
    }
  }

  /**
   * 设置缓存
   * @returns
   */
  @Post('/set', { summary: '设置缓存' })
  async set() {
    const success1 = await this.safeCacheSet('a', 1);
    // 缓存10秒
    const success2 = await this.safeCacheSet('a', 1, 10 * 1000);
    
    if (!success1 || !success2) {
      return this.fail('缓存操作失败，Redis可能处于只读模式');
    }
    
    return this.ok(await this.midwayCache.get('a'));
  }

  /**
   * 获得缓存
   * @returns
   */
  @Get('/get', { summary: '获得缓存' })
  async get() {
    return this.ok(await this.demoCacheService.get());
  }
}