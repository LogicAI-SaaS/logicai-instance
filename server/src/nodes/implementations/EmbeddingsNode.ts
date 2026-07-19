import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';
import OpenAI from 'openai';

/**
 * Embeddings Node - Generate vector embeddings
 * n8n-compatible: OpenAI, Cohere, HuggingFace embeddings
 *
 * Configuration:
 * - provider: 'openai' | 'cohere' | 'huggingface' | 'voyageai'
 * - model: Model name (e.g., 'text-embedding-3-small', 'embed-english-v3.0')
 * - apiKey: API key for the provider
 * - text: Text to embed (or array of texts for batch)
 * - batchSize: Maximum texts per batch (default: 100)
 * - dimensions: Output dimensions (for supported models)
 * - encodingFormat: 'float' | 'base64'
 */
export class EmbeddingsNode extends BaseNode {
  private openaiClient?: OpenAI;

  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
    this.validateConfig();
    this.initializeClients();
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    const provider = this.config.provider || 'openai';

    if (!['openai', 'cohere', 'huggingface', 'voyageai'].includes(provider)) {
      throw new Error(`Invalid provider: ${provider}. Valid: openai, cohere, huggingface, voyageai`);
    }

    if (provider === 'openai' && !this.config.apiKey) {
      throw new Error('apiKey is required for OpenAI embeddings');
    }

    const batchSize = this.config.batchSize || 100;
    if (typeof batchSize !== 'number' || batchSize < 1 || batchSize > 2048) {
      throw new Error(`Invalid batchSize: ${batchSize}. Must be between 1 and 2048`);
    }

    if (this.config.dimensions && (this.config.dimensions < 1 || this.config.dimensions > 3072)) {
      throw new Error(`Invalid dimensions: ${this.config.dimensions}. Must be between 1 and 3072`);
    }
  }

  /**
   * Initialize API clients
   */
  private initializeClients(): void {
    const provider = this.config.provider || 'openai';

    if (provider === 'openai' && this.config.apiKey) {
      this.openaiClient = new OpenAI({
        apiKey: this.config.apiKey,
      });
    }
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const provider = this.config.provider || 'openai';
      const model = this.config.model || this.getDefaultModel(provider);
      const text = this.resolveValue(this.config.text, context);
      const batchSize = this.config.batchSize || 100;
      const dimensions = this.config.dimensions;
      const encodingFormat = this.config.encodingFormat || 'float';

      // Normalize text to array
      const texts = Array.isArray(text) ? text : [text];

      if (texts.length === 0) {
        throw new Error('No text provided for embedding generation');
      }

      // Generate embeddings based on provider
      const embeddings = await this.generateEmbeddings(
        provider,
        model,
        texts,
        batchSize,
        dimensions,
        encodingFormat
      );

      return {
        success: true,
        data: {
          embeddings,
          model,
          provider,
          count: embeddings.length,
          dimension: embeddings[0]?.length || 0,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.formatErrorMessage(error),
      };
    }
  }

  /**
   * Get default model for provider
   */
  private getDefaultModel(provider: string): string {
    const defaults: Record<string, string> = {
      openai: 'text-embedding-3-small',
      cohere: 'embed-english-v3.0',
      huggingface: 'sentence-transformers/all-MiniLM-L6-v2',
      voyageai: 'voyage-3',
    };
    return defaults[provider] || 'text-embedding-3-small';
  }

  /**
   * Generate embeddings
   */
  private async generateEmbeddings(
    provider: string,
    model: string,
    texts: string[],
    batchSize: number,
    dimensions?: number,
    encodingFormat?: string
  ): Promise<number[][]> {
    switch (provider) {
      case 'openai':
        return await this.generateOpenAIEmbeddings(model, texts, batchSize, dimensions, encodingFormat);

      case 'cohere':
        return await this.generateCohereEmbeddings(model, texts, batchSize);

      case 'huggingface':
        return await this.generateHuggingFaceEmbeddings(model, texts);

      case 'voyageai':
        return await this.generateVoyageAIEmbeddings(model, texts, batchSize);

      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  /**
   * Generate OpenAI embeddings
   */
  private async generateOpenAIEmbeddings(
    model: string,
    texts: string[],
    batchSize: number,
    dimensions?: number,
    encodingFormat?: string
  ): Promise<number[][]> {
    if (!this.openaiClient) {
      throw new Error('OpenAI client not initialized');
    }

    const allEmbeddings: number[][] = [];

    // Process in batches
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);

      const response = await this.openaiClient.embeddings.create({
        model,
        input: batch,
        dimensions,
        encoding_format: encodingFormat as 'float' | 'base64' | undefined,
      });

      const embeddings = response.data.map(item => {
        if (encodingFormat === 'base64') {
          // Decode base64 to float array
          const buffer = Buffer.from(item.embedding as any, 'base64');
          return Array.from(new Float32Array(buffer.buffer));
        }
        return item.embedding as number[];
      });

      allEmbeddings.push(...embeddings);
    }

    return allEmbeddings;
  }

  /**
   * Generate Cohere embeddings
   */
  private async generateCohereEmbeddings(
    model: string,
    texts: string[],
    batchSize: number
  ): Promise<number[][]> {
    const apiKey = this.config.apiKey;
    if (!apiKey) {
      throw new Error('Cohere API key is required');
    }

    const allEmbeddings: number[][] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);

      const response = await fetch('https://api.cohere.ai/v1/embed', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          texts: batch,
          input_type: 'search_document',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Cohere API error: ${error.message || response.statusText}`);
      }

      const data = await response.json();
      allEmbeddings.push(...data.embeddings);
    }

    return allEmbeddings;
  }

  /**
   * Generate HuggingFace embeddings
   */
  private async generateHuggingFaceEmbeddings(
    model: string,
    texts: string[]
  ): Promise<number[][]> {
    const apiKey = this.config.apiKey;
    const apiUrl = `https://api-inference.huggingface.co/pipeline/feature-extraction/${model}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey || 'hf_demo'}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: texts,
        options: {
          wait_for_model: true,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HuggingFace API error: ${response.statusText}`);
    }

    const data = await response.json();

    // HuggingFace returns nested array [[...], ...] for multiple texts
    return Array.isArray(data[0]) ? data : [data];
  }

  /**
   * Generate VoyageAI embeddings
   */
  private async generateVoyageAIEmbeddings(
    model: string,
    texts: string[],
    batchSize: number
  ): Promise<number[][]> {
    const apiKey = this.config.apiKey;
    if (!apiKey) {
      throw new Error('VoyageAI API key is required');
    }

    const allEmbeddings: number[][] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);

      const response = await fetch('https://api.voyageai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          input: batch,
          encoding_format: 'float',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`VoyageAI API error: ${error.message || response.statusText}`);
      }

      const data = await response.json();
      allEmbeddings.push(...data.data.map((item: any) => item.embedding));
    }

    return allEmbeddings;
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
    if (error.message?.includes('Invalid provider')) {
      return error.message;
    }
    if (error.message?.includes('apiKey is required')) {
      return error.message;
    }
    if (error.message?.includes('No text provided')) {
      return error.message;
    }
    if (error.status === 401) {
      return 'Authentication failed: Invalid API key';
    }
    if (error.status === 429) {
      return 'Rate limited: Too many requests to the embeddings API';
    }
    if (error.code === 'ENOTFOUND') {
      return 'Network error: Unable to reach embeddings API';
    }
    return `Embeddings error: ${error.message || 'Unknown error'}`;
  }

  getType(): string {
    return 'embeddings';
  }

  getIcon(): string {
    return 'Cpu';
  }

  /**
   * Get available models for a provider
   */
  static getAvailableModels(provider: string): string[] {
    const models: Record<string, string[]> = {
      openai: [
        'text-embedding-3-small',
        'text-embedding-3-large',
        'text-embedding-ada-002',
      ],
      cohere: [
        'embed-english-v3.0',
        'embed-english-light-v3.0',
        'embed-multilingual-v3.0',
        'embed-english-v2.0',
      ],
      huggingface: [
        'sentence-transformers/all-MiniLM-L6-v2',
        'sentence-transformers/all-mpnet-base-v2',
        'BAAI/bge-small-en-v1.5',
      ],
      voyageai: [
        'voyage-3',
        'voyage-3-lite',
        'voyage-2',
      ],
    };

    return models[provider] || [];
  }

  /**
   * Get model dimensions
   */
  static getModelDimensions(model: string): number {
    const dimensions: Record<string, number> = {
      'text-embedding-3-small': 1536,
      'text-embedding-3-large': 3072,
      'text-embedding-ada-002': 1536,
      'embed-english-v3.0': 1024,
      'embed-english-light-v3.0': 384,
      'embed-multilingual-v3.0': 1024,
      'voyage-3': 1024,
      'voyage-3-lite': 512,
      'voyage-2': 1024,
    };

    return dimensions[model] || 1536;
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  static cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Embeddings must have the same dimensions');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
