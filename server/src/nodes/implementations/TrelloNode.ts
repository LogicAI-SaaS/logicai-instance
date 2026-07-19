import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * Trello Node - Trello board operations
 * n8n-compatible: Trello API integration
 *
 * Configuration:
 * - operation: 'getCards' | 'createCard' | 'updateCard' | 'deleteCard' | 'addComment' | 'getBoard' | 'getLists' | 'createList' | 'addMember'
 * - apiKey: Trello API key
 * - apiToken: Trello API token
 * - boardId: Board ID
 * - listId: List ID
 * - cardId: Card ID
 * - name: Card/list name
 * - desc: Description
 * - due: Due date
 * - labels: Array of label IDs or colors
 * - idLabels: Label IDs
 * - url: Card URL
 * - pos: Position
 * - comment: Comment text
 */
export class TrelloNode extends BaseNode {
  private apiBaseUrl = 'https://api.trello.com/1';

  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
    this.validateConfig();
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    if (!this.config.apiKey && !this.config.apiToken) {
      throw new Error('apiKey and apiToken are required');
    }

    const operation = this.config.operation || 'getCards';

    const validOperations = [
      'getCards', 'createCard', 'updateCard', 'deleteCard', 'addComment',
      'getBoard', 'getLists', 'createList', 'addMember', 'updateList', 'archiveList'
    ];

    if (!validOperations.includes(operation)) {
      throw new Error(`Invalid operation: ${operation}`);
    }
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const operation = this.config.operation || 'getCards';

      switch (operation) {
        case 'getCards':
          return await this.getCards(context);
        case 'createCard':
          return await this.createCard(context);
        case 'updateCard':
          return await this.updateCard(context);
        case 'deleteCard':
          return await this.deleteCard(context);
        case 'addComment':
          return await this.addComment(context);
        case 'getBoard':
          return await this.getBoard();
        case 'getLists':
          return await this.getLists();
        case 'createList':
          return await this.createList(context);
        case 'updateList':
          return await this.updateList(context);
        case 'archiveList':
          return await this.archiveList(context);
        case 'addMember':
          return await this.addMember(context);
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
   * Get cards from a list
   */
  private async getCards(context: ExecutionContext): Promise<NodeExecutionResult> {
    const listId = this.resolveValue(this.config.listId, context);
    const boardId = this.config.boardId;

    if (!boardId && !listId) {
      throw new Error('boardId or listId is required');
    }

    let url = '';
    if (listId) {
      url = `lists/${listId}/cards`;
    } else if (boardId) {
      url = `boards/${boardId}/cards`;
    }

    const cards = await this.callApi(url);

    return {
      success: true,
      data: {
        cards: cards.map((card: any) => ({
          id: card.id,
          name: card.name,
          desc: card.desc,
          url: card.url,
          shortUrl: card.shortUrl,
          due: card.due,
          closed: card.closed,
          labels: card.labels || [],
          idLabels: card.idLabels || [],
          idList: card.idList,
          idBoard: card.idBoard,
          idShort: card.idShort,
          pos: card.pos,
          shortLink: card.shortLink,
          dateLastActivity: card.dateLastActivity,
        })),
        count: cards.length,
      },
    };
  }

  /**
   * Create a new card
   */
  private async createCard(context: ExecutionContext): Promise<NodeExecutionResult> {
    const listId = this.resolveValue(this.config.listId, context);
    const name = this.resolveValue(this.config.name, context);
    const desc = this.resolveValue(this.config.desc, context);
    const due = this.config.due;
    const labels = this.config.labels;
    const idLabels = this.config.idLabels;
    const url = this.config.url;
    const pos = this.config.pos;

    if (!listId) {
      throw new Error('listId is required for createCard');
    }
    if (!name) {
      throw new Error('name is required for createCard');
    }

    const payload: any = {
      idList: listId,
      name,
    };

    if (desc) payload.desc = desc;
    if (due) payload.due = due;
    if (labels) payload.labels = labels;
    if (idLabels) payload.idLabels = idLabels;
    if (url) payload.url = url;
    if (pos !== undefined) payload.pos = pos;

    const card = await this.callApi(`cards`, 'POST', payload);

    return {
      success: true,
      data: {
        id: card.id,
        url: card.url,
        shortUrl: card.shortUrl,
        name: card.name,
        created: true,
      },
    };
  }

  /**
   * Update a card
   */
  private async updateCard(context: ExecutionContext): Promise<NodeExecutionResult> {
    const cardId = this.resolveValue(this.config.cardId, context);
    const name = this.config.name;
    const desc = this.config.desc;
    const closed = this.config.closed;
    const due = this.config.due;
    const labels = this.config.labels;
    const idLabels = this.config.idLabels;
    const pos = this.config.pos;

    if (!cardId) {
      throw new Error('cardId is required for updateCard');
    }

    const payload: any = {};

    if (name !== undefined) payload.name = name;
    if (desc !== undefined) payload.desc = desc;
    if (closed !== undefined) payload.closed = closed;
    if (due) payload.due = due;
    if (labels) payload.labels = labels;
    if (idLabels) payload.idLabels = idLabels;
    if (pos !== undefined) payload.pos = pos;

    const card = await this.callApi(`cards/${cardId}`, 'PUT', payload);

    return {
      success: true,
      data: {
        id: card.id,
        url: card.url,
        name: card.name,
        updated: true,
      },
    };
  }

  /**
   * Delete a card
   */
  private async deleteCard(context: ExecutionContext): Promise<NodeExecutionResult> {
    const cardId = this.resolveValue(this.config.cardId, context);

    if (!cardId) {
      throw new Error('cardId is required for deleteCard');
    }

    await this.callApi(`cards/${cardId}`, 'DELETE');

    return {
      success: true,
      data: {
        id: cardId,
        deleted: true,
      },
    };
  }

  /**
   * Add comment to card
   */
  private async addComment(context: ExecutionContext): Promise<NodeExecutionResult> {
    const cardId = this.resolveValue(this.config.cardId, context);
    const text = this.resolveValue(this.config.comment, context);

    if (!cardId) {
      throw new Error('cardId is required for addComment');
    }
    if (!text) {
      throw new Error('comment text is required');
    }

    const payload = {
      text,
    };

    const comment = await this.callApi(`cards/${cardId}/actions/comments`, 'POST', payload);

    return {
      success: true,
      data: {
        id: comment.id,
        text: comment.data.text,
        cardId,
        created: true,
      },
    };
  }

  /**
   * Get board information
   */
  private async getBoard(): Promise<NodeExecutionResult> {
    const boardId = this.config.boardId;

    if (!boardId) {
      throw new Error('boardId is required for getBoard');
    }

    const board = await this.callApi(`boards/${boardId}`);

    return {
      success: true,
      data: {
        id: board.id,
        name: board.name,
        desc: board.desc,
        closed: board.closed,
        url: board.url,
        prefs: board.prefs,
        labelNames: board.labelNames,
        lists: board.lists,
      },
    };
  }

  /**
   * Get lists from board
   */
  private async getLists(): Promise<NodeExecutionResult> {
    const boardId = this.config.boardId;
    const filter = this.config.filter; // 'open', 'closed', 'all'

    if (!boardId) {
      throw new Error('boardId is required for getLists');
    }

    let url = `boards/${boardId}/lists`;
    if (filter && filter !== 'all') {
      url += `/${filter}`;
    }

    const lists = await this.callApi(url);

    return {
      success: true,
      data: {
        lists: lists.map((list: any) => ({
          id: list.id,
          name: list.name,
          closed: list.closed,
          pos: list.pos,
          idBoard: list.idBoard,
          subscribed: list.subscribed,
        })),
        count: lists.length,
      },
    };
  }

  /**
   * Create a new list
   */
  private async createList(context: ExecutionContext): Promise<NodeExecutionResult> {
    const boardId = this.config.boardId;
    const name = this.resolveValue(this.config.name, context);
    const pos = this.config.pos;

    if (!boardId) {
      throw new Error('boardId is required for createList');
    }
    if (!name) {
      throw new Error('name is required for createList');
    }

    const payload: any = {
      name,
      idBoard: boardId,
    };

    if (pos !== undefined) payload.pos = pos;

    const list = await this.callApi(`lists`, 'POST', payload);

    return {
      success: true,
      data: {
        id: list.id,
        name: list.name,
        pos: list.pos,
        created: true,
      },
    };
  }

  /**
   * Update a list
   */
  private async updateList(context:ExecutionContext): Promise<NodeExecutionResult> {
    const listId = this.resolveValue(this.config.listId, context);
    const name = this.config.name;
    const closed = this.config.closed;
    const pos = this.config.pos;
    const subscribed = this.config.subscribed;

    if (!listId) {
      throw new Error('listId is required for updateList');
    }

    const payload: any = {};

    if (name !== undefined) payload.name = name;
    if (closed !== undefined) payload.closed = closed;
    if (pos !== undefined) payload.pos = pos;
    if (subscribed !== undefined) payload.subscribed = subscribed;

    const list = await this.callApi(`lists/${listId}`, 'PUT', payload);

    return {
      success: true,
      data: {
        id: list.id,
        name: list.name,
        updated: true,
      },
    };
  }

  /**
   * Archive a list
   */
  private async archiveList(context:ExecutionContext): Promise<NodeExecutionResult> {
    const listId = this.resolveValue(this.config.listId, context);

    if (!listId) {
      throw new Error('listId is required for archiveList');
    }

    const payload = {
      closed: true,
    };

    await this.callApi(`lists/${listId}`, 'PUT', payload);

    return {
      success: true,
      data: {
        id: listId,
        archived: true,
      },
    };
  }

  /**
   * Add member to card
   */
  private async addMember(context:ExecutionContext): Promise<NodeExecutionResult> {
    const cardId = this.resolveValue(this.config.cardId, context);
    const email = this.config.email;

    if (!cardId) {
      throw new Error('cardId is required for addMember');
    }
    if (!email) {
      throw new Error('email is required for addMember');
    }

    // First get member by email
    const members = await this.callApi(`search/members`, 'GET', { query: email });
    const member = members[0];

    if (!member) {
      throw new Error(`Member with email ${email} not found`);
    }

    const payload = {
      value: member.id,
    };

    await this.callApi(`cards/${cardId}/idMembers`, 'POST', payload);

    return {
      success: true,
      data: {
        cardId,
        memberId: member.id,
        memberEmail: member.email,
        added: true,
      },
    };
  }

  /**
   * Call Trello API
   */
  private async callApi(endpoint: string, method = 'GET', payload?: any): Promise<any> {
    let url = `${this.apiBaseUrl}/${endpoint}`;

    const options: RequestInit = {
      method,
      headers: {
        'Accept': 'application/json',
      },
    };

    // Add query parameters for GET requests
    if (method === 'GET' && payload) {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(payload)) {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      }
      url += `?${params.toString()}`;
    }

    // Add body for POST/PUT/DELETE
    if (method !== 'GET' && payload) {
      options.body = JSON.stringify(payload);
      options.headers = {
        ...options.headers,
        'Content-Type': 'application/json',
      };
    }

    // Add authentication
    const queryParams = new URLSearchParams();
    queryParams.set('key', this.config.apiKey);
    queryParams.set('token', this.config.apiToken);

    url += (url.includes('?') ? '&' : '?') + queryParams.toString();

    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || response.statusText);
    }

    return await response.json();
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
    if (error.message?.includes('invalid key')) {
      return 'Invalid API key or token';
    }
    if (error.message?.includes('not found')) {
      return 'Resource not found. Check the ID.';
    }
    if (error.message?.includes('unauthorized')) {
      return 'Unauthorized. Check your API permissions.';
    }
    if (error.message?.includes('not authorized')) {
      return 'Not authorized. Missing permissions.';
    }
    return `Trello API error: ${error.message || 'Unknown error'}`;
  }

  getType(): string {
    return 'trello';
  }

  getIcon(): string {
    return 'Trello';
  }

  /**
   * Get available label colors
   */
  static readonly LabelColors = {
    green: 'green',
    yellow: 'yellow',
    orange: 'orange',
    red: 'red',
    purple: 'purple',
    blue: 'blue',
    sky: 'sky',
    lime: 'lime',
    pink: 'pink',
    black: 'black',
  };

  /**
   * Create Trello label object
   */
  static createLabel(color: string, name?: string): any {
    return {
      color,
      ...(name && { name }),
    };
  }

  /**
   * Extract board ID from URL
   */
  static extractBoardId(url: string): string | null {
    const match = url.match(/b\/([a-zA-Z0-9-_]{8,})/);
    return match ? match[1] : null;
  }
}
