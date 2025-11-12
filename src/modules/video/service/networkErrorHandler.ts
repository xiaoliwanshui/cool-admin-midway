import { App, ILogger, Inject, IMidwayApplication, Provide } from '@midwayjs/core';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

const TAG = 'NetworkErrorHandler';

@Provide()
export class NetworkErrorHandler {
  @Inject()
  logger: ILogger;

  @App()
  app: IMidwayApplication;

  private readonly maxConcurrentRequests = 4;
  private pendingRequests = 0;
  private readonly requestQueue: Array<() => void> = [];
  private axiosClient: AxiosInstance = axios.create();

  /**
   * 判断是否为网络相关错误
   */
  isNetworkError(error: any): boolean {
    if (error.isAxiosError) {
      const axiosError = error as AxiosError;
      // DNS解析失败
      if (axiosError.code === 'ENOTFOUND') {
        return true;
      }
      // 连接超时
      if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT') {
        return true;
      }
      // 连接被拒绝
      if (axiosError.code === 'ECONNREFUSED') {
        return true;
      }
      // 网络不可达
      if (axiosError.code === 'ENETUNREACH') {
        return true;
      }
      // SSL/TLS相关错误
      if (axiosError.code === 'DEPTH_ZERO_SELF_SIGNED_CERT' || 
          axiosError.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
        return true;
      }
    }
    return false;
  }

  /**
   * 判断是否为DNS解析错误
   */
  isDnsError(error: any): boolean {
    return error.isAxiosError && error.code === 'ENOTFOUND';
  }

  /**
   * 判断是否为超时错误
   */
  isTimeoutError(error: any): boolean {
    return error.isAxiosError && 
           (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT');
  }

  /**
   * 带重试的网络请求
   */
  async requestWithRetry(
    config: AxiosRequestConfig,
    maxRetries: number = 3,
    retryDelay: number = 1000
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const task = () => {
        this.runInBackground(async () => {
          try {
            const response = await this.executeRequest(config, maxRetries, retryDelay);
            resolve(response);
          } catch (error) {
            reject(error);
          } finally {
            this.pendingRequests--;
            this.processQueue();
          }
        });
      };

      if (this.pendingRequests < this.maxConcurrentRequests) {
        this.pendingRequests++;
        task();
      } else {
        this.requestQueue.push(() => {
          this.pendingRequests++;
          task();
        });
      }
    });
  }

  /**
   * 检查URL是否可访问
   */
  async checkUrlAvailability(url: string): Promise<boolean> {
    return new Promise(resolve => {
      const task = () => {
        this.runInBackground(async () => {
          try {
            await this.axiosClient.head(url, { timeout: 5000 });
            resolve(true);
          } catch (error) {
            this.logger.warn(TAG, `URL不可访问: ${url} - ${error.message}`);
            resolve(false);
          } finally {
            this.pendingRequests--;
            this.processQueue();
          }
        });
      };

      if (this.pendingRequests < this.maxConcurrentRequests) {
        this.pendingRequests++;
        task();
      } else {
        this.requestQueue.push(() => {
          this.pendingRequests++;
          task();
        });
      }
    });
  }

  /**
   * 获取网络错误的详细信息
   */
  getNetworkErrorDetails(error: any): string {
    if (!error.isAxiosError) {
      return '未知错误';
    }

    const axiosError = error as AxiosError;
    switch (axiosError.code) {
      case 'ENOTFOUND':
        return `DNS解析失败: 无法解析域名 ${axiosError.config?.url}`;
      case 'ECONNABORTED':
      case 'ETIMEDOUT':
        return `请求超时: ${axiosError.config?.url}`;
      case 'ECONNREFUSED':
        return `连接被拒绝: ${axiosError.config?.url}`;
      case 'ENETUNREACH':
        return `网络不可达: ${axiosError.config?.url}`;
      case 'DEPTH_ZERO_SELF_SIGNED_CERT':
        return `SSL证书错误: 自签名证书 ${axiosError.config?.url}`;
      case 'UNABLE_TO_VERIFY_LEAF_SIGNATURE':
        return `SSL证书验证失败: ${axiosError.config?.url}`;
      default:
        return `网络错误 (${axiosError.code}): ${axiosError.message}`;
    }
  }

  /**
   * 休眠指定毫秒数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 为采集源配置axios默认参数
   */
  getCollectionAxiosConfig(): AxiosRequestConfig {
    return {
      timeout: 30000, // 30秒超时
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
      },
      maxRedirects: 5,
      validateStatus: (status) => status >= 200 && status < 300,
    };
  }

  private async executeRequest(
    config: AxiosRequestConfig,
    maxRetries: number,
    retryDelay: number
  ) {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.debug(TAG, `尝试请求 ${config.url}, 第${attempt}次`);
        const response = await this.axiosClient.request(config);
        this.logger.debug(TAG, `请求成功: ${config.url}`);
        return response;
      } catch (error) {
        lastError = error;

        if (this.isNetworkError(error)) {
          if (this.isDnsError(error)) {
            this.logger.warn(TAG, `DNS解析失败 ${config.url}: ${error.message}, 第${attempt}次尝试`);
          } else if (this.isTimeoutError(error)) {
            this.logger.warn(TAG, `请求超时 ${config.url}: ${error.message}, 第${attempt}次尝试`);
          } else {
            this.logger.warn(TAG, `网络错误 ${config.url}: ${error.message}, 第${attempt}次尝试`);
          }

          if (attempt < maxRetries) {
            const delay = retryDelay * Math.pow(2, attempt - 1);
            this.logger.info(TAG, `等待${delay}ms后重试...`);
            await this.sleep(delay);
            continue;
          }
        } else {
          this.logger.error(TAG, `非网络错误，不重试: ${error.message}`);
          throw error;
        }
      }
    }

    this.logger.error(TAG, `请求最终失败 ${config.url}, 已重试${maxRetries}次: ${lastError?.message}`);
    throw lastError;
  }

  private processQueue() {
    if (this.pendingRequests >= this.maxConcurrentRequests) {
      return;
    }
    const next = this.requestQueue.shift();
    if (next) {
      next();
    }
  }

  private runInBackground(task: () => Promise<void>) {
    const runner = this.app as unknown as { runInBackground?: (fn: () => Promise<void>) => void };
    const runBackground =
      typeof runner?.runInBackground === 'function'
        ? runner.runInBackground.bind(runner)
        : (fn: () => Promise<void>) => setImmediate(fn);
    runBackground(task);
  }
}