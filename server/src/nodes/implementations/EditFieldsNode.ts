import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * Edit Fields (Set) Node - Manipulate, add, or remove JSON fields
 * n8n-compatible: Rename, delete, copy, and transform fields
 */
export class EditFieldsNode extends BaseNode {
  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const operations = this.config.operations || [];
      let result = { ...context.$json };

      for (const op of operations) {
        result = this.applyOperation(result, op);
      }

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Edit fields failed',
      };
    }
  }

  getType(): string {
    return 'editFields';
  }

  getIcon(): string {
    return 'Edit';
  }

  private applyOperation(data: any, operation: any): any {
    const { type } = operation;

    switch (type) {
      case 'rename':
        return this.renameField(data, operation.from, operation.to);

      case 'delete':
        return this.deleteField(data, operation.fields);

      case 'copy':
        return this.copyField(data, operation.from, operation.to);

      case 'set':
        return this.setField(data, operation.field, operation.value);

      case 'transform':
        return this.transformField(data, operation.field, operation.transform);

      case 'move':
        return this.moveField(data, operation.from, operation.to);

      case 'extract':
        return this.extractField(data, operation.field, operation.target);

      case 'default':
        return this.setDefaultValue(data, operation.field, operation.value);

      case 'keep':
        return this.keepOnlyFields(data, operation.fields);

      default:
        return data;
    }
  }

  private renameField(data: any, from: string, to: string): any {
    if (Array.isArray(data)) {
      return data.map(item => {
        if (item[from] !== undefined) {
          item[to] = item[from];
          delete item[from];
        }
        return item;
      });
    }

    if (data[from] !== undefined) {
      data[to] = data[from];
      delete data[from];
    }

    return data;
  }

  private deleteField(data: any, fields: string[]): any {
    if (Array.isArray(data)) {
      return data.map(item => {
        const result = { ...item };
        fields.forEach(field => delete result[field]);
        return result;
      });
    }

    const result = { ...data };
    fields.forEach(field => delete result[field]);
    return result;
  }

  private copyField(data: any, from: string, to: string): any {
    if (Array.isArray(data)) {
      return data.map(item => {
        if (item[from] !== undefined) {
          item[to] = item[from];
        }
        return item;
      });
    }

    if (data[from] !== undefined) {
      data[to] = data[from];
    }

    return data;
  }

  private setField(data: any, field: string, value: any): any {
    this.setNestedValue(data, field, value);
    return data;
  }

  private transformField(data: any, field: string, transform: string): any {
    const value = this.getNestedValue(data, field);

    if (value === undefined) return data;

    let transformed = value;

    switch (transform) {
      case 'toString':
        transformed = String(value);
        break;
      case 'toNumber':
        transformed = Number(value);
        break;
      case 'toBoolean':
        transformed = Boolean(value);
        break;
      case 'toUpperCase':
        transformed = String(value).toUpperCase();
        break;
      case 'toLowerCase':
        transformed = String(value).toLowerCase();
        break;
      case 'trim':
        transformed = String(value).trim();
        break;
      case 'capitalize':
        transformed = String(value).charAt(0).toUpperCase() + String(value).slice(1);
        break;
      case 'date':
        transformed = new Date(value).toISOString();
        break;
      case 'json':
        transformed = typeof value === 'string' ? JSON.parse(value) : JSON.stringify(value);
        break;
    }

    this.setNestedValue(data, field, transformed);
    return data;
  }

  private moveField(data: any, from: string, to: string): any {
    const value = this.getNestedValue(data, from);

    if (value !== undefined) {
      this.setNestedValue(data, to, value);

      // Delete from old location
      const keys = from.split('.');
      if (keys.length === 1) {
        delete data[keys[0]];
      }
    }

    return data;
  }

  private extractField(data: any, field: string, target: string): any {
    const value = this.getNestedValue(data, field);

    if (value !== undefined) {
      data[target] = value;
    }

    return data;
  }

  private setDefaultValue(data: any, field: string, value: any): any {
    const currentValue = this.getNestedValue(data, field);

    if (currentValue === undefined || currentValue === null) {
      this.setNestedValue(data, field, value);
    }

    return data;
  }

  private keepOnlyFields(data: any, fields: string[]): any {
    if (Array.isArray(data)) {
      return data.map(item => {
        const result: any = {};
        fields.forEach(field => {
          if (item[field] !== undefined) {
            result[field] = item[field];
          }
        });
        return result;
      });
    }

    const result: any = {};
    fields.forEach(field => {
      if (data[field] !== undefined) {
        result[field] = data[field];
      }
    });

    return result;
  }
}
