import axios from 'axios';
import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * Streaming Node - Twitch / YouTube / Kick.com Integration
 * n8n-compatible: Live alerts, title/category updates, auto-moderation, real-time stats
 * NOTE: Requires constant OAuth2 token refresh for all streaming platforms.
 */
export class StreamingNode extends BaseNode {
  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const { platform, action, resource, parameters } = this.config;
      const { accessToken, channelId } = parameters;

      let result: any;

      switch (platform) {
        case 'twitch':
          result = await this.handleTwitch(action, resource, parameters, accessToken);
          break;
        case 'youtube':
          result = await this.handleYouTube(action, resource, parameters, accessToken);
          break;
        case 'kick':
          result = await this.handleKick(action, resource, parameters);
          break;
        default:
          throw new Error(`Unknown streaming platform: ${platform}`);
      }

      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Streaming operation failed',
      };
    }
  }

  private async handleTwitch(action: string, resource: string, params: any, accessToken: string): Promise<any> {
    const headers = {
      'Client-Id': params.clientId,
      'Authorization': `Bearer ${accessToken}`,
    };

    const baseUrl = 'https://api.twitch.tv/helix';

    switch (resource) {
      case 'stream':
        return await this.handleTwitchStream(action, baseUrl, params, headers);

      case 'channel':
        return await this.handleTwitchChannel(action, baseUrl, params, headers);

      case 'chat':
        return await this.handleTwitchChat(action, baseUrl, params, headers);

      case 'moderation':
        return await this.handleTwitchModeration(action, baseUrl, params, headers);

      default:
        throw new Error(`Unknown Twitch resource: ${resource}`);
    }
  }

  private async handleTwitchStream(action: string, baseUrl: string, params: any, headers: any): Promise<any> {
    switch (action) {
      case 'getInfo':
        const infoResponse = await axios.get(`${baseUrl}/streams?user_id=${params.userId}`, { headers });
        return {
          stream: infoResponse.data.data[0] || null,
          isLive: infoResponse.data.data.length > 0,
        };

      case 'getMetadata':
        const metaResponse = await axios.get(`${baseUrl}/streams/metadata?user_id=${params.userId}`, { headers });
        return metaResponse.data;

      case 'getAnalytics':
        const analyticsResponse = await axios.get(`${baseUrl}/analytics/extensions?user_id=${params.userId}`, { headers });
        return analyticsResponse.data;

      default:
        throw new Error(`Unknown Twitch Stream action: ${action}`);
    }
  }

  private async handleTwitchChannel(action: string, baseUrl: string, params: any, headers: any): Promise<any> {
    switch (action) {
      case 'updateTitle':
        await axios.patch(`${baseUrl}/channels?broadcaster_id=${params.broadcasterId}`, {
          title: params.title,
        }, { headers });

        return {
          updated: true,
          title: params.title,
        };

      case 'updateCategory':
        await axios.patch(`${baseUrl}/channels?broadcaster_id=${params.broadcasterId}`, {
          game_id: params.gameId,
        }, { headers });

        return {
          updated: true,
          gameId: params.gameId,
        };

      case 'getCommercial':
        await axios.post(`${baseUrl}/channels/commercial`, {
          broadcaster_id: params.broadcasterId,
          length: params.length || 30,
        }, { headers });

        return {
          commercialStarted: true,
          length: params.length || 30,
        };

      default:
        throw new Error(`Unknown Twitch Channel action: ${action}`);
    }
  }

  private async handleTwitchChat(action: string, baseUrl: string, params: any, headers: any): Promise<any> {
    switch (action) {
      case 'sendMessage':
        await axios.post(`${baseUrl}/chat/messages`, {
          broadcaster_id: params.broadcasterId,
          sender_id: params.senderId,
          message: params.message,
        }, { headers });

        return {
          sent: true,
          message: params.message,
        };

      case 'getChatters':
        const chattersResponse = await axios.get(`${baseUrl}/chat/chatters?broadcaster_id=${params.broadcasterId}&moderator_id=${params.moderatorId}`, { headers });
        return {
          chatters: chattersResponse.data.data,
          count: chattersResponse.data.total,
        };

      case 'announce':
        await axios.post(`${baseUrl}/chat/announcements`, {
          broadcaster_id: params.broadcasterId,
          moderator_id: params.moderatorId,
          message: params.message,
        }, { headers });

        return {
          announced: true,
          message: params.message,
        };

      default:
        throw new Error(`Unknown Twitch Chat action: ${action}`);
    }
  }

  private async handleTwitchModeration(action: string, baseUrl: string, params: any, headers: any): Promise<any> {
    switch (action) {
      case 'banUser':
        await axios.post(`${baseUrl}/moderation/bans`, {
          broadcaster_id: params.broadcasterId,
          moderator_id: params.moderatorId,
          data: {
            user_id: params.userId,
            reason: params.reason,
          },
        }, { headers });

        return {
          banned: true,
          userId: params.userId,
          reason: params.reason,
        };

      case 'timeoutUser':
        await axios.post(`${baseUrl}/moderation/bans`, {
          broadcaster_id: params.broadcasterId,
          moderator_id: params.moderatorId,
          data: {
            user_id: params.userId,
            duration: params.duration,
            reason: params.reason,
          },
        }, { headers });

        return {
          timedOut: true,
          userId: params.userId,
          duration: params.duration,
        };

      case 'deleteMessage':
        await axios.delete(`${baseUrl}/moderation/chat?broadcaster_id=${params.broadcasterId}&moderator_id=${params.moderatorId}&message_id=${params.messageId}`, { headers });

        return {
          deleted: true,
          messageId: params.messageId,
        };

      default:
        throw new Error(`Unknown Twitch Moderation action: ${action}`);
    }
  }

  private async handleYouTube(action: string, resource: string, params: any, accessToken: string): Promise<any> {
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
    };

    const baseUrl = 'https://www.googleapis.com/youtube/v3';

    switch (resource) {
      case 'liveStream':
        return await this.handleYouTubeLiveStream(action, baseUrl, params, headers);

      case 'chat':
        return await this.handleYouTubeChat(action, baseUrl, params, headers);

      default:
        throw new Error(`Unknown YouTube resource: ${resource}`);
    }
  }

  private async handleYouTubeLiveStream(action: string, baseUrl: string, params: any, headers: any): Promise<any> {
    switch (action) {
      case 'getInfo':
        const infoResponse = await axios.get(`${baseUrl}/liveStreams?part=snippet,status&id=${params.streamId}`, { headers });
        return {
          stream: infoResponse.data.items[0] || null,
        };

      case 'updateTitle':
        await axios.put(`${baseUrl}/liveStreams?part=snippet`, {
          id: params.streamId,
          snippet: {
            title: params.title,
          },
        }, { headers });

        return {
          updated: true,
          title: params.title,
        };

      case 'getAnalytics':
        const analyticsResponse = await axios.get(`${baseUrl}/reports?ids=channel==MINE&metrics=views,estimatedMinutesWatched,averageViewDuration,subscribersGained`, { headers });
        return analyticsResponse.data;

      default:
        throw new Error(`Unknown YouTube Live Stream action: ${action}`);
    }
  }

  private async handleYouTubeChat(action: string, baseUrl: string, params: any, headers: any): Promise<any> {
    switch (action) {
      case 'getMessages':
        const messagesResponse = await axios.get(`${baseUrl}/liveChat/messages?liveChatId=${params.liveChatId}&part=snippet,authorDetails`, { headers });
        return {
          messages: messagesResponse.data.items,
          pollingInterval: messagesResponse.data.pollingIntervalMillis,
        };

      case 'sendMessage':
        await axios.post(`${baseUrl}/liveChat/messages?part=snippet`, {
          snippet: {
            liveChatId: params.liveChatId,
            textMessageDetails: {
              messageText: params.message,
            },
          },
        }, { headers });

        return {
          sent: true,
          message: params.message,
        };

      default:
        throw new Error(`Unknown YouTube Chat action: ${action}`);
    }
  }

  private async handleKick(action: string, resource: string, params: any): Promise<any> {
    // Note: Kick.com API is less documented and may require reverse engineering
    const baseUrl = 'https://kick.com/api/v1';

    switch (resource) {
      case 'channel':
        switch (action) {
          case 'getInfo':
            const infoResponse = await axios.get(`${baseUrl}/channels/${params.channelSlug}`);
            return {
              channel: infoResponse.data,
            };

          case 'getLivestream':
            const liveResponse = await axios.get(`${baseUrl}/channels/${params.channelSlug}/livestream`);
            return {
              livestream: liveResponse.data,
              isLive: !!liveResponse.data,
            };

          default:
            throw new Error(`Unknown Kick Channel action: ${action}`);
        }

      case 'chat':
        // Kick chat integration may require WebSocket connection
        return {
          message: 'Kick chat integration requires WebSocket connection - not yet implemented',
          channelSlug: params.channelSlug,
        };

      default:
        throw new Error(`Unknown Kick resource: ${resource}`);
    }
  }

  getType(): string {
    return 'streaming';
  }

  getIcon(): string {
    return 'Radio';
  }
}
