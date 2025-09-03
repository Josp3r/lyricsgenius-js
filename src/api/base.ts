import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { GeniusOptions, ResponseFormat, ApiResponse } from '../types';
import { authFromEnvironment, sleep } from '../utils';

export class BaseAPI {
  protected client: AxiosInstance;
  protected accessToken: string | null;
  protected responseFormat: ResponseFormat;
  protected timeout: number;
  protected sleepTime: number;
  protected retries: number;
  protected userAgent: string;

  constructor(options: GeniusOptions = {}) {
    this.accessToken = options.accessToken || authFromEnvironment() || null;
    this.responseFormat = options.responseFormat || 'plain';
    this.timeout = options.timeout || 100000;
    this.sleepTime = options.sleepTime || 200;
    this.retries = options.retries || 0;
    this.userAgent = options.userAgent || 'lyricsgenius-js/1.0.0';

    // Auto-detect system proxy if not explicitly provided
    const proxyConfig = options.proxy || this.getSystemProxy();

    const axiosConfig: any = {
      baseURL: 'https://api.genius.com',
      timeout: this.timeout,
      headers: {
        'User-Agent': this.userAgent,
        'Accept': 'application/json',
        ...(this.accessToken && { 'Authorization': `Bearer ${this.accessToken}` })
      }
    };

    // Add proxy configuration
    if (proxyConfig) {
      if (proxyConfig.type === 'socks') {
        // Use SOCKS proxy agent
        const proxyUrl = `socks://${proxyConfig.host}:${proxyConfig.port}`;
        axiosConfig.httpsAgent = new SocksProxyAgent(proxyUrl);
        axiosConfig.httpAgent = new SocksProxyAgent(proxyUrl);
      } else {
        // Use HTTP proxy
        axiosConfig.proxy = {
          host: proxyConfig.host,
          port: proxyConfig.port,
          ...(proxyConfig.auth && { auth: proxyConfig.auth })
        };
      }
    }

    this.client = axios.create(axiosConfig);
  }

  private getSystemProxy(): { host: string; port: number; type?: 'http' | 'socks'; auth?: { username: string; password: string } } | null {
    // Check for environment variables first
    const httpProxy = process.env.HTTP_PROXY || process.env.http_proxy;
    const httpsProxy = process.env.HTTPS_PROXY || process.env.https_proxy;
    
    const proxyUrl = httpsProxy || httpProxy;
    if (proxyUrl) {
      try {
        const url = new URL(proxyUrl);
        return {
          host: url.hostname,
          port: parseInt(url.port) || (url.protocol === 'https:' ? 443 : 80),
          type: 'http'
        };
      } catch (error) {
        // Invalid proxy URL, ignore
      }
    }

    // On macOS, try both SOCKS and HTTP proxy for common VPN ports
    if (process.platform === 'darwin') {
      // Try SOCKS first (more common for VPN clients)
      return {
        host: '127.0.0.1',
        port: 7890,
        type: 'socks'  // Your VPN likely uses SOCKS proxy
      };
    }

    return null;
  }

  protected async makeRequest<T = any>(
    path: string,
    params?: Record<string, any>,
    isWeb: boolean = false
  ): Promise<T> {
    const url = isWeb ? `https://genius.com/${path}` : path;
    const config: AxiosRequestConfig = {
      ...(params && { params: { ...params, text_format: this.responseFormat } })
    };

    if (isWeb) {
      config.baseURL = '';
      config.headers = {
        ...config.headers,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      };
    }

    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        if (attempt > 0 && this.sleepTime > 0) {
          await sleep(this.sleepTime * 1000);
        }

        const response: AxiosResponse<T> = await this.client.get(url, config);
        
        if (isWeb) {
          return { html: response.data, text: response.data } as T;
        }

        return response.data;
      } catch (error) {
        lastError = error as Error;
        
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          
          // Don't retry for client errors (4xx), only server errors (5xx) and timeouts
          if (status && status < 500) {
            throw error;
          }
        }

        if (attempt === this.retries) {
          throw lastError;
        }
      }
    }

    throw lastError;
  }

  protected async apiRequest<T = any>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    return this.makeRequest<ApiResponse<T>>(endpoint, params);
  }

  protected async webRequest(path: string, params?: Record<string, any>): Promise<{ html: string; text: string }> {
    return this.makeRequest<{ html: string; text: string }>(path, params, true);
  }
}