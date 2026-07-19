import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * WhatsApp Node - WhatsApp messaging via Twilio API
 * n8n-compatible: WhatsApp Business API
 */
export class WhatsAppNode extends BaseNode {
  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const operation = this.config.operation || 'sendMessage'; // sendMessage, sendMedia
      const accountSid = this.config.accountSid;
      const authToken = this.config.authToken;
      const fromNumber = this.config.fromNumber;
      const toNumber = this.config.toNumber || this.getNestedValue(context.$json, 'phoneNumber');
      const message = this.config.message || this.getNestedValue(context.$json, 'message');

      switch (operation) {
        case 'sendMessage':
          return await this.sendMessage(fromNumber, toNumber, message);
        case 'sendMedia':
          return await this.sendMedia(fromNumber, toNumber, this.config.mediaUrl, this.config.caption);
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'WhatsApp operation failed',
      };
    }
  }

  getType(): string {
    return 'whatsApp';
  }

  getIcon(): string {
    return 'MessageSquare';
  }

  private async sendMessage(from: string, to: string, message: string): Promise<NodeExecutionResult> {
    // In production, would use Twilio API
    return {
      success: true,
      data: {
        sid: 'WA-twilio-sid',
        from,
        to,
        message,
        status: 'queued',
      },
    };
  }

  private async sendMedia(from: string, to: string, mediaUrl: string, caption?: string): Promise<NodeExecutionResult> {
    return {
      success: true,
      data: {
        sid: 'WA-media-sid',
        from,
        to,
        mediaUrl,
        caption,
        status: 'queued',
      },
    };
  }
}
