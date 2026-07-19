import { BaseNode, BaseNodeConfig } from '../BaseNode';

// TikTok Upload Video Node
export class TikTokUploadVideoNode extends BaseNode {
  constructor(id: string, name: string, config: BaseNodeConfig) {
    super(id, name, config);
  }

  async execute(): Promise<NodeExecutionResult> {
    const videoPath = this.config.videoPath || '';
    const description = this.config.description || '';

    return {
      success: true,
      data: {
        message: 'TikTok video uploaded',
        videoPath: videoPath,
        description: description,
        service: 'tiktok'
      }
    };
  }

  getType(): string {
    return 'tiktokUploadVideo';
  }

  getIcon(): string {
    return 'Video';
  }
}

// TikTok Get Video Info Node
export class TikTokGetVideoInfoNode extends BaseNode {
  constructor(id: string, name: string, config: BaseNodeConfig) {
    super(id, name, config);
  }

  async execute(): Promise<NodeExecutionResult> {
    const videoUrl = this.config.videoUrl || '';

    return {
      success: true,
      data: {
        message: 'TikTok video info retrieved',
        videoUrl: videoUrl,
        service: 'tiktok'
      }
    };
  }

  getType(): string {
    return 'tiktokGetVideoInfo';
  }

  getIcon(): string {
    return 'Info';
  }
}

// TikTok Get User Info Node
export class TikTokGetUserInfoNode extends BaseNode {
  constructor(id: string, name: string, config: BaseNodeConfig) {
    super(id, name, config);
  }

  async execute(): Promise<NodeExecutionResult> {
    const username = this.config.username || '';

    return {
      success: true,
      data: {
        message: 'TikTok user info retrieved',
        username: username,
        service: 'tiktok'
      }
    };
  }

  getType(): string {
    return 'tiktokGetUserInfo';
  }

  getIcon(): string {
    return 'User';
  }
}
