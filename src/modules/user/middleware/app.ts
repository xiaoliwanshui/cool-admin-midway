import {
  ALL,
  Config,
  IMiddleware,
  Init,
  Inject,
  Middleware,
  ILogger,
} from '@midwayjs/core';
import { Context, NextFunction } from '@midwayjs/koa';
import * as jwt from 'jsonwebtoken';
import * as _ from 'lodash';
import { CoolCommException, CoolUrlTagData, TagTypes } from '@cool-midway/core';
import { Utils } from '../../../comm/utils';

/**
 * 用户
 */
@Middleware()
export class UserMiddleware implements IMiddleware<Context, NextFunction> {
  @Config(ALL)
  coolConfig;

  @Inject()
  coolUrlTagData: CoolUrlTagData;

  @Config('module.user.jwt')
  jwtConfig;

  ignoreUrls: string[] = [];

  @Config('koa.globalPrefix')
  prefix;

  @Inject()
  utils: Utils;

  @Inject()
  logger: ILogger;

  @Init()
  async init() {
    this.ignoreUrls = this.coolUrlTagData.byKey(TagTypes.IGNORE_TOKEN, 'app');
    // 打印所有忽略的URL列表
    this.logger.info('UserMiddleware', `忽略token的URL列表: ${JSON.stringify(this.ignoreUrls)}`);
  }

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      let { url } = ctx;
      url = url.replace(this.prefix, '').split('?')[0];
      if (_.startsWith(url, '/app/')) {
        const token = ctx.get('Authorization');
        try {
          ctx.user = jwt.verify(token, this.jwtConfig.secret);

          if (ctx.user.isRefresh) {
            throw new CoolCommException(`${JSON.stringify(this.ignoreUrls)}`);
          }
        } catch (error) {}
        // 使用matchUrl方法来检查URL是否应该被忽略
        const isIgnored = this.ignoreUrls.some(pattern =>
          this.utils.matchUrl(pattern, url)
        );
        
        // 打印调试信息
        this.logger.info('UserMiddleware', `请求URL: ${url}`);
        this.logger.info('UserMiddleware', `是否匹配忽略列表: ${isIgnored}`);
        if (!isIgnored) {
          this.logger.info('UserMiddleware', `忽略列表: ${JSON.stringify(this.ignoreUrls)}`);
        }
        
        if (isIgnored) {
          await next();
          return;
        } else {
          if (!ctx.user) {
            ctx.status = 401;
            throw new CoolCommException('登录失效~', 401);
          }
        }
      }
      await next();
    };
  }
}
