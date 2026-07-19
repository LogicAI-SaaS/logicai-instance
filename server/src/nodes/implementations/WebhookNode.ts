import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult, WebhookConfig } from '../../types';

/**
 * Webhook Node - Triggers a workflow when an HTTP request is received
 * This node generates a dynamic Express route
 *
 * Configuration:
 * - path: Webhook endpoint path (default: /webhook)
 * - method: HTTP method (GET, POST, PUT, PATCH, DELETE)
 * - responseCode: HTTP status code to return (default: 200)
 * - responseBody: Response body to send back
 * - authentication: Optional authentication settings
 */
export class WebhookNode extends BaseNode {
  constructor(id: string, name: string, config: WebhookConfig) {
    super(id, name, config);
    this.validateConfig();
  }

  /**
   * Validate webhook configuration
   */
  private validateConfig(): void {
    if (!this.config.path) {
      throw new Error('Webhook path is required. Please specify a path for the webhook endpoint.');
    }

    // Validate path format
    if (typeof this.config.path !== 'string' || !this.config.path.startsWith('/')) {
      throw new Error('Webhook path must start with /');
    }

    // Validate HTTP method
    const validMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
    const method = (this.config.method || 'POST').toUpperCase();
    if (!validMethods.includes(method)) {
      throw new Error(`Invalid HTTP method: ${method}. Valid methods: ${validMethods.join(', ')}`);
    }

    // Validate response code if provided
    if (this.config.responseCode !== undefined) {
      const code = this.config.responseCode;
      if (typeof code !== 'number' || code < 100 || code > 599) {
        throw new Error('Response code must be a valid HTTP status code (100-599)');
      }
    }
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      // Webhook nodes typically don't execute in the normal flow
      // They are triggered by external HTTP requests
      // The webhook data is already in context.$json when triggered

      // Validate webhook data structure
      if (!context.$json) {
        throw new Error('No webhook data received. context.$json is empty.');
      }

      return {
        success: true,
        data: {
          ...context.$json,
          _webhook: {
            method: this.getMethod(),
            path: this.getFullPath(),
            timestamp: new Date().toISOString(),
          },
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
   * Get the HTTP method for this webhook
   */
  getMethod(): string {
    return (this.config.method || 'POST').toUpperCase();
  }

  /**
   * Get the webhook path
   */
  getPath(): string {
    return this.config.path || '/webhook';
  }

  /**
   * Get the full webhook path for Express routing
   */
  getFullPath(): string {
    const path = this.getPath();
    return path.startsWith('/') ? path : `/${path}`;
  }

  /**
   * Get response configuration
   */
  getResponseConfig(): { statusCode: number; body: string } {
    return {
      statusCode: this.config.responseCode || 200,
      body: this.config.responseBody || 'OK',
    };
  }

  /**
   * Check if authentication is required
   */
  requiresAuthentication(): boolean {
    return !!this.config.authentication;
  }

  /**
   * Validate webhook authentication
   */
  validateAuthentication(authHeader: string | undefined): boolean {
    if (!this.requiresAuthentication()) {
      return true;
    }

    const authConfig = this.config.authentication;
    if (!authHeader || !authConfig) {
      return false;
    }

    // Basic Auth validation
    if (authConfig.type === 'basic') {
      const expectedAuth = Buffer.from(`${authConfig.username}:${authConfig.password}`).toString('base64');
      return authHeader === `Basic ${expectedAuth}`;
    }

    // Bearer Token validation
    if (authConfig.type === 'bearer') {
      return authHeader === `Bearer ${authConfig.token}`;
    }

    // API Key validation
    if (authConfig.type === 'apiKey') {
      return authHeader === authConfig.token;
    }

    return false;
  }

  /**
   * Format error messages
   */
  private formatErrorMessage(error: any): string {
    if (error.message.includes('path is required')) {
      return error.message;
    }
    if (error.message.includes('must start with /')) {
      return error.message;
    }
    if (error.message.includes('Invalid HTTP method')) {
      return error.message;
    }
    if (error.message.includes('No webhook data')) {
      return error.message;
    }
    return `Webhook execution error: ${error.message}`;
  }

  getType(): string {
    return 'webhook';
  }

  getIcon(): string {
    return 'Webhook';
  }
}
