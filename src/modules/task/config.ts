import { ModuleConfig } from '@cool-midway/core';
import { TaskMiddleware } from './middleware/task';

/**
 * 模块配置
 */
export default () => {
  return {
    // 模块名称
    name: '任务调度',
    // 模块描述
    description: '任务调度模块，支持分布式任务，由redis整个集群的任务',
    // 中间件
    middlewares: [TaskMiddleware],
    // 模块加载顺序，默认为0，值越大越优先加载
    order: 0,
    // 日志
    log: {
      // 日志保留时间，单位天
      keepDays: 20,
    },
    // 任务执行配置
    execution: {
      // 任务执行超时时间，单位毫秒
      timeout: 300000, // 5分钟
    },
    // 任务健康检查配置
    healthCheckInterval: 300000, // 5分钟
  } as ModuleConfig;
};
