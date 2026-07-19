import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';
import databaseService from '../../services/databaseService';

const prisma = databaseService.getPrisma();

/**
 * Error Trigger Node - Triggered when another workflow fails
 * n8n-compatible: Catch and handle errors from other workflows
 *
 * Configuration:
 * - workflowId: Optional - only trigger for specific workflow
 * - timeRange: Time range to check (e.g., '5m', '1h', '24h') - default: '1h'
 * - errorOutput: Field name for error output (default: 'error')
 * - errorTypes: Filter by error types ('timeout', 'api', 'validation', 'runtime')
 * - maxErrors: Maximum number of errors to return (default: 10)
 */
export class ErrorTriggerNode extends BaseNode {
  private lastTriggerState: Set<string> = new Set();

  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
    this.validateConfig();
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    const timeRange = this.config.timeRange || '1h';
    if (!this.isValidTimeRange(timeRange)) {
      throw new Error(`Invalid timeRange: ${timeRange}. Format: {number}{m|h|d} (e.g., 5m, 1h, 24d)`);
    }

    const maxErrors = this.config.maxErrors || 10;
    if (typeof maxErrors !== 'number' || maxErrors < 1 || maxErrors > 1000) {
      throw new Error(`maxErrors must be between 1 and 1000, got: ${maxErrors}`);
    }

    if (this.config.errorTypes && Array.isArray(this.config.errorTypes)) {
      const validTypes = ['timeout', 'api', 'validation', 'runtime', 'network', 'database'];
      const invalidTypes = this.config.errorTypes.filter((t: string) => !validTypes.includes(t));
      if (invalidTypes.length > 0) {
        throw new Error(`Invalid errorTypes: ${invalidTypes.join(', ')}. Valid: ${validTypes.join(', ')}`);
      }
    }
  }

  /**
   * Validate time range format
   */
  private isValidTimeRange(timeRange: string): boolean {
    return /^\d+[mhd]$/.test(timeRange);
  }

  /**
   * Parse time range to minutes
   */
  private parseTimeRange(timeRange: string): number {
    const match = timeRange.match(/^(\d+)([mhd])$/);
    if (!match) return 60; // default 1 hour

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 'm': return value;
      case 'h': return value * 60;
      case 'd': return value * 60 * 24;
      default: return 60;
    }
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const errorOutput = this.config.errorOutput || 'error';
      const workflowId = this.config.workflowId;
      const timeRange = this.config.timeRange || '1h';
      const maxErrors = Math.min(this.config.maxErrors || 10, 1000);
      const errorTypes = this.config.errorTypes;

      // Calculate time threshold
      const timeRangeMinutes = this.parseTimeRange(timeRange);
      const timeThreshold = new Date(Date.now() - timeRangeMinutes * 60 * 1000);

      // Build where clause
      const whereClause: any = {
        status: { in: ['error', 'failed'] },
        startedAt: { gte: timeThreshold },
      };

      if (workflowId) {
        whereClause.workflowId = workflowId;
      }

      // Get error executions
      const errorExecutions = await prisma.nodeExecution.findMany({
        where: whereClause,
        orderBy: {
          startedAt: 'desc',
        },
        take: maxErrors,
      });

      // Filter out already triggered errors
      const newErrors = errorExecutions.filter(e => !this.lastTriggerState.has(e.id));

      // Mark errors as triggered
      newErrors.forEach(e => this.lastTriggerState.add(e.id));

      // Clean up old state
      if (this.lastTriggerState.size > 1000) {
        const stateArray = Array.from(this.lastTriggerState);
        this.lastTriggerState.clear();
        stateArray.slice(-500).forEach(id => this.lastTriggerState.add(id));
      }

      if (newErrors.length === 0) {
        return {
          success: true,
          data: {
            ...context.$json,
            _errorTrigger: {
              type: 'error',
              hasErrors: false,
              timeRange,
              timeThreshold,
              errors: [],
            },
          },
        };
      }

      // Format error data
      const errors = newErrors.map(exec => {
        const errorType = this.classifyError(exec);
        const parsedError = this.parseErrorMessage(exec);

        return {
          executionId: exec.id,
          workflowId: exec.workflowId,
          nodeId: exec.nodeId,
          nodeName: exec.nodeName,
          errorType,
          error: exec.error,
          errorMessage: parsedError.message,
          errorDetails: parsedError.details,
          input: exec.inputData ? this.safeParseJson(exec.inputData) : exec.input,
          output: exec.outputData ? this.safeParseJson(exec.outputData) : null,
          startedAt: exec.startedAt,
          completedAt: exec.completedAt,
          executionTime: exec.executionTime,
        };
      });

      // Filter by error types if specified
      const filteredErrors = errorTypes && errorTypes.length > 0
        ? errors.filter(e => errorTypes.includes(e.errorType))
        : errors;

      return {
        success: true,
        data: {
          ...context.$json,
          _errorTrigger: {
            type: 'error',
            hasErrors: true,
            timeRange,
            timeThreshold,
            workflowId,
            totalErrors: newErrors.length,
            filteredErrors: filteredErrors.length,
            errors: filteredErrors,
          },
          [errorOutput]: filteredErrors,
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
   * Classify error type
   */
  private classifyError(exec: any): string {
    const error = exec.error || '';

    if (typeof error === 'string') {
      const lowerError = error.toLowerCase();

      if (lowerError.includes('timeout') || lowerError.includes('timed out')) {
        return 'timeout';
      }
      if (lowerError.includes('network') || lowerError.includes('enotfound') ||
          lowerError.includes('econnrefused') || lowerError.includes('etimedout')) {
        return 'network';
      }
      if (lowerError.includes('api') || lowerError.includes('http') ||
          lowerError.includes('429') || lowerError.includes('500')) {
        return 'api';
      }
      if (lowerError.includes('validation') || lowerError.includes('invalid') ||
          lowerError.includes('required')) {
        return 'validation';
      }
      if (lowerError.includes('database') || lowerError.includes('prisma') ||
          lowerError.includes('sql')) {
        return 'database';
      }
    }

    return 'runtime';
  }

  /**
   * Parse error message
   */
  private parseErrorMessage(exec: any): { message: string; details: any } {
    const error = exec.error;

    if (typeof error === 'string') {
      return {
        message: error,
        details: null,
      };
    }

    if (typeof error === 'object') {
      return {
        message: error.message || 'Unknown error',
        details: {
          code: error.code,
          stack: error.stack,
          ...error,
        },
      };
    }

    return {
      message: 'Unknown error',
      details: null,
    };
  }

  /**
   * Safely parse JSON
   */
  private safeParseJson(json: string): any {
    try {
      return JSON.parse(json);
    } catch {
      return json;
    }
  }

  /**
   * Format error messages
   */
  private formatErrorMessage(error: any): string {
    if (error.message?.includes('Invalid timeRange')) {
      return error.message;
    }
    if (error.message?.includes('maxErrors')) {
      return error.message;
    }
    if (error.message?.includes('Invalid errorTypes')) {
      return error.message;
    }
    return `Error trigger failed: ${error.message || 'Unknown error'}`;
  }

  getType(): string {
    return 'errorTrigger';
  }

  getIcon(): string {
    return 'AlertCircle';
  }

  /**
   * Clear triggered state (utility method)
   */
  clearTriggeredState(): void {
    this.lastTriggerState.clear();
  }

  /**
   * Get recent errors from workflow executions (static utility)
   */
  static async getRecentErrors(
    limit = 50,
    workflowId?: string,
    errorType?: string
  ): Promise<any[]> {
    const whereClause: any = {
      status: { in: ['error', 'failed'] },
    };

    if (workflowId) {
      whereClause.workflowId = workflowId;
    }

    const errorExecutions = await prisma.nodeExecution.findMany({
      where: whereClause,
      orderBy: {
        startedAt: 'desc',
      },
      take: limit,
      include: {
        workflow: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return errorExecutions;
  }

  /**
   * Get error statistics (static utility)
   */
  static async getErrorStats(workflowId?: string): Promise<{
    totalExecutions: number;
    errorExecutions: number;
    errorRate: number;
    errorsByWorkflow: any[];
    errorsByType: Record<string, number>;
    recentErrors: any[];
  }> {
    const whereClause = workflowId ? { workflowId } : {};

    const [totalExecutions, errorExecutions, errorsByWorkflow, recentErrors] = await Promise.all([
      prisma.nodeExecution.count({ where: whereClause }),
      prisma.nodeExecution.count({
        where: { ...whereClause, status: { in: ['error', 'failed'] } },
      }),
      prisma.nodeExecution.groupBy({
        by: ['workflowId'],
        where: { ...whereClause, status: { in: ['error', 'failed'] } },
        _count: { workflowId: true },
      }),
      prisma.nodeExecution.findMany({
        where: { ...whereClause, status: { in: ['error', 'failed'] } },
        orderBy: { startedAt: 'desc' },
        take: 10,
      }),
    ]);

    // Classify errors by type
    const errorsByType: Record<string, number> = {};
    recentErrors.forEach((exec: any) => {
      const error = exec.error || '';
      let errorType = 'runtime';

      if (typeof error === 'string') {
        const lowerError = error.toLowerCase();
        if (lowerError.includes('timeout') || lowerError.includes('timed out')) {
          errorType = 'timeout';
        } else if (lowerError.includes('network') || lowerError.includes('enotfound')) {
          errorType = 'network';
        } else if (lowerError.includes('api') || lowerError.includes('http')) {
          errorType = 'api';
        } else if (lowerError.includes('validation') || lowerError.includes('invalid')) {
          errorType = 'validation';
        } else if (lowerError.includes('database') || lowerError.includes('prisma')) {
          errorType = 'database';
        }
      }

      errorsByType[errorType] = (errorsByType[errorType] || 0) + 1;
    });

    return {
      totalExecutions,
      errorExecutions,
      errorRate: totalExecutions > 0 ? (errorExecutions / totalExecutions) * 100 : 0,
      errorsByWorkflow,
      errorsByType,
      recentErrors,
    };
  }

  /**
   * Get errors by time range (static utility)
   */
  static async getErrorsByTimeRange(
    timeRange: string,
    workflowId?: string
  ): Promise<any[]> {
    const timeRangeMinutes = parseInt(timeRange) || 60;
    const unit = timeRange.replace(/\d+/, '') || 'm';
    let minutes = timeRangeMinutes;

    if (unit === 'h') minutes *= 60;
    if (unit === 'd') minutes *= 60 * 24;

    const timeThreshold = new Date(Date.now() - minutes * 60 * 1000);

    const whereClause: any = {
      status: { in: ['error', 'failed'] },
      startedAt: { gte: timeThreshold },
    };

    if (workflowId) {
      whereClause.workflowId = workflowId;
    }

    return await prisma.nodeExecution.findMany({
      where: whereClause,
      orderBy: { startedAt: 'desc' },
      take: 100,
    });
  }
}
