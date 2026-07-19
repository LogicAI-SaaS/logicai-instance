import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * Social Mockup Preview - Generate visual previews of social media posts
 * Preview posts for Twitter, LinkedIn, Facebook, Instagram before publishing
 */
export class SocialMockupPreviewNode extends BaseNode {
  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const platform = this.config.platform || 'twitter';
      const content = this.config.content || this.getNestedValue(context.$json, 'content');
      const mediaUrls = this.config.mediaUrls || this.getNestedValue(context.$json, 'mediaUrls', []);
      const metadata = this.config.metadata || {};

      // Generate preview based on platform
      const preview = this.generatePreview(platform, content, mediaUrls, metadata);

      return {
        success: true,
        data: {
          platform,
          content,
          preview,
          _previewGenerated: true,
          _timestamp: new Date().toISOString(),
          $json: context.$json,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Social preview generation failed',
      };
    }
  }

  getType(): string {
    return 'socialMockupPreview';
  }

  getIcon(): string {
    return 'Eye';
  }

  private generatePreview(platform: string, content: string, mediaUrls: string[], metadata: any): any {
    switch (platform) {
      case 'twitter':
      case 'x':
        return this.generateTwitterPreview(content, mediaUrls, metadata);

      case 'linkedin':
        return this.generateLinkedInPreview(content, mediaUrls, metadata);

      case 'facebook':
        return this.generateFacebookPreview(content, mediaUrls, metadata);

      case 'instagram':
        return this.generateInstagramPreview(content, mediaUrls, metadata);

      case 'tiktok':
        return this.generateTikTokPreview(content, mediaUrls, metadata);

      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  private generateTwitterPreview(content: string, mediaUrls: string[], metadata: any): any {
    const maxLength = 280;
    const characterCount = content.length;
    const isOverLimit = characterCount > maxLength;

    return {
      platform: 'twitter',
      preview: {
        author: {
          name: metadata.authorName || 'Your Name',
          username: metadata.username || '@username',
          avatar: metadata.avatar || null,
          verified: metadata.verified || false,
        },
        content: content.substring(0, 280),
        characterCount,
        isOverLimit,
        truncated: isOverLimit ? content.substring(280) : null,
        media: mediaUrls.slice(0, 4).map((url, i) => ({
          type: this.getMediaType(url),
          url,
          alt: metadata.mediaAlt?.[i] || '',
        })),
        timestamp: this.formatTimestamp(metadata.scheduledAt),
        metrics: {
          likes: 0,
          retweets: 0,
          replies: 0,
          views: 0,
        },
        hashtags: this.extractHashtags(content),
        mentions: this.extractMentions(content),
      },
      warnings: isOverLimit ? ['Tweet exceeds 280 character limit'] : [],
    };
  }

  private generateLinkedInPreview(content: string, mediaUrls: string[], metadata: any): any {
    const maxLength = 3000;
    const characterCount = content.length;
    const isOverLimit = characterCount > maxLength;

    return {
      platform: 'linkedin',
      preview: {
        author: {
          name: metadata.authorName || 'Your Name',
          headline: metadata.headline || 'Professional Headline',
          avatar: metadata.avatar || null,
        },
        content: content.substring(0, 3000),
        characterCount,
        isOverLimit,
        truncated: isOverLimit ? content.substring(3000) : null,
        media: mediaUrls.slice(0, 9).map((url, i) => ({
          type: this.getMediaType(url),
          url,
          alt: metadata.mediaAlt?.[i] || '',
        })),
        timestamp: this.formatTimestamp(metadata.scheduledAt),
        hashtags: this.extractHashtags(content),
        mentions: this.extractMentions(content),
        url: metadata.postUrl || null,
      },
      warnings: isOverLimit ? ['Post exceeds 3000 character limit'] : [],
    };
  }

  private generateFacebookPreview(content: string, mediaUrls: string[], metadata: any): any {
    const maxLength = 63206;
    const characterCount = content.length;

    return {
      platform: 'facebook',
      preview: {
        author: {
          name: metadata.authorName || 'Your Name',
          avatar: metadata.avatar || null,
        },
        content: content.substring(0, maxLength),
        characterCount,
        isOverLimit: characterCount > maxLength,
        media: mediaUrls.slice(0, 10).map((url, i) => ({
          type: this.getMediaType(url),
          url,
          alt: metadata.mediaAlt?.[i] || '',
        })),
        timestamp: this.formatTimestamp(metadata.scheduledAt),
        privacy: metadata.privacy || 'public',
        feelings: metadata.feeling || null,
        activity: metadata.activity || null,
        location: metadata.location || null,
      },
      warnings: characterCount > maxLength ? ['Post exceeds character limit'] : [],
    };
  }

  private generateInstagramPreview(content: string, mediaUrls: string[], metadata: any): any {
    const maxLength = 2200;
    const characterCount = content.length;
    const isOverLimit = characterCount > maxLength;
    const hasMedia = mediaUrls.length > 0;

    return {
      platform: 'instagram',
      preview: {
        author: {
          name: metadata.authorName || 'your_username',
          avatar: metadata.avatar || null,
          verified: metadata.verified || false,
        },
        content: content.substring(0, 2200),
        characterCount,
        isOverLimit,
        truncated: isOverLimit ? content.substring(2200) : null,
        media: hasMedia ? mediaUrls.slice(0, 10).map((url, i) => ({
          type: this.getMediaType(url),
          url,
          alt: metadata.mediaAlt?.[i] || '',
        })) : null,
        timestamp: this.formatTimestamp(metadata.scheduledAt),
        hashtags: this.extractHashtags(content),
        mentions: this.extractMentions(content),
        location: metadata.location || null,
      },
      warnings: [
        isOverLimit ? 'Caption exceeds 2200 character limit' : null,
        !hasMedia ? 'Instagram posts require at least one image or video' : null,
      ].filter(w => w !== null),
    };
  }

  private generateTikTokPreview(content: string, mediaUrls: string[], metadata: any): any {
    const maxLength = 150;
    const characterCount = content.length;
    const isOverLimit = characterCount > maxLength;
    const hasVideo = mediaUrls.some(url => this.getMediaType(url) === 'video');

    return {
      platform: 'tiktok',
      preview: {
        author: {
          name: metadata.authorName || '@username',
          avatar: metadata.avatar || null,
          verified: metadata.verified || false,
        },
        caption: content.substring(0, 150),
        characterCount,
        isOverLimit,
        media: hasVideo ? {
          type: 'video',
          url: mediaUrls.find(url => this.getMediaType(url) === 'video'),
        } : null,
        timestamp: this.formatTimestamp(metadata.scheduledAt),
        hashtags: this.extractHashtags(content),
        mentions: this.extractMentions(content),
        music: metadata.music || null,
      },
      warnings: [
        isOverLimit ? 'Caption exceeds 150 character limit' : null,
        !hasVideo ? 'TikTok posts require a video' : null,
      ].filter(w => w !== null),
    };
  }

  private getMediaType(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();
    const videoExtensions = ['mp4', 'mov', 'avi', 'webm'];
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

    if (videoExtensions.includes(extension || '')) return 'video';
    if (imageExtensions.includes(extension || '')) return 'image';
    return 'unknown';
  }

  private formatTimestamp(date?: Date): string {
    if (!date) return 'Just now';
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  private extractHashtags(content: string): string[] {
    const regex = /#(\w+)/g;
    const matches = content.match(regex) || [];
    return matches.map(tag => tag.substring(1));
  }

  private extractMentions(content: string): string[] {
    const regex = /@(\w+)/g;
    const matches = content.match(regex) || [];
    return matches.map(mention => mention.substring(1));
  }

  /**
   * Get optimal posting times based on platform analytics
   */
  static getOptimalPostingTimes(platform: string, timezone: string): any {
    // Mock data - in production would come from analytics
    const times: Record<string, number[]> = {
      twitter: [9, 12, 15, 18], // 9am, 12pm, 3pm, 6pm
      linkedin: [8, 12, 17], // 8am, 12pm, 5pm
      facebook: [9, 15], // 9am, 3pm
      instagram: [11, 14, 19], // 11am, 2pm, 7pm
      tiktok: [7, 12, 19], // 7am, 12pm, 7pm
    };

    return {
      platform,
      timezone,
      optimalHours: times[platform] || [9, 12, 15, 18],
      bestDay: 'Wednesday',
      notes: 'Based on general engagement patterns',
    };
  }
}
