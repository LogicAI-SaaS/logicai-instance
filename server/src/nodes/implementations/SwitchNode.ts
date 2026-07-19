import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * Switch Node - Route to different outputs based on value
 * n8n-compatible: Multiple conditional branches
 */
export class SwitchNode extends BaseNode {
  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const field = this.config.field || 'value';
      const routes = this.config.routes || [];
      const defaultValue = this.config.defaultValue;

      const fieldValue = this.getNestedValue(context.$json, field);

      // Find matching route
      let matchedRoute = routes.find((route: any) => {
        return this.evaluateRoute(fieldValue, route);
      });

      // If no match, use default route if specified
      if (!matchedRoute && defaultValue !== undefined) {
        matchedRoute = {
          output: defaultValue,
          isDefault: true,
        };
      }

      if (matchedRoute) {
        return {
          success: true,
          data: {
            ...context.$json,
            _switch: {
              field,
              value: fieldValue,
              matchedOutput: matchedRoute.output,
              route: matchedRoute,
            },
          },
        };
      }

      // No match and no default
      return {
        success: true,
        data: {
          ...context.$json,
          _switch: {
            field,
            value: fieldValue,
            noMatch: true,
          },
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Switch failed',
      };
    }
  }

  getType(): string {
    return 'switch';
  }

  getIcon(): string {
    return 'GitBranch';
  }

  private evaluateRoute(fieldValue: any, route: any): boolean {
    const { operator, value } = route;

    switch (operator) {
      case 'equals':
        return fieldValue === value;

      case 'notEquals':
        return fieldValue !== value;

      case 'contains':
        return typeof fieldValue === 'string' && fieldValue.includes(value);

      case 'startsWith':
        return typeof fieldValue === 'string' && fieldValue.startsWith(value);

      case 'endsWith':
        return typeof fieldValue === 'string' && fieldValue.endsWith(value);

      case 'greaterThan':
        return fieldValue > value;

      case 'lessThan':
        return fieldValue < value;

      case 'in':
        return Array.isArray(value) && value.includes(fieldValue);

      case 'matches':
        return String(fieldValue).match(new RegExp(value)) !== null;

      case 'isEmpty':
        return !fieldValue || (typeof fieldValue === 'string' && fieldValue.trim() === '');

      case 'isNotEmpty':
        return fieldValue && (typeof fieldValue !== 'string' || fieldValue.trim() !== '');

      default:
        return false;
    }
  }
}
