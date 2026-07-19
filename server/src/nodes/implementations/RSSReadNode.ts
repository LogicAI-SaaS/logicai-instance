import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';
import * as Parser from 'rss-parser';

/**
 * RSS Read Node - Read RSS/Atom feeds
 * n8n-compatible: Parse and extract feed items
 *
 * Configuration:
 * - url: Feed URL
 * - maxItems: Maximum items to return (default: 10)
 * - filter: Filter items by conditions
 * - format: 'json' | 'xml' (default: 'json')
 * - options: { stripHtml, trimDescription, resolveUrls }
 */
export class RSSReadNode extends BaseNode {
  private parser: Parser;

  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
    this.validateConfig();
    this.parser = new Parser({
      timeout: this.config.options?.timeout || 30000,
      customFields: {
        item: [
          ['media:content', 'mediaContent'],
          ['media:thumbnail', 'mediaThumbnail'],
          ['enclosure', 'enclosure'],
          ['dc:creator', 'creator'],
          ['content:encoded', 'contentEncoded'],
        ],
      },
    });
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    if (!this.config.url) {
      throw new Error('url is required for RSS feed');
    }

    try {
      new URL(this.config.url);
    } catch {
      throw new Error(`Invalid URL format: ${this.config.url}`);
    }

    const maxItems = this.config.maxItems || 10;
    if (typeof maxItems !== 'number' || maxItems < 1 || maxItems > 1000) {
      throw new Error(`Invalid maxItems: ${maxItems}. Must be between 1 and 1000`);
    }
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const url = this.resolveValue(this.config.url, context);
      const maxItems = this.config.maxItems || 10;
      const format = this.config.format || 'json';
      const options = this.config.options || {};

      // Validate URL
      try {
        new URL(url);
      } catch {
        throw new Error(`Invalid URL format: ${url}`);
      }

      // Fetch and parse RSS feed
      const feed = await this.parser.parseURL(url);

      // Process feed data
      const feedData = this.processFeed(feed, maxItems, options);

      // Note: xml format option removed as rss-parser doesn't return raw XML
      return {
        success: true,
        data: feedData,
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.formatErrorMessage(error),
      };
    }
  }

  /**
   * Process parsed feed data
   */
  private processFeed(feed: any, maxItems: number, options: any): any {
    // Extract feed info
    const feedInfo = {
      title: feed.title || '',
      description: feed.description || '',
      link: feed.link || '',
      language: feed.language,
      lastBuildDate: this.formatDate(feed.lastBuildDate || feed.updated),
      pubDate: this.formatDate(feed.pubDate || feed.updated || feed.published),
      image: feed.image?.url || feed.itunes?.image || feed.logo || '',
      generator: feed.generator,
      feedUrl: feed.feedUrl || '',
    };

    // Process items
    const items = (feed.items || []).slice(0, maxItems).map((item: any) =>
      this.processItem(item, options)
    );

    // Apply filters if configured
    let filteredItems = items;
    if (this.config.filter) {
      filteredItems = this.applyFilters(items, this.config.filter);
    }

    return {
      feed: feedInfo,
      items: filteredItems,
      itemCount: filteredItems.length,
      totalItems: feed.items?.length || 0,
    };
  }

  /**
   * Format date to ISO string
   */
  private formatDate(date: any): string | undefined {
    if (!date) return undefined;
    try {
      return new Date(date).toISOString();
    } catch {
      return undefined;
    }
  }

  /**
   * Process individual feed item
   */
  private processItem(item: any, options: any): any {
    const processed: any = {
      title: item.title || '',
      description: this.extractDescription(item, options),
      link: item.link || '',
      guid: item.guid || item.id || '',
      pubDate: this.extractDate(item.pubDate || item.published || item.updated || item.updatedAt || item.date),
      author: item.creator || item.author || item['dc:creator'] || '',
      categories: this.extractCategories(item.categories || item.category),
      enclosure: item.enclosure ? {
        url: item.enclosure.url,
        type: item.enclosure.type,
        length: item.enclosure.length,
      } : null,
    };

    // Extract content
    if (item.contentEncoded) {
      processed.content = this.stripHtml(item.contentEncoded, options);
    } else if (item.content) {
      processed.content = typeof item.content === 'string'
        ? this.stripHtml(item.content, options)
        : this.stripHtml(item.content?.['#text'] || '', options);
    } else if (item['content:encoded']) {
      processed.content = this.stripHtml(item['content:encoded'], options);
    }

    // Media content (for podcasts, videos)
    if (item.mediaContent) {
      processed.media = {
        url: item.mediaContent.$?.url || item.mediaContent?.url,
        type: item.mediaContent.$?.type || item.mediaContent?.type,
        thumbnail: item.mediaThumbnail?.$?.url || item.mediaThumbnail?.url,
      };
    }

    // iTunes specific (podcasts)
    if (item.itunes) {
      processed.itunes = {
        duration: item.itunes.duration,
        subtitle: item.itunes.subtitle,
        summary: item.itunes.summary,
        keywords: item.itunes.keywords,
        episode: item.itunes.episode,
        season: item.itunes.season,
        image: item.itunes.image,
      };
    }

    return processed;
  }

  /**
   * Extract description
   */
  private extractDescription(item: any, options: any): string {
    let description = item.description || item.summary || item.contentSnippet || '';

    if (typeof description === 'string') {
      return this.stripHtml(description, options);
    }

    return '';
  }

  /**
   * Extract date
   */
  private extractDate(date: any): string | null {
    if (!date) return null;
    if (typeof date === 'string') return date;
    if (date['#text']) return date['#text'];
    return null;
  }

  /**
   * Extract categories
   */
  private extractCategories(categories: any): string[] {
    if (!categories) return [];

    const cats: string[] = [];

    // rss-parser returns array of category strings or objects
    if (Array.isArray(categories)) {
      categories.forEach((cat: any) => {
        if (typeof cat === 'string') {
          cats.push(cat);
        } else if (typeof cat === 'object') {
          cats.push(cat._ || cat.$ || cat.name || JSON.stringify(cat));
        }
      });
    } else if (typeof categories === 'string') {
      cats.push(categories);
    } else if (typeof categories === 'object') {
      cats.push(categories._ || categories.$ || categories.name || '');
    }

    return cats;
  }

  /**
   * Strip HTML from text
   */
  private stripHtml(text: string, options: any): string {
    if (!text) return '';

    let cleaned = text;

    if (options.stripHtml !== false) {
      // Remove HTML tags
      cleaned = cleaned.replace(/<[^>]*>/g, '');
      // Decode HTML entities
      cleaned = cleaned.replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&nbsp;/g, ' ');
    }

    if (options.trimDescription !== false) {
      cleaned = cleaned.trim();
      // Limit length
      const maxLength = options.descriptionMaxLength || 500;
      if (cleaned.length > maxLength) {
        cleaned = cleaned.substring(0, maxLength) + '...';
      }
    }

    return cleaned;
  }

  /**
   * Apply filters to items
   */
  private applyFilters(items: any[], filter: any): any[] {
    let filtered = items;

    if (filter.keywords) {
      const keywords = filter.keywords.toLowerCase().split(',').map((k: string) => k.trim());
      filtered = filtered.filter(item =>
        keywords.some((kw: string) =>
          item.title?.toLowerCase().includes(kw) ||
          item.description?.toLowerCase().includes(kw)
        )
      );
    }

    if (filter.excludeKeywords) {
      const keywords = filter.excludeKeywords.toLowerCase().split(',').map((k: string) => k.trim());
      filtered = filtered.filter(item =>
        !keywords.some((kw: string) =>
          item.title?.toLowerCase().includes(kw) ||
          item.description?.toLowerCase().includes(kw)
        )
      );
    }

    if (filter.minDate) {
      const minDate = new Date(filter.minDate);
      filtered = filtered.filter(item => {
        const itemDate = item.pubDate ? new Date(item.pubDate) : null;
        return itemDate && itemDate >= minDate;
      });
    }

    if (filter.categories) {
      const categories = filter.categories.split(',').map((c: string) => c.trim());
      filtered = filtered.filter(item =>
        item.categories?.some((cat: string) => categories.includes(cat))
      );
    }

    return filtered;
  }

  /**
   * Parse XML string to object (no longer needed - using rss-parser)
   * Kept for backward compatibility
   */
  private parseXMLString(xml: string): any {
    // This method is deprecated - using rss-parser instead
    return null;
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
    if (error.message?.includes('Invalid URL format')) {
      return error.message;
    }
    if (error.message?.includes('Invalid maxItems')) {
      return error.message;
    }
    if (error.code === 'ENOTFOUND') {
      return 'DNS lookup failed: Unable to resolve feed URL';
    }
    if (error.code === 'ETIMEDOUT') {
      return 'Request timeout: Feed server took too long to respond';
    }
    if (error.response?.status === 404) {
      return 'Feed not found: Check the feed URL';
    }
    if (error.message?.includes('Failed to parse RSS')) {
      return error.message;
    }
    return `RSS read error: ${error.message || 'Unknown error'}`;
  }

  getType(): string {
    return 'rssRead';
  }

  getIcon(): string {
    return 'Rss';
  }

  /**
   * Validate feed URL
   */
  static async validateFeedUrl(url: string): Promise<{ valid: boolean; error?: string }> {
    try {
      new URL(url);
    } catch {
      return { valid: false, error: 'Invalid URL format' };
    }

    try {
      const parser = new Parser();
      await parser.parseURL(url);
      return { valid: true };
    } catch (error: any) {
      return { valid: false, error: error.message || 'Unable to reach feed URL' };
    }
  }

  /**
   * Get feed metadata without fetching all items
   */
  static async getFeedMetadata(url: string): Promise<{
    title?: string;
    description?: string;
    itemCount?: number;
  } | null> {
    try {
      const parser = new Parser();
      const feed = await parser.parseURL(url);

      return {
        title: feed.title,
        description: feed.description,
        itemCount: feed.items?.length || 0,
      };
    } catch {
      return null;
    }
  }
}
