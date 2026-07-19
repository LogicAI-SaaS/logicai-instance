import { BaseNode } from './base/BaseNode';

// Core LogicAI-compatible nodes
import { WebhookNode } from './implementations/WebhookNode';
import { HttpRequestNode } from './implementations/HttpRequestNode';
import { SetVariableNode } from './implementations/SetVariableNode';
import { ConditionNode } from './implementations/ConditionNode';
import { EditFieldsNode } from './implementations/EditFieldsNode';
import { CodeNode } from './implementations/CodeNode';
import { FilterNode } from './implementations/FilterNode';
import { SwitchNode } from './implementations/SwitchNode';
import { MergeNode } from './implementations/MergeNode';
import { SplitInBatchesNode } from './implementations/SplitInBatchesNode';
import { WaitNode } from './implementations/WaitNode';
import { ErrorTriggerNode } from './implementations/ErrorTriggerNode';
import { ExecuteWorkflowNode } from './implementations/ExecuteWorkflowNode';
import { LimitNode } from './implementations/LimitNode';
import { SortNode } from './implementations/SortNode';

// Trigger nodes
import { ScheduleNode } from './implementations/ScheduleNode';
import { OnSuccessFailureNode } from './implementations/OnSuccessFailureNode';
import { FormTriggerNode } from './implementations/FormTriggerNode';
import { ChatTriggerNode } from './implementations/ChatTriggerNode';
import { ClickTriggerNode } from './implementations/ClickTriggerNode';
import { EmailTriggerNode } from './implementations/EmailTriggerNode';
import { HTTPPollTriggerNode } from './implementations/HTTPPollTriggerNode';
import { CronTriggerNode } from './implementations/CronTriggerNode';
import { LogicAITriggerNode } from './implementations/LogicAITriggerNode';

// HTTP & Data nodes
import { HTMLExtractNode } from './implementations/HTMLExtractNode';
import { RSSReadNode } from './implementations/RSSReadNode';
import { FTPNode } from './implementations/FTPNode';
import { SSHNode } from './implementations/SSHNode';

// Database nodes
import { MySQLNode } from './implementations/MySQLNode';
import { PostgreSQLNode } from './implementations/PostgreSQLNode';
import { MongoDBNode } from './implementations/MongoDBNode';
import { RedisNode } from './implementations/RedisNode';
import { SupabaseNode } from './implementations/SupabaseNode';
import { FirebaseNode } from './implementations/FirebaseNode';
import { SQLiteNode } from './implementations/SQLiteNode';

// Communication nodes
import { EmailNode } from './implementations/EmailNode';
import { SlackNode } from './implementations/SlackNode';
import { DiscordNode } from './implementations/DiscordNode';
import { TelegramNode } from './implementations/TelegramNode';
import { WhatsAppNode } from './implementations/WhatsAppNode';

// Cloud Productivity nodes
import { GoogleSheetsNode } from './implementations/GoogleSheetsNode';
import { GoogleDriveNode } from './implementations/GoogleDriveNode';
import { AirtableNode } from './implementations/AirtableNode';
import { NotionNode } from './implementations/NotionNode';
import { TrelloNode } from './implementations/TrelloNode';

// ==================== NEW NODES - Phase 3A ====================
// Payment & E-commerce
import { StripeNode } from './implementations/StripeNode';
import { PayPalNode } from './implementations/PayPalNode';
import { SquareNode } from './implementations/SquareNode';
import { ShopifyNode } from './implementations/ShopifyNode';
import { WooCommerceNode } from './implementations/WooCommerceNode';

// CRM & Customer Support
import { SalesforceNode } from './implementations/SalesforceNode';
import { HubSpotNode } from './implementations/HubSpotNode';
import { ZendeskNode } from './implementations/ZendeskNode';

// Communication & Marketing
import { TwilioNode } from './implementations/TwilioNode';
import { SendGridNode } from './implementations/SendGridNode';
import { MailchimpNode } from './implementations/MailchimpNode';

// Project Management
import { AsanaNode } from './implementations/AsanaNode';
import { LinearNode } from './implementations/LinearNode';

// Cloud Storage
import { DropboxNode } from './implementations/DropboxNode';
import { OneDriveNode } from './implementations/OneDriveNode';
import { BoxNode } from './implementations/BoxNode';
import { S3Node } from './implementations/S3Node';

// AI/LLM nodes
import { OpenAINode } from './implementations/OpenAINode';
import { AIAgentNode } from './implementations/AIAgentNode';
import { VectorStoreNode } from './implementations/VectorStoreNode';
import { EmbeddingsNode } from './implementations/EmbeddingsNode';
import { AnthropicNode } from './implementations/AnthropicNode';
import { GeminiNode } from './implementations/GeminiNode';
import { PerplexityNode } from './implementations/PerplexityNode';
import { GLMNode } from './implementations/GLMNode';
import { OpenRouterNode } from './implementations/OpenRouterNode';
import { OllamaNode } from './implementations/OllamaNode';

// Binary nodes
import { ReadWriteBinaryFileNode } from './implementations/ReadWriteBinaryFileNode';
import { CompressionNode } from './implementations/CompressionNode';
import { CryptoNode } from './implementations/CryptoNode';

// Exclusive custom nodes
import { HumanInTheLoopNode } from './implementations/HumanInTheLoopNode';
import { SmartDataCleanerNode } from './implementations/SmartDataCleanerNode';
import { AICostGuardianNode } from './implementations/AICostGuardianNode';
import { NoCodeBrowserAutomatorNode } from './implementations/NoCodeBrowserAutomatorNode';
import { AggregatorMultiSearchNode } from './implementations/AggregatorMultiSearchNode';
import { LiveCanvasDebuggerNode } from './implementations/LiveCanvasDebuggerNode';
import { SocialMockupPreviewNode } from './implementations/SocialMockupPreviewNode';
import { RateLimiterBypassNode } from './implementations/RateLimiterBypassNode';
import { GhostNode } from './implementations/GhostNode';

// Advanced Integration nodes
import { AppleEcosystemNode } from './implementations/AppleEcosystemNode';
import { AndroidEcosystemNode } from './implementations/AndroidEcosystemNode';
import { GitHubNode } from './implementations/GitHubNode';
import { FigmaNode } from './implementations/FigmaNode';
import { WindowsControlNode } from './implementations/WindowsControlNode';
import { StreamingNode } from './implementations/StreamingNode';
import { InfrastructureNode } from './implementations/InfrastructureNode';

// Individual Apple nodes
import { IMessageNode } from './implementations/AppleNodes';
import { ICloudRemindersNode } from './implementations/AppleNodes';
import { ICloudNotesNode } from './implementations/AppleNodes';
import { ICloudCalendarNode } from './implementations/AppleNodes';
import { ICloudDriveNode } from './implementations/AppleNodes';

// Individual Android nodes
import { AndroidMessagesNode } from './implementations/AndroidNodes';
import { AndroidContactsNode } from './implementations/AndroidNodes';
import { AndroidADBNode } from './implementations/AndroidNodes';
import { AndroidAPKNode } from './implementations/AndroidNodes';
import { AndroidNotificationsNode } from './implementations/AndroidNodes';

// Additional Social Media nodes
import { InstagramNode } from './implementations/SocialNodes';
import { FacebookNode } from './implementations/SocialNodes';
import { TwitterNode } from './implementations/SocialNodes';
import { LinkedInNode } from './implementations/SocialNodes';
import { TikTokNode } from './implementations/SocialNodes';

// Streaming & Video platforms
import { TwitchNode } from './implementations/TwitchNode';
import { YouTubeNode } from './implementations/YouTubeNode';
import { KickNode } from './implementations/KickNode';
import { SnapchatNode } from './implementations/SnapchatNode';

// Logic nodes
import { LoopNode } from './implementations/LoopNode';
import { DateNode } from './implementations/DateNode';
import { UUIDNode } from './implementations/UUIDNode';
import { TextFormatterNode } from './implementations/TextFormatterNode';
import { IfNode } from './implementations/IfNode';

import { NodeConfig } from '../types';

/**
 * Node Registry - Manages node type registration and instantiation
 * Maps node type strings to their corresponding classes
 */
export class NodeRegistry {
  private static instance: NodeRegistry;
  private registry: Map<string, new (id: string, name: string, config: any) => BaseNode>;

  private constructor() {
    this.registry = new Map();
    this.registerDefaultNodes();
  }

  /**
   * Get the singleton instance
   */
  static getInstance(): NodeRegistry {
    if (!NodeRegistry.instance) {
      NodeRegistry.instance = new NodeRegistry();
    }
    return NodeRegistry.instance;
  }

  /**
   * Register the default node types
   */
  private registerDefaultNodes(): void {
    // ========== CORE NODES (Logic & Data) ==========
    this.register('editFields', EditFieldsNode);
    this.register('code', CodeNode);
    this.register('filter', FilterNode);
    this.register('switch', SwitchNode);
    this.register('merge', MergeNode);
    this.register('splitInBatches', SplitInBatchesNode);
    this.register('wait', WaitNode);
    this.register('errorTrigger', ErrorTriggerNode);
    this.register('executeWorkflow', ExecuteWorkflowNode);
    this.register('limit', LimitNode);
    this.register('sort', SortNode);

    // ========== TRIGGER NODES ==========
    this.register('webhook', WebhookNode);
    this.register('schedule', ScheduleNode);
    this.register('onSuccessFailure', OnSuccessFailureNode);
    this.register('formTrigger', FormTriggerNode);
    this.register('chatTrigger', ChatTriggerNode);
    this.register('clickTrigger', ClickTriggerNode);
    this.register('emailTrigger', EmailTriggerNode);
    this.register('httpPollTrigger', HTTPPollTriggerNode);
    this.register('cronTrigger', CronTriggerNode);
    this.register('logicaiTrigger', LogicAITriggerNode);

    // ========== HTTP & DATA INTERFACES ==========
    this.register('httpRequest', HttpRequestNode);
    this.register('htmlExtract', HTMLExtractNode);
    this.register('rssRead', RSSReadNode);
    this.register('ftp', FTPNode);
    this.register('ssh', SSHNode);

    // ========== DATABASE NODES ==========
    this.register('mySQL', MySQLNode);
    this.register('postgreSQL', PostgreSQLNode);
    this.register('mongoDB', MongoDBNode);
    this.register('redis', RedisNode);
    this.register('supabase', SupabaseNode);
    this.register('firebase', FirebaseNode);
    this.register('sqlite', SQLiteNode);

    // ========== COMMUNICATION & SOCIAL ==========
    this.register('email', EmailNode);
    this.register('slack', SlackNode);
    this.register('discord', DiscordNode);
    this.register('telegram', TelegramNode);
    this.register('whatsApp', WhatsAppNode);
    this.register('instagram', InstagramNode);
    this.register('facebook', FacebookNode);
    this.register('twitter', TwitterNode);
    this.register('linkedin', LinkedInNode);
    this.register('tiktok', TikTokNode);

    // ========== STREAMING & VIDEO PLATFORMS ==========
    this.register('twitch', TwitchNode);
    this.register('youtube', YouTubeNode);
    this.register('kick', KickNode);
    this.register('snapchat', SnapchatNode);

    // ========== CLOUD & PRODUCTIVITY ==========
    this.register('googleSheets', GoogleSheetsNode);
    this.register('googleDrive', GoogleDriveNode);
    this.register('airtable', AirtableNode);
    this.register('notion', NotionNode);
    this.register('trello', TrelloNode);

    // ========== PAYMENT & E-COMMERCE ==========
    this.register('stripe', StripeNode);
    this.register('paypal', PayPalNode);
    this.register('square', SquareNode);
    this.register('shopify', ShopifyNode);
    this.register('wooCommerce', WooCommerceNode);

    // ========== CRM & CUSTOMER SUPPORT ==========
    this.register('salesforce', SalesforceNode);
    this.register('hubspot', HubSpotNode);
    this.register('zendesk', ZendeskNode);

    // ========== COMMUNICATION & MARKETING ==========
    this.register('twilio', TwilioNode);
    this.register('sendgrid', SendGridNode);
    this.register('mailchimp', MailchimpNode);

    // ========== PROJECT MANAGEMENT ==========
    this.register('asana', AsanaNode);
    this.register('linear', LinearNode);

    // ========== CLOUD STORAGE ==========
    this.register('dropbox', DropboxNode);
    this.register('onedrive', OneDriveNode);
    this.register('box', BoxNode);
    this.register('s3', S3Node);

    // ========== AI & LLM ==========
    this.register('openAI', OpenAINode);
    this.register('aiAgent', AIAgentNode);
    this.register('vectorStore', VectorStoreNode);
    this.register('embeddings', EmbeddingsNode);
    this.register('anthropic', AnthropicNode);
    this.register('gemini', GeminiNode);
    this.register('perplexity', PerplexityNode);
    this.register('glm', GLMNode);
    this.register('openrouter', OpenRouterNode);
    this.register('ollama', OllamaNode);

    // ========== BINARY DATA ==========
    this.register('readWriteBinaryFile', ReadWriteBinaryFileNode);
    this.register('compression', CompressionNode);
    this.register('crypto', CryptoNode);

    // ========== LOGIC NODES ==========
    this.register('setVariable', SetVariableNode);
    this.register('condition', ConditionNode);
    this.register('loop', LoopNode);
    this.register('date', DateNode);
    this.register('uuid', UUIDNode);
    this.register('textFormatter', TextFormatterNode);
    this.register('if', IfNode);

    // ========== EXCLUSIVE CUSTOM NODES ==========
    this.register('humanInTheLoop', HumanInTheLoopNode);
    this.register('smartDataCleaner', SmartDataCleanerNode);
    this.register('aiCostGuardian', AICostGuardianNode);
    this.register('noCodeBrowserAutomator', NoCodeBrowserAutomatorNode);
    this.register('aggregatorMultiSearch', AggregatorMultiSearchNode);
    this.register('liveCanvasDebugger', LiveCanvasDebuggerNode);
    this.register('socialMockupPreview', SocialMockupPreviewNode);
    this.register('rateLimiterBypass', RateLimiterBypassNode);
    this.register('ghost', GhostNode);

    // ========== ADVANCED INTEGRATION NODES ==========
    this.register('appleEcosystem', AppleEcosystemNode);
    this.register('androidEcosystem', AndroidEcosystemNode);
    this.register('gitHub', GitHubNode);
    this.register('figma', FigmaNode);
    this.register('windowsControl', WindowsControlNode);
    this.register('streaming', StreamingNode);
    this.register('infrastructure', InfrastructureNode);

    // ========== INDIVIDUAL APPLE NODES ==========
    this.register('imessage', IMessageNode);
    this.register('icloudReminders', ICloudRemindersNode);
    this.register('icloudNotes', ICloudNotesNode);
    this.register('icloudCalendar', ICloudCalendarNode);
    this.register('icloudDrive', ICloudDriveNode);

    // ========== INDIVIDUAL ANDROID NODES ==========
    this.register('androidMessages', AndroidMessagesNode);
    this.register('androidContacts', AndroidContactsNode);
    this.register('androidADB', AndroidADBNode);
    this.register('androidAPK', AndroidAPKNode);
    this.register('androidNotifications', AndroidNotificationsNode);
  }

  /**
   * Register a new node type
   * @param type - The type identifier
   * @param nodeClass - The node class constructor
   */
  register(type: string, nodeClass: new (id: string, name: string, config: any) => BaseNode): void {
    this.registry.set(type, nodeClass);
  }

  /**
   * Create a node instance from type and configuration
   * @param type - The node type
   * @param id - The node ID
   * @param name - The node name
   * @param config - The node configuration
   * @returns A new node instance
   * @throws Error if the node type is not registered
   */
  createNode(type: string, id: string, name: string, config: NodeConfig): BaseNode {
    const NodeClass = this.registry.get(type);

    if (!NodeClass) {
      throw new Error(`Unknown node type: ${type}`);
    }

    return new NodeClass(id, name, config);
  }

  /**
   * Check if a node type is registered
   * @param type - The node type to check
   * @returns True if the type is registered
   */
  hasType(type: string): boolean {
    return this.registry.has(type);
  }

  /**
   * Get all registered node types
   * @returns Array of registered type strings
   */
  getRegisteredTypes(): string[] {
    return Array.from(this.registry.keys());
  }

  /**
   * Get node metadata for all registered types
   * Useful for frontend to display available nodes
   */
  getNodeTypesMetadata(): Array<{
    type: string;
    icon: string;
    category: string;
    description: string;
  }> {
    const metadata: Array<{
      type: string;
      icon: string;
      category: string;
      description: string;
    }> = [
      // CORE LOGIC NODES
      { type: 'editFields', icon: '✏️', category: 'logic', description: 'Manipulate, add, or remove JSON fields' },
      { type: 'code', icon: '💻', category: 'logic', description: 'Execute custom JavaScript or Python code' },
      { type: 'filter', icon: '🔍', category: 'logic', description: 'Filter data based on conditions' },
      { type: 'switch', icon: '🔀', category: 'logic', description: 'Route to different outputs based on value' },
      { type: 'merge', icon: '🔗', category: 'logic', description: 'Combine multiple data flows into one' },
      { type: 'splitInBatches', icon: '📦', category: 'logic', description: 'Split data into batches to avoid timeouts' },
      { type: 'wait', icon: '⏰', category: 'logic', description: 'Pause workflow execution for a specified time' },
      { type: 'errorTrigger', icon: '⚠️', category: 'trigger', description: 'Triggered when another workflow fails' },
      { type: 'executeWorkflow', icon: '▶️', category: 'logic', description: 'Call another workflow as a sub-workflow' },
      { type: 'limit', icon: '🔢', category: 'logic', description: 'Restrict the number of items passed to next node' },
      { type: 'sort', icon: '📊', category: 'logic', description: 'Sort data by one or multiple fields' },

      // TRIGGER NODES
      { type: 'webhook', icon: '🪝', category: 'trigger', description: 'Triggers workflow when HTTP request received' },
      { type: 'schedule', icon: '📅', category: 'trigger', description: 'Execute workflow on schedule (Cron)' },
      { type: 'onSuccessFailure', icon: '✅', category: 'trigger', description: 'Trigger on workflow completion status' },
      { type: 'formTrigger', icon: '📝', category: 'trigger', description: 'Trigger workflow from built-in form' },
      { type: 'chatTrigger', icon: '💬', category: 'trigger', description: 'Trigger from chat messages (Discord, Telegram, Slack, WhatsApp)' },
      { type: 'clickTrigger', icon: '🖱️', category: 'trigger', description: 'Generate trackable URL for click-based triggers' },
      { type: 'emailTrigger', icon: '📧', category: 'trigger', description: 'Monitor email inbox via IMAP/POP3' },
      { type: 'httpPollTrigger', icon: '🔄', category: 'trigger', description: 'Poll HTTP endpoint at regular intervals' },
      { type: 'cronTrigger', icon: '⏰', category: 'trigger', description: 'Advanced scheduling with cron expressions' },

      // HTTP & DATA INTERFACES
      { type: 'httpRequest', icon: '🌐', category: 'http', description: 'Make HTTP request to any external API' },
      { type: 'htmlExtract', icon: '🔍', category: 'data', description: 'Extract data from web pages (scraping)' },
      { type: 'rssRead', icon: '📰', category: 'data', description: 'Read RSS/Atom feeds' },
      { type: 'ftp', icon: '📤', category: 'data', description: 'Upload/download files via FTP' },
      { type: 'ssh', icon: '💻', category: 'data', description: 'Execute commands on remote server via SSH' },

      // DATABASE (Official Brand Icons)
      { type: 'mySQL', icon: '🐬', category: 'database', description: 'MySQL database operations' },
      { type: 'postgreSQL', icon: '🐘', category: 'database', description: 'PostgreSQL database operations' },
      { type: 'mongoDB', icon: '🍃', category: 'database', description: 'MongoDB NoSQL operations' },
      { type: 'redis', icon: '🔴', category: 'database', description: 'Redis key-value cache operations' },
      { type: 'supabase', icon: '⚡', category: 'database', description: 'Supabase backend integration (Firebase alternative)' },
      { type: 'firebase', icon: '🔥', category: 'database', description: 'Firebase Firestore and Realtime Database' },
      { type: 'sqlite', icon: '💾', category: 'database', description: 'SQLite lightweight embedded database' },

      // COMMUNICATION (Official Brand Icons)
      { type: 'email', icon: '📧', category: 'communication', description: 'Send emails via SMTP' },
      { type: 'slack', icon: '💬', category: 'communication', description: 'Send messages to Slack channels' },
      { type: 'discord', icon: '🎮', category: 'communication', description: 'Discord bot/webhook integration' },
      { type: 'telegram', icon: '✈️', category: 'communication', description: 'Telegram bot messaging' },
      { type: 'whatsapp', icon: '📱', category: 'communication', description: 'WhatsApp messaging via Twilio API' },
      { type: 'twilio', icon: '📞', category: 'communication', description: 'SMS/MMS/Voice via Twilio API' },

      // SOCIAL MEDIA (Official Brand Icons)
      { type: 'instagram', icon: '📸', category: 'social', description: 'Post content and manage Instagram' },
      { type: 'facebook', icon: '👤', category: 'social', description: 'Post to Facebook pages and groups' },
      { type: 'twitter', icon: '🐦', category: 'social', description: 'Post tweets and manage Twitter/X account' },
      { type: 'linkedin', icon: '💼', category: 'social', description: 'Share posts and articles on LinkedIn' },
      { type: 'tiktok', icon: '🎵', category: 'social', description: 'Manage TikTok content and analytics' },
      { type: 'snapchat', icon: '👻', category: 'social', description: 'Share Snaps and Stories on Snapchat' },

      // CLOUD PRODUCTIVITY (Official Brand Icons)
      { type: 'googleSheets', icon: '📊', category: 'productivity', description: 'Read/write Google Sheets spreadsheets' },
      { type: 'googleDrive', icon: '☁️', category: 'productivity', description: 'Google Drive file operations' },
      { type: 'airtable', icon: '📋', category: 'productivity', description: 'Airtable database and spreadsheet operations' },
      { type: 'notion', icon: '📝', category: 'productivity', description: 'Notion pages, databases, and docs' },
      { type: 'trello', icon: '📋', category: 'productivity', description: 'Trello board and card operations' },

      // STREAMING PLATFORMS (Official Brand Icons)
      { type: 'twitch', icon: '🎮', category: 'streaming', description: 'Twitch streams, chat, and moderation' },
      { type: 'youtube', icon: '📺', category: 'streaming', description: 'YouTube videos, playlists, and analytics' },
      { type: 'kick', icon: '⚡', category: 'streaming', description: 'Kick streaming platform integration' },

      // ========== PAYMENT & E-COMMERCE (Official Brand Icons) ==========
      { type: 'stripe', icon: '💳', category: 'payment', description: 'Stripe payment processing, subscriptions, invoices' },
      { type: 'paypal', icon: '💰', category: 'payment', description: 'PayPal payments, invoicing, and checkout' },
      { type: 'square', icon: '⬜', category: 'payment', description: 'Square payments, POS, and catalog' },
      { type: 'shopify', icon: '🛍️', category: 'ecommerce', description: 'Shopify store: products, orders, customers' },
      { type: 'wooCommerce', icon: '🏪', category: 'ecommerce', description: 'WooCommerce WordPress e-commerce' },

      // ========== CRM & CUSTOMER SUPPORT (Official Brand Icons) ==========
      { type: 'salesforce', icon: '☁️', category: 'crm', description: 'Salesforce CRM: contacts, leads, opportunities, SOQL' },
      { type: 'hubspot', icon: '🧲', category: 'crm', description: 'HubSpot CRM: contacts, companies, deals, tickets' },
      { type: 'zendesk', icon: '💬', category: 'support', description: 'Zendesk support: tickets, users, organizations' },

      // ========== EMAIL MARKETING (Official Brand Icons) ==========
      { type: 'sendgrid', icon: '📧', category: 'marketing', description: 'SendGrid email marketing and automation' },
      { type: 'mailchimp', icon: '🐵', category: 'marketing', description: 'Mailchimp newsletters, campaigns, audiences' },

      // ========== PROJECT MANAGEMENT (Official Brand Icons) ==========
      { type: 'asana', icon: '📋', category: 'project', description: 'Asana tasks, projects, teams, portfolios' },
      { type: 'linear', icon: '🚀', category: 'project', description: 'Linear issue tracking, projects, cycles (GraphQL)' },

      // ========== CLOUD STORAGE (Official Brand Icons) ==========
      { type: 'dropbox', icon: '📦', category: 'storage', description: 'Dropbox file storage and sharing' },
      { type: 'onedrive', icon: '☁️', category: 'storage', description: 'Microsoft OneDrive cloud storage' },
      { type: 'box', icon: '📦', category: 'storage', description: 'Box cloud storage and collaboration' },
      { type: 's3', icon: '🗄️', category: 'storage', description: 'Amazon S3 object storage operations' },

      // AI/LLM (Official Brand Icons)
      { type: 'openAI', icon: '🤖', category: 'ai', description: 'OpenAI GPT-4, DALL-E, Whisper API integration' },
      { type: 'anthropic', icon: '🧠', category: 'ai', description: 'Anthropic Claude AI assistant' },
      { type: 'gemini', icon: '✨', category: 'ai', description: 'Google Gemini AI models' },
      { type: 'perplexity', icon: '🔍', category: 'ai', description: 'Perplexity AI search and reasoning' },
      { type: 'glm', icon: '🌟', category: 'ai', description: 'GLM (ChatGLM) AI models' },
      { type: 'openrouter', icon: '🔀', category: 'ai', description: 'OpenRouter unified LLM API gateway' },
      { type: 'ollama', icon: '🦙', category: 'ai', description: 'Ollama local LLM models' },
      { type: 'aiAgent', icon: '🧠', category: 'ai', description: 'Orchestrate LLM chains and agents' },
      { type: 'vectorStore', icon: '🗄️', category: 'ai', description: 'Vector database operations (Pinecone, Chroma)' },
      { type: 'embeddings', icon: '🔢', category: 'ai', description: 'Generate vector embeddings for semantic search' },

      // BINARY DATA
      { type: 'readWriteBinaryFile', icon: '📄', category: 'data', description: 'Read and write binary files' },
      { type: 'compression', icon: '📦', category: 'data', description: 'Compress/decompress files (ZIP/GZIP)' },
      { type: 'crypto', icon: '🔐', category: 'data', description: 'Hash, encrypt, and decrypt data' },

      // ADDITIONAL LOGIC
      { type: 'setVariable', icon: '📝', category: 'logic', description: 'Set or modify variables in data flow' },
      { type: 'condition', icon: '❓', category: 'logic', description: 'Split workflow based on condition' },
      { type: 'loop', icon: '🔄', category: 'logic', description: 'Loop over arrays or repeat actions' },
      { type: 'date', icon: '📅', category: 'logic', description: 'Format, parse, and manipulate dates' },
      { type: 'uuid', icon: '🆔', category: 'logic', description: 'Generate unique identifiers (UUID/GUID)' },
      { type: 'textFormatter', icon: '📝', category: 'logic', description: 'Format and transform text strings' },
      { type: 'if', icon: '❓', category: 'logic', description: 'Conditional branching (if/else logic)' },

      // EXCLUSIVE CUSTOM NODES
      { type: 'humanInTheLoop', icon: '👤', category: 'advanced', description: 'Pause & approval with human confirmation URL' },
      { type: 'smartDataCleaner', icon: '✨', category: 'data', description: 'Auto-normalize dates, phones, text' },
      { type: 'aiCostGuardian', icon: '🛡️', category: 'ai', description: 'Optimize LLM tokens to prevent cost overruns' },
      { type: 'noCodeBrowserAutomator', icon: '🌐', category: 'automation', description: 'Browser automation with Puppeteer/Playwright' },
      { type: 'aggregatorMultiSearch', icon: '🔍', category: 'data', description: 'Search multiple engines simultaneously' },
      { type: 'liveCanvasDebugger', icon: '🐛', category: 'debug', description: 'Visual debugging with metrics on canvas' },
      { type: 'socialMockupPreview', icon: '👁️', category: 'social', description: 'Preview social media posts before publishing' },
      { type: 'rateLimiterBypass', icon: '⚡', category: 'automation', description: 'Smart queue management for rate limits' },
      { type: 'ghost', icon: '👻', category: 'advanced', description: 'Silent mode for GDPR compliance' },

      // ADVANCED INTEGRATION NODES
      { type: 'gitHub', icon: '🐙', category: 'devops', description: 'DevOps: Repos, PRs, Issues, GitHub Actions' },
      { type: 'figma', icon: '🎨', category: 'design', description: 'Design Ops: Components, Assets, Comments, Variables' },
      { type: 'windowsControl', icon: '🪟', category: 'advanced', description: 'PC Master: PowerShell, System, Process, Volume (CRITICAL SECURITY)' },
      { type: 'streaming', icon: '📺', category: 'streaming', description: 'Twitch/YouTube/Kick: Live alerts, moderation, chat' },
      { type: 'infrastructure', icon: '🖥️', category: 'devops', description: 'SSH/SFTP/SMTP: Remote commands, file transfer, email' },

      // INDIVIDUAL APPLE NODES (Official Apple Icons)
      { type: 'appleEcosystem', icon: '🍎', category: 'apple', description: 'Unified Apple ecosystem control node' },
      { type: 'imessage', icon: '💬', category: 'apple', description: 'Send iMessages from iCloud account' },
      { type: 'icloudReminders', icon: '✅', category: 'apple', description: 'Create/read/update iCloud Reminders' },
      { type: 'icloudNotes', icon: '📝', category: 'apple', description: 'Manage iCloud Notes folders and notes' },
      { type: 'icloudCalendar', icon: '📅', category: 'apple', description: 'Create/read/update iCloud Calendar events' },
      { type: 'icloudDrive', icon: '☁️', category: 'apple', description: 'Upload/download files from iCloud Drive' },

      // INDIVIDUAL ANDROID NODES (Official Android Icons)
      { type: 'androidEcosystem', icon: '🤖', category: 'android', description: 'Unified Android ecosystem control node' },
      { type: 'androidMessages', icon: '📱', category: 'android', description: 'Send SMS/RCS messages via Android' },
      { type: 'androidContacts', icon: '👥', category: 'android', description: 'Query Android contacts' },
      { type: 'androidADB', icon: '💻', category: 'android', description: 'Execute ADB commands on connected device' },
      { type: 'androidAPK', icon: '📦', category: 'android', description: 'Install/uninstall Android APK packages' },
      { type: 'androidNotifications', icon: '🔔', category: 'android', description: 'Send push notifications to Android device' },
    ];

    return metadata;
  }
}

// Export a singleton instance
export default NodeRegistry.getInstance();
