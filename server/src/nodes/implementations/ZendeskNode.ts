import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * ZendeskNode - Zendesk Customer Support API Integration
 *
 * Provides comprehensive integration with Zendesk Support API including:
 * - Tickets: Create, read, update, delete, comments
 * - Users: CRUD operations, user fields
 * - Organizations: CRUD operations
 * - Groups: List, create, update
 * - Views: List, execute, create
 * - Searches: Search tickets, users, organizations
 * - Attachments: Upload, download
 * - Tags: Add, remove, list
 * - Satisfaction Ratings: CSAT tracking
 * - Ticket Fields: Custom field management
 *
 * Authentication: API token (email + token) or OAuth token
 * API Docs: https://developer.zendesk.com/api-reference/
 */
export class ZendeskNode extends BaseNode {
  readonly apiUrl: string;
  readonly email: string;
  readonly apiToken: string;
  readonly oauthToken: string;
  readonly useOAuth: boolean;

  constructor(id: string, name: string, config: any) {
    super(id, name, config);
    this.email = config.email || '';
    this.apiToken = config.apiToken || '';
    this.oauthToken = config.oauthToken || '';
    this.useOAuth = config.useOAuth === true;

    // Determine API URL from subdomain
    const subdomain = config.subdomain || '';
    if (subdomain) {
      this.apiUrl = `https://${subdomain}.zendesk.com/api/v2`;
    } else {
      throw new Error('Zendesk subdomain is required');
    }
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
    return 'zendesk';
  }

  getIcon(): string {
    return '💬';
  }

  getCategory(): string {
    return 'support';
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    const operation = this.config.operation || 'listTickets';

    try {
      switch (operation) {
        // Ticket Operations
        case 'listTickets':
          return await this.listTickets(context);
        case 'getTicket':
          return await this.getTicket(context);
        case 'createTicket':
          return await this.createTicket(context);
        case 'updateTicket':
          return await this.updateTicket(context);
        case 'deleteTicket':
          return await this.deleteTicket(context);
        case 'listTicketComments':
          return await this.listTicketComments(context);
        case 'addTicketComment':
          return await this.addTicketComment(context);
        case 'markTicketAsSolved':
          return await this.markTicketAsSolved(context);
        case 'markTicketAsClosed':
          return await this.markTicketAsClosed(context);
        case 'mergeTickets':
          return await this.mergeTickets(context);

        // User Operations
        case 'listUsers':
          return await this.listUsers(context);
        case 'getUser':
          return await this.getUser(context);
        case 'getMe':
          return await this.getMe();
        case 'createUser':
          return await this.createUser(context);
        case 'updateUser':
          return await this.updateUser(context);
        case 'deleteUser':
          return await this.deleteUser(context);
        case 'listUserTickets':
          return await this.listUserTickets(context);
        case 'suspendUser':
          return await this.suspendUser(context);
        case 'unsuspendUser':
          return await this.unsuspendUser(context);

        // Organization Operations
        case 'listOrganizations':
          return await this.listOrganizations(context);
        case 'getOrganization':
          return await this.getOrganization(context);
        case 'createOrganization':
          return await this.createOrganization(context);
        case 'updateOrganization':
          return await this.updateOrganization(context);
        case 'deleteOrganization':
          return await this.deleteOrganization(context);
        case 'listOrganizationTickets':
          return await this.listOrganizationTickets(context);
        case 'listOrganizationUsers':
          return await this.listOrganizationUsers(context);

        // Group Operations
        case 'listGroups':
          return await this.listGroups();
        case 'getGroup':
          return await this.getGroup(context);
        case 'createGroup':
          return await this.createGroup(context);
        case 'updateGroup':
          return await this.updateGroup(context);
        case 'deleteGroup':
          return await this.deleteGroup(context);
        case 'listGroupMemberships':
          return await this.listGroupMemberships(context);
        case 'assignGroupMembership':
          return await this.assignGroupMembership(context);

        // View Operations
        case 'listViews':
          return await this.listViews();
        case 'getView':
          return await this.getView(context);
        case 'executeView':
          return await this.executeView(context);
        case 'createView':
          return await this.createView(context);

        // Search Operations
        case 'search':
          return await this.search(context);
        case 'searchTickets':
          return await this.searchTickets(context);
        case 'searchUsers':
          return await this.searchUsers(context);
        case 'searchOrganizations':
          return await this.searchOrganizations(context);

        // Tag Operations
        case 'listTicketTags':
          return await this.listTicketTags(context);
        case 'addTicketTags':
          return await this.addTicketTags(context);
        case 'removeTicketTags':
          return await this.removeTicketTags(context);
        case 'setTicketTags':
          return await this.setTicketTags(context);
        case 'listTags':
          return await this.listTags();

        // Attachment Operations
        case 'uploadAttachment':
          return await this.uploadAttachment(context);
        case 'deleteAttachment':
          return await this.deleteAttachment(context);
        case 'getAttachment':
          return await this.getAttachment(context);

        // Satisfaction Rating Operations
        case 'listSatisfactionRatings':
          return await this.listSatisfactionRatings(context);
        case 'getSatisfactionRating':
          return await this.getSatisfactionRating(context);

        // Ticket Field Operations
        case 'listTicketFields':
          return await this.listTicketFields();
        case 'getTicketField':
          return await this.getTicketField(context);
        case 'createTicketField':
          return await this.createTicketField(context);
        case 'updateTicketField':
          return await this.updateTicketField(context);
        case 'deleteTicketField':
          return await this.deleteTicketField(context);

        // Audit Log Operations
        case 'listAuditLogs':
          return await this.listAuditLogs(context);
        case 'getAuditLog':
          return await this.getAuditLog(context);

        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || `Failed to execute Zendesk operation: ${operation}`,
      };
    }
  }

  private getAuthHeaders(): Record<string, string> {
    if (this.useOAuth) {
      return {
        'Authorization': `Bearer ${this.oauthToken}`,
      };
    } else {
      const credentials = Buffer.from(`${this.email}/token:${this.apiToken}`).toString('base64');
      return {
        'Authorization': `Basic ${credentials}`,
      };
    }
  }

  private async callApi(
    endpoint: string,
    method = 'GET',
    body?: any,
    isUpload = false
  ): Promise<any> {
    const url = `${this.apiUrl}${endpoint}`;

    const headers: Record<string, string> = {
      ...this.getAuthHeaders(),
    };

    if (!isUpload) {
      headers['Content-Type'] = 'application/json';
    }

    const options: RequestInit = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      if (isUpload) {
        options.body = body;
      } else {
        options.body = JSON.stringify(body);
      }
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Zendesk API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  // ==================== Ticket Operations ====================

  private async listTickets(context: ExecutionContext): Promise<NodeExecutionResult> {
    const status = this.resolveValue(this.config.status, context) || '';
    const assigneeId = this.resolveValue(this.config.assigneeId, context) || '';
    const requesterId = this.resolveValue(this.config.requesterId, context) || '';
    const organizationId = this.resolveValue(this.config.organizationId, context) || '';
    const page = this.config.page || 1;
    const perPage = Math.min(this.config.perPage || 100, 100);

    let endpoint = `/tickets.json?page=${page}&per_page=${perPage}`;

    if (status) {
      endpoint += `&status=${status}`;
    }
    if (assigneeId) {
      endpoint += `&assignee_id=${assigneeId}`;
    }
    if (requesterId) {
      endpoint += `&requester_id=${requesterId}`;
    }
    if (organizationId) {
      endpoint += `&organization_id=${organizationId}`;
    }

    const data = await this.callApi(endpoint);

    return {
      success: true,
      data: {
        tickets: data.tickets || [],
        count: data.count || 0,
        nextPage: data.next_page || null,
        previousPage: data.previous_page || null,
      },
    };
  }

  private async getTicket(context: ExecutionContext): Promise<NodeExecutionResult> {
    const ticketId = this.resolveValue(this.config.ticketId, context);

    if (!ticketId) {
      throw new Error('ticketId is required');
    }

    const data = await this.callApi(`/tickets/${ticketId}.json`);
    const include = this.config.include || [];
    const includeStr = include.join(',');

    let endpoint = `/tickets/${ticketId}.json`;
    if (includeStr) {
      endpoint = `/tickets/${ticketId}.json?include=${includeStr}`;
      const dataWithIncludes = await this.callApi(endpoint);
      return {
        success: true,
        data: dataWithIncludes,
      };
    }

    return {
      success: true,
      data: data.ticket || data,
    };
  }

  private async createTicket(context: ExecutionContext): Promise<NodeExecutionResult> {
    const subject = this.resolveValue(this.config.subject, context);
    const comment = this.resolveValue(this.config.comment, context);
    const requesterId = this.resolveValue(this.config.requesterId, context) || null;
    const requesterEmail = this.resolveValue(this.config.requesterEmail, context) || null;
    const assigneeId = this.resolveValue(this.config.assigneeId, context) || null;
    const groupId = this.resolveValue(this.config.groupId, context) || null;
    const organizationId = this.resolveValue(this.config.organizationId, context) || null;
    const type = this.config.type || null;
    const priority = this.config.priority || null;
    const status = this.config.status || 'open';
    const tags = this.config.tags || [];
    const customFields = this.config.customFields || [];

    if (!subject) {
      throw new Error('subject is required');
    }
    if (!comment && !requesterId) {
      throw new Error('comment or requesterId is required');
    }

    const ticket: any = {
      subject,
      comment: { body: comment || '' },
      status,
    };

    if (requesterId) {
      ticket.requester_id = requesterId;
    }
    if (requesterEmail) {
      ticket.requester = { email: requesterEmail };
    }
    if (assigneeId) {
      ticket.assignee_id = assigneeId;
    }
    if (groupId) {
      ticket.group_id = groupId;
    }
    if (organizationId) {
      ticket.organization_id = organizationId;
    }
    if (type) {
      ticket.type = type;
    }
    if (priority) {
      ticket.priority = priority;
    }
    if (tags.length > 0) {
      ticket.tags = tags;
    }
    if (customFields.length > 0) {
      ticket.custom_fields = customFields;
    }

    const data = await this.callApi('/tickets.json', 'POST', { ticket });

    return {
      success: true,
      data: {
        ticket: data.ticket,
        audit: data.audit,
      },
    };
  }

  private async updateTicket(context: ExecutionContext): Promise<NodeExecutionResult> {
    const ticketId = this.resolveValue(this.config.ticketId, context);

    if (!ticketId) {
      throw new Error('ticketId is required');
    }

    const ticket: any = {};

    const subject = this.resolveValue(this.config.subject, context);
    const comment = this.resolveValue(this.config.comment, context);
    const assigneeId = this.resolveValue(this.config.assigneeId, context);
    const groupId = this.resolveValue(this.config.groupId, context);
    const status = this.config.status;
    const type = this.config.type;
    const priority = this.config.priority;
    const tags = this.config.tags;
    const customFields = this.config.customFields;

    if (subject) {
      ticket.subject = subject;
    }
    if (assigneeId) {
      ticket.assignee_id = assigneeId;
    }
    if (groupId) {
      ticket.group_id = groupId;
    }
    if (status) {
      ticket.status = status;
    }
    if (type) {
      ticket.type = type;
    }
    if (priority) {
      ticket.priority = priority;
    }
    if (comment) {
      ticket.comment = { body: comment };
    }
    if (tags) {
      ticket.tags = tags;
    }
    if (customFields) {
      ticket.custom_fields = customFields;
    }

    const data = await this.callApi(`/tickets/${ticketId}.json`, 'PUT', { ticket });

    return {
      success: true,
      data: {
        ticket: data.ticket,
        audit: data.audit,
      },
    };
  }

  private async deleteTicket(context: ExecutionContext): Promise<NodeExecutionResult> {
    const ticketId = this.resolveValue(this.config.ticketId, context);

    if (!ticketId) {
      throw new Error('ticketId is required');
    }

    await this.callApi(`/tickets/${ticketId}.json`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Ticket deleted successfully',
        ticketId,
      },
    };
  }

  private async listTicketComments(context: ExecutionContext): Promise<NodeExecutionResult> {
    const ticketId = this.resolveValue(this.config.ticketId, context);
    const page = this.config.page || 1;
    const perPage = Math.min(this.config.perPage || 100, 100);

    if (!ticketId) {
      throw new Error('ticketId is required');
    }

    const endpoint = `/tickets/${ticketId}/comments.json?page=${page}&per_page=${perPage}`;
    const data = await this.callApi(endpoint);

    return {
      success: true,
      data: {
        comments: data.comments || [],
        count: data.count || 0,
        nextPage: data.next_page || null,
      },
    };
  }

  private async addTicketComment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const ticketId = this.resolveValue(this.config.ticketId, context);
    const comment = this.resolveValue(this.config.comment, context);
    const authorId = this.resolveValue(this.config.authorId, context) || null;
    const isPublic = this.config.isPublic !== false;
    const attachments = this.config.attachments || [];

    if (!ticketId) {
      throw new Error('ticketId is required');
    }
    if (!comment) {
      throw new Error('comment is required');
    }

    const ticket: any = {
      comment: {
        body: comment,
        public: isPublic,
      },
    };

    if (authorId) {
      ticket.comment.author_id = authorId;
    }
    if (attachments.length > 0) {
      ticket.comment.uploads = attachments;
    }

    const data = await this.callApi(`/tickets/${ticketId}.json`, 'PUT', { ticket });

    return {
      success: true,
      data: {
        comment: data.comment,
        audit: data.audit,
      },
    };
  }

  private async markTicketAsSolved(context: ExecutionContext): Promise<NodeExecutionResult> {
    const ticketId = this.resolveValue(this.config.ticketId, context);
    const comment = this.resolveValue(this.config.comment, context) || null;

    if (!ticketId) {
      throw new Error('ticketId is required');
    }

    const ticket: any = {
      status: 'solved',
    };

    if (comment) {
      ticket.comment = { body: comment };
    }

    const data = await this.callApi(`/tickets/${ticketId}.json`, 'PUT', { ticket });

    return {
      success: true,
      data: {
        ticket: data.ticket,
        message: 'Ticket marked as solved',
      },
    };
  }

  private async markTicketAsClosed(context: ExecutionContext): Promise<NodeExecutionResult> {
    const ticketId = this.resolveValue(this.config.ticketId, context);

    if (!ticketId) {
      throw new Error('ticketId is required');
    }

    const ticket = { status: 'closed' };
    const data = await this.callApi(`/tickets/${ticketId}.json`, 'PUT', { ticket });

    return {
      success: true,
      data: {
        ticket: data.ticket,
        message: 'Ticket marked as closed',
      },
    };
  }

  private async mergeTickets(context: ExecutionContext): Promise<NodeExecutionResult> {
    const sourceTicketId = this.resolveValue(this.config.sourceTicketId, context);
    const targetTicketId = this.resolveValue(this.config.targetTicketId, context);
    const comment = this.resolveValue(this.config.comment, context) || 'Merged ticket';

    if (!sourceTicketId || !targetTicketId) {
      throw new Error('sourceTicketId and targetTicketId are required');
    }

    const targetComment = `${comment}\n\n[Merged ticket #${sourceTicketId}]`;

    await this.callApi(`/tickets/${targetTicketId}.json`, 'PUT', {
      ticket: {
        comment: { body: targetComment, public: false },
      },
    });

    await this.callApi(`/tickets/${sourceTicketId}.json`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Tickets merged successfully',
        sourceTicketId,
        targetTicketId,
      },
    };
  }

  // ==================== User Operations ====================

  private async listUsers(context: ExecutionContext): Promise<NodeExecutionResult> {
    const role = this.config.role || '';
    const page = this.config.page || 1;
    const perPage = Math.min(this.config.perPage || 100, 100);

    let endpoint = `/users.json?page=${page}&per_page=${perPage}`;
    if (role) {
      endpoint += `&role=${role}`;
    }

    const data = await this.callApi(endpoint);

    return {
      success: true,
      data: {
        users: data.users || [],
        count: data.count || 0,
        nextPage: data.next_page || null,
      },
    };
  }

  private async getUser(context: ExecutionContext): Promise<NodeExecutionResult> {
    const userId = this.resolveValue(this.config.userId, context);

    if (!userId) {
      throw new Error('userId is required');
    }

    const data = await this.callApi(`/users/${userId}.json`);

    return {
      success: true,
      data: data.user || data,
    };
  }

  private async getMe(): Promise<NodeExecutionResult> {
    const data = await this.callApi('/users/me.json');

    return {
      success: true,
      data: data.user || data,
    };
  }

  private async createUser(context: ExecutionContext): Promise<NodeExecutionResult> {
    const name = this.resolveValue(this.config.name, context);
    const email = this.resolveValue(this.config.email, context);
    const role = this.config.role || 'end-user';
    const phone = this.resolveValue(this.config.phone, context) || null;
    const organizationId = this.resolveValue(this.config.organizationId, context) || null;
    const tags = this.config.tags || [];
    const customFields = this.config.customFields || [];
    const verified = this.config.verified !== false;

    if (!name) {
      throw new Error('name is required');
    }
    if (!email) {
      throw new Error('email is required');
    }

    const user: any = {
      name,
      email,
      role,
      verified,
    };

    if (phone) {
      user.phone = phone;
    }
    if (organizationId) {
      user.organization_id = organizationId;
    }
    if (tags.length > 0) {
      user.tags = tags;
    }
    if (customFields.length > 0) {
      user.user_fields = customFields;
    }

    const data = await this.callApi('/users.json', 'POST', { user });

    return {
      success: true,
      data: {
        user: data.user,
        message: 'User created successfully',
      },
    };
  }

  private async updateUser(context: ExecutionContext): Promise<NodeExecutionResult> {
    const userId = this.resolveValue(this.config.userId, context);

    if (!userId) {
      throw new Error('userId is required');
    }

    const user: any = {};

    const name = this.resolveValue(this.config.name, context);
    const email = this.resolveValue(this.config.email, context);
    const phone = this.resolveValue(this.config.phone, context);
    const organizationId = this.resolveValue(this.config.organizationId, context);
    const role = this.config.role;
    const tags = this.config.tags;
    const customFields = this.config.customFields;

    if (name) {
      user.name = name;
    }
    if (email) {
      user.email = email;
    }
    if (phone) {
      user.phone = phone;
    }
    if (organizationId) {
      user.organization_id = organizationId;
    }
    if (role) {
      user.role = role;
    }
    if (tags) {
      user.tags = tags;
    }
    if (customFields) {
      user.user_fields = customFields;
    }

    const data = await this.callApi(`/users/${userId}.json`, 'PUT', { user });

    return {
      success: true,
      data: {
        user: data.user,
        message: 'User updated successfully',
      },
    };
  }

  private async deleteUser(context: ExecutionContext): Promise<NodeExecutionResult> {
    const userId = this.resolveValue(this.config.userId, context);

    if (!userId) {
      throw new Error('userId is required');
    }

    await this.callApi(`/users/${userId}.json`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'User deleted successfully',
        userId,
      },
    };
  }

  private async listUserTickets(context: ExecutionContext): Promise<NodeExecutionResult> {
    const userId = this.resolveValue(this.config.userId, context);
    const page = this.config.page || 1;
    const perPage = Math.min(this.config.perPage || 100, 100);

    if (!userId) {
      throw new Error('userId is required');
    }

    const endpoint = `/users/${userId}/tickets/requested.json?page=${page}&per_page=${perPage}`;
    const data = await this.callApi(endpoint);

    return {
      success: true,
      data: {
        tickets: data.tickets || [],
        count: data.count || 0,
        nextPage: data.next_page || null,
      },
    };
  }

  private async suspendUser(context: ExecutionContext): Promise<NodeExecutionResult> {
    const userId = this.resolveValue(this.config.userId, context);

    if (!userId) {
      throw new Error('userId is required');
    }

    const data = await this.callApi(`/users/${userId}.json`, 'PUT', {
      user: { suspended: true },
    });

    return {
      success: true,
      data: {
        user: data.user,
        message: 'User suspended successfully',
      },
    };
  }

  private async unsuspendUser(context: ExecutionContext): Promise<NodeExecutionResult> {
    const userId = this.resolveValue(this.config.userId, context);

    if (!userId) {
      throw new Error('userId is required');
    }

    const data = await this.callApi(`/users/${userId}.json`, 'PUT', {
      user: { suspended: false },
    });

    return {
      success: true,
      data: {
        user: data.user,
        message: 'User unsuspended successfully',
      },
    };
  }

  // ==================== Organization Operations ====================

  private async listOrganizations(context: ExecutionContext): Promise<NodeExecutionResult> {
    const page = this.config.page || 1;
    const perPage = Math.min(this.config.perPage || 100, 100);

    const endpoint = `/organizations.json?page=${page}&per_page=${perPage}`;
    const data = await this.callApi(endpoint);

    return {
      success: true,
      data: {
        organizations: data.organizations || [],
        count: data.count || 0,
        nextPage: data.next_page || null,
      },
    };
  }

  private async getOrganization(context: ExecutionContext): Promise<NodeExecutionResult> {
    const organizationId = this.resolveValue(this.config.organizationId, context);

    if (!organizationId) {
      throw new Error('organizationId is required');
    }

    const data = await this.callApi(`/organizations/${organizationId}.json`);

    return {
      success: true,
      data: data.organization || data,
    };
  }

  private async createOrganization(context: ExecutionContext): Promise<NodeExecutionResult> {
    const name = this.resolveValue(this.config.name, context);
    const notes = this.resolveValue(this.config.notes, context) || null;
    const tags = this.config.tags || [];
    const customFields = this.config.customFields || [];

    if (!name) {
      throw new Error('name is required');
    }

    const organization: any = { name };

    if (notes) {
      organization.notes = notes;
    }
    if (tags.length > 0) {
      organization.tags = tags;
    }
    if (customFields.length > 0) {
      organization.organization_fields = customFields;
    }

    const data = await this.callApi('/organizations.json', 'POST', { organization });

    return {
      success: true,
      data: {
        organization: data.organization,
        message: 'Organization created successfully',
      },
    };
  }

  private async updateOrganization(context: ExecutionContext): Promise<NodeExecutionResult> {
    const organizationId = this.resolveValue(this.config.organizationId, context);

    if (!organizationId) {
      throw new Error('organizationId is required');
    }

    const organization: any = {};

    const name = this.resolveValue(this.config.name, context);
    const notes = this.resolveValue(this.config.notes, context);
    const tags = this.config.tags;
    const customFields = this.config.customFields;

    if (name) {
      organization.name = name;
    }
    if (notes) {
      organization.notes = notes;
    }
    if (tags) {
      organization.tags = tags;
    }
    if (customFields) {
      organization.organization_fields = customFields;
    }

    const data = await this.callApi(`/organizations/${organizationId}.json`, 'PUT', {
      organization,
    });

    return {
      success: true,
      data: {
        organization: data.organization,
        message: 'Organization updated successfully',
      },
    };
  }

  private async deleteOrganization(context: ExecutionContext): Promise<NodeExecutionResult> {
    const organizationId = this.resolveValue(this.config.organizationId, context);

    if (!organizationId) {
      throw new Error('organizationId is required');
    }

    await this.callApi(`/organizations/${organizationId}.json`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Organization deleted successfully',
        organizationId,
      },
    };
  }

  private async listOrganizationTickets(context: ExecutionContext): Promise<NodeExecutionResult> {
    const organizationId = this.resolveValue(this.config.organizationId, context);
    const page = this.config.page || 1;
    const perPage = Math.min(this.config.perPage || 100, 100);

    if (!organizationId) {
      throw new Error('organizationId is required');
    }

    const endpoint = `/organizations/${organizationId}/tickets.json?page=${page}&per_page=${perPage}`;
    const data = await this.callApi(endpoint);

    return {
      success: true,
      data: {
        tickets: data.tickets || [],
        count: data.count || 0,
        nextPage: data.next_page || null,
      },
    };
  }

  private async listOrganizationUsers(context: ExecutionContext): Promise<NodeExecutionResult> {
    const organizationId = this.resolveValue(this.config.organizationId, context);
    const page = this.config.page || 1;
    const perPage = Math.min(this.config.perPage || 100, 100);

    if (!organizationId) {
      throw new Error('organizationId is required');
    }

    const endpoint = `/organizations/${organizationId}/users.json?page=${page}&per_page=${perPage}`;
    const data = await this.callApi(endpoint);

    return {
      success: true,
      data: {
        users: data.users || [],
        count: data.count || 0,
        nextPage: data.next_page || null,
      },
    };
  }

  // ==================== Group Operations ====================

  private async listGroups(): Promise<NodeExecutionResult> {
    const page = this.config.page || 1;
    const perPage = Math.min(this.config.perPage || 100, 100);

    const endpoint = `/groups.json?page=${page}&per_page=${perPage}`;
    const data = await this.callApi(endpoint);

    return {
      success: true,
      data: {
        groups: data.groups || [],
        count: data.count || 0,
        nextPage: data.next_page || null,
      },
    };
  }

  private async getGroup(context: ExecutionContext): Promise<NodeExecutionResult> {
    const groupId = this.resolveValue(this.config.groupId, context);

    if (!groupId) {
      throw new Error('groupId is required');
    }

    const data = await this.callApi(`/groups/${groupId}.json`);

    return {
      success: true,
      data: data.group || data,
    };
  }

  private async createGroup(context: ExecutionContext): Promise<NodeExecutionResult> {
    const name = this.resolveValue(this.config.name, context);
    const description = this.resolveValue(this.config.description, context) || null;

    if (!name) {
      throw new Error('name is required');
    }

    const group: any = { name };

    if (description) {
      group.description = description;
    }

    const data = await this.callApi('/groups.json', 'POST', { group });

    return {
      success: true,
      data: {
        group: data.group,
        message: 'Group created successfully',
      },
    };
  }

  private async updateGroup(context: ExecutionContext): Promise<NodeExecutionResult> {
    const groupId = this.resolveValue(this.config.groupId, context);

    if (!groupId) {
      throw new Error('groupId is required');
    }

    const group: any = {};

    const name = this.resolveValue(this.config.name, context);
    const description = this.resolveValue(this.config.description, context);

    if (name) {
      group.name = name;
    }
    if (description) {
      group.description = description;
    }

    const data = await this.callApi(`/groups/${groupId}.json`, 'PUT', { group });

    return {
      success: true,
      data: {
        group: data.group,
        message: 'Group updated successfully',
      },
    };
  }

  private async deleteGroup(context: ExecutionContext): Promise<NodeExecutionResult> {
    const groupId = this.resolveValue(this.config.groupId, context);

    if (!groupId) {
      throw new Error('groupId is required');
    }

    await this.callApi(`/groups/${groupId}.json`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Group deleted successfully',
        groupId,
      },
    };
  }

  private async listGroupMemberships(context: ExecutionContext): Promise<NodeExecutionResult> {
    const groupId = this.resolveValue(this.config.groupId, context);
    const page = this.config.page || 1;
    const perPage = Math.min(this.config.perPage || 100, 100);

    if (!groupId) {
      throw new Error('groupId is required');
    }

    const endpoint = `/groups/${groupId}/memberships.json?page=${page}&per_page=${perPage}`;
    const data = await this.callApi(endpoint);

    return {
      success: true,
      data: {
        memberships: data.group_memberships || [],
        count: data.count || 0,
        nextPage: data.next_page || null,
      },
    };
  }

  private async assignGroupMembership(context: ExecutionContext): Promise<NodeExecutionResult> {
    const userId = this.resolveValue(this.config.userId, context);
    const groupId = this.resolveValue(this.config.groupId, context);

    if (!userId || !groupId) {
      throw new Error('userId and groupId are required');
    }

    const data = await this.callApi('/group_memberships.json', 'POST', {
      group_membership: {
        user_id: userId,
        group_id: groupId,
      },
    });

    return {
      success: true,
      data: {
        membership: data.group_membership,
        message: 'User assigned to group successfully',
      },
    };
  }

  // ==================== View Operations ====================

  private async listViews(): Promise<NodeExecutionResult> {
    const data = await this.callApi('/views.json');

    return {
      success: true,
      data: {
        views: data.views || [],
        count: data.count || 0,
      },
    };
  }

  private async getView(context: ExecutionContext): Promise<NodeExecutionResult> {
    const viewId = this.resolveValue(this.config.viewId, context);

    if (!viewId) {
      throw new Error('viewId is required');
    }

    const data = await this.callApi(`/views/${viewId}.json`);

    return {
      success: true,
      data: data.view || data,
    };
  }

  private async executeView(context: ExecutionContext): Promise<NodeExecutionResult> {
    const viewId = this.resolveValue(this.config.viewId, context);
    const page = this.config.page || 1;
    const perPage = Math.min(this.config.perPage || 100, 100);

    if (!viewId) {
      throw new Error('viewId is required');
    }

    const endpoint = `/views/${viewId}/execute.json?page=${page}&per_page=${perPage}`;
    const data = await this.callApi(endpoint);

    return {
      success: true,
      data: {
        tickets: data.rows || data.tickets || [],
        count: data.count || 0,
        nextPage: data.next_page || null,
      },
    };
  }

  private async createView(context: ExecutionContext): Promise<NodeExecutionResult> {
    const title = this.resolveValue(this.config.title, context);
    const active = this.config.active !== false;
    const all = this.config.all || [];
    const any = this.config.any || [];

    if (!title) {
      throw new Error('title is required');
    }

    const view: any = {
      title,
      active,
    };

    if (all.length > 0) {
      view.conditions = {
        all: all.map((rule: any) => ({
          field: rule.field,
          operator: rule.operator,
          value: rule.value,
        })),
      };
    }
    if (any.length > 0) {
      if (!view.conditions) {
        view.conditions = {};
      }
      view.conditions.any = any.map((rule: any) => ({
        field: rule.field,
        operator: rule.operator,
        value: rule.value,
      }));
    }

    const data = await this.callApi('/views.json', 'POST', { view });

    return {
      success: true,
      data: {
        view: data.view,
        message: 'View created successfully',
      },
    };
  }

  // ==================== Search Operations ====================

  private async search(context: ExecutionContext): Promise<NodeExecutionResult> {
    const query = this.resolveValue(this.config.query, context);
    const page = this.config.page || 1;
    const perPage = Math.min(this.config.perPage || 100, 100);
    const sort_by = this.config.sort_by || 'updated_at';
    const sort_order = this.config.sort_order || 'desc';

    if (!query) {
      throw new Error('query is required');
    }

    const endpoint = `/search.json?page=${page}&per_page=${perPage}&sort_by=${sort_by}&sort_order=${sort_order}`;
    const data = await this.callApi(`${endpoint}&query=${encodeURIComponent(query)}`);

    return {
      success: true,
      data: {
        results: data.results || [],
        count: data.count || 0,
        nextPage: data.next_page || null,
      },
    };
  }

  private async searchTickets(context: ExecutionContext): Promise<NodeExecutionResult> {
    const query = this.resolveValue(this.config.query, context);
    const page = this.config.page || 1;
    const perPage = Math.min(this.config.perPage || 100, 100);

    if (!query) {
      throw new Error('query is required');
    }

    const endpoint = `/search.json?page=${page}&per_page=${perPage}&query=type:ticket+${encodeURIComponent(query)}`;
    const data = await this.callApi(endpoint);

    return {
      success: true,
      data: {
        tickets: data.results || [],
        count: data.count || 0,
        nextPage: data.next_page || null,
      },
    };
  }

  private async searchUsers(context: ExecutionContext): Promise<NodeExecutionResult> {
    const query = this.resolveValue(this.config.query, context);
    const page = this.config.page || 1;
    const perPage = Math.min(this.config.perPage || 100, 100);

    if (!query) {
      throw new Error('query is required');
    }

    const endpoint = `/search.json?page=${page}&per_page=${perPage}&query=type:user+${encodeURIComponent(query)}`;
    const data = await this.callApi(endpoint);

    return {
      success: true,
      data: {
        users: data.results || [],
        count: data.count || 0,
        nextPage: data.next_page || null,
      },
    };
  }

  private async searchOrganizations(context: ExecutionContext): Promise<NodeExecutionResult> {
    const query = this.resolveValue(this.config.query, context);
    const page = this.config.page || 1;
    const perPage = Math.min(this.config.perPage || 100, 100);

    if (!query) {
      throw new Error('query is required');
    }

    const endpoint = `/search.json?page=${page}&per_page=${perPage}&query=type:organization+${encodeURIComponent(query)}`;
    const data = await this.callApi(endpoint);

    return {
      success: true,
      data: {
        organizations: data.results || [],
        count: data.count || 0,
        nextPage: data.next_page || null,
      },
    };
  }

  // ==================== Tag Operations ====================

  private async listTicketTags(context: ExecutionContext): Promise<NodeExecutionResult> {
    const ticketId = this.resolveValue(this.config.ticketId, context);

    if (!ticketId) {
      throw new Error('ticketId is required');
    }

    const data = await this.callApi(`/tickets/${ticketId}.json`);

    return {
      success: true,
      data: {
        tags: data.ticket?.tags || [],
        ticketId,
      },
    };
  }

  private async addTicketTags(context: ExecutionContext): Promise<NodeExecutionResult> {
    const ticketId = this.resolveValue(this.config.ticketId, context);
    const tags = this.config.tags || [];

    if (!ticketId) {
      throw new Error('ticketId is required');
    }
    if (tags.length === 0) {
      throw new Error('tags are required');
    }

    const data = await this.callApi(`/tickets/${ticketId}/tags.json`, 'PUT', {
      tags,
    });

    return {
      success: true,
      data: {
        tags: data.tags || [],
        ticketId,
        message: 'Tags added successfully',
      },
    };
  }

  private async removeTicketTags(context: ExecutionContext): Promise<NodeExecutionResult> {
    const ticketId = this.resolveValue(this.config.ticketId, context);
    const tags = this.config.tags || [];

    if (!ticketId) {
      throw new Error('ticketId is required');
    }
    if (tags.length === 0) {
      throw new Error('tags are required');
    }

    const data = await this.callApi(`/tickets/${ticketId}/tags.json`, 'DELETE', {
      tags,
    });

    return {
      success: true,
      data: {
        tags: data.tags || [],
        ticketId,
        message: 'Tags removed successfully',
      },
    };
  }

  private async setTicketTags(context: ExecutionContext): Promise<NodeExecutionResult> {
    const ticketId = this.resolveValue(this.config.ticketId, context);
    const tags = this.config.tags || [];

    if (!ticketId) {
      throw new Error('ticketId is required');
    }

    const data = await this.callApi(`/tickets/${ticketId}/tags.json`, 'POST', {
      tags,
    });

    return {
      success: true,
      data: {
        tags: data.tags || [],
        ticketId,
        message: 'Tags set successfully',
      },
    };
  }

  private async listTags(): Promise<NodeExecutionResult> {
    const page = this.config.page || 1;
    const perPage = Math.min(this.config.perPage || 100, 100);

    const endpoint = `/tags.json?page=${page}&per_page=${perPage}`;
    const data = await this.callApi(endpoint);

    return {
      success: true,
      data: {
        tags: data.tags || [],
        count: data.count || 0,
        nextPage: data.next_page || null,
      },
    };
  }

  // ==================== Attachment Operations ====================

  private async uploadAttachment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const fileName = this.resolveValue(this.config.fileName, context);
    const fileData = this.resolveValue(this.config.fileData, context);

    if (!fileName || !fileData) {
      throw new Error('fileName and fileData are required');
    }

    const formData = new FormData();
    const blob = this.base64ToBlob(fileData);
    formData.append('file', blob, fileName);

    const response = await fetch(`${this.apiUrl}/uploads.json?filename=${encodeURIComponent(fileName)}`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: true,
      data: {
        upload: data.upload,
        token: data.upload?.token,
        message: 'File uploaded successfully',
      },
    };
  }

  private base64ToBlob(base64: string): Blob {
    const parts = base64.split(',');
    const mimeType = parts[0].match(/:(.*?);/)?.[1] || 'application/octet-stream';
    const byteString = atob(parts[1]);
    const bytes = new Uint8Array(byteString.length);

    for (let i = 0; i < byteString.length; i++) {
      bytes[i] = byteString.charCodeAt(i);
    }

    return new Blob([bytes], { type: mimeType });
  }

  private async deleteAttachment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const attachmentToken = this.resolveValue(this.config.attachmentToken, context);

    if (!attachmentToken) {
      throw new Error('attachmentToken is required');
    }

    await this.callApi(`/uploads/${attachmentToken}.json`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Attachment deleted successfully',
        attachmentToken,
      },
    };
  }

  private async getAttachment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const attachmentToken = this.resolveValue(this.config.attachmentToken, context);

    if (!attachmentToken) {
      throw new Error('attachmentToken is required');
    }

    const response = await fetch(`${this.apiUrl}/attachments/${attachmentToken}.json`, {
      headers: {
        ...this.getAuthHeaders(),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get attachment: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: true,
      data: {
        attachment: data.attachment || data,
      },
    };
  }

  // ==================== Satisfaction Rating Operations ====================

  private async listSatisfactionRatings(context: ExecutionContext): Promise<NodeExecutionResult> {
    const ticketId = this.resolveValue(this.config.ticketId, context);
    const page = this.config.page || 1;
    const perPage = Math.min(this.config.perPage || 100, 100);

    if (!ticketId) {
      throw new Error('ticketId is required');
    }

    const endpoint = `/tickets/${ticketId}/satisfaction_ratings.json?page=${page}&per_page=${perPage}`;
    const data = await this.callApi(endpoint);

    return {
      success: true,
      data: {
        ratings: data.satisfaction_ratings || [],
        count: data.count || 0,
        nextPage: data.next_page || null,
      },
    };
  }

  private async getSatisfactionRating(context: ExecutionContext): Promise<NodeExecutionResult> {
    const ratingId = this.resolveValue(this.config.ratingId, context);

    if (!ratingId) {
      throw new Error('ratingId is required');
    }

    const data = await this.callApi(`/satisfaction_ratings/${ratingId}.json`);

    return {
      success: true,
      data: {
        rating: data.satisfaction_rating || data,
      },
    };
  }

  // ==================== Ticket Field Operations ====================

  private async listTicketFields(): Promise<NodeExecutionResult> {
    const page = this.config.page || 1;
    const perPage = Math.min(this.config.perPage || 100, 100);

    const endpoint = `/ticket_fields.json?page=${page}&per_page=${perPage}`;
    const data = await this.callApi(endpoint);

    return {
      success: true,
      data: {
        ticketFields: data.ticket_fields || [],
        count: data.count || 0,
        nextPage: data.next_page || null,
      },
    };
  }

  private async getTicketField(context: ExecutionContext): Promise<NodeExecutionResult> {
    const fieldId = this.resolveValue(this.config.fieldId, context);

    if (!fieldId) {
      throw new Error('fieldId is required');
    }

    const data = await this.callApi(`/ticket_fields/${fieldId}.json`);

    return {
      success: true,
      data: {
        ticketField: data.ticket_field || data,
      },
    };
  }

  private async createTicketField(context: ExecutionContext): Promise<NodeExecutionResult> {
    const type = this.config.type;
    const title = this.resolveValue(this.config.title, context);
    const description = this.resolveValue(this.config.description, context) || null;
    const key = this.config.key || null;
    const options = this.config.options || [];
    const required = this.config.required || false;

    if (!type || !title) {
      throw new Error('type and title are required');
    }

    const ticketField: any = {
      type,
      title,
      required,
    };

    if (description) {
      ticketField.description = description;
    }
    if (key) {
      ticketField.key = key;
    }
    if (options.length > 0) {
      ticketField.custom_field_options = options;
    }

    const data = await this.callApi('/ticket_fields.json', 'POST', {
      ticket_field: ticketField,
    });

    return {
      success: true,
      data: {
        ticketField: data.ticket_field,
        message: 'Ticket field created successfully',
      },
    };
  }

  private async updateTicketField(context: ExecutionContext): Promise<NodeExecutionResult> {
    const fieldId = this.resolveValue(this.config.fieldId, context);

    if (!fieldId) {
      throw new Error('fieldId is required');
    }

    const ticketField: any = {};

    const type = this.config.type;
    const title = this.resolveValue(this.config.title, context);
    const description = this.resolveValue(this.config.description, context);
    const key = this.config.key;
    const options = this.config.options;
    const required = this.config.required;

    if (type) {
      ticketField.type = type;
    }
    if (title) {
      ticketField.title = title;
    }
    if (description) {
      ticketField.description = description;
    }
    if (key) {
      ticketField.key = key;
    }
    if (options) {
      ticketField.custom_field_options = options;
    }
    if (required !== undefined) {
      ticketField.required = required;
    }

    const data = await this.callApi(`/ticket_fields/${fieldId}.json`, 'PUT', {
      ticket_field: ticketField,
    });

    return {
      success: true,
      data: {
        ticketField: data.ticket_field,
        message: 'Ticket field updated successfully',
      },
    };
  }

  private async deleteTicketField(context: ExecutionContext): Promise<NodeExecutionResult> {
    const fieldId = this.resolveValue(this.config.fieldId, context);

    if (!fieldId) {
      throw new Error('fieldId is required');
    }

    await this.callApi(`/ticket_fields/${fieldId}.json`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Ticket field deleted successfully',
        fieldId,
      },
    };
  }

  // ==================== Audit Log Operations ====================

  private async listAuditLogs(context: ExecutionContext): Promise<NodeExecutionResult> {
    const page = this.config.page || 1;
    const perPage = Math.min(this.config.perPage || 100, 100);
    const sourceId = this.resolveValue(this.config.sourceId, context) || '';
    const sourceType = this.config.sourceType || '';
    const action = this.config.action || '';
    const startTime = this.resolveValue(this.config.startTime, context) || '';
    const endTime = this.resolveValue(this.config.endTime, context) || '';

    let endpoint = `/audit_logs.json?page=${page}&per_page=${perPage}`;

    if (sourceId) {
      endpoint += `&source_id=${sourceId}`;
    }
    if (sourceType) {
      endpoint += `&source_type=${sourceType}`;
    }
    if (action) {
      endpoint += `&action=${action}`;
    }
    if (startTime) {
      endpoint += `&start_time=${startTime}`;
    }
    if (endTime) {
      endpoint += `&end_time=${endTime}`;
    }

    const data = await this.callApi(endpoint);

    return {
      success: true,
      data: {
        auditLogs: data.audit_logs || [],
        count: data.count || 0,
        nextPage: data.next_page || null,
      },
    };
  }

  private async getAuditLog(context: ExecutionContext): Promise<NodeExecutionResult> {
    const auditLogId = this.resolveValue(this.config.auditLogId, context);

    if (!auditLogId) {
      throw new Error('auditLogId is required');
    }

    const data = await this.callApi(`/audit_logs/${auditLogId}.json`);

    return {
      success: true,
      data: {
        auditLog: data.audit_log || data,
      },
    };
  }

  // ==================== Static Helper Methods ====================

  static readonly TicketStatus = {
    New: 'new',
    Open: 'open',
    Pending: 'pending',
    Hold: 'hold',
    Solved: 'solved',
    Closed: 'closed',
  } as const;

  static readonly TicketType = {
    Question: 'question',
    Incident: 'incident',
    Problem: 'problem',
    Task: 'task',
  } as const;

  static readonly TicketPriority = {
    Urgent: 'urgent',
    High: 'high',
    Normal: 'normal',
    Low: 'low',
  } as const;

  static readonly UserRole = {
    Agent: 'agent',
    Admin: 'admin',
    EndUser: 'end-user',
  } as const;

  static readonly TicketFieldType = {
    Text: 'text',
    Textarea: 'textarea',
    Checkbox: 'checkbox',
    Date: 'date',
    Decimal: 'decimal',
    Integer: 'integer',
    Regexp: 'regexp',
    PartialCred: 'partialcredit',
    Multiselect: 'multiselect',
    Tagger: 'tagger',
  } as const;

  /**
   * Format Zendesk API error messages
   */
  static formatError(error: any): string {
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      if (Array.isArray(errors)) {
        return errors.map((e: any) => e.title || e.message || String(e)).join(', ');
      }
      return JSON.stringify(errors);
    }
    return error.message || 'Unknown Zendesk API error';
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Check if status is valid
   */
  static isValidStatus(status: string): boolean {
    return Object.values(ZendeskNode.TicketStatus).includes(status as any);
  }

  /**
   * Check if priority is valid
   */
  static isValidPriority(priority: string): boolean {
    return Object.values(ZendeskNode.TicketPriority).includes(priority as any);
  }
}
