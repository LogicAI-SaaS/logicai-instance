import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * Ollama Node - Local LLM inference
 * 
 * Run language models locally using Ollama
 * Requires Ollama to be installed and running on the server
 */
export class OllamaNode extends BaseNode {
  private baseUrl: string;

  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
    this.baseUrl = this.config.baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  }

  getType(): string {
    return 'ollama';
  }

  getIcon(): string {
    return 'server';
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const operation = this.config.operation || 'generate';
      
      switch (operation) {
        case 'generate':
          return await this.generate(context);
        case 'chat':
          return await this.chat(context);
        case 'embeddings':
          return await this.embeddings(context);
        case 'listModels':
          return await this.listModels();
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

  private async generate(context: ExecutionContext): Promise<NodeExecutionResult> {
    const model = this.config.model || 'llama3';
    const prompt = this.config.prompt || context.$json.prompt || '';

    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: {
          temperature: this.config.temperature || 0.7,
          num_predict: this.config.maxTokens || 1024,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ollama API error: ${error}`);
    }

    const data = await response.json() as any;
    
    return {
      success: true,
      data: {
        content: data.response,
        model: data.model,
        context: data.context,
        totalDuration: data.total_duration,
      },
      error: null,
    };
  }

  private async chat(context: ExecutionContext): Promise<NodeExecutionResult> {
    const model = this.config.model || 'llama3';
    const messages = this.config.messages || [
      { role: 'user', content: this.config.prompt || context.$json.prompt || '' }
    ];

    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        options: {
          temperature: this.config.temperature || 0.7,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ollama API error: ${error}`);
    }

    const data = await response.json() as any;
    
    return {
      success: true,
      data: {
        content: data.message?.content || '',
        model: data.model,
        role: data.message?.role,
      },
      error: null,
    };
  }

  private async embeddings(context: ExecutionContext): Promise<NodeExecutionResult> {
    const model = this.config.model || 'llama3';
    const prompt = this.config.prompt || context.$json.text || '';

    const response = await fetch(`${this.baseUrl}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ollama API error: ${error}`);
    }

    const data = await response.json() as any;
    
    return {
      success: true,
      data: {
        embeddings: data.embedding,
        model: data.model,
      },
      error: null,
    };
  }

  private async listModels(): Promise<NodeExecutionResult> {
    const response = await fetch(`${this.baseUrl}/api/tags`);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ollama API error: ${error}`);
    }

    const data = await response.json() as any;
    
    return {
      success: true,
      data: {
        models: data.models || [],
      },
      error: null,
    };
  }

  validateConfig(): string[] {
    const errors: string[] = [];
    
    if (!this.config.model && this.config.operation !== 'listModels') {
      errors.push('Model name is required');
    }

    return errors;
  }
}
