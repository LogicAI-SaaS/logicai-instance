import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * GLM Node - Zhipu AI (ChatGLM) API integration
 * 
 * Chinese LLM by Zhipu AI
 * Supported operations:
 * - chat: Chat completion
 * - completion: Text completion
 */
export class GLMNode extends BaseNode {
  private apiKey?: string;

  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
    this.apiKey = this.config.credentials?.apiKey || this.config.apiKey || process.env.GLM_API_KEY;
  }

  getType(): string {
    return 'glm';
  }

  getIcon(): string {
    return 'globe';
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      if (!this.apiKey) {
        throw new Error('GLM API key not configured');
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
    const model = this.config.model || 'glm-4';
    const messages = this.config.messages || [
      { role: 'user', content: this.config.prompt || context.$json.prompt || '' }
    ];

    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
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
      throw new Error(`GLM API error: ${error}`);
    }

    const data = await response.json() as any;
    
    return {
      success: true,
      data: {
        content: data.choices?.[0]?.message?.content || '',
        model: data.model,
        usage: data.usage,
        finishReason: data.choices?.[0]?.finish_reason,
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
      errors.push('GLM API key is required');
    }

    return errors;
  }
}
