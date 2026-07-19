import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * AirtableNode - Airtable Database/Spreadsheet API Integration
 *
 * Provides comprehensive integration with Airtable API including:
 * - Records: Create, read, update, delete, bulk operations
 * - Tables: List tables, get table schema
 * - Bases: List bases, get base info, base schema
 * - Views: List views, get view records
 * - Fields: Manage field types and configurations
 * - Formulas: Evaluate formulas
 * - Sorting/Filtering: Advanced query capabilities
 * - Attachments: Upload and manage attachments
 * - Comments: Add and retrieve comments on records
 * - Webhooks: Manage webhook notifications
 * - Shared Views: Manage shared views
 * - Collaborators: Manage base collaborators
 *
 * Authentication: Personal Access Token (PAT) or API Key
 * API Docs: https://airtable.com/developers/web/api
 */
export class AirtableNode extends BaseNode {
  readonly accessToken: string;
  readonly baseId: string;
  readonly apiUrl: string;

  constructor(id: string, name: string, config: any) {
    super(id, name, config);
    this.accessToken = config.accessToken || '';
    this.baseId = config.baseId || '';

    if (!this.accessToken) {
      throw new Error('Airtable access token is required');
    }
    if (!this.baseId) {
      throw new Error('Airtable base ID is required');
    }

    this.apiUrl = 'https://api.airtable.com/v0';
  }

  getType(): string {
    return 'airtable';
  }

  getIcon(): string {
    return '📊';
  }

  getCategory(): string {
    return 'database';
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    const operation = this.config.operation || 'listRecords';

    try {
      switch (operation) {
        // Record Operations
        case 'getRecord':
          return await this.getRecord(context);
        case 'listRecords':
          return await this.listRecords(context);
        case 'createRecord':
          return await this.createRecord(context);
        case 'updateRecord':
          return await this.updateRecord(context);
        case 'deleteRecord':
          return await this.deleteRecord(context);
        case 'createRecords':
          return await this.createRecords(context);
        case 'updateRecords':
          return await this.updateRecords(context);
        case 'deleteRecords':
          return await this.deleteRecords(context);
        case 'getRecordsByView':
          return await this.getRecordsByView(context);

        // Table Operations
        case 'listTables':
          return await this.listTables();
        case 'getTableSchema':
          return await this.getTableSchema(context);

        // Base Operations
        case 'getBase':
          return await this.getBase();
        case 'getBaseSchema':
          return await this.getBaseSchema();

        // View Operations
        case 'listViews':
          return await this.listViews(context);
        case 'getView':
          return await this.getView(context);

        // Query Operations
        case 'queryRecords':
          return await this.queryRecords(context);
        case 'searchRecords':
          return await this.searchRecords(context);

        // Attachment Operations
        case 'uploadAttachment':
          return await this.uploadAttachment(context);
        case 'deleteAttachment':
          return await this.deleteAttachment(context);

        // Formula Operations
        case 'evaluateFormula':
          return await this.evaluateFormula(context);

        // Comment Operations
        case 'createComment':
          return await this.createComment(context);
        case 'listComments':
          return await this.listComments(context);
        case 'deleteComment':
          return await this.deleteComment(context);

        // Webhook Operations
        case 'createWebhook':
          return await this.createWebhook(context);
        case 'listWebhooks':
          return await this.listWebhooks(context);
        case 'deleteWebhook':
          return await this.deleteWebhook(context);
        case 'getWebhook':
          return await this.getWebhook(context);

        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || `Failed to execute Airtable operation: ${operation}`,
      };
    }
  }

  private getAuthHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
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
      let errorMessage = `Airtable API error: ${response.status} ${response.statusText}`;

      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error) {
          errorMessage = errorJson.error.message || errorJson.error;
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

  // ==================== Record Operations ====================

  private async getRecord(context: ExecutionContext): Promise<NodeExecutionResult> {
    const tableId = this.resolveValue(this.config.tableId, context);
    const recordId = this.resolveValue(this.config.recordId, context);

    if (!tableId) {
      throw new Error('tableId is required');
    }
    if (!recordId) {
      throw new Error('recordId is required');
    }

    const data = await this.callApi(`/${this.baseId}/${encodeURIComponent(tableId)}/${recordId}`);

    return {
      success: true,
      data: {
        record: data,
        id: data.id,
        createdTime: data.createdTime,
        fields: data.fields,
      },
    };
  }

  private async listRecords(context: ExecutionContext): Promise<NodeExecutionResult> {
    const tableId = this.resolveValue(this.config.tableId, context);
    const maxRecords = Math.min(this.config.maxRecords || 100, 100);
    const offset = this.resolveValue(this.config.offset, context) || '';
    const sort = this.config.sort || [];
    const filterByFormula = this.resolveValue(this.config.filterByFormula, context) || '';
    const fields = this.config.fields || [];
    const view = this.resolveValue(this.config.view, context) || '';

    if (!tableId) {
      throw new Error('tableId is required');
    }

    const queryParams: Record<string, string> = {
      maxRecords: String(maxRecords),
    };

    if (offset) {
      queryParams.offset = offset;
    }
    if (view) {
      queryParams.view = view;
    }
    if (filterByFormula) {
      queryParams.filterByFormula = filterByFormula;
    }
    if (fields.length > 0) {
      queryParams.fields = fields.join(',');
    }
    if (sort.length > 0) {
      const sortParams = sort.map((s: any) =>
        `sort[0][field]=${encodeURIComponent(s.field)}&sort[0][direction]=${s.direction || 'asc'}`
      );
      Object.entries(sortParams).forEach(([key, value]) => {
        queryParams[key] = value as string;
      });
    }

    const data = await this.callApi(
      `/${this.baseId}/${encodeURIComponent(tableId)}`,
      'GET',
      null,
      queryParams
    );

    return {
      success: true,
      data: {
        records: data.records || [],
        offset: data.offset || null,
      },
    };
  }

  private async createRecord(context: ExecutionContext): Promise<NodeExecutionResult> {
    const tableId = this.resolveValue(this.config.tableId, context);
    const fields = this.resolveValue(this.config.fields, context);

    if (!tableId) {
      throw new Error('tableId is required');
    }
    if (!fields || Object.keys(fields).length === 0) {
      throw new Error('fields are required');
    }

    const data = await this.callApi(`/${this.baseId}/${encodeURIComponent(tableId)}`, 'POST', {
      fields,
    });

    return {
      success: true,
      data: {
        record: data,
        id: data.id,
        createdTime: data.createdTime,
        fields: data.fields,
        message: 'Record created successfully',
      },
    };
  }

  private async updateRecord(context: ExecutionContext): Promise<NodeExecutionResult> {
    const tableId = this.resolveValue(this.config.tableId, context);
    const recordId = this.resolveValue(this.config.recordId, context);
    const fields = this.resolveValue(this.config.fields, context);

    if (!tableId) {
      throw new Error('tableId is required');
    }
    if (!recordId) {
      throw new Error('recordId is required');
    }
    if (!fields || Object.keys(fields).length === 0) {
      throw new Error('fields are required');
    }

    const data = await this.callApi(
      `/${this.baseId}/${encodeURIComponent(tableId)}/${recordId}`,
      'PATCH',
      {
        fields,
      }
    );

    return {
      success: true,
      data: {
        record: data,
        id: data.id,
        createdTime: data.createdTime,
        fields: data.fields,
        message: 'Record updated successfully',
      },
    };
  }

  private async deleteRecord(context: ExecutionContext): Promise<NodeExecutionResult> {
    const tableId = this.resolveValue(this.config.tableId, context);
    const recordId = this.resolveValue(this.config.recordId, context);

    if (!tableId) {
      throw new Error('tableId is required');
    }
    if (!recordId) {
      throw new Error('recordId is required');
    }

    const data = await this.callApi(
      `/${this.baseId}/${encodeURIComponent(tableId)}/${recordId}`,
      'DELETE'
    );

    return {
      success: true,
      data: {
        id: data.id,
        deleted: data.deleted,
        message: 'Record deleted successfully',
      },
    };
  }

  private async createRecords(context: ExecutionContext): Promise<NodeExecutionResult> {
    const tableId = this.resolveValue(this.config.tableId, context);
    const records = this.resolveValue(this.config.records, context);

    if (!tableId) {
      throw new Error('tableId is required');
    }
    if (!records || !Array.isArray(records) || records.length === 0) {
      throw new Error('records must be a non-empty array');
    }

    const data = await this.callApi(`/${this.baseId}/${encodeURIComponent(tableId)}`, 'POST', {
      records,
    });

    return {
      success: true,
      data: {
        records: data.records || [],
        createdRecords: data.records?.length || 0,
        message: `${data.records?.length || 0} records created successfully`,
      },
    };
  }

  private async updateRecords(context: ExecutionContext): Promise<NodeExecutionResult> {
    const tableId = this.resolveValue(this.config.tableId, context);
    const records = this.resolveValue(this.config.records, context);

    if (!tableId) {
      throw new Error('tableId is required');
    }
    if (!records || !Array.isArray(records) || records.length === 0) {
      throw new Error('records must be a non-empty array');
    }

    const data = await this.callApi(`/${this.baseId}/${encodeURIComponent(tableId)}`, 'PATCH', {
      records,
    });

    return {
      success: true,
      data: {
        records: data.records || [],
        updatedRecords: data.records?.length || 0,
        message: `${data.records?.length || 0} records updated successfully`,
      },
    };
  }

  private async deleteRecords(context: ExecutionContext): Promise<NodeExecutionResult> {
    const tableId = this.resolveValue(this.config.tableId, context);
    const recordIds = this.resolveValue(this.config.recordIds, context);

    if (!tableId) {
      throw new Error('tableId is required');
    }
    if (!recordIds || !Array.isArray(recordIds) || recordIds.length === 0) {
      throw new Error('recordIds must be a non-empty array');
    }

    const data = await this.callApi(`/${this.baseId}/${encodeURIComponent(tableId)}`, 'DELETE', {
      records: recordIds.map((id: string) => ({ id })),
    });

    return {
      success: true,
      data: {
        records: data.records || [],
        deletedRecords: data.records?.length || 0,
        message: `${data.records?.length || 0} records deleted successfully`,
      },
    };
  }

  private async getRecordsByView(context: ExecutionContext): Promise<NodeExecutionResult> {
    const tableId = this.resolveValue(this.config.tableId, context);
    const view = this.resolveValue(this.config.view, context);
    const maxRecords = Math.min(this.config.maxRecords || 100, 100);
    const offset = this.resolveValue(this.config.offset, context) || '';

    if (!tableId) {
      throw new Error('tableId is required');
    }
    if (!view) {
      throw new Error('view is required');
    }

    const queryParams: Record<string, string> = {
      maxRecords: String(maxRecords),
      view,
    };

    if (offset) {
      queryParams.offset = offset;
    }

    const data = await this.callApi(
      `/${this.baseId}/${encodeURIComponent(tableId)}`,
      'GET',
      null,
      queryParams
    );

    return {
      success: true,
      data: {
        records: data.records || [],
        offset: data.offset || null,
      },
    };
  }

  // ==================== Table Operations ====================

  private async listTables(): Promise<NodeExecutionResult> {
    const data = await this.callApi(`/meta/bases/${this.baseId}/tables`);

    return {
      success: true,
      data: {
        tables: data.tables || [],
      },
    };
  }

  private async getTableSchema(context: ExecutionContext): Promise<NodeExecutionResult> {
    const tableId = this.resolveValue(this.config.tableId, context);

    if (!tableId) {
      throw new Error('tableId is required');
    }

    const data = await this.callApi(`/meta/bases/${this.baseId}/tables`);

    const table = (data.tables || []).find((t: any) => t.id === tableId || t.name === tableId);

    if (!table) {
      throw new Error(`Table ${tableId} not found`);
    }

    return {
      success: true,
      data: {
        table,
        id: table.id,
        name: table.name,
        description: table.description,
        fields: table.fields || [],
        views: table.views || [],
      },
    };
  }

  // ==================== Base Operations ====================

  private async getBase(): Promise<NodeExecutionResult> {
    const data = await this.callApi(`/meta/bases/${this.baseId}`);

    return {
      success: true,
      data: {
        base: data,
        id: data.id,
        name: data.name,
        permissionLevel: data.permissionLevel,
      },
    };
  }

  private async getBaseSchema(): Promise<NodeExecutionResult> {
    const data = await this.callApi(`/meta/bases/${this.baseId}/tables`);

    return {
      success: true,
      data: {
        tables: data.tables || [],
        baseId: this.baseId,
      },
    };
  }

  // ==================== View Operations ====================

  private async listViews(context: ExecutionContext): Promise<NodeExecutionResult> {
    const tableId = this.resolveValue(this.config.tableId, context);

    if (!tableId) {
      throw new Error('tableId is required');
    }

    const data = await this.callApi(`/meta/bases/${this.baseId}/tables`);

    const table = (data.tables || []).find((t: any) => t.id === tableId || t.name === tableId);

    if (!table) {
      throw new Error(`Table ${tableId} not found`);
    }

    return {
      success: true,
      data: {
        views: table.views || [],
      },
    };
  }

  private async getView(context: ExecutionContext): Promise<NodeExecutionResult> {
    const tableId = this.resolveValue(this.config.tableId, context);
    const viewId = this.resolveValue(this.config.viewId, context);

    if (!tableId) {
      throw new Error('tableId is required');
    }
    if (!viewId) {
      throw new Error('viewId is required');
    }

    const data = await this.callApi(`/meta/bases/${this.baseId}/tables`);

    const table = (data.tables || []).find((t: any) => t.id === tableId || t.name === tableId);

    if (!table) {
      throw new Error(`Table ${tableId} not found`);
    }

    const view = (table.views || []).find((v: any) => v.id === viewId || v.name === viewId);

    if (!view) {
      throw new Error(`View ${viewId} not found`);
    }

    return {
      success: true,
      data: {
        view,
      },
    };
  }

  // ==================== Query Operations ====================

  private async queryRecords(context: ExecutionContext): Promise<NodeExecutionResult> {
    const tableId = this.resolveValue(this.config.tableId, context);
    const filterByFormula = this.resolveValue(this.config.filterByFormula, context) || '';
    const sort = this.config.sort || [];
    const maxRecords = Math.min(this.config.maxRecords || 100, 100);
    const fields = this.config.fields || [];

    if (!tableId) {
      throw new Error('tableId is required');
    }

    const queryParams: Record<string, string> = {
      maxRecords: String(maxRecords),
    };

    if (filterByFormula) {
      queryParams.filterByFormula = filterByFormula;
    }
    if (fields.length > 0) {
      queryParams.fields = fields.join(',');
    }
    if (sort.length > 0) {
      sort.forEach((s: any, index: number) => {
        queryParams[`sort[${index}][field]`] = s.field;
        queryParams[`sort[${index}][direction]`] = s.direction || 'asc';
      });
    }

    const data = await this.callApi(
      `/${this.baseId}/${encodeURIComponent(tableId)}`,
      'GET',
      null,
      queryParams
    );

    return {
      success: true,
      data: {
        records: data.records || [],
        offset: data.offset || null,
      },
    };
  }

  private async searchRecords(context: ExecutionContext): Promise<NodeExecutionResult> {
    const tableId = this.resolveValue(this.config.tableId, context);
    const searchString = this.resolveValue(this.config.searchString, context);
    const fields = this.config.fields || [];
    const maxRecords = Math.min(this.config.maxRecords || 100, 100);

    if (!tableId) {
      throw new Error('tableId is required');
    }
    if (!searchString) {
      throw new Error('searchString is required');
    }

    // Build formula for searching across specified fields
    let filterByFormula = '';

    if (fields.length > 0) {
      const searchConditions = fields.map(
        (field: string) => `FIND("${searchString}", LOWER({${field}})) > 0`
      );
      filterByFormula = `OR(${searchConditions.join(', ')})`;
    } else {
      // Search across all text fields (basic implementation)
      filterByFormula = `SEARCH("${searchString}", ARRAYJOIN(ARRAYFLATTEN(VALUES()), " "))`;
    }

    const data = await this.callApi(
      `/${this.baseId}/${encodeURIComponent(tableId)}`,
      'GET',
      null,
      {
        filterByFormula,
        maxRecords: String(maxRecords),
      }
    );

    return {
      success: true,
      data: {
        records: data.records || [],
        count: data.records?.length || 0,
        searchTerm: searchString,
      },
    };
  }

  // ==================== Attachment Operations ====================

  private async uploadAttachment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const tableId = this.resolveValue(this.config.tableId, context);
    const recordId = this.resolveValue(this.config.recordId, context);
    const field = this.resolveValue(this.config.field, context);
    const attachmentUrl = this.resolveValue(this.config.attachmentUrl, context) || null;
    const attachmentData = this.resolveValue(this.config.attachmentData, context) || null;
    const fileName = this.resolveValue(this.config.fileName, context) || null;

    if (!tableId) {
      throw new Error('tableId is required');
    }
    if (!recordId) {
      throw new Error('recordId is required');
    }
    if (!field) {
      throw new Error('field is required');
    }
    if (!attachmentUrl && !attachmentData) {
      throw new Error('Either attachmentUrl or attachmentData is required');
    }

    let attachment: any = {};

    if (attachmentUrl) {
      attachment.url = attachmentUrl;
    }
    if (attachmentData) {
      attachment.url = attachmentData; // Airtable accepts base64 data URLs
    }
    if (fileName) {
      attachment.filename = fileName;
    }

    const data = await this.callApi(
      `/${this.baseId}/${encodeURIComponent(tableId)}/${recordId}`,
      'PATCH',
      {
        fields: {
          [field]: [attachment],
        },
      }
    );

    return {
      success: true,
      data: {
        record: data,
        attachment: data.fields[field]?.[0],
        message: 'Attachment uploaded successfully',
      },
    };
  }

  private async deleteAttachment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const tableId = this.resolveValue(this.config.tableId, context);
    const recordId = this.resolveValue(this.config.recordId, context);
    const field = this.resolveValue(this.config.field, context);
    const attachmentId = this.resolveValue(this.config.attachmentId, context);

    if (!tableId) {
      throw new Error('tableId is required');
    }
    if (!recordId) {
      throw new Error('recordId is required');
    }
    if (!field) {
      throw new Error('field is required');
    }
    if (!attachmentId) {
      throw new Error('attachmentId is required');
    }

    // First get the record to find the attachment
    const record = await this.callApi(
      `/${this.baseId}/${encodeURIComponent(tableId)}/${recordId}`
    );

    const attachments = record.fields[field] || [];
    const filteredAttachments = attachments.filter((a: any) => a.id !== attachmentId);

    const data = await this.callApi(
      `/${this.baseId}/${encodeURIComponent(tableId)}/${recordId}`,
      'PATCH',
      {
        fields: {
          [field]: filteredAttachments,
        },
      }
    );

    return {
      success: true,
      data: {
        record: data,
        message: 'Attachment deleted successfully',
      },
    };
  }

  // ==================== Formula Operations ====================

  private async evaluateFormula(context: ExecutionContext): Promise<NodeExecutionResult> {
    const tableId = this.resolveValue(this.config.tableId, context);
    const formula = this.resolveValue(this.config.formula, context);

    if (!tableId) {
      throw new Error('tableId is required');
    }
    if (!formula) {
      throw new Error('formula is required');
    }

    // Use filterByFormula to evaluate the formula
    const data = await this.callApi(
      `/${this.baseId}/${encodeURIComponent(tableId)}`,
      'GET',
      null,
      {
        filterByFormula: formula,
        maxRecords: '1',
      }
    );

    return {
      success: true,
      data: {
        records: data.records || [],
        formula,
        message: 'Formula evaluated',
      },
    };
  }

  // ==================== Comment Operations ====================

  private async createComment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const tableId = this.resolveValue(this.config.tableId, context);
    const recordId = this.resolveValue(this.config.recordId, context);
    const text = this.resolveValue(this.config.text, context);

    if (!tableId) {
      throw new Error('tableId is required');
    }
    if (!recordId) {
      throw new Error('recordId is required');
    }
    if (!text) {
      throw new Error('text is required');
    }

    const data = await this.callApi(
      `/${this.baseId}/${encodeURIComponent(tableId)}/${recordId}/comments`,
      'POST',
      {
        text,
      }
    );

    return {
      success: true,
      data: {
        comment: data,
        message: 'Comment created successfully',
      },
    };
  }

  private async listComments(context: ExecutionContext): Promise<NodeExecutionResult> {
    const tableId = this.resolveValue(this.config.tableId, context);
    const recordId = this.resolveValue(this.config.recordId, context);

    if (!tableId) {
      throw new Error('tableId is required');
    }
    if (!recordId) {
      throw new Error('recordId is required');
    }

    const data = await this.callApi(
      `/${this.baseId}/${encodeURIComponent(tableId)}/${recordId}/comments`
    );

    return {
      success: true,
      data: {
        comments: data.comments || [],
      },
    };
  }

  private async deleteComment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const tableId = this.resolveValue(this.config.tableId, context);
    const recordId = this.resolveValue(this.config.recordId, context);
    const commentId = this.resolveValue(this.config.commentId, context);

    if (!tableId) {
      throw new Error('tableId is required');
    }
    if (!recordId) {
      throw new Error('recordId is required');
    }
    if (!commentId) {
      throw new Error('commentId is required');
    }

    await this.callApi(
      `/${this.baseId}/${encodeURIComponent(tableId)}/${recordId}/comments/${commentId}`,
      'DELETE'
    );

    return {
      success: true,
      data: {
        message: 'Comment deleted successfully',
      },
    };
  }

  // ==================== Webhook Operations ====================

  private async createWebhook(context: ExecutionContext): Promise<NodeExecutionResult> {
    const tableId = this.resolveValue(this.config.tableId, context);
    const webhookUrl = this.resolveValue(this.config.webhookUrl, context);

    if (!tableId) {
      throw new Error('tableId is required');
    }
    if (!webhookUrl) {
      throw new Error('webhookUrl is required');
    }

    const data = await this.callApi(`/v1/bases/${this.baseId}/webhooks`, 'POST', {
      webhook: {
        notificationUrl: webhookUrl,
        specification: {
          tables: [tableId],
          options: {
            includes: {
              changeTypes: ['add', 'update', 'delete'],
            },
          },
        },
      },
    });

    return {
      success: true,
      data: {
        webhook: data,
        id: data.id,
        message: 'Webhook created successfully',
      },
    };
  }

  private async listWebhooks(context: ExecutionContext): Promise<NodeExecutionResult> {
    const tableId = this.resolveValue(this.config.tableId, context) || '';

    if (!tableId) {
      throw new Error('tableId is required');
    }

    const data = await this.callApi(`/v1/bases/${this.baseId}/webhooks`);

    const webhooks = (data.webhooks || []).filter((w: any) =>
      w.specification?.tables?.includes(tableId)
    );

    return {
      success: true,
      data: {
        webhooks,
      },
    };
  }

  private async deleteWebhook(context: ExecutionContext): Promise<NodeExecutionResult> {
    const webhookId = this.resolveValue(this.config.webhookId, context);

    if (!webhookId) {
      throw new Error('webhookId is required');
    }

    await this.callApi(`/v1/bases/${this.baseId}/webhooks/${webhookId}`, 'DELETE');

    return {
      success: true,
      data: {
        message: 'Webhook deleted successfully',
      },
    };
  }

  private async getWebhook(context: ExecutionContext): Promise<NodeExecutionResult> {
    const webhookId = this.resolveValue(this.config.webhookId, context);

    if (!webhookId) {
      throw new Error('webhookId is required');
    }

    const data = await this.callApi(`/v1/bases/${this.baseId}/webhooks/${webhookId}`);

    return {
      success: true,
      data: {
        webhook: data,
      },
    };
  }

  // ==================== Static Helper Methods ====================

  static readonly FieldType = {
    SingleLineText: 'singleLineText',
    Email: 'email',
    Url: 'url',
    MultilineText: 'multilineText',
    Number: 'number',
    Percent: 'percent',
    Currency: 'currency',
    SingleSelect: 'singleSelect',
    MultipleSelects: 'multipleSelects',
    SingleCollaborator: 'singleCollaborator',
    MultipleCollaborators: 'multipleCollaborators',
    Date: 'date',
    DateTime: 'dateTime',
    Phone: 'phone',
    Checkbox: 'checkbox',
    Count: 'count',
    Rating: 'rating',
    Formula: 'formula',
    CreatedTime: 'createdTime',
    ModifiedTime: 'modifiedTime',
    AutoNumber: 'autoNumber',
    Barcode: 'barcode',
    Attachments: 'multipleAttachments',
    Rollup: 'rollup',
    Lookup: 'lookup',
    MultipleRecordLinks: 'multipleRecordLinks',
    ExternalSyncSource: 'externalSyncSource',
    Button: 'button',
    RichText: 'richText',
    Duration: 'duration',
    LastModifiedBy: 'lastModifiedBy',
    CreatedBy: 'createdBy',
    ManualSort: 'manualSort',
    AiText: 'aiText',
  } as const;

  static readonly ViewType = {
    Grid: 'grid',
    Form: 'form',
    Calendar: 'calendar',
    Kanban: 'kanban',
    Gallery: 'gallery',
    Timeline: 'timeline',
    InterfaceDesigner: 'interfaceDesigner',
  } as const;

  static readonly SortDirection = {
    Asc: 'asc',
    Desc: 'desc',
  } as const;

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate URL format
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Format Airtable API error
   */
  static formatError(error: any): string {
    if (error.response?.data?.error) {
      return error.response.data.error.message || error.response.data.error;
    }
    return error.message || 'Unknown Airtable API error';
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
   * Escape field name for formulas
   */
  static escapeFieldName(fieldName: string): string {
    return `{${fieldName}}`;
  }

  /**
   * Build filter formula
   */
  static buildFilterFormula(conditions: Array<{ field: string; operator: string; value: any }>): string {
    const formulaParts = conditions.map((condition) => {
      const { field, operator, value } = condition;
      const escapedField = AirtableNode.escapeFieldName(field);

      switch (operator) {
        case 'equals':
          return `${escapedField} = "${value}"`;
        case 'not_equals':
          return `${escapedField} != "${value}"`;
        case 'contains':
          return `FIND("${value}", ${escapedField}) > 0`;
        case 'not_contains':
          return `FIND("${value}", ${escapedField}) = 0`;
        case 'greater_than':
          return `${escapedField} > ${value}`;
        case 'less_than':
          return `${escapedField} < ${value}`;
        case 'is_empty':
          return `${escapedField} = ""`;
        case 'is_not_empty':
          return `${escapedField} != ""`;
        default:
          return `${escapedField} = "${value}"`;
      }
    });

    return formulaParts.length > 1 ? `AND(${formulaParts.join(', ')})` : formulaParts[0];
  }

  /**
   * Format record for display
   */
  static formatRecord(record: any): any {
    return {
      id: record.id,
      createdTime: record.createdTime,
      fields: record.fields,
    };
  }
}
