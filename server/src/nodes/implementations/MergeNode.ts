import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * Merge Node - Combine multiple data flows into one
 * n8n-compatible: Merge data from different branches
 */
export class MergeNode extends BaseNode {
  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const mode = this.config.mode || 'merge'; // merge, append, wait, combine
      const mergeByField = this.config.mergeByField;
      const includeUnpaired = this.config.includeUnpaired !== false;

      // In real execution, this node would receive data from multiple inputs
      // For now, we'll demonstrate the merge logic with context data
      const input = context.$json;
      const inputs = Array.isArray(input) ? input : [input];

      switch (mode) {
        case 'merge':
          return await this.mergeData(inputs, mergeByField, includeUnpaired);

        case 'append':
          return this.appendData(inputs);

        case 'combine':
          return this.combineData(inputs);

        case 'multiplex':
          return this.multiplexData(inputs);

        case 'wait':
          return this.waitForData(inputs);

        default:
          return {
            success: true,
            data: inputs,
          };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Merge failed',
      };
    }
  }

  getType(): string {
    return 'merge';
  }

  getIcon(): string {
    return 'Merge';
  }

  private async mergeData(inputs: any[], mergeByField?: string, includeUnpaired = true): Promise<NodeExecutionResult> {
    if (!mergeByField) {
      // Simple merge - combine all fields
      const merged = inputs.reduce((acc, item) => ({ ...acc, ...item }), {});
      return {
        success: true,
        data: merged,
      };
    }

    // Merge by field - like SQL JOIN
    const groups: Record<string, any[]> = {};

    // Group items by merge field
    inputs.forEach(item => {
      const key = this.getNestedValue(item, mergeByField);
      if (key !== undefined && key !== null) {
        const keyStr = String(key);
        if (!groups[keyStr]) {
          groups[keyStr] = [];
        }
        groups[keyStr].push(item);
      }
    });

    // Merge grouped items
    const merged: any[] = [];
    for (const [key, items] of Object.entries(groups)) {
      if (items.length > 1) {
        // Merge items with same key
        const mergedItem = items.reduce((acc, item) => ({ ...acc, ...item }), {});
        merged.push(mergedItem);
      } else if (includeUnpaired) {
        merged.push(items[0]);
      }
    }

    return {
      success: true,
      data: merged,
    };
  }

  private appendData(inputs: any[]): NodeExecutionResult {
    // Simply append all items
    const flattened = inputs.flat();
    return {
      success: true,
      data: flattened,
    };
  }

  private combineData(inputs: any[]): NodeExecutionResult {
    // Combine all data into arrays
    const combined: any = {};

    inputs.forEach(item => {
      Object.keys(item).forEach(key => {
        if (!combined[key]) {
          combined[key] = [];
        }
        combined[key].push(item[key]);
      });
    });

    return {
      success: true,
      data: combined,
    };
  }

  private multiplexData(inputs: any[]): NodeExecutionResult {
    // Create combinations of all inputs
    const result: any[] = [];

    if (inputs.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    // Start with first input's items
    const items1 = Array.isArray(inputs[0]) ? inputs[0] : [inputs[0]];
    items1.forEach(item1 => {
      result.push({ input1: item1 });
    });

    // Combine with other inputs
    for (let i = 1; i < inputs.length; i++) {
      const items = Array.isArray(inputs[i]) ? inputs[i] : [inputs[i]];
      const newResult: any[] = [];

      result.forEach(existing => {
        items.forEach((item: any) => {
          newResult.push({
            ...existing,
            [`input${i + 1}`]: item,
          });
        });
      });

      result.length = 0;
      result.push(...newResult);
    }

    return {
      success: true,
      data: result,
    };
  }

  private waitForData(inputs: any[]): NodeExecutionResult {
    // In real implementation, would wait for data from multiple inputs
    // For now, just return the inputs
    return {
      success: true,
      data: {
        inputs,
        mode: 'wait',
      },
    };
  }
}
