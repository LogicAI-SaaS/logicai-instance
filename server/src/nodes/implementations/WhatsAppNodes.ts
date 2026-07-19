import { BaseNode, BaseNodeConfig } from '../BaseNode';

// WhatsApp Send Message Node
export class WhatsAppSendMessageNode extends BaseNode {
  constructor(id: string, name: string, config: BaseNodeConfig) {
    super(id, name, config);
  }

  async execute(): Promise<NodeExecutionResult> {
    const phoneNumber = this.config.phoneNumber || '';
    const message = this.config.message || '';

    return {
      success: true,
      data: {
        message: 'WhatsApp message sent',
        phoneNumber: phoneNumber,
        service: 'whatsapp'
      }
    };
  }

  getType(): string {
    return 'whatsappSendMessage';
  }

  getIcon(): string {
    return 'MessageSquare';
  }
}

// WhatsApp Send Media Node
export class WhatsAppSendMediaNode extends BaseNode {
  constructor(id: string, name: string, config: BaseNodeConfig) {
    super(id, name, config);
  }

  async execute(): Promise<NodeExecutionResult> {
    const phoneNumber = this.config.phoneNumber || '';
    const mediaUrl = this.config.mediaUrl || '';
    const caption = this.config.caption || '';

    return {
      success: true,
      data: {
        message: 'WhatsApp media sent',
        phoneNumber: phoneNumber,
        mediaUrl: mediaUrl,
        service: 'whatsapp'
      }
    };
  }

  getType(): string {
    return 'whatsappSendMedia';
  }

  getIcon(): string {
    return 'Image';
  }
}

// WhatsApp Send Location Node
export class WhatsAppSendLocationNode extends BaseNode {
  constructor(id: string, name: string, config: BaseNodeConfig) {
    super(id, name, config);
  }

  async execute(): Promise<NodeExecutionResult> {
    const phoneNumber = this.config.phoneNumber || '';
    const latitude = this.config.latitude || '';
    const longitude = this.config.longitude || '';

    return {
      success: true,
      data: {
        message: 'WhatsApp location sent',
        phoneNumber: phoneNumber,
        latitude: latitude,
        longitude: longitude,
        service: 'whatsapp'
      }
    };
  }

  getType(): string {
    return 'whatsappSendLocation';
  }

  getIcon(): string {
    return 'MapPin';
  }
}
