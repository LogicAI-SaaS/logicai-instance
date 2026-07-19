import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * SendGridNode - SendGrid Email API Integration
 *
 * Provides comprehensive integration with SendGrid API including:
 * - Mail: Send emails, single/batch, dynamic templates, attachments, categories
 * - Contacts: Add, update, delete, search, import/export
 * - Lists: Create, update, delete, manage recipients
 * - Segments: Create, update, delete, query conditions
 * - Campaigns: Create, update, delete, send, schedule
 * - Templates: Create, update, delete, versions
 * - Schedules: Send campaigns at scheduled times
 * - Settings: Mail settings, partner settings, tracking
 * - Stats: Email statistics, opens, clicks, bounces
 * - Webhooks: Parse webhooks, event webhooks
 * - Sender Identities: Manage sender addresses
 * - API Keys: Create, list, delete, update
 * - Suppressions: Bounces, blocks, spam reports, invalid emails
 * - Custom Fields: Create, update, delete custom fields
 *
 * Authentication: API Key (Bearer token)
 * API Docs: https://docs.sendgrid.com/api-reference/
 */
export class SendGridNode extends BaseNode {
  readonly apiKey: string;
  readonly apiUrl: string;

  constructor(id: string, name: string, config: any) {
    super(id, name, config);
    this.apiKey = config.apiKey || '';

    if (!this.apiKey) {
      throw new Error('SendGrid API key is required');
    }

    this.apiUrl = 'https://api.sendgrid.com/v3';
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


  getType(): string {
    return 'sendgrid';
  }

  getIcon(): string {
    return '📧';
  }

  getCategory(): string {
    return 'email';
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    const operation = this.config.operation || 'sendEmail';

    try {
      switch (operation) {
        // Mail Operations
        case 'sendEmail':
          return await this.sendEmail(context);
        case 'sendBatchEmails':
          return await this.sendBatchEmails(context);
        case 'sendTemplateEmail':
          return await this.sendTemplateEmail(context);
        case 'sendToMultipleRecipients':
          return await this.sendToMultipleRecipients(context);

        // Contact Operations
        case 'addContact':
          return await this.addContact(context);
        case 'updateContact':
          return await this.updateContact(context);
        case 'deleteContact':
          return await this.deleteContact(context);
        case 'getContact':
          return await this.getContact(context);
        case 'listContacts':
          return await this.listContacts(context);
        case 'searchContacts':
          return await this.searchContacts(context);
        case 'importContacts':
          return await this.importContacts(context);
        case 'exportContacts':
          return await this.exportContacts(context);
        case 'addContactsToList':
          return await this.addContactsToList(context);
        case 'removeContactsFromList':
          return await this.removeContactsFromList(context);

        // List Operations
        case 'createList':
          return await this.createList(context);
        case 'getList':
          return await this.getList(context);
        case 'listLists':
          return await this.listLists();
        case 'updateList':
          return await this.updateList(context);
        case 'deleteList':
          return await this.deleteList(context);
        case 'getListRecipients':
          return await this.getListRecipients(context);

        // Segment Operations
        case 'createSegment':
          return await this.createSegment(context);
        case 'getSegment':
          return await this.getSegment(context);
        case 'listSegments':
          return await this.listSegments(context);
        case 'updateSegment':
          return await this.updateSegment(context);
        case 'deleteSegment':
          return await this.deleteSegment(context);

        // Campaign Operations
        case 'createCampaign':
          return await this.createCampaign(context);
        case 'getCampaign':
          return await this.getCampaign(context);
        case 'listCampaigns':
          return await this.listCampaigns();
        case 'updateCampaign':
          return await this.updateCampaign(context);
        case 'deleteCampaign':
          return await this.deleteCampaign(context);
        case 'sendCampaign':
          return await this.sendCampaign(context);
        case 'scheduleCampaign':
          return await this.scheduleCampaign(context);
        case 'unscheduleCampaign':
          return await this.unscheduleCampaign(context);

        // Template Operations
        case 'createTemplate':
          return await this.createTemplate(context);
        case 'getTemplate':
          return await this.getTemplate(context);
        case 'listTemplates':
          return await this.listTemplates();
        case 'updateTemplate':
          return await this.updateTemplate(context);
        case 'deleteTemplate':
          return await this.deleteTemplate(context);
        case 'createTemplateVersion':
          return await this.createTemplateVersion(context);
        case 'getTemplateVersion':
          return await this.getTemplateVersion(context);
        case 'listTemplateVersions':
          return await this.listTemplateVersions(context);
        case 'updateTemplateVersion':
          return await this.updateTemplateVersion(context);
        case 'deleteTemplateVersion':
          return await this.deleteTemplateVersion(context);
        case 'activateTemplateVersion':
          return await this.activateTemplateVersion(context);

        // Sender Identity Operations
        case 'createSenderIdentity':
          return await this.createSenderIdentity(context);
        case 'getSenderIdentity':
          return await this.getSenderIdentity(context);
        case 'listSenderIdentities':
          return await this.listSenderIdentities();
        case 'updateSenderIdentity':
          return await this.updateSenderIdentity(context);
        case 'deleteSenderIdentity':
          return await this.deleteSenderIdentity(context);
        case 'verifySenderIdentity':
          return await this.verifySenderIdentity(context);

        // Suppression Operations
        case 'addBounces':
          return await this.addBounces(context);
        case 'getBounces':
          return await this.getBounces(context);
        case 'deleteBounce':
          return await this.deleteBounce(context);
        case 'addBlocks':
          return await this.addBlocks(context);
        case 'getBlocks':
          return await this.getBlocks(context);
        case 'deleteBlock':
          return await this.deleteBlock(context);
        case 'addSpamReports':
          return await this.addSpamReports(context);
        case 'getSpamReports':
          return await this.getSpamReports(context);
        case 'deleteSpamReport':
          return await this.deleteSpamReport(context);
        case 'addInvalidEmails':
          return await this.addInvalidEmails(context);
        case 'getInvalidEmails':
          return await this.getInvalidEmails(context);
        case 'deleteInvalidEmail':
          return await this.deleteInvalidEmail(context);

        // Custom Field Operations
        case 'createCustomField':
          return await this.createCustomField(context);
        case 'listCustomFields':
          return await this.listCustomFields();
        case 'getCustomField':
          return await this.getCustomField(context);
        case 'deleteCustomField':
          return await this.deleteCustomField(context);
        case 'reserveCustomField':
          return await this.reserveCustomField(context);

        // API Key Operations
        case 'createApiKey':
          return await this.createApiKey(context);
        case 'listApiKeys':
          return await this.listApiKeys();
        case 'getApiKey':
          return await this.getApiKey(context);
        case 'updateApiKey':
          return await this.updateApiKey(context);
        case 'deleteApiKey':
          return await this.deleteApiKey(context);

        // Statistics Operations
        case 'getGlobalStats':
          return await this.getGlobalStats(context);
        case 'getEmailStats':
          return await this.getEmailStats(context);
        case 'getBrowserStats':
          return await this.getBrowserStats(context);
        case 'getDeviceStats':
          return await this.getDeviceStats(context);

        // Settings Operations
        case 'getMailSettings':
          return await this.getMailSettings();
        case 'updateMailSettings':
          return await this.updateMailSettings(context);
        case 'getTrackingSettings':
          return await this.getTrackingSettings();
        case 'updateTrackingSettings':
          return await this.updateTrackingSettings(context);

        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || `Failed to execute SendGrid operation: ${operation}`,
      };
    }
  }

  private getAuthHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  private async callApi(
    endpoint: string,
    method = 'GET',
    body?: any,
    queryParams?: Record<string, string>
  ): Promise<any> {
    let url = `${this.apiUrl}${endpoint}`;

    if (queryParams && Object.keys(queryParams).length > 0) {
      const params = new URLSearchParams(queryParams);
      url += `?${params.toString()}`;
    }

    const options: RequestInit = {
      method,
      headers: this.getAuthHeaders(),
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `SendGrid API error: ${response.status} ${response.statusText}`;

      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.errors) {
          errorMessage = errorJson.errors.map((e: any) => e.message).join(', ');
        }
      } catch {
        // Use default error message
      }

      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    return response.text();
  }

  // ==================== Mail Operations ====================

  private async sendEmail(context: ExecutionContext): Promise<NodeExecutionResult> {
    const to = this.resolveValue(this.config.to, context);
    const from = this.resolveValue(this.config.from, context);
    const subject = this.resolveValue(this.config.subject, context);
    const content = this.resolveValue(this.config.content, context);
    const cc = this.resolveValue(this.config.cc, context) || null;
    const bcc = this.resolveValue(this.config.bcc, context) || null;
    const replyTo = this.resolveValue(this.config.replyTo, context) || null;
    const attachments = this.config.attachments || [];
    const categories = this.config.categories || [];
    const customArgs = this.config.customArgs || {};
    const sendAt = this.config.sendAt || null;
    const templateId = this.config.templateId || null;

    if (!to) {
      throw new Error('to is required');
    }
    if (!from) {
      throw new Error('from is required');
    }
    if (!subject) {
      throw new Error('subject is required');
    }
    if (!content && !templateId) {
      throw new Error('content or templateId is required');
    }

    const personalizations: any[] = [
      {
        to: Array.isArray(to) ? to.map(email => ({ email })) : [{ email: to }],
      },
    ];

    if (cc) {
      personalizations[0].cc = Array.isArray(cc) ? cc.map(email => ({ email })) : [{ email: cc }];
    }
    if (bcc) {
      personalizations[0].bcc = Array.isArray(bcc)
        ? bcc.map(email => ({ email }))
        : [{ email: bcc }];
    }
    if (subject) {
      personalizations[0].subject = subject;
    }
    if (sendAt) {
      personalizations[0].send_at = sendAt;
    }

    const mail: any = {
      personalizations,
      from: { email: from },
      content: [
        {
          type: 'text/html',
          value: content || '',
        },
      ],
    };

    if (replyTo) {
      mail.reply_to = { email: replyTo };
    }
    if (attachments.length > 0) {
      mail.attachments = attachments.map(att => ({
        content: att.content,
        filename: att.filename,
        type: att.type || 'application/octet-stream',
        disposition: att.disposition || 'attachment',
        ...(att.contentId && { content_id: att.contentId }),
      }));
    }
    if (categories.length > 0) {
      mail.categories = categories;
    }
    if (Object.keys(customArgs).length > 0) {
      mail.custom_args = customArgs;
    }
    if (templateId) {
      personalizations[0].template_id = templateId;
    }

    const data = await this.callApi('/mail/send', 'POST', mail);

    return {
      success: true,
      data: {
        message: data || 'Email sent successfully',
        headers: data?.headers,
      },
    };
  }

  private async sendBatchEmails(context: ExecutionContext): Promise<NodeExecutionResult> {
    const to = this.resolveValue(this.config.to, context);
    const from = this.resolveValue(this.config.from, context);
    const subject = this.resolveValue(this.config.subject, context);
    const content = this.resolveValue(this.config.content, context);

    if (!to || !Array.isArray(to) || to.length === 0) {
      throw new Error('to must be a non-empty array of email addresses');
    }
    if (!from) {
      throw new Error('from is required');
    }
    if (!subject) {
      throw new Error('subject is required');
    }
    if (!content) {
      throw new Error('content is required');
    }

    const personalizations = to.map(email => ({
      to: [{ email }],
      subject,
    }));

    const mail: any = {
      personalizations,
      from: { email: from },
      content: [
        {
          type: 'text/html',
          value: content,
        },
      ],
    };

    const data = await this.callApi('/mail/send', 'POST', mail);

    return {
      success: true,
      data: {
        message: 'Batch emails sent successfully',
        count: to.length,
      },
    };
  }

  private async sendTemplateEmail(context: ExecutionContext): Promise<NodeExecutionResult> {
    const to = this.resolveValue(this.config.to, context);
    const from = this.resolveValue(this.config.from, context);
    const templateId = this.config.templateId;
    const dynamicData = this.config.dynamicData || {};

    if (!to) {
      throw new Error('to is required');
    }
    if (!from) {
      throw new Error('from is required');
    }
    if (!templateId) {
      throw new Error('templateId is required');
    }

    const personalizations: any[] = [
      {
        to: Array.isArray(to) ? to.map(email => ({ email })) : [{ email: to }],
        dynamic_template_data: dynamicData,
      },
    ];

    const mail: any = {
      personalizations,
      from: { email: from },
      template_id: templateId,
    };

    const data = await this.callApi('/mail/send', 'POST', mail);

    return {
      success: true,
      data: {
        message: 'Template email sent successfully',
      },
    };
  }

  private async sendToMultipleRecipients(context: ExecutionContext): Promise<NodeExecutionResult> {
    const recipients = this.resolveValue(this.config.recipients, context);
    const from = this.resolveValue(this.config.from, context);
    const subject = this.resolveValue(this.config.subject, context);
    const content = this.resolveValue(this.config.content, context);

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      throw new Error('recipients must be a non-empty array');
    }
    if (!from) {
      throw new Error('from is required');
    }
    if (!subject) {
      throw new Error('subject is required');
    }
    if (!content) {
      throw new Error('content is required');
    }

    const personalizations = recipients.map(recipient => ({
      to: [{ email: recipient.email, name: recipient.name || '' }],
      ...(recipient.subject && { subject: recipient.subject }),
      ...(recipient.customArgs && { custom_args: recipient.customArgs }),
      ...(recipient.dynamicData && { dynamic_template_data: recipient.dynamicData }),
    }));

    const mail: any = {
      personalizations,
      from: { email: from },
      content: [
        {
          type: 'text/html',
          value: content,
        },
      ],
    };

    const data = await this.callApi('/mail/send', 'POST', mail);

    return {
      success: true,
      data: {
        message: 'Emails sent to multiple recipients successfully',
        count: recipients.length,
      },
    };
  }

  // ==================== Contact Operations ====================

  private async addContact(context: ExecutionContext): Promise<NodeExecutionResult> {
    const email = this.resolveValue(this.config.email, context);
    const firstName = this.resolveValue(this.config.firstName, context) || null;
    const lastName = this.resolveValue(this.config.lastName, context) || null;
    const customFields = this.config.customFields || {};
    const listIds = this.config.listIds || [];

    if (!email) {
      throw new Error('email is required');
    }

    const contact: any = {
      email,
      ...(firstName && { first_name: firstName }),
      ...(lastName && { last_name: lastName }),
      ...customFields,
    };

    const data = await this.callApi('/marketing/contacts', 'PUT', {
      contacts: [contact],
      list_ids: listIds,
    });

    return {
      success: true,
      data: {
        contactId: data?.contact_id || email,
        message: 'Contact added successfully',
      },
    };
  }

  private async updateContact(context: ExecutionContext): Promise<NodeExecutionResult> {
    const email = this.resolveValue(this.config.email, context);
    const firstName = this.resolveValue(this.config.firstName, context) || null;
    const lastName = this.resolveValue(this.config.lastName, context) || null;
    const customFields = this.config.customFields || {};

    if (!email) {
      throw new Error('email is required');
    }

    const contact: any = {
      email,
      ...(firstName && { first_name: firstName }),
      ...(lastName && { last_name: lastName }),
      ...customFields,
    };

    const data = await this.callApi('/marketing/contacts', 'PATCH', {
      contacts: [contact],
    });

    return {
      success: true,
      data: {
        message: 'Contact updated successfully',
      },
    };
  }

  private async deleteContact(context: ExecutionContext): Promise<NodeExecutionResult> {
    const email = this.resolveValue(this.config.email, context);

    if (!email) {
      throw new Error('email is required');
    }

    const data = await this.callApi('/marketing/contacts', 'DELETE', {
      emails: [email],
    });

    return {
      success: true,
      data: {
        message: 'Contact deleted successfully',
        data,
      },
    };
  }

  private async getContact(context: ExecutionContext): Promise<NodeExecutionResult> {
    const email = this.resolveValue(this.config.email, context);

    if (!email) {
      throw new Error('email is required');
    }

    const data = await this.callApi('/marketing/contacts/search', 'POST', {
      query: `email LIKE '${email}'`,
    });

    return {
      success: true,
      data: {
        contact: data?.result?.[0] || null,
      },
    };
  }

  private async listContacts(context: ExecutionContext): Promise<NodeExecutionResult> {
    const page = this.config.page || 1;
    const pageSize = Math.min(this.config.pageSize || 100, 1000);

    const data = await this.callApi('/marketing/contacts', 'GET', null, {
      page: String(page),
      page_size: String(pageSize),
    });

    return {
      success: true,
      data: {
        contacts: data?.result || [],
        count: data?.contact_count || 0,
        metadata: data?._metadata || {},
      },
    };
  }

  private async searchContacts(context: ExecutionContext): Promise<NodeExecutionResult> {
    const query = this.resolveValue(this.config.query, context);

    if (!query) {
      throw new Error('query is required');
    }

    const data = await this.callApi('/marketing/contacts/search', 'POST', {
      query,
    });

    return {
      success: true,
      data: {
        contacts: data?.result || [],
        count: data?.contact_count || 0,
      },
    };
  }

  private async importContacts(context: ExecutionContext): Promise<NodeExecutionResult> {
    const contacts = this.resolveValue(this.config.contacts, context);
    const listIds = this.config.listIds || [];

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      throw new Error('contacts must be a non-empty array');
    }

    const data = await this.callApi('/marketing/contacts', 'PUT', {
      contacts,
      list_ids: listIds,
    });

    return {
      success: true,
      data: {
        message: 'Contacts imported successfully',
        data,
      },
    };
  }

  private async exportContacts(context: ExecutionContext): Promise<NodeExecutionResult> {
    const data = await this.callApi('/marketing/contacts/export', 'POST', {
      type: this.config.type || 'email',
      file_type: this.config.fileType || 'csv',
    });

    return {
      success: true,
      data: {
        exportId: data?.id,
        status: data?.status,
        message: 'Export started',
      },
    };
  }

  private async addContactsToList(context: ExecutionContext): Promise<NodeExecutionResult> {
    const listId = this.resolveValue(this.config.listId, context);
    const emails = this.resolveValue(this.config.emails, context);

    if (!listId) {
      throw new Error('listId is required');
    }
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      throw new Error('emails must be a non-empty array');
    }

    const data = await this.callApi(`/marketing/lists/${listId}/contacts`, 'POST', {
      emails,
    });

    return {
      success: true,
      data: {
        message: 'Contacts added to list successfully',
        data,
      },
    };
  }

  private async removeContactsFromList(context: ExecutionContext): Promise<NodeExecutionResult> {
    const listId = this.resolveValue(this.config.listId, context);
    const emails = this.resolveValue(this.config.emails, context);
    const deleteAllContacts = this.config.deleteAllContacts || false;

    if (!listId) {
      throw new Error('listId is required');
    }

    const body: any = {};

    if (deleteAllContacts) {
      body.delete_all_contacts = true;
    } else if (emails && Array.isArray(emails) && emails.length > 0) {
      body.emails = emails;
    } else {
      throw new Error('Either emails or deleteAllContacts must be specified');
    }

    const data = await this.callApi(`/marketing/lists/${listId}/contacts`, 'DELETE', body);

    return {
      success: true,
      data: {
        message: 'Contacts removed from list successfully',
        data,
      },
    };
  }

  // ==================== List Operations ====================

  private async createList(context: ExecutionContext): Promise<NodeExecutionResult> {
    const name = this.resolveValue(this.config.name, context);

    if (!name) {
      throw new Error('name is required');
    }

    const data = await this.callApi('/marketing/lists', 'POST', {
      name,
    });

    return {
      success: true,
      data: {
        list: data,
        message: 'List created successfully',
      },
    };
  }

  private async getList(context: ExecutionContext): Promise<NodeExecutionResult> {
    const listId = this.resolveValue(this.config.listId, context);

    if (!listId) {
      throw new Error('listId is required');
    }

    const data = await this.callApi(`/marketing/lists/${listId}`);

    return {
      success: true,
      data: {
        list: data,
      },
    };
  }

  private async listLists(): Promise<NodeExecutionResult> {
    const data = await this.callApi('/marketing/lists');

    return {
      success: true,
      data: {
        lists: data?.result || [],
        metadata: data?._metadata || {},
      },
    };
  }

  private async updateList(context: ExecutionContext): Promise<NodeExecutionResult> {
    const listId = this.resolveValue(this.config.listId, context);
    const name = this.resolveValue(this.config.name, context);

    if (!listId) {
      throw new Error('listId is required');
    }
    if (!name) {
      throw new Error('name is required');
    }

    const data = await this.callApi(`/marketing/lists/${listId}`, 'PATCH', {
      name,
    });

    return {
      success: true,
      data: {
        list: data,
        message: 'List updated successfully',
      },
    };
  }

  private async deleteList(context: ExecutionContext): Promise<NodeExecutionResult> {
    const listId = this.resolveValue(this.config.listId, context);
    const deleteContacts = this.config.deleteContacts || false;

    if (!listId) {
      throw new Error('listId is required');
    }

    const queryParams: Record<string, string> = {};
    if (deleteContacts) {
      queryParams.delete_contacts = 'true';
    }

    await this.callApi(`/marketing/lists/${listId}`, 'DELETE', null, queryParams);

    return {
      success: true,
      data: {
        message: 'List deleted successfully',
      },
    };
  }

  private async getListRecipients(context: ExecutionContext): Promise<NodeExecutionResult> {
    const listId = this.resolveValue(this.config.listId, context);
    const page = this.config.page || 1;
    const pageSize = Math.min(this.config.pageSize || 100, 1000);

    if (!listId) {
      throw new Error('listId is required');
    }

    const data = await this.callApi(`/marketing/lists/${listId}/contacts`, 'GET', null, {
      page: String(page),
      page_size: String(pageSize),
    });

    return {
      success: true,
      data: {
        recipients: data?.result || [],
        count: data?.contact_count || 0,
      },
    };
  }

  // ==================== Segment Operations ====================

  private async createSegment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const name = this.resolveValue(this.config.name, context);
    const listId = this.resolveValue(this.config.listId, context);
    const conditions = this.config.conditions || [];

    if (!name) {
      throw new Error('name is required');
    }
    if (!listId) {
      throw new Error('listId is required');
    }
    if (!conditions || conditions.length === 0) {
      throw new Error('conditions are required');
    }

    const data = await this.callApi('/marketing/segments', 'POST', {
      name,
      list_id: Number(listId),
      conditions,
    });

    return {
      success: true,
      data: {
        segment: data,
        message: 'Segment created successfully',
      },
    };
  }

  private async getSegment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const segmentId = this.resolveValue(this.config.segmentId, context);

    if (!segmentId) {
      throw new Error('segmentId is required');
    }

    const data = await this.callApi(`/marketing/segments/${segmentId}`);

    return {
      success: true,
      data: {
        segment: data,
      },
    };
  }

  private async listSegments(context: ExecutionContext): Promise<NodeExecutionResult> {
    const listId = this.resolveValue(this.config.listId, context) || '';

    const queryParams: Record<string, string> = {};
    if (listId) {
      queryParams.list_id = listId;
    }

    const data = await this.callApi('/marketing/segments', 'GET', null, queryParams);

    return {
      success: true,
      data: {
        segments: data?.results || [],
        metadata: data?._metadata || {},
      },
    };
  }

  private async updateSegment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const segmentId = this.resolveValue(this.config.segmentId, context);
    const name = this.resolveValue(this.config.name, context) || null;
    const conditions = this.config.conditions || null;

    if (!segmentId) {
      throw new Error('segmentId is required');
    }

    const body: any = {};
    if (name) {
      body.name = name;
    }
    if (conditions && conditions.length > 0) {
      body.conditions = conditions;
    }

    const data = await this.callApi(`/marketing/segments/${segmentId}`, 'PATCH', body);

    return {
      success: true,
      data: {
        segment: data,
        message: 'Segment updated successfully',
      },
    };
  }

  private async deleteSegment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const segmentId = this.resolveValue(this.config.segmentId, context);
    const deleteContacts = this.config.deleteContacts || false;

    if (!segmentId) {
      throw new Error('segmentId is required');
    }

    const queryParams: Record<string, string> = {};
    if (deleteContacts) {
      queryParams.delete_contacts = 'true';
    }

    await this.callApi(`/marketing/segments/${segmentId}`, 'DELETE', null, queryParams);

    return {
      success: true,
      data: {
        message: 'Segment deleted successfully',
      },
    };
  }

  // ==================== Campaign Operations ====================

  private async createCampaign(context: ExecutionContext): Promise<NodeExecutionResult> {
    const title = this.resolveValue(this.config.title, context);
    const subject = this.resolveValue(this.config.subject, context);
    const senderId = this.resolveValue(this.config.senderId, context);
    const listIds = this.config.listIds || [];
    const segmentIds = this.config.segmentIds || [];
    const categories = this.config.categories || [];
    const htmlContent = this.resolveValue(this.config.htmlContent, context) || null;
    const plainContent = this.resolveValue(this.config.plainContent, context) || null;
    const suppressionGroupId = this.config.suppressionGroupId || null;

    if (!title) {
      throw new Error('title is required');
    }
    if (!subject) {
      throw new Error('subject is required');
    }
    if (!senderId) {
      throw new Error('senderId is required');
    }
    if (listIds.length === 0 && segmentIds.length === 0) {
      throw new Error('Either listIds or segmentIds must be specified');
    }

    const campaign: any = {
      title,
      subject,
      sender_id: Number(senderId),
      custom_unsubscribe_url: '',
      html_content: htmlContent || '',
      plain_content: plainContent || '',
      list_ids: listIds.map(id => Number(id)),
      segment_ids: segmentIds.map(id => Number(id)),
      categories,
    };

    if (suppressionGroupId) {
      campaign.suppression_group_id = Number(suppressionGroupId);
    }

    const data = await this.callApi('/marketing/campaigns', 'POST', campaign);

    return {
      success: true,
      data: {
        campaign: data,
        message: 'Campaign created successfully',
      },
    };
  }

  private async getCampaign(context: ExecutionContext): Promise<NodeExecutionResult> {
    const campaignId = this.resolveValue(this.config.campaignId, context);

    if (!campaignId) {
      throw new Error('campaignId is required');
    }

    const data = await this.callApi(`/marketing/campaigns/${campaignId}`);

    return {
      success: true,
      data: {
        campaign: data,
      },
    };
  }

  private async listCampaigns(): Promise<NodeExecutionResult> {
    const data = await this.callApi('/marketing/campaigns');

    return {
      success: true,
      data: {
        campaigns: data?.result || [],
        metadata: data?._metadata || {},
      },
    };
  }

  private async updateCampaign(context: ExecutionContext): Promise<NodeExecutionResult> {
    const campaignId = this.resolveValue(this.config.campaignId, context);
    const title = this.resolveValue(this.config.title, context) || null;
    const subject = this.resolveValue(this.config.subject, context) || null;
    const htmlContent = this.resolveValue(this.config.htmlContent, context) || null;
    const plainContent = this.resolveValue(this.config.plainContent, context) || null;
    const senderId = this.resolveValue(this.config.senderId, context) || null;
    const listIds = this.config.listIds || null;
    const segmentIds = this.config.segmentIds || null;
    const categories = this.config.categories || null;

    if (!campaignId) {
      throw new Error('campaignId is required');
    }

    const body: any = {};
    if (title) {
      body.title = title;
    }
    if (subject) {
      body.subject = subject;
    }
    if (htmlContent !== null) {
      body.html_content = htmlContent;
    }
    if (plainContent !== null) {
      body.plain_content = plainContent;
    }
    if (senderId) {
      body.sender_id = Number(senderId);
    }
    if (listIds) {
      body.list_ids = listIds.map(id => Number(id));
    }
    if (segmentIds) {
      body.segment_ids = segmentIds.map(id => Number(id));
    }
    if (categories) {
      body.categories = categories;
    }

    const data = await this.callApi(`/marketing/campaigns/${campaignId}`, 'PATCH', body);

    return {
      success: true,
      data: {
        campaign: data,
        message: 'Campaign updated successfully',
      },
    };
  }

  private async deleteCampaign(context: ExecutionContext): Promise<NodeExecutionResult> {
    const campaignId = this.resolveValue(this.config.campaignId, context);

    if (!campaignId) {
      throw new Error('campaignId is required');
    }

    await this.callApi(`/marketing/campaigns/${campaignId}`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Campaign deleted successfully',
      },
    };
  }

  private async sendCampaign(context: ExecutionContext): Promise<NodeExecutionResult> {
    const campaignId = this.resolveValue(this.config.campaignId, context);

    if (!campaignId) {
      throw new Error('campaignId is required');
    }

    const data = await this.callApi(`/marketing/campaigns/${campaignId}/schedules`, 'POST');

    return {
      success: true,
      data: {
        message: 'Campaign sent successfully',
        data,
      },
    };
  }

  private async scheduleCampaign(context: ExecutionContext): Promise<NodeExecutionResult> {
    const campaignId = this.resolveValue(this.config.campaignId, context);
    const sendAt = this.resolveValue(this.config.sendAt, context);

    if (!campaignId) {
      throw new Error('campaignId is required');
    }
    if (!sendAt) {
      throw new Error('sendAt is required');
    }

    const data = await this.callApi(`/marketing/campaigns/${campaignId}/schedules`, 'POST', {
      send_at: sendAt,
    });

    return {
      success: true,
      data: {
        message: 'Campaign scheduled successfully',
        sendAt: data?.send_at,
      },
    };
  }

  private async unscheduleCampaign(context: ExecutionContext): Promise<NodeExecutionResult> {
    const campaignId = this.resolveValue(this.config.campaignId, context);

    if (!campaignId) {
      throw new Error('campaignId is required');
    }

    await this.callApi(`/marketing/campaigns/${campaignId}/schedules`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Campaign unscheduled successfully',
      },
    };
  }

  // ==================== Template Operations ====================

  private async createTemplate(context: ExecutionContext): Promise<NodeExecutionResult> {
    const name = this.resolveValue(this.config.name, context);
    const generation = this.config.generation || 'dynamic';

    if (!name) {
      throw new Error('name is required');
    }

    const data = await this.callApi('/designs', 'POST', {
      name,
      generation,
    });

    return {
      success: true,
      data: {
        template: data,
        message: 'Template created successfully',
      },
    };
  }

  private async getTemplate(context: ExecutionContext): Promise<NodeExecutionResult> {
    const templateId = this.resolveValue(this.config.templateId, context);

    if (!templateId) {
      throw new Error('templateId is required');
    }

    const data = await this.callApi(`/designs/${templateId}`);

    return {
      success: true,
      data: {
        template: data,
      },
    };
  }

  private async listTemplates(): Promise<NodeExecutionResult> {
    const data = await this.callApi('/designs');

    return {
      success: true,
      data: {
        templates: data?.result || [],
        metadata: data?._metadata || {},
      },
    };
  }

  private async updateTemplate(context: ExecutionContext): Promise<NodeExecutionResult> {
    const templateId = this.resolveValue(this.config.templateId, context);
    const name = this.resolveValue(this.config.name, context);

    if (!templateId) {
      throw new Error('templateId is required');
    }
    if (!name) {
      throw new Error('name is required');
    }

    const data = await this.callApi(`/designs/${templateId}`, 'PATCH', {
      name,
    });

    return {
      success: true,
      data: {
        template: data,
        message: 'Template updated successfully',
      },
    };
  }

  private async deleteTemplate(context: ExecutionContext): Promise<NodeExecutionResult> {
    const templateId = this.resolveValue(this.config.templateId, context);

    if (!templateId) {
      throw new Error('templateId is required');
    }

    await this.callApi(`/designs/${templateId}`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Template deleted successfully',
      },
    };
  }

  private async createTemplateVersion(context: ExecutionContext): Promise<NodeExecutionResult> {
    const templateId = this.resolveValue(this.config.templateId, context);
    const name = this.resolveValue(this.config.name, context);
    const htmlContent = this.resolveValue(this.config.htmlContent, context) || '';
    const subject = this.resolveValue(this.config.subject, context) || '';
    const plainContent = this.resolveValue(this.config.plainContent, context) || null;
    const active = this.config.active !== false;

    if (!templateId) {
      throw new Error('templateId is required');
    }
    if (!name) {
      throw new Error('name is required');
    }
    if (!htmlContent) {
      throw new Error('htmlContent is required');
    }

    const data = await this.callApi(`/designs/${templateId}/versions`, 'POST', {
      name,
      html_content: htmlContent,
      subject,
      plain_content: plainContent || '',
      active,
    });

    return {
      success: true,
      data: {
        version: data,
        message: 'Template version created successfully',
      },
    };
  }

  private async getTemplateVersion(context: ExecutionContext): Promise<NodeExecutionResult> {
    const templateId = this.resolveValue(this.config.templateId, context);
    const versionId = this.resolveValue(this.config.versionId, context);

    if (!templateId) {
      throw new Error('templateId is required');
    }
    if (!versionId) {
      throw new Error('versionId is required');
    }

    const data = await this.callApi(`/designs/${templateId}/versions/${versionId}`);

    return {
      success: true,
      data: {
        version: data,
      },
    };
  }

  private async listTemplateVersions(context: ExecutionContext): Promise<NodeExecutionResult> {
    const templateId = this.resolveValue(this.config.templateId, context);

    if (!templateId) {
      throw new Error('templateId is required');
    }

    const data = await this.callApi(`/designs/${templateId}/versions`);

    return {
      success: true,
      data: {
        versions: data?.versions || [],
        metadata: data?._metadata || {},
      },
    };
  }

  private async updateTemplateVersion(context: ExecutionContext): Promise<NodeExecutionResult> {
    const templateId = this.resolveValue(this.config.templateId, context);
    const versionId = this.resolveValue(this.config.versionId, context);
    const name = this.resolveValue(this.config.name, context) || null;
    const htmlContent = this.resolveValue(this.config.htmlContent, context) || null;
    const subject = this.resolveValue(this.config.subject, context) || null;
    const active = this.config.active !== false;

    if (!templateId) {
      throw new Error('templateId is required');
    }
    if (!versionId) {
      throw new Error('versionId is required');
    }

    const body: any = {
      active,
    };

    if (name) {
      body.name = name;
    }
    if (htmlContent) {
      body.html_content = htmlContent;
    }
    if (subject) {
      body.subject = subject;
    }

    const data = await this.callApi(
      `/designs/${templateId}/versions/${versionId}`,
      'PATCH',
      body
    );

    return {
      success: true,
      data: {
        version: data,
        message: 'Template version updated successfully',
      },
    };
  }

  private async deleteTemplateVersion(context: ExecutionContext): Promise<NodeExecutionResult> {
    const templateId = this.resolveValue(this.config.templateId, context);
    const versionId = this.resolveValue(this.config.versionId, context);

    if (!templateId) {
      throw new Error('templateId is required');
    }
    if (!versionId) {
      throw new Error('versionId is required');
    }

    await this.callApi(`/designs/${templateId}/versions/${versionId}`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Template version deleted successfully',
      },
    };
  }

  private async activateTemplateVersion(context: ExecutionContext): Promise<NodeExecutionResult> {
    const templateId = this.resolveValue(this.config.templateId, context);
    const versionId = this.resolveValue(this.config.versionId, context);

    if (!templateId) {
      throw new Error('templateId is required');
    }
    if (!versionId) {
      throw new Error('versionId is required');
    }

    const data = await this.callApi(
      `/designs/${templateId}/versions/${versionId}/activate`,
      'POST'
    );

    return {
      success: true,
      data: {
        message: 'Template version activated successfully',
        data,
      },
    };
  }

  // ==================== Sender Identity Operations ====================

  private async createSenderIdentity(context: ExecutionContext): Promise<NodeExecutionResult> {
    const nickname = this.resolveValue(this.config.nickname, context);
    const fromEmail = this.resolveValue(this.config.fromEmail, context);
    const fromName = this.resolveValue(this.config.fromName, context);
    const replyTo = this.resolveValue(this.config.replyTo, context) || fromEmail;
    const address = this.resolveValue(this.config.address, context) || '';
    const address2 = this.resolveValue(this.config.address2, context) || '';
    const city = this.resolveValue(this.config.city, context) || '';
    const state = this.resolveValue(this.config.state, context) || '';
    const zip = this.resolveValue(this.config.zip, context) || '';
    const country = this.resolveValue(this.config.country, context) || '';

    if (!nickname) {
      throw new Error('nickname is required');
    }
    if (!fromEmail) {
      throw new Error('fromEmail is required');
    }
    if (!fromName) {
      throw new Error('fromName is required');
    }

    const data = await this.callApi('/marketing/senders', 'POST', {
      nickname,
      from: {
        email: fromEmail,
        name: fromName,
      },
      reply_to: {
        email: replyTo,
      },
      address,
      address2,
      city,
      state,
      zip,
      country,
    });

    return {
      success: true,
      data: {
        sender: data,
        message: 'Sender identity created successfully',
      },
    };
  }

  private async getSenderIdentity(context: ExecutionContext): Promise<NodeExecutionResult> {
    const senderId = this.resolveValue(this.config.senderId, context);

    if (!senderId) {
      throw new Error('senderId is required');
    }

    const data = await this.callApi(`/marketing/senders/${senderId}`);

    return {
      success: true,
      data: {
        sender: data,
      },
    };
  }

  private async listSenderIdentities(): Promise<NodeExecutionResult> {
    const data = await this.callApi('/marketing/senders');

    return {
      success: true,
      data: {
        senders: data?.result || [],
        metadata: data?._metadata || {},
      },
    };
  }

  private async updateSenderIdentity(context: ExecutionContext): Promise<NodeExecutionResult> {
    const senderId = this.resolveValue(this.config.senderId, context);
    const nickname = this.resolveValue(this.config.nickname, context) || null;
    const fromEmail = this.resolveValue(this.config.fromEmail, context) || null;
    const fromName = this.resolveValue(this.config.fromName, context) || null;
    const replyTo = this.resolveValue(this.config.replyTo, context) || null;

    if (!senderId) {
      throw new Error('senderId is required');
    }

    const body: any = {};

    if (nickname) {
      body.nickname = nickname;
    }
    if (fromEmail) {
      body.from = { email: fromEmail };
    }
    if (fromName) {
      if (!body.from) {
        body.from = {};
      }
      body.from.name = fromName;
    }
    if (replyTo) {
      body.reply_to = { email: replyTo };
    }

    const data = await this.callApi(`/marketing/senders/${senderId}`, 'PATCH', body);

    return {
      success: true,
      data: {
        sender: data,
        message: 'Sender identity updated successfully',
      },
    };
  }

  private async deleteSenderIdentity(context: ExecutionContext): Promise<NodeExecutionResult> {
    const senderId = this.resolveValue(this.config.senderId, context);

    if (!senderId) {
      throw new Error('senderId is required');
    }

    await this.callApi(`/marketing/senders/${senderId}`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Sender identity deleted successfully',
      },
    };
  }

  private async verifySenderIdentity(context: ExecutionContext): Promise<NodeExecutionResult> {
    const senderId = this.resolveValue(this.config.senderId, context);

    if (!senderId) {
      throw new Error('senderId is required');
    }

    const data = await this.callApi(`/marketing/senders/${senderId}/resend_verification`, 'POST');

    return {
      success: true,
      data: {
        message: 'Verification email sent',
        data,
      },
    };
  }

  // ==================== Suppression Operations ====================

  private async addBounces(context: ExecutionContext): Promise<NodeExecutionResult> {
    const emails = this.resolveValue(this.config.emails, context);

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      throw new Error('emails must be a non-empty array');
    }

    const data = await this.callApi('/suppression/bounces', 'POST', {
      emails,
    });

    return {
      success: true,
      data: {
        message: 'Bounces added successfully',
        data,
      },
    };
  }

  private async getBounces(context: ExecutionContext): Promise<NodeExecutionResult> {
    const email = this.resolveValue(this.config.email, context) || '';
    const page = this.config.page || 1;
    const pageSize = Math.min(this.config.pageSize || 100, 500);

    const queryParams: Record<string, string> = {
      page: String(page),
      page_size: String(pageSize),
    };

    if (email) {
      queryParams.email = email;
    }

    const data = await this.callApi('/suppression/bounces', 'GET', null, queryParams);

    return {
      success: true,
      data: {
        bounces: data || [],
        ...(email && { email }),
      },
    };
  }

  private async deleteBounce(context: ExecutionContext): Promise<NodeExecutionResult> {
    const email = this.resolveValue(this.config.email, context);

    if (!email) {
      throw new Error('email is required');
    }

    await this.callApi(`/suppression/bounces/${email}`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Bounce deleted successfully',
      },
    };
  }

  private async addBlocks(context: ExecutionContext): Promise<NodeExecutionResult> {
    const emails = this.resolveValue(this.config.emails, context);

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      throw new Error('emails must be a non-empty array');
    }

    const data = await this.callApi('/suppression/blocks', 'POST', {
      emails,
    });

    return {
      success: true,
      data: {
        message: 'Blocks added successfully',
        data,
      },
    };
  }

  private async getBlocks(context: ExecutionContext): Promise<NodeExecutionResult> {
    const email = this.resolveValue(this.config.email, context) || '';
    const page = this.config.page || 1;
    const pageSize = Math.min(this.config.pageSize || 100, 500);

    const queryParams: Record<string, string> = {
      page: String(page),
      page_size: String(pageSize),
    };

    if (email) {
      queryParams.email = email;
    }

    const data = await this.callApi('/suppression/blocks', 'GET', null, queryParams);

    return {
      success: true,
      data: {
        blocks: data || [],
      },
    };
  }

  private async deleteBlock(context: ExecutionContext): Promise<NodeExecutionResult> {
    const email = this.resolveValue(this.config.email, context);

    if (!email) {
      throw new Error('email is required');
    }

    await this.callApi(`/suppression/blocks/${email}`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Block deleted successfully',
      },
    };
  }

  private async addSpamReports(context: ExecutionContext): Promise<NodeExecutionResult> {
    const emails = this.resolveValue(this.config.emails, context);

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      throw new Error('emails must be a non-empty array');
    }

    const data = await this.callApi('/suppression/spam_reports', 'POST', {
      emails,
    });

    return {
      success: true,
      data: {
        message: 'Spam reports added successfully',
        data,
      },
    };
  }

  private async getSpamReports(context: ExecutionContext): Promise<NodeExecutionResult> {
    const email = this.resolveValue(this.config.email, context) || '';
    const page = this.config.page || 1;
    const pageSize = Math.min(this.config.pageSize || 100, 500);

    const queryParams: Record<string, string> = {
      page: String(page),
      page_size: String(pageSize),
    };

    if (email) {
      queryParams.email = email;
    }

    const data = await this.callApi('/suppression/spam_reports', 'GET', null, queryParams);

    return {
      success: true,
      data: {
        spamReports: data || [],
      },
    };
  }

  private async deleteSpamReport(context: ExecutionContext): Promise<NodeExecutionResult> {
    const email = this.resolveValue(this.config.email, context);

    if (!email) {
      throw new Error('email is required');
    }

    await this.callApi(`/suppression/spam_reports/${email}`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Spam report deleted successfully',
      },
    };
  }

  private async addInvalidEmails(context: ExecutionContext): Promise<NodeExecutionResult> {
    const emails = this.resolveValue(this.config.emails, context);

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      throw new Error('emails must be a non-empty array');
    }

    const data = await this.callApi('/suppression/invalid_emails', 'POST', {
      emails,
    });

    return {
      success: true,
      data: {
        message: 'Invalid emails added successfully',
        data,
      },
    };
  }

  private async getInvalidEmails(context: ExecutionContext): Promise<NodeExecutionResult> {
    const email = this.resolveValue(this.config.email, context) || '';
    const page = this.config.page || 1;
    const pageSize = Math.min(this.config.pageSize || 100, 500);

    const queryParams: Record<string, string> = {
      page: String(page),
      page_size: String(pageSize),
    };

    if (email) {
      queryParams.email = email;
    }

    const data = await this.callApi('/suppression/invalid_emails', 'GET', null, queryParams);

    return {
      success: true,
      data: {
        invalidEmails: data || [],
      },
    };
  }

  private async deleteInvalidEmail(context: ExecutionContext): Promise<NodeExecutionResult> {
    const email = this.resolveValue(this.config.email, context);

    if (!email) {
      throw new Error('email is required');
    }

    await this.callApi(`/suppression/invalid_emails/${email}`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Invalid email deleted successfully',
      },
    };
  }

  // ==================== Custom Field Operations ====================

  private async createCustomField(context: ExecutionContext): Promise<NodeExecutionResult> {
    const name = this.resolveValue(this.config.name, context);
    const fieldType = this.config.fieldType || 'text';

    if (!name) {
      throw new Error('name is required');
    }

    const data = await this.callApi('/marketing/custom_fields', 'POST', {
      name,
      field_type: fieldType,
    });

    return {
      success: true,
      data: {
        customField: data,
        message: 'Custom field created successfully',
      },
    };
  }

  private async listCustomFields(): Promise<NodeExecutionResult> {
    const data = await this.callApi('/marketing/custom_fields');

    return {
      success: true,
      data: {
        customFields: data?.result || [],
      },
    };
  }

  private async getCustomField(context: ExecutionContext): Promise<NodeExecutionResult> {
    const customFieldId = this.resolveValue(this.config.customFieldId, context);

    if (!customFieldId) {
      throw new Error('customFieldId is required');
    }

    const data = await this.callApi(`/marketing/custom_fields/${customFieldId}`);

    return {
      success: true,
      data: {
        customField: data,
      },
    };
  }

  private async deleteCustomField(context: ExecutionContext): Promise<NodeExecutionResult> {
    const customFieldId = this.resolveValue(this.config.customFieldId, context);

    if (!customFieldId) {
      throw new Error('customFieldId is required');
    }

    await this.callApi(`/marketing/custom_fields/${customFieldId}`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Custom field deleted successfully',
      },
    };
  }

  private async reserveCustomField(context: ExecutionContext): Promise<NodeExecutionResult> {
    const name = this.resolveValue(this.config.name, context);

    if (!name) {
      throw new Error('name is required');
    }

    const data = await this.callApi('/marketing/custom_fields/reserve', 'POST', {
      name,
    });

    return {
      success: true,
      data: {
        customField: data,
        message: 'Custom field reserved successfully',
      },
    };
  }

  // ==================== API Key Operations ====================

  private async createApiKey(context: ExecutionContext): Promise<NodeExecutionResult> {
    const name = this.resolveValue(this.config.name, context);
    const scopes = this.config.scopes || [];
    const sample = this.config.sample !== false;

    if (!name) {
      throw new Error('name is required');
    }

    const body: any = {
      name,
      sample,
    };

    if (scopes.length > 0) {
      body.scopes = scopes;
    }

    const data = await this.callApi('/api_keys', 'POST', body);

    return {
      success: true,
      data: {
        apiKey: data,
        message: 'API key created successfully',
      },
    };
  }

  private async listApiKeys(): Promise<NodeExecutionResult> {
    const data = await this.callApi('/api_keys');

    return {
      success: true,
      data: {
        apiKeys: data?.result || [],
        metadata: data?._metadata || {},
      },
    };
  }

  private async getApiKey(context: ExecutionContext): Promise<NodeExecutionResult> {
    const apiKeyId = this.resolveValue(this.config.apiKeyId, context);

    if (!apiKeyId) {
      throw new Error('apiKeyId is required');
    }

    const data = await this.callApi(`/api_keys/${apiKeyId}`);

    return {
      success: true,
      data: {
        apiKey: data,
      },
    };
  }

  private async updateApiKey(context: ExecutionContext): Promise<NodeExecutionResult> {
    const apiKeyId = this.resolveValue(this.config.apiKeyId, context);
    const name = this.resolveValue(this.config.name, context);

    if (!apiKeyId) {
      throw new Error('apiKeyId is required');
    }
    if (!name) {
      throw new Error('name is required');
    }

    const data = await this.callApi(`/api_keys/${apiKeyId}`, 'PUT', {
      name,
    });

    return {
      success: true,
      data: {
        apiKey: data,
        message: 'API key updated successfully',
      },
    };
  }

  private async deleteApiKey(context: ExecutionContext): Promise<NodeExecutionResult> {
    const apiKeyId = this.resolveValue(this.config.apiKeyId, context);

    if (!apiKeyId) {
      throw new Error('apiKeyId is required');
    }

    await this.callApi(`/api_keys/${apiKeyId}`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'API key deleted successfully',
      },
    };
  }

  // ==================== Statistics Operations ====================

  private async getGlobalStats(context: ExecutionContext): Promise<NodeExecutionResult> {
    const startDate = this.resolveValue(this.config.startDate, context) || '';
    const endDate = this.resolveValue(this.config.endDate, context) || '';
    const aggregatedBy = this.config.aggregatedBy || 'day';

    const queryParams: Record<string, string> = {
      aggregated_by: aggregatedBy,
    };

    if (startDate) {
      queryParams.start_date = startDate;
    }
    if (endDate) {
      queryParams.end_date = endDate;
    }

    const data = await this.callApi('/messages/stats', 'GET', null, queryParams);

    return {
      success: true,
      data: {
        stats: data,
      },
    };
  }

  private async getEmailStats(context: ExecutionContext): Promise<NodeExecutionResult> {
    const startDate = this.resolveValue(this.config.startDate, context) || '';
    const endDate = this.resolveValue(this.config.endDate, context) || '';
    const aggregatedBy = this.config.aggregatedBy || 'day';
    const categories = this.config.categories || [];

    const queryParams: Record<string, string> = {
      aggregated_by: aggregatedBy,
    };

    if (startDate) {
      queryParams.start_date = startDate;
    }
    if (endDate) {
      queryParams.end_date = endDate;
    }
    if (categories.length > 0) {
      queryParams.categories = categories.join(',');
    }

    const data = await this.callApi('/categories/stats', 'GET', null, queryParams);

    return {
      success: true,
      data: {
        stats: data,
      },
    };
  }

  private async getBrowserStats(context: ExecutionContext): Promise<NodeExecutionResult> {
    const startDate = this.resolveValue(this.config.startDate, context) || '';
    const endDate = this.resolveValue(this.config.endDate, context) || '';
    const aggregatedBy = this.config.aggregatedBy || 'day';

    const queryParams: Record<string, string> = {
      aggregated_by: aggregatedBy,
      limit_browsers: '10',
    };

    if (startDate) {
      queryParams.start_date = startDate;
    }
    if (endDate) {
      queryParams.end_date = endDate;
    }

    const data = await this.callApi('/browsers/stats', 'GET', null, queryParams);

    return {
      success: true,
      data: {
        stats: data,
      },
    };
  }

  private async getDeviceStats(context: ExecutionContext): Promise<NodeExecutionResult> {
    const startDate = this.resolveValue(this.config.startDate, context) || '';
    const endDate = this.resolveValue(this.config.endDate, context) || '';

    const queryParams: Record<string, string> = {};

    if (startDate) {
      queryParams.start_date = startDate;
    }
    if (endDate) {
      queryParams.end_date = endDate;
    }

    const data = await this.callApi('/devices/stats', 'GET', null, queryParams);

    return {
      success: true,
      data: {
        stats: data,
      },
    };
  }

  // ==================== Settings Operations ====================

  private async getMailSettings(): Promise<NodeExecutionResult> {
    const data = await this.callApi('/mail_settings');

    return {
      success: true,
      data: {
        mailSettings: data,
      },
    };
  }

  private async updateMailSettings(context: ExecutionContext): Promise<NodeExecutionResult> {
    const settingType = this.config.settingType;
    const enabled = this.config.enabled !== false;

    if (!settingType) {
      throw new Error('settingType is required');
    }

    const data = await this.callApi(`/mail_settings/${settingType}`, 'PATCH', {
      enabled,
    });

    return {
      success: true,
      data: {
        message: 'Mail settings updated successfully',
        data,
      },
    };
  }

  private async getTrackingSettings(): Promise<NodeExecutionResult> {
    const data = await this.callApi('/tracking_settings');

    return {
      success: true,
      data: {
        trackingSettings: data,
      },
    };
  }

  private async updateTrackingSettings(context: ExecutionContext): Promise<NodeExecutionResult> {
    const settingType = this.config.settingType;
    const enabled = this.config.enabled !== false;

    if (!settingType) {
      throw new Error('settingType is required');
    }

    const data = await this.callApi(`/tracking_settings/${settingType}`, 'PATCH', {
      enabled,
    });

    return {
      success: true,
      data: {
        message: 'Tracking settings updated successfully',
        data,
      },
    };
  }

  // ==================== Static Helper Methods ====================

  static readonly EmailStatus = {
    Delivered: 'delivered',
    Opened: 'open',
    Clicked: 'click',
    Bounced: 'bounce',
    Deferred: 'deferred',
    Dropped: 'dropped',
    Processed: 'processed',
  } as const;

  static readonly FieldType = {
    Text: 'text',
    Number: 'number',
    Date: 'date',
  } as const;

  static readonly AggregatedBy = {
    Day: 'day',
    Week: 'week',
    Month: 'month',
  } as const;

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Format SendGrid API error
   */
  static formatError(error: any): string {
    if (error.response?.data?.errors) {
      return error.response.data.errors.map((e: any) => e.message).join(', ');
    }
    return error.message || 'Unknown SendGrid API error';
  }

  /**
   * Sanitize email content
   */
  static sanitizeContent(content: string): string {
    return content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '');
  }
}
