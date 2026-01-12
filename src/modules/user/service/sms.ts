import { Provide, Config, Inject, Init, InjectClient, Logger } from '@midwayjs/core';
import { BaseService, CoolCommException } from '@cool-midway/core';
import * as _ from 'lodash';
import { CachingFactory, MidwayCache } from '@midwayjs/cache-manager';
import { PluginService } from '../../plugin/service/info';
import { ILogger } from '@midwayjs/logger';

/**
 * 描述
 */
@Provide()
export class UserSmsService extends BaseService {
  // 获得模块的配置信息
  @Config('module.user.sms')
  config;

  @InjectClient(CachingFactory, 'default')
  midwayCache: MidwayCache;

  @Logger()
  logger: ILogger;

  @Inject()
  pluginService: PluginService;

  plugin;

  @Init()
  async init() {
    for (const key of ['sms-tx', 'sms-ali']) {
      try {
        this.plugin = await this.pluginService.getInstance(key);
        if (this.plugin) {
          this.config.pluginKey = key;
          break;
        }
      } catch (e) {
        continue;
      }
    }
  }

  /**
   * 安全的缓存设置方法，处理Redis只读等错误
   */
  private async safeCacheSet(key: string, value: any, ttl: number) {
    try {
      await this.midwayCache.set(key, value, ttl);
      return true;
    } catch (error) {
      // 如果Redis是只读副本，记录错误但不抛出
      if (error.message && error.message.includes('READONLY')) {
        this.logger.warn(`Redis is in read-only mode, skipping cache set for key: ${key}`, error.message);
        return false;
      } else {
        this.logger.error(`Failed to set cache for key: ${key}`, error);
        return false;
      }
    }
  }

  /**
   * 发送验证码
   * @param phone
   */
  async sendSms(phone) {
    // 随机四位验证码
    const code = _.random(1000, 9999);
    const pluginKey = this.config.pluginKey;
    if (!this.plugin)
      throw new CoolCommException(
        '未配置短信插件，请到插件市场下载安装配置：https://cool-js.com/plugin?keyWord=短信'
      );
    try {
      if (pluginKey == 'sms-tx') {
        await this.plugin.send([phone], [code]);
      }
      if (pluginKey == 'sms-ali') {
        await this.plugin.send([phone], {
          code,
        });
      }
      await this.safeCacheSet(`sms:${phone}`, code, this.config.timeout * 1000);
    } catch (error) {
      // 检查是否是Redis只读错误
      if (error.message && error.message.includes('READONLY')) {
        this.logger.warn('短信验证码缓存失败，Redis处于只读模式', error.message);
        // 在只读模式下，我们可以跳过缓存，但仍然发送短信
        return;
      }
      throw new CoolCommException('发送过于频繁，请稍后再试');
    }
  }

  /**
   * 验证验证码
   * @param phone
   * @param code
   * @returns
   */
  async checkCode(phone, code) {
    try {
      const cacheCode = await this.midwayCache.get(`sms:${phone}`);
      if (code && cacheCode == code) {
        return true;
      }
      return false;
    } catch (error) {
      // 如果Redis是只读副本，记录错误但继续执行
      if (error.message && error.message.includes('READONLY')) {
        this.logger.warn('短信验证码验证失败，Redis处于只读模式', error.message);
        return false; // 在只读模式下无法验证验证码
      } else {
        this.logger.error('Failed to get SMS code from cache', error);
        return false;
      }
    }
  }
}