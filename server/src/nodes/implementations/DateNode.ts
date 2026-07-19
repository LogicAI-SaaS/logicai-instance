import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * Date Node - Date manipulation and formatting
 * 
 * Supported operations:
 * - format: Format date to string
 * - parse: Parse string to date
 * - add: Add time to date
 * - subtract: Subtract time from date
 * - diff: Calculate difference between dates
 * - now: Get current date/time
 */
export class DateNode extends BaseNode {
  getType(): string {
    return 'date';
  }

  getIcon(): string {
    return 'calendar';
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const operation = this.config.operation || 'now';
      
      switch (operation) {
        case 'format':
          return await this.format(context);
        case 'parse':
          return await this.parse(context);
        case 'add':
          return await this.add(context);
        case 'subtract':
          return await this.subtract(context);
        case 'diff':
          return await this.diff(context);
        case 'now':
          return await this.now(context);
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: error.message,
      };
    }
  }

  private async format(context: ExecutionContext): Promise<NodeExecutionResult> {
    const date = this.getDate(this.config.date || context.$json.date);
    const format = this.config.format || 'ISO';
    const timezone = this.config.timezone || 'UTC';
    
    let formatted: string;
    
    switch (format) {
      case 'ISO':
        formatted = date.toISOString();
        break;
      case 'date':
        formatted = date.toISOString().split('T')[0];
        break;
      case 'time':
        formatted = date.toISOString().split('T')[1].split('.')[0];
        break;
      case 'datetime':
        formatted = date.toISOString().replace('T', ' ').split('.')[0];
        break;
      case 'timestamp':
        formatted = date.getTime().toString();
        break;
      case 'locale':
        formatted = date.toLocaleString(this.config.locale || 'en-US');
        break;
      default:
        formatted = this.customFormat(date, format);
    }
    
    return {
      success: true,
      data: {
        formatted,
        original: date.toISOString(),
        timestamp: date.getTime(),
      },
      error: null,
    };
  }

  private async parse(context: ExecutionContext): Promise<NodeExecutionResult> {
    const dateString = this.config.dateString || context.$json.dateString || '';
    const date = this.getDate(dateString);
    
    return {
      success: true,
      data: {
        iso: date.toISOString(),
        timestamp: date.getTime(),
        date: date.toISOString().split('T')[0],
        time: date.toISOString().split('T')[1].split('.')[0],
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        hours: date.getHours(),
        minutes: date.getMinutes(),
        seconds: date.getSeconds(),
      },
      error: null,
    };
  }

  private async add(context: ExecutionContext): Promise<NodeExecutionResult> {
    const date = this.getDate(this.config.date || context.$json.date);
    const amount = this.config.amount || context.$json.amount || 0;
    const unit = this.config.unit || 'days';
    
    const result = new Date(date);
    
    switch (unit) {
      case 'years':
        result.setFullYear(result.getFullYear() + amount);
        break;
      case 'months':
        result.setMonth(result.getMonth() + amount);
        break;
      case 'weeks':
        result.setDate(result.getDate() + (amount * 7));
        break;
      case 'days':
        result.setDate(result.getDate() + amount);
        break;
      case 'hours':
        result.setHours(result.getHours() + amount);
        break;
      case 'minutes':
        result.setMinutes(result.getMinutes() + amount);
        break;
      case 'seconds':
        result.setSeconds(result.getSeconds() + amount);
        break;
      case 'milliseconds':
        result.setMilliseconds(result.getMilliseconds() + amount);
        break;
    }
    
    return {
      success: true,
      data: {
        result: result.toISOString(),
        original: date.toISOString(),
        added: `${amount} ${unit}`,
      },
      error: null,
    };
  }

  private async subtract(context: ExecutionContext): Promise<NodeExecutionResult> {
    const amount = this.config.amount || context.$json.amount || 0;
    
    // Reuse add logic with negative amount
    this.config.amount = -amount;
    return this.add(context);
  }

  private async diff(context: ExecutionContext): Promise<NodeExecutionResult> {
    const date1 = this.getDate(this.config.date1 || context.$json.date1);
    const date2 = this.getDate(this.config.date2 || context.$json.date2 || new Date());
    const unit = this.config.unit || 'milliseconds';
    
    const diffMs = Math.abs(date2.getTime() - date1.getTime());
    
    let difference: number;
    
    switch (unit) {
      case 'years':
        difference = diffMs / (1000 * 60 * 60 * 24 * 365.25);
        break;
      case 'months':
        difference = diffMs / (1000 * 60 * 60 * 24 * 30.44);
        break;
      case 'weeks':
        difference = diffMs / (1000 * 60 * 60 * 24 * 7);
        break;
      case 'days':
        difference = diffMs / (1000 * 60 * 60 * 24);
        break;
      case 'hours':
        difference = diffMs / (1000 * 60 * 60);
        break;
      case 'minutes':
        difference = diffMs / (1000 * 60);
        break;
      case 'seconds':
        difference = diffMs / 1000;
        break;
      default:
        difference = diffMs;
    }
    
    return {
      success: true,
      data: {
        difference: Math.floor(difference),
        unit,
        date1: date1.toISOString(),
        date2: date2.toISOString(),
      },
      error: null,
    };
  }

  private async now(context: ExecutionContext): Promise<NodeExecutionResult> {
    const date = new Date();
    
    return {
      success: true,
      data: {
        iso: date.toISOString(),
        timestamp: date.getTime(),
        date: date.toISOString().split('T')[0],
        time: date.toISOString().split('T')[1].split('.')[0],
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        hours: date.getHours(),
        minutes: date.getMinutes(),
        seconds: date.getSeconds(),
        dayOfWeek: date.getDay(),
      },
      error: null,
    };
  }

  private getDate(input: any): Date {
    if (!input) return new Date();
    if (input instanceof Date) return input;
    if (typeof input === 'number') return new Date(input);
    if (typeof input === 'string') return new Date(input);
    return new Date();
  }

  private customFormat(date: Date, format: string): string {
    const tokens: Record<string, string> = {
      'YYYY': date.getFullYear().toString(),
      'MM': String(date.getMonth() + 1).padStart(2, '0'),
      'DD': String(date.getDate()).padStart(2, '0'),
      'HH': String(date.getHours()).padStart(2, '0'),
      'mm': String(date.getMinutes()).padStart(2, '0'),
      'ss': String(date.getSeconds()).padStart(2, '0'),
    };
    
    let result = format;
    for (const [token, value] of Object.entries(tokens)) {
      result = result.replace(new RegExp(token, 'g'), value);
    }
    
    return result;
  }

  validateConfig(): string[] {
    const errors: string[] = [];
    
    if (['add', 'subtract'].includes(this.config.operation) && !this.config.amount) {
      errors.push('Amount is required for add/subtract operations');
    }

    if (this.config.operation === 'diff' && !this.config.date1) {
      errors.push('date1 is required for diff operation');
    }

    return errors;
  }
}
