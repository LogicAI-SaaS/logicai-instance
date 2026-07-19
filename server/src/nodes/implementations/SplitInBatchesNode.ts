import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * Split In Batches Node - Split data into batches to avoid timeouts
 * n8n-compatible: Process large datasets in smaller chunks
 *
 * Configuration:
 * - batchSize: Number of items per batch (default: 10)
 * - reset: Reset batch state and start from beginning (default: false)
 * - options: { continue: false } - Continue from previous state
 */
export class SplitInBatchesNode extends BaseNode {
  private static batchStates = new Map<string, {
    remainingItems: any[];
    batchSize: number;
    batchNumber: number;
    totalItems: number;
  }>();

  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
    this.validateConfig();
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    const batchSize = this.config.batchSize || 10;
    if (typeof batchSize !== 'number' || batchSize < 1) {
      throw new Error('batchSize must be a positive number');
    }
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const batchSize = this.config.batchSize || 10;
      const reset = this.config.reset || false;
      const input = context.$json;
      const items = Array.isArray(input) ? input : [input];

      // Reset batch state if requested
      if (reset) {
        SplitInBatchesNode.batchStates.delete(this.id);
      }

      // Get or initialize batch state
      let state = SplitInBatchesNode.batchStates.get(this.id);

      if (!state) {
        state = {
          remainingItems: [...items], // Clone to avoid mutation
          batchSize,
          batchNumber: 0,
          totalItems: items.length,
        };
        SplitInBatchesNode.batchStates.set(this.id, state);
      }

      // Check if all batches processed
      if (state.remainingItems.length === 0) {
        return {
          success: true,
          data: {
            items: [],
            batchNumber: state.batchNumber,
            batchSize: 0,
            totalItems: state.totalItems,
            isLast: true,
            isComplete: true,
            _split: 'All batches processed',
          },
        };
      }

      // Get next batch
      const batch = state.remainingItems.splice(0, batchSize);
      state.batchNumber++;

      const isLastBatch = state.remainingItems.length === 0;
      const progress = ((state.totalItems - state.remainingItems.length) / state.totalItems) * 100;

      return {
        success: true,
        data: {
          items: batch,
          batchNumber: state.batchNumber,
          batchSize: batch.length,
          totalItems: state.totalItems,
          remainingItems: state.remainingItems.length,
          isLast: isLastBatch,
          progress: Math.round(progress),
          _split: `Batch ${state.batchNumber} of ${Math.ceil(state.totalItems / batchSize)}`,
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
   * Reset batch state for a node
   */
  static resetBatchState(nodeId: string): void {
    SplitInBatchesNode.batchStates.delete(nodeId);
  }

  /**
   * Get batch status for a node
   */
  static getBatchStatus(nodeId: string): any {
    const state = SplitInBatchesNode.batchStates.get(nodeId);

    if (!state) {
      return null;
    }

    return {
      batchNumber: state.batchNumber,
      remainingItems: state.remainingItems.length,
      totalItems: state.totalItems,
      progress: ((state.totalItems - state.remainingItems.length) / state.totalItems) * 100,
      totalBatches: Math.ceil(state.totalItems / state.batchSize),
    };
  }

  /**
   * Get all batch states
   */
  static getAllBatchStates(): Map<string, any> {
    const states = new Map();

    SplitInBatchesNode.batchStates.forEach((state, nodeId) => {
      states.set(nodeId, {
        batchNumber: state.batchNumber,
        remainingItems: state.remainingItems.length,
        totalItems: state.totalItems,
        progress: ((state.totalItems - state.remainingItems.length) / state.totalItems) * 100,
      });
    });

    return states;
  }

  /**
   * Format error messages
   */
  private formatErrorMessage(error: any): string {
    if (error.message.includes('batchSize')) {
      return error.message;
    }
    return `Split in batches error: ${error.message}`;
  }

  getType(): string {
    return 'splitInBatches';
  }

  getIcon(): string {
    return 'Grid';
  }
}
