import { IMiddleware, Middleware } from '@midwayjs/core';
import { Context, NextFunction } from '@midwayjs/koa';
import { BaseSysLogService } from '../service/sys/log';

/**
 * 日志中间件
 */
@Middleware()
export class BaseLogMiddleware implements IMiddleware<Context, NextFunction> {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      const baseSysLogService = await ctx.requestContext.getAsync(
        BaseSysLogService
      );
      baseSysLogService.record(
        ctx,
        ctx.url,
        ctx.req.method === 'GET' ? ctx.request.query : ctx.request.body,
        ctx.admin ? ctx.admin.userId : null,
        ctx.request.headers
      );
      await next();
    };
  }
}
