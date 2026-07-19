import { BaseNode, BaseNodeConfig } from '../BaseNode';

// Twitter Tweet Node
export class TwitterTweetNode extends BaseNode {
  constructor(id: string, name: string, config: BaseNodeConfig) {
    super(id, name, config);
  }

  async execute(): Promise<NodeExecutionResult> {
    const tweet = this.config.tweet || '';

    return {
      success: true,
      data: {
        message: 'Tweet posted',
        tweet: tweet,
        service: 'twitter'
      }
    };
  }

  getType(): string {
    return 'twitterTweet';
  }

  getIcon(): string {
    return 'MessageSquare';
  }
}

// Twitter Reply Node
export class TwitterReplyNode extends BaseNode {
  constructor(id: string, name: string, config: BaseNodeConfig) {
    super(id, name, config);
  }

  async execute(): Promise<NodeExecutionResult> {
    const tweetId = this.config.tweetId || '';
    const reply = this.config.reply || '';

    return {
      success: true,
      data: {
        message: 'Twitter reply posted',
        tweetId: tweetId,
        reply: reply,
        service: 'twitter'
      }
    };
  }

  getType(): string {
    return 'twitterReply';
  }

  getIcon(): string {
    return 'MessageCircle';
  }
}

// Twitter Like Node
export class TwitterLikeNode extends BaseNode {
  constructor(id: string, name: string, config: BaseNodeConfig) {
    super(id, name, config);
  }

  async execute(): Promise<NodeExecutionResult> {
    const tweetId = this.config.tweetId || '';

    return {
      success: true,
      data: {
        message: 'Tweet liked',
        tweetId: tweetId,
        service: 'twitter'
      }
    };
  }

  getType(): string {
    return 'twitterLike';
  }

  getIcon(): string {
    return 'Heart';
  }
}

// Twitter Retweet Node
export class TwitterRetweetNode extends BaseNode {
  constructor(id: string, name: string, config: BaseNodeConfig) {
    super(id, name, config);
  }

  async execute(): Promise<NodeExecutionResult> {
    const tweetId = this.config.tweetId || '';

    return {
      success: true,
      data: {
        message: 'Tweet retweeted',
        tweetId: tweetId,
        service: 'twitter'
      }
    };
  }

  getType(): string {
    return 'twitterRetweet';
  }

  getIcon(): string {
    return 'RefreshCw';
  }
}
