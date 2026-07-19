import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * If Node - Conditional branching
 * 
 * Evaluates a condition and returns true or false branch
 * Simpler than Switch node for binary decisions
 */
export class IfNode extends BaseNode {
  getType(): string {
    return 'if';
  }

  getIcon(): string {
    return 'git-branch';
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const condition = this.evaluateCondition(context);
      
      return {
        success: true,
        data: {
          condition,
          branch: condition ? 'true' : 'false',
          value: condition ? this.config.trueValue : this.config.falseValue,
        },
        error: null,
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: error.message,
      };
    }
  }

  private evaluateCondition(context: ExecutionContext): boolean {
    const conditionType = this.config.conditionType || 'simple';
    
    switch (conditionType) {
      case 'simple':
        return this.evaluateSimpleCondition(context);
      case 'expression':
        return this.evaluateExpression(context);
      case 'multiple':
        return this.evaluateMultipleConditions(context);
      default:
        throw new Error(`Unknown condition type: ${conditionType}`);
    }
  }

  private evaluateSimpleCondition(context: ExecutionContext): boolean {
    const value1 = this.getValue(this.config.value1, context);
    const operator = this.config.operator || '===';
    const value2 = this.getValue(this.config.value2, context);
    
    switch (operator) {
      case '===':
      case '==':
        return value1 === value2;
      case '!==':
      case '!=':
        return value1 !== value2;
      case '>':
        return value1 > value2;
      case '>=':
        return value1 >= value2;
      case '<':
        return value1 < value2;
      case '<=':
        return value1 <= value2;
      case 'contains':
        return String(value1).includes(String(value2));
      case 'startsWith':
        return String(value1).startsWith(String(value2));
      case 'endsWith':
        return String(value1).endsWith(String(value2));
      case 'matches':
        return new RegExp(String(value2)).test(String(value1));
      case 'isEmpty':
        return !value1 || (Array.isArray(value1) && value1.length === 0) || (typeof value1 === 'string' && value1.trim() === '');
      case 'isNotEmpty':
        return !!value1 && (!Array.isArray(value1) || value1.length > 0) && (typeof value1 !== 'string' || value1.trim() !== '');
      case 'isNull':
        return value1 === null || value1 === undefined;
      case 'isNotNull':
        return value1 !== null && value1 !== undefined;
      default:
        throw new Error(`Unknown operator: ${operator}`);
    }
  }

  protected evaluateExpression(context: ExecutionContext): boolean {
    const expression = this.config.expression || '';
    
    if (!expression) {
      throw new Error('Expression is required');
    }
    
    try {
      // Simple expression evaluation (can be extended with a proper expression parser)
      // For now, just evaluate simple property access
      const value = this.getValue(expression, context);
      return !!value;
    } catch (error) {
      return false;
    }
  }

  private evaluateMultipleConditions(context: ExecutionContext): boolean {
    const conditions = this.config.conditions || [];
    const combineOperation = this.config.combineOperation || 'AND'; // AND, OR
    
    if (!Array.isArray(conditions) || conditions.length === 0) {
      throw new Error('Conditions array is required for multiple conditions');
    }
    
    const results = conditions.map((cond: any) => {
      const value1 = this.getValue(cond.value1, context);
      const value2 = this.getValue(cond.value2, context);
      const operator = cond.operator || '===';
      
      // Reuse simple condition logic
      const tempConfig = { value1, value2, operator };
      const tempContext = context;
      this.config = { ...this.config, ...tempConfig };
      return this.evaluateSimpleCondition(tempContext);
    });
    
    if (combineOperation === 'OR') {
      return results.some(r => r);
    } else {
      return results.every(r => r);
    }
  }

  protected getValue(value: any, context: ExecutionContext): any {
    // If value is a string starting with $, treat as context path
    if (typeof value === 'string' && value.startsWith('$')) {
      const path = value.slice(1).split('.');
      let result: any = context;
      
      for (const part of path) {
        if (result && typeof result === 'object' && part in result) {
          result = result[part];
        } else {
          return undefined;
        }
      }
      
      return result;
    }
    
    return value;
  }

  validateConfig(): string[] {
    const errors: string[] = [];
    
    if (this.config.conditionType === 'simple') {
      if (this.config.value1 === undefined) {
        errors.push('value1 is required for simple condition');
      }
      if (!this.config.operator) {
        errors.push('Operator is required for simple condition');
      }
    }

    if (this.config.conditionType === 'expression' && !this.config.expression) {
      errors.push('Expression is required for expression condition');
    }

    if (this.config.conditionType === 'multiple' && (!this.config.conditions || this.config.conditions.length === 0)) {
      errors.push('Conditions array is required for multiple conditions');
    }

    return errors;
  }
}
