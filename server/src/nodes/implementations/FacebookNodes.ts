import { BaseNode, BaseNodeConfig } from '../BaseNode';

// Facebook Post Node
export class FacebookPostNode extends BaseNode {
  constructor(id: string, name: string, config: BaseNodeConfig) {
    super(id, name, config);
  }

  async execute(): Promise<NodeExecutionResult> {
    const message = this.config.message || '';

    return {
      success: true,
      data: {
        message: 'Facebook post created',
        message: message,
        service: 'facebook'
      }
    };
  }

  getType(): string {
    return 'facebookPost';
  }

  getIcon(): string {
    return 'FileText';
  }
}

// Facebook Upload Photo Node
export class FacebookUploadPhotoNode extends BaseNode {
  constructor(id: string, name: string, config: BaseNodeConfig) {
    super(id, name, config);
  }

  async execute(): Promise<NodeExecutionResult> {
    const photoUrl = this.config.photoUrl || '';
    const caption = this.config.caption || '';

    return {
      success: true,
      data: {
        message: 'Facebook photo uploaded',
        photoUrl: photoUrl,
        caption: caption,
        service: 'facebook'
      }
    };
  }

  getType(): string {
    return 'facebookUploadPhoto';
  }

  getIcon(): string {
    return 'Image';
  }
}

// Facebook Page Post Node
export class FacebookPagePostNode extends BaseNode {
  constructor(id: string, name: string, config: BaseNodeConfig) {
    super(id, name, config);
  }

  async execute(): Promise<NodeExecutionResult> {
    const pageId = this.config.pageId || '';
    const message = this.config.message || '';

    return {
      success: true,
      data: {
        message: 'Facebook page post created',
        pageId: pageId,
        message: message,
        service: 'facebook'
      }
    };
  }

  getType(): string {
    return 'facebookPagePost';
  }

  getIcon(): string {
    return 'Megaphone';
  }
}
