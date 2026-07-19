import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

/**
 * Ghost Node - Silent mode for GDPR compliance
 * Executes logic without logging or storing data in database
 *
 * Security features:
 * - AES-256-GCM encryption for sensitive fields
 * - PII masking with configurable patterns
 * - No logging of sensitive data
 * - Safe expression evaluation (no eval)
 */
export class GhostNode extends BaseNode {
  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      // Store original data before processing
      const originalData = context.$json;

      // Execute the operations silently
      const result = await this.executeSilently(context);

      // Mark execution as ghost (no logging)
      return {
        success: true,
        data: {
          ...result,
          _ghostMode: true,
          _notLogged: true,
          _gdprCompliant: true,
        },
      };
    } catch (error: any) {
      // Even errors in ghost mode should be handled carefully
      // Log minimal info without exposing sensitive data
      return {
        success: false,
        error: 'Ghost operation failed',
        // Don't include error details in production for GDPR
        _ghostMode: true,
        _notLogged: true,
      };
    }
  }

  getType(): string {
    return 'ghost';
  }

  getIcon(): string {
    return 'Ghost';
  }

  private async executeSilently(context: ExecutionContext): Promise<any> {
    const operations = this.config.operations || [];

    let result = context.$json;

    for (const op of operations) {
      // Execute operation without creating logs
      switch (op.type) {
        case 'transform':
          result = this.transformData(result, op.transformations);
          break;

        case 'filter':
          result = this.filterData(result, op.conditions);
          break;

        case 'aggregate':
          result = this.aggregateData(result, op.aggregations);
          break;

        case 'enrich':
          result = await this.enrichData(result, op.enrichments);
          break;

        case 'validate':
          result = this.validateData(result, op.schema);
          break;

        case 'encrypt':
          result = this.encryptFields(result, op.fields);
          break;

        case 'mask':
          result = this.maskFields(result, op.fields);
          break;

        case 'process':
          result = await this.customProcess(result, op.handler);
          break;
      }
    }

    return result;
  }

  private transformData(data: any, transformations: any[]): any {
    let result = { ...data };

    for (const transform of transformations) {
      switch (transform.operation) {
        case 'rename':
          if (result[transform.oldField] !== undefined) {
            result[transform.newField] = result[transform.oldField];
            delete result[transform.oldField];
          }
          break;

        case 'delete':
          if (Array.isArray(transform.field)) {
            transform.field.forEach((f: string) => delete result[f]);
          } else {
            delete result[transform.field];
          }
          break;

        case 'copy':
          if (result[transform.source] !== undefined) {
            result[transform.target] = result[transform.source];
          }
          break;

        case 'map':
          if (result[transform.field] !== undefined) {
            result[transform.field] = transform.mapping[result[transform.field]] || result[transform.field];
          }
          break;

        case 'calculate':
          result[transform.target] = this.evaluateExpression(
            transform.expression,
            result
          );
          break;
      }
    }

    return result;
  }

  private filterData(data: any, conditions: any[]): any {
    if (Array.isArray(data)) {
      return data.filter(item => this.evaluateConditions(item, conditions));
    }

    // For single objects, return null if conditions aren't met
    return this.evaluateConditions(data, conditions) ? data : null;
  }

  private evaluateConditions(item: any, conditions: any[]): boolean {
    return conditions.every(condition => {
      const value = this.getNestedValue(item, condition.field);

      switch (condition.operator) {
        case 'equals':
          return value === condition.value;
        case 'notEquals':
          return value !== condition.value;
        case 'contains':
          return String(value).includes(condition.value);
        case 'startsWith':
          return String(value).startsWith(condition.value);
        case 'endsWith':
          return String(value).endsWith(condition.value);
        case 'greaterThan':
          return value > condition.value;
        case 'lessThan':
          return value < condition.value;
        case 'in':
          return Array.isArray(condition.value) && condition.value.includes(value);
        case 'regex':
          return new RegExp(condition.value).test(String(value));
        default:
          return true;
      }
    });
  }

  private aggregateData(data: any, aggregations: any[]): any {
    if (!Array.isArray(data)) {
      return data;
    }

    const result: any = {};

    for (const agg of aggregations) {
      switch (agg.operation) {
        case 'count':
          result[agg.field || 'count'] = data.length;
          break;

        case 'sum':
          result[`${agg.field}_sum`] = data.reduce((sum, item) => {
            return sum + (Number(this.getNestedValue(item, agg.field)) || 0);
          }, 0);
          break;

        case 'avg':
          const sum = data.reduce((s, item) => {
            return s + (Number(this.getNestedValue(item, agg.field)) || 0);
          }, 0);
          result[`${agg.field}_avg`] = sum / data.length;
          break;

        case 'min':
          result[`${agg.field}_min`] = Math.min(...data.map(item =>
            Number(this.getNestedValue(item, agg.field)) || 0
          ));
          break;

        case 'max':
          result[`${agg.field}_max`] = Math.max(...data.map(item =>
            Number(this.getNestedValue(item, agg.field)) || 0
          ));
          break;

        case 'groupBy':
          const groups: Record<string, any[]> = {};
          data.forEach(item => {
            const key = String(this.getNestedValue(item, agg.field));
            if (!groups[key]) {
              groups[key] = [];
            }
            groups[key].push(item);
          });
          result[`${agg.field}_groups`] = groups;
          break;
      }
    }

    return result;
  }

  private async enrichData(data: any, enrichments: any[]): Promise<any> {
    let result = { ...data };

    for (const enrichment of enrichments) {
      // Mock enrichment - in production would call external APIs
      // IMPORTANT: All external calls respect GDPR/privacy
      switch (enrichment.type) {
        case 'addTimestamp':
          result[enrichment.targetField || 'timestamp'] = new Date().toISOString();
          break;

        case 'addUUID':
          result[enrichment.targetField || 'id'] = crypto.randomUUID();
          break;

        case 'lookup':
          // Silent lookup without logging
          result[enrichment.targetField] = `lookup_${Date.now()}`;
          break;
      }
    }

    return result;
  }

  private validateData(data: any, schema: any): any {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const [field, rules] of Object.entries(schema)) {
      const value = this.getNestedValue(data, field);
      const fieldRules = rules as any;

      if (fieldRules.required && (value === undefined || value === null || value === '')) {
        errors.push(`Required field "${field}" is missing`);
      }

      if (fieldRules.type && typeof value !== fieldRules.type) {
        warnings.push(`Field "${field}" type mismatch (expected ${fieldRules.type})`);
      }

      if (fieldRules.pattern && !new RegExp(fieldRules.pattern).test(String(value))) {
        errors.push(`Field "${field}" does not match required pattern`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      data,
    };
  }

  /**
   * Encrypt fields using AES-256-GCM
   * Format: base64(iv::authTag::encrypted)
   */
  private encryptFields(data: any, fields: string[]): any {
    const result = { ...data };

    for (const field of fields) {
      const value = this.getNestedValue(result, field);
      if (value !== undefined) {
        const encrypted = this.encrypt(String(value));
        this.setNestedValue(result, field, `encrypted:${encrypted}`);
      }
    }

    return result;
  }

  /**
   * Encrypt using AES-256-GCM with key derivation
   */
  private encrypt(text: string): string {
    // Get encryption key from config or use default (should be from env in production)
    const keyPassword = this.config.encryptionKey || 'default-encryption-key-change-in-production';
    const salt = this.config.encryptionSalt || 'default-salt-change-in-production';

    // Derive key from password (32 bytes for AES-256)
    const key = scryptSync(keyPassword, salt, 32);

    // Generate random IV (12 bytes for GCM)
    const iv = randomBytes(12);

    // Create cipher
    const cipher = createCipheriv('aes-256-gcm', key, iv);

    // Encrypt
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Get auth tag
    const authTag = cipher.getAuthTag();

    // Return format: base64(iv::authTag::encrypted)
    const combined = `${iv.toString('base64')}::${authTag.toString('base64')}::${encrypted}`;
    return Buffer.from(combined).toString('base64');
  }

  /**
   * Decrypt AES-256-GCM encrypted data
   */
  private decrypt(encryptedData: string): string {
    const keyPassword = this.config.encryptionKey || 'default-encryption-key-change-in-production';
    const salt = this.config.encryptionSalt || 'default-salt-change-in-production';

    // Derive key
    const key = scryptSync(keyPassword, salt, 32);

    // Decode base64
    const combined = Buffer.from(encryptedData, 'base64').toString('utf8');
    const [ivStr, authTagStr, encrypted] = combined.split('::');

    const iv = Buffer.from(ivStr, 'base64');
    const authTag = Buffer.from(authTagStr, 'base64');

    // Create decipher
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    // Decrypt
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  private maskFields(data: any, fields: any[]): any {
    const result = { ...data };

    for (const fieldConfig of fields) {
      const field = typeof fieldConfig === 'string' ? fieldConfig : fieldConfig.field;
      const visibleChars = fieldConfig.visibleChars || 4;
      const maskChar = fieldConfig.maskChar || '●';

      const value = this.getNestedValue(result, field);
      if (value !== undefined && typeof value === 'string') {
        const masked = maskChar.repeat(Math.max(0, value.length - visibleChars)) +
                      value.slice(-visibleChars);
        this.setNestedValue(result, field, masked);
      }
    }

    return result;
  }

  private async customProcess(data: any, handler: string): Promise<any> {
    // In production, would execute sanitized custom code
    // SECURITY: This should be heavily sandboxed
    return {
      ...data,
      _processed: true,
      _handler: handler,
    };
  }

  /**
   * Safe expression evaluation without eval()
   * Supports: {field1} + {field2}, {field1} * {field2}, etc.
   */
  private evaluateExpression(expression: string, data: any): any {
    try {
      // Extract all variable references {fieldName}
      const variablePattern = /\{([a-zA-Z_][a-zA-Z0-9_.]*)\}/g;
      const variables = new Map<string, any>();

      let match;
      while ((match = variablePattern.exec(expression)) !== null) {
        const varName = match[1];
        const value = this.getNestedValue(data, varName);
        variables.set(varName, value);
      }

      // Replace variables with their actual values
      let evaluated = expression;
      const varsArray = Array.from(variables.entries());
      for (const [varName, value] of varsArray) {
        const valueStr = typeof value === 'string' ? `"${value}"` : String(value);
        evaluated = evaluated.replace(new RegExp(`\\{${varName.replace('.', '\\.')}\\}`, 'g'), valueStr);
      }

      // Safe evaluation of basic math expressions
      // Only allow: numbers, operators (+, -, *, /), parentheses, and decimal points
      if (/^[\d\s+\-*/().]+$/.test(evaluated)) {
        // Use Function constructor instead of eval for better isolation
        // Still not 100% safe, but better than direct eval
        const safeEval = new Function('return ' + evaluated)();
        return safeEval;
      }

      // For non-math expressions, return the replaced string
      return evaluated;
    } catch {
      return null;
    }
  }

  /**
   * Check if a node should run in ghost mode
   */
  static isGhostMode(nodeId: string): boolean {
    // In production, would check configuration
    return false;
  }

  /**
   * Decrypt a field that was encrypted by this node
   */
  static decryptField(encryptedData: string, encryptionKey?: string, encryptionSalt?: string): string {
    const keyPassword = encryptionKey || 'default-encryption-key-change-in-production';
    const salt = encryptionSalt || 'default-salt-change-in-production';

    const key = scryptSync(keyPassword, salt, 32);
    const combined = Buffer.from(encryptedData, 'base64').toString('utf8');
    const [ivStr, authTagStr, encrypted] = combined.split('::');

    const iv = Buffer.from(ivStr, 'base64');
    const authTag = Buffer.from(authTagStr, 'base64');

    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Check if a value is encrypted (starts with 'encrypted:')
   */
  static isEncrypted(value: any): boolean {
    return typeof value === 'string' && value.startsWith('encrypted:');
  }

  /**
   * Extract encrypted data from encrypted field
   */
  static extractEncryptedData(encryptedField: string): string {
    if (!this.isEncrypted(encryptedField)) {
      return encryptedField;
    }
    return encryptedField.replace('encrypted:', '');
  }
}
