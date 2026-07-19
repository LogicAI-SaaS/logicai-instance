import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * AI Cost Guardian - Optimizes and truncates text to fit token budgets
 * Prevents cost overruns and context window errors
 */
export class AICostGuardianNode extends BaseNode {
  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const data = { ...context.$json };
      const maxTokens = this.config.maxTokens || 4000;
      const targetField = this.config.targetField || 'prompt';
      const strategy = this.config.strategy || 'truncate'; // truncate, summarize, compress

      // Get the text to optimize
      const text = this.getNestedValue(data, targetField);

      if (!text || typeof text !== 'string') {
        return {
          success: true,
          data,
          warning: 'No text to optimize',
        };
      }

      // Calculate current token count (rough estimation: ~4 chars per token)
      const currentTokens = this.estimateTokens(text);

      if (currentTokens <= maxTokens) {
        return {
          success: true,
          data: {
            ...data,
            _tokenCount: currentTokens,
            _tokenBudgetUsed: currentTokens,
            _tokenBudgetPercent: ((currentTokens / maxTokens) * 100).toFixed(2),
          },
        };
      }

      // Optimize the text
      const optimizedText = await this.optimizeText(text, currentTokens, maxTokens, strategy);
      const newTokens = this.estimateTokens(optimizedText);

      // Update the data
      this.setNestedValue(data, targetField, optimizedText);

      return {
        success: true,
        data: {
          ...data,
          _originalTokenCount: currentTokens,
          _optimizedTokenCount: newTokens,
          _tokensSaved: currentTokens - newTokens,
          _reductionPercent: (((currentTokens - newTokens) / currentTokens) * 100).toFixed(2),
          _strategy: strategy,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'AI Cost Guardian failed',
      };
    }
  }

  getType(): string {
    return 'aiCostGuardian';
  }

  getIcon(): string {
    return 'Shield';
  }

  /**
   * Estimate token count (rough approximation)
   * Real implementation would use tiktoken or similar
   */
  private estimateTokens(text: string): number {
    // Rough estimate: ~4 characters per token for English
    // This varies by language and model
    return Math.ceil(text.length / 4);
  }

  /**
   * Optimize text based on strategy
   */
  private async optimizeText(
    text: string,
    currentTokens: number,
    maxTokens: number,
    strategy: string
  ): Promise<string> {
    const ratio = maxTokens / currentTokens;
    const targetLength = Math.floor(text.length * ratio);

    switch (strategy) {
      case 'truncate':
        return this.truncateText(text, targetLength);

      case 'summarize':
        return await this.summarizeText(text, maxTokens);

      case 'compress':
        return this.compressText(text, targetLength);

      case 'smartTruncate':
        return this.smartTruncate(text, targetLength);

      default:
        return this.truncateText(text, targetLength);
    }
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }

    // Truncate at a sentence boundary if possible
    const truncated = text.substring(0, maxLength);
    const lastPeriod = truncated.lastIndexOf('.');
    const lastNewline = truncated.lastIndexOf('\n');
    const boundary = Math.max(lastPeriod, lastNewline);

    if (boundary > maxLength * 0.8) {
      return text.substring(0, boundary + 1);
    }

    return truncated + '...';
  }

  private async summarizeText(text: string, maxTokens: number): Promise<string> {
    // In a real implementation, this would call an LLM to summarize
    // For now, we'll use extractive summarization

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const targetLength = Math.floor(sentences.length * (maxTokens / this.estimateTokens(text)));

    // Take first and last sentences, plus some from the middle
    const summary: string[] = [];

    // Keep first 20%
    const firstCount = Math.floor(targetLength * 0.2);
    summary.push(...sentences.slice(0, firstCount));

    // Keep middle 60%
    const middleStart = Math.floor((sentences.length - targetLength) / 2);
    const middleCount = Math.floor(targetLength * 0.6);
    summary.push(...sentences.slice(middleStart, middleStart + middleCount));

    // Keep last 20%
    const lastCount = Math.floor(targetLength * 0.2);
    summary.push(...sentences.slice(-lastCount));

    return summary.join('. ') + '.';
  }

  private compressText(text: string, targetLength: number): string {
    // Remove redundant whitespace
    let compressed = text.replace(/\s+/g, ' ').trim();

    // Remove common filler words
    const fillerWords = [
      'very', 'really', 'quite', 'rather', 'somewhat',
      'basically', 'actually', 'literally'
    ];
    fillerWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      compressed = compressed.replace(regex, '');
    });

    // Still too long? Truncate
    if (compressed.length > targetLength) {
      compressed = compressed.substring(0, targetLength - 3) + '...';
    }

    return compressed;
  }

  private smartTruncate(text: string, targetLength: number): string {
    // Prioritize keeping structured data intact
    const lines = text.split('\n');
    const result: string[] = [];
    let currentLength = 0;

    for (const line of lines) {
      if (currentLength + line.length > targetLength) {
        // Try to include partial line
        const remaining = targetLength - currentLength;
        if (remaining > 50) {
          result.push(line.substring(0, remaining - 3) + '...');
        }
        break;
      }
      result.push(line);
      currentLength += line.length + 1;
    }

    return result.join('\n');
  }

  /**
   * Calculate estimated cost for OpenAI API
   */
  static calculateCost(tokens: number, model: string = 'gpt-4'): number {
    const pricesPer1k: Record<string, number> = {
      'gpt-4': 0.03,
      'gpt-4-32k': 0.06,
      'gpt-3.5-turbo': 0.002,
    };

    const price = pricesPer1k[model] || 0.03;
    return (tokens / 1000) * price;
  }
}
