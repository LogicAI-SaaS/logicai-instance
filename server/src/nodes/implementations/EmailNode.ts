import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';
import { createTransport, Transporter } from 'nodemailer';

/**
 * Email Node - Send emails via SMTP
 * n8n-compatible: Email sending operations
 *
 * Configuration:
 * - operation: 'send' | 'read'
 * - smtp: { host, port, secure, auth: { user, pass } }
 * - fromEmail: Sender email address
 * - toEmail: Recipient email(s) (comma-separated or array)
 * - ccEmail: CC recipients (optional)
 * - bccEmail: BCC recipients (optional)
 * - subject: Email subject
 * - text: Plain text body
 * - html: HTML body
 * - attachments: Array of { filename, content, contentType }
 * - options: { replyTo, priority, headers }
 */
export class EmailNode extends BaseNode {
  private transporter?: Transporter;

  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
    this.validateConfig();
    this.initializeTransporter();
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    const operation = this.config.operation || 'send';

    if (!['send', 'read'].includes(operation)) {
      throw new Error(`Invalid operation: ${operation}. Valid: send, read`);
    }

    if (operation === 'send') {
      if (!this.config.fromEmail) {
        throw new Error('fromEmail is required for sending emails');
      }

      // Validate SMTP config
      if (!this.config.smtp?.host) {
        throw new Error('smtp.host is required');
      }

      if (this.config.smtp?.port && (this.config.smtp.port < 1 || this.config.smtp.port > 65535)) {
        throw new Error(`Invalid smtp.port: ${this.config.smtp.port}. Must be between 1 and 65535`);
      }
    }
  }

  /**
   * Initialize nodemailer transporter
   */
  private initializeTransporter(): void {
    if (this.config.operation === 'send' && this.config.smtp) {
      const smtp = this.config.smtp;

      this.transporter = createTransport({
        host: smtp.host,
        port: smtp.port || 587,
        secure: smtp.secure || false,
        auth: smtp.auth ? {
          user: smtp.auth.user,
          pass: smtp.auth.pass,
        } : undefined,
      });
    }
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const operation = this.config.operation || 'send';

      switch (operation) {
        case 'send':
          return await this.sendEmail(context);
        case 'read':
          return await this.readEmails(context);
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    } catch (error: any) {
      return {
        success: false,
        error: this.formatErrorMessage(error),
      };
    }
  }

  /**
   * Send email
   */
  private async sendEmail(context: ExecutionContext): Promise<NodeExecutionResult> {
    if (!this.transporter) {
      throw new Error('SMTP transporter not configured');
    }

    const fromEmail = this.resolveValue(this.config.fromEmail, context);
    const toEmail = this.resolveValue(this.config.toEmail, context) || this.getNestedValue(context.$json, 'email');
    const subject = this.resolveValue(this.config.subject, context) || this.getNestedValue(context.$json, 'subject');
    const text = this.resolveValue(this.config.text, context);
    const html = this.resolveValue(this.config.html, context);
    const attachments = this.config.attachments || [];
    const ccEmail = this.resolveValue(this.config.ccEmail, context);
    const bccEmail = this.resolveValue(this.config.bccEmail, context);

    // Validate required fields
    if (!toEmail) {
      throw new Error('toEmail is required');
    }
    if (!subject) {
      throw new Error('subject is required');
    }

    // Build email options
    const mailOptions: any = {
      from: fromEmail,
      to: this.parseEmailAddresses(toEmail),
      subject,
    };

    if (ccEmail) {
      mailOptions.cc = this.parseEmailAddresses(ccEmail);
    }

    if (bccEmail) {
      mailOptions.bcc = this.parseEmailAddresses(bccEmail);
    }

    if (text) {
      mailOptions.text = text;
    }

    if (html) {
      mailOptions.html = html;
    }

    if (attachments && attachments.length > 0) {
      mailOptions.attachments = attachments.map((att: any) => ({
        filename: att.filename,
        content: att.content,
        contentType: att.contentType || 'application/octet-stream',
      }));
    }

    if (this.config.options?.replyTo) {
      mailOptions.replyTo = this.resolveValue(this.config.options.replyTo, context);
    }

    if (this.config.options?.priority) {
      mailOptions.priority = this.config.options.priority;
    }

    if (this.config.options?.headers) {
      mailOptions.headers = this.config.options.headers;
    }

    // Send email
    const info = await this.transporter.sendMail(mailOptions);

    return {
      success: true,
      data: {
        sent: true,
        messageId: info.messageId,
        from: fromEmail,
        to: toEmail,
        subject,
        preview: this.transporter ? this.getPreviewURL(info) : undefined,
      },
    };
  }

  /**
   * Read emails (IMAP)
   */
  private async readEmails(context: ExecutionContext): Promise<NodeExecutionResult> {
    // This requires IMAP implementation (imapflow or node-imap)
    // For now, return a structured response indicating the need for IMAP library

    const imapConfig = this.config.imapConfig || {};
    const folder = this.config.folder || 'INBOX';
    const limit = this.config.limit || 10;

    return {
      success: true,
      data: {
        note: 'IMAP read functionality requires imapflow or node-imap library',
        config: {
          folder,
          limit,
          host: imapConfig.host,
        },
        emails: [],
      },
    };
  }

  /**
   * Parse email addresses (supports comma-separated or array)
   */
  private parseEmailAddresses(emails: string | string[]): string {
    if (Array.isArray(emails)) {
      return emails.join(', ');
    }
    return emails;
  }

  /**
   * Resolve value with variable substitution
   */
  private resolveValue(value: any, context: ExecutionContext): any {
    if (value === null || value === undefined) return undefined;

    if (typeof value === 'string') {
      return value.replace(/\{\{\s*\$(json|workflow|node)\.([\w.]+)\s*\}\}/g, (match, source, path) => {
        const sourceData = source === 'json' ? context.$json
          : source === 'workflow' ? context.$workflow
          : context.$node;
        const found = this.getNestedValue(sourceData, path);
        return found !== undefined ? String(found) : match;
      });
    }

    return value;
  }

  /**
   * Get preview URL for email (ethereal.email testing)
   */
  private getPreviewURL(info: any): string | undefined {
    // Check if using Ethereal Email (testing)
    if (this.config.smtp?.host === 'smtp.ethereal.email') {
      return this.getTestMessageUrl(info.messageId);
    }
    return undefined;
  }

  /**
   * Get test message URL from Ethereal
   */
  private getTestMessageUrl(messageId: string): string | undefined {
    // This would work with Ethereal Email testing service
    // Actual implementation would require async fetch
    return undefined;
  }

  /**
   * Format error messages
   */
  private formatErrorMessage(error: any): string {
    if (error.message?.includes('fromEmail is required')) {
      return error.message;
    }
    if (error.message?.includes('smtp.host is required')) {
      return error.message;
    }
    if (error.code === 'EAUTH') {
      return 'SMTP authentication failed: Check your username and password';
    }
    if (error.code === 'ECONNECTION') {
      return 'SMTP connection failed: Check the host and port';
    }
    if (error.code === 'EMESSAGE') {
      return 'Email message error: Check recipient addresses';
    }
    if (error.code === 'ESOCKET') {
      return 'Socket error: Connection to SMTP server failed';
    }
    return `Email error: ${error.message || 'Unknown error'}`;
  }

  getType(): string {
    return 'email';
  }

  getIcon(): string {
    return 'Mail';
  }

  /**
   * Verify SMTP connection (utility method)
   */
  async verifyConnection(): Promise<{ success: boolean; error?: string }> {
    if (!this.transporter) {
      return { success: false, error: 'SMTP transporter not configured' };
    }

    try {
      await this.transporter.verify();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get SMTP configuration for common providers
   */
  static getProviderConfig(provider: string, credentials: { user: string; pass: string }): {
    host: string;
    port: number;
    secure: boolean;
  } | null {
    const providers: Record<string, { host: string; port: number; secure: boolean }> = {
      gmail: { host: 'smtp.gmail.com', port: 465, secure: true },
      outlook: { host: 'smtp-mail.outlook.com', port: 587, secure: false },
      yahoo: { host: 'smtp.mail.yahoo.com', port: 465, secure: true },
      icloud: { host: 'smtp.mail.me.com', port: 587, secure: false },
      sendgrid: { host: 'smtp.sendgrid.net', port: 587, secure: false },
      mailgun: { host: 'smtp.mailgun.org', port: 587, secure: false },
      aws: { host: 'email-smtp.us-east-1.amazonaws.com', port: 587, secure: false },
    };

    const config = providers[provider.toLowerCase()];
    return config ? { ...config } : null;
  }
}
