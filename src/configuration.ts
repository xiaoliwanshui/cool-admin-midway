import * as orm from '@midwayjs/typeorm';
import {
  App,
  Configuration,
  ILogger,
  IMidwayApplication,
  Inject,
  MidwayWebRouterService,
} from '@midwayjs/core';
import * as koa from '@midwayjs/koa';
// import * as crossDomain from '@midwayjs/cross-domain';
import * as validate from '@midwayjs/validate';
import * as info from '@midwayjs/info';
import * as staticFile from '@midwayjs/static-file';
import * as cron from '@midwayjs/cron';
import * as DefaultConfig from './config/config.default';
import * as LocalConfig from './config/config.local';
import * as ProdConfig from './config/config.prod';
import * as cool from '@cool-midway/core';
import * as upload from '@midwayjs/upload';
// import * as task from '@cool-midway/task';
// import * as rpc from '@cool-midway/rpc';
import * as prometheus from '@midwayjs/prometheus'; // 导入模块
import * as redis from '@midwayjs/redis';

@Configuration({
  imports: [
    // https://koajs.com/
    koa,
    // 是否开启跨域(注：顺序不能乱放！！！) http://www.midwayjs.org/docs/extensions/cross_domain
    // crossDomain,
    // 静态文件托管 https://midwayjs.org/docs/extensions/static_file
    staticFile,
    // orm https://midwayjs.org/docs/extensions/orm
    orm,
    // 参数验证 https://midwayjs.org/docs/extensions/validate
    validate,
    // 本地任务 http://www.midwayjs.org/docs/extensions/cron
    cron,
    // 文件上传
    upload,
    // cool-admin 官方组件 https://cool-js.com
    cool,
    // rpc 微服务 远程调用
    // rpc,
    // 任务与队列
    // task,
    {
      component: info,
      enabledEnvironment: ['local', 'prod'],
    },
    prometheus,
    redis, // 导入 redis 组件
  ],
  importConfigs: [
    {
      default: DefaultConfig,
      local: LocalConfig,
      prod: ProdConfig,
    },
  ],
})
export class MainConfiguration {
  @App()
  app: IMidwayApplication;

  @Inject()
  webRouterService: MidwayWebRouterService;

  @Inject()
  logger: ILogger;

  async onReady() {
    // 处理未捕获的 Promise rejection
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      this.logger.error(
        '未处理的 Promise Rejection',
        {
          reason: reason?.message || reason,
          stack: reason?.stack,
          promise: promise.toString(),
        }
      );

      // 如果是数据库连接错误，记录详细信息
      if (reason?.code === 'ER_NET_READ_INTERRUPTED' || reason?.code === 'ETIMEDOUT') {
        this.logger.error(
          '数据库连接错误',
          {
            code: reason.code,
            errno: reason.errno,
            sqlState: reason.sqlState,
            sqlMessage: reason.sqlMessage,
          }
        );
      }

      // 不退出进程，让应用继续运行
      // 生产环境可以考虑记录到监控系统
    });

    // 处理未捕获的异常
    process.on('uncaughtException', (error: Error) => {
      this.logger.error('未捕获的异常', {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });

      // 对于数据库连接错误，不退出进程
      if (
        error.message?.includes('timeout') ||
        error.message?.includes('ETIMEDOUT') ||
        error.message?.includes('ER_NET_READ_INTERRUPTED')
      ) {
        this.logger.warn('数据库连接超时，应用将继续运行');
        return;
      }

      // 其他严重错误，记录后退出
      this.logger.error('严重错误，进程将退出');
      process.exit(1);
    });
  }
}
