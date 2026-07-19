import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult, SetVariableConfig } from '../../types';

/**
 * Set Variable Node - Modifies $json data for the next nodes
 * Can set, update, or delete properties in the data flow
 *
 * Configuration:
 * - key: The key path to set (supports dot notation: "user.name")
 * - value: The value to set
 * - valueType: Type of the value (string, number, boolean, json)
 * - operation: set (default), delete, merge
 */
export class SetVariableNode extends BaseNode {
  constructor(id: string, name: string, config: SetVariableConfig) {
    super(id, name, config);
    this.validateConfig();
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    const config = this.config as SetVariableConfig;

    if (!config.key && config.operation !== 'clearAll') {
      throw new Error('Key is required for set variable operation');
    }

    if (config.valueType && !['string', 'number', 'boolean', 'json', 'object'].includes(config.valueType)) {
      throw new Error(`Invalid valueType: ${config.valueType}. Valid types: string, number, boolean, json, object`);
    }
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const config = this.config as SetVariableConfig;
      const operation = config.operation || 'set';

      // Create a copy of $json to avoid mutating the original
      const newJson = context.$json && typeof context.$json === 'object'
        ? JSON.parse(JSON.stringify(context.$json))
        : {};

      switch (operation) {
        case 'set':
          return await this.setVariable(newJson, config, context);
        case 'delete':
          return await this.deleteVariable(newJson, config);
        case 'merge':
          return await this.mergeObject(newJson, config, context);
        case 'clearAll':
          return await this.clearAll();
        default:
          throw new Error(`Unknown operation: ${operation}. Valid operations: set, delete, merge, clearAll`);
      }
    } catch (error: any) {
      return {
        success: false,
        error: this.formatErrorMessage(error),
      };
    }
  }

  /**
   * Set a variable value
   */
  private async setVariable(
    newJson: any,
    config: SetVariableConfig,
    context: ExecutionContext
  ): Promise<NodeExecutionResult> {
    const key = config.key;
    const value = config.value;
    const valueType = config.valueType || 'string';

    // Resolve variables in the value
    const resolvedValue = this.resolveVariables(value, context, valueType);

    // Set the value in the JSON data
    this.setNestedValue(newJson, key, resolvedValue);

    return {
      success: true,
      data: newJson,
      _operation: 'set',
      _key: key,
    };
  }

  /**
   * Delete a variable
   */
  private async deleteVariable(
    newJson: any,
    config: SetVariableConfig
  ): Promise<NodeExecutionResult> {
    const key = config.key;

    this.deleteNestedValue(newJson, key);

    return {
      success: true,
      data: newJson,
      _operation: 'delete',
      _key: key,
    };
  }

  /**
   * Merge an object into the data
   */
  private async mergeObject(
    newJson: any,
    config: SetVariableConfig,
    context: ExecutionContext
  ): Promise<NodeExecutionResult> {
    const key = config.key || '';
    const value = this.resolveVariables(config.value, context, 'object');

    if (!key) {
      // Merge at root level
      Object.assign(newJson, value);
    } else {
      // Merge at nested level
      const existingValue = this.getNestedValue(newJson, key) || {};
      const mergedValue = typeof existingValue === 'object' && typeof value === 'object'
        ? { ...existingValue, ...value }
        : value;
      this.setNestedValue(newJson, key, mergedValue);
    }

    return {
      success: true,
      data: newJson,
      _operation: 'merge',
      _key: key,
    };
  }

  /**
   * Clear all data
   */
  private async clearAll(): Promise<NodeExecutionResult> {
    return {
      success: true,
      data: {},
      _operation: 'clearAll',
    };
  }

  /**
   * Resolve variables and convert to the specified type
   */
  private resolveVariables(value: any, context: ExecutionContext, targetType: string): any {
    let resolved = value;

    // First, replace any variable placeholders
    if (typeof value === 'string') {
      resolved = this.replaceVariables(value, context);
    }

    // Then convert to the target type
    switch (targetType) {
      case 'string':
        return String(resolved);
      case 'number':
        const num = Number(resolved);
        return isNaN(num) ? 0 : num;
      case 'boolean':
        if (typeof resolved === 'string') {
          const lower = resolved.toLowerCase().trim();
          return lower === 'true' || lower === '1' || lower === 'yes';
        }
        return Boolean(resolved);
      case 'json':
      case 'object':
        if (typeof resolved === 'string') {
          try {
            return JSON.parse(resolved);
          } catch (error) {
            throw new Error(`Invalid JSON: ${resolved}`);
          }
        }
        return resolved;
      default:
        return resolved;
    }
  }

  /**
   * Replace {{ $json.* }} variables in a string
   */
  private replaceVariables(template: string, context: ExecutionContext): string {
    return template.replace(/\{\{\s*\$(json|workflow|node)\.([\w.]+)\s*\}\}/g, (match, source, path) => {
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
   * Delete a nested value using dot notation
   */
  private deleteNestedValue(obj: any, path: string): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;

    let current = obj;
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return;
      }
    }

    if (current && typeof current === 'object') {
      delete current[lastKey];
    }
  }

  /**
   * Format error messages
   */
  private formatErrorMessage(error: any): string {
    if (error.message.includes('Key is required')) {
      return error.message;
    }
    if (error.message.includes('Invalid valueType')) {
      return error.message;
    }
    if (error.message.includes('Invalid JSON')) {
      return error.message;
    }
    if (error.message.includes('Unknown operation')) {
      return error.message;
    }
    return `Set variable error: ${error.message}`;
  }

  getType(): string {
    return 'setVariable';
  }

  getIcon(): string {
    return 'Variable';
  }
}
