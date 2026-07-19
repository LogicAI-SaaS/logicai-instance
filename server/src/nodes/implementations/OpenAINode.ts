import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

/**
 * OpenAI/Anthropic Node - LLM API integration
 * n8n-compatible: OpenAI and Anthropic Claude API
 *
 * Supported operations:
 * - chat: Chat completion with messages
 * - completion: Text completion
 * - embedding: Generate embeddings for text
 */
export class OpenAINode extends BaseNode {
  private openaiClient?: OpenAI;
  private anthropicClient?: Anthropic;

  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
    this.initializeClients();
  }

  /**
   * Initialize API clients with credentials
   */
  private initializeClients(): void {
    // Initialize OpenAI client if API key is provided
    const openaiKey = this.config.credentials?.openaiApiKey || this.config.apiKey || process.env.OPENAI_API_KEY;
    if (openaiKey) {
      this.openaiClient = new OpenAI({
        apiKey: openaiKey,
      });
    }

    // Initialize Anthropic client if API key is provided
    const anthropicKey = this.config.credentials?.anthropicApiKey || this.config.anthropicApiKey || process.env.ANTHROPIC_API_KEY;
    if (anthropicKey) {
      this.anthropicClient = new Anthropic({
        apiKey: anthropicKey,
      });
    }
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      // Validation: Check if API keys are configured
      const provider = this.config.provider || 'openai';

      if (provider === 'openai' && !this.openaiClient) {
        throw new Error('OpenAI API key not configured. Please provide credentials.apiKey or set OPENAI_API_KEY environment variable.');
      }

      if (provider === 'anthropic' && !this.anthropicClient) {
        throw new Error('Anthropic API key not configured. Please provide credentials.anthropicApiKey or set ANTHROPIC_API_KEY environment variable.');
      }

      const operation = this.config.operation || 'chat';
      const model = this.config.model || (provider === 'openai' ? 'gpt-4o' : 'claude-3-5-sonnet-20241022');

      // Resolve prompt from config or context
      let prompt = this.config.prompt || '';
      if (!prompt && context.$json?.prompt) {
        prompt = context.$json.prompt;
      }

      // Resolve messages from config or context
      let messages = this.config.messages || [];
      if (messages.length === 0 && context.$json?.messages) {
        messages = context.$json.messages;
      }

      // If only prompt is provided, convert to messages format for chat
      if (operation === 'chat' && messages.length === 0 && prompt) {
        messages = [{ role: 'user', content: prompt }];
      }

      const maxTokens = this.config.maxTokens || 1000;
      const temperature = this.config.temperature || 0.7;

      // Execute based on provider and operation
      switch (provider) {
        case 'openai':
          return await this.callOpenAI(operation, model, prompt, messages, maxTokens, temperature);
        case 'anthropic':
          return await this.callAnthropic(operation, model, prompt, messages, maxTokens, temperature);
        default:
          throw new Error(`Unknown provider: ${provider}. Supported providers: openai, anthropic`);
      }
    } catch (error: any) {
      // Return detailed error information
      return {
        success: false,
        error: this.formatErrorMessage(error),
      };
    }
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(
    operation: string,
    model: string,
    prompt: string,
    messages: any[],
    maxTokens: number,
    temperature: number
  ): Promise<NodeExecutionResult> {
    if (!this.openaiClient) {
      throw new Error('OpenAI client not initialized');
    }

    try {
      switch (operation) {
        case 'chat': {
          const completion = await this.openaiClient.chat.completions.create({
            model,
            messages: messages.length > 0 ? messages : [{ role: 'user', content: prompt }],
            max_tokens: maxTokens,
            temperature,
          });

          return {
            success: true,
            data: {
              text: completion.choices[0]?.message?.content || '',
              model,
              usage: {
                promptTokens: completion.usage?.prompt_tokens || 0,
                completionTokens: completion.usage?.completion_tokens || 0,
                totalTokens: completion.usage?.total_tokens || 0,
              },
              finishReason: completion.choices[0]?.finish_reason,
              _provider: 'openai',
              _operation: 'chat',
            },
          };
        }

        case 'completion': {
          const completion = await this.openaiClient.completions.create({
            model,
            prompt,
            max_tokens: maxTokens,
            temperature,
          });

          return {
            success: true,
            data: {
              text: completion.choices[0]?.text || '',
              model,
              usage: {
                promptTokens: completion.usage?.prompt_tokens || 0,
                completionTokens: completion.usage?.completion_tokens || 0,
                totalTokens: completion.usage?.total_tokens || 0,
              },
              finishReason: completion.choices[0]?.finish_reason,
              _provider: 'openai',
              _operation: 'completion',
            },
          };
        }

        case 'embedding': {
          const embedding = await this.openaiClient.embeddings.create({
            model: model === 'gpt-4' ? 'text-embedding-3-small' : model,
            input: prompt,
          });

          return {
            success: true,
            data: {
              embedding: embedding.data[0]?.embedding || [],
              model,
              usage: {
                promptTokens: embedding.usage?.prompt_tokens || 0,
                totalTokens: embedding.usage?.total_tokens || 0,
              },
              _provider: 'openai',
              _operation: 'embedding',
            },
          };
        }

        default:
          throw new Error(`Unknown OpenAI operation: ${operation}. Supported: chat, completion, embedding`);
      }
    } catch (error: any) {
      // Re-throw with context for upper error handler
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }

  /**
   * Call Anthropic Claude API
   */
  private async callAnthropic(
    operation: string,
    model: string,
    prompt: string,
    messages: any[],
    maxTokens: number,
    temperature: number
  ): Promise<NodeExecutionResult> {
    if (!this.anthropicClient) {
      throw new Error('Anthropic client not initialized');
    }

    try {
      switch (operation) {
        case 'chat': {
          // Convert messages to Anthropic format if needed
          const systemMessage = messages.find((m) => m.role === 'system');
          const userMessages = messages.filter((m) => m.role !== 'system');

          const message = await this.anthropicClient.messages.create({
            model,
            max_tokens: maxTokens,
            temperature,
            system: systemMessage?.content,
            messages: userMessages.length > 0
              ? userMessages.map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))
              : [{ role: 'user', content: prompt }],
          });

          return {
            success: true,
            data: {
              text: message.content[0]?.type === 'text' ? message.content[0].text : '',
              model,
              usage: {
                inputTokens: message.usage?.input_tokens || 0,
                outputTokens: message.usage?.output_tokens || 0,
                totalTokens: message.usage?.input_tokens + message.usage?.output_tokens || 0,
              },
              stopReason: message.stop_reason,
              _provider: 'anthropic',
              _operation: 'chat',
            },
          };
        }

        case 'completion': {
          // Anthropic uses messages API for completions too
          const message = await this.anthropicClient.messages.create({
            model,
            max_tokens: maxTokens,
            temperature,
            messages: [{ role: 'user', content: prompt }],
          });

          return {
            success: true,
            data: {
              text: message.content[0]?.type === 'text' ? message.content[0].text : '',
              model,
              usage: {
                inputTokens: message.usage?.input_tokens || 0,
                outputTokens: message.usage?.output_tokens || 0,
                totalTokens: message.usage?.input_tokens + message.usage?.output_tokens || 0,
              },
              stopReason: message.stop_reason,
              _provider: 'anthropic',
              _operation: 'completion',
            },
          };
        }

        default:
          throw new Error(`Anthropic does not support operation: ${operation}. Only chat/completion are supported.`);
      }
    } catch (error: any) {
      throw new Error(`Anthropic API error: ${error.message}`);
    }
  }

  /**
   * Format error messages with helpful context
   */
  private formatErrorMessage(error: any): string {
    if (error.response) {
      // API returned an error response
      const status = error.response.status;
      const data = error.response.data;

      if (status === 401) {
        return 'Authentication failed: Invalid API key. Please check your OpenAI/Anthropic API key.';
      }
      if (status === 429) {
        return 'Rate limit exceeded: Too many requests. Please try again later.';
      }
      if (status === 400) {
        return `Bad request: ${data.error?.message || 'Invalid parameters'}`;
      }

      return `API error (${status}): ${JSON.stringify(data)}`;
    }

    if (error.code === 'ENOTFOUND') {
      return 'Network error: Unable to reach API server. Please check your internet connection.';
    }

    return error.message || 'Unknown error occurred';
  }

  getType(): string {
    return 'openAI';
  }

  getIcon(): string {
    return 'Bot';
  }
}
