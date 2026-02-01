# 任务健康检查修复说明

## 问题描述

系统出现重复的日志输出：
```
2026-02-01 14:01:56.648 INFO 6096 开始检查Bull任务中的卡住任务...
2026-02-01 14:01:56.648 INFO 6096 开始检查卡住的任务...
2026-02-01 14:01:56.651 INFO 6096 未发现过期的Bull任务锁
2026-02-01 14:01:56.651 INFO 6096 开始检查Bull任务中的卡住任务...
2026-02-01 14:01:56.651 INFO 6096 开始检查卡住的任务...
2026-02-01 14:01:56.653 INFO 6096 未发现过期的任务锁
```

并且之前被卡住的定时任务没有重新执行。

## 问题根源

1. **重复日志输出**：系统中同时运行了两个任务服务：
   - `TaskBullService` (Bull队列任务)
   - `TaskLocalService` (本地定时任务)
   两个服务都在执行健康检查，导致重复日志

2. **卡住任务未恢复**：本地任务的锁清理后没有自动重新执行

3. **日志级别不当**：健康检查使用INFO级别，导致日志过多

## 修复内容

### 🚨 紧急修复：本地任务服务初始化错误

**问题**：
```
ERROR Init local task error: TypeError: Cannot read properties of undefined (reading 'getOrmManager')
```

**原因**：
- `TaskLocalService` 继承了 `BaseService`，但使用了 `@Scope(ScopeEnum.Singleton)`
- `BaseService` 期望 `Request` 作用域，导致 `getOrmManager` 方法不可用
- 事务调用方式与当前作用域不兼容

**修复**：
1. **更改继承关系**：从 `BaseService` 改为 `CoolServiceBase`
2. **简化事务处理**：移除 `getOrmManager().transaction` 调用
3. **使用直接保存**：改为 `entity.save()` 方法
4. **保持作用域**：维持 `Singleton` 作用域配置

### 1. 优化日志输出

#### Bull任务服务 (TaskBullService)
- 将健康检查日志改为DEBUG级别
- Bull队列自带锁机制，不需要额外的锁检查
- 只检查长时间运行的任务并给出警告

#### 本地任务服务 (TaskLocalService)
- 将健康检查日志改为DEBUG级别
- 保留WARN级别的锁清理和重试日志
- 增加任务自动重试机制

### 2. 增加任务自动恢复

```typescript
// 清理锁后自动重新执行卡住的任务
if (task.status === 1) {
  this.logger.info(`重新执行卡住的本地任务: ${task.name}`);
  try {
    await this.executeJob(task);
    this.logger.info(`卡住任务重新执行成功: ${task.name}`);
  } catch (error) {
    this.logger.error(`卡住任务重新执行失败: ${task.name}, 错误:`, error);
  }
}
```

### 3. 统一配置管理

在 `config.default.ts` 中添加任务配置：

```typescript
task: {
  // 日志保留天数
  log: {
    keepDays: 20
  },
  // 任务执行超时时间（毫秒）
  execution: {
    timeout: 300000 // 5分钟
  },
  // 健康检查间隔时间（毫秒）
  healthCheckInterval: 600000 // 10分钟，减少日志频率
}
```

### 4. 调整检查间隔

- 将健康检查间隔从5分钟调整为10分钟
- 减少不必要的日志输出频率

## 修复效果

### 修复前
- 每5分钟输出重复的INFO日志
- 卡住的任务不会自动恢复
- 日志冗余，影响系统监控

### 修复后
- 健康检查日志改为DEBUG级别，减少INFO日志
- 卡住的本地任务会自动重新执行
- Bull任务只检查异常情况，不输出无意义日志
- 统一的配置管理，便于调整参数

## 验证方法

1. **运行测试脚本**：
   ```bash
   npm run dev
   # 或
   node test-task-health.ts
   ```

2. **观察日志输出**：
   - 不再出现重复的INFO日志
   - 只有在发现问题时才输出WARN/ERROR日志

3. **测试任务恢复**：
   - 手动创建一个长时间运行的任务
   - 等待超时后观察是否自动恢复

## 注意事项

1. **日志级别**：DEBUG级别的日志在生产环境中可能不会显示，如需查看请调整日志配置
2. **配置调整**：可根据实际需求调整 `healthCheckInterval` 和 `executionTimeout`
3. **监控告警**：建议对WARN级别的日志设置监控告警

## 相关文件

- `src/modules/task/service/bull.ts` - Bull任务服务
- `src/modules/task/service/local.ts` - 本地任务服务  
- `src/config/config.default.ts` - 配置文件
- `src/modules/task/entity/info.ts` - 任务实体
- `test-task-health.ts` - 测试脚本