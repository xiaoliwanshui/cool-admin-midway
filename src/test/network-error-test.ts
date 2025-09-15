import { NetworkErrorHandler } from '../modules/video/service/networkErrorHandler';
import { Logger } from '@midwayjs/core';

// 简单的日志模拟器
class MockLogger {
  debug(tag: string, message: string, ...args: any[]) {
    console.log(`[DEBUG] ${tag}: ${message}`, ...args);
  }
  
  info(tag: string, message: string, ...args: any[]) {
    console.log(`[INFO] ${tag}: ${message}`, ...args);
  }
  
  warn(tag: string, message: string, ...args: any[]) {
    console.log(`[WARN] ${tag}: ${message}`, ...args);
  }
  
  error(tag: string, message: string, ...args: any[]) {
    console.log(`[ERROR] ${tag}: ${message}`, ...args);
  }
}

// 测试网络错误处理器
async function testNetworkErrorHandler() {
  const networkHandler = new NetworkErrorHandler();
  networkHandler.logger = new MockLogger() as any;

  console.log('=== 网络错误处理器测试 ===\n');

  // 测试1: 正常的HTTP请求
  console.log('测试1: 正常的HTTP请求');
  try {
    const result = await networkHandler.requestWithRetry({
      url: 'https://httpbin.org/get',
      method: 'GET'
    }, 1, 1000);
    console.log('✅ 正常请求成功\n');
  } catch (error) {
    console.log(`❌ 正常请求失败: ${error.message}\n`);
  }

  // 测试2: DNS解析失败 (模拟原始错误)
  console.log('测试2: DNS解析失败');
  try {
    const result = await networkHandler.requestWithRetry({
      url: 'https://json02.heimuer.xyz/api.php/provide/vod',
      method: 'GET'
    }, 2, 1000);
    console.log('✅ DNS请求意外成功\n');
  } catch (error) {
    console.log(`✅ DNS错误被正确处理: ${networkHandler.getNetworkErrorDetails(error)}\n`);
  }

  // 测试3: 不存在的域名
  console.log('测试3: 不存在的域名');
  try {
    const result = await networkHandler.requestWithRetry({
      url: 'https://nonexistent-domain-12345.com/test',
      method: 'GET'
    }, 2, 500);
    console.log('✅ 不存在域名请求意外成功\n');
  } catch (error) {
    console.log(`✅ 不存在域名错误被正确处理: ${networkHandler.getNetworkErrorDetails(error)}\n`);
  }

  // 测试4: 超时错误 (设置很短的超时时间)
  console.log('测试4: 超时错误');
  try {
    const result = await networkHandler.requestWithRetry({
      url: 'https://httpbin.org/delay/10', // 延迟10秒的接口
      method: 'GET',
      timeout: 1000 // 1秒超时
    }, 1, 500);
    console.log('✅ 超时请求意外成功\n');
  } catch (error) {
    console.log(`✅ 超时错误被正确处理: ${networkHandler.getNetworkErrorDetails(error)}\n`);
  }

  // 测试5: 检查URL可用性
  console.log('测试5: 检查URL可用性');
  const isAvailable1 = await networkHandler.checkUrlAvailability('https://httpbin.org');
  console.log(`httpbin.org 可用性: ${isAvailable1 ? '✅ 可用' : '❌ 不可用'}`);
  
  const isAvailable2 = await networkHandler.checkUrlAvailability('https://json02.heimuer.xyz');
  console.log(`json02.heimuer.xyz 可用性: ${isAvailable2 ? '✅ 可用' : '❌ 不可用'}`);

  console.log('\n=== 测试完成 ===');
}

// 运行测试
if (require.main === module) {
  testNetworkErrorHandler().catch(console.error);
}

export { testNetworkErrorHandler };