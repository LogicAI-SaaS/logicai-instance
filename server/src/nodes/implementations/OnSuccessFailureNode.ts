import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';
import databaseService from '../../services/databaseService';

const prisma = databaseService.getPrisma();

// In-memory store for tracking triggered executions to avoid duplicates
const triggeredExecutions = new Map<string, Set<string>>();

/**
 * OnSuccess/Failure Node - Trigger on workflow completion status
 * n8n-compatible: Execute when another workflow succeeds or fails
 *
 * Configuration:
 * - triggerType: 'success', 'error', or 'both' - which status to trigger on
 * - workflowId: Optional - only trigger for specific workflow
 * - timeRange: Time range to check (e.g., '5m', '1h', '24h') - default: '1h'
 * - waitForCompletion: Wait until workflow is fully complete (default: true)
 * - outputData: Include execution output data (default: false)
 * - maxResults: Maximum number of executions to return (default: 10)
 */
export class OnSuccessFailureNode extends BaseNode {
  private lastTriggerState: Map<string, string> = new Map();

  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
    this.validateConfig();
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    const triggerType = this.config.triggerType || 'success';
    if (!['success', 'error', 'both'].includes(triggerType)) {
      throw new Error(`Invalid triggerType: ${triggerType}. Valid types: success, error, both`);
    }

    const timeRange = this.config.timeRange || '1h';
    if (!this.isValidTimeRange(timeRange)) {
      throw new Error(`Invalid timeRange: ${timeRange}. Format: {number}{m|h|d} (e.g., 5m, 1h, 24d)`);
    }

    const maxResults = this.config.maxResults || 10;
    if (typeof maxResults !== 'number' || maxResults < 1 || maxResults > 1000) {
      throw new Error(`maxResults must be between 1 and 1000, got: ${maxResults}`);
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
      const triggerType = this.config.triggerType || 'success';
      const workflowId = this.config.workflowId;
      const timeRange = this.config.timeRange || '1h';
      const waitForCompletion = this.config.waitForCompletion !== false;
      const outputData = this.config.outputData === true;
      const maxResults = Math.min(this.config.maxResults || 10, 1000);

      // Calculate time threshold
      const timeRangeMinutes = this.parseTimeRange(timeRange);
      const timeThreshold = new Date(Date.now() - timeRangeMinutes * 60 * 1000);

      // Build status filter
      const statusFilter: string[] = [];
      if (triggerType === 'success' || triggerType === 'both') {
        statusFilter.push('success');
      }
      if (triggerType === 'error' || triggerType === 'both') {
        statusFilter.push('error', 'failed');
      }

      // Get executions with filters
      const whereClause: any = {
        status: { in: statusFilter },
        completedAt: { gte: timeThreshold },
      };

      if (workflowId) {
        whereClause.workflowId = workflowId;
      }

      const executions = await prisma.nodeExecution.findMany({
        where: whereClause,
        orderBy: {
          completedAt: 'desc',
        },
        take: maxResults,
      });

      // Filter out already triggered executions
      const newExecutions = this.filterNewExecutions(executions, this.id, triggerType);

      // Mark executions as triggered
      this.markExecutionsAsTriggered(newExecutions, this.id, triggerType);

      // Format execution data
      const formattedExecutions = newExecutions.map(e => {
        const executionData: any = {
          id: e.id,
          workflowId: e.workflowId,
          nodeId: e.nodeId,
          status: e.status,
          startedAt: e.startedAt,
          completedAt: e.completedAt,
          executionTime: e.executionTime,
        };

        // Optionally include input/output data
        if (outputData) {
          try {
            executionData.input = e.inputData ? JSON.parse(e.inputData) : null;
            executionData.output = e.outputData ? JSON.parse(e.outputData) : null;
          } catch {
            // Skip if parsing fails
          }
        }

        return executionData;
      });

      return {
        success: true,
        data: {
          ...context.$json,
          _trigger: {
            type: triggerType,
            workflowId,
            timeRange,
            timeThreshold,
            waitForCompletion,
            count: formattedExecutions.length,
            executions: formattedExecutions,
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
   * Filter out executions that have already been triggered
   */
  private filterNewExecutions(executions: any[], triggerId: string, triggerType: string): any[] {
    const stateKey = `${triggerId}-${triggerType}`;
    const triggeredIds = triggeredExecutions.get(stateKey) || new Set();
    const lastTriggerId = this.lastTriggerState.get(stateKey);

    return executions.filter(e => {
      // Skip if this execution was already triggered
      if (triggeredIds.has(e.id)) return false;

      // Skip if this is the last triggered execution (to avoid re-triggering)
      if (lastTriggerId === e.id) return false;

      return true;
    });
  }

  /**
   * Mark executions as triggered to avoid duplicates
   */
  private markExecutionsAsTriggered(executions: any[], triggerId: string, triggerType: string): void {
    if (executions.length === 0) return;

    const stateKey = `${triggerId}-${triggerType}`;
    let triggeredIds = triggeredExecutions.get(stateKey);

    if (!triggeredIds) {
      triggeredIds = new Set();
      triggeredExecutions.set(stateKey, triggeredIds);
    }

    // Mark all executions as triggered
    executions.forEach(e => triggeredIds.add(e.id));

    // Update last triggered state
    this.lastTriggerState.set(stateKey, executions[0].id);

    // Clean up old entries to prevent memory leak
    if (triggeredIds.size > 1000) {
      const entriesArray = Array.from(triggeredIds);
      triggeredIds.clear();
      entriesArray.slice(-500).forEach(id => triggeredIds.add(id));
    }
  }

  /**
   * Format error messages
   */
  private formatErrorMessage(error: any): string {
    if (error.message?.includes('Invalid triggerType')) {
      return error.message;
    }
    if (error.message?.includes('Invalid timeRange')) {
      return error.message;
    }
    if (error.message?.includes('maxResults')) {
      return error.message;
    }
    if (error.code === 'P2025') {
      return 'Database error: Failed to query executions. Check database connection.';
    }
    return `OnSuccess/Failure trigger error: ${error.message || 'Unknown error'}`;
  }

  /**
   * Clear triggered state for a specific trigger (utility method)
   */
  clearTriggeredState(triggerType?: string): void {
    if (triggerType) {
      const stateKey = `${this.id}-${triggerType}`;
      triggeredExecutions.delete(stateKey);
      this.lastTriggerState.delete(stateKey);
    } else {
      // Clear all states for this node
      ['success', 'error', 'both'].forEach(type => {
        const stateKey = `${this.id}-${type}`;
        triggeredExecutions.delete(stateKey);
        this.lastTriggerState.delete(stateKey);
      });
    }
  }

  getType(): string {
    return 'onSuccessFailure';
  }

  getIcon(): string {
    return 'Activity';
  }

  /**
   * Get executions by status (static utility method)
   */
  static async getExecutionsByStatus(
    status: 'success' | 'error',
    limit = 50,
    workflowId?: string
  ): Promise<any[]> {
    const whereClause: any = {
      status: status === 'success' ? 'success' : ['error', 'failed'],
    };

    if (workflowId) {
      whereClause.workflowId = workflowId;
    }

    const executions = await prisma.nodeExecution.findMany({
      where: whereClause,
      orderBy: {
        completedAt: 'desc',
      },
      take: limit,
    });

    return executions;
  }

  /**
   * Get execution statistics (static utility method)
   */
  static async getExecutionStats(workflowId?: string): Promise<{
    total: number;
    success: number;
    error: number;
    avgExecutionTime: number;
  }> {
    const whereClause = workflowId ? { workflowId } : {};

    const [total, success, error, avgTimeResult] = await Promise.all([
      prisma.nodeExecution.count({ where: whereClause }),
      prisma.nodeExecution.count({ where: { ...whereClause, status: 'success' } }),
      prisma.nodeExecution.count({ where: { ...whereClause, status: { in: ['error', 'failed'] } } }),
      prisma.nodeExecution.aggregate({
        where: whereClause,
        _avg: { executionTime: true },
      }),
    ]);

    return {
      total,
      success,
      error,
      avgExecutionTime: avgTimeResult._avg.executionTime || 0,
    };
  }

  /**
   * Clear all triggered state (static utility method for cleanup)
   */
  static clearAllTriggeredStates(): void {
    triggeredExecutions.clear();
  }
}
