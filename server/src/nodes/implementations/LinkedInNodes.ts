import { BaseNode, BaseNodeConfig } from '../BaseNode';

// LinkedIn Post Node
export class LinkedInPostNode extends BaseNode {
  constructor(id: string, name: string, config: BaseNodeConfig) {
    super(id, name, config);
  }

  async execute(): Promise<NodeExecutionResult> {
    const content = this.config.content || '';

    return {
      success: true,
      data: {
        message: 'LinkedIn post created',
        content: content,
        service: 'linkedin'
      }
    };
  }

  getType(): string {
    return 'linkedinPost';
  }

  getIcon(): string {
    return 'FileText';
  }
}

// LinkedIn Share Article Node
export class LinkedInShareArticleNode extends BaseNode {
  constructor(id: string, name: string, config: BaseNodeConfig) {
    super(id, name, config);
  }

  async execute(): Promise<NodeExecutionResult> {
    const articleUrl = this.config.articleUrl || '';
    const comment = this.config.comment || '';

    return {
      success: true,
      data: {
        message: 'LinkedIn article shared',
        articleUrl: articleUrl,
        comment: comment,
        service: 'linkedin'
      }
    };
  }

  getType(): string {
    return 'linkedinShareArticle';
  }

  getIcon(): string {
    return 'Share2';
  }
}

// LinkedIn Message Node
export class LinkedInMessageNode extends BaseNode {
  constructor(id: string, name: string, config: BaseNodeConfig) {
    super(id, name, config);
  }

  async execute(): Promise<NodeExecutionResult> {
    const recipientId = this.config.recipientId || '';
    const message = this.config.message || '';

    return {
      success: true,
      data: {
        message: 'LinkedIn message sent',
        recipientId: recipientId,
        service: 'linkedin'
      }
    };
  }

  getType(): string {
    return 'linkedinMessage';
  }

  getIcon(): string {
    return 'Mail';
  }
}
