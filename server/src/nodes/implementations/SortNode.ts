import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * Sort Node - Sort data by one or multiple fields
 * n8n-compatible: Sort arrays of objects by field values
 *
 * Configuration:
 * - sortFields: Array of { fieldName, order }
 * - order: 'asc' (ascending) or 'desc' (descending)
 * - fieldName: Dot-notation path to sort by (e.g., "user.name", "metadata.createdAt")
 */
export class SortNode extends BaseNode {
  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const sortFields = this.config.sortFields || [];
      const input = context.$json;

      // Validate input type
      if (!Array.isArray(input)) {
        return {
          success: true,
          data: input,
          _sort: {
            sorted: false,
            reason: 'Input is not an array, returned as-is',
          },
        };
      }

      // Validate sort configuration
      if (sortFields.length === 0) {
        return {
          success: true,
          data: input,
          _sort: {
            sorted: false,
            reason: 'No sort fields specified, returned as-is',
          },
        };
      }

      // Validate each sort field config
      for (const fieldConfig of sortFields) {
        if (!fieldConfig.fieldName) {
          throw new Error('Each sort field must have a fieldName property');
        }
        if (fieldConfig.order && !['asc', 'desc'].includes(fieldConfig.order.toLowerCase())) {
          throw new Error(`Invalid sort order: ${fieldConfig.order}. Use 'asc' or 'desc'`);
        }
      }

      // Create sorted copy
      const sorted = [...input].sort((a, b) => {
        for (const fieldConfig of sortFields) {
          const { fieldName, order = 'asc' } = fieldConfig;
          const aValue = this.getNestedValue(a, fieldName);
          const bValue = this.getNestedValue(b, fieldName);

          const comparison = this.compareValues(aValue, bValue);

          if (comparison !== 0) {
            return order.toLowerCase() === 'asc' ? comparison : -comparison;
          }
        }
        return 0;
      });

      return {
        success: true,
        data: sorted,
        _sort: {
          sorted: true,
          sortFields,
          itemCount: sorted.length,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.formatErrorMessage(error),
      };
    }
  }

  getType(): string {
    return 'sort';
  }

  getIcon(): string {
    return 'ArrowUpDown';
  }

  private compareValues(a: any, b: any): number {
    // Handle null/undefined
    if (a == null && b == null) return 0;
    if (a == null) return -1;
    if (b == null) return 1;

    // Handle numbers
    if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    }

    // Handle dates (ISO strings or Date objects)
    const aDate = a instanceof Date ? a : new Date(a);
    const bDate = b instanceof Date ? b : new Date(b);
    if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
      return aDate.getTime() - bDate.getTime();
    }

    // Handle booleans
    if (typeof a === 'boolean' && typeof b === 'boolean') {
      return (a === b ? 0 : a ? 1 : -1);
    }

    // Handle strings
    const aStr = String(a).toLowerCase();
    const bStr = String(b).toLowerCase();
    return aStr.localeCompare(bStr);
  }

  /**
   * Format error messages
   */
  private formatErrorMessage(error: any): string {
    if (error.message.includes('fieldName')) {
      return error.message;
    }
    if (error.message.includes('Invalid sort order')) {
      return error.message;
    }
    return `Sort error: ${error.message}`;
  }
}
