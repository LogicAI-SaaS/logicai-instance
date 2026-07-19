import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * Click Trigger Node - Manual UI Trigger
 *
 * This node triggers the workflow ONLY when a user manually clicks a button in the UI.
 * It's designed for manual workflow execution, not for URL-based triggers.
 *
 * Use Cases:
 * - Manual workflow testing
 * - On-demand data processing
 * - User-initiated workflows
 * - Debugging workflows
 *
 * Configuration:
 * - buttonText: Text to display on the trigger button (default: "Execute")
 * - requireConfirmation: Show confirmation dialog before executing (default: false)
 * - confirmationMessage: Custom confirmation message
 * - data: Additional data to pass with the trigger
 */
export class ClickTriggerNode extends BaseNode {
  private static isExecuting = new Set<string>();
  private lastExecutionTime?: Date;

  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      // Mark as executing
      ClickTriggerNode.isExecuting.add(this.id);
      this.lastExecutionTime = new Date();

      const buttonText = this.config.buttonText || 'Execute';
      const requireConfirmation = this.config.requireConfirmation === true;
      const confirmationMessage = this.config.confirmationMessage || 'Execute this workflow?';
      const additionalData = this.config.data || {};

      // Build trigger data
      const triggerData = {
        ...context.$json,
        ...additionalData,
        _trigger: {
          type: 'manualClick',
          mode: 'ui',
          buttonText,
          requireConfirmation,
          timestamp: new Date().toISOString(),
          triggeredBy: context.$workflow?.id || 'unknown',
          executionId: this.generateExecutionId(),
        },
      };

      return {
        success: true,
        data: triggerData,
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Manual trigger error: ${error.message || 'Unknown error'}`,
      };
    } finally {
      // Remove from executing set
      ClickTriggerNode.isExecuting.delete(this.id);
    }
  }

  /**
   * Generate a unique execution ID
   */
  private generateExecutionId(): string {
    return `${this.id}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Check if this trigger is currently executing
   */
  isExecuting(): boolean {
    return ClickTriggerNode.isExecuting.has(this.id);
  }

  /**
   * Get the last execution time
   */
  getLastExecutionTime(): Date | undefined {
    return this.lastExecutionTime;
  }

  /**
   * Get button configuration for UI
   */
  getButtonConfig(): {
    text: string;
    requireConfirmation: boolean;
    confirmationMessage: string;
    icon: string;
    style: string;
  } {
    return {
      text: this.config.buttonText || 'Execute',
      requireConfirmation: this.config.requireConfirmation === true,
      confirmationMessage: this.config.confirmationMessage || 'Execute this workflow?',
      icon: 'Play',
      style: this.config.buttonStyle || 'primary',
    };
  }

  /**
   * Validate trigger execution
   * Can be called before execution to check if trigger should proceed
   */
  validateExecution(): { valid: boolean; reason?: string } {
    // Check if already executing (prevent double-click)
    if (this.isExecuting()) {
      return {
        valid: false,
        reason: 'Workflow is already executing',
      };
    }

    // Check rate limiting (optional - if configured)
    if (this.config.minInterval) {
      if (this.lastExecutionTime) {
        const elapsed = Date.now() - this.lastExecutionTime.getTime();
        const minIntervalMs = this.parseInterval(this.config.minInterval);
        if (elapsed < minIntervalMs) {
          return {
            valid: false,
            reason: `Please wait ${Math.ceil((minIntervalMs - elapsed) / 1000)} seconds before executing again`,
          };
        }
      }
    }

    return { valid: true };
  }

  /**
   * Parse interval string to milliseconds
   */
  private parseInterval(interval: string): number {
    const match = interval.match(/^(\d+)(s|m|h)?$/);
    if (!match) {
      return 0; // No limit
    }

    const value = parseInt(match[1], 10);
    const unit = match[2] || 's';

    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      default:
        return value * 1000;
    }
  }

  getType(): string {
    return 'clickTrigger';
  }

  getIcon(): string {
    return 'MousePointerClick';
  }

  /**
   * Get trigger configuration summary
   */
  getConfigSummary(): {
    type: string;
    mode: string;
    buttonText: string;
    requireConfirmation: boolean;
    hasData: boolean;
  } {
    return {
      type: 'manual',
      mode: 'ui',
      buttonText: this.config.buttonText || 'Execute',
      requireConfirmation: this.config.requireConfirmation === true,
      hasData: !!this.config.data && Object.keys(this.config.data).length > 0,
    };
  }

  /**
   * Reset execution state
   */
  resetExecutionState(): void {
    ClickTriggerNode.isExecuting.delete(this.id);
  }

  /**
   * Static method to reset all executing states
   */
  static resetAllExecutingStates(): void {
    ClickTriggerNode.isExecuting.clear();
  }

  /**
   * Static method to check if any trigger is executing
   */
  static isAnyExecuting(): boolean {
    return ClickTriggerNode.isExecuting.size > 0;
  }

  /**
   * Get all currently executing trigger IDs
   */
  static getExecutingTriggers(): string[] {
    return Array.from(ClickTriggerNode.isExecuting);
  }
}
