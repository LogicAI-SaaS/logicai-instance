import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * Smart Data Cleaner - Automatically normalizes and cleans data
 * Handles dates, phone numbers, text trimming, capitalization
 */
export class SmartDataCleanerNode extends BaseNode {
  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const data = { ...context.$json };
      const rules = this.config.cleaningRules || {};

      // Apply cleaning rules to each field
      for (const [fieldPath, rule] of Object.entries(rules)) {
        const value = this.getNestedValue(data, fieldPath);

        if (value !== undefined && value !== null) {
          const cleanedValue = this.applyRule(value, rule);
          this.setNestedValue(data, fieldPath, cleanedValue);
        }
      }

      return {
        success: true,
        data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Data cleaning failed',
      };
    }
  }

  getType(): string {
    return 'smartDataCleaner';
  }

  getIcon(): string {
    return 'Sparkles';
  }

  private applyRule(value: any, rule: any): any {
    if (typeof value !== 'string' && rule.type !== 'typeConversion') {
      return value;
    }

    switch (rule.type) {
      case 'trim':
        return String(value).trim();

      case 'capitalize':
        return String(value)
          .toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

      case 'uppercase':
        return String(value).toUpperCase();

      case 'lowercase':
        return String(value).toLowerCase();

      case 'normalizePhone':
        return this.normalizePhoneNumber(value, rule.format || 'E164');

      case 'normalizeDate':
        return this.normalizeDate(value, rule.format || 'ISO');

      case 'normalizeEmail':
        return this.normalizeEmail(value);

      case 'removeAccents':
        return this.removeAccents(value);

      case 'removeExtraSpaces':
        return String(value).replace(/\s+/g, ' ').trim();

      case 'typeConversion':
        return this.convertType(value, rule.targetType);

      case 'removeSpecialChars':
        return String(value).replace(/[^a-zA-Z0-9\s]/g, '');

      case 'maskSensitive':
        return this.maskSensitive(value, rule.visibleChars || 4, rule.maskChar || '*');

      default:
        return value;
    }
  }

  private normalizePhoneNumber(phone: string, format: string): string {
    // Remove all non-numeric characters
    const cleaned = String(phone).replace(/\D/g, '');

    switch (format) {
      case 'E164':
        // E.164 format: +[country_code][number]
        if (!cleaned.startsWith('') && cleaned.length === 10) {
          return `+1${cleaned}`;
        }
        return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;

      case 'NANP':
        // North American Numbering Plan: (XXX) XXX-XXXX
        if (cleaned.length === 10) {
          return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }
        return phone;

      default:
        return cleaned;
    }
  }

  private normalizeDate(date: any, format: string): string {
    const d = new Date(date);

    if (isNaN(d.getTime())) {
      return date; // Return original if invalid
    }

    switch (format) {
      case 'ISO':
        return d.toISOString();

      case 'YYYY-MM-DD':
        return d.toISOString().split('T')[0];

      case 'DD/MM/YYYY':
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;

      case 'timestamp':
        return String(Math.floor(d.getTime() / 1000));

      default:
        return d.toISOString();
    }
  }

  private normalizeEmail(email: string): string {
    return String(email)
      .trim()
      .toLowerCase();
  }

  private removeAccents(text: string): string {
    return String(text)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private convertType(value: any, targetType: string): any {
    switch (targetType) {
      case 'number':
        return Number(value);
      case 'boolean':
        if (typeof value === 'string') {
          return value.toLowerCase() === 'true';
        }
        return Boolean(value);
      case 'string':
        return String(value);
      case 'json':
        try {
          return typeof value === 'string' ? JSON.parse(value) : value;
        } catch {
          return value;
        }
      default:
        return value;
    }
  }

  private maskSensitive(value: string, visibleChars: number, maskChar: string): string {
    const str = String(value);
    if (str.length <= visibleChars) {
      return str;
    }
    const visible = str.slice(-visibleChars);
    return maskChar.repeat(str.length - visibleChars) + visible;
  }
}
