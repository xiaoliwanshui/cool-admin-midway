import { ModuleConfig } from '@cool-midway/core';
import { BaseLogMiddleware } from '../base/middleware/log';

/**
 * 模块配置
 */
export default () => {
  return {
    // 模块名称
    name: '会员',
    // 模块描述
    description: '会员模块',
    // 中间件，只对本模块有效
    middlewares: [],
    // 中间件，全局有效
    globalMiddlewares: [BaseLogMiddleware],
    // 模块加载顺序，默认为0，值越大越优先加载
    order: 0
  } as ModuleConfig;
};
