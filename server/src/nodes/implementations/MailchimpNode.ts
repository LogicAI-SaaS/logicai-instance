import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * MailchimpNode - Mailchimp Email Marketing API Integration
 *
 * Provides comprehensive integration with Mailchimp API including:
 * - Audiences: Create, update, delete, manage audience lists
 * - Members: Add, update, delete, search, subscribe/unsubscribe members
 * - Campaigns: Create, update, delete, send, schedule, test campaigns
 * - Templates: Create, update, delete, default templates
 * - Reports: Campaign reports, open/click stats, subscriber activity
 * - Lists: Manage list details, merge fields, segments
 * - Segments: Create, update, delete, static and dynamic segments
 * - Tags: Manage member tags
 * - Merge Fields: Custom fields for audience members
 * - Interest Categories: Groups and interests for members
 * - Ecommerce Stores: Products, orders, customers, carts
 * - Automations: Email automation workflows
 * - Conversations: Email conversations with subscribers
 * - Batch Operations: Batch requests for multiple operations
 * - Ping: API health check
 *
 * Authentication: API Key
 * API Docs: https://mailchimp.com/developer/marketing/api/
 */
export class MailchimpNode extends BaseNode {
  readonly apiKey: string;
  readonly dataCenter: string;
  readonly apiUrl: string;

  constructor(id: string, name: string, config: any) {
    super(id, name, config);
    this.apiKey = config.apiKey || '';

    if (!this.apiKey) {
      throw new Error('Mailchimp API key is required');
    }

    // Extract data center from API key (format: xxxxxxxxxxxx-usxx)
    const match = this.apiKey.match(/-(.+)$/);
    if (!match) {
      throw new Error('Invalid API key format. Expected format: xxxxxxxxxxxx-usxx');
    }

    this.dataCenter = match[1];
    this.apiUrl = `https://${this.dataCenter}.api.mailchimp.com/3.0`;
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
    return 'mailchimp';
  }

  getIcon(): string {
    return '🐵';
  }

  getCategory(): string {
    return 'marketing';
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    const operation = this.config.operation || 'addMember';

    try {
      switch (operation) {
        // Audience Operations
        case 'listAudiences':
          return await this.listAudiences(context);
        case 'getAudience':
          return await this.getAudience(context);
        case 'createAudience':
          return await this.createAudience(context);
        case 'updateAudience':
          return await this.updateAudience(context);
        case 'deleteAudience':
          return await this.deleteAudience(context);

        // Member Operations
        case 'addMember':
          return await this.addMember(context);
        case 'getMember':
          return await this.getMember(context);
        case 'listMembers':
          return await this.listMembers(context);
        case 'updateMember':
          return await this.updateMember(context);
        case 'deleteMember':
          return await this.deleteMember(context);
        case 'subscribeMember':
          return await this.subscribeMember(context);
        case 'unsubscribeMember':
          return await this.unsubscribeMember(context);
        case 'searchMembers':
          return await this.searchMembers(context);

        // Campaign Operations
        case 'createCampaign':
          return await this.createCampaign(context);
        case 'getCampaign':
          return await this.getCampaign(context);
        case 'listCampaigns':
          return await this.listCampaigns(context);
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
        case 'sendTestCampaign':
          return await this.sendTestCampaign(context);
        case 'getCampaignContent':
          return await this.getCampaignContent(context);
        case 'updateCampaignContent':
          return await this.updateCampaignContent(context);

        // Template Operations
        case 'listTemplates':
          return await this.listTemplates(context);
        case 'getTemplate':
          return await this.getTemplate(context);
        case 'createTemplate':
          return await this.createTemplate(context);
        case 'updateTemplate':
          return await this.updateTemplate(context);
        case 'deleteTemplate':
          return await this.deleteTemplate(context);
        case 'getDefaultTemplateContent':
          return await this.getDefaultTemplateContent(context);

        // Report Operations
        case 'getCampaignReport':
          return await this.getCampaignReport(context);
        case 'listEmailReports':
          return await this.listEmailReports(context);
        case 'getEmailReport':
          return await this.getEmailReport(context);
        case 'getSubscriberActivity':
          return await this.getSubscriberActivity(context);

        // Segment Operations
        case 'listSegments':
          return await this.listSegments(context);
        case 'getSegment':
          return await this.getSegment(context);
        case 'createSegment':
          return await this.createSegment(context);
        case 'updateSegment':
          return await this.updateSegment(context);
        case 'deleteSegment':
          return await this.deleteSegment(context);

        // Merge Field Operations
        case 'listMergeFields':
          return await this.listMergeFields(context);
        case 'getMergeField':
          return await this.getMergeField(context);
        case 'createMergeField':
          return await this.createMergeField(context);
        case 'updateMergeField':
          return await this.updateMergeField(context);
        case 'deleteMergeField':
          return await this.deleteMergeField(context);

        // Tag Operations
        case 'listTags':
          return await this.listTags(context);
        case 'addTag':
          return await this.addTag(context);
        case 'deleteTag':
          return await this.deleteTag(context);

        // Interest Category Operations
        case 'listInterestCategories':
          return await this.listInterestCategories(context);
        case 'getInterestCategory':
          return await this.getInterestCategory(context);
        case 'createInterestCategory':
          return await this.createInterestCategory(context);
        case 'updateInterestCategory':
          return await this.updateInterestCategory(context);
        case 'deleteInterestCategory':
          return await this.deleteInterestCategory(context);
        case 'listInterests':
          return await this.listInterests(context);
        case 'getInterest':
          return await this.getInterest(context);
        case 'createInterest':
          return await this.createInterest(context);
        case 'updateInterest':
          return await this.updateInterest(context);
        case 'deleteInterest':
          return await this.deleteInterest(context);

        // Ecommerce Operations
        case 'listStores':
          return await this.listStores();
        case 'getStore':
          return await this.getStore(context);
        case 'createStore':
          return await this.createStore(context);
        case 'updateStore':
          return await this.updateStore(context);
        case 'deleteStore':
          return await this.deleteStore(context);
        case 'listProducts':
          return await this.listProducts(context);
        case 'getProduct':
          return await this.getProduct(context);
        case 'createProduct':
          return await this.createProduct(context);
        case 'updateProduct':
          return await this.updateProduct(context);
        case 'deleteProduct':
          return await this.deleteProduct(context);
        case 'listOrders':
          return await this.listOrders(context);
        case 'getOrder':
          return await this.getOrder(context);
        case 'createOrder':
          return await this.createOrder(context);
        case 'updateOrder':
          return await this.updateOrder(context);
        case 'deleteOrder':
          return await this.deleteOrder(context);

        // Automation Operations
        case 'listAutomations':
          return await this.listAutomations();
        case 'getAutomation':
          return await this.getAutomation(context);
        case 'startAutomation':
          return await this.startAutomation(context);
        case 'pauseAutomation':
          return await this.pauseAutomation(context);
        case 'listAutomationEmails':
          return await this.listAutomationEmails(context);
        case 'getAutomationEmail':
          return await this.getAutomationEmail(context);
        case 'pauseAutomationEmail':
          return await this.pauseAutomationEmail(context);
        case 'startAutomationEmail':
          return await this.startAutomationEmail(context);

        // Batch Operations
        case 'createBatchOperation':
          return await this.createBatchOperation(context);
        case 'getBatchOperation':
          return await this.getBatchOperation(context);
        case 'listBatchOperations':
          return await this.listBatchOperations();

        // Ping Operations
        case 'ping':
          return await this.ping();

        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || `Failed to execute Mailchimp operation: ${operation}`,
      };
    }
  }

  private getAuthHeaders(): Record<string, string> {
    const credentials = Buffer.from(`anystring:${this.apiKey}`).toString('base64');
    return {
      'Authorization': `Basic ${credentials}`,
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
      let errorMessage = `Mailchimp API error: ${response.status} ${response.statusText}`;

      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.detail) {
          errorMessage = errorJson.detail;
        } else if (errorJson.errors) {
          errorMessage = errorJson.errors.map((e: any) => e.message || e.detail).join(', ');
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

  // ==================== Audience Operations ====================

  private async listAudiences(context: ExecutionContext): Promise<NodeExecutionResult> {
    const count = Math.min(this.config.count || 10, 1000);
    const offset = this.config.offset || 0;

    const data = await this.callApi('/lists', 'GET', null, {
      count: String(count),
      offset: String(offset),
    });

    return {
      success: true,
      data: {
        audiences: data.lists || [],
        totalItems: data.total_items || 0,
      },
    };
  }

  private async getAudience(context: ExecutionContext): Promise<NodeExecutionResult> {
    const listId = this.resolveValue(this.config.listId, context);

    if (!listId) {
      throw new Error('listId is required');
    }

    const data = await this.callApi(`/lists/${listId}`);

    return {
      success: true,
      data: data,
    };
  }

  private async createAudience(context: ExecutionContext): Promise<NodeExecutionResult> {
    const name = this.resolveValue(this.config.name, context);
    const email = this.resolveValue(this.config.email, context) || null;
    const permissionReminder = this.resolveValue(this.config.permissionReminder, context) || null;
    const contact = this.config.contact || {};
    const campaignDefaults = this.config.campaignDefaults || {};

    if (!name) {
      throw new Error('name is required');
    }

    const body: any = {
      name,
    };

    if (email) {
      body.email_type_option = true;
      body.permission_reminder = permissionReminder;
      if (contact) {
        body.contact = contact;
      }
      if (campaignDefaults) {
        body.campaign_defaults = campaignDefaults;
      }
    }

    const data = await this.callApi('/lists', 'POST', body);

    return {
      success: true,
      data: {
        audience: data,
        message: 'Audience created successfully',
      },
    };
  }

  private async updateAudience(context: ExecutionContext): Promise<NodeExecutionResult> {
    const listId = this.resolveValue(this.config.listId, context);
    const name = this.resolveValue(this.config.name, context) || null;
    const campaignDefaults = this.config.campaignDefaults || null;

    if (!listId) {
      throw new Error('listId is required');
    }

    const body: any = {};

    if (name) {
      body.name = name;
    }
    if (campaignDefaults) {
      body.campaign_defaults = campaignDefaults;
    }

    const data = await this.callApi(`/lists/${listId}`, 'PATCH', body);

    return {
      success: true,
      data: {
        audience: data,
        message: 'Audience updated successfully',
      },
    };
  }

  private async deleteAudience(context: ExecutionContext): Promise<NodeExecutionResult> {
    const listId = this.resolveValue(this.config.listId, context);

    if (!listId) {
      throw new Error('listId is required');
    }

    await this.callApi(`/lists/${listId}`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Audience deleted successfully',
      },
    };
  }

  // ==================== Member Operations ====================

  private async addMember(context: ExecutionContext): Promise<NodeExecutionResult> {
    const listId = this.resolveValue(this.config.listId, context);
    const email = this.resolveValue(this.config.email, context);
    const status = this.config.status || 'subscribed';
    const firstName = this.resolveValue(this.config.firstName, context) || null;
    const lastName = this.resolveValue(this.config.lastName, context) || null;
    const tags = this.config.tags || [];
    const mergeFields = this.config.mergeFields || {};

    if (!listId) {
      throw new Error('listId is required');
    }
    if (!email) {
      throw new Error('email is required');
    }

    const body: any = {
      email_address: email,
      status,
    };

    if (firstName || lastName) {
      body.merge_fields = {
        ...(firstName && { FNAME: firstName }),
        ...(lastName && { LNAME: lastName }),
        ...mergeFields,
      };
    }

    if (tags.length > 0) {
      body.tags = tags;
    }

    const data = await this.callApi(`/lists/${listId}/members`, 'POST', body);

    return {
      success: true,
      data: {
        member: data,
        message: 'Member added successfully',
      },
    };
  }

  private async getMember(context: ExecutionContext): Promise<NodeExecutionResult> {
    const listId = this.resolveValue(this.config.listId, context);
    const subscriberHash = this.resolveValue(this.config.subscriberHash, context);
    const email = this.resolveValue(this.config.email, context);

    if (!listId) {
      throw new Error('listId is required');
    }
    if (!subscriberHash && !email) {
      throw new Error('Either subscriberHash or email is required');
    }

    // Generate subscriber hash from email if not provided
    const hash =
      subscriberHash || this.generateSubscriberHash(email);

    const data = await this.callApi(`/lists/${listId}/members/${hash}`);

    return {
      success: true,
      data: {
        member: data,
      },
    };
  }

  private async listMembers(context: ExecutionContext): Promise<NodeExecutionResult> {
    const listId = this.resolveValue(this.config.listId, context);
    const status = this.config.status || '';
    const count = Math.min(this.config.count || 10, 1000);
    const offset = this.config.offset || 0;

    if (!listId) {
      throw new Error('listId is required');
    }

    const queryParams: Record<string, string> = {
      count: String(count),
      offset: String(offset),
    };

    if (status) {
      queryParams.status = status;
    }

    const data = await this.callApi(`/lists/${listId}/members`, 'GET', null, queryParams);

    return {
      success: true,
      data: {
        members: data.members || [],
        totalItems: data.total_items || 0,
      },
    };
  }

  private async updateMember(context: ExecutionContext): Promise<NodeExecutionResult> {
    const listId = this.resolveValue(this.config.listId, context);
    const email = this.resolveValue(this.config.email, context);
    const status = this.config.status || null;
    const firstName = this.resolveValue(this.config.firstName, context) || null;
    const lastName = this.resolveValue(this.config.lastName, context) || null;
    const mergeFields = this.config.mergeFields || null;

    if (!listId) {
      throw new Error('listId is required');
    }
    if (!email) {
      throw new Error('email is required');
    }

    const subscriberHash = this.generateSubscriberHash(email);
    const body: any = {};

    if (status) {
      body.status = status;
    }
    if (firstName || lastName || mergeFields) {
      body.merge_fields = {
        ...(firstName && { FNAME: firstName }),
        ...(lastName && { LNAME: lastName }),
        ...(mergeFields || {}),
      };
    }

    const data = await this.callApi(`/lists/${listId}/members/${subscriberHash}`, 'PATCH', body);

    return {
      success: true,
      data: {
        member: data,
        message: 'Member updated successfully',
      },
    };
  }

  private async deleteMember(context: ExecutionContext): Promise<NodeExecutionResult> {
    const listId = this.resolveValue(this.config.listId, context);
    const email = this.resolveValue(this.config.email, context);

    if (!listId) {
      throw new Error('listId is required');
    }
    if (!email) {
      throw new Error('email is required');
    }

    const subscriberHash = this.generateSubscriberHash(email);
    await this.callApi(`/lists/${listId}/members/${subscriberHash}`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Member deleted successfully',
      },
    };
  }

  private async subscribeMember(context: ExecutionContext): Promise<NodeExecutionResult> {
    const listId = this.resolveValue(this.config.listId, context);
    const email = this.resolveValue(this.config.email, context);

    if (!listId) {
      throw new Error('listId is required');
    }
    if (!email) {
      throw new Error('email is required');
    }

    const subscriberHash = this.generateSubscriberHash(email);
    const data = await this.callApi(`/lists/${listId}/members/${subscriberHash}`, 'PUT', {
      email_address: email,
      status: 'subscribed',
    });

    return {
      success: true,
      data: {
        member: data,
        message: 'Member subscribed successfully',
      },
    };
  }

  private async unsubscribeMember(context: ExecutionContext): Promise<NodeExecutionResult> {
    const listId = this.resolveValue(this.config.listId, context);
    const email = this.resolveValue(this.config.email, context);

    if (!listId) {
      throw new Error('listId is required');
    }
    if (!email) {
      throw new Error('email is required');
    }

    const subscriberHash = this.generateSubscriberHash(email);
    const data = await this.callApi(`/lists/${listId}/members/${subscriberHash}`, 'PATCH', {
      status: 'unsubscribed',
    });

    return {
      success: true,
      data: {
        member: data,
        message: 'Member unsubscribed successfully',
      },
    };
  }

  private async searchMembers(context: ExecutionContext): Promise<NodeExecutionResult> {
    const query = this.resolveValue(this.config.query, context);
    const listId = this.resolveValue(this.config.listId, context) || '';

    if (!query) {
      throw new Error('query is required');
    }

    const queryParams: Record<string, string> = {
      query,
    };

    if (listId) {
      queryParams.list_id = listId;
    }

    const data = await this.callApi('/search-members', 'GET', null, queryParams);

    return {
      success: true,
      data: {
        members: data?.exact_matches?.members || [],
        totalItems: data?.exact_matches?.total_items || 0,
      },
    };
  }

  // ==================== Campaign Operations ====================

  private async createCampaign(context: ExecutionContext): Promise<NodeExecutionResult> {
    const type = this.config.type || 'regular';
    const recipients = this.config.recipients || null;
    const settings = this.config.settings || null;

    if (!recipients) {
      throw new Error('recipients are required');
    }

    const body: any = {
      type,
      recipients,
    };

    if (settings) {
      body.settings = settings;
    }

    const data = await this.callApi('/campaigns', 'POST', body);

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

    const data = await this.callApi(`/campaigns/${campaignId}`);

    return {
      success: true,
      data: {
        campaign: data,
      },
    };
  }

  private async listCampaigns(context: ExecutionContext): Promise<NodeExecutionResult> {
    const count = Math.min(this.config.count || 10, 1000);
    const offset = this.config.offset || 0;
    const status = this.config.status || '';

    const queryParams: Record<string, string> = {
      count: String(count),
      offset: String(offset),
    };

    if (status) {
      queryParams.status = status;
    }

    const data = await this.callApi('/campaigns', 'GET', null, queryParams);

    return {
      success: true,
      data: {
        campaigns: data.campaigns || [],
        totalItems: data.total_items || 0,
      },
    };
  }

  private async updateCampaign(context: ExecutionContext): Promise<NodeExecutionResult> {
    const campaignId = this.resolveValue(this.config.campaignId, context);
    const settings = this.config.settings || null;

    if (!campaignId) {
      throw new Error('campaignId is required');
    }

    const body: any = {};
    if (settings) {
      body.settings = settings;
    }

    const data = await this.callApi(`/campaigns/${campaignId}`, 'PATCH', body);

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

    await this.callApi(`/campaigns/${campaignId}`, 'DELETE');

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

    const data = await this.callApi(`/campaigns/${campaignId}/actions/send`, 'POST');

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
    const scheduleTime = this.resolveValue(this.config.scheduleTime, context);
    const timewarp = this.config.timewarp || false;

    if (!campaignId) {
      throw new Error('campaignId is required');
    }
    if (!scheduleTime) {
      throw new Error('scheduleTime is required');
    }

    const body: any = {
      schedule_time: scheduleTime,
    };

    if (timewarp) {
      body.timewarp = true;
    }

    const data = await this.callApi(`/campaigns/${campaignId}/actions/schedule`, 'POST', body);

    return {
      success: true,
      data: {
        message: 'Campaign scheduled successfully',
        data,
      },
    };
  }

  private async unscheduleCampaign(context: ExecutionContext): Promise<NodeExecutionResult> {
    const campaignId = this.resolveValue(this.config.campaignId, context);

    if (!campaignId) {
      throw new Error('campaignId is required');
    }

    const data = await this.callApi(
      `/campaigns/${campaignId}/actions/unschedule`,
      'POST'
    );

    return {
      success: true,
      data: {
        message: 'Campaign unscheduled successfully',
        data,
      },
    };
  }

  private async sendTestCampaign(context: ExecutionContext): Promise<NodeExecutionResult> {
    const campaignId = this.resolveValue(this.config.campaignId, context);
    const testEmails = this.resolveValue(this.config.testEmails, context);
    const sendType = this.config.sendType || 'html';

    if (!campaignId) {
      throw new Error('campaignId is required');
    }
    if (!testEmails || !Array.isArray(testEmails) || testEmails.length === 0) {
      throw new Error('testEmails must be a non-empty array');
    }

    const data = await this.callApi(`/campaigns/${campaignId}/actions/test`, 'POST', {
      test_emails: testEmails,
      send_type: sendType,
    });

    return {
      success: true,
      data: {
        message: 'Test campaign sent successfully',
        data,
      },
    };
  }

  private async getCampaignContent(context: ExecutionContext): Promise<NodeExecutionResult> {
    const campaignId = this.resolveValue(this.config.campaignId, context);

    if (!campaignId) {
      throw new Error('campaignId is required');
    }

    const data = await this.callApi(`/campaigns/${campaignId}/content`);

    return {
      success: true,
      data: {
        content: data,
      },
    };
  }

  private async updateCampaignContent(context: ExecutionContext): Promise<NodeExecutionResult> {
    const campaignId = this.resolveValue(this.config.campaignId, context);
    const html = this.resolveValue(this.config.html, context) || null;
    const plainText = this.resolveValue(this.config.plainText, context) || null;
    const url = this.resolveValue(this.config.url, context) || null;

    if (!campaignId) {
      throw new Error('campaignId is required');
    }

    const body: any = {};

    if (html) {
      body.html = html;
    }
    if (plainText) {
      body.plain_text = plainText;
    }
    if (url) {
      body.url = url;
    }

    const data = await this.callApi(`/campaigns/${campaignId}/content`, 'PUT', body);

    return {
      success: true,
      data: {
        content: data,
        message: 'Campaign content updated successfully',
      },
    };
  }

  // ==================== Template Operations ====================

  private async listTemplates(context: ExecutionContext): Promise<NodeExecutionResult> {
    const count = Math.min(this.config.count || 10, 1000);
    const offset = this.config.offset || 0;
    const type = this.config.type || '';

    const queryParams: Record<string, string> = {
      count: String(count),
      offset: String(offset),
    };

    if (type) {
      queryParams.type = type;
    }

    const data = await this.callApi('/templates', 'GET', null, queryParams);

    return {
      success: true,
      data: {
        templates: data.templates || [],
        totalItems: data.total_items || 0,
      },
    };
  }

  private async getTemplate(context: ExecutionContext): Promise<NodeExecutionResult> {
    const templateId = this.resolveValue(this.config.templateId, context);

    if (!templateId) {
      throw new Error('templateId is required');
    }

    const data = await this.callApi(`/templates/${templateId}`);

    return {
      success: true,
      data: {
        template: data,
      },
    };
  }

  private async createTemplate(context: ExecutionContext): Promise<NodeExecutionResult> {
    const name = this.resolveValue(this.config.name, context);
    const html = this.resolveValue(this.config.html, context) || null;
    const folderId = this.resolveValue(this.config.folderId, context) || null;

    if (!name) {
      throw new Error('name is required');
    }

    const body: any = {
      name,
    };

    if (html) {
      body.html = html;
    }
    if (folderId) {
      body.folder_id = folderId;
    }

    const data = await this.callApi('/templates', 'POST', body);

    return {
      success: true,
      data: {
        template: data,
        message: 'Template created successfully',
      },
    };
  }

  private async updateTemplate(context: ExecutionContext): Promise<NodeExecutionResult> {
    const templateId = this.resolveValue(this.config.templateId, context);
    const name = this.resolveValue(this.config.name, context) || null;
    const html = this.resolveValue(this.config.html, context) || null;

    if (!templateId) {
      throw new Error('templateId is required');
    }

    const body: any = {};

    if (name) {
      body.name = name;
    }
    if (html) {
      body.html = html;
    }

    const data = await this.callApi(`/templates/${templateId}`, 'PATCH', body);

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

    await this.callApi(`/templates/${templateId}`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Template deleted successfully',
      },
    };
  }

  private async getDefaultTemplateContent(context: ExecutionContext): Promise<NodeExecutionResult> {
    const templateId = this.resolveValue(this.config.templateId, context);

    if (!templateId) {
      throw new Error('templateId is required');
    }

    const data = await this.callApi(`/templates/${templateId}/default-content`);

    return {
      success: true,
      data: {
        content: data,
      },
    };
  }

  // ==================== Report Operations ====================

  private async getCampaignReport(context: ExecutionContext): Promise<NodeExecutionResult> {
    const campaignId = this.resolveValue(this.config.campaignId, context);

    if (!campaignId) {
      throw new Error('campaignId is required');
    }

    const data = await this.callApi(`/reports/${campaignId}`);

    return {
      success: true,
      data: {
        report: data,
      },
    };
  }

  private async listEmailReports(context: ExecutionContext): Promise<NodeExecutionResult> {
    const count = Math.min(this.config.count || 10, 1000);
    const offset = this.config.offset || 0;

    const data = await this.callApi('/reports', 'GET', null, {
      count: String(count),
      offset: String(offset),
    });

    return {
      success: true,
      data: {
        reports: data.reports || [],
        totalItems: data.total_items || 0,
      },
    };
  }

  private async getEmailReport(context: ExecutionContext): Promise<NodeExecutionResult> {
    const campaignId = this.resolveValue(this.config.campaignId, context);

    if (!campaignId) {
      throw new Error('campaignId is required');
    }

    const data = await this.callApi(`/reports/${campaignId}`);

    return {
      success: true,
      data: {
        report: data,
      },
    };
  }

  private async getSubscriberActivity(context: ExecutionContext): Promise<NodeExecutionResult> {
    const campaignId = this.resolveValue(this.config.campaignId, context);
    const subscribers = this.resolveValue(this.config.subscribers, context);

    if (!campaignId) {
      throw new Error('campaignId is required');
    }
    if (!subscribers || !Array.isArray(subscribers) || subscribers.length === 0) {
      throw new Error('subscribers must be a non-empty array');
    }

    const data = await this.callApi(`/reports/${campaignId}/subscriber-activity`, 'POST', {
      subscribers,
    });

    return {
      success: true,
      data: {
        activities: data.subscriber_activities || [],
      },
    };
  }

  // ==================== Segment Operations ====================

  private async listSegments(context: ExecutionContext): Promise<NodeExecutionResult> {
    const listId = this.resolveValue(this.config.listId, context);
    const count = Math.min(this.config.count || 10, 1000);
    const offset = this.config.offset || 0;

    if (!listId) {
      throw new Error('listId is required');
    }

    const data = await this.callApi(`/lists/${listId}/segments`, 'GET', null, {
      count: String(count),
      offset: String(offset),
    });

    return {
      success: true,
      data: {
        segments: data.segments || [],
        totalItems: data.total_items || 0,
      },
    };
  }

  private async getSegment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const listId = this.resolveValue(this.config.listId, context);
    const segmentId = this.resolveValue(this.config.segmentId, context);

    if (!listId) {
      throw new Error('listId is required');
    }
    if (!segmentId) {
      throw new Error('segmentId is required');
    }

    const data = await this.callApi(`/lists/${listId}/segments/${segmentId}`);

    return {
      success: true,
      data: {
        segment: data,
      },
    };
  }

  private async createSegment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const listId = this.resolveValue(this.config.listId, context);
    const name = this.resolveValue(this.config.name, context);
    const segmentType = this.config.segmentType || 'static';
    const options = this.config.options || null;

    if (!listId) {
      throw new Error('listId is required');
    }
    if (!name) {
      throw new Error('name is required');
    }

    const body: any = {
      name,
      type: segmentType,
    };

    if (options) {
      body.options = options;
    }

    const data = await this.callApi(`/lists/${listId}/segments`, 'POST', body);

    return {
      success: true,
      data: {
        segment: data,
        message: 'Segment created successfully',
      },
    };
  }

  private async updateSegment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const listId = this.resolveValue(this.config.listId, context);
    const segmentId = this.resolveValue(this.config.segmentId, context);
    const name = this.resolveValue(this.config.name, context) || null;
    const options = this.config.options || null;

    if (!listId) {
      throw new Error('listId is required');
    }
    if (!segmentId) {
      throw new Error('segmentId is required');
    }

    const body: any = {};

    if (name) {
      body.name = name;
    }
    if (options) {
      body.options = options;
    }

    const data = await this.callApi(`/lists/${listId}/segments/${segmentId}`, 'PATCH', body);

    return {
      success: true,
      data: {
        segment: data,
        message: 'Segment updated successfully',
      },
    };
  }

  private async deleteSegment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const listId = this.resolveValue(this.config.listId, context);
    const segmentId = this.resolveValue(this.config.segmentId, context);

    if (!listId) {
      throw new Error('listId is required');
    }
    if (!segmentId) {
      throw new Error('segmentId is required');
    }

    await this.callApi(`/lists/${listId}/segments/${segmentId}`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Segment deleted successfully',
      },
    };
  }

  // ==================== Merge Field Operations ====================

  private async listMergeFields(context: ExecutionContext): Promise<NodeExecutionResult> {
    const listId = this.resolveValue(this.config.listId, context);
    const count = Math.min(this.config.count || 10, 1000);
    const offset = this.config.offset || 0;

    if (!listId) {
      throw new Error('listId is required');
    }

    const data = await this.callApi(`/lists/${listId}/merge-fields`, 'GET', null, {
      count: String(count),
      offset: String(offset),
    });

    return {
      success: true,
      data: {
        mergeFields: data.merge_fields || [],
        totalItems: data.total_items || 0,
      },
    };
  }

  private async getMergeField(context: ExecutionContext): Promise<NodeExecutionResult> {
    const listId = this.resolveValue(this.config.listId, context);
    const mergeId = this.resolveValue(this.config.mergeId, context);

    if (!listId) {
      throw new Error('listId is required');
    }
    if (!mergeId) {
      throw new Error('mergeId is required');
    }

    const data = await this.callApi(`/lists/${listId}/merge-fields/${mergeId}`);

    return {
      success: true,
      data: {
        mergeField: data,
      },
    };
  }

  private async createMergeField(context: ExecutionContext): Promise<NodeExecutionResult> {
    const listId = this.resolveValue(this.config.listId, context);
    const tag = this.config.tag;
    const name = this.resolveValue(this.config.name, context);
    const fieldType = this.config.fieldType || 'text';
    const required = this.config.required || false;

    if (!listId) {
      throw new Error('listId is required');
    }
    if (!tag) {
      throw new Error('tag is required');
    }
    if (!name) {
      throw new Error('name is required');
    }

    const data = await this.callApi(`/lists/${listId}/merge-fields`, 'POST', {
      tag,
      name,
      type: fieldType,
      required,
    });

    return {
      success: true,
      data: {
        mergeField: data,
        message: 'Merge field created successfully',
      },
    };
  }

  private async updateMergeField(context: ExecutionContext): Promise<NodeExecutionResult> {
    const listId = this.resolveValue(this.config.listId, context);
    const mergeId = this.resolveValue(this.config.mergeId, context);
    const name = this.resolveValue(this.config.name, context) || null;
    const required = this.config.required !== undefined ? this.config.required : null;

    if (!listId) {
      throw new Error('listId is required');
    }
    if (!mergeId) {
      throw new Error('mergeId is required');
    }

    const body: any = {};

    if (name) {
      body.name = name;
    }
    if (required !== null) {
      body.required = required;
    }

    const data = await this.callApi(`/lists/${listId}/merge-fields/${mergeId}`, 'PATCH', body);

    return {
      success: true,
      data: {
        mergeField: data,
        message: 'Merge field updated successfully',
      },
    };
  }

  private async deleteMergeField(context: ExecutionContext): Promise<NodeExecutionResult> {
    const listId = this.resolveValue(this.config.listId, context);
    const mergeId = this.resolveValue(this.config.mergeId, context);

    if (!listId) {
      throw new Error('listId is required');
    }
    if (!mergeId) {
      throw new Error('mergeId is required');
    }

    await this.callApi(`/lists/${listId}/merge-fields/${mergeId}`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Merge field deleted successfully',
      },
    };
  }

  // ==================== Tag Operations ====================

  private async listTags(context: ExecutionContext): Promise<NodeExecutionResult> {
    const listId = this.resolveValue(this.config.listId, context);
    const count = Math.min(this.config.count || 10, 1000);
    const offset = this.config.offset || 0;

    if (!listId) {
      throw new Error('listId is required');
    }

    const data = await this.callApi(`/lists/${listId}/segments`, 'GET', null, {
      count: String(count),
      offset: String(offset),
      type: 'static',
    });

    return {
      success: true,
      data: {
        tags: data.segments || [],
        totalItems: data.total_items || 0,
      },
    };
  }

  private async addTag(context: ExecutionContext): Promise<NodeExecutionResult> {
    const listId = this.resolveValue(this.config.listId, context);
    const email = this.resolveValue(this.config.email, context);
    const tagName = this.resolveValue(this.config.tagName, context);

    if (!listId) {
      throw new Error('listId is required');
    }
    if (!email) {
      throw new Error('email is required');
    }
    if (!tagName) {
      throw new Error('tagName is required');
    }

    const subscriberHash = this.generateSubscriberHash(email);
    const data = await this.callApi(`/lists/${listId}/members/${subscriberHash}/tags`, 'POST', {
      tags: [{ name: tagName, status: 'active' }],
    });

    return {
      success: true,
      data: {
        message: 'Tag added successfully',
        data,
      },
    };
  }

  private async deleteTag(context: ExecutionContext): Promise<NodeExecutionResult> {
    const listId = this.resolveValue(this.config.listId, context);
    const email = this.resolveValue(this.config.email, context);
    const tagName = this.resolveValue(this.config.tagName, context);

    if (!listId) {
      throw new Error('listId is required');
    }
    if (!email) {
      throw new Error('email is required');
    }
    if (!tagName) {
      throw new Error('tagName is required');
    }

    const subscriberHash = this.generateSubscriberHash(email);
    const data = await this.callApi(
      `/lists/${listId}/members/${subscriberHash}/tags`,
      'POST',
      {
        tags: [{ name: tagName, status: 'inactive' }],
      }
    );

    return {
      success: true,
      data: {
        message: 'Tag deleted successfully',
        data,
      },
    };
  }

  // ==================== Interest Category Operations ====================

  private async listInterestCategories(context: ExecutionContext): Promise<NodeExecutionResult> {
    const listId = this.resolveValue(this.config.listId, context);
    const count = Math.min(this.config.count || 10, 1000);
    const offset = this.config.offset || 0;

    if (!listId) {
      throw new Error('listId is required');
    }

    const data = await this.callApi(`/lists/${listId}/interest-categories`, 'GET', null, {
      count: String(count),
      offset: String(offset),
    });

    return {
      success: true,
      data: {
        categories: data.categories || [],
        totalItems: data.total_items || 0,
      },
    };
  }

  private async getInterestCategory(context: ExecutionContext): Promise<NodeExecutionResult> {
    const listId = this.resolveValue(this.config.listId, context);
    const categoryId = this.resolveValue(this.config.categoryId, context);

    if (!listId) {
      throw new Error('listId is required');
    }
    if (!categoryId) {
      throw new Error('categoryId is required');
    }

    const data = await this.callApi(
      `/lists/${listId}/interest-categories/${categoryId}`
    );

    return {
      success: true,
      data: {
        category: data,
      },
    };
  }

  private async createInterestCategory(context: ExecutionContext): Promise<NodeExecutionResult> {
    const listId = this.resolveValue(this.config.listId, context);
    const title = this.resolveValue(this.config.title, context);
    const displayOrder = this.config.displayOrder || null;
    const type = this.config.type || 'checkboxes';

    if (!listId) {
      throw new Error('listId is required');
    }
    if (!title) {
      throw new Error('title is required');
    }

    const body: any = {
      title,
      type,
    };

    if (displayOrder) {
      body.display_order = displayOrder;
    }

    const data = await this.callApi(`/lists/${listId}/interest-categories`, 'POST', body);

    return {
      success: true,
      data: {
        category: data,
        message: 'Interest category created successfully',
      },
    };
  }

  private async updateInterestCategory(context: ExecutionContext): Promise<NodeExecutionResult> {
    const listId = this.resolveValue(this.config.listId, context);
    const categoryId = this.resolveValue(this.config.categoryId, context);
    const title = this.resolveValue(this.config.title, context) || null;
    const displayOrder = this.config.displayOrder || null;

    if (!listId) {
      throw new Error('listId is required');
    }
    if (!categoryId) {
      throw new Error('categoryId is required');
    }

    const body: any = {};

    if (title) {
      body.title = title;
    }
    if (displayOrder) {
      body.display_order = displayOrder;
    }

    const data = await this.callApi(
      `/lists/${listId}/interest-categories/${categoryId}`,
      'PATCH',
      body
    );

    return {
      success: true,
      data: {
        category: data,
        message: 'Interest category updated successfully',
      },
    };
  }

  private async deleteInterestCategory(context: ExecutionContext): Promise<NodeExecutionResult> {
    const listId = this.resolveValue(this.config.listId, context);
    const categoryId = this.resolveValue(this.config.categoryId, context);

    if (!listId) {
      throw new Error('listId is required');
    }
    if (!categoryId) {
      throw new Error('categoryId is required');
    }

    await this.callApi(`/lists/${listId}/interest-categories/${categoryId}`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Interest category deleted successfully',
      },
    };
  }

  private async listInterests(context: ExecutionContext): Promise<NodeExecutionResult> {
    const listId = this.resolveValue(this.config.listId, context);
    const categoryId = this.resolveValue(this.config.categoryId, context);
    const count = Math.min(this.config.count || 10, 1000);
    const offset = this.config.offset || 0;

    if (!listId) {
      throw new Error('listId is required');
    }
    if (!categoryId) {
      throw new Error('categoryId is required');
    }

    const data = await this.callApi(
      `/lists/${listId}/interest-categories/${categoryId}/interests`,
      'GET',
      null,
      {
        count: String(count),
        offset: String(offset),
      }
    );

    return {
      success: true,
      data: {
        interests: data.interests || [],
        totalItems: data.total_items || 0,
      },
    };
  }

  private async getInterest(context: ExecutionContext): Promise<NodeExecutionResult> {
    const listId = this.resolveValue(this.config.listId, context);
    const categoryId = this.resolveValue(this.config.categoryId, context);
    const interestId = this.resolveValue(this.config.interestId, context);

    if (!listId) {
      throw new Error('listId is required');
    }
    if (!categoryId) {
      throw new Error('categoryId is required');
    }
    if (!interestId) {
      throw new Error('interestId is required');
    }

    const data = await this.callApi(
      `/lists/${listId}/interest-categories/${categoryId}/interests/${interestId}`
    );

    return {
      success: true,
      data: {
        interest: data,
      },
    };
  }

  private async createInterest(context: ExecutionContext): Promise<NodeExecutionResult> {
    const listId = this.resolveValue(this.config.listId, context);
    const categoryId = this.resolveValue(this.config.categoryId, context);
    const name = this.resolveValue(this.config.name, context);

    if (!listId) {
      throw new Error('listId is required');
    }
    if (!categoryId) {
      throw new Error('categoryId is required');
    }
    if (!name) {
      throw new Error('name is required');
    }

    const data = await this.callApi(
      `/lists/${listId}/interest-categories/${categoryId}/interests`,
      'POST',
      {
        name,
      }
    );

    return {
      success: true,
      data: {
        interest: data,
        message: 'Interest created successfully',
      },
    };
  }

  private async updateInterest(context: ExecutionContext): Promise<NodeExecutionResult> {
    const listId = this.resolveValue(this.config.listId, context);
    const categoryId = this.resolveValue(this.config.categoryId, context);
    const interestId = this.resolveValue(this.config.interestId, context);
    const name = this.resolveValue(this.config.name, context) || null;

    if (!listId) {
      throw new Error('listId is required');
    }
    if (!categoryId) {
      throw new Error('categoryId is required');
    }
    if (!interestId) {
      throw new Error('interestId is required');
    }

    const body: any = {};
    if (name) {
      body.name = name;
    }

    const data = await this.callApi(
      `/lists/${listId}/interest-categories/${categoryId}/interests/${interestId}`,
      'PATCH',
      body
    );

    return {
      success: true,
      data: {
        interest: data,
        message: 'Interest updated successfully',
      },
    };
  }

  private async deleteInterest(context: ExecutionContext): Promise<NodeExecutionResult> {
    const listId = this.resolveValue(this.config.listId, context);
    const categoryId = this.resolveValue(this.config.categoryId, context);
    const interestId = this.resolveValue(this.config.interestId, context);

    if (!listId) {
      throw new Error('listId is required');
    }
    if (!categoryId) {
      throw new Error('categoryId is required');
    }
    if (!interestId) {
      throw new Error('interestId is required');
    }

    await this.callApi(
      `/lists/${listId}/interest-categories/${categoryId}/interests/${interestId}`,
      'DELETE'
    );

    return {
      success: true,
      data: {
        message: 'Interest deleted successfully',
      },
    };
  }

  // ==================== Ecommerce Operations ====================

  private async listStores(): Promise<NodeExecutionResult> {
    const count = Math.min(this.config.count || 10, 1000);
    const offset = this.config.offset || 0;

    const data = await this.callApi('/ecommerce/stores', 'GET', null, {
      count: String(count),
      offset: String(offset),
    });

    return {
      success: true,
      data: {
        stores: data.stores || [],
        totalItems: data.total_items || 0,
      },
    };
  }

  private async getStore(context: ExecutionContext): Promise<NodeExecutionResult> {
    const storeId = this.resolveValue(this.config.storeId, context);

    if (!storeId) {
      throw new Error('storeId is required');
    }

    const data = await this.callApi(`/ecommerce/stores/${storeId}`);

    return {
      success: true,
      data: {
        store: data,
      },
    };
  }

  private async createStore(context: ExecutionContext): Promise<NodeExecutionResult> {
    const id = this.resolveValue(this.config.id, context);
    const name = this.resolveValue(this.config.name, context);
    const platform = this.resolveValue(this.config.platform, context) || null;
    const domain = this.resolveValue(this.config.domain, context) || null;

    if (!id) {
      throw new Error('id is required');
    }
    if (!name) {
      throw new Error('name is required');
    }

    const body: any = {
      id,
      name,
    };

    if (platform) {
      body.platform = platform;
    }
    if (domain) {
      body.domain = domain;
    }

    const data = await this.callApi('/ecommerce/stores', 'POST', body);

    return {
      success: true,
      data: {
        store: data,
        message: 'Store created successfully',
      },
    };
  }

  private async updateStore(context: ExecutionContext): Promise<NodeExecutionResult> {
    const storeId = this.resolveValue(this.config.storeId, context);
    const name = this.resolveValue(this.config.name, context) || null;
    const domain = this.resolveValue(this.config.domain, context) || null;

    if (!storeId) {
      throw new Error('storeId is required');
    }

    const body: any = {};

    if (name) {
      body.name = name;
    }
    if (domain) {
      body.domain = domain;
    }

    const data = await this.callApi(`/ecommerce/stores/${storeId}`, 'PATCH', body);

    return {
      success: true,
      data: {
        store: data,
        message: 'Store updated successfully',
      },
    };
  }

  private async deleteStore(context: ExecutionContext): Promise<NodeExecutionResult> {
    const storeId = this.resolveValue(this.config.storeId, context);

    if (!storeId) {
      throw new Error('storeId is required');
    }

    await this.callApi(`/ecommerce/stores/${storeId}`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Store deleted successfully',
      },
    };
  }

  private async listProducts(context: ExecutionContext): Promise<NodeExecutionResult> {
    const storeId = this.resolveValue(this.config.storeId, context);
    const count = Math.min(this.config.count || 10, 1000);
    const offset = this.config.offset || 0;

    if (!storeId) {
      throw new Error('storeId is required');
    }

    const data = await this.callApi(`/ecommerce/stores/${storeId}/products`, 'GET', null, {
      count: String(count),
      offset: String(offset),
    });

    return {
      success: true,
      data: {
        products: data.products || [],
        totalItems: data.total_items || 0,
      },
    };
  }

  private async getProduct(context: ExecutionContext): Promise<NodeExecutionResult> {
    const storeId = this.resolveValue(this.config.storeId, context);
    const productId = this.resolveValue(this.config.productId, context);

    if (!storeId) {
      throw new Error('storeId is required');
    }
    if (!productId) {
      throw new Error('productId is required');
    }

    const data = await this.callApi(`/ecommerce/stores/${storeId}/products/${productId}`);

    return {
      success: true,
      data: {
        product: data,
      },
    };
  }

  private async createProduct(context: ExecutionContext): Promise<NodeExecutionResult> {
    const storeId = this.resolveValue(this.config.storeId, context);
    const id = this.resolveValue(this.config.id, context);
    const title = this.resolveValue(this.config.title, context);
    const variant = this.config.variant || {};
    const url = this.resolveValue(this.config.url, context) || null;

    if (!storeId) {
      throw new Error('storeId is required');
    }
    if (!id) {
      throw new Error('id is required');
    }
    if (!title) {
      throw new Error('title is required');
    }

    const body: any = {
      id,
      title,
      variants: [variant],
    };

    if (url) {
      body.url = url;
    }

    const data = await this.callApi(`/ecommerce/stores/${storeId}/products`, 'POST', body);

    return {
      success: true,
      data: {
        product: data,
        message: 'Product created successfully',
      },
    };
  }

  private async updateProduct(context: ExecutionContext): Promise<NodeExecutionResult> {
    const storeId = this.resolveValue(this.config.storeId, context);
    const productId = this.resolveValue(this.config.productId, context);
    const title = this.resolveValue(this.config.title, context) || null;

    if (!storeId) {
      throw new Error('storeId is required');
    }
    if (!productId) {
      throw new Error('productId is required');
    }

    const body: any = {};

    if (title) {
      body.title = title;
    }

    const data = await this.callApi(
      `/ecommerce/stores/${storeId}/products/${productId}`,
      'PATCH',
      body
    );

    return {
      success: true,
      data: {
        product: data,
        message: 'Product updated successfully',
      },
    };
  }

  private async deleteProduct(context: ExecutionContext): Promise<NodeExecutionResult> {
    const storeId = this.resolveValue(this.config.storeId, context);
    const productId = this.resolveValue(this.config.productId, context);

    if (!storeId) {
      throw new Error('storeId is required');
    }
    if (!productId) {
      throw new Error('productId is required');
    }

    await this.callApi(`/ecommerce/stores/${storeId}/products/${productId}`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Product deleted successfully',
      },
    };
  }

  private async listOrders(context: ExecutionContext): Promise<NodeExecutionResult> {
    const storeId = this.resolveValue(this.config.storeId, context);
    const count = Math.min(this.config.count || 10, 1000);
    const offset = this.config.offset || 0;

    if (!storeId) {
      throw new Error('storeId is required');
    }

    const data = await this.callApi(`/ecommerce/stores/${storeId}/orders`, 'GET', null, {
      count: String(count),
      offset: String(offset),
    });

    return {
      success: true,
      data: {
        orders: data.orders || [],
        totalItems: data.total_items || 0,
      },
    };
  }

  private async getOrder(context: ExecutionContext): Promise<NodeExecutionResult> {
    const storeId = this.resolveValue(this.config.storeId, context);
    const orderId = this.resolveValue(this.config.orderId, context);

    if (!storeId) {
      throw new Error('storeId is required');
    }
    if (!orderId) {
      throw new Error('orderId is required');
    }

    const data = await this.callApi(`/ecommerce/stores/${storeId}/orders/${orderId}`);

    return {
      success: true,
      data: {
        order: data,
      },
    };
  }

  private async createOrder(context: ExecutionContext): Promise<NodeExecutionResult> {
    const storeId = this.resolveValue(this.config.storeId, context);
    const id = this.resolveValue(this.config.id, context);
    const customer = this.config.customer || {};
    const orderTotal = this.config.orderTotal || 0;
    const currencyCode = this.config.currencyCode || 'USD';
    const lines = this.config.lines || [];

    if (!storeId) {
      throw new Error('storeId is required');
    }
    if (!id) {
      throw new Error('id is required');
    }

    const body: any = {
      id,
      customer,
      order_total: orderTotal,
      currency_code: currencyCode,
      lines,
    };

    const data = await this.callApi(`/ecommerce/stores/${storeId}/orders`, 'POST', body);

    return {
      success: true,
      data: {
        order: data,
        message: 'Order created successfully',
      },
    };
  }

  private async updateOrder(context: ExecutionContext): Promise<NodeExecutionResult> {
    const storeId = this.resolveValue(this.config.storeId, context);
    const orderId = this.resolveValue(this.config.orderId, context);
    const orderTotal = this.config.orderTotal || null;

    if (!storeId) {
      throw new Error('storeId is required');
    }
    if (!orderId) {
      throw new Error('orderId is required');
    }

    const body: any = {};

    if (orderTotal !== null) {
      body.order_total = orderTotal;
    }

    const data = await this.callApi(
      `/ecommerce/stores/${storeId}/orders/${orderId}`,
      'PATCH',
      body
    );

    return {
      success: true,
      data: {
        order: data,
        message: 'Order updated successfully',
      },
    };
  }

  private async deleteOrder(context: ExecutionContext): Promise<NodeExecutionResult> {
    const storeId = this.resolveValue(this.config.storeId, context);
    const orderId = this.resolveValue(this.config.orderId, context);

    if (!storeId) {
      throw new Error('storeId is required');
    }
    if (!orderId) {
      throw new Error('orderId is required');
    }

    await this.callApi(`/ecommerce/stores/${storeId}/orders/${orderId}`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Order deleted successfully',
      },
    };
  }

  // ==================== Automation Operations ====================

  private async listAutomations(): Promise<NodeExecutionResult> {
    const count = Math.min(this.config.count || 10, 1000);
    const offset = this.config.offset || 0;

    const data = await this.callApi('/automations', 'GET', null, {
      count: String(count),
      offset: String(offset),
    });

    return {
      success: true,
      data: {
        automations: data.automations || [],
        totalItems: data.total_items || 0,
      },
    };
  }

  private async getAutomation(context: ExecutionContext): Promise<NodeExecutionResult> {
    const workflowId = this.resolveValue(this.config.workflowId, context);

    if (!workflowId) {
      throw new Error('workflowId is required');
    }

    const data = await this.callApi(`/automations/${workflowId}`);

    return {
      success: true,
      data: {
        automation: data,
      },
    };
  }

  private async startAutomation(context: ExecutionContext): Promise<NodeExecutionResult> {
    const workflowId = this.resolveValue(this.config.workflowId, context);

    if (!workflowId) {
      throw new Error('workflowId is required');
    }

    const data = await this.callApi(`/automations/${workflowId}/actions/start`, 'POST');

    return {
      success: true,
      data: {
        message: 'Automation started successfully',
        data,
      },
    };
  }

  private async pauseAutomation(context: ExecutionContext): Promise<NodeExecutionResult> {
    const workflowId = this.resolveValue(this.config.workflowId, context);

    if (!workflowId) {
      throw new Error('workflowId is required');
    }

    const data = await this.callApi(`/automations/${workflowId}/actions/pause`, 'POST');

    return {
      success: true,
      data: {
        message: 'Automation paused successfully',
        data,
      },
    };
  }

  private async listAutomationEmails(context: ExecutionContext): Promise<NodeExecutionResult> {
    const workflowId = this.resolveValue(this.config.workflowId, context);

    if (!workflowId) {
      throw new Error('workflowId is required');
    }

    const data = await this.callApi(`/automations/${workflowId}/emails`);

    return {
      success: true,
      data: {
        emails: data.emails || [],
      },
    };
  }

  private async getAutomationEmail(context: ExecutionContext): Promise<NodeExecutionResult> {
    const workflowId = this.resolveValue(this.config.workflowId, context);
    const emailId = this.resolveValue(this.config.emailId, context);

    if (!workflowId) {
      throw new Error('workflowId is required');
    }
    if (!emailId) {
      throw new Error('emailId is required');
    }

    const data = await this.callApi(`/automations/${workflowId}/emails/${emailId}`);

    return {
      success: true,
      data: {
        email: data,
      },
    };
  }

  private async pauseAutomationEmail(context: ExecutionContext): Promise<NodeExecutionResult> {
    const workflowId = this.resolveValue(this.config.workflowId, context);
    const emailId = this.resolveValue(this.config.emailId, context);

    if (!workflowId) {
      throw new Error('workflowId is required');
    }
    if (!emailId) {
      throw new Error('emailId is required');
    }

    const data = await this.callApi(
      `/automations/${workflowId}/emails/${emailId}/actions/pause`,
      'POST'
    );

    return {
      success: true,
      data: {
        message: 'Automation email paused successfully',
        data,
      },
    };
  }

  private async startAutomationEmail(context: ExecutionContext): Promise<NodeExecutionResult> {
    const workflowId = this.resolveValue(this.config.workflowId, context);
    const emailId = this.resolveValue(this.config.emailId, context);

    if (!workflowId) {
      throw new Error('workflowId is required');
    }
    if (!emailId) {
      throw new Error('emailId is required');
    }

    const data = await this.callApi(
      `/automations/${workflowId}/emails/${emailId}/actions/start`,
      'POST'
    );

    return {
      success: true,
      data: {
        message: 'Automation email started successfully',
        data,
      },
    };
  }

  // ==================== Batch Operations ====================

  private async createBatchOperation(context: ExecutionContext): Promise<NodeExecutionResult> {
    const operations = this.resolveValue(this.config.operations, context);

    if (!operations || !Array.isArray(operations) || operations.length === 0) {
      throw new Error('operations must be a non-empty array');
    }

    const data = await this.callApi('/batches', 'POST', {
      operations: operations,
    });

    return {
      success: true,
      data: {
        batch: data,
        message: 'Batch operation created successfully',
      },
    };
  }

  private async getBatchOperation(context: ExecutionContext): Promise<NodeExecutionResult> {
    const batchId = this.resolveValue(this.config.batchId, context);

    if (!batchId) {
      throw new Error('batchId is required');
    }

    const data = await this.callApi(`/batches/${batchId}`);

    return {
      success: true,
      data: {
        batch: data,
      },
    };
  }

  private async listBatchOperations(): Promise<NodeExecutionResult> {
    const count = Math.min(this.config.count || 10, 1000);
    const offset = this.config.offset || 0;

    const data = await this.callApi('/batches', 'GET', null, {
      count: String(count),
      offset: String(offset),
    });

    return {
      success: true,
      data: {
        batches: data.batches || [],
        totalItems: data.total_items || 0,
      },
    };
  }

  // ==================== Ping Operations ====================

  private async ping(): Promise<NodeExecutionResult> {
    const data = await this.callApi('/ping');

    return {
      success: true,
      data: {
        healthStatus: data.health_status || 'OK',
        message: 'API is accessible',
      },
    };
  }

  // ==================== Helper Methods ====================

  /**
   * Generate MD5 hash of email for subscriber hash
   * Mailchimp requires the lowercase email address to be hashed
   */
  private generateSubscriberHash(email: string): string {
    const lowercaseEmail = email.toLowerCase().trim();
    // Simple hash implementation (in production, use a proper MD5 library)
    let hash = 0;
    for (let i = 0; i < lowercaseEmail.length; i++) {
      const char = lowercaseEmail.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  // ==================== Static Helper Methods ====================

  static readonly MemberStatus = {
    Subscribed: 'subscribed',
    Unsubscribed: 'unsubscribed',
    Cleaned: 'cleaned',
    Pending: 'pending',
    Transactional: 'transactional',
  } as const;

  static readonly CampaignType = {
    Regular: 'regular',
    PlainText: 'plaintext',
    Absplit: 'absplit',
    Rss: 'rss',
    Variate: 'variate',
    Automation: 'automation',
  } as const;

  static readonly CampaignStatus = {
    Save: 'save',
    Paused: 'paused',
    Schedule: 'schedule',
    Sending: 'sending',
    Sent: 'sent',
  } as const;

  static readonly MergeFieldType = {
    Text: 'text',
    Number: 'number',
    Address: 'address',
    Phone: 'phone',
    Date: 'date',
    Url: 'url',
    Imageurl: 'imageurl',
    Radio: 'radio',
    Dropdown: 'dropdown',
    Birthday: 'birthday',
    Zip: 'zip',
  } as const;

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Format Mailchimp API error
   */
  static formatError(error: any): string {
    if (error.response?.data) {
      const data = error.response.data;
      if (data.detail) {
        return data.detail;
      }
      if (data.errors) {
        return data.errors.map((e: any) => e.message || e.detail).join(', ');
      }
    }
    return error.message || 'Unknown Mailchimp API error';
  }
}
