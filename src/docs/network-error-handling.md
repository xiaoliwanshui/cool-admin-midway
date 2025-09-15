/**
 * 网络错误处理修复说明文档
 * 
 * 修复的问题：
 * 1. DNS解析失败 (ENOTFOUND) - json02.heimuer.xyz 无法解析
 * 2. 网络超时和连接错误
 * 3. 缺乏重试机制
 * 4. 错误信息不够详细
 * 
 * 解决方案：
 * 1. 创建了 NetworkErrorHandler 服务，专门处理各种网络错误
 * 2. 实现了智能重试机制，支持指数退避算法
 * 3. 详细的错误分类和日志记录
 * 4. 集成到 CollectionService 和 ConcurrencyService 中
 */

/* 错误处理流程说明：

1. **DNS解析错误处理**
   - 检测到 ENOTFOUND 错误
   - 记录详细的错误信息
   - 自动重试（最多3次）
   - 指数退避延迟（1s, 2s, 4s）

2. **超时错误处理**
   - 检测 ECONNABORTED 和 ETIMEDOUT
   - 增加超时时间到30秒
   - 重试机制
   - 详细日志记录

3. **其他网络错误**
   - 连接被拒绝 (ECONNREFUSED)
   - 网络不可达 (ENETUNREACH)
   - SSL证书错误
   - 自动分类和处理

## 使用示例：

```typescript
// 在 CollectionService 中
const result = await this.networkErrorHandler.requestWithRetry(
  {
    url: requestUrl,
    method: 'GET',
    ...this.networkErrorHandler.getCollectionAxiosConfig()
  },
  3, // 最大重试3次
  2000 // 初始延迟2秒
);

// 在 ConcurrencyService 中
const result = await this.networkErrorHandler.requestWithRetry(
  {
    url: uri,
    method: 'GET',
    ...this.networkErrorHandler.getCollectionAxiosConfig()
  },
  2, // 最大重试2次（在循环中）
  1500 // 初始延迟1.5秒
);
```

## 错误类型识别：

```typescript
if (this.networkErrorHandler.isDnsError(error)) {
  // DNS解析失败 - 可能需要检查域名状态
  console.log('域名无法解析，请检查URL配置');
}

if (this.networkErrorHandler.isTimeoutError(error)) {
  // 超时错误 - 可能是网络慢或服务器响应慢
  console.log('请求超时，请检查网络连接');
}

if (this.networkErrorHandler.isNetworkError(error)) {
  // 其他网络错误
  console.log('网络连接问题');
}
```

## 配置说明：

NetworkErrorHandler 提供了适合采集源的默认配置：
- 超时时间：30秒
- User-Agent：模拟真实浏览器
- 最大重定向：5次
- 支持压缩：gzip, deflate, br
- 连接保持：keep-alive

## 日志记录：

修复后的系统会记录详细的网络错误信息：
- 错误类型分类
- 重试次数和延迟
- 具体的错误代码和消息
- 受影响的URL

这样管理员可以：
1. 快速识别网络问题类型
2. 判断是采集源问题还是网络问题
3. 采取相应的解决措施
*/

export const NETWORK_ERROR_HANDLING_GUIDE = {
  dnsError: {
    type: 'ENOTFOUND',
    description: 'DNS解析失败，域名无法解析',
    solutions: [
      '检查域名是否正确',
      '检查DNS服务器设置',
      '尝试使用其他DNS服务器',
      '联系采集源提供商确认域名状态'
    ]
  },
  timeoutError: {
    type: 'ETIMEDOUT',
    description: '请求超时',
    solutions: [
      '检查网络连接',
      '增加超时时间',
      '检查采集源服务器状态',
      '考虑使用代理服务器'
    ]
  },
  connectionRefused: {
    type: 'ECONNREFUSED',
    description: '连接被拒绝',
    solutions: [
      '检查目标服务器是否运行',
      '检查端口是否正确',
      '检查防火墙设置',
      '联系采集源提供商'
    ]
  }
};