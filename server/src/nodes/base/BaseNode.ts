import { ExecutionContext, NodeConfig, NodeExecutionResult, NodeExecutionData, IRequestOptions, ICredentialDataDecryptedObject, INodeDescription } from '../../types';
import { getNodeDescription, CategoryColors } from '../descriptions/NodeDescriptionRegistry';
import { formatCredentialsForRequest, validateCredentialData, getDefaultAuthType } from '../../credentials/CredentialTypes';
import { HttpHelpers, PaginationOptions } from '../helpers/HttpHelpers';

/**
 * Abstract base class for all node types
 * All node implementations must extend this class and implement the required methods
 * Provides N8N-style helper methods for easier node development
 */
export abstract class BaseNode {
  protected id: string;
  protected name: string;
  protected config: NodeConfig;
  protected credentials?: Map<string, ICredentialDataDecryptedObject>;

  constructor(id: string, name: string, config: NodeConfig) {
    this.id = id;
    this.name = name;
    this.config = config;
    this.credentials = new Map();
  }

  /**
   * Set credentials for this node
   */
  setCredentials(credentials: Map<string, ICredentialDataDecryptedObject>): void {
    this.credentials = credentials;
  }

  /**
   * Execute the node with the given context
   * @param context - The execution context containing $json, $workflow, and $node
   * @returns Promise with the execution result
   */
  abstract execute(context: ExecutionContext): Promise<NodeExecutionResult>;

  /**
   * Get the node type identifier
   * @returns The type string (e.g., 'webhook', 'httpRequest', etc.)
   */
  abstract getType(): string;

  /**
   * Get the Lucide icon name for this node type
   * @returns The icon name
   */
  abstract getIcon(): string;

  /**
   * Get node description metadata (N8N-style)
   * Returns the description from the registry, or null if not found
   */
  getDescription(): INodeDescription | null {
    const nodeType = this.getType();
    const description = getNodeDescription(nodeType);

    if (description) {
      return description;
    }

    // Return a minimal description if not in registry
    return {
      displayName: this.name,
      name: nodeType,
      defaults: {
        name: this.name,
        color: '#6b7280',
        icon: this.getIcon(),
      },
      inputs: ['main'],
      outputs: ['main'],
      properties: [],
    };
  }

  /**
   * Get the node's display name
   */
  getDisplayName(): string {
    const description = this.getDescription();
    return description?.displayName || this.name;
  }

  /**
   * Get the node's default color
   */
  getDefaultColor(): string {
    const description = this.getDescription();
    return description?.defaults?.color || '#6b7280';
  }

  /**
   * Get the node's category
   */
  getCategory(): string {
    const description = this.getDescription();
    return description?.category || 'advanced';
  }

  /**
   * Get the node's subtitle (supports N8N expressions)
   * @param context - The execution context for evaluating expressions
   */
  getSubtitle(context?: ExecutionContext): string {
    const description = this.getDescription();
    if (!description?.subtitle) {
      return '';
    }

    // If subtitle is an expression, evaluate it
    if (typeof description.subtitle === 'string' && description.subtitle.startsWith('={{')) {
      return context ? this.evaluateExpression(description.subtitle, context) : description.subtitle;
    }

    return description.subtitle || '';
  }

  /**
   * Get the node's input types
   */
  getInputTypes(): string[] {
    const description = this.getDescription();
    return description?.inputs || ['main'];
  }

  /**
   * Get the node's output types
   */
  getOutputTypes(): string[] {
    const description = this.getDescription();
    return description?.outputs || ['main'];
  }

  /**
   * Get supported credential types
   */
  getSupportedCredentials(): Array<{ name: string; required: boolean; displayName: string }> {
    const description = this.getDescription();
    return description?.credentials || [];
  }

  /**
   * Get the node's property definitions
   */
  getPropertyDefinitions() {
    const description = this.getDescription();
    return description?.properties || [];
  }

  /**
   * Get the node ID
   */
  getId(): string {
    return this.id;
  }

  /**
   * Get the node name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Get the node configuration
   */
  getConfig(): NodeConfig {
    return this.config;
  }

  /**
   * Update the node configuration
   */
  setConfig(config: NodeConfig): void {
    this.config = config;
  }

  /**
   * Helper method to extract a nested value from an object using a path string
   * @param obj - The source object
   * @param path - Dot-notation path (e.g., 'user.profile.name')
   * @returns The value at the path, or undefined if not found
   */
  protected getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Helper method to set a nested value in an object using a path string
   * @param obj - The target object
   * @param path - Dot-notation path (e.g., 'user.profile.name')
   * @param value - The value to set
   */
  protected setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!(key in current)) {
        current[key] = {};
      }
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  // ============================================
  // N8N-STYLE HELPER METHODS
  // ============================================

  /**
   * Get input data from the execution context (N8N-style)
   * @param itemIndex - Optional item index for multi-item processing
   * @returns Array of NodeExecutionData or single item
   */
  protected getInputData(itemIndex?: number): NodeExecutionData | NodeExecutionData[] {
    if (itemIndex !== undefined) {
      if (Array.isArray(this.config.$input)) {
        return this.config.$input[itemIndex] || { json: {} };
      }
      return { json: this.config.$input || {} };
    }

    if (Array.isArray(this.config.$input)) {
      return this.config.$input;
    }
    return [{ json: this.config.$input || {} }];
  }

  /**
   * Get a node parameter value (N8N-style)
   * @param parameterName - Name of the parameter to retrieve
   * @param itemIndex - Optional item index for item-specific parameters
   * @returns The parameter value
   */
  protected getNodeParameter<T = any>(parameterName: string, itemIndex?: number): T {
    // First check if parameter exists in node config
    if (parameterName in this.config) {
      return this.config[parameterName] as T;
    }

    // Check for nested parameter using dot notation
    const value = this.getNestedValue(this.config, parameterName);
    if (value !== undefined) {
      return value as T;
    }

    // Return undefined if parameter not found
    return undefined as T;
  }

  /**
   * Set a node parameter value
   * @param parameterName - Name of the parameter to set
   * @param value - Value to set
   */
  protected setNodeParameter(parameterName: string, value: any): void {
    if (parameterName.includes('.')) {
      this.setNestedValue(this.config, parameterName, value);
    } else {
      this.config[parameterName] = value;
    }
  }

  /**
   * Get credentials for a specific type (N8N-style)
   * @param credentialType - The type of credentials to retrieve
   * @param itemIndex - Optional item index
   * @returns The decrypted credentials object
   */
  protected async getCredentials<T = ICredentialDataDecryptedObject>(
    credentialType: string,
    itemIndex?: number
  ): Promise<T | null> {
    if (!this.credentials) {
      return null;
    }

    const credential = this.credentials.get(credentialType);
    if (!credential) {
      return null;
    }

    return credential.data as T;
  }

  /**
   * Get credentials formatted for HTTP request headers
   * @param credentialType - The type of credentials
   * @returns HTTP headers with authentication
   */
  protected async getCredentialsAsHeaders(
    credentialType: string
  ): Promise<Record<string, string>> {
    if (!this.credentials) {
      return {};
    }

    const credential = this.credentials.get(credentialType);
    if (!credential) {
      return {};
    }

    return formatCredentialsForRequest(credential);
  }

  /**
   * Validate credentials against their schema
   * @param credentialType - The type of credentials to validate
   * @returns Validation result with errors if any
   */
  protected validateCredentials(
    credentialType: string
  ): { valid: boolean; errors: string[] } {
    if (!this.credentials) {
      return { valid: false, errors: ['No credentials set'] };
    }

    const credential = this.credentials.get(credentialType);
    if (!credential) {
      return { valid: false, errors: [`Credential not found: ${credentialType}`] };
    }

    return validateCredentialData(credential.type as any, credential.data);
  }

  /**
   * Check if credentials are available for a type
   * @param credentialType - The type of credentials to check
   * @returns true if credentials are available
   */
  protected hasCredentials(credentialType: string): boolean {
    if (!this.credentials) {
      return false;
    }
    return this.credentials.has(credentialType);
  }

  /**
   * Get the default auth type for the current node type
   * @returns The default auth type for this node
   */
  protected getDefaultAuthType(): string {
    const nodeType = this.getType();
    return getDefaultAuthType(nodeType);
  }

  /**
   * Check if the node should continue on failure (N8N-style)
   * @returns true if execution should continue on error
   */
  protected continueOnFail(): boolean {
    return this.config.continueOnFail === true || this.config.continueOnFail === 'true';
  }

  /**
   * Get the current workflow context
   * @param context - The execution context
   * @returns Workflow metadata
   */
  protected getWorkflow(context: ExecutionContext) {
    return context.$workflow || {};
  }

  /**
   * Get the current node context
   * @param context - The execution context
   * @returns Current node metadata
   */
  protected getNode(context: ExecutionContext) {
    return context.$node || {};
  }

  /**
   * Get the current item index
   * @param context - The execution context
   * @returns Current item index or 0
   */
  protected getItemIndex(context: ExecutionContext): number {
    return context.$index || 0;
  }

  /**
   * Evaluate an expression in the N8N syntax
   * @param expression - Expression to evaluate (e.g., '={{$json.id}}')
   * @param context - The execution context
   * @returns Evaluated result
   */
  protected evaluateExpression(expression: any, context: ExecutionContext): any {
    if (typeof expression !== 'string') {
      return expression;
    }

    // Check if it's an N8N expression
    if (expression.startsWith('={{') && expression.endsWith('}}')) {
      const expr = expression.slice(2, -2).trim();

      // Handle $json references
      if (expr.startsWith('$json.')) {
        const path = expr.slice(6);
        return this.getNestedValue(context.$json, path);
      }

      // Handle $node references
      if (expr.startsWith('$node[')) {
        const match = expr.match(/\$node\['([^']+)'\]\.(.+)/);
        if (match) {
          // This would need access to other nodes' output
          // For now, return the expression
          return expression;
        }
      }

      // Handle $workflow references
      if (expr.startsWith('$workflow.')) {
        const path = expr.slice(10);
        return this.getNestedValue(context.$workflow, path);
      }

      // Handle $env references
      if (expr.startsWith('$env.')) {
        const key = expr.slice(5);
        return context.$env?.[key];
      }

      return expression;
    }

    return expression;
  }

  /**
   * Resolve parameters with expressions to actual values
   * @param parameters - Parameters object or single value
   * @param context - The execution context
   * @returns Resolved parameters
   */
  protected resolveParameters(parameters: any, context: ExecutionContext): any {
    if (Array.isArray(parameters)) {
      return parameters.map(p => this.resolveParameters(p, context));
    }

    if (parameters !== null && typeof parameters === 'object') {
      const resolved: any = {};
      for (const [key, value] of Object.entries(parameters)) {
        resolved[key] = this.resolveParameters(value, context);
      }
      return resolved;
    }

    return this.evaluateExpression(parameters, context);
  }

  /**
   * Create a standard error result
   * @param message - Error message
   * @param description - Optional detailed description
   * @returns NodeExecutionResult with error
   */
  protected createErrorResult(message: string, description?: string): NodeExecutionResult {
    return {
      success: false,
      error: message,
      data: { error: message, description }
    };
  }

  /**
   * Create a standard success result
   * @param data - Result data
   * @returns NodeExecutionResult with success
   */
  protected createSuccessResult(data?: any): NodeExecutionResult {
    return {
      success: true,
      data
    };
  }

  /**
   * Calculate the size of binary data in a human-readable format
   * @param bytes - Size in bytes
   * @returns Formatted size string
   */
  protected formatBinarySize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  /**
   * Sanitize a filename for safe file system usage
   * @param filename - Original filename
   * @returns Sanitized filename
   */
  protected sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9\-_.]/g, '_')
      .replace(/_{2,}/g, '_')
      .slice(0, 255);
  }

  /**
   * Deep clone an object
   * @param obj - Object to clone
   * @returns Cloned object
   */
  protected deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Merge multiple objects into one
   * @param objects - Objects to merge
   * @returns Merged object
   */
  protected mergeObjects(...objects: any[]): any {
    return Object.assign({}, ...objects);
  }

  /**
   * Get timezone offset for date operations
   * @returns Timezone offset in minutes
   */
  protected getTimezoneOffset(): number {
    return new Date().getTimezoneOffset();
  }

  /**
   * Format a date to ISO string
   * @param date - Date to format
   * @returns ISO formatted date string
   */
  protected formatDate(date: Date = new Date()): string {
    return date.toISOString();
  }

  /**
   * Parse a date string to Date object
   * @param dateString - Date string to parse
   * @returns Date object
   */
  protected parseDate(dateString: string): Date {
    return new Date(dateString);
  }

  /**
   * Generate a unique ID
   * @param prefix - Optional prefix for the ID
   * @returns Unique ID string
   */
  protected generateId(prefix: string = ''): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 9);
    return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`;
  }

  /**
   * Sleep for a specified duration
   * @param ms - Milliseconds to sleep
   * @returns Promise that resolves after the duration
   */
  protected async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Retry a function with exponential backoff
   * @param fn - Function to retry
   * @param maxRetries - Maximum number of retries
   * @param baseDelay - Base delay in milliseconds
   * @returns Result of the function
   */
  protected async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt);
          await this.sleep(delay);
        }
      }
    }

    throw lastError;
  }

  // ============================================
  // HTTP HELPERS
  // ============================================

  /**
   * Get or create HTTP helpers instance for this node
   */
  protected getHttpHelpers(): HttpHelpers {
    if (!this._httpHelpers) {
      this._httpHelpers = new HttpHelpers({
        timeout: this.config.timeout || 30000,
        headers: this.config.headers,
      });
    }
    return this._httpHelpers;
  }

  private _httpHelpers?: HttpHelpers;

  /**
   * Make an HTTP request (N8N-style)
   * @param options - Request options
   * @returns Response data
   */
  protected async httpRequest<T = any>(
    options: IRequestOptions & {
      body?: any;
      credentialType?: string;
      pagination?: PaginationOptions;
    }
  ): Promise<T> {
    const http = this.getHttpHelpers();

    // Add credentials if specified
    if (options.credentialType && this.hasCredentials(options.credentialType)) {
      const authHeaders = await this.getCredentialsAsHeaders(options.credentialType);
      options.headers = { ...options.headers, ...authHeaders };
    }

    // Use pagination if specified
    if (options.pagination) {
      return http.paginatedRequest({
        ...options,
        pagination: options.pagination,
      }) as any;
    }

    return http.request(options);
  }

  /**
   * HTTP GET request
   */
  protected async httpGet<T = any>(
    url: string,
    options?: {
      params?: Record<string, any>;
      headers?: Record<string, string>;
      credentialType?: string;
    }
  ): Promise<T> {
    const http = this.getHttpHelpers();
    const requestOptions: any = { url, params: options?.params };

    if (options?.credentialType) {
      requestOptions.headers = await this.getCredentialsAsHeaders(options.credentialType);
    }

    return http.get(url, requestOptions);
  }

  /**
   * HTTP POST request
   */
  protected async httpPost<T = any>(
    url: string,
    body?: any,
    options?: {
      headers?: Record<string, string>;
      credentialType?: string;
    }
  ): Promise<T> {
    const http = this.getHttpHelpers();
    const requestOptions: any = { body };

    if (options?.credentialType) {
      requestOptions.headers = await this.getCredentialsAsHeaders(options.credentialType);
    }

    return http.post(url, body, requestOptions);
  }

  /**
   * HTTP PUT request
   */
  protected async httpPut<T = any>(
    url: string,
    body?: any,
    options?: {
      headers?: Record<string, string>;
      credentialType?: string;
    }
  ): Promise<T> {
    const http = this.getHttpHelpers();
    const requestOptions: any = { body };

    if (options?.credentialType) {
      requestOptions.headers = await this.getCredentialsAsHeaders(options.credentialType);
    }

    return http.put(url, body, requestOptions);
  }

  /**
   * HTTP DELETE request
   */
  protected async httpDelete<T = any>(
    url: string,
    options?: {
      params?: Record<string, any>;
      headers?: Record<string, string>;
      credentialType?: string;
    }
  ): Promise<T> {
    const http = this.getHttpHelpers();
    const requestOptions: any = { params: options?.params };

    if (options?.credentialType) {
      requestOptions.headers = await this.getCredentialsAsHeaders(options.credentialType);
    }

    return http.delete(url, requestOptions);
  }

  /**
   * Download a file
   */
  protected async downloadFile(
    url: string,
    options?: {
      onProgress?: (progress: { loaded: number; total: number; percent: number }) => void;
      credentialType?: string;
    }
  ): Promise<{
    data: Buffer;
    contentType: string;
    contentLength: number;
  }> {
    const http = this.getHttpHelpers();
    const requestOptions: any = {};

    if (options?.credentialType) {
      requestOptions.headers = await this.getCredentialsAsHeaders(options.credentialType);
    }

    return http.downloadFile(url, {
      ...options,
      ...requestOptions,
    });
  }

  /**
   * Upload a file
   */
  protected async uploadFile<T = any>(
    url: string,
    file: Buffer | NodeJS.ReadableStream,
    options?: {
      field?: string;
      filename?: string;
      contentType?: string;
      additionalData?: Record<string, any>;
      onProgress?: (progress: { loaded: number; total: number; percent: number }) => void;
      credentialType?: string;
    }
  ): Promise<T> {
    const http = this.getHttpHelpers();
    const requestOptions: any = {};

    if (options?.credentialType) {
      requestOptions.headers = await this.getCredentialsAsHeaders(options.credentialType);
    }

    return http.uploadFile(url, file, {
      ...options,
      ...requestOptions,
    });
  }
}
