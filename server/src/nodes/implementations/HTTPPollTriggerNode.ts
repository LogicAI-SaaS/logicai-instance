import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';
import axios, { AxiosRequestConfig } from 'axios';
import { createHash } from 'crypto';

/**
 * HTTP Poll Trigger Node - Triggers workflow at regular intervals by polling an endpoint
 * n8n-compatible: HTTP polling with change detection
 *
 * Configuration:
 * - url: HTTP endpoint URL to poll
 * - interval: Polling interval in milliseconds (default: 60000 = 1 min)
 * - method: HTTP method (default: 'GET')
 * - headers: Request headers
 * - body: Request body for POST/PUT/PATCH
 * - changeDetection: How to detect changes ('hash', 'json-diff', 'always')
 * - ignoreFieldChanges: Fields to ignore when detecting changes
 * - responseFormat: 'json', 'text', 'full' (default: 'json')
 * - timeout: Request timeout in ms (default: 30000)
 * - auth: Authentication config (same as HttpRequestNode)
 */
export class HTTPPollTriggerNode extends BaseNode {
  // Store previous data for change detection
  private static readonly previousData = new Map<string, { data: any; hash: string }>();

  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
    this.validateConfig();
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    if (!this.config.url) {
      throw new Error('url is required for HTTP poll trigger');
    }

    try {
      new URL(this.config.url);
    } catch {
      throw new Error(`Invalid URL format: ${this.config.url}. Must include protocol (http:// or https://)`);
    }

    const interval = this.config.interval || 60000;
    if (typeof interval !== 'number' || interval < 1000) {
      throw new Error(`Invalid interval: ${interval}. Must be at least 1000ms (1 second)`);
    }

    const method = (this.config.method || 'GET').toUpperCase();
    const validMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
    if (!validMethods.includes(method)) {
      throw new Error(`Invalid method: ${method}. Valid: ${validMethods.join(', ')}`);
    }

    if (this.config.changeDetection && !['hash', 'json-diff', 'always'].includes(this.config.changeDetection)) {
      throw new Error(`Invalid changeDetection: ${this.config.changeDetection}. Valid: hash, json-diff, always`);
    }
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const url = this.resolveVariables(this.config.url, context);
      const method = (this.config.method || 'GET').toUpperCase();
      const interval = this.config.interval || 60000;
      const changeDetection = this.config.changeDetection || 'hash';
      const ignoreFieldChanges = this.config.ignoreFieldChanges || [];
      const responseFormat = this.config.responseFormat || 'json';
      const timeout = this.config.timeout || 30000;

      // Make HTTP request
      const axiosConfig: AxiosRequestConfig = {
        method,
        url,
        headers: this.resolveHeaders(this.config.headers, context),
        timeout,
      };

      // Add body for methods that support it
      if (['POST', 'PUT', 'PATCH'].includes(method) && this.config.body) {
        const body = this.resolveVariables(this.config.body, context);
        if (!axiosConfig.headers['Content-Type']) {
          axiosConfig.headers['Content-Type'] = 'application/json';
        }
        axiosConfig.data = typeof body === 'string' ? body : JSON.stringify(body);
      }

      // Add authentication
      if (this.config.auth?.type && this.config.auth.type !== 'none') {
        this.addAuthentication(axiosConfig, this.config.auth, context);
      }

      const response = await axios(axiosConfig);

      // Extract response data
      const responseData = this.formatResponse(response, responseFormat);

      // Check for changes
      const hasChanges = this.detectChanges(this.id, responseData, changeDetection, ignoreFieldChanges);

      return {
        success: true,
        data: {
          ...context.$json,
          _trigger: {
            type: 'httpPoll',
            url,
            method,
            interval,
            changeDetection,
            hasChanges,
            timestamp: new Date().toISOString(),
            responseStatus: response.status,
          },
          data: responseData,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.formatErrorMessage(error),
      };
    }
  }

  /**
   * Detect changes based on configured strategy
   */
  private detectChanges(
    triggerId: string,
    currentData: any,
    strategy: string,
    ignoreFields: string[]
  ): boolean {
    const previousState = HTTPPollTriggerNode.previousData.get(triggerId);

    if (!previousState) {
      // First poll - store and return true
      this.storeData(triggerId, currentData);
      return true;
    }

    switch (strategy) {
      case 'hash':
        return this.detectByHash(triggerId, currentData, ignoreFields);

      case 'json-diff':
        return this.detectByDiff(previousState.data, currentData, ignoreFields);

      case 'always':
        return true;

      default:
        return true;
    }
  }

  /**
   * Detect changes by comparing hash
   */
  private detectByHash(triggerId: string, currentData: any, ignoreFields: string[]): boolean {
    // Remove ignored fields
    const filteredData = this.removeFields(currentData, ignoreFields);
    const currentHash = this.generateHash(filteredData);

    const previousState = HTTPPollTriggerNode.previousData.get(triggerId);
    const previousHash = previousState?.hash;

    if (currentHash !== previousHash) {
      this.storeData(triggerId, filteredData);
      return true;
    }

    return false;
  }

  /**
   * Detect changes by comparing JSON structure
   */
  private detectByDiff(previousData: any, currentData: any, ignoreFields: string[]): boolean {
    const filteredPrevious = this.removeFields(previousData, ignoreFields);
    const filteredCurrent = this.removeFields(currentData, ignoreFields);

    const hasChanges = JSON.stringify(filteredPrevious) !== JSON.stringify(filteredCurrent);

    if (hasChanges) {
      this.storeData(this.id, filteredCurrent);
    }

    return hasChanges;
  }

  /**
   * Remove fields from data
   */
  private removeFields(data: any, fields: string[]): any {
    if (!fields || fields.length === 0) return data;

    if (Array.isArray(data)) {
      return data.map(item => this.removeFields(item, fields));
    }

    if (typeof data === 'object' && data !== null) {
      const result: any = {};
      for (const [key, value] of Object.entries(data)) {
        if (!fields.includes(key)) {
          result[key] = typeof value === 'object' ? this.removeFields(value, fields) : value;
        }
      }
      return result;
    }

    return data;
  }

  /**
   * Generate hash from data
   */
  private generateHash(data: any): string {
    const json = typeof data === 'string' ? data : JSON.stringify(data);
    return createHash('sha256').update(json).digest('hex');
  }

  /**
   * Store data for change detection
   */
  private storeData(triggerId: string, data: any): void {
    const hash = this.generateHash(data);
    HTTPPollTriggerNode.previousData.set(triggerId, { data, hash });
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

      case 'oauth2':
        const oauthToken = this.resolveVariables(auth.accessToken, context);
        axiosConfig.headers['Authorization'] = `Bearer ${oauthToken}`;
        break;
    }
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

  /**
   * Format error messages
   */
  private formatErrorMessage(error: any): string {
    if (error.response?.status === 401) {
      return 'Authentication failed: Check your API credentials';
    }
    if (error.response?.status === 429) {
      return 'Rate limited: Too many requests to the endpoint';
    }
    if (error.code === 'ENOTFOUND') {
      return 'DNS lookup failed: Check the URL';
    }
    if (error.code === 'ETIMEDOUT') {
      return 'Request timeout: The server took too long to respond';
    }
    return `HTTP poll trigger error: ${error.message || 'Unknown error'}`;
  }

  /**
   * Resolve variables in a string
   */
  private resolveVariables(value: any, context: ExecutionContext): any {
    if (typeof value === 'string') {
      return value.replace(/\{\{\s*\$(json|workflow|node)\.([\w.]+)\s*\}\}/g, (match, source, path) => {
        const sourceData = source === 'json' ? context.$json
          : source === 'workflow' ? context.$workflow
          : context.$node;
        const found = this.getNestedValue(sourceData, path);
        return found !== undefined ? String(found) : match;
      });
    }
    return value;
  }

  /**
   * Resolve headers
   */
  private resolveHeaders(headers: Record<string, string> = {}, context: ExecutionContext): Record<string, string> {
    const resolved: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers)) {
      resolved[key] = this.resolveVariables(value, context);
    }
    return resolved;
  }

  getType(): string {
    return 'httpPollTrigger';
  }

  getIcon(): string {
    return 'RefreshCw';
  }

  /**
   * Get polling interval in milliseconds
   */
  getPollingInterval(): number {
    return this.config.interval || 60000;
  }

  /**
   * Get polling interval in human-readable format
   */
  getPollingIntervalFormatted(): string {
    const interval = this.getPollingInterval();

    if (interval >= 86400000) {
      return `${interval / 86400000}d`;
    }
    if (interval >= 3600000) {
      return `${interval / 3600000}h`;
    }
    if (interval >= 60000) {
      return `${interval / 60000}m`;
    }
    return `${interval / 1000}s`;
  }

  /**
   * Get endpoint URL
   */
  getEndpoint(): string {
    return this.config.url;
  }

  /**
   * Get webhook path for manual trigger
   */
  getWebhookPath(): string {
    return `/webhook/http-poll/${this.id}`;
  }

  /**
   * Clear stored data for change detection
   */
  clearStoredData(): void {
    HTTPPollTriggerNode.previousData.delete(this.id);
  }

  /**
   * Clear all stored data (static utility)
   */
  static clearAllStoredData(): void {
    HTTPPollTriggerNode.previousData.clear();
  }

  /**
   * Get stored data for a trigger
   */
  static getStoredData(triggerId: string): { data: any; hash: string } | undefined {
    return HTTPPollTriggerNode.previousData.get(triggerId);
  }
}
