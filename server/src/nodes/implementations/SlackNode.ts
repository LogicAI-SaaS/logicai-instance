import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * Slack Node - Slack API Integration
 * n8n-compatible: Complete Slack workspace integration
 *
 * Configuration:
 * - operation: 'post' | 'upload' | 'get' | 'update' | 'delete' | 'schedule' | 'react' | 'reply' |
 *              'openDialog' | 'getChannel' | 'listChannels' | 'createChannel' | 'archiveChannel' |
 *              'getUser' | 'listUsers' | 'setPresence' | 'setStatus' |
 *              'getTeam' | 'inviteToChannel' | 'kickFromChannel' | 'pinMessage' | 'unpinMessage'
 * - accessToken: Slack OAuth token (xoxb-...) or Bot token (xoxb-...)
 * - webhookUrl: Slack webhook URL for simple messages
 * - channel: Channel ID or name (#general)
 * - text: Message text
 * - blocks: Slack blocks Kit for rich formatting
 * - attachments: Legacy attachments
 *
 * Message Operations:
 * - channel: Target channel
 * - text: Message text (fallback)
 * - blocks: Array of block objects
 * - attachments: Array of attachment objects
 * - threadTs: Thread timestamp for replies
 * - scheduledTime: Unix timestamp for scheduled messages
 *
 * Reaction Operations:
 * - name: Reaction emoji name (e.g., 'thumbsup')
 * - timestamp: Message timestamp to react to
 *
 * User Operations:
 * - userId: User ID
 * - presence: 'auto' | 'away'
 * - statusText: Custom status text
 * - statusEmoji: Status emoji (e.g., ':construction:')
 *
 * Channel Operations:
 * - name: Channel name (without #)
 * - isPrivate: Create private channel
 * - members: Array of user IDs to invite
 */
export class SlackNode extends BaseNode {
  private apiBaseUrl = 'https://slack.com/api';
  private accessToken?: string;

  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
    this.accessToken = config.accessToken || config.credentials?.accessToken;
    this.validateConfig();
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    if (!this.accessToken && !this.config.webhookUrl) {
      throw new Error('Slack requires either accessToken or webhookUrl configuration');
    }

    const validOperations = [
      'post', 'upload', 'get', 'update', 'delete', 'schedule', 'react', 'reply',
      'openDialog', 'getChannel', 'listChannels', 'createChannel', 'archiveChannel', 'setTopic', 'setPurpose',
      'getUser', 'listUsers', 'setPresence', 'setStatus',
      'getTeam', 'inviteToChannel', 'kickFromChannel', 'joinChannel', 'leaveChannel',
      'pinMessage', 'unpinMessage', 'listPins', 'addReaction', 'removeReaction', 'getReactions',
      'deleteScheduledMessage', 'listScheduledMessages', 'getScheduledMessage',
      'createUserGroup', 'getUserGroup', 'listUserGroups', 'updateUserGroup',
    ];

    const operation = this.config.operation || 'post';

    if (!validOperations.includes(operation)) {
      throw new Error(`Invalid operation: ${operation}`);
    }
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const operation = this.config.operation || 'post';

      switch (operation) {
        // Message Operations
        case 'post':
          return await this.post(context);
        case 'upload':
          return await this.upload(context);
        case 'get':
          return await this.get(context);
        case 'update':
          return await this.update(context);
        case 'delete':
          return await this.delete(context);
        case 'schedule':
          return await this.schedule(context);
        case 'reply':
          return await this.reply(context);

        // Reaction Operations
        case 'react':
        case 'addReaction':
          return await this.addReaction(context);
        case 'removeReaction':
          return await this.removeReaction(context);
        case 'getReactions':
          return await this.getReactions();

        // Channel Operations
        case 'getChannel':
          return await this.getChannel(context);
        case 'listChannels':
          return await this.listChannels();
        case 'createChannel':
          return await this.createChannel(context);
        case 'archiveChannel':
          return await this.archiveChannel(context);
        case 'setTopic':
          return await this.setTopic(context);
        case 'setPurpose':
          return await this.setPurpose(context);
        case 'joinChannel':
          return await this.joinChannel(context);
        case 'leaveChannel':
          return await this.leaveChannel(context);
        case 'inviteToChannel':
          return await this.inviteToChannel(context);
        case 'kickFromChannel':
          return await this.kickFromChannel(context);

        // User Operations
        case 'getUser':
          return await this.getUser(context);
        case 'listUsers':
          return await this.listUsers();
        case 'setPresence':
          return await this.setPresence(context);
        case 'setStatus':
          return await this.setStatus(context);

        // Team Operations
        case 'getTeam':
          return await this.getTeam();

        // Pin Operations
        case 'pinMessage':
          return await this.pinMessage(context);
        case 'unpinMessage':
          return await this.unpinMessage(context);
        case 'listPins':
          return await this.listPins(context);

        // Scheduled Message Operations
        case 'deleteScheduledMessage':
          return await this.deleteScheduledMessage(context);
        case 'listScheduledMessages':
          return await this.listScheduledMessages();
        case 'getScheduledMessage':
          return await this.getScheduledMessage(context);

        // User Group Operations
        case 'createUserGroup':
          return await this.createUserGroup(context);
        case 'getUserGroup':
          return await this.getUserGroup(context);
        case 'listUserGroups':
          return await this.listUserGroups();
        case 'updateUserGroup':
          return await this.updateUserGroup(context);

        default:
          throw new Error(`Unknown operation: ${operation}`);
      }
    } catch (error: any) {
      return {
        success: false,
        error: this.formatErrorMessage(error),
      };
    }
  }

  /**
   * Post a message
   */
  private async post(context: ExecutionContext): Promise<NodeExecutionResult> {
    const webhookUrl = this.config.webhookUrl;

    if (webhookUrl) {
      return await this.postWebhook(webhookUrl, context);
    }

    return await this.postMessage(context);
  }

  /**
   * Post message using Web API
   */
  private async postMessage(context: ExecutionContext): Promise<NodeExecutionResult> {
    const channel = this.resolveValue(this.config.channel, context);
    const text = this.resolveValue(this.config.text || this.config.message, context);
    const blocks = this.config.blocks;
    const attachments = this.config.attachments;
    const threadTs = this.config.threadTs;
    const parse = this.config.parse; // 'full' | 'none'
    const replyBroadcast = this.config.replyBroadcast;
    const unfurlLinks = this.config.unfurlLinks;
    const unfurlMedia = this.config.unfurlMedia;

    if (!channel) {
      throw new Error('channel is required');
    }

    if (!this.accessToken) {
      throw new Error('accessToken is required for Web API operations');
    }

    const payload: any = {
      channel,
    };

    if (text) payload.text = text;
    if (blocks) payload.blocks = blocks;
    if (attachments) payload.attachments = attachments;
    if (threadTs) payload.thread_ts = threadTs;
    if (parse) payload.parse = parse;
    if (replyBroadcast) payload.reply_broadcast = replyBroadcast;
    if (unfurlLinks !== undefined) payload.unfurl_links = unfurlLinks;
    if (unfurlMedia !== undefined) payload.unfurl_media = unfurlMedia;

    const result = await this.callApi('chat.postMessage', payload);

    return {
      success: true,
      data: {
        channel: result.channel,
        ts: result.ts,
        message: result.message,
        timestamp: result.ts,
      },
    };
  }

  /**
   * Post message using Webhook
   */
  private async postWebhook(webhookUrl: string, context: ExecutionContext): Promise<NodeExecutionResult> {
    const text = this.resolveValue(this.config.text || this.config.message, context);
    const blocks = this.config.blocks;
    const attachments = this.config.attachments;
    const username = this.config.username;
    const iconEmoji = this.config.iconEmoji;
    const iconUrl = this.config.iconUrl;
    const threadTs = this.config.threadTs;

    const payload: any = {};

    if (text) payload.text = text;
    if (blocks) payload.blocks = blocks;
    if (attachments) payload.attachments = attachments;
    if (username) payload.username = username;
    if (iconEmoji) payload.icon_emoji = iconEmoji;
    if (iconUrl) payload.icon_url = iconUrl;
    if (threadTs) payload.thread_ts = threadTs;

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook error: ${response.statusText}`);
    }

    return {
      success: true,
      data: {
        sent: true,
        webhookUrl,
      },
    };
  }

  /**
   * Upload a file
   */
  private async upload(context: ExecutionContext): Promise<NodeExecutionResult> {
    const channel = this.resolveValue(this.config.channel, context);
    const file = this.resolveValue(this.config.file, context);
    const filename = this.resolveValue(this.config.filename, context);
    const fileType = this.config.fileType; // 'jpg' | 'png' | etc.
    const title = this.resolveValue(this.config.title, context);
    const initialComment = this.resolveValue(this.config.initialComment, context);
    const threadTs = this.config.threadTs;

    if (!file) {
      throw new Error('file content is required');
    }

    if (!this.accessToken) {
      throw new Error('accessToken is required for file uploads');
    }

    // Using files.uploadV2 for newer Slack API
    const formData = new FormData();
    formData.append('file', file);

    if (channel) formData.append('channels', channel);
    if (filename) formData.append('filename', filename);
    if (fileType) formData.append('filetype', fileType);
    if (title) formData.append('title', title);
    if (initialComment) formData.append('initial_comment', initialComment);
    if (threadTs) formData.append('thread_ts', threadTs);

    const result = await this.callApi('files.uploadV2', formData, true);

    return {
      success: true,
      data: {
        file: result.file,
        ok: result.ok,
      },
    };
  }

  /**
   * Get messages from a channel
   */
  private async get(context: ExecutionContext): Promise<NodeExecutionResult> {
    const channel = this.resolveValue(this.config.channel, context);
    const limit = this.config.limit || 100;
    const cursor = this.config.cursor;
    const inclusive = this.config.inclusive;
    const latest = this.config.latest;
    const oldest = this.config.oldest;

    if (!channel) {
      throw new Error('channel is required');
    }

    if (!this.accessToken) {
      throw new Error('accessToken is required');
    }

    const payload: any = {
      channel,
      limit,
    };

    if (cursor) payload.cursor = cursor;
    if (inclusive !== undefined) payload.inclusive = inclusive;
    if (latest) payload.latest = latest;
    if (oldest) payload.oldest = oldest;

    const result = await this.callApi('conversations.history', payload);

    return {
      success: true,
      data: {
        messages: result.messages,
        hasMore: result.has_more,
        nextCursor: result.response_metadata?.next_cursor,
        channel: result.channel,
      },
    };
  }

  /**
   * Update a message
   */
  private async update(context: ExecutionContext): Promise<NodeExecutionResult> {
    const channel = this.resolveValue(this.config.channel, context);
    const ts = this.resolveValue(this.config.ts, context);
    const text = this.resolveValue(this.config.text, context);
    const blocks = this.config.blocks;
    const attachments = this.config.attachments;

    if (!channel) {
      throw new Error('channel is required');
    }

    if (!ts) {
      throw new Error('ts (message timestamp) is required');
    }

    if (!this.accessToken) {
      throw new Error('accessToken is required');
    }

    const payload: any = {
      channel,
      ts,
    };

    if (text) payload.text = text;
    if (blocks) payload.blocks = blocks;
    if (attachments) payload.attachments = attachments;

    const result = await this.callApi('chat.update', payload);

    return {
      success: true,
      data: {
        channel: result.channel,
        ts: result.ts,
        message: result.message,
        updated: true,
      },
    };
  }

  /**
   * Delete a message
   */
  private async delete(context: ExecutionContext): Promise<NodeExecutionResult> {
    const channel = this.resolveValue(this.config.channel, context);
    const ts = this.resolveValue(this.config.ts, context);

    if (!channel) {
      throw new Error('channel is required');
    }

    if (!ts) {
      throw new Error('ts (message timestamp) is required');
    }

    if (!this.accessToken) {
      throw new Error('accessToken is required');
    }

    const payload = {
      channel,
      ts,
    };

    await this.callApi('chat.delete', payload);

    return {
      success: true,
      data: {
        channel,
        ts,
        deleted: true,
      },
    };
  }

  /**
   * Schedule a message
   */
  private async schedule(context: ExecutionContext): Promise<NodeExecutionResult> {
    const channel = this.resolveValue(this.config.channel, context);
    const text = this.resolveValue(this.config.text, context);
    const postAt = this.config.postAt;
    const blocks = this.config.blocks;
    const attachments = this.config.attachments;

    if (!channel) {
      throw new Error('channel is required');
    }

    if (!postAt) {
      throw new Error('postAt (scheduled timestamp) is required');
    }

    if (!this.accessToken) {
      throw new Error('accessToken is required');
    }

    const payload: any = {
      channel,
      post_at: postAt,
    };

    if (text) payload.text = text;
    if (blocks) payload.blocks = blocks;
    if (attachments) payload.attachments = attachments;

    const result = await this.callApi('chat.scheduleMessage', payload);

    return {
      success: true,
      data: {
        scheduledMessageId: result.scheduled_message_id,
        channel: result.channel,
        postAt: result.post_at,
      },
    };
  }

  /**
   * Reply to a message
   */
  private async reply(context: ExecutionContext): Promise<NodeExecutionResult> {
    const channel = this.resolveValue(this.config.channel, context);
    const threadTs = this.resolveValue(this.config.threadTs, context);
    const text = this.resolveValue(this.config.text, context);
    const blocks = this.config.blocks;
    const attachments = this.config.attachments;

    if (!channel) {
      throw new Error('channel is required');
    }

    if (!threadTs) {
      throw new Error('threadTs (parent message timestamp) is required');
    }

    return await this.postMessage({
      ...context,
      config: {
        ...this.config,
        channel,
        text,
        blocks,
        attachments,
        threadTs,
      },
    } as ExecutionContext);
  }

  /**
   * Add a reaction
   */
  private async addReaction(context: ExecutionContext): Promise<NodeExecutionResult> {
    const channel = this.resolveValue(this.config.channel, context);
    const name = this.resolveValue(this.config.name, context);
    const timestamp = this.resolveValue(this.config.timestamp, context);

    if (!channel) {
      throw new Error('channel is required');
    }

    if (!name) {
      throw new Error('name (reaction emoji) is required');
    }

    if (!timestamp) {
      throw new Error('timestamp (message timestamp) is required');
    }

    if (!this.accessToken) {
      throw new Error('accessToken is required');
    }

    const payload = {
      channel,
      name,
      timestamp,
    };

    await this.callApi('reactions.add', payload);

    return {
      success: true,
      data: {
        channel,
        name,
        timestamp,
        added: true,
      },
    };
  }

  /**
   * Remove a reaction
   */
  private async removeReaction(context: ExecutionContext): Promise<NodeExecutionResult> {
    const channel = this.resolveValue(this.config.channel, context);
    const name = this.resolveValue(this.config.name, context);
    const timestamp = this.resolveValue(this.config.timestamp, context);

    if (!channel) {
      throw new Error('channel is required');
    }

    if (!name) {
      throw new Error('name (reaction emoji) is required');
    }

    if (!timestamp) {
      throw new Error('timestamp (message timestamp) is required');
    }

    if (!this.accessToken) {
      throw new Error('accessToken is required');
    }

    const payload = {
      channel,
      name,
      timestamp,
    };

    await this.callApi('reactions.remove', payload);

    return {
      success: true,
      data: {
        channel,
        name,
        timestamp,
        removed: true,
      },
    };
  }

  /**
   * Get reactions for a message
   */
  private async getReactions(): Promise<NodeExecutionResult> {
    const channel = this.config.channel;
    const timestamp = this.config.timestamp;
    const full = this.config.full || false;

    if (!channel) {
      throw new Error('channel is required');
    }

    if (!timestamp) {
      throw new Error('timestamp (message timestamp) is required');
    }

    if (!this.accessToken) {
      throw new Error('accessToken is required');
    }

    const payload = {
      channel,
      timestamp,
      full,
    };

    const result = await this.callApi('reactions.get', payload);

    return {
      success: true,
      data: {
        reactions: result.message?.reactions || result.reactions || [],
      },
    };
  }

  /**
   * Get channel info
   */
  private async getChannel(context: ExecutionContext): Promise<NodeExecutionResult> {
    const channel = this.resolveValue(this.config.channel, context);

    if (!channel) {
      throw new Error('channel is required');
    }

    if (!this.accessToken) {
      throw new Error('accessToken is required');
    }

    const payload = {
      channel,
    };

    const result = await this.callApi('conversations.info', payload);

    return {
      success: true,
      data: {
        id: result.channel.id,
        name: result.channel.name,
        topic: result.channel.topic,
        purpose: result.channel.purpose,
        isChannel: result.channel.is_channel,
        isGroup: result.channel.is_group,
        isIm: result.channel.is_im,
        isMpim: result.channel.is_mpim,
        isPrivate: result.channel.is_private,
        created: result.channel.created,
        creator: result.channel.creator,
      },
    };
  }

  /**
   * List channels
   */
  private async listChannels(): Promise<NodeExecutionResult> {
    const limit = this.config.limit || 100;
    const cursor = this.config.cursor;
    const types = this.config.types; // 'public_channel' | 'private_channel' | 'mpim' | 'im'

    if (!this.accessToken) {
      throw new Error('accessToken is required');
    }

    const payload: any = {
      limit,
    };

    if (cursor) payload.cursor = cursor;
    if (types) payload.types = types;

    const result = await this.callApi('conversations.list', payload);

    return {
      success: true,
      data: {
        channels: result.channels.map((c: any) => ({
          id: c.id,
          name: c.name,
          topic: c.topic,
          purpose: c.purpose,
          isPrivate: c.is_private,
          isArchived: c.is_archived,
          created: c.created,
        })),
        nextCursor: result.response_metadata?.next_cursor,
      },
    };
  }

  /**
   * Create a channel
   */
  private async createChannel(context: ExecutionContext): Promise<NodeExecutionResult> {
    const name = this.resolveValue(this.config.name, context);
    const isPrivate = this.config.isPrivate || false;
    const description = this.resolveValue(this.config.description, context);

    if (!name) {
      throw new Error('name is required');
    }

    if (!this.accessToken) {
      throw new Error('accessToken is required');
    }

    const method = isPrivate ? 'conversations.create' : 'conversations.create';
    const payload: any = {
      name,
    };

    if (isPrivate) payload.is_private = true;
    if (description) payload.description = description;

    const result = await this.callApi(method, payload);

    return {
      success: true,
      data: {
        id: result.channel.id,
        name: result.channel.name,
        created: true,
      },
    };
  }

  /**
   * Archive a channel
   */
  private async archiveChannel(context: ExecutionContext): Promise<NodeExecutionResult> {
    const channel = this.resolveValue(this.config.channel, context);

    if (!channel) {
      throw new Error('channel is required');
    }

    if (!this.accessToken) {
      throw new Error('accessToken is required');
    }

    const payload = { channel };

    await this.callApi('conversations.archive', payload);

    return {
      success: true,
      data: {
        channel,
        archived: true,
      },
    };
  }

  /**
   * Set channel topic
   */
  private async setTopic(context: ExecutionContext): Promise<NodeExecutionResult> {
    const channel = this.resolveValue(this.config.channel, context);
    const topic = this.resolveValue(this.config.topic, context);

    if (!channel) {
      throw new Error('channel is required');
    }

    if (!topic) {
      throw new Error('topic is required');
    }

    if (!this.accessToken) {
      throw new Error('accessToken is required');
    }

    const payload = { channel, topic };

    await this.callApi('conversations.setTopic', payload);

    return {
      success: true,
      data: {
        channel,
        topic,
        updated: true,
      },
    };
  }

  /**
   * Set channel purpose
   */
  private async setPurpose(context: ExecutionContext): Promise<NodeExecutionResult> {
    const channel = this.resolveValue(this.config.channel, context);
    const purpose = this.resolveValue(this.config.purpose, context);

    if (!channel) {
      throw new Error('channel is required');
    }

    if (!purpose) {
      throw new Error('purpose is required');
    }

    if (!this.accessToken) {
      throw new Error('accessToken is required');
    }

    const payload = { channel, purpose };

    await this.callApi('conversations.setPurpose', payload);

    return {
      success: true,
      data: {
        channel,
        purpose,
        updated: true,
      },
    };
  }

  /**
   * Join a channel
   */
  private async joinChannel(context: ExecutionContext): Promise<NodeExecutionResult> {
    const channel = this.resolveValue(this.config.channel, context);

    if (!channel) {
      throw new Error('channel is required');
    }

    if (!this.accessToken) {
      throw new Error('accessToken is required');
    }

    const payload = { channel };

    const result = await this.callApi('conversations.join', payload);

    return {
      success: true,
      data: {
        channel: result.channel.id,
        joined: true,
      },
    };
  }

  /**
   * Leave a channel
   */
  private async leaveChannel(context: ExecutionContext): Promise<NodeExecutionResult> {
    const channel = this.resolveValue(this.config.channel, context);

    if (!channel) {
      throw new Error('channel is required');
    }

    if (!this.accessToken) {
      throw new Error('accessToken is required');
    }

    const payload = { channel };

    await this.callApi('conversations.leave', payload);

    return {
      success: true,
      data: {
        channel,
        left: true,
      },
    };
  }

  /**
   * Invite users to a channel
   */
  private async inviteToChannel(context: ExecutionContext): Promise<NodeExecutionResult> {
    const channel = this.resolveValue(this.config.channel, context);
    const users = this.resolveValue(this.config.users, context);

    if (!channel) {
      throw new Error('channel is required');
    }

    if (!users) {
      throw new Error('users is required (comma-separated user IDs)');
    }

    if (!this.accessToken) {
      throw new Error('accessToken is required');
    }

    const payload = {
      channel,
      users: Array.isArray(users) ? users.join(',') : users,
    };

    await this.callApi('conversations.invite', payload);

    return {
      success: true,
      data: {
        channel,
        users,
        invited: true,
      },
    };
  }

  /**
   * Kick user from channel
   */
  private async kickFromChannel(context: ExecutionContext): Promise<NodeExecutionResult> {
    const channel = this.resolveValue(this.config.channel, context);
    const user = this.resolveValue(this.config.user, context);

    if (!channel) {
      throw new Error('channel is required');
    }

    if (!user) {
      throw new Error('user is required');
    }

    if (!this.accessToken) {
      throw new Error('accessToken is required');
    }

    const payload = { channel, user };

    await this.callApi('conversations.kick', payload);

    return {
      success: true,
      data: {
        channel,
        user,
        kicked: true,
      },
    };
  }

  /**
   * Get user info
   */
  private async getUser(context: ExecutionContext): Promise<NodeExecutionResult> {
    const user = this.resolveValue(this.config.user, context);

    if (!user) {
      throw new Error('user is required');
    }

    if (!this.accessToken) {
      throw new Error('accessToken is required');
    }

    const payload = { user };

    const result = await this.callApi('users.info', payload);

    return {
      success: true,
      data: {
        id: result.user.id,
        name: result.user.name,
        realName: result.user.real_name,
        email: result.user.profile?.email,
        title: result.user.profile?.title,
        phone: result.user.profile?.phone,
        isAdmin: result.user.is_admin,
        isOwner: result.user.is_owner,
        presence: result.user.presence,
      },
    };
  }

  /**
   * List users
   */
  private async listUsers(): Promise<NodeExecutionResult> {
    const limit = this.config.limit || 100;
    const cursor = this.config.cursor;

    if (!this.accessToken) {
      throw new Error('accessToken is required');
    }

    const payload: any = {
      limit,
    };

    if (cursor) payload.cursor = cursor;

    const result = await this.callApi('users.list', payload);

    return {
      success: true,
      data: {
        users: result.members.map((m: any) => ({
          id: m.id,
          name: m.name,
          realName: m.real_name,
          isAdmin: m.is_admin,
          isBot: m.is_bot,
          deleted: m.deleted,
        })),
        nextCursor: result.response_metadata?.next_cursor,
      },
    };
  }

  /**
   * Set presence
   */
  private async setPresence(context: ExecutionContext): Promise<NodeExecutionResult> {
    const presence = this.resolveValue(this.config.presence, context); // 'auto' | 'away'

    if (!presence) {
      throw new Error('presence is required (auto or away)');
    }

    if (!this.accessToken) {
      throw new Error('accessToken is required');
    }

    const payload = { presence };

    await this.callApi('users.setPresence', payload);

    return {
      success: true,
      data: {
        presence,
        set: true,
      },
    };
  }

  /**
   * Set status
   */
  private async setStatus(context: ExecutionContext): Promise<NodeExecutionResult> {
    const statusText = this.resolveValue(this.config.statusText, context);
    const statusEmoji = this.resolveValue(this.config.statusEmoji, context);
    const expiration = this.config.expiration; // Unix timestamp

    if (!this.accessToken) {
      throw new Error('accessToken is required');
    }

    const profile: any = {};

    if (statusText !== undefined) profile.status_text = statusText;
    if (statusEmoji !== undefined) profile.status_emoji = statusEmoji;
    if (expiration) profile.status_expiration = expiration;

    const payload = { profile };

    await this.callApi('users.profile.set', payload);

    return {
      success: true,
      data: {
        statusText,
        statusEmoji,
        set: true,
      },
    };
  }

  /**
   * Get team info
   */
  private async getTeam(): Promise<NodeExecutionResult> {
    if (!this.accessToken) {
      throw new Error('accessToken is required');
    }

    const result = await this.callApi('team.info', {});

    return {
      success: true,
      data: {
        id: result.team.id,
        name: result.team.name,
        domain: result.team.domain,
        emailDomain: result.team.email_domain,
        icon: result.team.icon,
      },
    };
  }

  /**
   * Pin a message
   */
  private async pinMessage(context: ExecutionContext): Promise<NodeExecutionResult> {
    const channel = this.resolveValue(this.config.channel, context);
    const timestamp = this.resolveValue(this.config.timestamp, context);

    if (!channel) {
      throw new Error('channel is required');
    }

    if (!timestamp) {
      throw new Error('timestamp (message timestamp) is required');
    }

    if (!this.accessToken) {
      throw new Error('accessToken is required');
    }

    const payload = { channel, timestamp };

    await this.callApi('pins.add', payload);

    return {
      success: true,
      data: {
        channel,
        timestamp,
        pinned: true,
      },
    };
  }

  /**
   * Unpin a message
   */
  private async unpinMessage(context: ExecutionContext): Promise<NodeExecutionResult> {
    const channel = this.resolveValue(this.config.channel, context);
    const timestamp = this.resolveValue(this.config.timestamp, context);

    if (!channel) {
      throw new Error('channel is required');
    }

    if (!timestamp) {
      throw new Error('timestamp (message timestamp) is required');
    }

    if (!this.accessToken) {
      throw new Error('accessToken is required');
    }

    const payload = { channel, timestamp };

    await this.callApi('pins.remove', payload);

    return {
      success: true,
      data: {
        channel,
        timestamp,
        unpinned: true,
      },
    };
  }

  /**
   * List pinned items
   */
  private async listPins(context: ExecutionContext): Promise<NodeExecutionResult> {
    const channel = this.resolveValue(this.config.channel, context);

    if (!channel) {
      throw new Error('channel is required');
    }

    if (!this.accessToken) {
      throw new Error('accessToken is required');
    }

    const payload = { channel };

    const result = await this.callApi('pins.list', payload);

    return {
      success: true,
      data: {
        items: result.items,
        channel: result.channel,
      },
    };
  }

  /**
   * Delete scheduled message
   */
  private async deleteScheduledMessage(context: ExecutionContext): Promise<NodeExecutionResult> {
    const channel = this.resolveValue(this.config.channel, context);
    const scheduledMessageId = this.resolveValue(this.config.scheduledMessageId, context);

    if (!channel) {
      throw new Error('channel is required');
    }

    if (!scheduledMessageId) {
      throw new Error('scheduledMessageId is required');
    }

    if (!this.accessToken) {
      throw new Error('accessToken is required');
    }

    const payload = {
      channel,
      scheduled_message_id: scheduledMessageId,
    };

    await this.callApi('chat.deleteScheduledMessage', payload);

    return {
      success: true,
      data: {
        scheduledMessageId,
        deleted: true,
      },
    };
  }

  /**
   * List scheduled messages
   */
  private async listScheduledMessages(): Promise<NodeExecutionResult> {
    const channel = this.config.channel;
    const cursor = this.config.cursor;
    const latest = this.config.latest;
    const limit = this.config.limit || 100;
    const oldest = this.config.oldest;

    if (!this.accessToken) {
      throw new Error('accessToken is required');
    }

    const payload: any = {
      limit,
    };

    if (channel) payload.channel = channel;
    if (cursor) payload.cursor = cursor;
    if (latest) payload.latest = latest;
    if (oldest) payload.oldest = oldest;

    const result = await this.callApi('chat.scheduledMessages.list', payload);

    return {
      success: true,
      data: {
        scheduledMessages: result.scheduled_messages,
        nextCursor: result.response_metadata?.next_cursor,
      },
    };
  }

  /**
   * Get scheduled message
   */
  private async getScheduledMessage(context: ExecutionContext): Promise<NodeExecutionResult> {
    const channel = this.resolveValue(this.config.channel, context);
    const scheduledMessageId = this.resolveValue(this.config.scheduledMessageId, context);

    if (!channel) {
      throw new Error('channel is required');
    }

    if (!scheduledMessageId) {
      throw new Error('scheduledMessageId is required');
    }

    if (!this.accessToken) {
      throw new Error('accessToken is required');
    }

    const payload = {
      channel,
      scheduled_message_id: scheduledMessageId,
    };

    const result = await this.callApi('chat.scheduledMessages.info', payload);

    return {
      success: true,
      data: {
        scheduledMessage: result.scheduled_message,
      },
    };
  }

  /**
   * Create a user group
   */
  private async createUserGroup(context: ExecutionContext): Promise<NodeExecutionResult> {
    const name = this.resolveValue(this.config.name, context);
    const handle = this.resolveValue(this.config.handle, context);
    const description = this.resolveValue(this.config.description, context);
    const channels = this.config.channels;
    const users = this.config.users;

    if (!name) {
      throw new Error('name is required');
    }

    if (!handle) {
      throw new Error('handle is required');
    }

    if (!this.accessToken) {
      throw new Error('accessToken is required');
    }

    const payload: any = {
      name,
      handle,
    };

    if (description) payload.description = description;
    if (channels) payload.channels = channels;
    if (users) payload.users = users;

    const result = await this.callApi('usergroups.create', payload);

    return {
      success: true,
      data: {
        id: result.usergroup.id,
        name: result.usergroup.name,
        handle: result.usergroup.handle,
        created: true,
      },
    };
  }

  /**
   * Get user group
   */
  private async getUserGroup(context: ExecutionContext): Promise<NodeExecutionResult> {
    const usergroup = this.resolveValue(this.config.usergroup, context);

    if (!usergroup) {
      throw new Error('usergroup (ID) is required');
    }

    if (!this.accessToken) {
      throw new Error('accessToken is required');
    }

    const payload = { usergroup };

    const result = await this.callApi('usergroups.info', payload);

    return {
      success: true,
      data: {
        id: result.usergroup.id,
        name: result.usergroup.name,
        handle: result.usergroup.handle,
        description: result.usergroup.description,
        users: result.usergroup.users,
        channelCount: result.usergroup.channel_count,
      },
    };
  }

  /**
   * List user groups
   */
  private async listUserGroups(): Promise<NodeExecutionResult> {
    const includeUsers = this.config.includeUsers !== false;
    const includeCount = this.config.includeCount !== false;
    const includeDisabled = this.config.includeDisabled || false;

    if (!this.accessToken) {
      throw new Error('accessToken is required');
    }

    const payload = {
      include_users: includeUsers,
      include_count: includeCount,
      include_disabled: includeDisabled,
    };

    const result = await this.callApi('usergroups.list', payload);

    return {
      success: true,
      data: {
        usergroups: result.usergroups,
      },
    };
  }

  /**
   * Update user group
   */
  private async updateUserGroup(context: ExecutionContext): Promise<NodeExecutionResult> {
    const usergroup = this.resolveValue(this.config.usergroup, context);
    const name = this.config.name;
    const handle = this.config.handle;
    const description = this.config.description;
    const channels = this.config.channels;
    const users = this.config.users;

    if (!usergroup) {
      throw new Error('usergroup (ID) is required');
    }

    if (!this.accessToken) {
      throw new Error('accessToken is required');
    }

    const payload: any = {
      usergroup,
    };

    if (name) payload.name = name;
    if (handle) payload.handle = handle;
    if (description) payload.description = description;
    if (channels) payload.channels = channels;
    if (users) payload.users = users;

    const result = await this.callApi('usergroups.update', payload);

    return {
      success: true,
      data: {
        id: result.usergroup.id,
        updated: true,
      },
    };
  }

  /**
   * Call Slack API
   */
  private async callApi(method: string, payload: any, isFormData = false): Promise<any> {
    const url = `${this.apiBaseUrl}/${method}`;

    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    };

    if (isFormData) {
      options.body = payload as any;
    } else {
      options.headers = {
        ...options.headers,
        'Content-Type': 'application/json',
      };
      options.body = JSON.stringify(payload);
    }

    const response = await fetch(url, options);

    const result = await response.json();

    if (!result.ok) {
      throw new Error(result.error || 'Slack API error');
    }

    return result;
  }

  /**
   * Resolve value with variable substitution
   */
  private resolveValue(value: any, context: ExecutionContext): any {
    if (value === null || value === undefined) return undefined;

    if (typeof value === 'string') {
      return value.replace(/\{\{\s*\$(json|workflow|node)\.([\w.]+)\s*\}\}/g, (match, source, path) => {
        const sourceData = source === 'json' ? context.$json
          : source === 'workflow' ? context.$workflow
          : context.$node;
        const found = this.getNestedValue(sourceData, path);
        return found !== undefined ? String(found) : match;
      });
    }

    return value;
  }

  /**
   * Format error messages
   */
  private formatErrorMessage(error: any): string {
    if (error === 'not_authed') {
      return 'Authentication failed: Invalid Slack access token.';
    }
    if (error === 'channel_not_found') {
      return 'Channel not found: Check the channel ID or name.';
    }
    if (error === 'user_not_found') {
      return 'User not found: Check the user ID.';
    }
    if (error === 'message_not_found') {
      return 'Message not found: Check the timestamp.';
    }
    if (error === 'rate_limited') {
      return 'Rate limited: Too many requests. Please retry later.';
    }
    if (error === 'cant_delete_message') {
      return 'Cannot delete this message (message too old or missing permissions).';
    }
    if (error === 'not_in_channel') {
      return 'Bot is not in the channel. Invite the bot first.';
    }
    if (error === 'already_in_channel') {
      return 'Already in channel.';
    }
    if (error === 'could_not_pin') {
      return 'Could not pin item (too old or limit reached).';
    }
    return `Slack error: ${error || 'Unknown error'}`;
  }

  getType(): string {
    return 'slack';
  }

  getIcon(): string {
    return '💬';
  }

  /**
   * Create a block kit section
   */
  static createSection(text: string, fields?: any[]): any {
    return {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text,
      },
      ...(fields && { fields }),
    };
  }

  /**
   * Create a divider block
   */
  static createDivider(): any {
    {
      type: 'divider';
    }
  }

  /**
   * Create an actions block with buttons
   */
  static createActions(buttons: any[]): any {
    return {
      type: 'actions',
      elements: buttons,
    };
  }

  /**
   * Create a button element
   */
  static createButton(text: string, value: string, style?: 'primary' | 'danger'): any {
    const button: any = {
      type: 'button',
      text: {
        type: 'plain_text',
        text,
      },
      value,
    };

    if (style) button.style = style;

    return button;
  }

  /**
   * Create a header block
   */
  static createHeader(text: string): any {
    return {
      type: 'header',
      text: {
        type: 'plain_text',
        text,
      },
    };
  }

  /**
   * Create an image block
   */
  static createImage(imageUrl: string, altText: string): any {
    return {
      type: 'image',
      image_url: imageUrl,
      alt_text: altText,
    };
  }

  /**
   * Create a context block
   */
  static createContext(elements: any[]): any {
    return {
      type: 'context',
      elements,
    };
  }

  /**
   * Create a plain text input (for modals)
   */
  static createPlainText(label: string, placeholder?: string): any {
    return {
      type: 'input',
      element: {
        type: 'plain_text_input',
        placeholder: placeholder ? {
          type: 'plain_text',
          text: placeholder,
        } : undefined,
      },
      label: {
        type: 'plain_text',
        text: label,
      },
    };
  }
}
