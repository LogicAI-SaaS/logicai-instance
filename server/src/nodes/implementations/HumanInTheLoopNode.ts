import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';
import { randomBytes } from 'crypto';

/**
 * Human-in-the-Loop Node - Pauses workflow and generates approval URL
 * Allows human intervention before critical actions
 */
export class HumanInTheLoopNode extends BaseNode {
  private static pendingApprovals = new Map<string, {
    workflowId: string;
    nodeId: string;
    data: any;
    timestamp: Date;
    expiresAt: Date;
  }>();

  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const approvalTimeout = this.config.timeout || 3600000; // 1 hour default
      const approvalId = this.generateApprovalId();
      const expiresAt = new Date(Date.now() + approvalTimeout);

      // Store pending approval
      HumanInTheLoopNode.pendingApprovals.set(approvalId, {
        workflowId: context.$workflow.id,
        nodeId: this.id,
        data: context.$json,
        timestamp: new Date(),
        expiresAt,
      });

      // Generate approval URL
      const approvalUrl = this.generateApprovalUrl(approvalId);

      // Optionally send notification
      if (this.config.notificationType === 'email') {
        await this.sendEmailNotification(approvalUrl, context);
      } else if (this.config.notificationType === 'slack') {
        await this.sendSlackNotification(approvalUrl, context);
      }

      // Wait for approval (in real implementation, this would be async)
      // For now, we'll return the approval info and let the system poll
      return {
        success: true,
        data: {
          approvalId,
          approvalUrl,
          status: 'pending_approval',
          message: 'Waiting for human approval',
          expiresAt: expiresAt.toISOString(),
          $json: context.$json, // Pass through original data
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Human-in-the-loop failed',
      };
    }
  }

  getType(): string {
    return 'humanInTheLoop';
  }

  getIcon(): string {
    return 'UserCheck';
  }

  private generateApprovalId(): string {
    return randomBytes(32).toString('hex');
  }

  private generateApprovalUrl(approvalId: string): string {
    const baseUrl = this.config.approvalBaseUrl || 'http://localhost:5173';
    return `${baseUrl}/approve/${approvalId}`;
  }

  private async sendEmailNotification(url: string, context: ExecutionContext): Promise<void> {
    // Placeholder for email sending logic
    // Would use nodemailer or similar service
    console.log(`Email notification sent to ${this.config.notificationEmail}: ${url}`);
  }

  private async sendSlackNotification(url: string, context: ExecutionContext): Promise<void> {
    // Placeholder for Slack notification
    // Would use Slack webhook
    console.log(`Slack notification sent: ${url}`);
  }

  /**
   * Check and process an approval
   * Called externally when user approves/rejects
   */
  static processApproval(approvalId: string, approved: boolean): any {
    const pending = HumanInTheLoopNode.pendingApprovals.get(approvalId);

    if (!pending) {
      throw new Error('Invalid or expired approval ID');
    }

    if (new Date() > pending.expiresAt) {
      HumanInTheLoopNode.pendingApprovals.delete(approvalId);
      throw new Error('Approval has expired');
    }

    // Remove from pending
    HumanInTheLoopNode.pendingApprovals.delete(approvalId);

    return {
      approved,
      data: pending.data,
      workflowId: pending.workflowId,
      nodeId: pending.nodeId,
    };
  }

  /**
   * Get pending approval by ID
   */
  static getPendingApproval(approvalId: string): any {
    return HumanInTheLoopNode.pendingApprovals.get(approvalId);
  }

  /**
   * Clean up expired approvals
   */
  static cleanupExpiredApprovals(): void {
    const now = new Date();
    for (const [id, approval] of HumanInTheLoopNode.pendingApprovals.entries()) {
      if (now > approval.expiresAt) {
        HumanInTheLoopNode.pendingApprovals.delete(id);
      }
    }
  }
}
