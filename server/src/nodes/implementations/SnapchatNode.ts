import { BaseNode } from '../base/BaseNode';
import { ExecutionContext, NodeExecutionResult } from '../../types';

/**
 * Snapchat Node - Snapchat Marketing API integration
 * 
 * Supported operations:
 * - getProfile: Get user profile (requires OAuth)
 * - getStories: Get user stories (requires OAuth)
 * - createStory: Create a story (requires OAuth)
 * - getAdAccount: Get ad account information
 * - getCampaigns: Get ad campaigns
 */
export class SnapchatNode extends BaseNode {
  private accessToken?: string;
  private readonly baseUrl = 'https://adsapi.snapchat.com/v1';

  constructor(id: string, name: string, config: Record<string, any>) {
    super(id, name, config);
    this.accessToken = this.config.credentials?.accessToken || this.config.accessToken || process.env.SNAPCHAT_ACCESS_TOKEN;
  }

  getType(): string {
    return 'snapchat';
  }

  getIcon(): string {
    return 'ghost';
  }

  async execute(context: ExecutionContext): Promise<NodeExecutionResult> {
    try {
      if (!this.accessToken) {
        throw new Error('Snapchat access token not configured');
      }

      const operation = this.config.operation || 'getProfile';
      
      switch (operation) {
        case 'getProfile':
          return await this.getProfile(context);
        case 'getAdAccount':
          return await this.getAdAccount(context);
        case 'getCampaigns':
          return await this.getCampaigns(context);
        case 'getAdSquads':
          return await this.getAdSquads(context);
        case 'getAds':
          return await this.getAds(context);
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

  private async apiRequest(endpoint: string, method: string = 'GET', body?: any): Promise<any> {
    const options: RequestInit = {
      method,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseUrl}/${endpoint}`, options);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Snapchat API error: ${error}`);
    }

    return response.json();
  }

  private async getProfile(context: ExecutionContext): Promise<NodeExecutionResult> {
    const data = await this.apiRequest('me');
    
    return {
      success: true,
      data: {
        profile: data.me || data,
      },
      error: null,
    };
  }

  private async getAdAccount(context: ExecutionContext): Promise<NodeExecutionResult> {
    const accountId = this.config.accountId || context.$json.accountId;
    
    if (!accountId) {
      // Get all ad accounts
      const data = await this.apiRequest('me/adaccounts');
      
      return {
        success: true,
        data: {
          accounts: data.adaccounts || [],
          count: data.adaccounts?.length || 0,
        },
        error: null,
      };
    }

    const data = await this.apiRequest(`adaccounts/${accountId}`);
    
    return {
      success: true,
      data: {
        account: data.adaccount || data,
      },
      error: null,
    };
  }

  private async getCampaigns(context: ExecutionContext): Promise<NodeExecutionResult> {
    const accountId = this.config.accountId || context.$json.accountId || '';
    
    if (!accountId) {
      throw new Error('Ad Account ID is required');
    }

    const data = await this.apiRequest(`adaccounts/${accountId}/campaigns`);
    
    return {
      success: true,
      data: {
        campaigns: data.campaigns || [],
        count: data.campaigns?.length || 0,
      },
      error: null,
    };
  }

  private async getAdSquads(context: ExecutionContext): Promise<NodeExecutionResult> {
    const accountId = this.config.accountId || context.$json.accountId || '';
    const campaignId = this.config.campaignId || context.$json.campaignId;
    
    if (!accountId) {
      throw new Error('Ad Account ID is required');
    }

    let endpoint = `adaccounts/${accountId}/adsquads`;
    if (campaignId) {
      endpoint = `campaigns/${campaignId}/adsquads`;
    }

    const data = await this.apiRequest(endpoint);
    
    return {
      success: true,
      data: {
        adSquads: data.adsquads || [],
        count: data.adsquads?.length || 0,
      },
      error: null,
    };
  }

  private async getAds(context: ExecutionContext): Promise<NodeExecutionResult> {
    const accountId = this.config.accountId || context.$json.accountId || '';
    const adSquadId = this.config.adSquadId || context.$json.adSquadId;
    
    if (!accountId) {
      throw new Error('Ad Account ID is required');
    }

    let endpoint = `adaccounts/${accountId}/ads`;
    if (adSquadId) {
      endpoint = `adsquads/${adSquadId}/ads`;
    }

    const data = await this.apiRequest(endpoint);
    
    return {
      success: true,
      data: {
        ads: data.ads || [],
        count: data.ads?.length || 0,
      },
      error: null,
    };
  }

  validateConfig(): string[] {
    const errors: string[] = [];
    
    if (!this.accessToken) {
      errors.push('Snapchat access token is required');
    }

    if (['getCampaigns', 'getAdSquads', 'getAds'].includes(this.config.operation) && !this.config.accountId) {
      errors.push('Ad Account ID is required for this operation');
    }

    return errors;
  }
}
