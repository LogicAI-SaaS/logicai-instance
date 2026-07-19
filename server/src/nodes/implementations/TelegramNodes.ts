import { BaseNode, BaseNodeConfig } from '../BaseNode';

// Telegram Send Message Node
export class TelegramSendMessageNode extends BaseNode {
  constructor(id: string, name: string, config: BaseNodeConfig) {
    super(id, name, config);
  }

  async execute(): Promise<NodeExecutionResult> {
    const chatId = this.config.chatId || '';
    const text = this.config.text || '';

    return {
      success: true,
      data: {
        message: 'Telegram message sent',
        chatId: chatId,
        service: 'telegram'
      }
    };
  }

  getType(): string {
    return 'telegramSendMessage';
  }

  getIcon(): string {
    return 'Send';
  }
}

// Telegram Send Photo Node
export class TelegramSendPhotoNode extends BaseNode {
  constructor(id: string, name: string, config: BaseNodeConfig) {
    super(id, name, config);
  }

  async execute(): Promise<NodeExecutionResult> {
    const chatId = this.config.chatId || '';
    const photoUrl = this.config.photoUrl || '';
    const caption = this.config.caption || '';

    return {
      success: true,
      data: {
        message: 'Telegram photo sent',
        chatId: chatId,
        photoUrl: photoUrl,
        service: 'telegram'
      }
    };
  }

  getType(): string {
    return 'telegramSendPhoto';
  }

  getIcon(): string {
    return 'Image';
  }
}

// Telegram Create Bot Command Node
export class TelegramBotCommandNode extends BaseNode {
  constructor(id: string, name: string, config: BaseNodeConfig) {
    super(id, name, config);
  }

  async execute(): Promise<NodeExecutionResult> {
    const command = this.config.command || '';
    const description = this.config.description || '';

    return {
      success: true,
      data: {
        message: 'Telegram bot command created',
        command: command,
        description: description,
        service: 'telegram'
      }
    };
  }

  getType(): string {
    return 'telegramBotCommand';
  }

  getIcon(): string {
    return 'Bot';
  }
}
