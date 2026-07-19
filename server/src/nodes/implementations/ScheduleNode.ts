import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * Schedule Node - Trigger workflow on a schedule (Cron)
 * n8n-compatible: Execute workflow at specific times/intervals
 */
export class ScheduleNode extends BaseNode {
  private static scheduledWorkflows = new Map<string, {
    cronExpression: string;
    nextExecution: Date;
    interval?: NodeJS.Timeout;
  }>();

  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const cronExpression = this.config.cronExpression || '0 * * * *'; // Every hour
      const triggerTimes = this.config.triggerTimes || 1; // How many times to trigger

      // Calculate next execution
      const nextExecution = this.getNextExecution(cronExpression);

      // Store schedule info
      ScheduleNode.scheduledWorkflows.set(this.id, {
        cronExpression,
        nextExecution,
      });

      return {
        success: true,
        data: {
          ...context.$json,
          _schedule: {
            cronExpression,
            nextExecution: nextExecution.toISOString(),
            triggerTimes,
          },
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Schedule trigger failed',
      };
    }
  }

  getType(): string {
    return 'schedule';
  }

  getIcon(): string {
    return 'Clock';
  }

  private getNextExecution(cronExpression: string): Date {
    // Simple cron parser - in production would use node-cron or similar
    const now = new Date();
    const [minute, hour, day, month, dayOfWeek] = cronExpression.split(' ');

    // Parse and calculate next execution
    // For now, simple implementation
    const next = new Date(now);
    next.setHours(next.getHours() + 1);

    return next;
  }

  /**
   * Get all scheduled workflows
   */
  static getScheduledWorkflows(): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [nodeId, schedule] of ScheduleNode.scheduledWorkflows.entries()) {
      result[nodeId] = {
        cronExpression: schedule.cronExpression,
        nextExecution: schedule.nextExecution.toISOString(),
      };
    }

    return result;
  }

  /**
   * Check if a workflow should be triggered based on schedule
   */
  static shouldTrigger(nodeId: string): boolean {
    const schedule = ScheduleNode.scheduledWorkflows.get(nodeId);

    if (!schedule) {
      return false;
    }

    const now = new Date();
    return now >= schedule.nextExecution;
  }
}
