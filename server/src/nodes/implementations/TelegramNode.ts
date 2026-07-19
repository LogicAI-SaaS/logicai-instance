import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * Telegram Node - Telegram bot integration
 * n8n-compatible: Telegram messaging, inline keyboards, polls
 *
 * Configuration:
 * - operation: 'sendMessage' | 'sendPhoto' | 'sendDocument' | 'editMessage' | 'deleteMessage' | 'sendPoll' | 'answerCallbackQuery'
 * - botToken: Telegram bot token from @BotFather
 * - chatId: Target chat ID (can be user, group, channel, or topic)
 * - text: Message text
 * - parseMode: 'Markdown' | 'MarkdownV2' | 'HTML' | (default: none)
 * - disableWebPagePreview: true/false
 * - disableNotification: true/false
 * - replyToMessageId: Reply to specific message
 * - replyMarkup: Inline keyboard or reply keyboard markup
 * - photo: Photo URL or file_id
 * - document: Document URL or file_id
 * - caption: Media caption
 * - options: Additional options for specific operations
 */
export class TelegramNode extends BaseNode {
  private apiBaseUrl = 'https://api.telegram.org/bot';

  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
    this.validateConfig();
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    if (!this.config.botToken) {
      throw new Error('botToken is required');
    }

    const operation = this.config.operation || 'sendMessage';

    const validOperations = [
      'sendMessage', 'sendPhoto', 'sendDocument', 'sendAudio', 'sendVideo',
      'sendVoice', 'sendSticker', 'sendLocation', 'sendVenue', 'sendContact',
      'sendPoll', 'sendDice', 'sendAction', 'editMessage', 'deleteMessage',
      'answerCallbackQuery', 'getChat', 'getChatMember', 'getMe', 'getUpdates'
    ];

    if (!validOperations.includes(operation)) {
      throw new Error(`Invalid operation: ${operation}`);
    }
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const operation = this.config.operation || 'sendMessage';

      switch (operation) {
        case 'sendMessage':
          return await this.sendMessage(context);
        case 'sendPhoto':
          return await this.sendPhoto(context);
        case 'sendDocument':
          return await this.sendDocument(context);
        case 'sendAudio':
          return await this.sendAudio(context);
        case 'sendVideo':
          return await this.sendVideo(context);
        case 'sendPoll':
          return await this.sendPoll(context);
        case 'sendAction':
          return await this.sendChatAction(context);
        case 'editMessage':
          return await this.editMessage(context);
        case 'deleteMessage':
          return await this.deleteMessage(context);
        case 'answerCallbackQuery':
          return await this.answerCallbackQuery(context);
        case 'getChat':
          return await this.getChat(context);
        case 'getMe':
          return await this.getMe();
        case 'getUpdates':
          return await this.getUpdates();
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
   * Send text message
   */
  private async sendMessage(context: ExecutionContext): Promise<NodeExecutionResult> {
    const chatId = this.resolveValue(this.config.chatId, context) || this.getNestedValue(context.$json, 'chatId');
    const text = this.resolveValue(this.config.text, context) || this.getNestedValue(context.$json, 'message');
    const parseMode = this.config.parseMode;
    const disableWebPagePreview = this.config.disableWebPagePreview;
    const disableNotification = this.config.disableNotification;
    const replyToMessageId = this.config.replyToMessageId;
    const replyMarkup = this.config.replyMarkup;

    if (!chatId) {
      throw new Error('chatId is required');
    }
    if (!text) {
      throw new Error('text is required for sendMessage');
    }

    const payload: any = {
      chat_id: chatId,
      text,
    };

    if (parseMode) payload.parse_mode = parseMode;
    if (disableWebPagePreview) payload.disable_web_page_preview = true;
    if (disableNotification) payload.disable_notification = true;
    if (replyToMessageId) payload.reply_to_message_id = replyToMessageId;
    if (replyMarkup) payload.reply_markup = replyMarkup;

    const response = await this.callApi('sendMessage', payload);

    return {
      success: true,
      data: {
        messageId: response.message_id,
        chatId: response.chat.id,
        from: response.from,
        date: response.date,
        text: response.text,
        sent: true,
      },
    };
  }

  /**
   * Send photo
   */
  private async sendPhoto(context: ExecutionContext): Promise<NodeExecutionResult> {
    const chatId = this.resolveValue(this.config.chatId, context);
    const photo = this.config.photo;
    const caption = this.resolveValue(this.config.caption, context);
    const parseMode = this.config.parseMode;
    const replyMarkup = this.config.replyMarkup;

    if (!chatId || !photo) {
      throw new Error('chatId and photo are required');
    }

    const payload: any = {
      chat_id: chatId,
      photo,
    };

    if (caption) payload.caption = caption;
    if (parseMode) payload.parse_mode = parseMode;
    if (replyMarkup) payload.reply_markup = replyMarkup;

    const response = await this.callApi('sendPhoto', payload);

    return {
      success: true,
      data: {
        messageId: response.message_id,
        chatId: response.chat.id,
        photo: response.photo,
        caption: response.caption,
        sent: true,
      },
    };
  }

  /**
   * Send document
   */
  private async sendDocument(context: ExecutionContext): Promise<NodeExecutionResult> {
    const chatId = this.resolveValue(this.config.chatId, context);
    const document = this.config.document;
    const caption = this.resolveValue(this.config.caption, context);
    const fileName = this.config.fileName;
    const parseMode = this.config.parseMode;
    const replyMarkup = this.config.replyMarkup;

    if (!chatId || !document) {
      throw new Error('chatId and document are required');
    }

    const payload: any = {
      chat_id: chatId,
      document,
    };

    if (caption) payload.caption = caption;
    if (fileName) payload.filename = fileName;
    if (parseMode) payload.parse_mode = parseMode;
    if (replyMarkup) payload.reply_markup = replyMarkup;

    const response = await this.callApi('sendDocument', payload);

    return {
      success: true,
      data: {
        messageId: response.message_id,
        chatId: response.chat.id,
        document: response.document,
        caption: response.caption,
        sent: true,
      },
    };
  }

  /**
   * Send audio
   */
  private async sendAudio(context: ExecutionContext): Promise<NodeExecutionResult> {
    const chatId = this.resolveValue(this.config.chatId, context);
    const audio = this.config.audio;
    const caption = this.resolveValue(this.config.caption, context);
    const duration = this.config.duration;
    const performer = this.config.performer;
    const title = this.config.title;

    if (!chatId || !audio) {
      throw new Error('chatId and audio are required');
    }

    const payload: any = {
      chat_id: chatId,
      audio,
    };

    if (caption) payload.caption = caption;
    if (duration) payload.duration = duration;
    if (performer) payload.performer = performer;
    if (title) payload.title = title;

    const response = await this.callApi('sendAudio', payload);

    return {
      success: true,
      data: {
        messageId: response.message_id,
        chatId: response.chat.id,
        audio: response.audio,
        sent: true,
      },
    };
  }

  /**
   * Send video
   */
  private async sendVideo(context: ExecutionContext): Promise<NodeExecutionResult> {
    const chatId = this.resolveValue(this.config.chatId, context);
    const video = this.config.video;
    const caption = this.resolveValue(this.config.caption, context);
    const duration = this.config.duration;
    const width = this.config.width;
    const height = this.config.height;
    const supportsStreaming = this.config.supportsStreaming;

    if (!chatId || !video) {
      throw new Error('chatId and video are required');
    }

    const payload: any = {
      chat_id: chatId,
      video,
    };

    if (caption) payload.caption = caption;
    if (duration) payload.duration = duration;
    if (width) payload.width = width;
    if (height) payload.height = height;
    if (supportsStreaming) payload.supports_streaming = true;

    const response = await this.callApi('sendVideo', payload);

    return {
      success: true,
      data: {
        messageId: response.message_id,
        chatId: response.chat.id,
        video: response.video,
        sent: true,
      },
    };
  }

  /**
   * Send poll
   */
  private async sendPoll(context: ExecutionContext): Promise<NodeExecutionResult> {
    const chatId = this.resolveValue(this.config.chatId, context);
    const question = this.config.question;
    const options = this.config.pollOptions;
    const isAnonymous = this.config.isAnonymous !== false;
    const type = this.config.type || 'regular'; // regular or quiz
    const correctOptionId = this.config.correctOptionId;
    const explanation = this.config.explanation;

    if (!chatId || !question || !options || !Array.isArray(options)) {
      throw new Error('chatId, question, and pollOptions array are required');
    }

    const payload: any = {
      chat_id: chatId,
      question,
      options,
      is_anonymous: isAnonymous,
      type,
    };

    if (type === 'quiz' && correctOptionId !== undefined) {
      payload.correct_option_id = correctOptionId;
    }
    if (explanation) {
      payload.explanation = explanation;
    }

    const response = await this.callApi('sendPoll', payload);

    return {
      success: true,
      data: {
        messageId: response.message_id,
        chatId: response.chat.id,
        poll: response.poll,
        sent: true,
      },
    };
  }

  /**
   * Send chat action
   */
  private async sendChatAction(context: ExecutionContext): Promise<NodeExecutionResult> {
    const chatId = this.resolveValue(this.config.chatId, context);
    const action = this.config.action || 'typing';

    const validActions = [
      'typing', 'upload_photo', 'record_video', 'upload_video',
      'record_audio', 'upload_audio', 'upload_document', 'find_location',
      'record_video_note', 'upload_video_note'
    ];

    if (!chatId) {
      throw new Error('chatId is required');
    }

    if (!validActions.includes(action)) {
      throw new Error(`Invalid action: ${action}`);
    }

    const payload = {
      chat_id: chatId,
      action,
    };

    await this.callApi('sendChatAction', payload);

    return {
      success: true,
      data: {
        chatId,
        action,
        sent: true,
      },
    };
  }

  /**
   * Edit message
   */
  private async editMessage(context: ExecutionContext): Promise<NodeExecutionResult> {
    const chatId = this.resolveValue(this.config.chatId, context);
    const messageId = this.config.messageId;
    const inlineMessageId = this.config.inlineMessageId;
    const text = this.resolveValue(this.config.text, context);
    const parseMode = this.config.parseMode;
    const replyMarkup = this.config.replyMarkup;

    if (!text) {
      throw new Error('text is required for editMessage');
    }
    if (!messageId && !inlineMessageId) {
      throw new Error('messageId or inlineMessageId is required');
    }

    const payload: any = {
      text,
    };

    if (chatId && messageId) {
      payload.chat_id = chatId;
      payload.message_id = messageId;
    }
    if (inlineMessageId) {
      payload.inline_message_id = inlineMessageId;
    }
    if (parseMode) payload.parse_mode = parseMode;
    if (replyMarkup) payload.reply_markup = replyMarkup;

    const response = await this.callApi('editMessageText', payload);

    return {
      success: true,
      data: {
        messageId: response.message_id,
        chatId: response.chat?.id,
        text: response.text,
        edited: true,
      },
    };
  }

  /**
   * Delete message
   */
  private async deleteMessage(context: ExecutionContext): Promise<NodeExecutionResult> {
    const chatId = this.resolveValue(this.config.chatId, context);
    const messageId = this.config.messageId;

    if (!chatId || !messageId) {
      throw new Error('chatId and messageId are required');
    }

    const payload = {
      chat_id: chatId,
      message_id: messageId,
    };

    await this.callApi('deleteMessage', payload);

    return {
      success: true,
      data: {
        messageId,
        deleted: true,
      },
    };
  }

  /**
   * Answer callback query
   */
  private async answerCallbackQuery(context: ExecutionContext): Promise<NodeExecutionResult> {
    const callbackQueryId = this.config.callbackQueryId;
    const text = this.config.text;
    const showAlert = this.config.showAlert;
    const url = this.config.url;
    const cacheTime = this.config.cacheTime;

    if (!callbackQueryId) {
      throw new Error('callbackQueryId is required');
    }

    const payload: any = {
      callback_query_id: callbackQueryId,
    };

    if (text !== undefined) payload.text = text;
    if (showAlert !== undefined) payload.show_alert = showAlert;
    if (url) payload.url = url;
    if (cacheTime !== undefined) payload.cache_time = cacheTime;

    await this.callApi('answerCallbackQuery', payload);

    return {
      success: true,
      data: {
        callbackQueryId,
        answered: true,
      },
    };
  }

  /**
   * Get chat information
   */
  private async getChat(context: ExecutionContext): Promise<NodeExecutionResult> {
    const chatId = this.resolveValue(this.config.chatId, context);

    if (!chatId) {
      throw new Error('chatId is required');
    }

    const payload = { chat_id: chatId };
    const response = await this.callApi('getChat', payload);

    return {
      success: true,
      data: {
        id: response.id,
        type: response.type,
        title: response.title,
        username: response.username,
        firstName: response.first_name,
        lastName: response.last_name,
        description: response.description,
      },
    };
  }

  /**
   * Get bot info
   */
  private async getMe(): Promise<NodeExecutionResult> {
    const response = await this.callApi('getMe', {});

    return {
      success: true,
      data: {
        id: response.id,
        isBot: response.is_bot,
        firstName: response.first_name,
        username: response.username,
        canJoinGroups: response.can_join_groups,
        canReadAllGroupMessages: response.can_read_all_group_messages,
        supportsInlineQueries: response.supports_inline_queries,
      },
    };
  }

  /**
   * Get updates (webhook alternative)
   */
  private async getUpdates(): Promise<NodeExecutionResult> {
    const offset = this.config.offset;
    const limit = this.config.limit || 100;
    const timeout = this.config.timeout || 0;

    const payload: any = {
      limit,
      timeout,
    };

    if (offset !== undefined) payload.offset = offset;

    const response = await this.callApi('getUpdates', payload);

    return {
      success: true,
      data: {
        updates: response,
        count: response.length,
      },
    };
  }

  /**
   * Call Telegram Bot API
   */
  private async callApi(method: string, payload: any): Promise<any> {
    const url = `${this.apiBaseUrl}${this.config.botToken}/${method}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.description || response.statusText);
    }

    const data = await response.json();

    if (!data.ok) {
      throw new Error(data.description || 'API call failed');
    }

    return data.result;
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
    if (error.message?.includes('chat not found')) {
      return 'Chat not found. Check the chatId.';
    }
    if (error.message?.includes('bot was blocked')) {
      return 'Bot was blocked by the user.';
    }
    if (error.message?.includes('not enough rights')) {
      return 'Bot does not have enough rights to perform this action.';
    }
    if (error.message?.includes('invalid token')) {
      return 'Invalid bot token. Check with @BotFather.';
    }
    if (error.message?.includes('message is too long')) {
      return 'Message is too long. Maximum is 4096 characters.';
    }
    if (error.message?.includes('wrong file identifier')) {
      return 'Invalid file identifier or URL.';
    }
    return `Telegram API error: ${error.message || 'Unknown error'}`;
  }

  getType(): string {
    return 'telegram';
  }

  getIcon(): string {
    return 'Send';
  }

  /**
   * Create inline keyboard markup
   */
  static createInlineKeyboard(buttons: Array<Array<{
    text: string;
    url?: string;
    callbackData?: string;
    callbackData?: string;
    switchInlineQuery?: string;
    switchInlineQueryCurrentChat?: string;
  }>>): any {
    return {
      inline_keyboard: buttons.map(row =>
        row.map(btn => {
          const button: any = { text: btn.text };
          if (btn.url) button.url = btn.url;
          if (btn.callbackData) button.callback_data = btn.callbackData;
          if (btn.switchInlineQuery) button.switch_inline_query = btn.switchInlineQuery;
          if (btn.switchInlineQueryCurrentChat) button.switch_inline_query_current_chat = btn.switchInlineQueryCurrentChat;
          return button;
        })
      ),
    };
  }

  /**
   * Create reply keyboard markup
   */
  static createReplyKeyboard(buttons: string[][][], options?: {
    resizeKeyboard?: boolean;
    oneTimeKeyboard?: boolean;
    selective?: boolean;
  }): any {
    const keyboard: any = {
      keyboard: buttons.map(row =>
        row.map(btn => Array.isArray(btn) ? { text: btn[0], request_contact: btn[1] === 'contact' } : { text: btn })
      ),
    };

    if (options?.resizeKeyboard) keyboard.resize_keyboard = true;
    if (options?.oneTimeKeyboard) keyboard.one_time_keyboard = true;
    if (options?.selective) keyboard.selective = true;

    return keyboard;
  }

  /**
   * Create force reply markup
   */
  static createForceReply(selective = false): any {
    return {
      force_reply: true,
      selective,
    };
  }

  /**
   * Get chat ID from various sources
   */
  static extractChatId(data: any): string | null {
    if (data.chat?.id) return data.chat.id;
    if (data.message?.chat?.id) return data.message.chat.id;
    if (data.callback_query?.message?.chat?.id) return data.callback_query.message.chat.id;
    if (typeof data === 'string' && /^\d+$/.test(data)) return data;
    if (typeof data === 'number') return String(data);
    return null;
  }
}
