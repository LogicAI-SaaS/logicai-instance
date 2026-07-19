import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * Rate-Limiter Bypass - Smart queue management with adaptive delays
 * Handles 429 responses and implements exponential backoff
 */
export class RateLimiterBypassNode extends BaseNode {
  // Store rate limit info for each domain/endpoint
  private static rateLimitInfo = new Map<string, {
    lastRequestTime: number;
    requestCount: number;
    limitRemaining?: number;
    limitReset?: number;
    backoffUntil: number;
    consecutiveErrors: number;
  }>();

  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const url = this.config.url || this.getNestedValue(context.$json, 'url');
      const method = this.config.method || 'GET';
      const maxRetries = this.config.maxRetries || 5;
      const baseDelay = this.config.baseDelay || 1000;
      const maxDelay = this.config.maxDelay || 60000;

      if (!url) {
        throw new Error('URL is required');
      }

      const domain = this.extractDomain(url);
      await this.waitForRateLimit(domain);

      let attempt = 0;
      let lastError: any = null;

      while (attempt < maxRetries) {
        attempt++;

        try {
          const result = await this.makeRequest(url, method, context);

          // Update rate limit info from response headers
          this.updateRateLimitInfo(domain, result.headers);

          // Reset error count on success
          const info = RateLimiterBypassNode.rateLimitInfo.get(domain);
          if (info) {
            info.consecutiveErrors = 0;
          }

          return {
            success: true,
            data: {
              ...result.data,
              _rateLimit: {
                attempts: attempt,
                domain,
                limitRemaining: info?.limitRemaining,
                limitReset: info?.limitReset,
              },
            },
          };
        } catch (error: any) {
          lastError = error;

          if (error.status === 429) {
            // Rate limited - calculate wait time
            const waitTime = this.calculateWaitTime(domain, attempt, baseDelay, maxDelay);

            this.updateBackoff(domain, waitTime);

            if (attempt < maxRetries) {
              console.log(`Rate limited on ${domain}, waiting ${waitTime}ms (attempt ${attempt}/${maxRetries})`);
              await this.sleep(waitTime);
              continue;
            }
          }

          // For other errors or max retries reached
          if (attempt >= maxRetries) {
            break;
          }

          // Exponential backoff for other errors
          const waitTime = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
          await this.sleep(waitTime);
        }
      }

      return {
        success: false,
        error: `Failed after ${attempt} attempts: ${lastError?.message || 'Unknown error'}`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Rate limiter failed',
      };
    }
  }

  getType(): string {
    return 'rateLimiterBypass';
  }

  getIcon(): string {
    return 'Zap';
  }

  private async makeRequest(url: string, method: string, context: ExecutionContext): Promise<any> {
    const axios = require('axios');
    
    const headers = this.config.headers || {};
    const body = this.resolveValue(this.config.body, context);
    
    try {
      const response = await axios({
        url,
        method: method.toUpperCase(),
        headers,
        data: ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase()) ? body : undefined,
        params: method.toUpperCase() === 'GET' ? body : undefined,
        timeout: this.config.timeout || 30000,
        validateStatus: () => true, // Don't throw on any status
      });

      // Check for rate limiting
      if (response.status === 429) {
        const error: any = new Error('Rate limited');
        error.status = 429;
        error.headers = response.headers;
        throw error;
      }

      // Throw on other errors
      if (response.status >= 400) {
        const error: any = new Error(`Request failed with status ${response.status}`);
        error.status = response.status;
        error.response = response;
        throw error;
      }

      return {
        data: response.data,
        headers: response.headers,
        status: response.status,
      };
    } catch (error: any) {
      // Re-throw with proper structure
      if (error.response) {
        const err: any = new Error(error.message);
        err.status = error.response.status;
        err.headers = error.response.headers;
        throw err;
      }
      throw error;
    }
  }

  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return 'unknown';
    }
  }

  private async waitForRateLimit(domain: string): Promise<void> {
    const info = RateLimiterBypassNode.rateLimitInfo.get(domain);

    if (!info) {
      // Initialize info for new domain
      RateLimiterBypassNode.rateLimitInfo.set(domain, {
        lastRequestTime: 0,
        requestCount: 0,
        backoffUntil: 0,
        consecutiveErrors: 0,
      });
      return;
    }

    // Check if we're in backoff period
    const now = Date.now();
    if (now < info.backoffUntil) {
      const waitTime = info.backoffUntil - now;
      console.log(`Backing off ${domain} for ${waitTime}ms`);
      await this.sleep(waitTime);
    }

    // Update last request time
    info.lastRequestTime = Date.now();
    info.requestCount++;
  }

  private calculateWaitTime(domain: string, attempt: number, baseDelay: number, maxDelay: number): number {
    const info = RateLimiterBypassNode.rateLimitInfo.get(domain);

    if (info?.limitReset) {
      // Use Retry-After header if available
      const retryAfter = info.limitReset * 1000 - Date.now();
      if (retryAfter > 0) {
        return Math.min(retryAfter, maxDelay);
      }
    }

    // Exponential backoff with jitter
    const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
    const jitter = Math.random() * 0.3 * exponentialDelay; // Add 0-30% jitter
    const delay = exponentialDelay + jitter;

    return Math.min(delay, maxDelay);
  }

  private updateRateLimitInfo(domain: string, headers: any): void {
    const info = RateLimiterBypassNode.rateLimitInfo.get(domain);
    if (!info) return;

    if (headers['x-ratelimit-remaining']) {
      info.limitRemaining = parseInt(headers['x-ratelimit-remaining']);
    }

    if (headers['x-ratelimit-reset']) {
      info.limitReset = parseInt(headers['x-ratelimit-reset']);
    }

    if (headers['retry-after']) {
      const retryAfter = parseInt(headers['retry-after']);
      info.limitReset = Math.floor(Date.now() / 1000) + retryAfter;
    }
  }

  private updateBackoff(domain: string, waitTime: number): void {
    const info = RateLimiterBypassNode.rateLimitInfo.get(domain);
    if (!info) return;

    info.backoffUntil = Date.now() + waitTime;
    info.consecutiveErrors++;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current rate limit status for all domains
   */
  static getRateLimitStatus(): Record<string, any> {
    const status: Record<string, any> = {};

    for (const [domain, info] of RateLimiterBypassNode.rateLimitInfo) {
      status[domain] = {
        requestCount: info.requestCount,
        limitRemaining: info.limitRemaining,
        backoffActive: Date.now() < info.backoffUntil,
        backoffUntil: new Date(info.backoffUntil).toISOString(),
        consecutiveErrors: info.consecutiveErrors,
      };
    }

    return status;
  }

  /**
   * Reset rate limit info for a domain
   */
  static resetRateLimit(domain: string): void {
    RateLimiterBypassNode.rateLimitInfo.delete(domain);
  }

  /**
   * Clear all rate limit info
   */
  static clearAllRateLimits(): void {
    RateLimiterBypassNode.rateLimitInfo.clear();
  }
}
