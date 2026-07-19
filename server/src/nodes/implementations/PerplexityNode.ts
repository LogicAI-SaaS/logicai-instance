import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * Perplexity Node - Perplexity AI API integration
 * 
 * Supported operations:
 * - chat: Chat completion with Perplexity models
 * - search: Search-augmented chat
 */
export class PerplexityNode extends BaseNode {
  private apiKey?: string;

  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
    this.apiKey = this.config.credentials?.apiKey || this.config.apiKey || process.env.PERPLEXITY_API_KEY;
  }

  getType(): string {
    return 'perplexity';
  }

  getIcon(): string {
    return 'search';
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      if (!this.apiKey) {
        throw new Error('Perplexity API key not configured');
      }

      const operation = this.config.operation || 'chat';
      const model = this.config.model || 'llama-3.1-sonar-large-128k-online';

      switch (operation) {
        case 'chat':
        case 'search':
          return await this.chat(context, model);
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
      { role: 'user', content: this.config.prompt || context.$json.prompt || '' }
    ];

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: this.config.temperature || 0.2,
        max_tokens: this.config.maxTokens || 1024,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Perplexity API error: ${error}`);
    }

    const data = await response.json() as any;
    
    return {
      success: true,
      data: {
        content: data.choices?.[0]?.message?.content || '',
        model: data.model,
        usage: data.usage,
        citations: data.citations || [],
      },
      error: null,
    };
  }

  validateConfig(): string[] {
    const errors: string[] = [];
    
    if (!this.apiKey) {
      errors.push('Perplexity API key is required');
    }

    return errors;
  }
}
