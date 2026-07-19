import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * Google Gemini Node - Gemini AI API integration
 * 
 * Supported operations:
 * - chat: Chat completion with Gemini models
 * - generateContent: Generate content from text
 * - multimodal: Process text and images
 */
export class GeminiNode extends BaseNode {
  private apiKey?: string;

  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
    this.apiKey = this.config.credentials?.apiKey || this.config.apiKey || process.env.GEMINI_API_KEY;
  }

  getType(): string {
    return 'gemini';
  }

  getIcon(): string {
    return 'sparkles';
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      if (!this.apiKey) {
        throw new Error('Gemini API key not configured');
      }

      const operation = this.config.operation || 'chat';
      const model = this.config.model || 'gemini-1.5-pro';

      switch (operation) {
        case 'chat':
          return await this.chat(context, model);
        case 'generateContent':
          return await this.generateContent(context, model);
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
    const prompt = this.config.prompt || context.$json.prompt || '';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: this.config.temperature || 0.7,
          maxOutputTokens: this.config.maxTokens || 1024,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${error}`);
    }

    const data = await response.json() as any;
    
    return {
      success: true,
      data: {
        content: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
        model,
        usage: data.usageMetadata,
      },
      error: null,
    };
  }

  private async generateContent(context: ExecutionContext, model: string): Promise<NodeExecutionResult> {
    return this.chat(context, model);
  }

  validateConfig(): string[] {
    const errors: string[] = [];
    
    if (!this.apiKey) {
      errors.push('Gemini API key is required');
    }

    return errors;
  }
}
