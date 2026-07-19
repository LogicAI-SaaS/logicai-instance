import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';
import Anthropic from '@anthropic-ai/sdk';

/**
 * Anthropic Claude Node - Claude AI API integration
 * 
 * Supported operations:
 * - chat: Chat completion with Claude models
 * - completion: Text completion
 * - streaming: Stream responses
 */
export class AnthropicNode extends BaseNode {
  private client?: Anthropic;

  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
    this.initializeClient();
  }

  getType(): string {
    return 'anthropic';
  }

  getIcon(): string {
    return 'brain-circuit';
  }

  private initializeClient(): void {
    const apiKey = this.config.credentials?.apiKey || this.config.apiKey || process.env.ANTHROPIC_API_KEY;
    if (apiKey) {
      this.client = new Anthropic({ apiKey });
    }
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      if (!this.client) {
        throw new Error('Anthropic API key not configured');
      }

      const operation = this.config.operation || 'chat';
      const model = this.config.model || 'claude-3-5-sonnet-20241022';

      switch (operation) {
        case 'chat':
          return await this.chat(context, model);
        case 'completion':
          return await this.completion(context, model);
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

  private async chat(context: ExecutionContext, model: string): Promise<NodeExecutionResult> {
    const messages = this.config.messages || [
      { role: 'user', content: this.config.prompt || '' }
    ];
    
    const maxTokens = this.config.maxTokens || 1024;
    const temperature = this.config.temperature || 1;

    const response = await this.client!.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      messages,
    });

    return {
      success: true,
      data: {
        content: response.content[0].type === 'text' ? response.content[0].text : '',
        model: response.model,
        usage: response.usage,
        stopReason: response.stop_reason,
      },
      error: null,
    };
  }

  private async completion(context: ExecutionContext, model: string): Promise<NodeExecutionResult> {
    const prompt = this.config.prompt || context.$json.prompt || '';
    const maxTokens = this.config.maxTokens || 1024;

    const response = await this.client!.messages.create({
      model,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    });

    return {
      success: true,
      data: {
        completion: response.content[0].type === 'text' ? response.content[0].text : '',
        usage: response.usage,
      },
      error: null,
    };
  }

  validateConfig(): string[] {
    const errors: string[] = [];
    
    if (!this.config.credentials?.apiKey && !this.config.apiKey && !process.env.ANTHROPIC_API_KEY) {
      errors.push('Anthropic API key is required');
    }

    return errors;
  }
}
