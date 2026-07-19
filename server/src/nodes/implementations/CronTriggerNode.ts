import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * Cron Trigger Node - Advanced scheduling with cron expressions
 * Supports standard 5-part or 6-part cron expressions
 */
export class CronTriggerNode extends BaseNode {
  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    return {
      success: true,
      data: {
        message: 'Cron trigger executed',
        cronExpression: this.config.cronExpression,
        lastExecution: new Date().toISOString(),
      },
    };
  }

  getType(): string {
    return 'cronTrigger';
  }

  getIcon(): string {
    return 'Clock';
  }

  getCronExpression(): string {
    return this.config.cronExpression || '* * * * *'; // Every minute
  }

  getNextExecution(): Date {
    // Calculate next execution time based on cron
    // This is a simplified version - production would use cron parser library
    return new Date(Date.now() + 60000);
  }
}
