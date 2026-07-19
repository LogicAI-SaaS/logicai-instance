import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * Twitch Node - Twitch API integration
 * 
 * Supported operations:
 * - getStream: Get stream information
 * - getUser: Get user/channel information
 * - getVideos: Get channel videos
 * - getClips: Get channel clips
 * - searchChannels: Search for channels
 */
export class TwitchNode extends BaseNode {
  private clientId?: string;
  private clientSecret?: string;
  private accessToken?: string;

  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
    this.clientId = this.config.credentials?.clientId || this.config.clientId || process.env.TWITCH_CLIENT_ID;
    this.clientSecret = this.config.credentials?.clientSecret || this.config.clientSecret || process.env.TWITCH_CLIENT_SECRET;
    this.accessToken = this.config.credentials?.accessToken || this.config.accessToken;
  }

  getType(): string {
    return 'twitch';
  }

  getIcon(): string {
    return 'twitch';
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      if (!this.clientId) {
        throw new Error('Twitch Client ID not configured');
      }

      // Get access token if not already available
      if (!this.accessToken) {
        await this.getAccessToken();
      }

      const operation = this.config.operation || 'getStream';
      
      switch (operation) {
        case 'getStream':
          return await this.getStream(context);
        case 'getUser':
          return await this.getUser(context);
        case 'getVideos':
          return await this.getVideos(context);
        case 'getClips':
          return await this.getClips(context);
        case 'searchChannels':
          return await this.searchChannels(context);
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

  private async getAccessToken(): Promise<void> {
    if (!this.clientSecret) {
      throw new Error('Twitch Client Secret required to get access token');
    }

    const response = await fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.clientId!,
        client_secret: this.clientSecret,
        grant_type: 'client_credentials',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get Twitch access token');
    }

    const data = await response.json() as any;
    this.accessToken = data.access_token;
  }

  private async apiRequest(endpoint: string): Promise<any> {
    const response = await fetch(`https://api.twitch.tv/helix/${endpoint}`, {
      headers: {
        'Client-ID': this.clientId!,
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Twitch API error: ${error}`);
    }

    return response.json();
  }

  private async getStream(context: ExecutionContext): Promise<NodeExecutionResult> {
    const username = this.config.username || context.$json.username || '';
    
    if (!username) {
      throw new Error('Username is required');
    }

    // First get user ID
    const userData = await this.apiRequest(`users?login=${username}`);
    const userId = userData.data[0]?.id;

    if (!userId) {
      throw new Error('User not found');
    }

    // Get stream info
    const streamData = await this.apiRequest(`streams?user_id=${userId}`);
    const stream = streamData.data[0];
    
    return {
      success: true,
      data: {
        isLive: !!stream,
        stream: stream || null,
        username,
      },
      error: null,
    };
  }

  private async getUser(context: ExecutionContext): Promise<NodeExecutionResult> {
    const username = this.config.username || context.$json.username || '';
    
    if (!username) {
      throw new Error('Username is required');
    }

    const data = await this.apiRequest(`users?login=${username}`);
    
    return {
      success: true,
      data: {
        user: data.data[0] || null,
      },
      error: null,
    };
  }

  private async getVideos(context: ExecutionContext): Promise<NodeExecutionResult> {
    const username = this.config.username || context.$json.username || '';
    const limit = this.config.limit || 20;
    
    if (!username) {
      throw new Error('Username is required');
    }

    // Get user ID first
    const userData = await this.apiRequest(`users?login=${username}`);
    const userId = userData.data[0]?.id;

    if (!userId) {
      throw new Error('User not found');
    }

    const data = await this.apiRequest(`videos?user_id=${userId}&first=${limit}`);
    
    return {
      success: true,
      data: {
        videos: data.data,
        count: data.data.length,
      },
      error: null,
    };
  }

  private async getClips(context: ExecutionContext): Promise<NodeExecutionResult> {
    const username = this.config.username || context.$json.username || '';
    const limit = this.config.limit || 20;
    
    if (!username) {
      throw new Error('Username is required');
    }

    // Get user ID first
    const userData = await this.apiRequest(`users?login=${username}`);
    const userId = userData.data[0]?.id;

    if (!userId) {
      throw new Error('User not found');
    }

    const data = await this.apiRequest(`clips?broadcaster_id=${userId}&first=${limit}`);
    
    return {
      success: true,
      data: {
        clips: data.data,
        count: data.data.length,
      },
      error: null,
    };
  }

  private async searchChannels(context: ExecutionContext): Promise<NodeExecutionResult> {
    const query = this.config.query || context.$json.query || '';
    const limit = this.config.limit || 20;
    
    if (!query) {
      throw new Error('Search query is required');
    }

    const data = await this.apiRequest(`search/channels?query=${encodeURIComponent(query)}&first=${limit}`);
    
    return {
      success: true,
      data: {
        channels: data.data,
        count: data.data.length,
      },
      error: null,
    };
  }

  validateConfig(): string[] {
    const errors: string[] = [];
    
    if (!this.clientId) {
      errors.push('Twitch Client ID is required');
    }

    if (['getStream', 'getUser', 'getVideos', 'getClips'].includes(this.config.operation) && !this.config.username) {
      errors.push('Username is required for this operation');
    }

    if (this.config.operation === 'searchChannels' && !this.config.query) {
      errors.push('Search query is required');
    }

    return errors;
  }
}
