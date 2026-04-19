import { Provide, Inject, Scope, ScopeEnum } from '@midwayjs/core';

import { Repository, DataSource } from 'typeorm';
import { CMSDatabaseSqlLogEntity } from '../entity/cmssqlLog';
import * as _ from 'lodash';
import * as crypto from 'crypto';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { BaseService } from '../../base/service/base';
import { CoolCommException } from '@cool-midway/core';
import { BaseSysLoginService } from '../../base/service/sys/login';

/**
 * 数据库服务
 */
@Provide()
export class CMSDatabaseService extends BaseService {
  @Inject()
  ctx;

  @Inject()
  baseSysLoginService: BaseSysLoginService;

  @InjectEntityModel(CMSDatabaseSqlLogEntity)
  databaseSqlLogEntity: Repository<CMSDatabaseSqlLogEntity>;

  /**
   * 获取 SQL 类型
   */
  getSqlType(sql: string): string {
    const trimmed = sql.trim().toUpperCase();
    const sqlTypes = [
      'SELECT',
      'INSERT',
      'UPDATE',
      'DELETE',
      'CREATE',
      'DROP',
      'ALTER',
      'TRUNCATE',
      'REPLACE',
    ];

    for (const type of sqlTypes) {
      if (trimmed.startsWith(type)) {
        return type;
      }
    }

    return 'UNKNOWN';
  }

  /**
   * 获取警告信息
   */
  getWarning(sqlType: string): string {
    const warnings: Record<string, string> = {
      DROP: '⚠️ 危险操作：DROP 语句会永久删除数据库对象',
      TRUNCATE: '⚠️ 危险操作：TRUNCATE 会清空整个表数据',
      DELETE: '⚠️ 注意：DELETE 操作会删除数据，请确保有 WHERE 条件',
      UPDATE: '⚠️ 注意：UPDATE 操作会修改数据，请确保有 WHERE 条件',
      ALTER: '⚠️ 注意：ALTER 会修改表结构',
      CREATE: 'ℹ️ 提示：CREATE 会创建新的数据库对象',
      REPLACE: '⚠️ 注意：REPLACE 会替换现有数据',
    };

    return warnings[sqlType] || '';
  }

  /**
   * 执行 SQL
   */
  async execute(sql: string, captchaId: string, verifyCode: string) {
    // 验证验证码
    const check = await this.baseSysLoginService.captchaCheck(
      captchaId,
      verifyCode
    );
    if (!check) {
      throw new CoolCommException('图片验证码错误');
    }

    const startTime = Date.now();
    const sqlType = this.getSqlType(sql);

    try {
      // 执行 SQL
      const result = await this.nativeQuery(sql);

      const endTime = Date.now();
      const executionTime = endTime - startTime;
      const warning = this.getWarning(sqlType);
      const affectedRows = result?.changedRows || 0;

      // 记录日志
      await this.logExecution(
        sql,
        sqlType,
        executionTime,
        this.ctx.admin?.userId,
        true,
        undefined,
        affectedRows,
        warning
      );

      return {
        data: result || [],
        affectedRows,
        time: executionTime,
        sqlType,
        warning,
      };
    } catch (error: any) {
      const endTime = Date.now();

      // 记录错误日志
      await this.logExecution(
        sql,
        this.getSqlType(sql),
        endTime - startTime,
        this.ctx.admin?.userId,
        false,
        error.message,
        0,
        undefined
      );

      throw new Error(`SQL 执行失败：${error.message}`);
    } finally {
    }
  }

  /**
   * 记录执行日志
   */
  private async logExecution(
    sql: string,
    sqlType: string,
    time: number,
    userId?: number,
    success?: boolean,
    error?: string,
    affectedRows?: number,
    warning?: string
  ) {
    try {
      // 使用 entityManager 保存日志
      await this.databaseSqlLogEntity.insert({
        sql,
        sqlType,
        status: success ? 1 : 0,
        affectedRows: affectedRows || 0,
        error: error || null,
        warning: warning || null,
        createUserId: this.ctx.admin?.userId,
        executionTime: time,
      });
    } catch (e) {
      // 日志记录失败不影响主流程
      console.error('记录 SQL 日志失败:', e);
    }
  }
}
