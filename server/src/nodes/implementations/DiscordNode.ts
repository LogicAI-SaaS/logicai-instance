import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * Discord Node - Discord bot/webhook integration
 * n8n-compatible: Discord server operations
 *
 * Configuration:
 * - operation: 'send' | 'edit' | 'delete' | 'getChannel' | 'createChannel' | 'addRole'
 * - resource: 'webhook' | 'bot' (webhook uses URL, bot uses token)
 * - webhookUrl: Discord webhook URL (for webhook operations)
 * - botToken: Discord bot token (for bot API operations)
 * - serverId: Discord server/guild ID (for bot operations)
 * - channelId: Discord channel ID
 * - content: Message content
 * - embeds: Array of Discord embed objects
 * - username: Override username (webhook only)
 * - avatarUrl: Override avatar (webhook only)
 */
export class DiscordNode extends BaseNode {
  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
    this.validateConfig();
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    const operation = this.config.operation || 'send';
    const resource = this.config.resource || 'webhook';

    if (!['send', 'edit', 'delete', 'getChannel', 'createChannel', 'addRole'].includes(operation)) {
      throw new Error(`Invalid operation: ${operation}`);
    }

    if (resource === 'webhook' && !this.config.webhookUrl) {
      throw new Error('webhookUrl is required for webhook resource');
    }

    if (resource === 'bot' && !this.config.botToken) {
      throw new Error('botToken is required for bot resource');
    }

    if (this.config.embeds && !Array.isArray(this.config.embeds)) {
      throw new Error('embeds must be an array');
    }
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const operation = this.config.operation || 'send';
      const resource = this.config.resource || 'webhook';

      switch (operation) {
        case 'send':
          return resource === 'webhook'
            ? await this.sendWebhook(context)
            : await this.sendBotMessage(context);
        case 'edit':
          return resource === 'webhook'
            ? await this.editWebhook(context)
            : await this.editBotMessage(context);
        case 'delete':
          return resource === 'webhook'
            ? await this.deleteWebhook(context)
            : await this.deleteBotMessage(context);
        case 'getChannel':
          return await this.getChannel(context);
        case 'createChannel':
          return await this.createChannel(context);
        case 'addRole':
          return await this.addRole(context);
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
   * Send message via webhook
   */
  private async sendWebhook(context: ExecutionContext): Promise<NodeExecutionResult> {
    const webhookUrl = this.resolveValue(this.config.webhookUrl, context);
    const content = this.resolveValue(this.config.content, context) || this.getNestedValue(context.$json, 'message');
    const username = this.config.username;
    const avatarUrl = this.config.avatarUrl;
    const embeds = this.config.embeds || [];
    const components = this.config.components; // Buttons, select menus

    const payload: any = {};

    if (content) payload.content = content;
    if (username) payload.username = username;
    if (avatarUrl) payload.avatar_url = avatarUrl;
    if (embeds.length > 0) payload.embeds = embeds;
    if (components) payload.components = components;

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || response.statusText);
    }

    const data = await response.json();

    return {
      success: true,
      data: {
        id: data.id,
        content: data.content,
        channelId: data.channel_id,
        guildId: data.guild_id,
        sent: true,
      },
    };
  }

  /**
   * Edit webhook message
   */
  private async editWebhook(context: ExecutionContext): Promise<NodeExecutionResult> {
    const webhookUrl = this.resolveValue(this.config.webhookUrl, context);
    const messageId = this.config.messageId;
    const content = this.resolveValue(this.config.content, context);
    const embeds = this.config.embeds;

    if (!messageId) {
      throw new Error('messageId is required for edit operation');
    }

    const payload: any = {};
    if (content) payload.content = content;
    if (embeds) payload.embeds = embeds;

    const response = await fetch(`${webhookUrl}/messages/${messageId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || response.statusText);
    }

    const data = await response.json();

    return {
      success: true,
      data: {
        id: data.id,
        content: data.content,
        edited: true,
        editedTimestamp: data.edited_timestamp,
      },
    };
  }

  /**
   * Delete webhook message
   */
  private async deleteWebhook(context: ExecutionContext): Promise<NodeExecutionResult> {
    const webhookUrl = this.resolveValue(this.config.webhookUrl, context);
    const messageId = this.config.messageId;

    if (!messageId) {
      throw new Error('messageId is required for delete operation');
    }

    const response = await fetch(`${webhookUrl}/messages/${messageId}`, {
      method: 'DELETE',
    });

    if (!response.ok && response.status !== 204) {
      const error = await response.json();
      throw new Error(error.message || response.statusText);
    }

    return {
      success: true,
      data: {
        id: messageId,
        deleted: true,
      },
    };
  }

  /**
   * Send message via bot
   */
  private async sendBotMessage(context: ExecutionContext): Promise<NodeExecutionResult> {
    const botToken = this.config.botToken;
    const channelId = this.config.channelId;
    const content = this.resolveValue(this.config.content, context) || this.getNestedValue(context.$json, 'message');
    const embeds = this.config.embeds || [];

    if (!channelId) {
      throw new Error('channelId is required for bot send');
    }

    const payload: any = {};
    if (content) payload.content = content;
    if (embeds.length > 0) payload.embeds = embeds;

    const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || response.statusText);
    }

    const data = await response.json();

    return {
      success: true,
      data: {
        id: data.id,
        content: data.content,
        channelId: data.channel_id,
        guildId: data.guild_id,
        author: data.author,
        sent: true,
      },
    };
  }

  /**
   * Edit bot message
   */
  private async editBotMessage(context: ExecutionContext): Promise<NodeExecutionResult> {
    const botToken = this.config.botToken;
    const channelId = this.config.channelId;
    const messageId = this.config.messageId;
    const content = this.resolveValue(this.config.content, context);
    const embeds = this.config.embeds;

    if (!channelId || !messageId) {
      throw new Error('channelId and messageId are required for bot edit');
    }

    const payload: any = {};
    if (content) payload.content = content;
    if (embeds) payload.embeds = embeds;

    const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || response.statusText);
    }

    const data = await response.json();

    return {
      success: true,
      data: {
        id: data.id,
        content: data.content,
        edited: true,
        editedTimestamp: data.edited_timestamp,
      },
    };
  }

  /**
   * Delete bot message
   */
  private async deleteBotMessage(context: ExecutionContext): Promise<NodeExecutionResult> {
    const botToken = this.config.botToken;
    const channelId = this.config.channelId;
    const messageId = this.config.messageId;

    if (!channelId || !messageId) {
      throw new Error('channelId and messageId are required for bot delete');
    }

    const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bot ${botToken}`,
      },
    });

    if (!response.ok && response.status !== 204) {
      const error = await response.json();
      throw new Error(error.message || response.statusText);
    }

    return {
      success: true,
      data: {
        id: messageId,
        deleted: true,
      },
    };
  }

  /**
   * Get channel information
   */
  private async getChannel(context: ExecutionContext): Promise<NodeExecutionResult> {
    const botToken = this.config.botToken;
    const channelId = this.config.channelId;

    if (!channelId) {
      throw new Error('channelId is required for getChannel');
    }

    const response = await fetch(`https://discord.com/api/v10/channels/${channelId}`, {
      headers: {
        'Authorization': `Bot ${botToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || response.statusText);
    }

    const channel = await response.json();

    return {
      success: true,
      data: {
        id: channel.id,
        name: channel.name,
        type: channel.type,
        guildId: channel.guild_id,
        parentId: channel.parent_id,
        position: channel.position,
        topic: channel.topic,
        nsfw: channel.nsfw,
        rateLimitPerUser: channel.rate_limit_per_user,
      },
    };
  }

  /**
   * Create channel
   */
  private async createChannel(context: ExecutionContext): Promise<NodeExecutionResult> {
    const botToken = this.config.botToken;
    const serverId = this.config.serverId;
    const name = this.config.name;
    const type = this.config.type || 0; // 0=text, 2=voice
    const topic = this.config.topic;
    const parentId = this.config.parentId;

    if (!serverId || !name) {
      throw new Error('serverId and name are required for createChannel');
    }

    const payload: any = {
      name,
      type,
    };

    if (topic) payload.topic = topic;
    if (parentId) payload.parent_id = parentId;

    const response = await fetch(`https://discord.com/api/v10/guilds/${serverId}/channels`, {
      method: 'POST',
      headers: {
        'Authorization': `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || response.statusText);
    }

    const channel = await response.json();

    return {
      success: true,
      data: {
        id: channel.id,
        name: channel.name,
        type: channel.type,
        guildId: channel.guild_id,
        created: true,
      },
    };
  }

  /**
   * Add role to user
   */
  private async addRole(context: ExecutionContext): Promise<NodeExecutionResult> {
    const botToken = this.config.botToken;
    const serverId = this.config.serverId;
    const userId = this.config.userId;
    const roleId = this.config.roleId;

    if (!serverId || !userId || !roleId) {
      throw new Error('serverId, userId, and roleId are required for addRole');
    }

    const response = await fetch(`https://discord.com/api/v10/guilds/${serverId}/members/${userId}/roles/${roleId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bot ${botToken}`,
      },
    });

    if (!response.ok && response.status !== 204) {
      const error = await response.json();
      throw new Error(error.message || response.statusText);
    }

    return {
      success: true,
      data: {
        userId,
        roleId,
        added: true,
      },
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
    if (error.code === 10003) {
      return 'Unknown channel';
    }
    if (error.code === 10004) {
      return 'Unknown server';
    }
    if (error.code === 10015) {
      return 'Unknown webhook';
    }
    if (error.code === 40001) {
      return 'Invalid bot token';
    }
    if (error.code === 50013) {
      return 'Missing permissions';
    }
    if (error.code === 50001) {
      return 'Missing access';
    }
    return `Discord API error: ${error.message || 'Unknown error'}`;
  }

  getType(): string {
    return 'discord';
  }

  getIcon(): string {
    return 'MessageCircle';
  }

  /**
   * Create Discord embed object
   */
  static createEmbed(options: {
    title?: string;
    description?: string;
    url?: string;
    color?: number;
    fields?: Array<{ name: string; value: string; inline?: boolean }>;
    footer?: { text: string; iconUrl?: string };
    image?: { url: string };
    thumbnail?: { url: string };
    author?: { name: string; url?: string; iconUrl?: string };
    timestamp?: string;
  }): any {
    const embed: any = {};

    if (options.title) embed.title = options.title;
    if (options.description) embed.description = options.description;
    if (options.url) embed.url = options.url;
    if (options.color) embed.color = options.color;
    if (options.fields) embed.fields = options.fields;
    if (options.footer) embed.footer = options.footer;
    if (options.image) embed.image = options.image;
    if (options.thumbnail) embed.thumbnail = options.thumbnail;
    if (options.author) embed.author = options.author;
    if (options.timestamp) embed.timestamp = options.timestamp;

    return embed;
  }

  /**
   * Parse webhook URL to get ID and token
   */
  static parseWebhookUrl(webhookUrl: string): { id: string; token: string } | null {
    const match = webhookUrl.match(/discord\.com\/api\/webhooks\/(\d+)\/([\w-]+)/);
    if (!match) return null;

    return {
      id: match[1],
      token: match[2],
    };
  }

  /**
   * Common Discord color codes
   */
  static readonly Colors = {
    DEFAULT: 0,
    AQUA: 1752220,
    GREEN: 3066993,
    BLUE: 3447003,
    YELLOW: 15105570,
    PURPLE: 10181038,
    GOLD: 15844367,
    ORANGE: 15136353,
    RED: 15158332,
    PINK: 12370112,
    DARK_GOLD: 2305424,
    DARK_GREEN: 65280,
    DARK_BLUE: 11459856,
    DARK_PURPLE: 7419530,
    DARK_RED: 11342946,
    DARK_AQUA: 6969328,
    DARK_GREY: 8359053,
    LIGHT_GREY: 9807270,
    DARK_NAVY: 2895854,
  };
}
