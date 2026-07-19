import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * YouTube Node - YouTube Data API v3 integration
 * 
 * Supported operations:
 * - searchVideos: Search for videos
 * - getVideo: Get video details
 * - getChannel: Get channel information
 * - getComments: Get video comments
 * - getPlaylist: Get playlist items
 */
export class YouTubeNode extends BaseNode {
  private apiKey?: string;

  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
    this.apiKey = this.config.credentials?.apiKey || this.config.apiKey || process.env.YOUTUBE_API_KEY;
  }

  getType(): string {
    return 'youtube';
  }

  getIcon(): string {
    return 'youtube';
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      if (!this.apiKey) {
        throw new Error('YouTube API key not configured');
      }

      const operation = this.config.operation || 'searchVideos';
      
      switch (operation) {
        case 'searchVideos':
          return await this.searchVideos(context);
        case 'getVideo':
          return await this.getVideo(context);
        case 'getChannel':
          return await this.getChannel(context);
        case 'getComments':
          return await this.getComments(context);
        case 'getPlaylist':
          return await this.getPlaylist(context);
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: error.message,
      };
    }
  }

  private async apiRequest(endpoint: string, params: Record<string, string>): Promise<any> {
    const url = new URL(`https://www.googleapis.com/youtube/v3/${endpoint}`);
    url.searchParams.append('key', this.apiKey!);
    
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.append(key, value);
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`YouTube API error: ${error}`);
    }

    return response.json();
  }

  private async searchVideos(context: ExecutionContext): Promise<NodeExecutionResult> {
    const query = this.config.query || context.$json.query || '';
    const maxResults = this.config.maxResults || 25;
    const order = this.config.order || 'relevance'; // relevance, date, rating, viewCount
    
    if (!query) {
      throw new Error('Search query is required');
    }

    const data = await this.apiRequest('search', {
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults: maxResults.toString(),
      order,
    });
    
    return {
      success: true,
      data: {
        videos: data.items,
        totalResults: data.pageInfo?.totalResults || 0,
        count: data.items.length,
      },
      error: null,
    };
  }

  private async getVideo(context: ExecutionContext): Promise<NodeExecutionResult> {
    const videoId = this.config.videoId || context.$json.videoId || '';
    
    if (!videoId) {
      throw new Error('Video ID is required');
    }

    const data = await this.apiRequest('videos', {
      part: 'snippet,contentDetails,statistics',
      id: videoId,
    });
    
    return {
      success: true,
      data: {
        video: data.items[0] || null,
      },
      error: null,
    };
  }

  private async getChannel(context: ExecutionContext): Promise<NodeExecutionResult> {
    const channelId = this.config.channelId || context.$json.channelId;
    const username = this.config.username || context.$json.username;
    
    if (!channelId && !username) {
      throw new Error('Channel ID or username is required');
    }

    const params: Record<string, string> = {
      part: 'snippet,contentDetails,statistics',
    };

    if (channelId) {
      params.id = channelId;
    } else {
      params.forUsername = username!;
    }

    const data = await this.apiRequest('channels', params);
    
    return {
      success: true,
      data: {
        channel: data.items[0] || null,
      },
      error: null,
    };
  }

  private async getComments(context: ExecutionContext): Promise<NodeExecutionResult> {
    const videoId = this.config.videoId || context.$json.videoId || '';
    const maxResults = this.config.maxResults || 50;
    const order = this.config.order || 'time'; // time, relevance
    
    if (!videoId) {
      throw new Error('Video ID is required');
    }

    const data = await this.apiRequest('commentThreads', {
      part: 'snippet',
      videoId,
      maxResults: maxResults.toString(),
      order,
    });
    
    return {
      success: true,
      data: {
        comments: data.items.map((item: any) => item.snippet.topLevelComment),
        count: data.items.length,
      },
      error: null,
    };
  }

  private async getPlaylist(context: ExecutionContext): Promise<NodeExecutionResult> {
    const playlistId = this.config.playlistId || context.$json.playlistId || '';
    const maxResults = this.config.maxResults || 50;
    
    if (!playlistId) {
      throw new Error('Playlist ID is required');
    }

    const data = await this.apiRequest('playlistItems', {
      part: 'snippet,contentDetails',
      playlistId,
      maxResults: maxResults.toString(),
    });
    
    return {
      success: true,
      data: {
        items: data.items,
        count: data.items.length,
      },
      error: null,
    };
  }

  validateConfig(): string[] {
    const errors: string[] = [];
    
    if (!this.apiKey) {
      errors.push('YouTube API key is required');
    }

    if (this.config.operation === 'searchVideos' && !this.config.query) {
      errors.push('Search query is required');
    }

    if (this.config.operation === 'getVideo' && !this.config.videoId) {
      errors.push('Video ID is required');
    }

    if (this.config.operation === 'getChannel' && !this.config.channelId && !this.config.username) {
      errors.push('Channel ID or username is required');
    }

    if (this.config.operation === 'getComments' && !this.config.videoId) {
      errors.push('Video ID is required');
    }

    if (this.config.operation === 'getPlaylist' && !this.config.playlistId) {
      errors.push('Playlist ID is required');
    }

    return errors;
  }
}
