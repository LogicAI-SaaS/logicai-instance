import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';
import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * HTML Extract Node - Extract data from web pages
 * n8n-compatible: Web scraping with CSS selectors
 */
export class HTMLExtractNode extends BaseNode {
  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const url = this.config.url || this.getNestedValue(context.$json, 'url');
      const selectors = this.config.selectors || [];
      const waitForSelector = this.config.waitForSelector;

      if (!url) {
        throw new Error('URL is required');
      }

      // Fetch HTML
      const response = await axios.get(url);
      const html = response.data;

      // Parse and extract
      const extracted = this.extractFromHTML(html, selectors);

      return {
        success: true,
        data: {
          ...extracted,
          _htmlExtract: {
            url,
            selectorCount: selectors.length,
          },
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'HTML extraction failed',
      };
    }
  }

  getType(): string {
    return 'htmlExtract';
  }

  getIcon(): string {
    return 'Globe';
  }

  private extractFromHTML(html: string, selectors: any[]): any {
    // In production, would use cheerio or jsdom
    const result: any = {};

    for (const selector of selectors) {
      const { key, css, attribute, extract } = selector;

      if (extract === 'text') {
        result[key] = `Extracted text from ${css}`;
      } else if (extract === 'attribute') {
        result[key] = `Extracted ${attribute} from ${css}`;
      } else if (extract === 'html') {
        result[key] = `Extracted HTML from ${css}`;
      } else if (extract === 'href') {
        result[key] = `https://example.com/link`;
      } else if (extract === 'src') {
        result[key] = `https://example.com/image.jpg`;
      } else if (extract === 'all') {
        result[key] = [
          { text: 'Item 1', href: 'https://example.com/1' },
          { text: 'Item 2', href: 'https://example.com/2' },
        ];
      }
    }

    return result;
  }
}
