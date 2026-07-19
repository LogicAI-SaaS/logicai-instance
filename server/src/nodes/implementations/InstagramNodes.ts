import { BaseNode, BaseNodeConfig } from '../BaseNode';

// Instagram Post Node
export class InstagramPostNode extends BaseNode {
  constructor(id: string, name: string, config: BaseNodeConfig) {
    super(id, name, config);
  }

  async execute(): Promise<NodeExecutionResult> {
    const mediaUrl = this.config.mediaUrl || '';
    const caption = this.config.caption || '';

    return {
      success: true,
      data: {
        message: 'Instagram post created',
        mediaUrl: mediaUrl,
        caption: caption,
        service: 'instagram'
      }
    };
  }

  getType(): string {
    return 'instagramPost';
  }

  getIcon(): string {
    return 'Image';
  }
}

// Instagram Story Node
export class InstagramStoryNode extends BaseNode {
  constructor(id: string, name: string, config: BaseNodeConfig) {
    super(id, name, config);
  }

  async execute(): Promise<NodeExecutionResult> {
    const mediaUrl = this.config.mediaUrl || '';

    return {
      success: true,
      data: {
        message: 'Instagram story created',
        mediaUrl: mediaUrl,
        service: 'instagram'
      }
    };
  }

  getType(): string {
    return 'instagramStory';
  }

  getIcon(): string {
    return 'Camera';
  }
}

// Instagram Reels Node
export class InstagramReelsNode extends BaseNode {
  constructor(id: string, name: string, config: BaseNodeConfig) {
    super(id, name, config);
  }

  async execute(): Promise<NodeExecutionResult> {
    const videoUrl = this.config.videoUrl || '';
    const caption = this.config.caption || '';

    return {
      success: true,
      data: {
        message: 'Instagram reel created',
        videoUrl: videoUrl,
        caption: caption,
        service: 'instagram'
      }
    };
  }

  getType(): string {
    return 'instagramReels';
  }

  getIcon(): string {
    return 'Video';
  }
}
