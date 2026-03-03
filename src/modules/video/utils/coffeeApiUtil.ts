import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Coffee API 专用工具类
 * 用于请求 https://coffee.1ljx.com:32000/api/ 接口
 */
export class CoffeeApiUtil {
  private static instance: CoffeeApiUtil;
  private axiosClient: AxiosInstance;
  private readonly baseUrl: string = 'https://coffee.1ljx.com:32000/api/';
  private readonly defaultKey: string = '87d8f0f690af69b89650d581e99125b1';
  private readonly timeout: number = 30000;

  private constructor() {
    this.initAxiosClient();
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): CoffeeApiUtil {
    if (!CoffeeApiUtil.instance) {
      CoffeeApiUtil.instance = new CoffeeApiUtil();
    }
    return CoffeeApiUtil.instance;
  }

  /**
   * 初始化 Axios 客户端
   */
  private initAxiosClient(): void {
    this.axiosClient = axios.create({
      baseURL: this.baseUrl,
      timeout: this.timeout,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      },
      validateStatus: (status) => status >= 200 && status < 300,
    });
  }

  /**
   * 构建完整的请求URL
   * @param key API密钥
   * @param url 参数URL
   * @returns 完整的请求URL
   */
  private buildUrl(key: string, url: string): string {
    return `?key=${encodeURIComponent(key)}&url=${encodeURIComponent(url)}`;
  }

  /**
   * 基础GET请求方法
   * @param url 请求的URL参数
   * @param key API密钥（可选）
   * @param options 额外的请求选项
   */
  async get(
    url: string,
    key?: string,
    options?: Partial<AxiosRequestConfig>
  ): Promise<AxiosResponse<any>> {
    const apiKey = key || this.defaultKey;
    const requestUrl = this.buildUrl(apiKey, url);
    
    const config: AxiosRequestConfig = {
      method: 'GET',
      url: requestUrl,
      ...options
    };

    return await this.axiosClient.request(config);
  }

  /**
   * POST请求方法
   * @param url 请求的URL参数
   * @param data 请求体数据
   * @param key API密钥（可选）
   * @param options 额外的请求选项
   */
  async post(
    url: string,
    data?: any,
    key?: string,
    options?: Partial<AxiosRequestConfig>
  ): Promise<AxiosResponse<any>> {
    const apiKey = key || this.defaultKey;
    const requestUrl = this.buildUrl(apiKey, url);
    
    const config: AxiosRequestConfig = {
      method: 'POST',
      url: requestUrl,
      data,
      ...options
    };

    return await this.axiosClient.request(config);
  }

  /**
   * HEAD请求方法（用于检查URL可用性）
   * @param url 请求的URL参数
   * @param key API密钥（可选）
   */
  async head(url: string, key?: string): Promise<boolean> {
    const apiKey = key || this.defaultKey;
    const requestUrl = this.buildUrl(apiKey, url);
    
    try {
      await this.axiosClient.head(requestUrl, { timeout: 5000 });
      return true;
    } catch (error) {
      return false;
    }
  }

}