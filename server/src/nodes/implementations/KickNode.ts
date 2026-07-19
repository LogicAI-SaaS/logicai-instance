import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * Kick Node - Kick.com streaming platform API integration
 * 
 * Supported operations:
 * - getChannel: Get channel information
 * - getLivestream: Get current livestream
 * - getVideos: Get past broadcasts
 * - searchChannels: Search for channels
 */
export class KickNode extends BaseNode {
  private readonly baseUrl = 'https://kick.com/api/v2';

  getType(): string {
    return 'kick';
  }

  getIcon(): string {
    return 'video';
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const operation = this.config.operation || 'getChannel';
      
      switch (operation) {
        case 'getChannel':
          return await this.getChannel(context);
        case 'getLivestream':
          return await this.getLivestream(context);
        case 'getVideos':
          return await this.getVideos(context);
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

  private async apiRequest(endpoint: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Kick API error: ${error}`);
    }

    return response.json();
  }

  private async getChannel(context: ExecutionContext): Promise<NodeExecutionResult> {
    const username = this.config.username || context.$json.username || '';
    
    if (!username) {
      throw new Error('Username is required');
    }

    const data = await this.apiRequest(`channels/${username}`);
    
    return {
      success: true,
      data: {
        channel: data,
        username,
      },
      error: null,
    };
  }

  private async getLivestream(context: ExecutionContext): Promise<NodeExecutionResult> {
    const username = this.config.username || context.$json.username || '';
    
    if (!username) {
      throw new Error('Username is required');
    }

    const channelData = await this.apiRequest(`channels/${username}`);
    const livestream = channelData.livestream;
    
    return {
      success: true,
      data: {
        isLive: !!livestream,
        livestream: livestream || null,
        username,
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

    // First get channel ID
    const channelData = await this.apiRequest(`channels/${username}`);
    const channelId = channelData.id;

    if (!channelId) {
      throw new Error('Channel not found');
    }

    const data = await this.apiRequest(`channels/${channelId}/videos?limit=${limit}`);
    
    return {
      success: true,
      data: {
        videos: data,
        count: Array.isArray(data) ? data.length : 0,
      },
      error: null,
    };
  }

  private async searchChannels(context: ExecutionContext): Promise<NodeExecutionResult> {
    const query = this.config.query || context.$json.query || '';
    
    if (!query) {
      throw new Error('Search query is required');
    }

    const data = await this.apiRequest(`search/channels?query=${encodeURIComponent(query)}`);
    
    return {
      success: true,
      data: {
        channels: data,
        count: Array.isArray(data) ? data.length : 0,
      },
      error: null,
    };
  }

  validateConfig(): string[] {
    const errors: string[] = [];

    if (['getChannel', 'getLivestream', 'getVideos'].includes(this.config.operation) && !this.config.username) {
      errors.push('Username is required for this operation');
    }

    if (this.config.operation === 'searchChannels' && !this.config.query) {
      errors.push('Search query is required');
    }

    return errors;
  }
}
