import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * OpenRouter Node - Unified LLM API router
 * 
 * Access multiple LLM providers through a single API
 * Supported providers: OpenAI, Anthropic, Google, Meta, Mistral, and more
 */
export class OpenRouterNode extends BaseNode {
  private apiKey?: string;

  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
    this.apiKey = this.config.credentials?.apiKey || this.config.apiKey || process.env.OPENROUTER_API_KEY;
  }

  getType(): string {
    return 'openrouter';
  }

  getIcon(): string {
    return 'network';
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      if (!this.apiKey) {
        throw new Error('OpenRouter API key not configured');
      }

      const operation = this.config.operation || 'chat';
      
      switch (operation) {
        case 'chat':
          return await this.chat(context);
        case 'completion':
          return await this.completion(context);
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

  private async chat(context: ExecutionContext): Promise<NodeExecutionResult> {
    const model = this.config.model || 'openai/gpt-4-turbo';
    const messages = this.config.messages || [
      { role: 'user', content: this.config.prompt || context.$json.prompt || '' }
    ];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': this.config.siteUrl || 'https://logicai.app',
        'X-Title': this.config.siteName || 'LogicAI Workflow',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: this.config.temperature || 0.7,
        max_tokens: this.config.maxTokens || 1024,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${error}`);
    }

    const data = await response.json() as any;
    
    return {
      success: true,
      data: {
        content: data.choices?.[0]?.message?.content || '',
        model: data.model,
        usage: data.usage,
        provider: data.model?.split('/')?.[0],
      },
      error: null,
    };
  }

  private async completion(context: ExecutionContext): Promise<NodeExecutionResult> {
    return this.chat(context);
  }

  validateConfig(): string[] {
    const errors: string[] = [];
    
    if (!this.apiKey) {
      errors.push('OpenRouter API key is required');
    }

    if (!this.config.model) {
      errors.push('Model selection is required');
    }

    return errors;
  }
}
