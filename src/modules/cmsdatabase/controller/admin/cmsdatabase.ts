import { BaseController, CoolController } from '@cool-midway/core';
import { CMSDatabaseSqlLogEntity } from '../../entity/cmssqlLog';
import { CMSDatabaseService } from '../../service/cmsdatabase';
import { Body, Get, Inject, Post } from '@midwayjs/core';

@CoolController({
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: CMSDatabaseSqlLogEntity,
  pageQueryOp: {
    fieldEq: ['sqlType'],
  },
})
export class AdminCMSDatabaseController extends BaseController {
  @Inject()
  databaseService: CMSDatabaseService;

  @Post('/execute', { summary: '执行 SQL 语句' })
  async execute(
    @Body('sql') sql: string,
    @Body('captchaId') captchaId: string,
    @Body('verifyCode') verifyCode: string
  ) {
    if (!sql) {
      return this.fail('SQL 语句不能为空');
    }

    if (!captchaId || !verifyCode) {
      return this.fail('验证码不能为空');
    }

    const result = await this.databaseService.execute(
      sql,
      captchaId,
      verifyCode
    );
    return this.ok(result);
  }
}
