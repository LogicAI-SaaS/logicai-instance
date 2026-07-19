import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * Live Canvas Debugger - Visual debugging on the canvas
 * Shows logs and performance metrics directly on the node
 */
export class LiveCanvasDebuggerNode extends BaseNode {
  // Store debug data for each node instance
  private static debugData = new Map<string, {
    logs: Array<{ timestamp: Date; level: string; message: string; data?: any }>;
    metrics: {
      executionCount: number;
      totalExecutionTime: number;
      avgExecutionTime: number;
      lastExecution: Date;
      errorCount: number;
      successRate: number;
    };
    performanceHistory: Array<{ timestamp: Date; duration: number }>;
  }>();

  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);

    // Initialize debug data for this node
    if (!LiveCanvasDebuggerNode.debugData.has(id)) {
      LiveCanvasDebuggerNode.debugData.set(id, {
        logs: [],
        metrics: {
          executionCount: 0,
          totalExecutionTime: 0,
          avgExecutionTime: 0,
          lastExecution: new Date(),
          errorCount: 0,
          successRate: 100,
        },
        performanceHistory: [],
      });
    }
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    const startTime = Date.now();
    const nodeData = LiveCanvasDebuggerNode.debugData.get(this.id)!;

    try {
      // Log the input data
      this.addLog(this.id, 'info', 'Node execution started', {
        input: context.$json,
      });

      // Execute any configured operations
      const result = await this.executeOperations(context);

      // Calculate execution time
      const executionTime = Date.now() - startTime;

      // Update metrics
      nodeData.metrics.executionCount++;
      nodeData.metrics.totalExecutionTime += executionTime;
      nodeData.metrics.avgExecutionTime =
        nodeData.metrics.totalExecutionTime / nodeData.metrics.executionCount;
      nodeData.metrics.lastExecution = new Date();
      nodeData.metrics.successRate =
        ((nodeData.metrics.executionCount - nodeData.metrics.errorCount) /
          nodeData.metrics.executionCount) * 100;

      // Store performance history
      nodeData.performanceHistory.push({
        timestamp: new Date(),
        duration: executionTime,
      });

      // Keep only last 100 performance records
      if (nodeData.performanceHistory.length > 100) {
        nodeData.performanceHistory.shift();
      }

      this.addLog(this.id, 'info', 'Node executed successfully', {
        executionTime,
        output: result.data,
      });

      return {
        success: true,
        data: {
          ...result.data,
          _debug: {
            executionTime,
            logged: true,
          },
        },
      };
    } catch (error: any) {
      const executionTime = Date.now() - startTime;

      // Update error metrics
      nodeData.metrics.executionCount++;
      nodeData.metrics.errorCount++;
      nodeData.metrics.totalExecutionTime += executionTime;
      nodeData.metrics.lastExecution = new Date();
      nodeData.metrics.successRate =
        ((nodeData.metrics.executionCount - nodeData.metrics.errorCount) /
          nodeData.metrics.executionCount) * 100;

      this.addLog(this.id, 'error', 'Node execution failed', {
        error: error.message,
        stack: error.stack,
        executionTime,
      });

      return {
        success: false,
        error: error.message,
      };
    }
  }

  getType(): string {
    return 'liveCanvasDebugger';
  }

  getIcon(): string {
    return 'Bug';
  }

  private async executeOperations(context: ExecutionContext): Promise<NodeExecutionResult> {
    // Execute any configured debugging operations
    const operations = this.config.operations || [];

    for (const op of operations) {
      switch (op.type) {
        case 'log':
          this.addLog(this.id, op.level || 'info', op.message, op.data);
          break;

        case 'measure':
          this.measurePerformance(this.id, op.label);
          break;

        case 'inspect':
          this.inspectData(this.id, op.path, context);
          break;

        case 'breakpoint':
          if (op.condition) {
            const shouldPause = this.evaluateCondition(op.condition, context);
            if (shouldPause) {
              this.addLog(this.id, 'warn', 'Breakpoint hit', { condition: op.condition });
            }
          }
          break;

        case 'trace':
          this.addLog(this.id, 'debug', 'Trace', {
            $json: context.$json,
            $workflow: context.$workflow,
            $node: context.$node,
          });
          break;
      }
    }

    return {
      success: true,
      data: context.$json,
    };
  }

  private addLog(nodeId: string, level: string, message: string, data?: any): void {
    const nodeData = LiveCanvasDebuggerNode.debugData.get(nodeId);
    if (!nodeData) return;

    nodeData.logs.push({
      timestamp: new Date(),
      level,
      message,
      data,
    });

    // Keep only last 1000 logs
    if (nodeData.logs.length > 1000) {
      nodeData.logs.shift();
    }
  }

  private measurePerformance(nodeId: string, label: string): void {
    const nodeData = LiveCanvasDebuggerNode.debugData.get(nodeId);
    if (!nodeData) return;

    const lastMetric = nodeData.performanceHistory[nodeData.performanceHistory.length - 1];

    this.addLog(nodeId, 'info', `Performance: ${label}`, {
      duration: lastMetric?.duration || 0,
      timestamp: lastMetric?.timestamp || new Date(),
    });
  }

  private inspectData(nodeId: string, path: string, context: ExecutionContext): void {
    const value = this.getNestedValue(context.$json, path);

    this.addLog(nodeId, 'debug', `Inspect: ${path}`, {
      value,
      type: typeof value,
    });
  }

  private evaluateCondition(condition: string, context: ExecutionContext): boolean {
    // Simple condition evaluation
    // In production, would use a safer evaluation method
    try {
      const value = this.getNestedValue(context.$json, condition);
      return Boolean(value);
    } catch {
      return false;
    }
  }

  /**
   * Get debug data for a node (for frontend display)
   */
  static getDebugData(nodeId: string): any {
    const data = LiveCanvasDebuggerNode.debugData.get(nodeId);
    if (!data) {
      return {
        logs: [],
        metrics: {
          executionCount: 0,
          avgExecutionTime: 0,
          errorCount: 0,
          successRate: 100,
        },
        performanceHistory: [],
      };
    }

    return {
      logs: data.logs.slice(-100), // Last 100 logs
      metrics: data.metrics,
      performanceHistory: data.performanceHistory.slice(-50), // Last 50 metrics
    };
  }

  /**
   * Clear debug data for a node
   */
  static clearDebugData(nodeId: string): void {
    LiveCanvasDebuggerNode.debugData.delete(nodeId);
  }

  /**
   * Clear all debug data
   */
  static clearAllDebugData(): void {
    LiveCanvasDebuggerNode.debugData.clear();
  }

  /**
   * Get summary stats for the debugger
   */
  static getSummaryStats(): any {
    let totalExecutions = 0;
    let totalErrors = 0;
    let avgExecutionTime = 0;

    for (const [, data] of LiveCanvasDebuggerNode.debugData) {
      totalExecutions += data.metrics.executionCount;
      totalErrors += data.metrics.errorCount;
      avgExecutionTime += data.metrics.totalExecutionTime;
    }

    const nodeCount = LiveCanvasDebuggerNode.debugData.size;
    avgExecutionTime = nodeCount > 0 ? avgExecutionTime / totalExecutions : 0;

    return {
      nodeCount,
      totalExecutions,
      totalErrors,
      successRate: totalExecutions > 0 ? ((totalExecutions - totalErrors) / totalExecutions) * 100 : 100,
      avgExecutionTime: Math.round(avgExecutionTime * 100) / 100,
    };
  }
}
