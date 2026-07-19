import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * Limit Node - Restrict the number of items passed to next node
 * n8n-compatible: Limit results to first N items or last N items
 *
 * Configuration:
 * - maxItems: Maximum number of items to keep (default: 1)
 * - mode: 'first', 'last', 'random', 'sample'
 * - offset: Number of items to skip before limiting
 */
export class LimitNode extends BaseNode {
  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      // Validate configuration
      const maxItems = this.config.maxItems || 1;
      if (typeof maxItems !== 'number' || maxItems < 0) {
        throw new Error('maxItems must be a positive number');
      }

      const mode = this.config.mode || 'first';
      if (!['first', 'last', 'random', 'sample'].includes(mode)) {
        throw new Error(`Invalid mode: ${mode}. Valid modes: first, last, random, sample`);
      }

      const input = context.$json;
      const items = Array.isArray(input) ? input : [input];

      let limitedItems: any[];

      switch (mode) {
        case 'first':
          limitedItems = this.limitFirst(items, maxItems, this.config.offset || 0);
          break;

        case 'last':
          limitedItems = this.limitLast(items, maxItems);
          break;

        case 'random':
          limitedItems = this.limitRandom(items, maxItems);
          break;

        case 'sample':
          limitedItems = this.limitSample(items, maxItems);
          break;

        default:
          limitedItems = items.slice(0, maxItems);
      }

      // Return same format as input
      const result = Array.isArray(input) ? limitedItems : limitedItems[0];

      return {
        success: true,
        data: result,
        _limit: {
          originalCount: items.length,
          limitedCount: Array.isArray(result) ? result.length : 1,
          maxItems,
          mode,
          offset: this.config.offset || 0,
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
   * Limit from beginning with optional offset
   */
  private limitFirst(items: any[], maxItems: number, offset: number): any[] {
    const start = Math.min(offset, items.length);
    const end = Math.min(start + maxItems, items.length);
    return items.slice(start, end);
  }

  /**
   * Limit from end
   */
  private limitLast(items: any[], maxItems: number): any[] {
    return items.slice(-maxItems);
  }

  /**
   * Random selection
   */
  private limitRandom(items: any[], maxItems: number): any[] {
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, maxItems);
  }

  /**
   * Sample evenly distributed items
   */
  private limitSample(items: any[], maxItems: number): any[] {
    if (items.length <= maxItems) {
      return items;
    }

    const sampled: any[] = [];
    const step = items.length / maxItems;
    let index = 0;

    while (sampled.length < maxItems && index < items.length) {
      sampled.push(items[Math.floor(index)]);
      index += step;
    }

    return sampled;
  }

  /**
   * Format error messages
   */
  private formatErrorMessage(error: any): string {
    if (error.message.includes('maxItems')) {
      return error.message;
    }
    if (error.message.includes('Invalid mode')) {
      return error.message;
    }
    return `Limit error: ${error.message}`;
  }

  getType(): string {
    return 'limit';
  }

  getIcon(): string {
    return 'Hash';
  }
}
