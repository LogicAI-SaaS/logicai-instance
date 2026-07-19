import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * Loop Node - Iterate over arrays and objects
 * 
 * Supported operations:
 * - forEach: Iterate over array items
 * - map: Transform array items
 * - filter: Filter array items based on condition
 * - repeat: Repeat N times with counter
 */
export class LoopNode extends BaseNode {
  getType(): string {
    return 'loop';
  }

  getIcon(): string {
    return 'repeat';
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const operation = this.config.operation || 'forEach';
      
      switch (operation) {
        case 'forEach':
          return await this.forEach(context);
        case 'map':
          return await this.map(context);
        case 'filter':
          return await this.filter(context);
        case 'repeat':
          return await this.repeat(context);
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

  private async forEach(context: ExecutionContext): Promise<NodeExecutionResult> {
    const items = this.config.items || context.$json.items || [];
    
    if (!Array.isArray(items)) {
      throw new Error('Items must be an array');
    }

    const results = [];
    for (let i = 0; i < items.length; i++) {
      results.push({
        index: i,
        item: items[i],
        isFirst: i === 0,
        isLast: i === items.length - 1,
        total: items.length,
      });
    }
    
    return {
      success: true,
      data: {
        results,
        count: items.length,
      },
      error: null,
    };
  }

  private async map(context: ExecutionContext): Promise<NodeExecutionResult> {
    const items = this.config.items || context.$json.items || [];
    const expression = this.config.expression || 'item';
    
    if (!Array.isArray(items)) {
      throw new Error('Items must be an array');
    }

    const results = items.map((item, index) => {
      try {
        // Simple expression evaluation (can be extended)
        if (expression === 'item') return item;
        
        // Create context for expression evaluation
        const evalContext = { item, index, total: items.length };
        return this.evaluateExpression(expression, evalContext);
      } catch (error) {
        return null;
      }
    });
    
    return {
      success: true,
      data: {
        results: results.filter(r => r !== null),
        original: items,
        count: results.length,
      },
      error: null,
    };
  }

  private async filter(context: ExecutionContext): Promise<NodeExecutionResult> {
    const items = this.config.items || context.$json.items || [];
    const condition = this.config.condition;
    
    if (!Array.isArray(items)) {
      throw new Error('Items must be an array');
    }

    const results = items.filter((item, index) => {
      try {
        if (!condition) return true;
        
        const evalContext = { item, index, total: items.length };
        return this.evaluateCondition(condition, evalContext);
      } catch (error) {
        return false;
      }
    });
    
    return {
      success: true,
      data: {
        results,
        original: items,
        filtered: items.length - results.length,
        count: results.length,
      },
      error: null,
    };
  }

  private async repeat(context: ExecutionContext): Promise<NodeExecutionResult> {
    const times = this.config.times || context.$json.times || 1;
    
    if (typeof times !== 'number' || times < 1) {
      throw new Error('Times must be a positive number');
    }

    const results = [];
    for (let i = 0; i < times; i++) {
      results.push({
        iteration: i + 1,
        counter: i,
        isFirst: i === 0,
        isLast: i === times - 1,
        total: times,
      });
    }
    
    return {
      success: true,
      data: {
        results,
        count: times,
      },
      error: null,
    };
  }

  protected evaluateExpression(expression: string, context: Record<string, any>): any {
    // Simple property access (e.g., "item.name", "item.value")
    const parts = expression.split('.');
    let result: any = context;
    
    for (const part of parts) {
      if (result && typeof result === 'object' && part in result) {
        result = result[part];
      } else {
        return null;
      }
    }
    
    return result;
  }

  protected evaluateCondition(condition: string | Record<string, any>, context: Record<string, any>): boolean {
    if (typeof condition === 'string') {
      // Simple comparisons (e.g., "item > 5", "item.active === true")
      return true; // Simplified, can be extended with expression parser
    }
    
    if (typeof condition === 'object') {
      // Object-based condition (e.g., { field: "status", operator: "===", value: "active" })
      const { field, operator, value } = condition;
      const itemValue = this.evaluateExpression(field, context);
      
      switch (operator) {
        case '===': return itemValue === value;
        case '!==': return itemValue !== value;
        case '>': return itemValue > value;
        case '>=': return itemValue >= value;
        case '<': return itemValue < value;
        case '<=': return itemValue <= value;
        case 'includes': return Array.isArray(itemValue) && itemValue.includes(value);
        case 'startsWith': return typeof itemValue === 'string' && itemValue.startsWith(value);
        case 'endsWith': return typeof itemValue === 'string' && itemValue.endsWith(value);
        default: return true;
      }
    }
    
    return true;
  }

  validateConfig(): string[] {
    const errors: string[] = [];
    
    if (this.config.operation === 'repeat' && !this.config.times) {
      errors.push('Times is required for repeat operation');
    }

    return errors;
  }
}
