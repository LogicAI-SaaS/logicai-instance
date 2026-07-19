import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult, HttpRequestConfig } from '../../types';

/**
 * HTTP Request Node - Makes an HTTP request to an external API
 * n8n-compatible: Full HTTP request with auth, retry, proxy support
 *
 * Configuration:
 * - url: Request URL (supports {{ variables }})
 * - method: HTTP method (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
 * - headers: Request headers object
 * - body: Request body for POST/PUT/PATCH
 * - queryParams: Query parameters object
 * - auth: Authentication config (type: 'none' | 'basic' | 'bearer' | 'apiKey' | 'digest')
 * - timeout: Request timeout in ms (default: 30000)
 * - responseFormat: 'json' | 'text' | 'full' (default: 'json')
 * - options: { ignoreResponseCode: boolean, followRedirects: boolean, proxy: ProxyConfig }
 * - retry: { enabled: boolean, maxRetries: number, retryDelay: number }
 */
export class HttpRequestNode extends BaseNode {
  constructor(id: string, name: string, config: HttpRequestConfig) {
    super(id, name, config);
    this.validateConfig();
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    const config = this.config as HttpRequestConfig;

    if (!config.url) {
      throw new Error('URL is required for HTTP request');
    }

    // Validate HTTP method
    const validMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
    const method = (config.method || 'GET').toUpperCase();
    if (!validMethods.includes(method)) {
      throw new Error(`Invalid HTTP method: ${method}. Valid methods: ${validMethods.join(', ')}`);
    }

    // Validate response format
    if (config.responseFormat && !['json', 'text', 'full'].includes(config.responseFormat)) {
      throw new Error(`Invalid responseFormat: ${config.responseFormat}. Valid formats: json, text, full`);
    }

    // Validate auth type
    if (config.auth?.type && !['none', 'basic', 'bearer', 'apiKey', 'digest', 'oauth2'].includes(config.auth.type)) {
      throw new Error(`Invalid auth type: ${config.auth.type}`);
    }
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const config = this.config as HttpRequestConfig;
      console.log('🔍 HttpRequestNode.execute() - Full config:', JSON.stringify(config, null, 2));
      const url = this.resolveVariables(config.url, context);
      console.log('🌐 HttpRequestNode - Resolved URL:', url);
      const method = (config.method || 'GET').toUpperCase();
      console.log('📋 HttpRequestNode - Method:', method);

      // Validate URL format
      this.validateUrl(url);

      // Build request configuration
      const axiosConfig: AxiosRequestConfig = {
        method,
        url,
        headers: this.resolveHeaders(config.headers, context),
        timeout: config.timeout || 30000,
        maxRedirects: config.options?.followRedirects !== false ? 5 : 0,
      };

      // Add authentication
      if (config.auth?.type && config.auth.type !== 'none') {
        this.addAuthentication(axiosConfig, config.auth, context);
      }

      // Add body for methods that support it
      if (['POST', 'PUT', 'PATCH'].includes(method) && config.body) {
        let body = this.resolveVariables(config.body, context);
        
        // Check if variables were not resolved (still contain {{ }})
        if (typeof body === 'string' && body.includes('{{')) {
          console.warn('⚠️ HttpRequestNode - Unresolved variables in body:', body);
          throw new Error(`Unable to resolve variables in body: ${body}. Make sure the node has input data or the referenced variables exist.`);
        }
        
        // Set content-type if not already set
        if (!axiosConfig.headers['Content-Type'] && !axiosConfig.headers['content-type']) {
          axiosConfig.headers['Content-Type'] = 'application/json';
        }
        
        // Handle body based on Content-Type
        const contentType = axiosConfig.headers['Content-Type'] || axiosConfig.headers['content-type'];
        if (contentType?.includes('application/json')) {
          // For JSON content-type:
          // - If body is already an object/array, stringify it
          // - If body is a string, try to parse it as JSON first
          if (typeof body === 'string') {
            try {
              // Try to parse as JSON to validate/normalize
              const parsed = JSON.parse(body);
              axiosConfig.data = JSON.stringify(parsed);
            } catch {
              // Not valid JSON, wrap it as a JSON string value
              axiosConfig.data = JSON.stringify(body);
            }
          } else {
            axiosConfig.data = JSON.stringify(body);
          }
        } else {
          // For non-JSON content types, send as-is or stringify
          axiosConfig.data = typeof body === 'string' ? body : JSON.stringify(body);
        }
      }

      // Add query parameters
      if (config.queryParams) {
        const params = this.resolveVariables(config.queryParams, context);
        axiosConfig.params = params;
      }

      // Add proxy configuration
      if (config.options?.proxy) {
        axiosConfig.proxy = this.resolveProxy(config.options.proxy, context);
      }

      // Make the HTTP request with retry logic
      const response = config.retry?.enabled
        ? await this.executeWithRetry(axiosConfig, config.retry)
        : await axios(axiosConfig);

      console.log('✅ HttpRequestNode - Response received:', {
        status: response.status,
        statusText: response.statusText,
        url: axiosConfig.url
      });

      // Check if response should be treated as error
      if (!config.options?.ignoreResponseCode && response.status >= 400) {
        console.warn('⚠️ HttpRequestNode - Response status >= 400, treating as error');
        throw this.createHttpError(response);
      }

      // Format response based on responseFormat
      const data = this.formatResponse(response, config.responseFormat || 'json');

      return {
        success: true,
        data,
        _http: {
          url: axiosConfig.url,
          method: axiosConfig.method,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          duration: response.headers['x-response-time'] || undefined,
        },
      };
    } catch (error: any) {
      console.error('❌ HttpRequestNode execution error:', {
        code: error.code,
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        } : undefined,
        stack: error.stack
      });
      return {
        success: false,
        error: this.formatErrorMessage(error),
      };
    }
  }

  /**
   * Validate URL format
   */
  private validateUrl(url: string): void {
    try {
      new URL(url);
    } catch {
      throw new Error(`Invalid URL format: ${url}. URL must include protocol (http:// or https://)`);
    }
  }

  /**
   * Add authentication to request
   */
  private addAuthentication(
    axiosConfig: AxiosRequestConfig,
    auth: any,
    context: ExecutionContext
  ): void {
    switch (auth.type) {
      case 'basic':
        const username = this.resolveVariables(auth.username, context);
        const password = this.resolveVariables(auth.password || '', context);
        axiosConfig.auth = { username, password };
        break;

      case 'bearer':
        const token = this.resolveVariables(auth.token, context);
        axiosConfig.headers['Authorization'] = `Bearer ${token}`;
        break;

      case 'apiKey':
        const apiKey = this.resolveVariables(auth.apiKey, context);
        const headerName = auth.headerName || 'X-API-Key';
        axiosConfig.headers[headerName] = apiKey;
        break;

      case 'digest':
        // Digest auth requires special handling - for now add as header
        const digestAuth = this.resolveVariables(auth.digest, context);
        axiosConfig.headers['Authorization'] = digestAuth;
        break;

      case 'oauth2':
        const oauthToken = this.resolveVariables(auth.accessToken, context);
        axiosConfig.headers['Authorization'] = `Bearer ${oauthToken}`;
        break;
    }
  }

  /**
   * Resolve proxy configuration
   */
  private resolveProxy(proxy: any, context: ExecutionContext): any {
    const protocol = proxy.protocol || 'http';
    const host = this.resolveVariables(proxy.host, context);
    const port = proxy.port || (protocol === 'https' ? 443 : 80);

    const proxyConfig: any = { protocol, host, port };

    if (proxy.auth) {
      proxyConfig.auth = {
        username: this.resolveVariables(proxy.auth.username, context),
        password: this.resolveVariables(proxy.auth.password || '', context),
      };
    }

    return proxyConfig;
  }

  /**
   * Execute request with retry logic
   */
  private async executeWithRetry(
    axiosConfig: AxiosRequestConfig,
    retryConfig: any
  ): Promise<any> {
    const maxRetries = retryConfig.maxRetries || 3;
    const retryDelay = retryConfig.retryDelay || 1000;
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await axios(axiosConfig);
      } catch (error) {
        lastError = error;
        const isRetryable = this.isRetryableError(error);
        const isLastAttempt = attempt === maxRetries;

        if (!isRetryable || isLastAttempt) {
          throw error;
        }

        // Wait before retrying with exponential backoff
        const delay = retryDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: any): boolean {
    if (!error.response) {
      // Network errors, timeouts, etc. are retryable
      return true;
    }

    const status = error.response.status;
    // Retry on 429 (rate limit), 5xx (server errors), 408 (timeout)
    return status === 429 || status === 408 || status >= 500;
  }

  /**
   * Create HTTP error from response
   */
  private createHttpError(response: any): Error {
    const error: any = new Error(`HTTP ${response.status}: ${response.statusText}`);
    error.status = response.status;
    error.response = response;
    return error;
  }

  /**
   * Format response based on responseFormat
   */
  private formatResponse(response: any, responseFormat: string): any {
    switch (responseFormat) {
      case 'json':
        return response.data;

      case 'text':
        return typeof response.data === 'string' ? response.data : JSON.stringify(response.data);

      case 'full':
        return {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          data: response.data,
        };

      default:
        return response.data;
    }
  }

  getType(): string {
    return 'httpRequest';
  }

  getIcon(): string {
    return 'Globe';
  }

  /**
   * Format error messages
   */
  private formatErrorMessage(error: any): string {
    if (error.code === 'ENOTFOUND') {
      return `DNS lookup failed: Unable to resolve hostname. Check the URL and your network connection.`;
    }
    if (error.code === 'ECONNREFUSED') {
      return `Connection refused: The server refused the connection. The service may be down or incorrect port.`;
    }
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      return `Request timeout: The server took too long to respond. Consider increasing the timeout value.`;
    }
    if (error.code === 'ECONNRESET') {
      return `Connection reset: The connection was unexpectedly closed by the server.`;
    }
    if (error.code === 'CERT_HAS_EXPIRED' || error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
      return `SSL/TLS error: Certificate verification failed. The server's SSL certificate may be invalid or expired.`;
    }

    if (error.response) {
      const status = error.response.status;
      const statusText = error.response.statusText;
      const data = error.response.data;

      if (status === 401) {
        return `Authentication failed (401): Invalid or missing credentials. Check your API key or authentication details.`;
      }
      if (status === 403) {
        return `Access forbidden (403): You don't have permission to access this resource.`;
      }
      if (status === 404) {
        return `Not found (404): The requested resource does not exist. Check the URL and parameters.`;
      }
      if (status === 429) {
        const retryAfter = error.response.headers['retry-after'];
        const message = `Rate limited (429): Too many requests.`;
        return retryAfter ? `${message} Retry after ${retryAfter} seconds.` : message;
      }
      if (status >= 500) {
        return `Server error (${status}): ${statusText}. The server encountered an error. Try again later.`;
      }

      // Generic HTTP error with response details
      let errorMsg = `HTTP ${status}: ${statusText}`;
      if (data && typeof data === 'object' && data.message) {
        errorMsg += ` - ${data.message}`;
      } else if (data && typeof data === 'string') {
        errorMsg += ` - ${data}`;
      }
      return errorMsg;
    }

    if (error.message) {
      return error.message;
    }

    return 'HTTP request failed: Unknown error';
  }

  /**
   * Resolve variables in a string or object using the execution context
   */
  private resolveVariables(value: any, context: ExecutionContext): any {
    if (typeof value === 'string') {
      return this.replaceVariables(value, context);
    }

    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        return value.map(item => this.resolveVariables(item, context));
      }

      const result: any = {};
      for (const [key, val] of Object.entries(value)) {
        result[key] = this.resolveVariables(val, context);
      }
      return result;
    }

    return value;
  }

  /**
   * Replace {{ $json.* }} variables in a string
   */
  private replaceVariables(template: string, context: ExecutionContext): string {
    // Remove surrounding backticks if present (from frontend expression mode)
    let cleaned = template;
    if (cleaned.startsWith('`') && cleaned.endsWith('`')) {
      cleaned = cleaned.slice(1, -1);
    }
    
    return cleaned.replace(/\{\{\s*\$(json|workflow|node)\.([\w.]+)\s*\}\}/g, (match, source, path) => {
      if (source === 'json') {
        const value = this.getNestedValue(context.$json, path);
        return value !== undefined ? String(value) : match;
      } else if (source === 'workflow') {
        const value = this.getNestedValue(context.$workflow, path);
        return value !== undefined ? String(value) : match;
      } else if (source === 'node') {
        const value = this.getNestedValue(context.$node, path);
        return value !== undefined ? String(value) : match;
      }
      return match;
    });
  }

  /**
   * Resolve and process headers
   */
  private resolveHeaders(headers: Record<string, string> = {}, context: ExecutionContext): Record<string, string> {
    const resolved: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers)) {
      resolved[key] = this.replaceVariables(value, context);
    }
    return resolved;
  }
}
