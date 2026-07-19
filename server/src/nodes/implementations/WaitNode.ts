import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * Wait Node - Pause workflow execution for a specified time
 * n8n-compatible: Delay execution by milliseconds or until a specific time
 */
export class WaitNode extends BaseNode {
  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const waitType = this.config.type || 'duration'; // duration, date
      const startTime = Date.now();

      if (waitType === 'duration') {
        const amount = this.config.amount || 1000;
        const unit = this.config.unit || 'milliseconds';

        const waitTime = this.convertToMilliseconds(amount, unit);

        console.log(`Waiting ${amount} ${unit}...`);
        await this.sleep(waitTime);

        return {
          success: true,
          data: {
            ...context.$json,
            _wait: {
              type: 'duration',
              amount,
              unit,
              waited: waitTime,
              startTime,
              endTime: Date.now(),
            },
          },
        };
      } else if (waitType === 'date') {
        const targetDate = new Date(this.config.date);
        const now = new Date();
        const waitTime = targetDate.getTime() - now.getTime();

        if (waitTime > 0) {
          console.log(`Waiting until ${targetDate.toISOString()}...`);
          await this.sleep(waitTime);
        } else if (waitTime < 0) {
          console.log(`Target date ${targetDate.toISOString()} is in the past, skipping wait`);
        }

        return {
          success: true,
          data: {
            ...context.$json,
            _wait: {
              type: 'date',
              targetDate: targetDate.toISOString(),
              waited: Math.max(0, waitTime),
              startTime,
              endTime: Date.now(),
            },
          },
        };
      }

      return {
        success: true,
        data: context.$json,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Wait failed',
      };
    }
  }

  getType(): string {
    return 'wait';
  }

  getIcon(): string {
    return 'Clock';
  }

  private convertToMilliseconds(amount: number, unit: string): number {
    const units: Record<string, number> = {
      milliseconds: 1,
      seconds: 1000,
      minutes: 60000,
      hours: 3600000,
      days: 86400000,
    };

    return amount * (units[unit] || 1);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
