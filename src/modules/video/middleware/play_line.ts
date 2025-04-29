import { CoolUrlTagData } from '@cool-midway/core';
import { IMiddleware, Inject, Middleware } from '@midwayjs/core';
import { Context, NextFunction } from '@midwayjs/koa';

@Middleware()
export class PlayLineMiddleware implements IMiddleware<Context, NextFunction> {
  @Inject()
  tag: CoolUrlTagData;

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      let { url } = ctx;
      // 这里可以拿到下一个中间件或者控制器的返回值
      const result = await next();
      if (url.includes('play_line/page')) {
        //result.data.list按照 video_line_id分组排序
        console.log(result.data.list);
        result.data.list = this.sortVideosByTagAndSort(result.data.list);
      }
      // 返回给上一个中间件的结果
      return result;
    };
  }

  sortVideosByTagAndSort(videos) {
    return videos.sort((a, b) => {
      // 首先比较tag
      if (a.video_line_id < b.video_line_id) {
        return -1;
      }
      if (a.video_line_id > b.video_line_id) {
        return 1;
      }
      // 如果tag相等，则比较sort
      if (a.sort < b.sort) {
        return -1;
      }
      if (a.sort > b.sort) {
        return 1;
      }
      // 如果两者都相等，则保持原顺序（稳定排序）
      return 0;
    });
  }
}
