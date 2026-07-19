import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * Notion Node - Notion workspace integration
 * n8n-compatible: Notion API operations (databases, pages, blocks, search)
 *
 * Configuration:
 * - operation: 'read' | 'create' | 'update' | 'append' | 'delete' | 'search' | 'getDatabase' | 'createDatabase'
 * - apiKey: Notion API integration token
 * - databaseId: Database ID (for database operations)
 * - pageId: Page ID (for page/block operations)
 * - properties: Page properties (for create/update)
 * - block: Block content (for append)
 * - query: Search query (for search)
 * - filter: Filter expression (for database query)
 * - sorts: Sort array (for database query)
 */
export class NotionNode extends BaseNode {
  private apiBaseUrl = 'https://api.notion.com/v1';

  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
    this.validateConfig();
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    if (!this.config.apiKey) {
      throw new Error('apiKey is required');
    }

    const operation = this.config.operation || 'read';
    const validOperations = [
      'read', 'create', 'update', 'append', 'delete', 'search',
      'getDatabase', 'createDatabase', 'getPage', 'getBlockChildren'
    ];

    if (!validOperations.includes(operation)) {
      throw new Error(`Invalid operation: ${operation}`);
    }
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const operation = this.config.operation || 'read';

      switch (operation) {
        case 'read':
          return await this.readDatabase(context);
        case 'create':
          return await this.createPage(context);
        case 'update':
          return await this.updatePage(context);
        case 'append':
          return await this.appendBlock(context);
        case 'delete':
          return await this.deletePage(context);
        case 'search':
          return await this.search(context);
        case 'getDatabase':
          return await this.getDatabase(context);
        case 'createDatabase':
          return await this.createDatabase(context);
        case 'getPage':
          return await this.getPage(context);
        case 'getBlockChildren':
          return await this.getBlockChildren(context);
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
   * Read database items
   */
  private async readDatabase(context: ExecutionContext): Promise<NodeExecutionResult> {
    const databaseId = this.resolveValue(this.config.databaseId, context);
    const filter = this.config.filter;
    const sorts = this.config.sorts;
    const startCursor = this.config.startCursor;
    const pageSize = this.config.pageSize || 100;

    if (!databaseId) {
      throw new Error('databaseId is required for read operation');
    }

    const payload: any = {
      page_size: pageSize,
    };

    if (filter) payload.filter = filter;
    if (sorts) payload.sorts = sorts;
    if (startCursor) payload.start_cursor = startCursor;

    const response = await this.callApi(`databases/${databaseId}/query`, 'POST', payload);

    // Parse results
    const results = response.results.map((page: any) => this.parseNotionPage(page));

    return {
      success: true,
      data: {
        results,
        count: results.length,
        hasMore: response.has_more,
        nextCursor: response.next_cursor,
      },
    };
  }

  /**
   * Create page in database
   */
  private async createPage(context: ExecutionContext): Promise<NodeExecutionResult> {
    const databaseId = this.resolveValue(this.config.databaseId, context);
    const properties = this.resolveValue(this.config.properties, context);
    const children = this.config.children; // Optional page content blocks

    if (!databaseId) {
      throw new Error('databaseId is required for create operation');
    }
    if (!properties || Object.keys(properties).length === 0) {
      throw new Error('properties are required for create operation');
    }

    const payload: any = {
      parent: { database_id: databaseId },
      properties,
    };

    if (children) {
      payload.children = children;
    }

    const response = await this.callApi('pages', 'POST', payload);

    return {
      success: true,
      data: {
        id: response.id,
        url: response.url,
        properties: this.parseNotionProperties(response.properties),
        created: true,
      },
    };
  }

  /**
   * Update page
   */
  private async updatePage(context: ExecutionContext): Promise<NodeExecutionResult> {
    const pageId = this.resolveValue(this.config.pageId, context);
    const properties = this.resolveValue(this.config.properties, context);
    const archived = this.config.archived;

    if (!pageId) {
      throw new Error('pageId is required for update operation');
    }
    if (!properties && archived === undefined) {
      throw new Error('properties or archived is required');
    }

    const payload: any = {};

    if (properties) {
      payload.properties = properties;
    }
    if (archived !== undefined) {
      payload.archived = archived;
    }

    const response = await this.callApi(`pages/${pageId}`, 'PATCH', payload);

    return {
      success: true,
      data: {
        id: response.id,
        url: response.url,
        properties: this.parseNotionProperties(response.properties),
        updated: true,
      },
    };
  }

  /**
   * Append block to page
   */
  private async appendBlock(context: ExecutionContext): Promise<NodeExecutionResult> {
    const pageId = this.resolveValue(this.config.pageId, context);
    const block = this.config.block;
    const children = this.config.children; // For multiple blocks

    if (!pageId) {
      throw new Error('pageId is required for append operation');
    }
    if (!block && !children) {
      throw new Error('block or children is required');
    }

    const payload: any = {
      children: children || [block],
    };

    const response = await this.callApi(`blocks/${pageId}/children`, 'PATCH', payload);

    const results = response.results.map((b: any) => ({
      id: b.id,
      type: b.type,
      content: b[b.type],
      hasChildren: b.has_children,
    }));

    return {
      success: true,
      data: {
        pageId,
        blocks: results,
        appended: true,
      },
    };
  }

  /**
   * Delete page (archive)
   */
  private async deletePage(context: ExecutionContext): Promise<NodeExecutionResult> {
    const pageId = this.resolveValue(this.config.pageId, context);

    if (!pageId) {
      throw new Error('pageId is required for delete operation');
    }

    const payload = {
      archived: true,
    };

    await this.callApi(`pages/${pageId}`, 'PATCH', payload);

    return {
      success: true,
      data: {
        id: pageId,
        deleted: true,
      },
    };
  }

  /**
   * Search Notion workspace
   */
  private async search(context: ExecutionContext): Promise<NodeExecutionResult> {
    const query = this.resolveValue(this.config.query, context);
    const filter = this.config.filter; // { value: 'page', property: 'object' }
    const sort = this.config.sort; // { direction: 'ascending', timestamp: 'last_edited_time' }
    const startCursor = this.config.startCursor;
    const pageSize = this.config.pageSize || 100;

    if (!query) {
      throw new Error('query is required for search operation');
    }

    const payload: any = {
      query,
      page_size: pageSize,
    };

    if (filter) payload.filter = filter;
    if (sort) payload.sort = sort;
    if (startCursor) payload.start_cursor = startCursor;

    const response = await this.callApi('search', 'POST', payload);

    const results = response.results.map((item: any) => ({
      id: item.id,
      type: item.object,
      title: this.extractTitle(item),
      url: item.url,
      lastEditedTime: item.last_edited_time,
      createdTime: item.created_time,
    }));

    return {
      success: true,
      data: {
        results,
        count: results.length,
        hasMore: response.has_more,
        nextCursor: response.next_cursor,
      },
    };
  }

  /**
   * Get database info
   */
  private async getDatabase(context: ExecutionContext): Promise<NodeExecutionResult> {
    const databaseId = this.resolveValue(this.config.databaseId, context);

    if (!databaseId) {
      throw new Error('databaseId is required for getDatabase operation');
    }

    const response = await this.callApi(`databases/${databaseId}`, 'GET');

    return {
      success: true,
      data: {
        id: response.id,
        title: response.title[0]?.plain_text || '',
        description: response.description?.[0]?.plain_text || '',
        properties: response.properties,
        createdTime: response.created_time,
        lastEditedTime: response.last_edited_time,
      },
    };
  }

  /**
   * Create database
   */
  private async createDatabase(context: ExecutionContext): Promise<NodeExecutionResult> {
    const parentPageId = this.config.parentPageId;
    const title = this.config.title || 'New Database';
    const properties = this.config.properties || {
      Name: {
        title: {},
      },
    };

    if (!parentPageId) {
      throw new Error('parentPageId is required for createDatabase operation');
    }

    const payload = {
      parent: {
        type: 'page_id',
        page_id: parentPageId,
      },
      title: [
        {
          type: 'text',
          text: {
            content: title,
          },
        },
      ],
      properties,
    };

    const response = await this.callApi('databases', 'POST', payload);

    return {
      success: true,
      data: {
        id: response.id,
        title: response.title[0]?.plain_text || title,
        url: response.url,
        created: true,
      },
    };
  }

  /**
   * Get page content
   */
  private async getPage(context: ExecutionContext): Promise<NodeExecutionResult> {
    const pageId = this.resolveValue(this.config.pageId, context);

    if (!pageId) {
      throw new Error('pageId is required for getPage operation');
    }

    const response = await this.callApi(`pages/${pageId}`, 'GET');

    return {
      success: true,
      data: {
        id: response.id,
        object: response.object,
        createdTime: response.created_time,
        lastEditedTime: response.last_edited_time,
        archived: response.archived,
        url: response.url,
        properties: this.parseNotionProperties(response.properties),
        parent: response.parent,
      },
    };
  }

  /**
   * Get block children (page content blocks)
   */
  private async getBlockChildren(context: ExecutionContext): Promise<NodeExecutionResult> {
    const blockId = this.resolveValue(this.config.blockId || this.config.pageId, context);
    const startCursor = this.config.startCursor;
    const pageSize = this.config.pageSize || 100;

    if (!blockId) {
      throw new Error('blockId or pageId is required for getBlockChildren operation');
    }

    const payload: any = {
      page_size: pageSize,
    };

    if (startCursor) payload.start_cursor = startCursor;

    const response = await this.callApi(`blocks/${blockId}/children`, 'GET', payload);

    const blocks = response.results.map((block: any) => ({
      id: block.id,
      type: block.type,
      content: block[block.type],
      hasChildren: block.has_children,
      createdTime: block.created_time,
      lastEditedTime: block.last_edited_time,
    }));

    return {
      success: true,
      data: {
        blockId,
        blocks,
        count: blocks.length,
        hasMore: response.has_more,
        nextCursor: response.next_cursor,
      },
    };
  }

  /**
   * Call Notion API
   */
  private async callApi(endpoint: string, method = 'GET', payload?: any): Promise<any> {
    const url = `${this.apiBaseUrl}/${endpoint}`;

    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
    };

    if (payload && method !== 'GET') {
      options.body = JSON.stringify(payload);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || response.statusText);
    }

    return await response.json();
  }

  /**
   * Parse Notion page properties
   */
  private parseNotionPage(page: any): any {
    const result: any = {
      id: page.id,
      createdTime: page.created_time,
      lastEditedTime: page.last_edited_time,
      url: page.url,
      archived: page.archived,
    };

    // Parse properties
    if (page.properties) {
      result.properties = this.parseNotionProperties(page.properties);
    }

    return result;
  }

  /**
   * Parse Notion properties to readable format
   */
  private parseNotionProperties(properties: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [key, prop] of Object.entries(properties)) {
      switch (prop.type) {
        case 'title':
          result[key] = prop.title?.[0]?.plain_text || '';
          break;
        case 'rich_text':
          result[key] = prop.rich_text?.[0]?.plain_text || '';
          break;
        case 'number':
          result[key] = prop.number;
          break;
        case 'select':
          result[key] = prop.select?.name || null;
          break;
        case 'multi_select':
          result[key] = prop.multi_select?.map((s: any) => s.name) || [];
          break;
        case 'date':
          result[key] = prop.date?.start || null;
          break;
        case 'checkbox':
          result[key] = prop.checkbox;
          break;
        case 'url':
          result[key] = prop.url || null;
          break;
        case 'email':
          result[key] = prop.email || null;
          break;
        case 'phone':
          result[key] = prop.phone || null;
          break;
        case 'formula':
          result[key] = prop.formula?.[this.config.resultType || 'string'] || null;
          break;
        case 'relation':
          result[key] = prop.relation?.map((r: any) => r.id) || [];
          break;
        case 'people':
          result[key] = prop.people?.map((p: any) => p.id) || [];
          break;
        case 'files':
          result[key] = prop.files?.map((f: any) => f.file?.url || f.external?.url) || [];
          break;
        case 'created_time':
          result[key] = prop.created_time;
          break;
        case 'created_by':
          result[key] = prop.created_by?.id;
          break;
        case 'last_edited_time':
          result[key] = prop.last_edited_time;
          break;
        case 'last_edited_by':
          result[key] = prop.last_edited_by?.id;
          break;
        default:
          result[key] = prop;
      }
    }

    return result;
  }

  /**
   * Extract title from Notion object
   */
  private extractTitle(item: any): string {
    if (item.properties?.Name?.title) {
      return item.properties.Name.title[0]?.plain_text || '';
    }
    if (item.properties?.Name?.rich_text) {
      return item.properties.Name.rich_text[0]?.plain_text || '';
    }
    if (item.properties?.title?.title) {
      return item.properties.title.title[0]?.plain_text || '';
    }
    if (item.title) {
      return item.title[0]?.plain_text || '';
    }
    return '';
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
    if (error.code === 'object_not_found') {
      return 'Notion object not found. Check the ID.';
    }
    if (error.code === 'unauthorized') {
      return 'Unauthorized. Check your API key.';
    }
    if (error.code === 'forbidden') {
      return 'Access denied. Insufficient permissions.';
    }
    if (error.code === 'conflict') {
      return 'Conflict. The item already exists or is in use.';
    }
    if (error.code === 'rate_limited') {
      return 'Rate limited. Too many requests to Notion API.';
    }
    if (error.code === 'validation_error') {
      return `Validation error: ${error.message}`;
    }
    return `Notion API error: ${error.message || 'Unknown error'}`;
  }

  getType(): string {
    return 'notion';
  }

  getIcon(): string {
    return 'Book';
  }

  /**
   * Create Notion property schema
   */
  static createProperty(type: string, options?: any): any {
    const prop: any = { type };

    switch (type) {
      case 'title':
        prop.title = {};
        break;
      case 'rich_text':
        prop.rich_text = {};
        break;
      case 'number':
        prop.number = { format: options?.format || 'number' };
        break;
      case 'select':
        prop.select = { options: options?.options || [] };
        break;
      case 'multi_select':
        prop.multi_select = { options: options?.options || [] };
        break;
      case 'date':
        prop.date = {};
        break;
      case 'checkbox':
        prop.checkbox = {};
        break;
      case 'url':
        prop.url = {};
        break;
      case 'email':
        prop.email = {};
        break;
      case 'phone':
        prop.phone = {};
        break;
      case 'formula':
        prop.formula = { expression: options?.expression || '' };
        break;
      case 'relation':
        prop.relation = { database_id: options?.databaseId || '' };
        break;
      case 'people':
        prop.people = {};
        break;
      case 'files':
        prop.files = {};
        break;
      case 'created_time':
        prop.created_time = {};
        break;
      case 'created_by':
        prop.created_by = {};
        break;
      default:
        throw new Error(`Unknown property type: ${type}`);
    }

    return prop;
  }

  /**
   * Create Notion block
   */
  static createBlock(type: string, content: any): any {
    const block: any = {
      object: 'block',
      type,
    };

    switch (type) {
      case 'paragraph':
        block.paragraph = {
          rich_text: [{ type: 'text', text: { content } }],
        };
        break;
      case 'heading_1':
        block.heading_1 = {
          rich_text: [{ type: 'text', text: { content } }],
        };
        break;
      case 'heading_2':
        block.heading_2 = {
          rich_text: [{ type: 'text', text: { content } }],
        };
        break;
      case 'heading_3':
        block.heading_3 = {
          rich_text: [{ type: 'text', text: { content } }],
        };
        break;
      case 'bulleted_list_item':
        block.bulleted_list_item = {
          rich_text: [{ type: 'text', text: { content } }],
        };
        break;
      case 'numbered_list_item':
        block.numbered_list_item = {
          rich_text: [{ type: 'text', text: { content } }],
        };
        break;
      case 'to_do':
        block.to_do = {
          rich_text: [{ type: 'text', text: { content } }],
          checked: options?.checked || false,
        };
        break;
      case 'toggle':
        block.toggle = {
          rich_text: [{ type: 'text', text: { content } }],
        };
        break;
      case 'code':
        block.code = {
          rich_text: [{ type: 'text', text: { content } }],
          language: options?.language || 'javascript',
        };
        break;
      case 'quote':
        block.quote = {
          rich_text: [{ type: 'text', text: { content } }],
        };
        break;
      case 'divider':
        block.divider = {};
        break;
      case 'callout':
        block.callout = {
          rich_text: [{ type: 'text', text: { content } }],
          icon: options?.emoji || '💡',
        };
        break;
      default:
        throw new Error(`Unknown block type: ${type}`);
    }

    return block;
  }

  /**
   * Create filter for database query
   */
  static createFilter(property: string, condition: string, value: any): any {
    return {
      property,
      [condition]: value,
    };
  }

  /**
   * Common filter conditions
   */
  static readonly FilterConditions = {
    equals: 'equals',
    doesNotEqual: 'does_not_equal',
    contains: 'contains',
    doesNotContain: 'does_not_contain',
    startsWith: 'starts_with',
    endsWith: 'ends_with',
    greaterThan: 'greater_than',
    lessThan: 'less_than',
    greaterThanOrEqualTo: 'greater_than_or_equal_to',
    lessThanOrEqualTo: 'less_than_or_equal_to',
    isEmpty: 'is_empty',
    isNotEmpty: 'is_not_empty',
  };
}
