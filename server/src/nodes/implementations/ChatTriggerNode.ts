import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * Chat Trigger Node - Triggers workflow from chat messages
 * n8n-compatible: Chat message triggers for various platforms
 *
 * Configuration:
 * - platform: 'discord', 'telegram', 'slack', 'whatsapp', 'mattermost', 'matrix'
 * - token: Bot authentication token (platform-specific)
 * - filters: Message filters (e.g., specific channels, users, keywords)
 * - parseMode: How to parse messages ('plain', 'markdown', 'html')
 * - includeMetadata: Include full message metadata (default: false)
 */
export class ChatTriggerNode extends BaseNode {
  private static readonly VALID_PLATFORMS = [
    'textual',
    'discord',
    'telegram',
    'slack',
    'whatsapp',
    'mattermost',
    'matrix',
    'rocketchat',
  ];

  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
    this.validateConfig();
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    const platform = this.config.platform || 'discord';

    if (!ChatTriggerNode.VALID_PLATFORMS.includes(platform)) {
      throw new Error(
        `Invalid platform: ${platform}. Valid platforms: ${ChatTriggerNode.VALID_PLATFORMS.join(', ')}`
      );
    }

    // Validate required fields based on platform (textual doesn't need token)
    if (['discord', 'telegram', 'slack'].includes(platform) && !this.config.token) {
      throw new Error(`Token is required for ${platform} platform`);
    }

    if (this.config.filters && typeof this.config.filters !== 'object') {
      throw new Error('filters must be an object');
    }

    if (this.config.parseMode && !['plain', 'markdown', 'html'].includes(this.config.parseMode)) {
      throw new Error(`Invalid parseMode: ${this.config.parseMode}. Valid: plain, markdown, html`);
    }
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const platform = this.config.platform || 'discord';
      const includeMetadata = this.config.includeMetadata === true;
      const parseMode = this.config.parseMode || 'plain';

      // Chat triggers are normally called via webhook endpoints with pre-processed data
      // The context.$json should contain the parsed chat message data

      const chatData = this.extractChatData(context.$json, platform);

      // Apply filters if configured
      if (this.config.filters && !this.passesFilters(chatData, this.config.filters)) {
        return {
          success: true,
          data: {
            ...context.$json,
            _trigger: {
              type: 'chat',
              platform,
              filtered: true,
              reason: 'Message does not match filter criteria',
            },
          },
        };
      }

      // Build response based on platform and parse mode
      const result: any = {
        ...context.$json,
        _trigger: {
          type: 'chat',
          platform,
          parseMode,
          timestamp: new Date().toISOString(),
        },
      };

      // Add platform-specific data
      if (includeMetadata) {
        result._trigger.metadata = chatData.metadata || {};
      }

      // Add parsed content
      result._trigger.content = this.parseContent(chatData.content, parseMode);

      // Add sender info
      result._trigger.sender = {
        id: chatData.senderId,
        name: chatData.senderName,
        username: chatData.senderUsername,
      };

      // Add chat/channel info
      result._trigger.chat = {
        id: chatData.chatId,
        name: chatData.chatName,
        type: chatData.chatType, // channel, group, direct, etc.
      };

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.formatErrorMessage(error),
      };
    }
  }

  /**
   * Extract chat data from input based on platform
   */
  private extractChatData(input: any, platform: string): any {
    // Each platform has its own data structure
    // This normalizes them into a common format

    const baseData = {
      senderId: input?.userId || input?.user_id || input?.from?.id || input?.sender?.id,
      senderName: input?.userName || input?.user_name || input?.from?.name || input?.sender?.name,
      senderUsername:
        input?.username || input?.from?.username || input?.sender?.username,
      chatId: input?.chatId || input?.chat_id || input?.channel?.id,
      chatName: input?.chatName || input?.chat_name || input?.channel?.name,
      chatType: input?.chatType || input?.chat_type || 'unknown',
      content: input?.text || input?.content || input?.message || '',
      metadata: input,
    };

    // Platform-specific adjustments
    switch (platform) {
      case 'discord':
        return {
          ...baseData,
          senderId: input?.author?.id || input?.userId,
          senderName: input?.author?.username || input?.userName,
          chatId: input?.channel_id || input?.channelId,
          content: input?.content || input?.data?.content,
          metadata: {
            guildId: input?.guild_id,
            memberId: input?.member?.user?.id,
            messageType: input?.type,
            ...input,
          },
        };

      case 'telegram':
        return {
          ...baseData,
          senderId: input?.from?.id,
          senderName: input?.from?.first_name
            ? `${input.from.first_name} ${input.from.last_name || ''}`.trim()
            : input?.from?.username,
          chatId: input?.chat?.id,
          content: input?.text || input?.caption,
          metadata: {
            messageId: input?.message_id,
            chatType: input?.chat?.type,
            ...input,
          },
        };

      case 'slack':
        return {
          ...baseData,
          senderId: input?.user || input?.user_id,
          chatId: input?.channel || input?.channel_id,
          content: input?.text || input?.data?.text,
          metadata: {
            teamId: input?.team,
            eventType: input?.type,
            ts: input?.ts,
            ...input,
          },
        };

      case 'whatsapp':
        return {
          ...baseData,
          senderId: input?.from?.split('@')[0],
          chatId: input?.from || input?.chatId,
          content: input?.text?.body || input?.body,
          metadata: {
            messageId: input?.id,
            messageType: input?.type,
            timestamp: input?.timestamp,
            ...input,
          },
        };

      default:
        return baseData;
    }
  }

  /**
   * Check if message passes configured filters
   */
  private passesFilters(chatData: any, filters: any): boolean {
    if (!filters) return true;

    // Filter by sender
    if (filters.allowedUsers && filters.allowedUsers.length > 0) {
      if (!filters.allowedUsers.includes(chatData.senderId)) {
        return false;
      }
    }

    if (filters.blockedUsers && filters.blockedUsers.length > 0) {
      if (filters.blockedUsers.includes(chatData.senderId)) {
        return false;
      }
    }

    // Filter by chat/channel
    if (filters.allowedChats && filters.allowedChats.length > 0) {
      if (!filters.allowedChats.includes(chatData.chatId)) {
        return false;
      }
    }

    // Filter by keywords
    if (filters.keywords && filters.keywords.length > 0) {
      const content = chatData.content?.toLowerCase() || '';
      const hasKeyword = filters.keywords.some((kw: string) =>
        content.toLowerCase().includes(kw.toLowerCase())
      );
      if (!hasKeyword) {
        return false;
      }
    }

    // Filter by chat type
    if (filters.chatTypes && filters.chatTypes.length > 0) {
      if (!filters.chatTypes.includes(chatData.chatType)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Parse content based on parse mode
   */
  private parseContent(content: string, parseMode: string): any {
    if (!content) return '';

    switch (parseMode) {
      case 'plain':
        // Strip markdown/HTML
        return content
          .replace(/[*_~`#]/g, '')
          .replace(/<[^>]*>/g, '')
          .trim();

      case 'markdown':
        // Keep markdown formatting
        return content;

      case 'html':
        // Keep HTML formatting
        return content;

      default:
        return content;
    }
  }

  /**
   * Format error messages
   */
  private formatErrorMessage(error: any): string {
    if (error.message?.includes('Invalid platform')) {
      return error.message;
    }
    if (error.message?.includes('Token is required')) {
      return error.message;
    }
    return `Chat trigger error: ${error.message || 'Unknown error'}`;
  }

  getType(): string {
    return 'chatTrigger';
  }

  getIcon(): string {
    return 'MessageCircle';
  }

  /**
   * Get the chat platform for this trigger
   */
  getChatPlatform(): string {
    return this.config.platform || 'discord';
  }

  /**
   * Get webhook path for receiving messages
   */
  getWebhookPath(): string {
    return `/webhook/chat/${this.getChatPlatform()}/${this.id}`;
  }

  /**
   * Get webhook URL for external configuration
   */
  getWebhookUrl(baseUrl: string = ''): string {
    return `${baseUrl}${this.getWebhookPath()}`;
  }

  /**
   * Validate chat message payload
   */
  static validatePayload(payload: any, platform: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!payload) {
      errors.push('Payload is empty');
      return { valid: false, errors };
    }

    // Platform-specific validation
    switch (platform) {
      case 'discord':
        if (!payload.author?.id && !payload.user_id) {
          errors.push('Missing user ID in Discord payload');
        }
        if (!payload.channel_id && !payload.channelId) {
          errors.push('Missing channel ID in Discord payload');
        }
        break;

      case 'telegram':
        if (!payload.from?.id) {
          errors.push('Missing sender ID in Telegram payload');
        }
        if (!payload.chat?.id) {
          errors.push('Missing chat ID in Telegram payload');
        }
        break;

      case 'slack':
        if (!payload.user && !payload.user_id) {
          errors.push('Missing user ID in Slack payload');
        }
        if (!payload.channel && !payload.channel_id) {
          errors.push('Missing channel ID in Slack payload');
        }
        break;
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
