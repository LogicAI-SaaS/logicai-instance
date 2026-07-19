import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

/**
 * Gmail Node - Interact with Gmail API
 * n8n-compatible: Send, read, search, label, delete emails
 *
 * Configuration:
 * - operation: 'send' | 'get' | 'list' | 'search' | 'delete' | 'modifyLabels' | 'attachment'
 * - credentials: OAuth2 credentials { clientId, clientSecret, refreshToken }
 * - userId: Gmail user ID (default: 'me')
 * - messageId: Message ID for get/delete/modify operations
 * - query: Search query for list/search operations
 * - maxResults: Maximum results (default: 10)
 * - labels: Labels for modifyLabels operation
 * - email: Email data for send operation { to, subject, body, attachments }
 */
export class GmailNode extends BaseNode {
  private oauth2Client?: OAuth2Client;
  private gmail?: any;

  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
    this.validateConfig();
    this.initializeClient();
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    const operation = this.config.operation || 'list';

    if (!['send', 'get', 'list', 'search', 'delete', 'modifyLabels', 'attachment'].includes(operation)) {
      throw new Error(`Invalid operation: ${operation}`);
    }

    if (!this.config.credentials) {
      throw new Error('OAuth2 credentials are required (clientId, clientSecret, refreshToken)');
    }
  }

  /**
   * Initialize Gmail client
   */
  private initializeClient(): void {
    const { clientId, clientSecret, refreshToken } = this.config.credentials;

    if (!clientId || !clientSecret || !refreshToken) {
      throw new Error('Invalid OAuth2 credentials');
    }

    this.oauth2Client = new OAuth2Client(
      clientId,
      clientSecret
    );

    this.oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const operation = this.config.operation || 'list';
      const userId = this.config.userId || 'me';

      switch (operation) {
        case 'send':
          return await this.sendEmail(context);
        case 'get':
          return await this.getEmail(userId);
        case 'list':
          return await this.listEmails(userId);
        case 'search':
          return await this.searchEmails(userId);
        case 'delete':
          return await this.deleteEmail(userId);
        case 'modifyLabels':
          return await this.modifyLabels(userId);
        case 'attachment':
          return await this.getAttachment(userId);
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
    const email = this.resolveValue(this.config.email, context) || {};

    // Build email
    const emailLines = [
      `To: ${email.to || this.getNestedValue(context.$json, 'email')}`,
      `Subject: ${email.subject || ''}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      email.body || email.text || '',
    ];

    // Add CC if provided
    if (email.cc) {
      emailLines.splice(1, 0, `Cc: ${email.cc}`);
    }

    // Add BCC if provided
    if (email.bcc) {
      emailLines.splice(1, 0, `Bcc: ${email.bcc}`);
    }

    // Add attachments if provided
    if (email.attachments && Array.isArray(email.attachments)) {
      const boundary = 'boundary_' + Date.now();
      emailLines[3] = `Content-Type: multipart/mixed; boundary=${boundary}`;

      const body = email.body || email.text || '';
      emailLines.splice(5, emailLines.length - 5);

      emailLines.push(
        `--${boundary}`,
        'Content-Type: text/html; charset=utf-8',
        '',
        body,
      );

      for (const attachment of email.attachments) {
        emailLines.push(
          `--${boundary}`,
          `Content-Type: ${attachment.contentType || 'application/octet-stream'}`,
          `Content-Disposition: attachment; filename="${attachment.filename}"`,
          'Content-Transfer-Encoding: base64',
          '',
          attachment.content,
        );
      }

      emailLines.push(`--${boundary}--`);
    }

    const emailContent = emailLines.join('\r\n');
    const encodedEmail = Buffer.from(emailContent).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await this.gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedEmail,
      },
    });

    return {
      success: true,
      data: {
        sent: true,
        messageId: response.data.id,
        threadId: response.data.threadId,
        labelIds: response.data.labelIds,
      },
    };
  }

  /**
   * Get email by ID
   */
  private async getEmail(userId: string): Promise<NodeExecutionResult> {
    const messageId = this.config.messageId || this.getNestedValue(context.$json, 'messageId');

    if (!messageId) {
      throw new Error('messageId is required for get operation');
    }

    const response = await this.gmail.users.messages.get({
      userId,
      id: messageId,
      format: 'full',
    });

    const message = this.parseGmailMessage(response.data);

    return {
      success: true,
      data: message,
    };
  }

  /**
   * List emails
   */
  private async listEmails(userId: string): Promise<NodeExecutionResult> {
    const maxResults = this.config.maxResults || 10;
    const labelIds = this.config.labelIds;

    const response = await this.gmail.users.messages.list({
      userId,
      maxResults,
      labelIds,
    });

    const messages = response.data.messages || [];

    // Fetch full message details for each
    const fullMessages = await Promise.all(
      messages.map(async (msg: any) => {
        const full = await this.gmail.users.messages.get({
          userId,
          id: msg.id,
          format: 'metadata',
          metadataHeaders: ['From', 'To', 'Subject', 'Date'],
        });
        return this.parseGmailMessage(full.data);
      })
    );

    return {
      success: true,
      data: {
        messages: fullMessages,
        count: fullMessages.length,
        nextPageToken: response.data.nextPageToken,
      },
    };
  }

  /**
   * Search emails
   */
  private async searchEmails(userId: string): Promise<NodeExecutionResult> {
    const query = this.config.query || this.getNestedValue(context.$json, 'query');
    const maxResults = this.config.maxResults || 10;

    if (!query) {
      throw new Error('Query is required for search operation');
    }

    const response = await this.gmail.users.messages.list({
      userId,
      q: query,
      maxResults,
    });

    const messages = response.data.messages || [];

    const fullMessages = await Promise.all(
      messages.map(async (msg: any) => {
        const full = await this.gmail.users.messages.get({
          userId,
          id: msg.id,
          format: 'full',
        });
        return this.parseGmailMessage(full.data);
      })
    );

    return {
      success: true,
      data: {
        messages: fullMessages,
        count: fullMessages.length,
        query,
        nextPageToken: response.data.nextPageToken,
      },
    };
  }

  /**
   * Delete email
   */
  private async deleteEmail(userId: string): Promise<NodeExecutionResult> {
    const messageId = this.config.messageId || this.getNestedValue(context.$json, 'messageId');

    if (!messageId) {
      throw new Error('messageId is required for delete operation');
    }

    await this.gmail.users.messages.trash({
      userId,
      id: messageId,
    });

    return {
      success: true,
      data: {
        deleted: true,
        messageId,
      },
    };
  }

  /**
   * Modify labels on email
   */
  private async modifyLabels(userId: string): Promise<NodeExecutionResult> {
    const messageId = this.config.messageId || this.getNestedValue(context.$json, 'messageId');
    const addLabelIds = this.config.addLabelIds || [];
    const removeLabelIds = this.config.removeLabelIds || [];

    if (!messageId) {
      throw new Error('messageId is required for modifyLabels operation');
    }

    const response = await this.gmail.users.messages.modify({
      userId,
      id: messageId,
      requestBody: {
        addLabelIds,
        removeLabelIds,
      },
    });

    return {
      success: true,
      data: {
        modified: true,
        messageId,
        labelIds: response.data.labelIds,
      },
    };
  }

  /**
   * Get attachment
   */
  private async getAttachment(userId: string): Promise<NodeExecutionResult> {
    const messageId = this.config.messageId || this.getNestedValue(context.$json, 'messageId');
    const attachmentId = this.config.attachmentId || this.getNestedValue(context.$json, 'attachmentId');

    if (!messageId || !attachmentId) {
      throw new Error('messageId and attachmentId are required for attachment operation');
    }

    const response = await this.gmail.users.messages.attachments.get({
      userId,
      messageId,
      id: attachmentId,
    });

    return {
      success: true,
      data: {
        attachmentId: response.data.attachmentId,
        size: response.data.size,
        data: response.data.data,
      },
    };
  }

  /**
   * Parse Gmail message format
   */
  private parseGmailMessage(message: any): any {
    const headers: Record<string, string> = {};

    if (message.payload?.headers) {
      for (const header of message.payload.headers) {
        headers[header.name] = header.value;
      }
    }

    // Extract body
    let body = '';
    if (message.payload?.body?.data) {
      body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
    } else if (message.payload?.parts) {
      // Find HTML body
      const htmlPart = message.payload.parts.find((part: any) =>
        part.mimeType === 'text/html'
      );
      if (htmlPart?.body?.data) {
        body = Buffer.from(htmlPart.body.data, 'base64').toString('utf-8');
      }
    }

    // Extract attachments
    const attachments: any[] = [];
    if (message.payload?.parts) {
      for (const part of message.payload.parts) {
        if (part.filename && part.body?.attachmentId) {
          attachments.push({
            filename: part.filename,
            mimeType: part.mimeType,
            attachmentId: part.body.attachmentId,
            size: part.body.size,
          });
        }
      }
    }

    return {
      id: message.id,
      threadId: message.threadId,
      labelIds: message.labelIds,
      snippet: message.snippet,
      headers,
      from: headers['From'] || '',
      to: headers['To'] || '',
      subject: headers['Subject'] || '',
      date: headers['Date'] || '',
      body,
      attachments,
      historyId: message.historyId,
      internalDate: message.internalDate,
    };
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
   * Format error messages
   */
  private formatErrorMessage(error: any): string {
    if (error.code === 401) {
      return 'Authentication failed. Please check your OAuth credentials.';
    }
    if (error.code === 403) {
      return 'Access denied. Insufficient permissions.';
    }
    if (error.code === 404) {
      return 'Message not found.';
    }
    if (error.message?.includes('invalid_grant')) {
      return 'Invalid OAuth grant. Please re-authenticate.';
    }
    return `Gmail API error: ${error.message || 'Unknown error'}`;
  }

  getType(): string {
    return 'gmail';
  }

  getIcon(): string {
    return 'Mail';
  }

  /**
   * Get available Gmail labels
   */
  static async getLabels(credentials: any): Promise<string[]> {
    try {
      const oauth2Client = new OAuth2Client(
        credentials.clientId,
        credentials.clientSecret
      );

      oauth2Client.setCredentials({
        refresh_token: credentials.refreshToken,
      });

      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

      const response = await gmail.users.labels.list({ userId: 'me' });

      return (response.data.labels || []).map((label: any) => label.id || '');
    } catch {
      return [];
    }
  }

  /**
   * Common search queries
   */
  static getCommonQueries(): Record<string, string> {
    return {
      unread: 'is:unread',
      starred: 'is:starred',
      attachments: 'has:attachment',
      inbox: 'in:inbox',
      sent: 'in:sent',
      drafts: 'in:drafts',
      spam: 'in:spam',
      trash: 'in:trash',
      important: 'is:important',
      today: 'after:2024/01/01', // Dynamic: new Date().toISOString().split('T')[0]
    };
  }
}
