import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * Email Trigger Node - Triggers workflow on incoming emails
 * n8n-compatible: Monitors email inbox via IMAP/POP3
 *
 * Configuration:
 * - host: IMAP/POP3 server hostname (e.g., 'imap.gmail.com')
 * - port: Server port (default: 993 for IMAP, 995 for POP3)
 * - secure: Use SSL/TLS (default: true)
 * - username: Email account username
 * - password: Email account password or app-specific password
 * - folder: Mailbox folder to monitor (default: 'INBOX')
 * - protocol: 'imap' or 'pop3' (default: 'imap')
 * - markAsRead: Mark emails as read after processing (default: false)
 * - filter: Email filter options (from, subject, sinceDate, etc.)
 */
export class EmailTriggerNode extends BaseNode {
  private static readonly DEFAULT_PORTS = {
    imap: { secure: 993, insecure: 143 },
    pop3: { secure: 995, insecure: 110 },
  };

  private lastCheckTime: Date | null = null;

  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
    this.validateConfig();
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    if (!this.config.host) {
      throw new Error('host is required for email trigger');
    }

    if (!this.config.username) {
      throw new Error('username is required for email trigger');
    }

    if (!this.config.password) {
      throw new Error('password is required for email trigger');
    }

    const protocol = this.config.protocol || 'imap';
    if (!['imap', 'pop3'].includes(protocol)) {
      throw new Error(`Invalid protocol: ${protocol}. Valid: imap, pop3`);
    }

    if (this.config.port) {
      const port = parseInt(this.config.port, 10);
      if (isNaN(port) || port < 1 || port > 65535) {
        throw new Error(`Invalid port: ${this.config.port}. Must be between 1 and 65535`);
      }
    }

    if (this.config.filter && typeof this.config.filter !== 'object') {
      throw new Error('filter must be an object');
    }
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const protocol = this.config.protocol || 'imap';
      const folder = this.config.folder || 'INBOX';
      const markAsRead = this.config.markAsRead === true;
      const filter = this.config.filter || {};

      // In a real implementation, this would connect to the email server
      // and fetch new emails. For now, we simulate the trigger behavior
      // and provide the data structure expected when emails arrive.

      const emailData = this.extractEmailData(context.$json);

      // Check if email passes filter
      if (!this.passesFilter(emailData, filter)) {
        return {
          success: true,
          data: {
            ...context.$json,
            _trigger: {
              type: 'email',
              filtered: true,
              reason: 'Email does not match filter criteria',
            },
          },
        };
      }

      return {
        success: true,
        data: {
          ...context.$json,
          _trigger: {
            type: 'email',
            protocol,
            host: this.config.host,
            folder,
            markAsRead,
            timestamp: new Date().toISOString(),
          },
          _email: {
            id: emailData.id,
            from: emailData.from,
            to: emailData.to,
            cc: emailData.cc,
            bcc: emailData.bcc,
            subject: emailData.subject,
            text: emailData.text,
            html: emailData.html,
            attachments: emailData.attachments,
            date: emailData.date,
            flags: emailData.flags,
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
   * Extract email data from input
   */
  private extractEmailData(input: any): any {
    return {
      id: input?.id || input?.messageId || null,
      from: this.parseEmailAddress(input?.from),
      to: this.parseEmailAddresses(input?.to),
      cc: this.parseEmailAddresses(input?.cc),
      bcc: this.parseEmailAddresses(input?.bcc),
      subject: input?.subject || '',
      text: input?.text || input?.textPlain || '',
      html: input?.html || input?.textHtml || '',
      attachments: this.parseAttachments(input?.attachments),
      date: input?.date ? new Date(input.date) : new Date(),
      flags: input?.flags || [],
      headers: input?.headers || {},
    };
  }

  /**
   * Parse single email address
   */
  private parseEmailAddress(address: any): { name?: string; email: string } | null {
    if (!address) return null;

    if (typeof address === 'string') {
      const match = address.match(/(?:"?([^"]*)"?\s*)?(?:<)?([^>]+@[^>]+)(?:>)?/);
      if (match) {
        return {
          name: match[1]?.trim() || undefined,
          email: match[2]?.trim(),
        };
      }
      return { email: address };
    }

    if (typeof address === 'object' && address.address) {
      return {
        name: address.name,
        email: address.address,
      };
    }

    return null;
  }

  /**
   * Parse multiple email addresses
   */
  private parseEmailAddresses(addresses: any): Array<{ name?: string; email: string }> {
    if (!addresses) return [];

    if (Array.isArray(addresses)) {
      return addresses.map((a: any) => this.parseEmailAddress(a)).filter(Boolean);
    }

    if (typeof addresses === 'string') {
      return addresses
        .split(',')
        .map((a: string) => this.parseEmailAddress(a.trim()))
        .filter(Boolean);
    }

    return [];
  }

  /**
   * Parse email attachments
   */
  private parseAttachments(attachments: any): any[] {
    if (!attachments) return [];

    if (Array.isArray(attachments)) {
      return attachments.map((att: any) => ({
        filename: att.filename || att.name || 'unknown',
        contentType: att.contentType || att.type || 'application/octet-stream',
        size: att.size || 0,
        contentId: att.contentId,
        disposition: att.disposition || 'attachment',
      }));
    }

    return [];
  }

  /**
   * Check if email passes filter
   */
  private passesFilter(email: any, filter: any): boolean {
    if (!filter) return true;

    // Filter by sender
    if (filter.from) {
      const fromEmail = email.from?.email?.toLowerCase() || '';
      const fromName = email.from?.name?.toLowerCase() || '';
      const filterFrom = filter.from.toLowerCase();

      if (!fromEmail.includes(filterFrom) && !fromName.includes(filterFrom)) {
        return false;
      }
    }

    // Filter by recipient
    if (filter.to) {
      const toEmails = email.to?.map((t: any) => t.email.toLowerCase()) || [];
      const filterTo = filter.to.toLowerCase();

      if (!toEmails.some((e: string) => e.includes(filterTo))) {
        return false;
      }
    }

    // Filter by subject
    if (filter.subject) {
      const subject = email.subject?.toLowerCase() || '';
      const filterSubject = filter.subject.toLowerCase();

      if (!subject.includes(filterSubject)) {
        return false;
      }
    }

    // Filter by date (since)
    if (filter.sinceDate) {
      const since = new Date(filter.sinceDate);
      const emailDate = new Date(email.date);

      if (emailDate < since) {
        return false;
      }
    }

    // Filter by has attachments
    if (filter.hasAttachments === true) {
      if (!email.attachments || email.attachments.length === 0) {
        return false;
      }
    }

    // Filter by flags
    if (filter.flags && filter.flags.length > 0) {
      const hasRequiredFlag = filter.flags.some((f: string) =>
        email.flags?.includes(f)
      );
      if (!hasRequiredFlag) {
        return false;
      }
    }

    return true;
  }

  /**
   * Format error messages
   */
  private formatErrorMessage(error: any): string {
    if (error.message?.includes('host is required')) {
      return error.message;
    }
    if (error.message?.includes('username is required')) {
      return error.message;
    }
    if (error.message?.includes('password is required')) {
      return error.message;
    }
    if (error.message?.includes('Invalid protocol')) {
      return error.message;
    }
    if (error.code === 'ENOTFOUND') {
      return `Email server not found: ${this.config.host}. Check the hostname and your network connection.`;
    }
    if (error.code === 'ETIMEDOUT') {
      return `Connection timeout: Could not connect to ${this.config.host}. Check your firewall and port settings.`;
    }
    if (error.code === 'EAUTH') {
      return `Authentication failed: Invalid username or password. For Gmail, use an App-Specific Password.`;
    }
    return `Email trigger error: ${error.message || 'Unknown error'}`;
  }

  getType(): string {
    return 'emailTrigger';
  }

  getIcon(): string {
    return 'Mail';
  }

  /**
   * Get connection configuration
   */
  getEmailConfig(): {
    host: string;
    port: number;
    secure: boolean;
    username: string;
    folder?: string;
    protocol: string;
  } {
    const protocol = this.config.protocol || 'imap';
    const secure = this.config.secure !== false;
    const port = this.config.port || EmailTriggerNode.DEFAULT_PORTS[protocol][secure ? 'secure' : 'insecure'];

    return {
      host: this.config.host,
      port,
      secure,
      username: this.config.username,
      folder: this.config.folder || 'INBOX',
      protocol,
    };
  }

  /**
   * Get webhook path for email polling trigger
   */
  getWebhookPath(): string {
    return `/webhook/email/${this.id}`;
  }

  /**
   * Build IMAP search criteria from filter
   */
  static buildIMAPSearchCriteria(filter: any): any {
    const criteria: string[] = [];

    if (filter.from) {
      criteria.push(['FROM', filter.from]);
    }

    if (filter.to) {
      criteria.push(['TO', filter.to]);
    }

    if (filter.subject) {
      criteria.push(['SUBJECT', filter.subject]);
    }

    if (filter.sinceDate) {
      criteria.push(['SINCE', filter.sinceDate]);
    }

    if (filter.hasAttachments === true) {
      // IMAP doesn't have a direct HAS_ATTACHMENT flag
      // This would require checking the BODYSTRUCTURE
    }

    if (filter.flags && filter.flags.length > 0) {
      filter.flags.forEach((flag: string) => {
        criteria.push(['KEYWORD', flag]);
      });
    }

    return criteria;
  }

  /**
   * Parse IMAP email address format
   */
  static parseIMAPAddress(address: any): { name?: string; email: string } | null {
    if (!address) return null;

    if (typeof address === 'object') {
      return {
        name: address.name || undefined,
        email: address.mailbox && address.host ? `${address.mailbox}@${address.host}` : address.value?.address,
      };
    }

    return null;
  }

  /**
   * Validate email credentials
   */
  static async validateCredentials(config: any): Promise<{ valid: boolean; error?: string }> {
    // In a real implementation, this would attempt to connect to the email server
    // For now, we do basic validation
    if (!config.host) {
      return { valid: false, error: 'host is required' };
    }

    if (!config.username) {
      return { valid: false, error: 'username is required' };
    }

    if (!config.password) {
      return { valid: false, error: 'password is required' };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(config.username)) {
      return { valid: false, error: 'Invalid email format for username' };
    }

    return { valid: true };
  }

  /**
   * Get server info for common email providers
   */
  static getProviderInfo(email: string): { host: string; port: number; secure: boolean; protocol: string } | null {
    const domain = email.split('@')[1]?.toLowerCase();

    const providers: Record<string, { host: string; port: number; secure: boolean; protocol: string }> = {
      'gmail.com': { host: 'imap.gmail.com', port: 993, secure: true, protocol: 'imap' },
      'yahoo.com': { host: 'imap.mail.yahoo.com', port: 993, secure: true, protocol: 'imap' },
      'outlook.com': { host: 'outlook.office365.com', port: 993, secure: true, protocol: 'imap' },
      'hotmail.com': { host: 'outlook.office365.com', port: 993, secure: true, protocol: 'imap' },
      'icloud.com': { host: 'imap.mail.me.com', port: 993, secure: true, protocol: 'imap' },
    };

    return providers[domain] || null;
  }
}
