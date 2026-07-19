import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult, ConditionConfig } from '../../types';

/**
 * Condition Node - Splits the workflow based on a conditional expression
 * Uses a simple expression evaluator to determine true/false path
 *
 * Configuration:
 * - expression: Conditional expression (e.g., "user.age > 18", "status equals active")
 * - truePath: Output path when condition is true
 * - falsePath: Output path when condition is false
 * - combineOperation: When multiple conditions (AND/OR) - default: AND
 */
export class ConditionNode extends BaseNode {
  constructor(id: string, name: string, config: ConditionConfig) {
    super(id, name, config);
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      // Validate configuration
      if (!this.config.expression && !this.config.conditions) {
        throw new Error('Expression or conditions array is required');
      }

      const config = this.config as ConditionConfig;
      const result = this.config.conditions
        ? this.evaluateMultipleConditions(config.conditions, config.combineOperation || 'AND', context)
        : this.evaluateCondition(config.expression, context);

      // Return result with path information
      return {
        success: true,
        data: {
          ...context.$json,
          _condition: {
            result,
            path: result ? (config.truePath || null) : (config.falsePath || null),
            expression: config.expression,
          },
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.formatErrorMessage(error),
      };
    }
  }

  /**
   * Evaluate multiple conditions with AND/OR logic
   */
  private evaluateMultipleConditions(
    conditions: string[],
    operation: 'AND' | 'OR',
    context: ExecutionContext
  ): boolean {
    if (!conditions || conditions.length === 0) {
      return true;
    }

    const results = conditions.map(expr => this.evaluateCondition(expr, context));

    return operation === 'AND'
      ? results.every(r => r === true)
      : results.some(r => r === true);
  }

  getType(): string {
    return 'condition';
  }

  getIcon(): string {
    return 'GitBranch';
  }

  /**
   * Evaluate a conditional expression
   * Supports simple comparisons: equals, not equals, greater than, less than, contains, etc.
   * Expression format: "field operator value"
   * Examples:
   *   "user.age > 18"
   *   "status equals active"
   *   "tags contains premium"
   *   "user.isActive equals true"
   */
  private evaluateCondition(expression: string, context: ExecutionContext): boolean {
    // Trim and parse the expression
    const expr = expression.trim();

    if (!expr) {
      throw new Error('Empty expression');
    }

    // Supported operators
    const operators = [
      { name: '>=', pattern: />=/ },
      { name: '<=', pattern: /<=/ },
      { name: '>', pattern: />/ },
      { name: '<', pattern: /</ },
      { name: '!==', pattern: /!==/ },
      { name: '===', pattern: /===/ },
      { name: '!=', pattern: /!=|not equals/i },
      { name: '==', pattern: /==|equals/i },
      { name: 'contains', pattern: /contains/i },
      { name: 'startsWith', pattern: /startsWith/i },
      { name: 'endsWith', pattern: /endsWith/i },
      { name: 'matches', pattern: /matches/i },
      { name: 'exists', pattern: /exists/i },
      { name: 'isEmpty', pattern: /isEmpty/i },
    ];

    // Find the operator in the expression
    let matchedOp: typeof operators[0] | null = null;
    let opIndex = -1;

    for (const op of operators) {
      const match = expr.match(op.pattern);
      if (match) {
        matchedOp = op;
        opIndex = match.index!;
        break;
      }
    }

    // Special handling for unary operators (exists, isEmpty)
    if (matchedOp && (matchedOp.name === 'exists' || matchedOp.name === 'isEmpty')) {
      const fieldPart = expr.substring(0, opIndex).trim();
      const value = this.getValueFromExpression(fieldPart, context);
      return matchedOp.name === 'exists'
        ? value !== undefined && value !== null
        : !value || (Array.isArray(value) && value.length === 0) || (typeof value === 'string' && value.trim().length === 0);
    }

    if (!matchedOp || opIndex === -1) {
      // If no operator found, check if the field exists and is truthy
      const value = this.getValueFromExpression(expr, context);
      return Boolean(value);
    }

    // Split the expression into left and right parts
    const leftPart = expr.substring(0, opIndex).trim();
    const rightPart = expr.substring(opIndex + matchedOp.name.length).trim();

    // Get the values
    const leftValue = this.getValueFromExpression(leftPart, context);
    const rightValue = this.getValueFromExpression(rightPart, context);

    // Perform the comparison
    return this.compareValues(leftValue, rightValue, matchedOp.name);
  }

  /**
   * Get a value from an expression part
   * Can be a field path (e.g., "user.age") or a literal value
   */
  private getValueFromExpression(part: string, context: ExecutionContext): any {
    if (!part) return undefined;

    // Remove quotes from literal strings
    if ((part.startsWith('"') && part.endsWith('"')) || (part.startsWith("'") && part.endsWith("'"))) {
      return part.slice(1, -1);
    }

    // Check for boolean literals
    if (part.toLowerCase() === 'true') return true;
    if (part.toLowerCase() === 'false') return false;
    if (part.toLowerCase() === 'null') return null;

    // Check for numeric literals
    if (!isNaN(Number(part))) {
      return Number(part);
    }

    // Treat as a field path - try to get from $json first
    const jsonValue = this.getNestedValue(context.$json, part);
    if (jsonValue !== undefined) {
      return jsonValue;
    }

    // Try $workflow
    const workflowValue = this.getNestedValue(context.$workflow, part);
    if (workflowValue !== undefined) {
      return workflowValue;
    }

    // Try $node
    const nodeValue = this.getNestedValue(context.$node, part);
    if (nodeValue !== undefined) {
      return nodeValue;
    }

    // Return undefined if not found
    return undefined;
  }

  /**
   * Compare two values using the specified operator
   */
  private compareValues(left: any, right: any, operator: string): boolean {
    switch (operator) {
      case '===':
        return left === right;
      case '==':
      case 'equals':
        return left == right;
      case '!==':
        return left !== right;
      case '!=':
      case 'not equals':
        return left != right;
      case '>':
        return typeof left === 'number' && typeof right === 'number' && left > right;
      case '<':
        return typeof left === 'number' && typeof right === 'number' && left < right;
      case '>=':
        return typeof left === 'number' && typeof right === 'number' && left >= right;
      case '<=':
        return typeof left === 'number' && typeof right === 'number' && left <= right;
      case 'contains':
        return typeof left === 'string' && left.includes(String(right));
      case 'startsWith':
        return typeof left === 'string' && left.startsWith(String(right));
      case 'endsWith':
        return typeof left === 'string' && left.endsWith(String(right));
      case 'matches':
        try {
          const regex = new RegExp(String(right));
          return regex.test(String(left));
        } catch {
          return false;
        }
      default:
        return false;
    }
  }

  /**
   * Format error messages
   */
  private formatErrorMessage(error: any): string {
    if (error.message.includes('Expression or conditions')) {
      return error.message;
    }
    if (error.message.includes('Empty expression')) {
      return error.message;
    }
    return `Condition evaluation error: ${error.message}`;
  }
}
