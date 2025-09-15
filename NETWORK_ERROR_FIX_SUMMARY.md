# 视频采集系统网络错误修复总结

## 问题概述

用户报告了视频采集系统出现DNS解析失败的错误：
```
AxiosError: getaddrinfo ENOTFOUND json02.heimuer.xyz
```

这个错误导致采集任务失败，影响了整个视频采集流程的稳定性。

## 修复实施

### 1. 创建网络错误处理器 (NetworkErrorHandler)

**文件**: `src/modules/video/service/networkErrorHandler.ts`

**主要功能**:
- 智能识别各种网络错误类型（DNS、超时、连接拒绝等）
- 实现带有指数退避算法的重试机制
- 提供详细的错误分类和日志记录
- 配置优化的采集源请求参数

**核心方法**:
```typescript
- isDnsError(error): 判断DNS解析错误
- isTimeoutError(error): 判断超时错误
- requestWithRetry(): 带重试的网络请求
- getNetworkErrorDetails(): 获取详细错误信息
```

### 2. 修改采集服务 (CollectionService)

**文件**: `src/modules/video/service/collection.ts`

**修改内容**:
- 集成NetworkErrorHandler
- 在syncVideo方法中使用requestWithRetry
- 增强错误处理和日志记录
- 特别处理DNS解析失败情况

**关键改进**:
```typescript
// 使用网络错误处理器进行请求
let result = await this.networkErrorHandler.requestWithRetry(
  {
    url: requestUrl,
    method: 'GET',
    ...this.networkErrorHandler.getCollectionAxiosConfig()
  },
  3, // 最大重试3次
  2000 // 初始延迟2秒
);
```

### 3. 修改并发服务 (ConcurrencyService)

**文件**: `src/modules/video/service/concurrencyService.ts`

**修改内容**:
- 集成NetworkErrorHandler
- 在syncVideoPage方法中使用requestWithRetry
- 改进错误日志记录，区分网络错误类型
- 优化任务状态更新，包含更详细的错误信息

### 4. 修改分类服务 (CategoryService)

**文件**: `src/modules/video/service/categoryService.ts`

**修改内容**:
- 集成NetworkErrorHandler
- 在syncCategory方法中使用requestWithRetry
- 增强分类同步的网络错误处理

## 错误处理机制

### 1. DNS解析失败 (ENOTFOUND)
- **识别**: 错误代码为 'ENOTFOUND'
- **处理**: 自动重试3次，记录详细日志
- **日志**: 记录域名解析失败信息，建议检查URL配置

### 2. 超时错误 (ETIMEDOUT)
- **识别**: 错误代码为 'ETIMEDOUT' 或 'ECONNABORTED'
- **处理**: 增加超时时间到30秒，重试机制
- **日志**: 记录超时详情，建议检查网络连接

### 3. 连接被拒绝 (ECONNREFUSED)
- **识别**: 错误代码为 'ECONNREFUSED'
- **处理**: 重试后记录详细错误信息
- **日志**: 建议检查目标服务器状态

### 4. 其他网络错误
- **SSL证书错误**: 处理自签名证书等问题
- **网络不可达**: 处理路由问题
- **重定向错误**: 最大支持5次重定向

## 配置优化

### 请求配置 (getCollectionAxiosConfig)
```typescript
{
  timeout: 30000, // 30秒超时
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
  },
  maxRedirects: 5,
  validateStatus: (status) => status >= 200 && status < 300,
}
```

## 重试策略

### 指数退避算法
- **第1次重试**: 延迟 `retryDelay * 1` ms
- **第2次重试**: 延迟 `retryDelay * 2` ms  
- **第3次重试**: 延迟 `retryDelay * 4` ms

### 重试次数配置
- **CollectionService.syncVideo**: 最大3次重试
- **ConcurrencyService.syncVideoPage**: 最大2次重试（因为在循环中）
- **CategoryService.syncCategory**: 最大3次重试

## 日志改进

### 错误分类日志
```typescript
// DNS错误
this.logger.warn(TAG, `采集源 "${collectionEntity.name}" DNS解析失败，可能需要检查域名状态`);

// 超时错误  
this.logger.warn(TAG, `请求超时 ${config.url}: ${error.message}, 第${attempt}次尝试`);

// 一般网络错误
this.logger.warn(TAG, `网络错误 ${config.url}: ${error.message}, 第${attempt}次尝试`);
```

### 任务状态记录
现在任务失败时会记录更详细的信息：
```typescript
{
  error: errorMessage,
  code: error.code || 'UNKNOWN',
  isNetworkError: this.networkErrorHandler.isNetworkError(error)
}
```

## 测试验证

### 编译测试
- ✅ TypeScript编译通过
- ✅ 没有类型错误
- ✅ 依赖注入正确

### 服务启动测试
- ✅ 服务器成功启动
- ✅ 所有模块正常加载
- ✅ 采集任务正常运行

## 预期效果

1. **DNS解析失败问题**：现在会自动重试，并记录详细错误信息
2. **网络稳定性**：提高了对临时网络问题的容错能力
3. **错误诊断**：管理员可以快速识别网络问题类型
4. **系统可靠性**：减少因网络问题导致的采集任务失败

## 后续建议

1. **监控采集源状态**：定期检查采集源域名的可用性
2. **备用采集源**：考虑为重要采集源配置备用URL
3. **网络环境优化**：检查DNS服务器配置，考虑使用更稳定的DNS
4. **告警机制**：当某个采集源连续失败时发送告警通知

通过这次修复，视频采集系统现在具备了完善的网络错误处理能力，可以更好地应对各种网络环境问题。