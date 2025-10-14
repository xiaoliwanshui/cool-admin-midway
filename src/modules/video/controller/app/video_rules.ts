import {
  BaseController,
  CoolController,
  CoolUrlTag,
  TagTypes,
} from '@cool-midway/core';
import { VideoRulesEntity } from '../../entity/video_rules';

/**
 *
 */
@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: VideoRulesEntity,
  insertParam: ctx => {
    return {
      // 获得当前登录的后台用户ID，需要请求头传Authorization参数
      createUserId: ctx.user.id,
    };
  },
})
@CoolUrlTag({
  key: TagTypes.IGNORE_TOKEN,
  value: ['page', 'info'],
})
export class AppVideoRulesController extends BaseController {}
