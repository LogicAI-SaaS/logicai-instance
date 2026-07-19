import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * Filter Node - Filter data based on conditions
 * n8n-compatible: Keep only items that match the filter criteria
 */
export class FilterNode extends BaseNode {
  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const conditions = this.config.conditions || [];
      const matchType = this.config.matchType || 'all'; // all, any, none
      const input = context.$json;

      // Handle both single items and arrays
      const items = Array.isArray(input) ? input : [input];

      // Filter items
      const filteredItems = items.filter(item => {
        const matches = this.evaluateConditions(item, conditions);

        switch (matchType) {
          case 'all':
            return conditions.length > 0 && matches.every(m => m);
          case 'any':
            return matches.some(m => m);
          case 'none':
            return conditions.length > 0 && matches.every(m => !m);
          default:
            return true;
        }
      });

      // Return filtered results
      // If input was array, return array; if single item, return single item or null
      const result = Array.isArray(input) ? filteredItems : (filteredItems[0] || null);

      // If no items match and we're in filter mode, we can stop execution
      if ((Array.isArray(result) && result.length === 0) || result === null) {
        return {
          success: true,
          data: null,
          _filtered: true,
          _noMatch: true,
        };
      }

      return {
        success: true,
        data: result,
        _filtered: true,
        _originalCount: items.length,
        _filteredCount: Array.isArray(result) ? result.length : 1,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Filter failed',
      };
    }
  }

  getType(): string {
    return 'filter';
  }

  getIcon(): string {
    return 'Filter';
  }

  private evaluateConditions(item: any, conditions: any[]): boolean[] {
    return conditions.map(condition => {
      const { field, operator, value } = condition;
      const itemValue = this.getNestedValue(item, field);

      return this.evaluateCondition(itemValue, operator, value);
    });
  }

  private evaluateCondition(itemValue: any, operator: string, compareValue: any): boolean {
    switch (operator) {
      case 'equals':
      case '==':
        return itemValue === compareValue;

      case 'notEquals':
      case '!=':
        return itemValue !== compareValue;

      case 'contains':
        return typeof itemValue === 'string' && itemValue.includes(compareValue);

      case 'notContains':
        return typeof itemValue === 'string' && !itemValue.includes(compareValue);

      case 'startsWith':
        return typeof itemValue === 'string' && itemValue.startsWith(compareValue);

      case 'endsWith':
        return typeof itemValue === 'string' && itemValue.endsWith(compareValue);

      case 'greaterThan':
      case '>':
        return itemValue > compareValue;

      case 'lessThan':
      case '<':
        return itemValue < compareValue;

      case 'greaterThanOrEqual':
      case '>=':
        return itemValue >= compareValue;

      case 'lessThanOrEqual':
      case '<=':
        return itemValue <= compareValue;

      case 'isEmpty':
        return !itemValue || (typeof itemValue === 'string' && itemValue.trim() === '') || (Array.isArray(itemValue) && itemValue.length === 0);

      case 'isNotEmpty':
        return itemValue && (typeof itemValue !== 'string' || itemValue.trim() !== '') && (!Array.isArray(itemValue) || itemValue.length > 0);

      case 'isNull':
        return itemValue === null || itemValue === undefined;

      case 'isNotNull':
        return itemValue !== null && itemValue !== undefined;

      case 'in':
        return Array.isArray(compareValue) && compareValue.includes(itemValue);

      case 'notIn':
        return Array.isArray(compareValue) && !compareValue.includes(itemValue);

      case 'regex':
        return new RegExp(compareValue).test(String(itemValue));

      case 'matches':
        return String(itemValue).match(new RegExp(compareValue)) !== null;

      case 'type':
        return typeof itemValue === compareValue;

      default:
        return false;
    }
  }
}
