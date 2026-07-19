import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * Aggregator Multi-Search - Search multiple engines simultaneously
 * Consolidates results from Google, Bing, DuckDuckGo, LinkedIn, etc.
 *
 * Configuration:
 * - query: Search query
 * - engines: Array of engines to use ['google', 'bing', 'duckduckgo', 'linkedin']
 * - maxResults: Maximum results per engine (default: 10)
 * - sortByRelevance: Sort merged results by relevance score
 * - deduplicate: Remove duplicate URLs
 * - apiKeys: { googleCx, googleApiKey, bingApiKey }
 * - options: { safeSearch, language, region, timeout }
 */
export class AggregatorMultiSearchNode extends BaseNode {
  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
    this.validateConfig();
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    if (this.config.maxResults !== undefined) {
      const maxResults = parseInt(this.config.maxResults);
      if (isNaN(maxResults) || maxResults < 1 || maxResults > 100) {
        throw new Error(`Invalid maxResults: ${this.config.maxResults}. Must be between 1 and 100`);
      }
    }

    const engines = this.config.engines || ['google', 'duckduckgo'];
    const validEngines = ['google', 'bing', 'duckduckgo', 'linkedin', 'wikipedia', 'reddit'];
    for (const engine of engines) {
      if (!validEngines.includes(engine)) {
        throw new Error(`Invalid engine: ${engine}. Valid: ${validEngines.join(', ')}`);
      }
    }
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      const query = this.resolveValue(this.config.query, context) || this.getNestedValue(context.$json, 'query');
      const engines = this.config.engines || ['google', 'duckduckgo'];
      const maxResults = this.config.maxResults || 10;
      const sortByRelevance = this.config.sortByRelevance !== false;
      const deduplicate = this.config.deduplicate !== false;

      if (!query) {
        throw new Error('Query is required');
      }

      // Execute searches in parallel
      const searchPromises = engines.map((engine: string) =>
        this.searchEngine(engine, query, maxResults)
      );

      const results = await Promise.allSettled(searchPromises);

      // Consolidate results
      const consolidatedResults = {
        query,
        timestamp: new Date().toISOString(),
        totalResults: 0,
        engines: {} as Record<string, any>,
        mergedResults: [] as any[],
        failed: [] as string[],
      };

      results.forEach((result, index) => {
        const engine = engines[index];

        if (result.status === 'fulfilled') {
          const engineResults = result.value;
          consolidatedResults.engines[engine] = engineResults;
          consolidatedResults.totalResults += engineResults.results?.length || 0;
          consolidatedResults.mergedResults.push(
            ...(engineResults.results || []).map((r: any) => ({ ...r, source: engine }))
          );
        } else {
          consolidatedResults.engines[engine] = {
            error: result.reason?.message || 'Search failed',
            results: [],
          };
          consolidatedResults.failed.push(engine);
        }
      });

      // Sort merged results by relevance (if available)
      if (sortByRelevance && consolidatedResults.mergedResults.length > 0) {
        consolidatedResults.mergedResults.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
      }

      // Deduplicate results based on URL
      if (deduplicate && consolidatedResults.mergedResults.length > 0) {
        consolidatedResults.mergedResults = this.deduplicateResults(consolidatedResults.mergedResults);
      }

      return {
        success: true,
        data: consolidatedResults,
      };
    } catch (error: any) {
      return {
        success: false,
        error: this.formatErrorMessage(error),
      };
    }
  }

  getType(): string {
    return 'aggregatorMultiSearch';
  }

  getIcon(): string {
    return 'Search';
  }

  /**
   * Route to specific search engine
   */
  private async searchEngine(engine: string, query: string, maxResults: number): Promise<any> {
    switch (engine) {
      case 'google':
        return await this.searchGoogle(query, maxResults);
      case 'bing':
        return await this.searchBing(query, maxResults);
      case 'duckduckgo':
        return await this.searchDuckDuckGo(query, maxResults);
      case 'linkedin':
        return await this.searchLinkedIn(query, maxResults);
      case 'wikipedia':
        return await this.searchWikipedia(query, maxResults);
      case 'reddit':
        return await this.searchReddit(query, maxResults);
      default:
        throw new Error(`Unknown search engine: ${engine}`);
    }
  }

  /**
   * Google Custom Search API
   * Requires: API key and Custom Search Engine ID
   * https://developers.google.com/custom-search/v1/overview
   */
  private async searchGoogle(query: string, maxResults: number): Promise<any> {
    const apiKey = this.config.apiKeys?.googleApiKey || process.env.GOOGLE_API_KEY;
    const cx = this.config.apiKeys?.googleCx || process.env.GOOGLE_CX_ID;

    if (!apiKey || !cx) {
      // Return mock data if no credentials
      return {
        engine: 'google',
        resultsCount: 0,
        note: 'Configure GOOGLE_API_KEY and GOOGLE_CX_ID for real Google search results',
        results: [],
      };
    }

    try {
      const url = new URL('https://www.googleapis.com/customsearch/v1');
      url.searchParams.set('key', apiKey);
      url.searchParams.set('cx', cx);
      url.searchParams.set('q', query);
      url.searchParams.set('num', String(Math.min(maxResults, 10)));

      if (this.config.options?.safeSearch) {
        url.searchParams.set('safe', 'active');
      }

      if (this.config.options?.language) {
        url.searchParams.set('hl', this.config.options.language);
      }

      const timeout = this.config.options?.timeout || 10000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || response.statusText);
      }

      const data = await response.json();

      const results = (data.items || []).map((item: any) => ({
        title: item.title,
        url: item.link,
        snippet: item.snippet,
        thumbnail: item.pagemap?.cse_thumbnail?.[0]?.src || item.pagemap?.cse_image?.[0]?.src,
        relevance: this.calculateRelevance(item, query),
        publishedDate: item.pagemap?.metatags?.[0]?.['article:published_time'],
        author: item.pagemap?.metatags?.[0]?.author,
      }));

      return {
        engine: 'google',
        resultsCount: results.length,
        totalResults: data.searchInformation?.totalResults,
        searchTime: data.searchInformation?.searchTime,
        results,
      };
    } catch (error: any) {
      return {
        engine: 'google',
        error: error.message,
        results: [],
        resultsCount: 0,
      };
    }
  }

  /**
   * Bing Search API
   * Requires: Bing Web Search API key
   * https://www.microsoft.com/en-us/bing/apis/bing-web-search-api
   */
  private async searchBing(query: string, maxResults: number): Promise<any> {
    const apiKey = this.config.apiKeys?.bingApiKey || process.env.BING_API_KEY;

    if (!apiKey) {
      return {
        engine: 'bing',
        resultsCount: 0,
        note: 'Configure BING_API_KEY for real Bing search results',
        results: [],
      };
    }

    try {
      const url = new URL('https://api.bing.microsoft.com/v7.0/search');
      url.searchParams.set('q', query);
      url.searchParams.set('count', String(Math.min(maxResults, 50)));

      if (this.config.options?.safeSearch) {
        url.searchParams.set('safeSearch', 'Strict');
      }

      if (this.config.options?.language) {
        url.searchParams.set('mkt', this.config.options.language);
      }

      const timeout = this.config.options?.timeout || 10000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          'Ocp-Apim-Subscription-Key': apiKey,
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const data = await response.json();

      const results = (data.webPages?.value || []).map((item: any) => ({
        title: item.name,
        url: item.url,
        snippet: item.snippet,
        displayUrl: item.displayUrl,
        dateLastCrawled: item.dateLastCrawled,
        relevance: this.calculateRelevance(item, query),
      }));

      return {
        engine: 'bing',
        resultsCount: results.length,
        totalResults: data.webPages?.totalEstimatedMatches,
        results,
      };
    } catch (error: any) {
      return {
        engine: 'bing',
        error: error.message,
        results: [],
        resultsCount: 0,
      };
    }
  }

  /**
   * DuckDuckGo Instant Answer API (via HTML parsing)
   * Note: DuckDuckGo doesn't provide an official search API
   * This uses the HTML version of DuckDuckGo search results
   */
  private async searchDuckDuckGo(query: string, maxResults: number): Promise<any> {
    try {
      const url = new URL('https://html.duckduckgo.com/html/');
      url.searchParams.set('q', query);

      const timeout = this.config.options?.timeout || 10000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LogicAI-N8N-Bot/1.0)',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const html = await response.text();
      const results = this.parseDuckDuckGoHTML(html, maxResults);

      return {
        engine: 'duckduckgo',
        resultsCount: results.length,
        results,
      };
    } catch (error: any) {
      return {
        engine: 'duckduckgo',
        error: error.message,
        results: [],
        resultsCount: 0,
      };
    }
  }

  /**
   * Parse DuckDuckGo HTML results
   */
  private parseDuckDuckGoHTML(html: string, maxResults: number): any[] {
    const results: any[] = [];

    // Parse result divs (DuckDuckGo uses .result class)
    const resultRegex = /<class[^>]*result[^>]*>[\s\S]*?<\/a>/gi;
    const matches = html.match(resultRegex) || [];

    for (const match of matches.slice(0, maxResults)) {
      const titleMatch = match.match(/<a[^>]*class="result__a"[^>]*>([^<]+)<\/a>/i);
      const urlMatch = match.match(/<a[^>]*href="([^"]+)"/i);
      const snippetMatch = match.match(/<a[^>]*class="result__snippet"[^>]*>([^<]+)<\/a>/i);

      if (titleMatch && urlMatch) {
        let url = urlMatch[1];
        // DuckDuckGo uses redirect URLs, extract the actual URL
        const actualUrlMatch = url.match(/uddg=([^&]+)/);
        if (actualUrlMatch) {
          url = decodeURIComponent(actualUrlMatch[1]);
        }

        results.push({
          title: this.stripHTML(titleMatch[1]),
          url,
          snippet: snippetMatch ? this.stripHTML(snippetMatch[1]) : '',
          relevance: 50, // DuckDuckGo doesn't provide relevance scores
        });
      }
    }

    return results;
  }

  /**
   * LinkedIn Search
   * Note: LinkedIn requires OAuth authentication
   * This provides a placeholder for future implementation
   */
  private async searchLinkedIn(query: string, maxResults: number): Promise<any> {
    // LinkedIn API requires OAuth 2.0 authentication
    // This would need:
    // 1. LinkedIn app credentials
    // 2. OAuth flow implementation
    // 3. Access token management

    return {
      engine: 'linkedin',
      resultsCount: 0,
      note: 'LinkedIn search requires OAuth 2.0 authentication. Configure LinkedIn app credentials.',
      results: [],
    };
  }

  /**
   * Wikipedia Search API
   * https://en.wikipedia.org/w/api.php?action=opensearch
   */
  private async searchWikipedia(query: string, maxResults: number): Promise<any> {
    try {
      const language = this.config.options?.language || 'en';
      const url = new URL(`https://${language}.wikipedia.org/w/api.php`);

      url.searchParams.set('action', 'query');
      url.searchParams.set('list', 'search');
      url.searchParams.set('srsearch', query);
      url.searchParams.set('format', 'json');
      url.searchParams.set('srlimit', String(maxResults));
      url.searchParams.set('origin', '*');

      const timeout = this.config.options?.timeout || 10000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url.toString(), {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const data = await response.json();

      const results = (data.query?.search || []).map((item: any) => ({
        title: item.title,
        url: `https://${language}.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`,
        snippet: item.snippet.replace(/<[^>]*>/g, ''), // Remove HTML tags
        wordCount: item.wordcount,
        timestamp: item.timestamp,
        relevance: this.calculateRelevance(item, query),
        type: 'wikipedia',
      }));

      return {
        engine: 'wikipedia',
        resultsCount: results.length,
        totalHits: data.query?.searchinfo?.totalhits,
        results,
      };
    } catch (error: any) {
      return {
        engine: 'wikipedia',
        error: error.message,
        results: [],
        resultsCount: 0,
      };
    }
  }

  /**
   * Reddit Search API
   * Uses Reddit public API (no authentication required for public searches)
   */
  private async searchReddit(query: string, maxResults: number): Promise<any> {
    try {
      const url = new URL('https://www.reddit.com/search.json');
      url.searchParams.set('q', query);
      url.searchParams.set('limit', String(Math.min(maxResults, 100)));
      url.searchParams.set('sort', 'relevance');
      url.searchParams.set('type', 'link');

      const timeout = this.config.options?.timeout || 10000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          'User-Agent': 'LogicAI-N8N-Bot/1.0',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const data = await response.json();

      const results = (data.data?.children || []).map((child: any) => {
        const post = child.data;
        return {
          title: post.title,
          url: `https://reddit.com${post.permalink}`,
          snippet: post.selftext ? post.selftext.substring(0, 300) : post.url,
          author: post.author,
          subreddit: post.subreddit,
          score: post.score,
          numComments: post.num_comments,
          created: new Date(post.created_utc * 1000).toISOString(),
          relevance: this.calculateRelevance(post, query),
          type: 'reddit',
        };
      });

      return {
        engine: 'reddit',
        resultsCount: results.length,
        results,
      };
    } catch (error: any) {
      return {
        engine: 'reddit',
        error: error.message,
        results: [],
        resultsCount: 0,
      };
    }
  }

  /**
   * Calculate relevance score for a result
   */
  private calculateRelevance(result: any, query: string): number {
    let score = 0;
    const queryLower = query.toLowerCase();

    // Title match
    if (result.title) {
      const titleLower = result.title.toLowerCase();
      if (titleLower === queryLower) score += 100;
      else if (titleLower.startsWith(queryLower)) score += 80;
      else if (titleLower.includes(queryLower)) score += 60;
    }

    // Snippet match
    if (result.snippet) {
      const snippetLower = result.snippet.toLowerCase();
      if (snippetLower.includes(queryLower)) score += 30;
    }

    // Word count bonus (longer content might be more relevant)
    if (result.wordCount) {
      score += Math.min(result.wordCount / 100, 10);
    }

    return Math.min(score, 100);
  }

  /**
   * Deduplicate results based on URL
   */
  private deduplicateResults(results: any[]): any[] {
    const seen = new Set<string>();
    return results.filter(result => {
      const url = result.url;
      if (seen.has(url)) {
        return false;
      }
      seen.add(url);
      return true;
    });
  }

  /**
   * Strip HTML tags
   */
  private stripHTML(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
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
    if (error.message?.includes('Query is required')) {
      return error.message;
    }
    if (error.message?.includes('Invalid maxResults')) {
      return error.message;
    }
    if (error.message?.includes('Invalid engine')) {
      return error.message;
    }
    if (error.name === 'AbortError') {
      return 'Search timeout: Request took too long';
    }
    return `Multi-search error: ${error.message || 'Unknown error'}`;
  }

  /**
   * Get supported search engines
   */
  static getSupportedEngines(): string[] {
    return ['google', 'bing', 'duckduckgo', 'linkedin', 'wikipedia', 'reddit'];
  }

  /**
   * Check if an engine requires API credentials
   */
  static requiresCredentials(engine: string): boolean {
    const enginesNeedingCreds = ['google', 'bing', 'linkedin'];
    return enginesNeedingCreds.includes(engine);
  }

  /**
   * Get credential requirements for an engine
   */
  static getCredentialRequirements(engine: string): {
    envVars: string[];
    configKeys: string[];
    instructions: string;
  } | null {
    const requirements: Record<string, any> = {
      google: {
        envVars: ['GOOGLE_API_KEY', 'GOOGLE_CX_ID'],
        configKeys: ['apiKeys.googleApiKey', 'apiKeys.googleCx'],
        instructions: 'Create a Custom Search Engine at https://programmablesearchengine.google.com/ and get API key from Google Cloud Console',
      },
      bing: {
        envVars: ['BING_API_KEY'],
        configKeys: ['apiKeys.bingApiKey'],
        instructions: 'Get Bing Search API key from Azure Portal: https://portal.azure.com/',
      },
      linkedin: {
        envVars: ['LINKEDIN_CLIENT_ID', 'LINKEDIN_CLIENT_SECRET'],
        configKeys: ['apiKeys.linkedinClientId', 'apiKeys.linkedinClientSecret'],
        instructions: 'Create a LinkedIn app at https://www.linkedin.com/developers/ (OAuth 2.0 required)',
      },
    };

    return requirements[engine] || null;
  }
}
