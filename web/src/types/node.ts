/**
 * Node Types for LogicAI-N8N Frontend
 */

import type { Node } from '@xyflow/react';

// Les données contenues dans la propriété "data" d'un nœud React Flow
export interface CustomNodeData extends Record<string, unknown> {
  id: string;
  type: NodeType;
  label: string;
  config: BaseNodeConfig;
  status?: NodeStatus;
  disabled?: boolean;
}

// Le type complet d'un nœud React Flow avec nos données personnalisées
export type CustomNode = Node<CustomNodeData>;

export type NodeType =
  // CORE NODES (Logic & Data)
  | 'webhook'
  | 'httpRequest'
  | 'setVariable'
  | 'editFields'
  | 'code'
  | 'filter'
  | 'switch'
  | 'merge'
  | 'splitInBatches'
  | 'wait'
  | 'errorTrigger'
  | 'executeWorkflow'
  | 'limit'
  | 'sort'
  // LOGIC NODES
  | 'loop'
  | 'date'
  | 'uuid'
  | 'textFormatter'
  | 'if'
  // PAYMENT & E-COMMERCE
  | 'stripe'
  | 'paypal'
  | 'square'
  | 'shopify'
  | 'wooCommerce'
  // CRM & CUSTOMER SUPPORT
  | 'salesforce'
  | 'hubspot'
  | 'zendesk'
  // TRIGGER NODES
  | 'schedule'
  | 'onSuccessFailure'
  | 'formTrigger'
  | 'chatTrigger'
  | 'clickTrigger'
  | 'emailTrigger'
  | 'httpPollTrigger'
  | 'cronTrigger'
  | 'logicaiTrigger'
  // HTTP & DATA
  | 'htmlExtract'
  | 'rssRead'
  | 'ftp'
  | 'ssh'
  // DATABASE
  | 'mySQL'
  | 'postgreSQL'
  | 'mongoDB'
  | 'redis'
  | 'supabase'
  | 'firebase'
  | 'sqlite'
  // COMMUNICATION
  | 'email'
  | 'slack'
  | 'discord'
  | 'telegram'
  | 'whatsapp'
  | 'twilio'
  | 'sendgrid'
  | 'mailchimp'
  // EMAIL NODES
  | 'emailSend'
  | 'emailRead'
  | 'emailReply'
  | 'emailForward'
  | 'emailDelete'
  // TWILIO NODES
  | 'twilioSendSMS'
  | 'twilioReceiveSMS'
  | 'twilioMakeCall'
  | 'twilioSendWhatsApp'
  | 'instagram'
  | 'facebook'
  | 'twitter'
  | 'linkedin'
  | 'tiktok'
  | 'snapchat'
  // INSTAGRAM NODES
  | 'instagramPost'
  | 'instagramStory'
  | 'instagramReels'
  // FACEBOOK NODES
  | 'facebookPost'
  | 'facebookUploadPhoto'
  | 'facebookPagePost'
  // TWITTER NODES
  | 'twitterTweet'
  | 'twitterReply'
  | 'twitterLike'
  | 'twitterRetweet'
  // LINKEDIN NODES
  | 'linkedinPost'
  | 'linkedinShareArticle'
  | 'linkedinMessage'
  // WHATSAPP NODES
  | 'whatsappSendMessage'
  | 'whatsappSendMedia'
  | 'whatsappSendLocation'
  // TELEGRAM NODES
  | 'telegramSendMessage'
  | 'telegramSendPhoto'
  | 'telegramBotCommand'
  // DISCORD NODES
  | 'discordSendMessage'
  | 'discordSendEmbed'
  | 'discordManageChannel'
  // SLACK NODES
  | 'slackSendMessage'
  | 'slackUpdateMessage'
  | 'slackUploadFile'
  // TIKTOK NODES
  | 'tiktokUploadVideo'
  | 'tiktokGetVideoInfo'
  | 'tiktokGetUserInfo'
  // CLOUD PRODUCTIVITY
  | 'googleSheets'
  | 'googleDrive'
  | 'airtable'
  | 'notion'
  | 'trello'
  // PROJECT MANAGEMENT
  | 'asana'
  | 'linear'
  // CLOUD STORAGE
  | 'dropbox'
  | 'onedrive'
  | 'box'
  | 's3'
  // AI/LLM
  | 'openAI'
  | 'anthropic'
  | 'gemini'
  | 'perplexity'
  | 'glm'
  | 'openrouter'
  | 'ollama'
  | 'aiAgent'
  | 'vectorStore'
  | 'embeddings'
  // STREAMING PLATFORMS
  | 'twitch'
  | 'youtube'
  | 'kick'
  // BINARY
  | 'readWriteBinaryFile'
  | 'compression'
  | 'crypto'
  // MARKETING
  | 'sendgrid'
  | 'mailchimp'
  // EXCLUSIVE CUSTOM NODES
  | 'humanInTheLoop'
  | 'smartDataCleaner'
  | 'aiCostGuardian'
  | 'noCodeBrowserAutomator'
  | 'aggregatorMultiSearch'
  | 'liveCanvasDebugger'
  | 'socialMockupPreview'
  | 'rateLimiterBypass'
  | 'ghost'
  // ADVANCED INTEGRATION NODES
  | 'appleEcosystem'
  | 'androidEcosystem'
  | 'gitHub'
  | 'figma'
  | 'windowsControl'
  | 'streaming'
  | 'infrastructure'
  // INDIVIDUAL APPLE NODES
  | 'imessage'
  | 'icloudReminders'
  | 'icloudNotes'
  | 'icloudCalendar'
  | 'icloudDrive'
  // INDIVIDUAL ANDROID NODES
  | 'androidMessages'
  | 'androidContacts'
  | 'androidADB'
  | 'androidAPK'
  | 'androidNotifications';

export type NodeStatus = 'idle' | 'running' | 'success' | 'error';

export interface BaseNodeConfig {
  [key: string]: any;
}

// Core node configs
export interface WebhookConfig extends BaseNodeConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
}

export interface HttpRequestConfig extends BaseNodeConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  queryParams?: Record<string, string>;
}

export interface SetVariableConfig extends BaseNodeConfig {
  key: string;
  value: string;
  valueType?: 'string' | 'number' | 'boolean' | 'json';
}

export interface ConditionConfig extends BaseNodeConfig {
  expression: string;
  truePath?: string;
  falsePath?: string;
}

// Exclusive custom node configs
export interface HumanInTheLoopConfig extends BaseNodeConfig {
  timeout?: number;
  notificationType?: 'email' | 'slack' | 'none';
  notificationEmail?: string;
  approvalBaseUrl?: string;
}

export interface SmartDataCleanerConfig extends BaseNodeConfig {
  cleaningRules?: Record<string, {
    type: 'trim' | 'capitalize' | 'uppercase' | 'lowercase' | 'normalizePhone' |
          'normalizeDate' | 'normalizeEmail' | 'removeAccents' | 'removeExtraSpaces' |
          'typeConversion' | 'removeSpecialChars' | 'maskSensitive';
    format?: string;
    targetType?: string;
    visibleChars?: number;
    maskChar?: string;
  }>;
}

export interface AICostGuardianConfig extends BaseNodeConfig {
  maxTokens: number;
  targetField: string;
  strategy: 'truncate' | 'summarize' | 'compress' | 'smartTruncate';
}

export interface NoCodeBrowserAutomatorConfig extends BaseNodeConfig {
  actions?: Array<{
    type: 'goto' | 'click' | 'fill' | 'select' | 'scroll' | 'waitFor' |
          'waitForSelector' | 'screenshot' | 'extract' | 'extractMultiple' |
          'evaluate' | 'waitForNavigation';
    selector?: string;
    url?: string;
    value?: string;
    duration?: number;
    filename?: string;
    attribute?: string;
    script?: string;
    direction?: string;
    amount?: number;
  }>;
}

export interface AggregatorMultiSearchConfig extends BaseNodeConfig {
  query?: string;
  engines?: Array<'google' | 'duckduckgo' | 'linkedin' | 'bing'>;
  maxResults?: number;
  sortByRelevance?: boolean;
  deduplicate?: boolean;
}

export interface PDFIntelligentParserConfig extends BaseNodeConfig {
  pdfUrl?: string;
  documentType?: 'auto' | 'invoice' | 'cv' | 'purchaseOrder' | 'receipt';
  extractFields?: string[];
}

export interface LiveCanvasDebuggerConfig extends BaseNodeConfig {
  operations?: Array<{
    type: 'log' | 'measure' | 'inspect' | 'breakpoint' | 'trace';
    level?: string;
    message?: string;
    data?: any;
    label?: string;
    path?: string;
    condition?: string;
  }>;
}

export interface SocialMockupPreviewConfig extends BaseNodeConfig {
  platform: 'twitter' | 'linkedin' | 'facebook' | 'instagram' | 'tiktok';
  content?: string;
  mediaUrls?: string[];
  metadata?: {
    authorName?: string;
    username?: string;
    headline?: string;
    avatar?: string;
    verified?: boolean;
    scheduledAt?: string;
    privacy?: string;
    feeling?: string;
    activity?: string;
    location?: string;
    music?: string;
    mediaAlt?: string[];
  };
}

export interface RateLimiterBypassConfig extends BaseNodeConfig {
  url?: string;
  method?: string;
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
}

export interface GhostNodeConfig extends BaseNodeConfig {
  operations?: Array<{
    type: 'transform' | 'filter' | 'aggregate' | 'enrich' | 'validate' |
          'encrypt' | 'mask' | 'process';
    transformations?: any[];
    conditions?: any[];
    aggregations?: any[];
    enrichments?: any[];
    schema?: any;
    fields?: string[];
    handler?: string;
  }>;
}

export interface NodeMetadata {
  type: NodeType;
  icon: string;
  category: 'trigger' | 'action' | 'logic' | 'advanced' | 'data' | 'ai' |
            'automation' | 'debug' | 'social' | 'apple' | 'android' |
            'payment' | 'ecommerce' | 'crm' | 'support' | 'marketing' |
            'project' | 'storage' | 'http' | 'database' | 'communication' |
            'productivity' | 'devops' | 'design' | 'streaming' | 'hidden';
  description: string;
  config: Record<string, {
    type: 'text' | 'textarea' | 'select' | 'number' | 'boolean' | 'json'
        | 'formBuilder' | 'filterBuilder' | 'sortBuilder' | 'codeEditor'
        | 'workflowSelect' | 'httpRequestBuilder' | 'ftpBuilder'
        | 'cleaningRulesBuilder' | 'browserActionsBuilder' | 'enginesSelect'
        | 'debugOperationsBuilder' | 'ghostOperationsBuilder'
        | 'aiBuiltinTools' | 'aiOptions'
        | 'ifConditionsBuilder'
        | 'sqlQueryBuilder';
    label: string;
    placeholder?: string;
    description?: string;
    options?: { label: string; value: string }[];
    defaultValue?: any;
    rows?: number;
    tools?: any[];
    availableOptions?: any[];
  }>;
}

export const NODE_TYPES_METADATA: Partial<Record<NodeType, NodeMetadata>> = {
  // Core nodes
  webhook: {
    type: 'webhook',
    icon: 'Webhook',
    category: 'trigger',
    description: 'Triggers the workflow when an HTTP request is received',
    config: {
      method: {
        type: 'select',
        label: 'HTTP Method',
        options: [
          { label: 'GET', value: 'GET' },
          { label: 'POST', value: 'POST' },
          { label: 'PUT', value: 'PUT' },
          { label: 'DELETE', value: 'DELETE' },
          { label: 'PATCH', value: 'PATCH' },
        ],
        defaultValue: 'POST',
      },
      path: {
        type: 'text',
        label: 'Path',
        placeholder: '/webhook',
        defaultValue: '/webhook',
      },
    },
  },
  httpRequest: {
    type: 'httpRequest',
    icon: 'Globe',
    category: 'logic',
    description: 'Makes an HTTP request to an external API',
    config: {
      request: {
        type: 'httpRequestBuilder',
        label: 'HTTP Request',
        defaultValue: {
          url: '',
          method: 'GET',
          sendQuery: false,
          queryParams: [],
          sendHeaders: false,
          headers: [],
          sendBody: false,
          bodyType: 'json',
          bodyJson: '{}',
          bodyForm: [],
          bodyRaw: '',
          batching: false,
          batchSize: 10,
          ignoreSsl: false,
          lowercaseHeaders: false,
          redirects: true,
          maxRedirects: 3,
          responseFormat: 'auto',
          pagination: false,
          paginationParam: 'page',
          proxy: '',
          timeout: 30000,
        },
      },
    },
  },
  setVariable: {
    type: 'setVariable',
    icon: 'Variable',
    category: 'logic',
    description: 'Sets or modifies variables in the data flow',
    config: {
      key: {
        type: 'text',
        label: 'Variable Key',
        placeholder: 'output.value',
      },
      value: {
        type: 'text',
        label: 'Value',
        placeholder: '{{ $json.field }}',
      },
      valueType: {
        type: 'select',
        label: 'Value Type',
        options: [
          { label: 'String', value: 'string' },
          { label: 'Number', value: 'number' },
          { label: 'Boolean', value: 'boolean' },
          { label: 'JSON', value: 'json' },
        ],
        defaultValue: 'string',
      },
    },
  },

  // DATABASE NODES
  mySQL: {
    type: 'mySQL',
    icon: 'Database',
    category: 'database',
    description: 'MySQL/PostgreSQL database operations',
    config: {
      operation: {
        type: 'select',
        label: 'Operation',
        options: [
          { label: 'Execute Query', value: 'executeQuery' },
          { label: 'Insert', value: 'insert' },
          { label: 'Update', value: 'update' },
          { label: 'Delete', value: 'delete' },
          { label: 'Select', value: 'select' },
        ],
        defaultValue: 'executeQuery',
      },
      query: {
        type: 'sqlQueryBuilder',
        label: 'SQL Query',
        placeholder: 'SELECT * FROM users WHERE id = ?',
        defaultValue: { mode: 'builder', operation: 'select', table: '', columns: ['*'], distinct: false, limit: '', offset: '', where: [], orderBy: [], insertPairs: [], setPairs: [], rawSql: '' },
      },
      host: {
        type: 'text',
        label: 'Host',
        placeholder: 'localhost',
      },
      port: {
        type: 'number',
        label: 'Port',
        defaultValue: 3306,
      },
      database: {
        type: 'text',
        label: 'Database Name',
        placeholder: 'mydb',
      },
      user: {
        type: 'text',
        label: 'Username',
        placeholder: 'root',
      },
      password: {
        type: 'text',
        label: 'Password',
      },
    },
  },
  mongoDB: {
    type: 'mongoDB',
    icon: 'Database',
    category: 'database',
    description: 'MongoDB NoSQL operations',
    config: {
      operation: {
        type: 'select',
        label: 'Operation',
        options: [
          { label: 'Find', value: 'find' },
          { label: 'Insert One', value: 'insertOne' },
          { label: 'Insert Many', value: 'insertMany' },
          { label: 'Update One', value: 'updateOne' },
          { label: 'Update Many', value: 'updateMany' },
          { label: 'Delete One', value: 'deleteOne' },
          { label: 'Delete Many', value: 'deleteMany' },
          { label: 'Aggregate', value: 'aggregate' },
        ],
        defaultValue: 'find',
      },
      collection: {
        type: 'text',
        label: 'Collection Name',
        placeholder: 'users',
      },
      query: {
        type: 'textarea',
        label: 'Query (JSON)',
        placeholder: '{"age": {"$gt": 18}}',
      },
      connectionString: {
        type: 'text',
        label: 'Connection String',
        placeholder: 'mongodb://localhost:27017/mydb',
      },
    },
  },
  redis: {
    type: 'redis',
    icon: 'Database',
    category: 'database',
    description: 'Redis key-value cache operations',
    config: {
      operation: {
        type: 'select',
        label: 'Operation',
        options: [
          { label: 'Get', value: 'get' },
          { label: 'Set', value: 'set' },
          { label: 'Delete', value: 'delete' },
          { label: 'Exists', value: 'exists' },
          { label: 'Expire', value: 'expire' },
          { label: 'Incr', value: 'incr' },
          { label: 'Decr', value: 'decr' },
        ],
        defaultValue: 'get',
      },
      key: {
        type: 'text',
        label: 'Key',
        placeholder: 'mykey',
      },
      value: {
        type: 'text',
        label: 'Value',
        placeholder: 'myvalue',
      },
      host: {
        type: 'text',
        label: 'Host',
        defaultValue: 'localhost',
      },
      port: {
        type: 'number',
        label: 'Port',
        defaultValue: 6379,
      },
    },
  },
  supabase: {
    type: 'supabase',
    icon: 'Database',
    category: 'database',
    description: 'Supabase backend integration',
    config: {
      operation: {
        type: 'select',
        label: 'Operation',
        options: [
          { label: 'Select', value: 'select' },
          { label: 'Insert', value: 'insert' },
          { label: 'Update', value: 'update' },
          { label: 'Delete', value: 'delete' },
          { label: 'RPC', value: 'rpc' },
        ],
        defaultValue: 'select',
      },
      table: {
        type: 'text',
        label: 'Table Name',
        placeholder: 'users',
      },
      query: {
        type: 'textarea',
        label: 'Query (JSON)',
        placeholder: '{"select": "*", "filter": {"id": "eq.123"}}',
      },
      supabaseUrl: {
        type: 'text',
        label: 'Supabase URL',
        placeholder: 'https://yourproject.supabase.co',
      },
      supabaseKey: {
        type: 'text',
        label: 'Supabase Key',
        placeholder: 'your-supabase-anon-key',
      },
    },
  },

  // New trigger nodes
  chatTrigger: {
    type: 'chatTrigger',
    icon: 'MessageCircle',
    category: 'trigger',
    description: 'Trigger workflow from chat messages (Textual)',
    config: {},
  },
  clickTrigger: {
    type: 'clickTrigger',
    icon: 'MousePointerClick',
    category: 'trigger',
    description: 'Manual trigger - execute workflow by clicking a button in the UI',
    config: {
      requireConfirmation: {
        type: 'boolean',
        label: 'Require Confirmation',
        defaultValue: false,
      },
      confirmationMessage: {
        type: 'text',
        label: 'Confirmation Message',
        defaultValue: 'Execute this workflow?',
        placeholder: 'Execute this workflow?',
      },
      minInterval: {
        type: 'text',
        label: 'Minimum Interval',
        placeholder: '30s',
        description: 'Minimum time between executions (e.g., 30s, 5m, 1h)',
      },
      data: {
        type: 'textarea',
        label: 'Additional Data (JSON)',
        placeholder: '{"key": "value"}',
        description: 'Additional data to pass with the trigger',
      },
    },
  },
  emailTrigger: {
    type: 'emailTrigger',
    icon: 'Mail',
    category: 'trigger',
    description: 'Monitor email inbox via IMAP/POP3',
    config: {
      host: {
        type: 'text',
        label: 'IMAP Host',
        placeholder: 'imap.gmail.com',
      },
      port: {
        type: 'number',
        label: 'Port',
        defaultValue: 993,
      },
      username: {
        type: 'text',
        label: 'Email Address',
        placeholder: 'your-email@example.com',
      },
      password: {
        type: 'text',
        label: 'Password/App Password',
        placeholder: 'Your email password or app password',
      },
      folder: {
        type: 'text',
        label: 'Folder',
        defaultValue: 'INBOX',
      },
    },
  },
  httpPollTrigger: {
    type: 'httpPollTrigger',
    icon: 'RefreshCw',
    category: 'trigger',
    description: 'Poll HTTP endpoint at regular intervals',
    config: {
      url: {
        type: 'text',
        label: 'URL',
        placeholder: 'https://api.example.com/endpoint',
      },
      interval: {
        type: 'number',
        label: 'Polling Interval (ms)',
        defaultValue: 60000,
      },
      method: {
        type: 'select',
        label: 'HTTP Method',
        options: [
          { label: 'GET', value: 'GET' },
          { label: 'POST', value: 'POST' },
        ],
        defaultValue: 'GET',
      },
    },
  },
  cronTrigger: {
    type: 'cronTrigger',
    icon: 'Clock',
    category: 'trigger',
    description: 'Advanced scheduling with cron expressions',
    config: {
      cronExpression: {
        type: 'text',
        label: 'Cron Expression',
        placeholder: '* * * * *',
        defaultValue: '* * * * *',
      },
    },
  },

  logicaiTrigger: {
    type: 'logicaiTrigger',
    icon: 'Workflow',
    category: 'trigger',
    description: 'Receives an incoming call from the LogicAI SDK (client.workflows.trigger / client.workflows.webhook) and starts this workflow. The caller must use HTTPS — for local dev, expose via Cloudflare Tunnel or ngrok.',
    config: {
      webhookPath: {
        type: 'text',
        label: 'Webhook Path',
        placeholder: 'my-trigger',
        description: 'Unique path this trigger listens on → /webhook/{path}. Used by the SDK as workflowId or webhookPath.',
      },
      secret: {
        type: 'text',
        label: 'Secret Token (optional)',
        placeholder: 'your-secret-token',
        description: 'If set, incoming requests must include this token in the X-LogicAI-Secret header.',
      },
    },
  },

  formTrigger: {
    type: 'formTrigger',
    icon: 'FileInput',
    category: 'trigger',
    description: 'Create a shareable form that triggers workflow when submitted',
    config: {
      formTitle: {
        type: 'text',
        label: 'Form Title',
        defaultValue: 'Contact Form',
        placeholder: 'Enter form title',
      },
      formDescription: {
        type: 'textarea',
        label: 'Form Description',
        placeholder: 'Optional description for your form',
      },
      fields: {
        type: 'formBuilder',
        label: 'Form Fields',
        description: 'Visual form builder — add, reorder and configure fields',
        defaultValue: [
          { id: '1', name: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'John Doe' },
          { id: '2', name: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'john@example.com' },
        ],
      },
      submitButtonText: {
        type: 'text',
        label: 'Submit Button Text',
        defaultValue: 'Submit',
        placeholder: 'Submit',
      },
      responseMessage: {
        type: 'textarea',
        label: 'Success Message',
        defaultValue: 'Thank you for your submission!',
        placeholder: 'Message shown after successful submission',
      },
      redirectUrl: {
        type: 'text',
        label: 'Redirect URL (optional)',
        placeholder: 'https://example.com/thank-you',
        description: 'Redirect users after submission instead of showing message',
      },
      allowMultipleSubmissions: {
        type: 'boolean',
        label: 'Allow Multiple Submissions',
        defaultValue: true,
      },
    },
  },

  // Exclusive custom nodes
  humanInTheLoop: {
    type: 'humanInTheLoop',
    icon: 'UserCheck',
    category: 'logic',
    description: 'Pauses workflow and generates approval URL for human confirmation',
    config: {
      timeout: {
        type: 'number',
        label: 'Timeout (ms)',
        defaultValue: 3600000,
      },
      notificationType: {
        type: 'select',
        label: 'Notification Type',
        options: [
          { label: 'None', value: 'none' },
          { label: 'Email', value: 'email' },
          { label: 'Slack', value: 'slack' },
        ],
        defaultValue: 'none',
      },
      notificationEmail: {
        type: 'text',
        label: 'Notification Email',
        placeholder: 'admin@example.com',
      },
      approvalBaseUrl: {
        type: 'text',
        label: 'Approval Base URL',
        defaultValue: 'http://localhost:5173',
      },
    },
  },
  smartDataCleaner: {
    type: 'smartDataCleaner',
    icon: 'Sparkles',
    category: 'logic',
    description: 'Automatically normalizes and cleans data (dates, phones, text)',
    config: {
      cleaningRules: {
        type: 'cleaningRulesBuilder',
        label: 'Cleaning Rules',
        defaultValue: [],
      },
    },
  },
  aiCostGuardian: {
    type: 'aiCostGuardian',
    icon: 'Shield',
    category: 'ai',
    description: 'Optimizes text to fit LLM token budgets and prevent cost overruns',
    config: {
      maxTokens: {
        type: 'number',
        label: 'Max Tokens',
        defaultValue: 4000,
      },
      targetField: {
        type: 'text',
        label: 'Target Field',
        defaultValue: 'prompt',
      },
      strategy: {
        type: 'select',
        label: 'Strategy',
        options: [
          { label: 'Truncate', value: 'truncate' },
          { label: 'Summarize', value: 'summarize' },
          { label: 'Compress', value: 'compress' },
          { label: 'Smart Truncate', value: 'smartTruncate' },
        ],
        defaultValue: 'truncate',
      },
    },
  },
  noCodeBrowserAutomator: {
    type: 'noCodeBrowserAutomator',
    icon: 'Globe',
    category: 'logic',
    description: 'Browser automation with visual selectors (Puppeteer/Playwright)',
    config: {
      actions: {
        type: 'browserActionsBuilder',
        label: 'Browser Steps',
        defaultValue: [],
      },
    },
  },
  aggregatorMultiSearch: {
    type: 'aggregatorMultiSearch',
    icon: 'Search',
    category: 'logic',
    description: 'Search multiple engines simultaneously and consolidate results',
    config: {
      query: {
        type: 'text',
        label: 'Search Query',
        placeholder: 'your search terms',
      },
      engines: {
        type: 'enginesSelect',
        label: 'Search Engines',
        defaultValue: ['google', 'duckduckgo'],
      },
      maxResults: {
        type: 'number',
        label: 'Max Results per Engine',
        defaultValue: 10,
      },
      sortByRelevance: {
        type: 'boolean',
        label: 'Sort by Relevance',
        defaultValue: true,
      },
      deduplicate: {
        type: 'boolean',
        label: 'Deduplicate Results',
        defaultValue: true,
      },
    },
  },
  liveCanvasDebugger: {
    type: 'liveCanvasDebugger',
    icon: 'Bug',
    category: 'logic',
    description: 'Visual debugging with logs and performance metrics on canvas',
    config: {
      operations: {
        type: 'debugOperationsBuilder',
        label: 'Debug Operations',
        defaultValue: [],
      },
    },
  },
  socialMockupPreview: {
    type: 'socialMockupPreview',
    icon: 'Eye',
    category: 'hidden',
    description: 'Generate visual previews of social media posts before publishing',
    config: {
      platform: {
        type: 'select',
        label: 'Platform',
        options: [
          { label: 'Twitter/X', value: 'twitter' },
          { label: 'LinkedIn', value: 'linkedin' },
          { label: 'Facebook', value: 'facebook' },
          { label: 'Instagram', value: 'instagram' },
          { label: 'TikTok', value: 'tiktok' },
        ],
        defaultValue: 'twitter',
      },
      content: {
        type: 'textarea',
        label: 'Post Content',
        placeholder: 'Your post content here...',
      },
      mediaUrls: {
        type: 'textarea',
        label: 'Media URLs (JSON array)',
        placeholder: '["https://example.com/image1.jpg"]',
      },
    },
  },
  rateLimiterBypass: {
    type: 'rateLimiterBypass',
    icon: 'Zap',
    category: 'logic',
    description: 'Smart queue management with adaptive delays for API rate limits',
    config: {
      url: {
        type: 'text',
        label: 'URL',
        placeholder: 'https://api.example.com/endpoint',
      },
      method: {
        type: 'select',
        label: 'Method',
        options: [
          { label: 'GET', value: 'GET' },
          { label: 'POST', value: 'POST' },
          { label: 'PUT', value: 'PUT' },
          { label: 'DELETE', value: 'DELETE' },
        ],
        defaultValue: 'GET',
      },
      maxRetries: {
        type: 'number',
        label: 'Max Retries',
        defaultValue: 5,
      },
      baseDelay: {
        type: 'number',
        label: 'Base Delay (ms)',
        defaultValue: 1000,
      },
      maxDelay: {
        type: 'number',
        label: 'Max Delay (ms)',
        defaultValue: 60000,
      },
    },
  },
  ghost: {
    type: 'ghost',
    icon: 'Ghost',
    category: 'logic',
    description: 'Silent mode for GDPR compliance - no logging or data storage',
    config: {
      operations: {
        type: 'ghostOperationsBuilder',
        label: 'Privacy Operations',
        defaultValue: [],
      },
    },
  },

  // ADVANCED INTEGRATION NODES
  appleEcosystem: {
    type: 'appleEcosystem',
    icon: 'Laptop',
    category: 'apple',
    description: 'iCloud Bridge: iMessage, Reminders, Notes, Music',
    config: {
      service: {
        type: 'select',
        label: 'Service',
        options: [
          { label: 'iMessage', value: 'imessage' },
          { label: 'Reminders', value: 'reminders' },
          { label: 'Notes', value: 'notes' },
          { label: 'Music', value: 'music' },
        ],
      },
      action: {
        type: 'select',
        label: 'Action',
        options: [
          { label: 'Send', value: 'send' },
          { label: 'Read', value: 'read' },
          { label: 'Create', value: 'create' },
          { label: 'List', value: 'list' },
        ],
      },
    },
  },

  androidEcosystem: {
    type: 'androidEcosystem',
    icon: 'Smartphone',
    category: 'android',
    description: 'Google/APK Bridge: Messages, Contacts, ADB, APK',
    config: {
      service: {
        type: 'select',
        label: 'Service',
        options: [
          { label: 'Messages (SMS/RCS)', value: 'messages' },
          { label: 'Contacts', value: 'contacts' },
          { label: 'ADB', value: 'adb' },
          { label: 'APK', value: 'apk' },
        ],
      },
      deviceId: {
        type: 'text',
        label: 'Device ID',
        placeholder: 'Optional device identifier',
      },
    },
  },

  gitHub: {
    type: 'gitHub',
    icon: 'Github',
    category: 'project',
    description: 'DevOps: Repos, PRs, Issues, GitHub Actions',
    config: {
      resource: {
        type: 'select',
        label: 'Resource',
        options: [
          { label: 'Repository', value: 'repository' },
          { label: 'Pull Request', value: 'pullRequest' },
          { label: 'Issue', value: 'issue' },
          { label: 'Actions', value: 'actions' },
          { label: 'Commit', value: 'commit' },
        ],
      },
      accessToken: {
        type: 'text',
        label: 'Access Token',
        placeholder: 'ghp_xxxxxxxxxxxx',
      },
      owner: {
        type: 'text',
        label: 'Owner',
        placeholder: 'repository owner',
      },
      repo: {
        type: 'text',
        label: 'Repository',
        placeholder: 'repository name',
      },
    },
  },

  figma: {
    type: 'figma',
    icon: 'PenTool',
    category: 'project',
    description: 'Design Ops: Components, Assets, Comments, Variables',
    config: {
      resource: {
        type: 'select',
        label: 'Resource',
        options: [
          { label: 'File', value: 'file' },
          { label: 'Components', value: 'components' },
          { label: 'Assets', value: 'assets' },
          { label: 'Comments', value: 'comments' },
          { label: 'Variables', value: 'variables' },
        ],
      },
      fileKey: {
        type: 'text',
        label: 'File Key',
        placeholder: 'Figma file key from URL',
      },
      accessToken: {
        type: 'text',
        label: 'Access Token',
        placeholder: 'Figma personal access token',
      },
    },
  },

  windowsControl: {
    type: 'windowsControl',
    icon: 'Monitor',
    category: 'logic',
    description: 'PC Master: PowerShell, System, Process, Volume (CRITICAL SECURITY)',
    config: {
      service: {
        type: 'select',
        label: 'Service',
        options: [
          { label: 'PowerShell', value: 'powershell' },
          { label: 'System', value: 'system' },
          { label: 'Process', value: 'process' },
          { label: 'Volume', value: 'volume' },
          { label: 'File', value: 'file' },
        ],
      },
      whitelistEnabled: {
        type: 'boolean',
        label: 'Enable Whitelist',
        defaultValue: true,
      },
      commandTimeout: {
        type: 'number',
        label: 'Command Timeout (ms)',
        defaultValue: 30000,
      },
    },
  },

  streaming: {
    type: 'streaming',
    icon: 'Radio',
    category: 'hidden',
    description: 'Twitch/YouTube/Kick: Live alerts, moderation, chat',
    config: {
      platform: {
        type: 'select',
        label: 'Platform',
        options: [
          { label: 'Twitch', value: 'twitch' },
          { label: 'YouTube', value: 'youtube' },
          { label: 'Kick', value: 'kick' },
        ],
      },
      resource: {
        type: 'select',
        label: 'Resource',
        options: [
          { label: 'Stream', value: 'stream' },
          { label: 'Channel', value: 'channel' },
          { label: 'Chat', value: 'chat' },
          { label: 'Moderation', value: 'moderation' },
        ],
      },
      accessToken: {
        type: 'text',
        label: 'Access Token',
        placeholder: 'OAuth2 access token',
      },
    },
  },

  infrastructure: {
    type: 'infrastructure',
    icon: 'Server',
    category: 'logic',
    description: 'SSH/SFTP/SMTP: Remote commands, file transfer, email',
    config: {
      service: {
        type: 'select',
        label: 'Service',
        options: [
          { label: 'SSH', value: 'ssh' },
          { label: 'SFTP', value: 'sftp' },
          { label: 'SMTP', value: 'smtp' },
        ],
      },
      host: {
        type: 'text',
        label: 'Host',
        placeholder: 'server hostname or IP',
      },
      port: {
        type: 'number',
        label: 'Port',
        defaultValue: 22,
      },
      username: {
        type: 'text',
        label: 'Username',
        placeholder: 'SSH/SMTP username',
      },
    },
  },

  // INDIVIDUAL APPLE NODES
  imessage: {
    type: 'imessage',
    icon: 'MessageCircle',
    category: 'apple',
    description: 'Send iMessages from iCloud account',
    config: {
      recipient: {
        type: 'text',
        label: 'Recipient (Email or Phone)',
        placeholder: '+1234567890 or email@example.com',
      },
      message: {
        type: 'textarea',
        label: 'Message',
        placeholder: 'Your message here...',
        rows: 3,
      },
    },
  },
  icloudReminders: {
    type: 'icloudReminders',
    icon: 'CheckSquare',
    category: 'apple',
    description: 'Create/read/update iCloud Reminders',
    config: {
      action: {
        type: 'select',
        label: 'Action',
        options: [
          { label: 'Create', value: 'create' },
          { label: 'Read', value: 'read' },
          { label: 'Update', value: 'update' },
          { label: 'Delete', value: 'delete' },
          { label: 'List All', value: 'list' },
        ],
        defaultValue: 'create',
      },
      title: {
        type: 'text',
        label: 'Reminder Title',
        placeholder: 'Buy groceries',
      },
      notes: {
        type: 'textarea',
        label: 'Notes',
        placeholder: 'Additional details...',
        rows: 3,
      },
      dueDate: {
        type: 'text',
        label: 'Due Date',
        placeholder: '2024-12-31T14:00:00',
      },
    },
  },
  icloudNotes: {
    type: 'icloudNotes',
    icon: 'FileText',
    category: 'apple',
    description: 'Manage iCloud Notes folders and notes',
    config: {
      action: {
        type: 'select',
        label: 'Action',
        options: [
          { label: 'Create', value: 'create' },
          { label: 'Read', value: 'read' },
          { label: 'Update', value: 'update' },
          { label: 'Delete', value: 'delete' },
          { label: 'List Folders', value: 'listFolders' },
          { label: 'List Notes', value: 'listNotes' },
        ],
        defaultValue: 'create',
      },
      folder: {
        type: 'text',
        label: 'Folder Name',
        placeholder: 'Notes',
      },
      title: {
        type: 'text',
        label: 'Note Title',
        placeholder: 'Meeting Notes',
      },
      content: {
        type: 'textarea',
        label: 'Note Content',
        placeholder: 'Write your note here...',
        rows: 5,
      },
    },
  },
  icloudCalendar: {
    type: 'icloudCalendar',
    icon: 'Calendar',
    category: 'apple',
    description: 'Create/read/update iCloud Calendar events',
    config: {
      action: {
        type: 'select',
        label: 'Action',
        options: [
          { label: 'Create Event', value: 'create' },
          { label: 'Read Events', value: 'read' },
          { label: 'Update Event', value: 'update' },
          { label: 'Delete Event', value: 'delete' },
        ],
        defaultValue: 'create',
      },
      title: {
        type: 'text',
        label: 'Event Title',
        placeholder: 'Team Meeting',
      },
      startDate: {
        type: 'text',
        label: 'Start Date',
        placeholder: '2024-12-31T14:00:00',
      },
      endDate: {
        type: 'text',
        label: 'End Date',
        placeholder: '2024-12-31T15:00:00',
      },
      location: {
        type: 'text',
        label: 'Location',
        placeholder: 'Conference Room A',
      },
      notes: {
        type: 'textarea',
        label: 'Event Notes',
        placeholder: 'Agenda items...',
        rows: 3,
      },
    },
  },
  icloudDrive: {
    type: 'icloudDrive',
    icon: 'Cloud',
    category: 'apple',
    description: 'Upload/download files from iCloud Drive',
    config: {
      action: {
        type: 'select',
        label: 'Action',
        options: [
          { label: 'Upload', value: 'upload' },
          { label: 'Download', value: 'download' },
          { label: 'List Files', value: 'list' },
          { label: 'Delete', value: 'delete' },
          { label: 'Create Folder', value: 'createFolder' },
        ],
        defaultValue: 'upload',
      },
      localPath: {
        type: 'text',
        label: 'Local File Path',
        placeholder: '/path/to/local/file',
      },
      iCloudPath: {
        type: 'text',
        label: 'iCloud Path (optional)',
        placeholder: '/Documents',
      },
    },
  },

  // INDIVIDUAL ANDROID NODES
  androidMessages: {
    type: 'androidMessages',
    icon: 'MessageSquare',
    category: 'android',
    description: 'Send SMS/RCS messages via Android',
    config: {
      recipient: {
        type: 'text',
        label: 'Recipient Phone Number',
        placeholder: '+1234567890',
      },
      message: {
        type: 'textarea',
        label: 'Message Content',
        placeholder: 'Your SMS message here...',
        rows: 3,
      },
      deviceId: {
        type: 'text',
        label: 'Device ID (optional)',
        placeholder: 'emulator-5554',
      },
    },
  },
  androidContacts: {
    type: 'androidContacts',
    icon: 'Users',
    category: 'android',
    description: 'Query Android contacts',
    config: {
      action: {
        type: 'select',
        label: 'Action',
        options: [
          { label: 'Get All', value: 'getAll' },
          { label: 'Get by ID', value: 'getById' },
          { label: 'Search', value: 'search' },
          { label: 'Create', value: 'create' },
          { label: 'Update', value: 'update' },
          { label: 'Delete', value: 'delete' },
        ],
        defaultValue: 'getAll',
      },
      contactId: {
        type: 'text',
        label: 'Contact ID',
        placeholder: '1',
      },
      limit: {
        type: 'number',
        label: 'Limit Results',
        defaultValue: 10,
      },
      deviceId: {
        type: 'text',
        label: 'Device ID (optional)',
        placeholder: 'emulator-5554',
      },
    },
  },
  androidADB: {
    type: 'androidADB',
    icon: 'Terminal',
    category: 'android',
    description: 'Execute ADB commands on connected device',
    config: {
      command: {
        type: 'textarea',
        label: 'ADB Command',
        placeholder: 'devices, install <apk>, shell pm list packages...',
        rows: 3,
      },
      deviceId: {
        type: 'text',
        label: 'Device ID (optional)',
        placeholder: 'emulator-5554',
      },
      timeout: {
        type: 'number',
        label: 'Timeout (ms)',
        defaultValue: 30000,
      },
    },
  },
  androidAPK: {
    type: 'androidAPK',
    icon: 'Package',
    category: 'android',
    description: 'Install/uninstall Android APK packages',
    config: {
      action: {
        type: 'select',
        label: 'Action',
        options: [
          { label: 'Install', value: 'install' },
          { label: 'Uninstall', value: 'uninstall' },
          { label: 'List Packages', value: 'listPackages' },
        ],
        defaultValue: 'install',
      },
      apkPath: {
        type: 'text',
        label: 'APK File Path',
        placeholder: '/path/to/app.apk',
      },
      packageName: {
        type: 'text',
        label: 'Package Name (for uninstall)',
        placeholder: 'com.example.app',
      },
      deviceId: {
        type: 'text',
        label: 'Device ID (optional)',
        placeholder: 'emulator-5554',
      },
    },
  },
  androidNotifications: {
    type: 'androidNotifications',
    icon: 'Bell',
    category: 'android',
    description: 'Send push notifications to Android device',
    config: {
      title: {
        type: 'text',
        label: 'Notification Title',
        placeholder: 'New Message',
      },
      text: {
        type: 'textarea',
        label: 'Notification Text',
        placeholder: 'You have a new message!',
        rows: 3,
      },
      packageName: {
        type: 'text',
        label: 'Package Name (optional)',
        placeholder: 'com.example.app',
      },
      deviceId: {
        type: 'text',
        label: 'Device ID (optional)',
        placeholder: 'emulator-5554',
      },
    },
  },

  // Additional Social Media nodes
  instagram: {
    type: 'instagram',
    icon: 'Instagram',
    category: 'communication',
    description: 'Post content and manage Instagram',
    config: {
      action: {
        type: 'select',
        label: 'Action',
        options: [
          { label: 'Post Image', value: 'postImage' },
          { label: 'Post Video', value: 'postVideo' },
          { label: 'Post Story', value: 'postStory' },
          { label: 'Get Insights', value: 'getInsights' },
        ],
        defaultValue: 'postImage',
      },
      caption: {
        type: 'textarea',
        label: 'Caption',
        placeholder: 'Your caption here...',
        rows: 3,
      },
      mediaUrl: {
        type: 'text',
        label: 'Media URL',
        placeholder: 'https://example.com/image.jpg',
      },
      accessToken: {
        type: 'text',
        label: 'Access Token',
        placeholder: 'Your Instagram access token',
      },
    },
  },
  facebook: {
    type: 'facebook',
    icon: 'Facebook',
    category: 'communication',
    description: 'Post to Facebook pages and groups',
    config: {
      action: {
        type: 'select',
        label: 'Action',
        options: [
          { label: 'Post to Page', value: 'postToPage' },
          { label: 'Post to Group', value: 'postToGroup' },
          { label: 'Upload Photo', value: 'uploadPhoto' },
        ],
        defaultValue: 'postToPage',
      },
      message: {
        type: 'textarea',
        label: 'Message',
        placeholder: 'Your post content...',
        rows: 3,
      },
      pageId: {
        type: 'text',
        label: 'Page/Group ID',
        placeholder: '123456789',
      },
      accessToken: {
        type: 'text',
        label: 'Access Token',
        placeholder: 'Your Facebook access token',
      },
    },
  },
  twitter: {
    type: 'twitter',
    icon: 'Twitter',
    category: 'communication',
    description: 'Post tweets and manage Twitter account',
    config: {
      tweet: {
        type: 'textarea',
        label: 'Tweet Content',
        placeholder: 'What\'s happening?',
        rows: 3,
      },
      accessToken: {
        type: 'text',
        label: 'Access Token',
        placeholder: 'Your Twitter access token',
      },
      accessTokenSecret: {
        type: 'text',
        label: 'Access Token Secret',
        placeholder: 'Your Twitter access token secret',
      },
      apiKey: {
        type: 'text',
        label: 'API Key',
        placeholder: 'Your Twitter API key',
      },
      apiSecret: {
        type: 'text',
        label: 'API Secret',
        placeholder: 'Your Twitter API secret',
      },
    },
  },
  linkedin: {
    type: 'linkedin',
    icon: 'Linkedin',
    category: 'communication',
    description: 'Share posts and articles on LinkedIn',
    config: {
      action: {
        type: 'select',
        label: 'Action',
        options: [
          { label: 'Share Post', value: 'sharePost' },
          { label: 'Publish Article', value: 'publishArticle' },
          { label: 'Share Article', value: 'shareArticle' },
        ],
        defaultValue: 'sharePost',
      },
      content: {
        type: 'textarea',
        label: 'Content',
        placeholder: 'Your post content...',
        rows: 5,
      },
      articleUrl: {
        type: 'text',
        label: 'Article URL (for sharing)',
        placeholder: 'https://example.com/article',
      },
      accessToken: {
        type: 'text',
        label: 'Access Token',
        placeholder: 'Your LinkedIn access token',
      },
    },
  },
  tiktok: {
    type: 'tiktok',
    icon: 'Music',
    category: 'communication',
    description: 'Manage TikTok content and analytics',
    config: {
      action: {
        type: 'select',
        label: 'Action',
        options: [
          { label: 'Upload Video', value: 'uploadVideo' },
          { label: 'Get Video Info', value: 'getVideoInfo' },
          { label: 'Get User Info', value: 'getUserInfo' },
        ],
        defaultValue: 'uploadVideo',
      },
      description: {
        type: 'textarea',
        label: 'Video Description',
        placeholder: 'Video description or caption...',
        rows: 3,
      },
      videoPath: {
        type: 'text',
        label: 'Video File Path/URL',
        placeholder: '/path/to/video.mp4',
      },
      accessToken: {
        type: 'text',
        label: 'Access Token',
        placeholder: 'Your TikTok access token',
      },
    },
  },

  // PAYMENT NODES
  stripe: {
    type: 'stripe',
    icon: 'CreditCard',
    category: 'payment',
    description: 'Stripe payment processing and subscription management',
    config: {
      action: {
        type: 'select',
        label: 'Action',
        options: [
          { label: 'Create Payment Intent', value: 'createPaymentIntent' },
          { label: 'Create Customer', value: 'createCustomer' },
          { label: 'Create Subscription', value: 'createSubscription' },
          { label: 'Cancel Subscription', value: 'cancelSubscription' },
          { label: 'Retrieve Payment', value: 'retrievePayment' },
          { label: 'List Customers', value: 'listCustomers' },
          { label: 'List Products', value: 'listProducts' },
          { label: 'Create Price', value: 'createPrice' },
        ],
        defaultValue: 'createPaymentIntent',
      },
      apiKey: {
        type: 'text',
        label: 'Stripe API Key',
        placeholder: 'sk_live_... or sk_test_...',
      },
      amount: {
        type: 'number',
        label: 'Amount (in cents)',
        placeholder: '1000',
        defaultValue: 1000,
      },
      currency: {
        type: 'select',
        label: 'Currency',
        options: [
          { label: 'USD', value: 'usd' },
          { label: 'EUR', value: 'eur' },
          { label: 'GBP', value: 'gbp' },
          { label: 'CAD', value: 'cad' },
          { label: 'CHF', value: 'chf' },
          { label: 'AUD', value: 'aud' },
          { label: 'JPY', value: 'jpy' },
        ],
        defaultValue: 'usd',
      },
      description: {
        type: 'text',
        label: 'Description',
        placeholder: 'Payment for order #1234',
      },
      customerId: {
        type: 'text',
        label: 'Customer ID',
        placeholder: 'cus_...',
      },
      priceId: {
        type: 'text',
        label: 'Price ID',
        placeholder: 'price_...',
      },
      productId: {
        type: 'text',
        label: 'Product ID',
        placeholder: 'prod_...',
      },
    },
  },

  // WHATSAPP NODES
  whatsappSendMessage: {
    type: 'whatsappSendMessage',
    icon: 'MessageSquare',
    category: 'communication',
    description: 'Send text messages via WhatsApp Business API',
    config: {
      phoneNumber: {
        type: 'text',
        label: 'Phone Number',
        placeholder: '+1234567890',
      },
      message: {
        type: 'textarea',
        label: 'Message',
        placeholder: 'Your message content...',
      },
      accessToken: {
        type: 'text',
        label: 'WhatsApp Access Token',
        placeholder: 'Your WhatsApp Business API token',
      },
    },
  },

  whatsappSendMedia: {
    type: 'whatsappSendMedia',
    icon: 'MessageSquare',
    category: 'communication',
    description: 'Send media (images, videos, documents) via WhatsApp',
    config: {
      phoneNumber: {
        type: 'text',
        label: 'Phone Number',
        placeholder: '+1234567890',
      },
      mediaType: {
        type: 'select',
        label: 'Media Type',
        options: [
          { label: 'Image', value: 'image' },
          { label: 'Video', value: 'video' },
          { label: 'Document', value: 'document' },
          { label: 'Audio', value: 'audio' },
        ],
        defaultValue: 'image',
      },
      mediaUrl: {
        type: 'text',
        label: 'Media URL',
        placeholder: 'https://example.com/media.jpg',
      },
      caption: {
        type: 'textarea',
        label: 'Caption',
        placeholder: 'Optional caption for the media...',
      },
      accessToken: {
        type: 'text',
        label: 'WhatsApp Access Token',
        placeholder: 'Your WhatsApp Business API token',
      },
    },
  },

  whatsappSendLocation: {
    type: 'whatsappSendLocation',
    icon: 'MessageSquare',
    category: 'communication',
    description: 'Send location coordinates via WhatsApp',
    config: {
      phoneNumber: {
        type: 'text',
        label: 'Phone Number',
        placeholder: '+1234567890',
      },
      latitude: {
        type: 'text',
        label: 'Latitude',
        placeholder: '40.7128',
      },
      longitude: {
        type: 'text',
        label: 'Longitude',
        placeholder: '-74.0060',
      },
      name: {
        type: 'text',
        label: 'Location Name',
        placeholder: 'Empire State Building',
      },
      address: {
        type: 'text',
        label: 'Address',
        placeholder: '350 Fifth Avenue, New York, NY 10118',
      },
      accessToken: {
        type: 'text',
        label: 'WhatsApp Access Token',
        placeholder: 'Your WhatsApp Business API token',
      },
    },
  },

  // TELEGRAM NODES
  telegramSendMessage: {
    type: 'telegramSendMessage',
    icon: 'Send',
    category: 'communication',
    description: 'Send text messages via Telegram Bot API',
    config: {
      chatId: {
        type: 'text',
        label: 'Chat ID',
        placeholder: '-1001234567890 or @channelname',
      },
      message: {
        type: 'textarea',
        label: 'Message',
        placeholder: 'Your message content...',
      },
      parseMode: {
        type: 'select',
        label: 'Parse Mode',
        options: [
          { label: 'None', value: '' },
          { label: 'Markdown', value: 'markdown' },
          { label: 'MarkdownV2', value: 'MarkdownV2' },
          { label: 'HTML', value: 'html' },
        ],
        defaultValue: '',
      },
      disableNotification: {
        type: 'boolean',
        label: 'Disable Notification',
        defaultValue: false,
      },
      botToken: {
        type: 'text',
        label: 'Bot Token',
        placeholder: '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ',
      },
    },
  },

  telegramSendPhoto: {
    type: 'telegramSendPhoto',
    icon: 'Send',
    category: 'communication',
    description: 'Send photos via Telegram Bot API',
    config: {
      chatId: {
        type: 'text',
        label: 'Chat ID',
        placeholder: '-1001234567890 or @channelname',
      },
      photoUrl: {
        type: 'text',
        label: 'Photo URL',
        placeholder: 'https://example.com/photo.jpg',
      },
      caption: {
        type: 'textarea',
        label: 'Caption',
        placeholder: 'Optional caption for the photo...',
      },
      parseMode: {
        type: 'select',
        label: 'Parse Mode',
        options: [
          { label: 'None', value: '' },
          { label: 'Markdown', value: 'markdown' },
          { label: 'MarkdownV2', value: 'MarkdownV2' },
          { label: 'HTML', value: 'html' },
        ],
        defaultValue: '',
      },
      botToken: {
        type: 'text',
        label: 'Bot Token',
        placeholder: '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ',
      },
    },
  },

  telegramBotCommand: {
    type: 'telegramBotCommand',
    icon: 'Send',
    category: 'communication',
    description: 'Set up bot commands for Telegram Bot',
    config: {
      command: {
        type: 'text',
        label: 'Command',
        placeholder: '/start',
      },
      description: {
        type: 'text',
        label: 'Description',
        placeholder: 'Start the bot',
      },
      botToken: {
        type: 'text',
        label: 'Bot Token',
        placeholder: '123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ',
      },
    },
  },

  // DISCORD SUB-NODES
  discordSendMessage: {
    type: 'discordSendMessage',
    icon: 'Send',
    category: 'communication',
    description: 'Send messages to Discord channels',
    config: {
      webhookUrl: {
        type: 'text',
        label: 'Webhook URL',
        placeholder: 'https://discord.com/api/webhooks/...',
      },
      content: {
        type: 'textarea',
        label: 'Message Content',
        placeholder: 'Your message content...',
      },
      username: {
        type: 'text',
        label: 'Bot Username',
        placeholder: 'Optional custom username',
      },
      avatarUrl: {
        type: 'text',
        label: 'Avatar URL',
        placeholder: 'Optional custom avatar URL',
      },
    },
  },

  discordSendEmbed: {
    type: 'discordSendEmbed',
    icon: 'Send',
    category: 'communication',
    description: 'Send rich embed messages to Discord',
    config: {
      webhookUrl: {
        type: 'text',
        label: 'Webhook URL',
        placeholder: 'https://discord.com/api/webhooks/...',
      },
      title: {
        type: 'text',
        label: 'Embed Title',
        placeholder: 'Embed title',
      },
      description: {
        type: 'textarea',
        label: 'Embed Description',
        placeholder: 'Embed description...',
      },
      color: {
        type: 'text',
        label: 'Embed Color (Hex)',
        placeholder: '#5865F2',
      },
      footerText: {
        type: 'text',
        label: 'Footer Text',
        placeholder: 'Optional footer text',
      },
    },
  },

  discordManageChannel: {
    type: 'discordManageChannel',
    icon: 'Send',
    category: 'communication',
    description: 'Manage Discord channels and permissions',
    config: {
      botToken: {
        type: 'text',
        label: 'Bot Token',
        placeholder: 'Your Discord bot token',
      },
      channelId: {
        type: 'text',
        label: 'Channel ID',
        placeholder: '1234567890',
      },
      action: {
        type: 'select',
        label: 'Action',
        options: [
          { label: 'Get Channel Info', value: 'getInfo' },
          { label: 'Edit Channel', value: 'edit' },
          { label: 'Delete Channel', value: 'delete' },
        ],
        defaultValue: 'getInfo',
      },
    },
  },

  // SLACK SUB-NODES
  slackSendMessage: {
    type: 'slackSendMessage',
    icon: 'Send',
    category: 'communication',
    description: 'Send messages to Slack channels',
    config: {
      webhookUrl: {
        type: 'text',
        label: 'Webhook URL',
        placeholder: 'https://hooks.slack.com/services/...',
      },
      channel: {
        type: 'text',
        label: 'Channel',
        placeholder: '#general',
      },
      text: {
        type: 'textarea',
        label: 'Message Text',
        placeholder: 'Your message...',
      },
      username: {
        type: 'text',
        label: 'Bot Username',
        placeholder: 'Optional custom username',
      },
      iconEmoji: {
        type: 'text',
        label: 'Icon Emoji',
        placeholder: ':ghost:',
      },
    },
  },

  slackUpdateMessage: {
    type: 'slackUpdateMessage',
    icon: 'Send',
    category: 'communication',
    description: 'Update existing Slack messages',
    config: {
      token: {
        type: 'text',
        label: 'Bot Token',
        placeholder: 'xoxb-your-token',
      },
      channel: {
        type: 'text',
        label: 'Channel ID',
        placeholder: 'C1234567890',
      },
      timestamp: {
        type: 'text',
        label: 'Message Timestamp',
        placeholder: '1234567890.123456',
      },
      text: {
        type: 'textarea',
        label: 'New Message Text',
        placeholder: 'Updated message...',
      },
    },
  },

  slackUploadFile: {
    type: 'slackUploadFile',
    icon: 'Send',
    category: 'communication',
    description: 'Upload files to Slack channels',
    config: {
      token: {
        type: 'text',
        label: 'Bot Token',
        placeholder: 'xoxb-your-token',
      },
      channel: {
        type: 'text',
        label: 'Channel',
        placeholder: '#general',
      },
      fileUrl: {
        type: 'text',
        label: 'File URL',
        placeholder: 'https://example.com/file.pdf',
      },
      filename: {
        type: 'text',
        label: 'Filename',
        placeholder: 'document.pdf',
      },
      title: {
        type: 'text',
        label: 'File Title',
        placeholder: 'Optional file title',
      },
      initialComment: {
        type: 'textarea',
        label: 'Initial Comment',
        placeholder: 'Optional comment with the file',
      },
    },
  },

  // TIKTOK SUB-NODES
  tiktokUploadVideo: {
    type: 'tiktokUploadVideo',
    icon: 'Music',
    category: 'communication',
    description: 'Upload videos to TikTok',
    config: {
      videoUrl: {
        type: 'text',
        label: 'Video URL',
        placeholder: 'https://example.com/video.mp4',
      },
      caption: {
        type: 'textarea',
        label: 'Caption',
        placeholder: 'Your TikTok caption with #hashtags...',
      },
      accessToken: {
        type: 'text',
        label: 'TikTok Access Token',
      },
    },
  },

  tiktokGetVideoInfo: {
    type: 'tiktokGetVideoInfo',
    icon: 'Music',
    category: 'communication',
    description: 'Get TikTok video information',
    config: {
      videoId: {
        type: 'text',
        label: 'Video ID',
        placeholder: '7123456789012345678',
      },
      accessToken: {
        type: 'text',
        label: 'TikTok Access Token',
      },
    },
  },

  tiktokGetUserInfo: {
    type: 'tiktokGetUserInfo',
    icon: 'Music',
    category: 'communication',
    description: 'Get TikTok user profile information',
    config: {
      username: {
        type: 'text',
        label: 'Username',
        placeholder: '@username',
      },
      accessToken: {
        type: 'text',
        label: 'TikTok Access Token',
      },
    },
  },

  // STREAMING PLATFORMS
  twitch: {
    type: 'twitch',
    icon: 'Radio',
    category: 'project',
    description: 'Twitch streaming platform integration',
    config: {
      operation: {
        type: 'select',
        label: 'Operation',
        options: [
          { label: 'Get Stream Info', value: 'getStream' },
          { label: 'Get User Info', value: 'getUser' },
          { label: 'Send Chat Message', value: 'sendMessage' },
          { label: 'Manage Stream', value: 'manageStream' },
        ],
        defaultValue: 'getStream',
      },
      channel: {
        type: 'text',
        label: 'Channel Name',
        placeholder: 'channelname',
      },
      accessToken: {
        type: 'text',
        label: 'Twitch Access Token',
      },
    },
  },

  youtube: {
    type: 'youtube',
    icon: 'Radio',
    category: 'project',
    description: 'YouTube videos, playlists, and analytics',
    config: {
      operation: {
        type: 'select',
        label: 'Operation',
        options: [
          { label: 'Upload Video', value: 'upload' },
          { label: 'Get Video Info', value: 'getVideo' },
          { label: 'List Videos', value: 'listVideos' },
          { label: 'Update Video', value: 'updateVideo' },
        ],
        defaultValue: 'getVideo',
      },
      videoId: {
        type: 'text',
        label: 'Video ID',
        placeholder: 'dQw4w9WgXcQ',
      },
      apiKey: {
        type: 'text',
        label: 'YouTube API Key',
      },
    },
  },

  kick: {
    type: 'kick',
    icon: 'Radio',
    category: 'project',
    description: 'Kick streaming platform integration',
    config: {
      operation: {
        type: 'select',
        label: 'Operation',
        options: [
          { label: 'Get Stream Info', value: 'getStream' },
          { label: 'Send Chat Message', value: 'sendMessage' },
        ],
        defaultValue: 'getStream',
      },
      channel: {
        type: 'text',
        label: 'Channel Name',
        placeholder: 'channelname',
      },
    },
  },

  snapchat: {
    type: 'snapchat',
    icon: 'Ghost',
    category: 'communication',
    description: 'Share Snaps and Stories on Snapchat',
    config: {
      operation: {
        type: 'select',
        label: 'Operation',
        options: [
          { label: 'Post Story', value: 'postStory' },
          { label: 'Send Snap', value: 'sendSnap' },
        ],
        defaultValue: 'postStory',
      },
      mediaUrl: {
        type: 'text',
        label: 'Media URL',
        placeholder: 'https://example.com/image.jpg',
      },
      accessToken: {
        type: 'text',
        label: 'Snapchat Access Token',
      },
    },
  },

  // AI/LLM NODES - NEW ONES ONLY
  anthropic: {
    type: 'anthropic',
    icon: 'Bot',
    category: 'ai',
    description: 'Anthropic Claude AI assistant',
    config: {
      model: {
        type: 'select',
        label: 'Model',
        options: [
          { label: 'Claude 3.7 Sonnet', value: 'claude-3-7-sonnet-20250219' },
          { label: 'Claude 3.5 Sonnet', value: 'claude-3-5-sonnet-20241022' },
          { label: 'Claude 3 Opus', value: 'claude-3-opus-20240229' },
          { label: 'Claude 3 Haiku', value: 'claude-3-haiku-20240307' },
        ],
        defaultValue: 'claude-3-5-sonnet-20241022',
      },
      systemPrompt: {
        type: 'codeEditor',
        label: 'System Prompt',
        defaultValue: 'You are a helpful assistant.',
      },
      userMessage: {
        type: 'text',
        label: 'User Message',
        placeholder: '{{ $json.message }}',
      },
      apiKey: {
        type: 'text',
        label: 'Anthropic API Key',
        placeholder: 'sk-ant-xxxxxxxxxxxx',
      },
      builtinTools: {
        type: 'aiBuiltinTools',
        label: 'Built-in Tools',
        tools: [
          { value: 'computerUse', label: 'Computer Use', description: 'Control mouse, keyboard and screen' },
          { value: 'textEditor', label: 'Text Editor', description: 'Read and write files on disk' },
          { value: 'bash', label: 'Bash', description: 'Execute shell commands' },
        ],
        defaultValue: {},
      },
      aiOptions: {
        type: 'aiOptions',
        label: 'Options',
        availableOptions: [
          { key: 'temperature', label: 'Temperature', inputType: 'number', min: 0, max: 1, step: 0.01, defaultValue: 1 },
          { key: 'maxTokens', label: 'Max Tokens', inputType: 'number', min: 1, defaultValue: 1024 },
          { key: 'topP', label: 'Top P', inputType: 'number', min: 0, max: 1, step: 0.01, defaultValue: 1 },
          { key: 'topK', label: 'Top K', inputType: 'number', min: 1, defaultValue: 40 },
          { key: 'stopSequences', label: 'Stop Sequences', inputType: 'text', placeholder: 'STOP,END' },
          { key: 'metadata', label: 'Metadata (JSON)', inputType: 'textarea', placeholder: '{"user_id": "{{ $json.userId }}"}' },
          { key: 'stream', label: 'Stream', inputType: 'boolean', defaultValue: false },
          { key: 'timeout', label: 'Timeout (ms)', inputType: 'number', min: 0, defaultValue: 30000 },
        ],
        defaultValue: {},
      },
    },
  },

  gemini: {
    type: 'gemini',
    icon: 'Bot',
    category: 'ai',
    description: 'Google Gemini AI models',
    config: {
      model: {
        type: 'select',
        label: 'Model',
        options: [
          { label: 'Gemini 2.0 Flash', value: 'gemini-2.0-flash' },
          { label: 'Gemini 1.5 Pro', value: 'gemini-1.5-pro' },
          { label: 'Gemini 1.5 Flash', value: 'gemini-1.5-flash' },
          { label: 'Gemini Pro', value: 'gemini-pro' },
        ],
        defaultValue: 'gemini-2.0-flash',
      },
      systemPrompt: {
        type: 'codeEditor',
        label: 'System Prompt',
        defaultValue: 'You are a helpful assistant.',
      },
      userMessage: {
        type: 'text',
        label: 'User Message',
        placeholder: '{{ $json.message }}',
      },
      apiKey: {
        type: 'text',
        label: 'Google AI API Key',
        placeholder: 'AIzaxxxxxxxxxxxxxxxxxx',
      },
      builtinTools: {
        type: 'aiBuiltinTools',
        label: 'Built-in Tools',
        tools: [
          { value: 'googleSearch', label: 'Google Search', description: 'Real-time web search via Google' },
          { value: 'codeExecution', label: 'Code Execution', description: 'Run Python code in a sandbox' },
        ],
        defaultValue: {},
      },
      aiOptions: {
        type: 'aiOptions',
        label: 'Options',
        availableOptions: [
          { key: 'temperature', label: 'Temperature', inputType: 'number', min: 0, max: 2, step: 0.01, defaultValue: 1 },
          { key: 'maxTokens', label: 'Max Output Tokens', inputType: 'number', min: 1, defaultValue: 2048 },
          { key: 'topP', label: 'Top P', inputType: 'number', min: 0, max: 1, step: 0.01, defaultValue: 1 },
          { key: 'topK', label: 'Top K', inputType: 'number', min: 1, defaultValue: 40 },
          { key: 'stopSequences', label: 'Stop Sequences', inputType: 'text', placeholder: 'STOP,END' },
          { key: 'stream', label: 'Stream', inputType: 'boolean', defaultValue: false },
          { key: 'timeout', label: 'Timeout (ms)', inputType: 'number', min: 0, defaultValue: 30000 },
        ],
        defaultValue: {},
      },
    },
  },

  perplexity: {
    type: 'perplexity',
    icon: 'Bot',
    category: 'ai',
    description: 'Perplexity AI search and reasoning',
    config: {
      model: {
        type: 'select',
        label: 'Model',
        options: [
          { label: 'Sonar Pro', value: 'sonar-pro' },
          { label: 'Sonar', value: 'sonar' },
          { label: 'Sonar Reasoning Pro', value: 'sonar-reasoning-pro' },
          { label: 'Sonar Reasoning', value: 'sonar-reasoning' },
        ],
        defaultValue: 'sonar-pro',
      },
      systemPrompt: {
        type: 'codeEditor',
        label: 'System Prompt',
        defaultValue: 'Be precise and concise.',
      },
      userMessage: {
        type: 'text',
        label: 'User Message',
        placeholder: '{{ $json.message }}',
      },
      apiKey: {
        type: 'text',
        label: 'Perplexity API Key',
        placeholder: 'pplx-xxxxxxxxxxxx',
      },
      builtinTools: {
        type: 'aiBuiltinTools',
        label: 'Built-in Tools',
        tools: [
          { value: 'webSearch', label: 'Web Search', description: 'Real-time internet search (always enabled)', alwaysOn: true },
        ],
        defaultValue: {},
      },
      aiOptions: {
        type: 'aiOptions',
        label: 'Options',
        availableOptions: [
          { key: 'maxTokens', label: 'Max Tokens', inputType: 'number', min: 1, defaultValue: 1024 },
          { key: 'temperature', label: 'Temperature', inputType: 'number', min: 0, max: 2, step: 0.01, defaultValue: 0.2 },
          { key: 'topP', label: 'Top P', inputType: 'number', min: 0, max: 1, step: 0.01, defaultValue: 0.9 },
          { key: 'returnCitations', label: 'Return Citations', inputType: 'boolean', defaultValue: true },
          { key: 'returnImages', label: 'Return Images', inputType: 'boolean', defaultValue: false },
          { key: 'searchDomainFilter', label: 'Search Domain Filter', inputType: 'text', placeholder: 'example.com,news.bbc.co.uk' },
          { key: 'stream', label: 'Stream', inputType: 'boolean', defaultValue: false },
        ],
        defaultValue: {},
      },
    },
  },

  glm: {
    type: 'glm',
    icon: 'Bot',
    category: 'ai',
    description: 'GLM (ChatGLM) AI models',
    config: {
      model: {
        type: 'select',
        label: 'Model',
        options: [
          { label: 'GLM-4-Air', value: 'glm-4-air' },
          { label: 'GLM-4-Flash', value: 'glm-4-flash' },
          { label: 'GLM-4-Plus', value: 'glm-4-plus' },
          { label: 'GLM-4', value: 'glm-4' },
        ],
        defaultValue: 'glm-4-air',
      },
      systemPrompt: {
        type: 'codeEditor',
        label: 'System Prompt',
        defaultValue: 'You are a helpful assistant.',
      },
      userMessage: {
        type: 'text',
        label: 'User Message',
        placeholder: '{{ $json.message }}',
      },
      apiKey: {
        type: 'text',
        label: 'ZhipuAI API Key',
        placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      },
      builtinTools: {
        type: 'aiBuiltinTools',
        label: 'Built-in Tools',
        tools: [
          { value: 'webSearch', label: 'Web Search', description: 'Real-time web search via ZhipuAI' },
          { value: 'codeInterpreter', label: 'Code Interpreter', description: 'Execute Python code' },
        ],
        defaultValue: {},
      },
      aiOptions: {
        type: 'aiOptions',
        label: 'Options',
        availableOptions: [
          { key: 'temperature', label: 'Temperature', inputType: 'number', min: 0.01, max: 0.99, step: 0.01, defaultValue: 0.95 },
          { key: 'maxTokens', label: 'Max Tokens', inputType: 'number', min: 1, defaultValue: 1024 },
          { key: 'topP', label: 'Top P', inputType: 'number', min: 0, max: 1, step: 0.01, defaultValue: 0.7 },
          { key: 'requestId', label: 'Request ID', inputType: 'text', placeholder: 'custom-request-id' },
          { key: 'stream', label: 'Stream', inputType: 'boolean', defaultValue: false },
        ],
        defaultValue: {},
      },
    },
  },

  openrouter: {
    type: 'openrouter',
    icon: 'Bot',
    category: 'ai',
    description: 'OpenRouter unified LLM API gateway',
    config: {
      model: {
        type: 'text',
        label: 'Model',
        placeholder: 'anthropic/claude-3-opus',
        defaultValue: 'openai/gpt-4o',
      },
      systemPrompt: {
        type: 'codeEditor',
        label: 'System Prompt',
        defaultValue: 'You are a helpful assistant.',
      },
      userMessage: {
        type: 'text',
        label: 'User Message',
        placeholder: '{{ $json.message }}',
      },
      apiKey: {
        type: 'text',
        label: 'OpenRouter API Key',
        placeholder: 'sk-or-xxxxxxxxxxxx',
      },
      builtinTools: {
        type: 'aiBuiltinTools',
        label: 'Built-in Tools',
        tools: [
          { value: 'webSearch', label: 'Web Search', description: 'Web search plugin (model-dependent)' },
          { value: 'codeInterpreter', label: 'Code Interpreter', description: 'Code execution plugin (model-dependent)' },
        ],
        defaultValue: {},
      },
      aiOptions: {
        type: 'aiOptions',
        label: 'Options',
        availableOptions: [
          { key: 'temperature', label: 'Temperature', inputType: 'number', min: 0, max: 2, step: 0.01, defaultValue: 1 },
          { key: 'maxTokens', label: 'Max Tokens', inputType: 'number', min: 1, defaultValue: 1024 },
          { key: 'topP', label: 'Top P', inputType: 'number', min: 0, max: 1, step: 0.01, defaultValue: 1 },
          { key: 'stopSequences', label: 'Stop Sequences', inputType: 'text', placeholder: 'STOP,END' },
          { key: 'siteName', label: 'Site Name', inputType: 'text', placeholder: 'My App' },
          { key: 'siteUrl', label: 'Site URL', inputType: 'text', placeholder: 'https://myapp.com' },
          { key: 'stream', label: 'Stream', inputType: 'boolean', defaultValue: false },
          { key: 'timeout', label: 'Timeout (ms)', inputType: 'number', min: 0, defaultValue: 30000 },
        ],
        defaultValue: {},
      },
    },
  },

  ollama: {
    type: 'ollama',
    icon: 'Bot',
    category: 'ai',
    description: 'Ollama local LLM models',
    config: {
      model: {
        type: 'text',
        label: 'Model',
        placeholder: 'llama3.2',
        defaultValue: 'llama3.2',
      },
      systemPrompt: {
        type: 'codeEditor',
        label: 'System Prompt',
        defaultValue: 'You are a helpful assistant.',
      },
      userMessage: {
        type: 'text',
        label: 'User Message',
        placeholder: '{{ $json.message }}',
      },
      baseUrl: {
        type: 'text',
        label: 'Ollama Base URL',
        defaultValue: 'http://localhost:11434',
      },
      aiOptions: {
        type: 'aiOptions',
        label: 'Options',
        availableOptions: [
          { key: 'temperature', label: 'Temperature', inputType: 'number', min: 0, max: 1, step: 0.01, defaultValue: 0.8 },
          { key: 'maxTokens', label: 'Max Tokens', inputType: 'number', min: 1, defaultValue: 2048 },
          { key: 'topP', label: 'Top P', inputType: 'number', min: 0, max: 1, step: 0.01, defaultValue: 0.9 },
          { key: 'contextWindow', label: 'Context Window', inputType: 'number', min: 512, defaultValue: 4096 },
          { key: 'repeatPenalty', label: 'Repeat Penalty', inputType: 'number', min: 0, max: 2, step: 0.01, defaultValue: 1.1 },
          { key: 'numa', label: 'NUMA', inputType: 'boolean', defaultValue: false },
          { key: 'stream', label: 'Stream', inputType: 'boolean', defaultValue: false },
        ],
        defaultValue: {},
      },
    },
  },

  // ADDITIONAL DATABASE/STORAGE NODES
  firebase: {
    type: 'firebase',
    icon: 'Database',
    category: 'database',
    description: 'Firebase Firestore and Realtime Database',
    config: {
      operation: {
        type: 'select',
        label: 'Operation',
        options: [
          { label: 'Get Document', value: 'get' },
          { label: 'Set Document', value: 'set' },
          { label: 'Update Document', value: 'update' },
          { label: 'Delete Document', value: 'delete' },
        ],
        defaultValue: 'get',
      },
      collection: {
        type: 'text',
        label: 'Collection',
        placeholder: 'users',
      },
      documentId: {
        type: 'text',
        label: 'Document ID',
        placeholder: 'user123',
      },
      serviceAccountJson: {
        type: 'textarea',
        label: 'Service Account JSON',
        placeholder: '{ "type": "service_account", ... }',
      },
    },
  },

  sqlite: {
    type: 'sqlite',
    icon: 'Database',
    category: 'database',
    description: 'SQLite lightweight embedded database',
    config: {
      operation: {
        type: 'select',
        label: 'Operation',
        options: [
          { label: 'Execute Query', value: 'executeQuery' },
          { label: 'Insert', value: 'insert' },
          { label: 'Update', value: 'update' },
          { label: 'Delete', value: 'delete' },
        ],
        defaultValue: 'executeQuery',
      },
      query: {
        type: 'textarea',
        label: 'SQL Query',
        placeholder: 'SELECT * FROM users',
      },
      databasePath: {
        type: 'text',
        label: 'Database File Path',
        placeholder: './data/database.sqlite',
      },
    },
  },

  s3: {
    type: 's3',
    icon: 'Cloud',
    category: 'storage',
    description: 'Amazon S3 object storage operations',
    config: {
      operation: {
        type: 'select',
        label: 'Operation',
        options: [
          { label: 'Upload', value: 'upload' },
          { label: 'Download', value: 'download' },
          { label: 'Delete', value: 'delete' },
          { label: 'List Objects', value: 'list' },
        ],
        defaultValue: 'upload',
      },
      bucket: {
        type: 'text',
        label: 'Bucket Name',
        placeholder: 'my-bucket',
      },
      key: {
        type: 'text',
        label: 'Object Key',
        placeholder: 'folder/file.txt',
      },
      region: {
        type: 'text',
        label: 'Region',
        defaultValue: 'us-east-1',
      },
      accessKeyId: {
        type: 'text',
        label: 'Access Key ID',
      },
      secretAccessKey: {
        type: 'text',
        label: 'Secret Access Key',
      },
    },
  },

  // LOGIC NODES - NEW
  loop: {
    type: 'loop',
    icon: 'RefreshCw',
    category: 'logic',
    description: 'Loop over items in batches — outputs "loop" while iterating, "done" when finished',
    config: {
      batchSize: {
        type: 'number',
        label: 'Batch Size',
        defaultValue: 1,
      },
      reset: {
        type: 'boolean',
        label: 'Reset',
        defaultValue: false,
      },
    },
  },

  date: {
    type: 'date',
    icon: 'Clock',
    category: 'logic',
    description: 'Format, parse, and manipulate dates',
    config: {
      operation: {
        type: 'select',
        label: 'Operation',
        options: [
          { label: 'Format Date', value: 'format' },
          { label: 'Parse Date', value: 'parse' },
          { label: 'Add/Subtract', value: 'calculate' },
          { label: 'Get Current Date', value: 'now' },
        ],
        defaultValue: 'format',
      },
      inputDate: {
        type: 'text',
        label: 'Input Date',
        placeholder: '2024-01-01 or {{ $json.date }}',
      },
      format: {
        type: 'text',
        label: 'Format',
        placeholder: 'YYYY-MM-DD HH:mm:ss',
        defaultValue: 'YYYY-MM-DD',
      },
    },
  },

  uuid: {
    type: 'uuid',
    icon: 'Hash',
    category: 'logic',
    description: 'Generate unique identifiers (UUID/GUID)',
    config: {
      version: {
        type: 'select',
        label: 'UUID Version',
        options: [
          { label: 'v4 (Random)', value: 'v4' },
          { label: 'v1 (Timestamp)', value: 'v1' },
          { label: 'v3 (MD5 namespace)', value: 'v3' },
          { label: 'v5 (SHA-1 namespace)', value: 'v5' },
        ],
        defaultValue: 'v4',
      },
      namespace: {
        type: 'text',
        label: 'Namespace (v3 & v5 only)',
        placeholder: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        description: 'DNS, URL, OID, X500 or custom UUID namespace',
      },
      name: {
        type: 'text',
        label: 'Name (v3 & v5 only)',
        placeholder: 'example.com',
        description: 'The name to hash with the namespace',
      },
    },
  },

  textFormatter: {
    type: 'textFormatter',
    icon: 'Edit',
    category: 'logic',
    description: 'Format and transform text strings',
    config: {
      operation: {
        type: 'select',
        label: 'Operation',
        options: [
          { label: 'Uppercase', value: 'uppercase' },
          { label: 'Lowercase', value: 'lowercase' },
          { label: 'Capitalize', value: 'capitalize' },
          { label: 'Trim', value: 'trim' },
          { label: 'Replace', value: 'replace' },
          { label: 'Extract', value: 'extract' },
        ],
        defaultValue: 'uppercase',
      },
      text: {
        type: 'textarea',
        label: 'System Text',
        placeholder: '{{ $json.text }}',
      },
      pattern: {
        type: 'text',
        label: 'Pattern (for replace/extract)',
        placeholder: 'regex or text',
      },
      replacement: {
        type: 'text',
        label: 'Replacement',
        placeholder: 'new text',
      },
    },
  },

  if: {
    type: 'if',
    icon: 'GitBranch',
    category: 'logic',
    description: 'Conditional branching — routes items to the True or False output based on conditions.',
    config: {
      conditions: {
        type: 'ifConditionsBuilder',
        label: 'Conditions',
        defaultValue: { combineWith: 'and', conditions: [] },
      },
    },
  },

  switch: {
    type: 'switch',
    icon: 'GitBranch',
    category: 'logic',
    description: 'Route data to different branches based on multiple conditions',
    config: {
      mode: {
        type: 'select',
        label: 'Mode',
        options: [
          { label: 'Expression', value: 'expression' },
        ],
        defaultValue: 'expression',
      },
      expression: {
        type: 'text',
        label: 'Expression',
        placeholder: '{{ $json.status }}',
      },
      fallbackOutput: {
        type: 'number',
        label: 'Fallback Output Index',
        placeholder: '0',
      },
    },
  },

  merge: {
    type: 'merge',
    icon: 'GitMerge',
    category: 'logic',
    description: 'Merge data from multiple branches into one',
    config: {
      inputCount: {
        type: 'select',
        label: 'Number of Inputs',
        options: [
          { label: '2 inputs', value: '2' },
          { label: '3 inputs', value: '3' },
          { label: '4 inputs', value: '4' },
          { label: '5 inputs', value: '5' },
          { label: '6 inputs', value: '6' },
          { label: '7 inputs', value: '7' },
          { label: '8 inputs', value: '8' },
        ],
        defaultValue: '2',
      },
      mode: {
        type: 'select',
        label: 'Merge Mode',
        options: [
          { label: 'Append', value: 'append' },
          { label: 'Combine', value: 'combine' },
          { label: 'Wait for all inputs', value: 'waitAll' },
        ],
        defaultValue: 'append',
      },
    },
  },

  code: {
    type: 'code',
    icon: 'Code',
    category: 'logic',
    description: 'Execute custom JavaScript, TypeScript, or Python code',
    config: {
      mode: {
        type: 'select',
        label: 'Mode',
        options: [
          { label: 'Run Once for All Items', value: 'runOnceForAllItems' },
          { label: 'Run Once for Each Item', value: 'runOnceForEachItem' },
        ],
        defaultValue: 'runOnceForEachItem',
      },
      language: {
        type: 'select',
        label: 'Language',
        options: [
          { label: 'JavaScript', value: 'javascript' },
          { label: 'TypeScript', value: 'typescript' },
          { label: 'Python (Native)', value: 'python' },
        ],
        defaultValue: 'javascript',
      },
      code: {
        type: 'codeEditor',
        label: 'Code',
        defaultValue: '',
      },
    },
  },

  // INSTAGRAM SUB-NODES
  instagramPost: {
    type: 'instagramPost',
    icon: 'Instagram',
    category: 'communication',
    description: 'Create Instagram feed posts',
    config: {
      caption: {
        type: 'textarea',
        label: 'Caption',
        placeholder: 'Your post caption with #hashtags...',
      },
      mediaUrl: {
        type: 'text',
        label: 'Media URL',
        placeholder: 'https://example.com/image.jpg',
      },
      accessToken: {
        type: 'text',
        label: 'Instagram Access Token',
      },
    },
  },

  instagramStory: {
    type: 'instagramStory',
    icon: 'Instagram',
    category: 'communication',
    description: 'Post Instagram Stories',
    config: {
      mediaUrl: {
        type: 'text',
        label: 'Media URL',
        placeholder: 'https://example.com/story.jpg',
      },
      accessToken: {
        type: 'text',
        label: 'Instagram Access Token',
      },
    },
  },

  instagramReels: {
    type: 'instagramReels',
    icon: 'Instagram',
    category: 'communication',
    description: 'Post Instagram Reels',
    config: {
      videoUrl: {
        type: 'text',
        label: 'Video URL',
        placeholder: 'https://example.com/reel.mp4',
      },
      caption: {
        type: 'textarea',
        label: 'Caption',
        placeholder: 'Your reel caption...',
      },
      accessToken: {
        type: 'text',
        label: 'Instagram Access Token',
      },
    },
  },

  // FACEBOOK SUB-NODES
  facebookPost: {
    type: 'facebookPost',
    icon: 'Facebook',
    category: 'communication',
    description: 'Create Facebook posts',
    config: {
      message: {
        type: 'textarea',
        label: 'Message',
        placeholder: 'Your post message...',
      },
      accessToken: {
        type: 'text',
        label: 'Facebook Access Token',
      },
    },
  },

  facebookUploadPhoto: {
    type: 'facebookUploadPhoto',
    icon: 'Facebook',
    category: 'communication',
    description: 'Upload photos to Facebook',
    config: {
      photoUrl: {
        type: 'text',
        label: 'Photo URL',
        placeholder: 'https://example.com/photo.jpg',
      },
      caption: {
        type: 'textarea',
        label: 'Caption',
        placeholder: 'Photo caption...',
      },
      accessToken: {
        type: 'text',
        label: 'Facebook Access Token',
      },
    },
  },

  facebookPagePost: {
    type: 'facebookPagePost',
    icon: 'Facebook',
    category: 'communication',
    description: 'Post to Facebook pages',
    config: {
      pageId: {
        type: 'text',
        label: 'Page ID',
      },
      message: {
        type: 'textarea',
        label: 'Message',
        placeholder: 'Your post message...',
      },
      accessToken: {
        type: 'text',
        label: 'Facebook Page Access Token',
      },
    },
  },

  // TWITTER SUB-NODES
  twitterTweet: {
    type: 'twitterTweet',
    icon: 'Twitter',
    category: 'communication',
    description: 'Post tweets on Twitter/X',
    config: {
      text: {
        type: 'textarea',
        label: 'Tweet Text',
        placeholder: 'Your tweet text...',
      },
      accessToken: {
        type: 'text',
        label: 'Twitter Access Token',
      },
    },
  },

  twitterReply: {
    type: 'twitterReply',
    icon: 'Twitter',
    category: 'communication',
    description: 'Reply to tweets',
    config: {
      tweetId: {
        type: 'text',
        label: 'Tweet ID to reply to',
      },
      text: {
        type: 'textarea',
        label: 'Reply Text',
        placeholder: 'Your reply...',
      },
      accessToken: {
        type: 'text',
        label: 'Twitter Access Token',
      },
    },
  },

  twitterLike: {
    type: 'twitterLike',
    icon: 'Twitter',
    category: 'communication',
    description: 'Like tweets',
    config: {
      tweetId: {
        type: 'text',
        label: 'Tweet ID',
      },
      accessToken: {
        type: 'text',
        label: 'Twitter Access Token',
      },
    },
  },

  twitterRetweet: {
    type: 'twitterRetweet',
    icon: 'Twitter',
    category: 'communication',
    description: 'Retweet tweets',
    config: {
      tweetId: {
        type: 'text',
        label: 'Tweet ID',
      },
      accessToken: {
        type: 'text',
        label: 'Twitter Access Token',
      },
    },
  },

  // LINKEDIN SUB-NODES
  linkedinPost: {
    type: 'linkedinPost',
    icon: 'LinkedIn',
    category: 'communication',
    description: 'Create LinkedIn posts',
    config: {
      text: {
        type: 'textarea',
        label: 'Post Text',
        placeholder: 'Your LinkedIn post...',
      },
      accessToken: {
        type: 'text',
        label: 'LinkedIn Access Token',
      },
    },
  },

  linkedinShareArticle: {
    type: 'linkedinShareArticle',
    icon: 'LinkedIn',
    category: 'communication',
    description: 'Share articles on LinkedIn',
    config: {
      articleUrl: {
        type: 'text',
        label: 'Article URL',
        placeholder: 'https://example.com/article',
      },
      comment: {
        type: 'textarea',
        label: 'Comment',
        placeholder: 'Your comment on the article...',
      },
      accessToken: {
        type: 'text',
        label: 'LinkedIn Access Token',
      },
    },
  },

  linkedinMessage: {
    type: 'linkedinMessage',
    icon: 'LinkedIn',
    category: 'communication',
    description: 'Send LinkedIn messages',
    config: {
      recipientId: {
        type: 'text',
        label: 'Recipient LinkedIn ID',
      },
      message: {
        type: 'textarea',
        label: 'Message',
        placeholder: 'Your message...',
      },
      accessToken: {
        type: 'text',
        label: 'LinkedIn Access Token',
      },
    },
  },

  // --- TRIGGERS MANQUANTS ---------------------------------------------------

  schedule: {
    type: 'schedule',
    icon: 'Clock',
    category: 'trigger',
    description: 'Déclenche le workflow à intervalles réguliers',
    config: {
      interval: {
        type: 'select',
        label: 'Interval (preset)',
        options: [
          { label: 'Every minute', value: 'everyMinute' },
          { label: 'Every 5 minutes', value: 'every5Minutes' },
          { label: 'Every 15 minutes', value: 'every15Minutes' },
          { label: 'Every 30 minutes', value: 'every30Minutes' },
          { label: 'Every hour', value: 'everyHour' },
          { label: 'Every 6 hours', value: 'every6Hours' },
          { label: 'Every 12 hours', value: 'every12Hours' },
          { label: 'Every day', value: 'everyDay' },
          { label: 'Every week', value: 'everyWeek' },
          { label: 'Every month', value: 'everyMonth' },
          { label: 'Custom', value: 'custom' },
        ],
        defaultValue: 'everyHour',
      },
      customInterval: {
        type: 'text',
        label: 'Custom Interval',
        placeholder: '16s, 8min, 8h, 4d, 3w, 3m',
        description: 'Used only when "Custom" is selected above. Format: 30s, 10min, 6h, 2d, 1w, 2m',
      },
      timezone: {
        type: 'select',
        label: 'Timezone',
        defaultValue: 'UTC',
        options: [
          { label: 'UTC', value: 'UTC' },
          // Africa
          { label: 'Africa/Abidjan (GMT+0)', value: 'Africa/Abidjan' },
          { label: 'Africa/Accra (GMT+0)', value: 'Africa/Accra' },
          { label: 'Africa/Addis_Ababa (GMT+3)', value: 'Africa/Addis_Ababa' },
          { label: 'Africa/Algiers (GMT+1)', value: 'Africa/Algiers' },
          { label: 'Africa/Cairo (GMT+2)', value: 'Africa/Cairo' },
          { label: 'Africa/Casablanca (GMT+1)', value: 'Africa/Casablanca' },
          { label: 'Africa/Dakar (GMT+0)', value: 'Africa/Dakar' },
          { label: 'Africa/Dar_es_Salaam (GMT+3)', value: 'Africa/Dar_es_Salaam' },
          { label: 'Africa/Harare (GMT+2)', value: 'Africa/Harare' },
          { label: 'Africa/Johannesburg (GMT+2)', value: 'Africa/Johannesburg' },
          { label: 'Africa/Kampala (GMT+3)', value: 'Africa/Kampala' },
          { label: 'Africa/Khartoum (GMT+3)', value: 'Africa/Khartoum' },
          { label: 'Africa/Kinshasa (GMT+1)', value: 'Africa/Kinshasa' },
          { label: 'Africa/Lagos (GMT+1)', value: 'Africa/Lagos' },
          { label: 'Africa/Luanda (GMT+1)', value: 'Africa/Luanda' },
          { label: 'Africa/Lusaka (GMT+2)', value: 'Africa/Lusaka' },
          { label: 'Africa/Maputo (GMT+2)', value: 'Africa/Maputo' },
          { label: 'Africa/Mogadishu (GMT+3)', value: 'Africa/Mogadishu' },
          { label: 'Africa/Nairobi (GMT+3)', value: 'Africa/Nairobi' },
          { label: 'Africa/Tripoli (GMT+2)', value: 'Africa/Tripoli' },
          { label: 'Africa/Tunis (GMT+1)', value: 'Africa/Tunis' },
          { label: 'Africa/Windhoek (GMT+2)', value: 'Africa/Windhoek' },
          // America
          { label: 'America/Anchorage (GMT-9)', value: 'America/Anchorage' },
          { label: 'America/Asuncion (GMT-3)', value: 'America/Asuncion' },
          { label: 'America/Barbados (GMT-4)', value: 'America/Barbados' },
          { label: 'America/Bogota (GMT-5)', value: 'America/Bogota' },
          { label: 'America/Buenos_Aires (GMT-3)', value: 'America/Argentina/Buenos_Aires' },
          { label: 'America/Cancun (GMT-6)', value: 'America/Cancun' },
          { label: 'America/Caracas (GMT-4)', value: 'America/Caracas' },
          { label: 'America/Chicago (GMT-6)', value: 'America/Chicago' },
          { label: 'America/Denver (GMT-7)', value: 'America/Denver' },
          { label: 'America/Edmonton (GMT-7)', value: 'America/Edmonton' },
          { label: 'America/El_Salvador (GMT-6)', value: 'America/El_Salvador' },
          { label: 'America/Godthab / Nuuk (GMT-3)', value: 'America/Godthab' },
          { label: 'America/Guatemala (GMT-6)', value: 'America/Guatemala' },
          { label: 'America/Guayaquil (GMT-5)', value: 'America/Guayaquil' },
          { label: 'America/Halifax (GMT-4)', value: 'America/Halifax' },
          { label: 'America/Havana (GMT-5)', value: 'America/Havana' },
          { label: 'America/Jamaica (GMT-5)', value: 'America/Jamaica' },
          { label: 'America/La_Paz (GMT-4)', value: 'America/La_Paz' },
          { label: 'America/Lima (GMT-5)', value: 'America/Lima' },
          { label: 'America/Los_Angeles (GMT-8)', value: 'America/Los_Angeles' },
          { label: 'America/Managua (GMT-6)', value: 'America/Managua' },
          { label: 'America/Manaus (GMT-4)', value: 'America/Manaus' },
          { label: 'America/Mexico_City (GMT-6)', value: 'America/Mexico_City' },
          { label: 'America/Miami (GMT-5)', value: 'America/New_York' },
          { label: 'America/Montevideo (GMT-3)', value: 'America/Montevideo' },
          { label: 'America/New_York (GMT-5)', value: 'America/New_York' },
          { label: 'America/Panama (GMT-5)', value: 'America/Panama' },
          { label: 'America/Phoenix (GMT-7)', value: 'America/Phoenix' },
          { label: 'America/Port-au-Prince (GMT-5)', value: 'America/Port-au-Prince' },
          { label: 'America/Puerto_Rico (GMT-4)', value: 'America/Puerto_Rico' },
          { label: 'America/Regina (GMT-6)', value: 'America/Regina' },
          { label: 'America/Santiago (GMT-3)', value: 'America/Santiago' },
          { label: 'America/Santo_Domingo (GMT-4)', value: 'America/Santo_Domingo' },
          { label: 'America/Sao_Paulo (GMT-3)', value: 'America/Sao_Paulo' },
          { label: 'America/St_Johns (GMT-3:30)', value: 'America/St_Johns' },
          { label: 'America/Tegucigalpa (GMT-6)', value: 'America/Tegucigalpa' },
          { label: 'America/Tijuana (GMT-8)', value: 'America/Tijuana' },
          { label: 'America/Toronto (GMT-5)', value: 'America/Toronto' },
          { label: 'America/Vancouver (GMT-8)', value: 'America/Vancouver' },
          { label: 'America/Winnipeg (GMT-6)', value: 'America/Winnipeg' },
          // Asia
          { label: 'Asia/Almaty (GMT+6)', value: 'Asia/Almaty' },
          { label: 'Asia/Amman (GMT+3)', value: 'Asia/Amman' },
          { label: 'Asia/Baghdad (GMT+3)', value: 'Asia/Baghdad' },
          { label: 'Asia/Baku (GMT+4)', value: 'Asia/Baku' },
          { label: 'Asia/Bangkok (GMT+7)', value: 'Asia/Bangkok' },
          { label: 'Asia/Beirut (GMT+3)', value: 'Asia/Beirut' },
          { label: 'Asia/Colombo (GMT+5:30)', value: 'Asia/Colombo' },
          { label: 'Asia/Damascus (GMT+3)', value: 'Asia/Damascus' },
          { label: 'Asia/Dhaka (GMT+6)', value: 'Asia/Dhaka' },
          { label: 'Asia/Dubai (GMT+4)', value: 'Asia/Dubai' },
          { label: 'Asia/Ho_Chi_Minh (GMT+7)', value: 'Asia/Ho_Chi_Minh' },
          { label: 'Asia/Hong_Kong (GMT+8)', value: 'Asia/Hong_Kong' },
          { label: 'Asia/Jakarta (GMT+7)', value: 'Asia/Jakarta' },
          { label: 'Asia/Jerusalem (GMT+2)', value: 'Asia/Jerusalem' },
          { label: 'Asia/Kabul (GMT+4:30)', value: 'Asia/Kabul' },
          { label: 'Asia/Karachi (GMT+5)', value: 'Asia/Karachi' },
          { label: 'Asia/Kathmandu (GMT+5:45)', value: 'Asia/Kathmandu' },
          { label: 'Asia/Kolkata (GMT+5:30)', value: 'Asia/Kolkata' },
          { label: 'Asia/Krasnoyarsk (GMT+7)', value: 'Asia/Krasnoyarsk' },
          { label: 'Asia/Kuala_Lumpur (GMT+8)', value: 'Asia/Kuala_Lumpur' },
          { label: 'Asia/Kuwait (GMT+3)', value: 'Asia/Kuwait' },
          { label: 'Asia/Macau (GMT+8)', value: 'Asia/Macau' },
          { label: 'Asia/Magadan (GMT+11)', value: 'Asia/Magadan' },
          { label: 'Asia/Manila (GMT+8)', value: 'Asia/Manila' },
          { label: 'Asia/Muscat (GMT+4)', value: 'Asia/Muscat' },
          { label: 'Asia/Novosibirsk (GMT+7)', value: 'Asia/Novosibirsk' },
          { label: 'Asia/Omsk (GMT+6)', value: 'Asia/Omsk' },
          { label: 'Asia/Riyadh (GMT+3)', value: 'Asia/Riyadh' },
          { label: 'Asia/Seoul (GMT+9)', value: 'Asia/Seoul' },
          { label: 'Asia/Shanghai (GMT+8)', value: 'Asia/Shanghai' },
          { label: 'Asia/Singapore (GMT+8)', value: 'Asia/Singapore' },
          { label: 'Asia/Taipei (GMT+8)', value: 'Asia/Taipei' },
          { label: 'Asia/Tashkent (GMT+5)', value: 'Asia/Tashkent' },
          { label: 'Asia/Tbilisi (GMT+4)', value: 'Asia/Tbilisi' },
          { label: 'Asia/Tehran (GMT+3:30)', value: 'Asia/Tehran' },
          { label: 'Asia/Tokyo (GMT+9)', value: 'Asia/Tokyo' },
          { label: 'Asia/Ulaanbaatar (GMT+8)', value: 'Asia/Ulaanbaatar' },
          { label: 'Asia/Vladivostok (GMT+10)', value: 'Asia/Vladivostok' },
          { label: 'Asia/Yakutsk (GMT+9)', value: 'Asia/Yakutsk' },
          { label: 'Asia/Yangon (GMT+6:30)', value: 'Asia/Yangon' },
          { label: 'Asia/Yekaterinburg (GMT+5)', value: 'Asia/Yekaterinburg' },
          { label: 'Asia/Yerevan (GMT+4)', value: 'Asia/Yerevan' },
          // Atlantic
          { label: 'Atlantic/Azores (GMT-1)', value: 'Atlantic/Azores' },
          { label: 'Atlantic/Canary (GMT+0)', value: 'Atlantic/Canary' },
          { label: 'Atlantic/Cape_Verde (GMT-1)', value: 'Atlantic/Cape_Verde' },
          { label: 'Atlantic/Reykjavik (GMT+0)', value: 'Atlantic/Reykjavik' },
          // Australia
          { label: 'Australia/Adelaide (GMT+9:30)', value: 'Australia/Adelaide' },
          { label: 'Australia/Brisbane (GMT+10)', value: 'Australia/Brisbane' },
          { label: 'Australia/Darwin (GMT+9:30)', value: 'Australia/Darwin' },
          { label: 'Australia/Hobart (GMT+11)', value: 'Australia/Hobart' },
          { label: 'Australia/Melbourne (GMT+11)', value: 'Australia/Melbourne' },
          { label: 'Australia/Perth (GMT+8)', value: 'Australia/Perth' },
          { label: 'Australia/Sydney (GMT+11)', value: 'Australia/Sydney' },
          // Europe
          { label: 'Europe/Amsterdam (GMT+1)', value: 'Europe/Amsterdam' },
          { label: 'Europe/Athens (GMT+2)', value: 'Europe/Athens' },
          { label: 'Europe/Belgrade (GMT+1)', value: 'Europe/Belgrade' },
          { label: 'Europe/Berlin (GMT+1)', value: 'Europe/Berlin' },
          { label: 'Europe/Brussels (GMT+1)', value: 'Europe/Brussels' },
          { label: 'Europe/Bucharest (GMT+2)', value: 'Europe/Bucharest' },
          { label: 'Europe/Budapest (GMT+1)', value: 'Europe/Budapest' },
          { label: 'Europe/Copenhagen (GMT+1)', value: 'Europe/Copenhagen' },
          { label: 'Europe/Dublin (GMT+0)', value: 'Europe/Dublin' },
          { label: 'Europe/Helsinki (GMT+2)', value: 'Europe/Helsinki' },
          { label: 'Europe/Istanbul (GMT+3)', value: 'Europe/Istanbul' },
          { label: 'Europe/Kaliningrad (GMT+2)', value: 'Europe/Kaliningrad' },
          { label: 'Europe/Kiev (GMT+2)', value: 'Europe/Kiev' },
          { label: 'Europe/Lisbon (GMT+0)', value: 'Europe/Lisbon' },
          { label: 'Europe/London (GMT+0)', value: 'Europe/London' },
          { label: 'Europe/Luxembourg (GMT+1)', value: 'Europe/Luxembourg' },
          { label: 'Europe/Madrid (GMT+1)', value: 'Europe/Madrid' },
          { label: 'Europe/Malta (GMT+1)', value: 'Europe/Malta' },
          { label: 'Europe/Minsk (GMT+3)', value: 'Europe/Minsk' },
          { label: 'Europe/Monaco (GMT+1)', value: 'Europe/Monaco' },
          { label: 'Europe/Moscow (GMT+3)', value: 'Europe/Moscow' },
          { label: 'Europe/Oslo (GMT+1)', value: 'Europe/Oslo' },
          { label: 'Europe/Paris (GMT+1)', value: 'Europe/Paris' },
          { label: 'Europe/Prague (GMT+1)', value: 'Europe/Prague' },
          { label: 'Europe/Riga (GMT+2)', value: 'Europe/Riga' },
          { label: 'Europe/Rome (GMT+1)', value: 'Europe/Rome' },
          { label: 'Europe/Samara (GMT+4)', value: 'Europe/Samara' },
          { label: 'Europe/Sofia (GMT+2)', value: 'Europe/Sofia' },
          { label: 'Europe/Stockholm (GMT+1)', value: 'Europe/Stockholm' },
          { label: 'Europe/Tallinn (GMT+2)', value: 'Europe/Tallinn' },
          { label: 'Europe/Vienna (GMT+1)', value: 'Europe/Vienna' },
          { label: 'Europe/Vilnius (GMT+2)', value: 'Europe/Vilnius' },
          { label: 'Europe/Warsaw (GMT+1)', value: 'Europe/Warsaw' },
          { label: 'Europe/Zurich (GMT+1)', value: 'Europe/Zurich' },
          // Indian
          { label: 'Indian/Maldives (GMT+5)', value: 'Indian/Maldives' },
          { label: 'Indian/Mauritius (GMT+4)', value: 'Indian/Mauritius' },
          { label: 'Indian/Reunion (GMT+4)', value: 'Indian/Reunion' },
          // Pacific
          { label: 'Pacific/Auckland (GMT+13)', value: 'Pacific/Auckland' },
          { label: 'Pacific/Chatham (GMT+13:45)', value: 'Pacific/Chatham' },
          { label: 'Pacific/Easter (GMT-5)', value: 'Pacific/Easter' },
          { label: 'Pacific/Fiji (GMT+12)', value: 'Pacific/Fiji' },
          { label: 'Pacific/Guam (GMT+10)', value: 'Pacific/Guam' },
          { label: 'Pacific/Honolulu (GMT-10)', value: 'Pacific/Honolulu' },
          { label: 'Pacific/Noumea (GMT+11)', value: 'Pacific/Noumea' },
          { label: 'Pacific/Pago_Pago (GMT-11)', value: 'Pacific/Pago_Pago' },
          { label: 'Pacific/Port_Moresby (GMT+10)', value: 'Pacific/Port_Moresby' },
          { label: 'Pacific/Tahiti (GMT-10)', value: 'Pacific/Tahiti' },
          { label: 'Pacific/Tongatapu (GMT+13)', value: 'Pacific/Tongatapu' },
        ],
      },
    },
  },

  onSuccessFailure: {
    type: 'onSuccessFailure',
    icon: 'Activity',
    category: 'trigger',
    description: 'D�clenche quand un n�ud pr�c�dent r�ussit ou �choue',
    config: {
      event: {
        type: 'select',
        label: 'Event',
        options: [
          { label: 'On Success', value: 'success' },
          { label: 'On Failure', value: 'failure' },
          { label: 'On Both', value: 'both' },
        ],
        defaultValue: 'failure',
      },
      targetNodeId: {
        type: 'text',
        label: 'Target Node ID (optional)',
        placeholder: 'Leave empty to monitor any node',
      },
    },
  },

  // --- LOGIC & DATA MANQUANTS -----------------------------------------------

  editFields: {
    type: 'editFields',
    icon: 'Edit',
    category: 'logic',
    description: 'Ajoute, modifie, renomme ou supprime des champs dans les items',
    config: {
      mode: {
        type: 'select',
        label: 'Mode',
        options: [
          { label: 'Manual Mapping', value: 'manual' },
          { label: 'Expression', value: 'expression' },
        ],
        defaultValue: 'manual',
      },
      fields: {
        type: 'textarea',
        label: 'Fields (JSON)',
        placeholder: '[{"name": "newField", "value": "{{ $json.oldField }}"}]',
      },
      keepOnlySet: {
        type: 'boolean',
        label: 'Keep Only Set Fields',
        defaultValue: false,
      },
    },
  },

  filter: {
    type: 'filter',
    icon: 'Filter',
    category: 'logic',
    description: 'Filtre les items en ne gardant que ceux qui correspondent à une condition',
    config: {
      conditions: {
        type: 'filterBuilder',
        label: 'Conditions',
        defaultValue: { combineConditions: 'and', conditions: [] },
      },
      convertTypes: {
        type: 'boolean',
        label: 'Convert types where required',
        defaultValue: false,
      },
      options: {
        type: 'select',
        label: 'Options',
        options: [
          { label: '—', value: '' },
          { label: 'Ignore case', value: 'ignoreCase' },
        ],
        defaultValue: '',
      },
    },
  },

  splitInBatches: {
    type: 'splitInBatches',
    icon: 'Grid',
    category: 'logic',
    description: 'D�coupe les items en lots pour traitement par batch',
    config: {
      batchSize: {
        type: 'number',
        label: 'Batch Size',
        defaultValue: 10,
      },
      options: {
        type: 'select',
        label: 'Reset',
        options: [
          { label: 'Continue', value: 'continue' },
          { label: 'Reset', value: 'reset' },
        ],
        defaultValue: 'continue',
      },
    },
  },

  sort: {
    type: 'sort',
    icon: 'ArrowUpDown',
    category: 'logic',
    description: 'Trie les items selon un ou plusieurs champs',
    config: {
      sortConfig: {
        type: 'sortBuilder',
        label: 'Sort Configuration',
        defaultValue: { sortType: 'simple', fields: [], disableDotNotation: false },
      },
    },
  },

  limit: {
    type: 'limit',
    icon: 'Hash',
    category: 'logic',
    description: 'Limite le nombre d\'items en sortie',
    config: {
      maxItems: {
        type: 'number',
        label: 'Max Items',
        defaultValue: 100,
      },
      keepFromStart: {
        type: 'select',
        label: 'Keep From',
        options: [
          { label: 'Start', value: 'start' },
          { label: 'End', value: 'end' },
        ],
        defaultValue: 'start',
      },
    },
  },

  wait: {
    type: 'wait',
    icon: 'Clock',
    category: 'logic',
    description: 'Met le workflow en pause pendant une dur�e d�finie',
    config: {
      resumeMode: {
        type: 'select',
        label: 'Resume Mode',
        options: [
          { label: 'After Time Interval', value: 'timeInterval' },
          { label: 'At Specific Time', value: 'specificTime' },
          { label: 'On Webhook Call', value: 'webhook' },
        ],
        defaultValue: 'timeInterval',
      },
      amount: {
        type: 'number',
        label: 'Amount',
        defaultValue: 5,
      },
      unit: {
        type: 'select',
        label: 'Unit',
        options: [
          { label: 'Seconds', value: 'seconds' },
          { label: 'Minutes', value: 'minutes' },
          { label: 'Hours', value: 'hours' },
          { label: 'Days', value: 'days' },
        ],
        defaultValue: 'seconds',
      },
    },
  },

  executeWorkflow: {
    type: 'executeWorkflow',
    icon: 'PlaySquare',
    category: 'logic',
    description: 'Exécute un autre workflow et retourne son résultat',
    config: {
      workflowId: {
        type: 'workflowSelect',
        label: 'Workflow',
        defaultValue: '',
      },
      mode: {
        type: 'select',
        label: 'Execution Mode',
        options: [
          { label: 'Wait for result', value: 'wait' },
          { label: 'Fire and forget', value: 'async' },
        ],
        defaultValue: 'wait',
      },
      passData: {
        type: 'boolean',
        label: 'Pass Current Data',
        defaultValue: true,
      },
    },
  },

  errorTrigger: {
    type: 'errorTrigger',
    icon: 'AlertCircle',
    category: 'trigger',
    description: 'D�clenche un workflow de gestion d\'erreur quand un workflow �choue',
    config: {
      workflowId: {
        type: 'text',
        label: 'Source Workflow ID (optional)',
        placeholder: 'Leave empty to catch all workflow errors',
      },
    },
  },

  // --- HTTP & DATA MANQUANTS ------------------------------------------------

  htmlExtract: {
    type: 'htmlExtract',
    icon: 'Globe',
    category: 'logic',
    description: 'Extrait des donn�es depuis du HTML (web scraping avec s�lecteurs CSS)',
    config: {
      sourceData: {
        type: 'select',
        label: 'Source Data',
        options: [
          { label: 'URL', value: 'url' },
          { label: 'HTML String (from previous node)', value: 'html' },
        ],
        defaultValue: 'url',
      },
      url: {
        type: 'text',
        label: 'URL',
        placeholder: 'https://example.com/page',
      },
      selector: {
        type: 'text',
        label: 'CSS Selector',
        placeholder: '.article h1, #main-content p',
      },
      extractAttribute: {
        type: 'text',
        label: 'Extract Attribute (optional)',
        placeholder: 'href, src, data-id (leave empty for text content)',
      },
      returnArray: {
        type: 'boolean',
        label: 'Return Array',
        defaultValue: true,
      },
    },
  },

  rssRead: {
    type: 'rssRead',
    icon: 'Rss',
    category: 'logic',
    description: 'Lit et parse des flux RSS/Atom pour r�cup�rer des articles',
    config: {
      url: {
        type: 'text',
        label: 'RSS Feed URL',
        placeholder: 'https://feeds.example.com/rss.xml',
      },
      limit: {
        type: 'number',
        label: 'Max Items',
        defaultValue: 10,
      },
      filterByDate: {
        type: 'boolean',
        label: 'Filter Recent Items Only',
        defaultValue: false,
      },
      since: {
        type: 'text',
        label: 'Since (hours ago)',
        placeholder: '24',
      },
    },
  },

  ftp: {
    type: 'ftp',
    icon: 'Upload',
    category: 'logic',
    description: 'FTP/FTPS/SFTP operations - upload, download, list, delete files',
    config: {
      ftpConfig: {
        type: 'ftpBuilder',
        label: 'FTP Configuration',
        defaultValue: {
          operation: 'upload',
          protocol: 'ftp',
          host: '',
          port: 21,
          user: '',
          password: '',
          remotePath: '/',
        },
      },
    },
  },
  ssh: {
    type: 'ssh',
    icon: 'Terminal',
    category: 'logic',
    description: 'Ex�cute des commandes SSH sur des serveurs distants',
    config: {
      host: {
        type: 'text',
        label: 'Host',
        placeholder: 'server.example.com',
      },
      port: {
        type: 'number',
        label: 'Port',
        defaultValue: 22,
      },
      username: {
        type: 'text',
        label: 'Username',
        placeholder: 'ubuntu',
      },
      authType: {
        type: 'select',
        label: 'Auth Type',
        options: [
          { label: 'Password', value: 'password' },
          { label: 'Private Key', value: 'privateKey' },
        ],
        defaultValue: 'password',
      },
      password: {
        type: 'text',
        label: 'Password',
      },
      privateKey: {
        type: 'textarea',
        label: 'Private Key',
        placeholder: '-----BEGIN RSA PRIVATE KEY-----\n...',
      },
      command: {
        type: 'textarea',
        label: 'Command',
        placeholder: 'ls -la /var/www',
      },
    },
  },

  // --- DATABASE MANQUANTS ---------------------------------------------------

  postgreSQL: {
    type: 'postgreSQL',
    icon: 'Database',
    category: 'database',
    description: 'PostgreSQL � requ�tes SQL avanc�es avec support JSON',
    config: {
      operation: {
        type: 'select',
        label: 'Operation',
        options: [
          { label: 'Execute Query', value: 'executeQuery' },
          { label: 'Insert', value: 'insert' },
          { label: 'Update', value: 'update' },
          { label: 'Delete', value: 'delete' },
          { label: 'Select', value: 'select' },
        ],
        defaultValue: 'executeQuery',
      },
      query: {
        type: 'sqlQueryBuilder',
        label: 'SQL Query',
        placeholder: 'SELECT * FROM users WHERE id = $1',
        defaultValue: { mode: 'builder', operation: 'select', table: '', columns: ['*'], distinct: false, limit: '', offset: '', where: [], orderBy: [], insertPairs: [], setPairs: [], rawSql: '' },
      },
      host: {
        type: 'text',
        label: 'Host',
        placeholder: 'localhost',
      },
      port: {
        type: 'number',
        label: 'Port',
        defaultValue: 5432,
      },
      database: {
        type: 'text',
        label: 'Database Name',
        placeholder: 'mydb',
      },
      user: {
        type: 'text',
        label: 'Username',
        placeholder: 'postgres',
      },
      password: {
        type: 'text',
        label: 'Password',
      },
      ssl: {
        type: 'boolean',
        label: 'SSL',
        defaultValue: false,
      },
    },
  },

  // --- COMMUNICATION MANQUANTS ----------------------------------------------

  email: {
    type: 'email',
    icon: 'Mail',
    category: 'communication',
    description: 'Envoie et lit des emails via SMTP/IMAP',
    config: {
      smtpHost: {
        type: 'text',
        label: 'SMTP Host',
        placeholder: 'smtp.gmail.com',
      },
      smtpPort: {
        type: 'number',
        label: 'SMTP Port',
        defaultValue: 587,
      },
      smtpUser: {
        type: 'text',
        label: 'SMTP User',
        placeholder: 'your@email.com',
      },
      smtpPassword: {
        type: 'text',
        label: 'SMTP Password',
      },
      from: {
        type: 'text',
        label: 'From',
        placeholder: 'noreply@example.com',
      },
      to: {
        type: 'text',
        label: 'To',
        placeholder: 'recipient@example.com',
      },
      subject: {
        type: 'text',
        label: 'Subject',
        placeholder: 'Email subject',
      },
      message: {
        type: 'textarea',
        label: 'Message (HTML or text)',
        placeholder: '<h1>Hello!</h1>',
      },
    },
  },

  emailSend: {
    type: 'emailSend',
    icon: 'Send',
    category: 'communication',
    description: 'Envoie un email via SMTP',
    config: {
      smtpHost: { type: 'text', label: 'SMTP Host', placeholder: 'smtp.gmail.com' },
      smtpPort: { type: 'number', label: 'SMTP Port', defaultValue: 587 },
      smtpUser: { type: 'text', label: 'SMTP User', placeholder: 'your@email.com' },
      smtpPassword: { type: 'text', label: 'SMTP Password' },
      from: { type: 'text', label: 'From', placeholder: 'noreply@example.com' },
      to: { type: 'text', label: 'To', placeholder: 'recipient@example.com' },
      cc: { type: 'text', label: 'CC (optional)', placeholder: 'cc@example.com' },
      bcc: { type: 'text', label: 'BCC (optional)', placeholder: 'bcc@example.com' },
      subject: { type: 'text', label: 'Subject', placeholder: 'Email subject' },
      message: { type: 'textarea', label: 'Message (HTML or text)', placeholder: '<h1>Hello!</h1>' },
    },
  },

  emailRead: {
    type: 'emailRead',
    icon: 'Inbox',
    category: 'communication',
    description: 'Lit les emails depuis une bo�te IMAP',
    config: {
      imapHost: { type: 'text', label: 'IMAP Host', placeholder: 'imap.gmail.com' },
      imapPort: { type: 'number', label: 'IMAP Port', defaultValue: 993 },
      imapUser: { type: 'text', label: 'Email', placeholder: 'your@email.com' },
      imapPassword: { type: 'text', label: 'Password' },
      mailbox: { type: 'text', label: 'Mailbox / Folder', placeholder: 'INBOX', defaultValue: 'INBOX' },
      limit: { type: 'number', label: 'Max emails to fetch', defaultValue: 10 },
      markSeen: { type: 'boolean', label: 'Mark as Read', defaultValue: true },
      fetchUnread: { type: 'boolean', label: 'Only Unread', defaultValue: true },
    },
  },

  emailReply: {
    type: 'emailReply',
    icon: 'Reply',
    category: 'communication',
    description: 'R�pond � un email existant (conserve le fil de discussion)',
    config: {
      smtpHost: { type: 'text', label: 'SMTP Host', placeholder: 'smtp.gmail.com' },
      smtpPort: { type: 'number', label: 'SMTP Port', defaultValue: 587 },
      smtpUser: { type: 'text', label: 'SMTP User', placeholder: 'your@email.com' },
      smtpPassword: { type: 'text', label: 'SMTP Password' },
      messageId: { type: 'text', label: 'Original Message ID', placeholder: '{{ $json.messageId }}' },
      replyTo: { type: 'text', label: 'Reply To', placeholder: '{{ $json.from }}' },
      message: { type: 'textarea', label: 'Reply Message', placeholder: 'Thank you for your email...' },
    },
  },

  emailForward: {
    type: 'emailForward',
    icon: 'Forward',
    category: 'communication',
    description: 'Transf�re un email vers une autre adresse',
    config: {
      smtpHost: { type: 'text', label: 'SMTP Host', placeholder: 'smtp.gmail.com' },
      smtpPort: { type: 'number', label: 'SMTP Port', defaultValue: 587 },
      smtpUser: { type: 'text', label: 'SMTP User', placeholder: 'your@email.com' },
      smtpPassword: { type: 'text', label: 'SMTP Password' },
      to: { type: 'text', label: 'Forward To', placeholder: 'forward@example.com' },
      messageId: { type: 'text', label: 'Message ID to forward', placeholder: '{{ $json.messageId }}' },
      note: { type: 'textarea', label: 'Note (optional)', placeholder: 'FWD: See message below...' },
    },
  },

  emailDelete: {
    type: 'emailDelete',
    icon: 'Trash2',
    category: 'communication',
    description: 'Supprime ou archive un email dans la bo�te IMAP',
    config: {
      imapHost: { type: 'text', label: 'IMAP Host', placeholder: 'imap.gmail.com' },
      imapPort: { type: 'number', label: 'IMAP Port', defaultValue: 993 },
      imapUser: { type: 'text', label: 'Email', placeholder: 'your@email.com' },
      imapPassword: { type: 'text', label: 'Password' },
      messageId: { type: 'text', label: 'Message ID', placeholder: '{{ $json.messageId }}' },
      action: {
        type: 'select',
        label: 'Action',
        options: [
          { label: 'Delete permanently', value: 'delete' },
          { label: 'Move to Trash', value: 'trash' },
          { label: 'Archive', value: 'archive' },
          { label: 'Mark as Read', value: 'markRead' },
          { label: 'Mark as Unread', value: 'markUnread' },
        ],
        defaultValue: 'trash',
      },
    },
  },

  twilio: {
    type: 'twilio',
    icon: 'Phone',
    category: 'communication',
    description: 'Envoie des SMS et passe des appels vocaux via Twilio',
    config: {
      operation: {
        type: 'select',
        label: 'Operation',
        options: [
          { label: 'Send SMS', value: 'sms' },
          { label: 'Make Call', value: 'call' },
          { label: 'Send WhatsApp', value: 'whatsapp' },
        ],
        defaultValue: 'sms',
      },
      accountSid: {
        type: 'text',
        label: 'Account SID',
        placeholder: 'ACxxxxxxxxxxxx',
      },
      authToken: {
        type: 'text',
        label: 'Auth Token',
      },
      from: {
        type: 'text',
        label: 'From (Twilio Number)',
        placeholder: '+15551234567',
      },
      to: {
        type: 'text',
        label: 'To',
        placeholder: '+15559876543',
      },
      body: {
        type: 'textarea',
        label: 'Message Body',
        placeholder: 'Your SMS message here...',
      },
    },
  },

  twilioSendSMS: {
    type: 'twilioSendSMS',
    icon: 'MessageSquare',
    category: 'communication',
    description: 'Envoie un SMS via Twilio',
    config: {
      accountSid: { type: 'text', label: 'Account SID', placeholder: 'ACxxxxxxxxxxxx' },
      authToken: { type: 'text', label: 'Auth Token' },
      from: { type: 'text', label: 'From (Twilio Number)', placeholder: '+15551234567' },
      to: { type: 'text', label: 'To', placeholder: '+15559876543' },
      body: { type: 'textarea', label: 'Message Body', placeholder: 'Your SMS...' },
      statusCallback: { type: 'text', label: 'Status Callback URL (optional)', placeholder: 'https://...' },
    },
  },

  twilioReceiveSMS: {
    type: 'twilioReceiveSMS',
    icon: 'Inbox',
    category: 'communication',
    description: 'Configure un webhook pour recevoir des SMS entrants Twilio',
    config: {
      accountSid: { type: 'text', label: 'Account SID', placeholder: 'ACxxxxxxxxxxxx' },
      authToken: { type: 'text', label: 'Auth Token' },
      phoneNumber: { type: 'text', label: 'Twilio Phone Number', placeholder: '+15551234567' },
      autoReply: { type: 'boolean', label: 'Send Auto-Reply', defaultValue: false },
      autoReplyMessage: { type: 'textarea', label: 'Auto-Reply Message', placeholder: 'Thanks for your message!' },
    },
  },

  twilioMakeCall: {
    type: 'twilioMakeCall',
    icon: 'Phone',
    category: 'communication',
    description: 'Passe un appel t�l�phonique via Twilio',
    config: {
      accountSid: { type: 'text', label: 'Account SID', placeholder: 'ACxxxxxxxxxxxx' },
      authToken: { type: 'text', label: 'Auth Token' },
      from: { type: 'text', label: 'From (Twilio Number)', placeholder: '+15551234567' },
      to: { type: 'text', label: 'To', placeholder: '+15559876543' },
      twimlUrl: { type: 'text', label: 'TwiML URL (voice instructions)', placeholder: 'https://...' },
      message: { type: 'textarea', label: 'Text to Speech (optional)', placeholder: 'Hello, this is an automated call.' },
    },
  },

  twilioSendWhatsApp: {
    type: 'twilioSendWhatsApp',
    icon: 'MessageSquare',
    category: 'communication',
    description: 'Envoie un message WhatsApp Business via Twilio',
    config: {
      accountSid: { type: 'text', label: 'Account SID', placeholder: 'ACxxxxxxxxxxxx' },
      authToken: { type: 'text', label: 'Auth Token' },
      from: { type: 'text', label: 'From (whatsapp:+1...)', placeholder: 'whatsapp:+14155238886' },
      to: { type: 'text', label: 'To (whatsapp:+...)', placeholder: 'whatsapp:+15559876543' },
      body: { type: 'textarea', label: 'Message', placeholder: 'Your WhatsApp message...' },
      mediaUrl: { type: 'text', label: 'Media URL (optional)', placeholder: 'https://example.com/image.jpg' },
    },
  },

  // --- MARKETING MANQUANTS --------------------------------------------------

  sendgrid: {
    type: 'sendgrid',
    icon: 'SendHorizontal',
    category: 'marketing',
    description: 'Emails transactionnels et marketing via SendGrid',
    config: {
      operation: {
        type: 'select',
        label: 'Operation',
        options: [
          { label: 'Send Email', value: 'send' },
          { label: 'Send Template Email', value: 'sendTemplate' },
          { label: 'Add Contact', value: 'addContact' },
          { label: 'Remove Contact', value: 'removeContact' },
        ],
        defaultValue: 'send',
      },
      apiKey: {
        type: 'text',
        label: 'SendGrid API Key',
        placeholder: 'SG.xxxxxxxxxxxx',
      },
      from: {
        type: 'text',
        label: 'From Email',
        placeholder: 'sender@example.com',
      },
      to: {
        type: 'text',
        label: 'To Email',
        placeholder: 'recipient@example.com',
      },
      subject: {
        type: 'text',
        label: 'Subject',
        placeholder: 'Email subject',
      },
      content: {
        type: 'textarea',
        label: 'Content (HTML)',
        placeholder: '<h1>Hello!</h1>',
      },
      templateId: {
        type: 'text',
        label: 'Template ID (for template emails)',
        placeholder: 'd-xxxxxxxxxxxx',
      },
    },
  },

  mailchimp: {
    type: 'mailchimp',
    icon: 'Mail',
    category: 'marketing',
    description: 'Gestion des listes et campagnes email Mailchimp',
    config: {
      operation: {
        type: 'select',
        label: 'Operation',
        options: [
          { label: 'Add Member to List', value: 'addMember' },
          { label: 'Update Member', value: 'updateMember' },
          { label: 'Remove Member', value: 'removeMember' },
          { label: 'Create Campaign', value: 'createCampaign' },
          { label: 'Send Campaign', value: 'sendCampaign' },
          { label: 'Get List Members', value: 'getMembers' },
        ],
        defaultValue: 'addMember',
      },
      apiKey: {
        type: 'text',
        label: 'Mailchimp API Key',
        placeholder: 'xxxxxxxxxxxx-us1',
      },
      listId: {
        type: 'text',
        label: 'List/Audience ID',
        placeholder: 'abc123def456',
      },
      email: {
        type: 'text',
        label: 'Email Address',
        placeholder: '{{ $json.email }}',
      },
      firstName: {
        type: 'text',
        label: 'First Name',
        placeholder: '{{ $json.firstName }}',
      },
      lastName: {
        type: 'text',
        label: 'Last Name',
        placeholder: '{{ $json.lastName }}',
      },
    },
  },

  // --- PRODUCTIVITY MANQUANTS -----------------------------------------------

  googleSheets: {
    type: 'googleSheets',
    icon: 'Table',
    category: 'productivity',
    description: 'Lire, �crire et mettre � jour des cellules Google Sheets',
    config: {
      operation: {
        type: 'select',
        label: 'Operation',
        options: [
          { label: 'Read Rows', value: 'read' },
          { label: 'Append Row', value: 'append' },
          { label: 'Update Row', value: 'update' },
          { label: 'Delete Row', value: 'delete' },
          { label: 'Clear Sheet', value: 'clear' },
          { label: 'Create Sheet', value: 'create' },
        ],
        defaultValue: 'read',
      },
      spreadsheetId: {
        type: 'text',
        label: 'Spreadsheet ID',
        placeholder: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms',
      },
      range: {
        type: 'text',
        label: 'Range (A1 notation)',
        placeholder: 'Sheet1!A1:Z',
        defaultValue: 'Sheet1!A:Z',
      },
      values: {
        type: 'textarea',
        label: 'Values (JSON array)',
        placeholder: '[["Name", "Email"], ["John", "john@example.com"]]',
      },
      serviceAccountJson: {
        type: 'textarea',
        label: 'Service Account JSON',
        placeholder: '{ "type": "service_account", ... }',
      },
    },
  },

  googleDrive: {
    type: 'googleDrive',
    icon: 'HardDrive',
    category: 'productivity',
    description: 'Upload, download et gestion de fichiers Google Drive',
    config: {
      operation: {
        type: 'select',
        label: 'Operation',
        options: [
          { label: 'Upload File', value: 'upload' },
          { label: 'Download File', value: 'download' },
          { label: 'List Files', value: 'list' },
          { label: 'Delete File', value: 'delete' },
          { label: 'Create Folder', value: 'createFolder' },
          { label: 'Move File', value: 'move' },
          { label: 'Share File', value: 'share' },
        ],
        defaultValue: 'list',
      },
      fileId: {
        type: 'text',
        label: 'File/Folder ID',
        placeholder: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms',
      },
      folderId: {
        type: 'text',
        label: 'Parent Folder ID (optional)',
        placeholder: 'root',
        defaultValue: 'root',
      },
      fileUrl: {
        type: 'text',
        label: 'File URL (for upload)',
        placeholder: 'https://example.com/document.pdf',
      },
      fileName: {
        type: 'text',
        label: 'File Name',
        placeholder: 'document.pdf',
      },
      serviceAccountJson: {
        type: 'textarea',
        label: 'Service Account JSON',
        placeholder: '{ "type": "service_account", ... }',
      },
    },
  },

  airtable: {
    type: 'airtable',
    icon: 'Table2',
    category: 'database',
    description: 'CRUD sur les records Airtable bases et tables',
    config: {
      operation: {
        type: 'select',
        label: 'Operation',
        options: [
          { label: 'List Records', value: 'list' },
          { label: 'Get Record', value: 'get' },
          { label: 'Create Record', value: 'create' },
          { label: 'Update Record', value: 'update' },
          { label: 'Delete Record', value: 'delete' },
          { label: 'Search Records', value: 'search' },
        ],
        defaultValue: 'list',
      },
      apiKey: {
        type: 'text',
        label: 'Airtable API Key',
        placeholder: 'patXXXXXXXXXXXXXX',
      },
      baseId: {
        type: 'text',
        label: 'Base ID',
        placeholder: 'appXXXXXXXXXXXXXX',
      },
      tableId: {
        type: 'text',
        label: 'Table Name or ID',
        placeholder: 'tblXXXXXXXXXXXXXX',
      },
      fields: {
        type: 'textarea',
        label: 'Fields (JSON)',
        placeholder: '{"Name": "John", "Email": "john@example.com"}',
      },
      filterFormula: {
        type: 'text',
        label: 'Filter Formula',
        placeholder: '{Status} = "Active"',
      },
    },
  },

  notion: {
    type: 'notion',
    icon: 'Book',
    category: 'productivity',
    description: 'Cr�er, lire et modifier des pages et bases de donn�es Notion',
    config: {
      operation: {
        type: 'select',
        label: 'Operation',
        options: [
          { label: 'Create Page', value: 'createPage' },
          { label: 'Get Page', value: 'getPage' },
          { label: 'Update Page', value: 'updatePage' },
          { label: 'Archive Page', value: 'archivePage' },
          { label: 'Query Database', value: 'queryDatabase' },
          { label: 'Create Database Item', value: 'createDatabaseItem' },
          { label: 'Search', value: 'search' },
        ],
        defaultValue: 'queryDatabase',
      },
      apiKey: {
        type: 'text',
        label: 'Notion API Key (Integration Token)',
        placeholder: 'secret_XXXXXXXXXXXX',
      },
      databaseId: {
        type: 'text',
        label: 'Database ID',
        placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      },
      pageId: {
        type: 'text',
        label: 'Page ID',
        placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
      },
      title: {
        type: 'text',
        label: 'Page Title',
        placeholder: 'New Page',
      },
      properties: {
        type: 'textarea',
        label: 'Properties (JSON)',
        placeholder: '{"Name": {"title": [{"text": {"content": "My item"}}]}}',
      },
    },
  },

  trello: {
    type: 'trello',
    icon: 'Kanban',
    category: 'productivity',
    description: 'G�rer des cards, listes et boards Trello',
    config: {
      operation: {
        type: 'select',
        label: 'Operation',
        options: [
          { label: 'Create Card', value: 'createCard' },
          { label: 'Get Card', value: 'getCard' },
          { label: 'Update Card', value: 'updateCard' },
          { label: 'Delete Card', value: 'deleteCard' },
          { label: 'Move Card', value: 'moveCard' },
          { label: 'Archive Card', value: 'archiveCard' },
          { label: 'Add Comment', value: 'addComment' },
          { label: 'Get List Cards', value: 'getListCards' },
        ],
        defaultValue: 'createCard',
      },
      apiKey: {
        type: 'text',
        label: 'Trello API Key',
        placeholder: 'Your Trello API key',
      },
      token: {
        type: 'text',
        label: 'Trello Token',
        placeholder: 'Your Trello OAuth token',
      },
      listId: {
        type: 'text',
        label: 'List ID',
        placeholder: 'List ID for the card',
      },
      cardId: {
        type: 'text',
        label: 'Card ID',
        placeholder: 'Trello card ID',
      },
      name: {
        type: 'text',
        label: 'Card Name',
        placeholder: 'Task title',
      },
      description: {
        type: 'textarea',
        label: 'Card Description',
        placeholder: 'Task description...',
      },
      dueDate: {
        type: 'text',
        label: 'Due Date',
        placeholder: '2024-12-31T14:00:00',
      },
    },
  },

  // --- PROJECT MANAGEMENT MANQUANTS ----------------------------------------

  asana: {
    type: 'asana',
    icon: 'CheckCircle',
    category: 'project',
    description: 'G�rer les t�ches et projets Asana',
    config: {
      operation: {
        type: 'select',
        label: 'Operation',
        options: [
          { label: 'Create Task', value: 'createTask' },
          { label: 'Get Task', value: 'getTask' },
          { label: 'Update Task', value: 'updateTask' },
          { label: 'Delete Task', value: 'deleteTask' },
          { label: 'Complete Task', value: 'completeTask' },
          { label: 'List Tasks', value: 'listTasks' },
          { label: 'Create Project', value: 'createProject' },
          { label: 'List Projects', value: 'listProjects' },
        ],
        defaultValue: 'createTask',
      },
      accessToken: {
        type: 'text',
        label: 'Asana Personal Access Token',
        placeholder: '0/xxxxxxxxxxxxxxxxxxxx',
      },
      projectId: {
        type: 'text',
        label: 'Project ID',
        placeholder: '1234567890',
      },
      taskId: {
        type: 'text',
        label: 'Task ID',
        placeholder: '1234567890',
      },
      name: {
        type: 'text',
        label: 'Task Name',
        placeholder: 'New task',
      },
      notes: {
        type: 'textarea',
        label: 'Task Notes',
        placeholder: 'Task description...',
      },
      dueOn: {
        type: 'text',
        label: 'Due Date',
        placeholder: '2024-12-31',
      },
      assignee: {
        type: 'text',
        label: 'Assignee (email or user ID)',
        placeholder: 'user@example.com',
      },
    },
  },

  linear: {
    type: 'linear',
    icon: 'Link',
    category: 'project',
    description: 'G�rer les issues et sprints Linear',
    config: {
      operation: {
        type: 'select',
        label: 'Operation',
        options: [
          { label: 'Create Issue', value: 'createIssue' },
          { label: 'Get Issue', value: 'getIssue' },
          { label: 'Update Issue', value: 'updateIssue' },
          { label: 'Archive Issue', value: 'archiveIssue' },
          { label: 'List Issues', value: 'listIssues' },
          { label: 'Create Comment', value: 'createComment' },
        ],
        defaultValue: 'createIssue',
      },
      apiKey: {
        type: 'text',
        label: 'Linear API Key',
        placeholder: 'lin_api_xxxxxxxxxxxx',
      },
      teamId: {
        type: 'text',
        label: 'Team ID',
        placeholder: 'Team ID from Linear',
      },
      title: {
        type: 'text',
        label: 'Issue Title',
        placeholder: 'Bug: something is broken',
      },
      description: {
        type: 'textarea',
        label: 'Description',
        placeholder: 'Detailed description...',
      },
      priority: {
        type: 'select',
        label: 'Priority',
        options: [
          { label: 'No priority', value: '0' },
          { label: 'Urgent', value: '1' },
          { label: 'High', value: '2' },
          { label: 'Medium', value: '3' },
          { label: 'Low', value: '4' },
        ],
        defaultValue: '3',
      },
    },
  },

  // --- CRM MANQUANTS --------------------------------------------------------

  salesforce: {
    type: 'salesforce',
    icon: 'Users',
    category: 'crm',
    description: 'CRM Salesforce � leads, contacts, opportunit�s, comptes',
    config: {
      operation: {
        type: 'select',
        label: 'Operation',
        options: [
          { label: 'Create Record', value: 'create' },
          { label: 'Get Record', value: 'get' },
          { label: 'Update Record', value: 'update' },
          { label: 'Delete Record', value: 'delete' },
          { label: 'Query (SOQL)', value: 'query' },
          { label: 'Search (SOSL)', value: 'search' },
        ],
        defaultValue: 'create',
      },
      object: {
        type: 'select',
        label: 'Object Type',
        options: [
          { label: 'Lead', value: 'Lead' },
          { label: 'Contact', value: 'Contact' },
          { label: 'Account', value: 'Account' },
          { label: 'Opportunity', value: 'Opportunity' },
          { label: 'Task', value: 'Task' },
          { label: 'Case', value: 'Case' },
        ],
        defaultValue: 'Lead',
      },
      clientId: {
        type: 'text',
        label: 'Client ID (Consumer Key)',
        placeholder: 'Your connected app client ID',
      },
      clientSecret: {
        type: 'text',
        label: 'Client Secret',
      },
      username: {
        type: 'text',
        label: 'Username',
        placeholder: 'your@salesforce.com',
      },
      password: {
        type: 'text',
        label: 'Password + Security Token',
        placeholder: 'passwordSECURITYTOKEN',
      },
      fields: {
        type: 'textarea',
        label: 'Fields (JSON)',
        placeholder: '{"FirstName": "John", "LastName": "Doe", "Email": "john@example.com"}',
      },
    },
  },

  hubspot: {
    type: 'hubspot',
    icon: 'Users',
    category: 'crm',
    description: 'CRM HubSpot � contacts, deals, pipelines, tickets',
    config: {
      operation: {
        type: 'select',
        label: 'Operation',
        options: [
          { label: 'Create Contact', value: 'createContact' },
          { label: 'Get Contact', value: 'getContact' },
          { label: 'Update Contact', value: 'updateContact' },
          { label: 'Delete Contact', value: 'deleteContact' },
          { label: 'Create Deal', value: 'createDeal' },
          { label: 'Update Deal', value: 'updateDeal' },
          { label: 'Create Ticket', value: 'createTicket' },
          { label: 'Search', value: 'search' },
        ],
        defaultValue: 'createContact',
      },
      apiKey: {
        type: 'text',
        label: 'HubSpot API Key / Bearer Token',
        placeholder: 'pat-na1-xxxxxxxxxxxx',
      },
      email: {
        type: 'text',
        label: 'Contact Email',
        placeholder: '{{ $json.email }}',
      },
      properties: {
        type: 'textarea',
        label: 'Properties (JSON)',
        placeholder: '{"firstname": "John", "lastname": "Doe", "phone": "+1234567890"}',
      },
    },
  },

  // --- CUSTOMER SUPPORT MANQUANTS -------------------------------------------

  zendesk: {
    type: 'zendesk',
    icon: 'Ticket',
    category: 'project',
    description: 'Tickets et clients Zendesk Support',
    config: {
      operation: {
        type: 'select',
        label: 'Operation',
        options: [
          { label: 'Create Ticket', value: 'createTicket' },
          { label: 'Get Ticket', value: 'getTicket' },
          { label: 'Update Ticket', value: 'updateTicket' },
          { label: 'Delete Ticket', value: 'deleteTicket' },
          { label: 'List Tickets', value: 'listTickets' },
          { label: 'Create User', value: 'createUser' },
          { label: 'Search', value: 'search' },
        ],
        defaultValue: 'createTicket',
      },
      subdomain: {
        type: 'text',
        label: 'Zendesk Subdomain',
        placeholder: 'yourcompany (from yourcompany.zendesk.com)',
      },
      email: {
        type: 'text',
        label: 'Agent Email',
        placeholder: 'agent@yourcompany.com',
      },
      apiToken: {
        type: 'text',
        label: 'API Token',
        placeholder: 'Your Zendesk API token',
      },
      subject: {
        type: 'text',
        label: 'Ticket Subject',
        placeholder: 'Support request',
      },
      body: {
        type: 'textarea',
        label: 'Ticket Body',
        placeholder: 'Describe the issue...',
      },
      priority: {
        type: 'select',
        label: 'Priority',
        options: [
          { label: 'Low', value: 'low' },
          { label: 'Normal', value: 'normal' },
          { label: 'High', value: 'high' },
          { label: 'Urgent', value: 'urgent' },
        ],
        defaultValue: 'normal',
      },
    },
  },

  // --- PAYMENT MANQUANTS ----------------------------------------------------

  paypal: {
    type: 'paypal',
    icon: 'Wallet',
    category: 'payment',
    description: 'Paiements PayPal � ordres, remboursements, abonnements',
    config: {
      operation: {
        type: 'select',
        label: 'Operation',
        options: [
          { label: 'Create Order', value: 'createOrder' },
          { label: 'Capture Payment', value: 'capturePayment' },
          { label: 'Refund Payment', value: 'refundPayment' },
          { label: 'Get Order', value: 'getOrder' },
          { label: 'Create Subscription', value: 'createSubscription' },
        ],
        defaultValue: 'createOrder',
      },
      clientId: {
        type: 'text',
        label: 'Client ID',
        placeholder: 'PayPal Client ID',
      },
      clientSecret: {
        type: 'text',
        label: 'Client Secret',
        placeholder: 'PayPal Client Secret',
      },
      mode: {
        type: 'select',
        label: 'Mode',
        options: [
          { label: 'Sandbox (Test)', value: 'sandbox' },
          { label: 'Live (Production)', value: 'live' },
        ],
        defaultValue: 'sandbox',
      },
      amount: {
        type: 'text',
        label: 'Amount',
        placeholder: '10.00',
      },
      currency: {
        type: 'text',
        label: 'Currency',
        defaultValue: 'USD',
      },
    },
  },

  square: {
    type: 'square',
    icon: 'Square',
    category: 'payment',
    description: 'Paiements Square � transactions, clients, catalogue',
    config: {
      operation: {
        type: 'select',
        label: 'Operation',
        options: [
          { label: 'Create Payment', value: 'createPayment' },
          { label: 'Get Payment', value: 'getPayment' },
          { label: 'Refund Payment', value: 'refundPayment' },
          { label: 'Create Customer', value: 'createCustomer' },
          { label: 'List Customers', value: 'listCustomers' },
        ],
        defaultValue: 'createPayment',
      },
      accessToken: {
        type: 'text',
        label: 'Access Token',
        placeholder: 'EAAAxxxxx',
      },
      environment: {
        type: 'select',
        label: 'Environment',
        options: [
          { label: 'Sandbox', value: 'sandbox' },
          { label: 'Production', value: 'production' },
        ],
        defaultValue: 'sandbox',
      },
      amount: {
        type: 'number',
        label: 'Amount (in cents)',
        defaultValue: 1000,
      },
      currency: {
        type: 'text',
        label: 'Currency',
        defaultValue: 'USD',
      },
    },
  },

  // --- E-COMMERCE MANQUANTS -------------------------------------------------

  shopify: {
    type: 'shopify',
    icon: 'ShoppingBag',
    category: 'ecommerce',
    description: 'Orders, produits, clients et inventaire Shopify',
    config: {
      operation: {
        type: 'select',
        label: 'Operation',
        options: [
          { label: 'Get Orders', value: 'getOrders' },
          { label: 'Get Order', value: 'getOrder' },
          { label: 'Update Order', value: 'updateOrder' },
          { label: 'Get Products', value: 'getProducts' },
          { label: 'Create Product', value: 'createProduct' },
          { label: 'Update Product', value: 'updateProduct' },
          { label: 'Get Customers', value: 'getCustomers' },
          { label: 'Create Customer', value: 'createCustomer' },
        ],
        defaultValue: 'getOrders',
      },
      shopDomain: {
        type: 'text',
        label: 'Shop Domain',
        placeholder: 'yourstore.myshopify.com',
      },
      accessToken: {
        type: 'text',
        label: 'Admin API Access Token',
        placeholder: 'shpat_xxxxxxxxxxxx',
      },
      apiVersion: {
        type: 'text',
        label: 'API Version',
        defaultValue: '2024-01',
      },
    },
  },

  wooCommerce: {
    type: 'wooCommerce',
    icon: 'ShoppingBag',
    category: 'ecommerce',
    description: 'Commandes, produits et clients WooCommerce',
    config: {
      operation: {
        type: 'select',
        label: 'Operation',
        options: [
          { label: 'Get Orders', value: 'getOrders' },
          { label: 'Get Order', value: 'getOrder' },
          { label: 'Update Order Status', value: 'updateOrderStatus' },
          { label: 'Get Products', value: 'getProducts' },
          { label: 'Create Product', value: 'createProduct' },
          { label: 'Update Product', value: 'updateProduct' },
          { label: 'Get Customers', value: 'getCustomers' },
        ],
        defaultValue: 'getOrders',
      },
      siteUrl: {
        type: 'text',
        label: 'WordPress Site URL',
        placeholder: 'https://yourstore.com',
      },
      consumerKey: {
        type: 'text',
        label: 'Consumer Key',
        placeholder: 'ck_xxxxxxxxxxxx',
      },
      consumerSecret: {
        type: 'text',
        label: 'Consumer Secret',
        placeholder: 'cs_xxxxxxxxxxxx',
      },
    },
  },

  // --- CLOUD STORAGE MANQUANTS ----------------------------------------------

  dropbox: {
    type: 'dropbox',
    icon: 'FolderOpen',
    category: 'storage',
    description: 'Upload, download, partage de fichiers Dropbox',
    config: {
      operation: {
        type: 'select',
        label: 'Operation',
        options: [
          { label: 'Upload File', value: 'upload' },
          { label: 'Download File', value: 'download' },
          { label: 'List Folder', value: 'list' },
          { label: 'Delete', value: 'delete' },
          { label: 'Create Folder', value: 'createFolder' },
          { label: 'Move', value: 'move' },
          { label: 'Share', value: 'share' },
        ],
        defaultValue: 'upload',
      },
      accessToken: {
        type: 'text',
        label: 'Dropbox Access Token',
        placeholder: 'sl.xxxxxxxxxxxx',
      },
      path: {
        type: 'text',
        label: 'Path',
        placeholder: '/folder/file.txt',
      },
      fileUrl: {
        type: 'text',
        label: 'File URL (for upload)',
        placeholder: 'https://example.com/file.pdf',
      },
    },
  },

  onedrive: {
    type: 'onedrive',
    icon: 'Cloud',
    category: 'storage',
    description: 'Upload, download et gestion OneDrive / SharePoint',
    config: {
      operation: {
        type: 'select',
        label: 'Operation',
        options: [
          { label: 'Upload File', value: 'upload' },
          { label: 'Download File', value: 'download' },
          { label: 'List Items', value: 'list' },
          { label: 'Delete Item', value: 'delete' },
          { label: 'Create Folder', value: 'createFolder' },
        ],
        defaultValue: 'upload',
      },
      accessToken: {
        type: 'text',
        label: 'Microsoft Access Token',
        placeholder: 'eyJ0eXAiOiJKV1Q...',
      },
      itemPath: {
        type: 'text',
        label: 'Item Path',
        placeholder: '/Documents/file.txt',
      },
      fileUrl: {
        type: 'text',
        label: 'File URL (for upload)',
        placeholder: 'https://example.com/file.pdf',
      },
    },
  },

  box: {
    type: 'box',
    icon: 'Package',
    category: 'storage',
    description: 'Stockage s�curis� Box � files, folders, collaborations',
    config: {
      operation: {
        type: 'select',
        label: 'Operation',
        options: [
          { label: 'Upload File', value: 'upload' },
          { label: 'Download File', value: 'download' },
          { label: 'List Folder', value: 'list' },
          { label: 'Delete', value: 'delete' },
          { label: 'Create Folder', value: 'createFolder' },
          { label: 'Share Item', value: 'share' },
        ],
        defaultValue: 'upload',
      },
      accessToken: {
        type: 'text',
        label: 'Box Access Token',
        placeholder: 'Your Box OAuth2 access token',
      },
      folderId: {
        type: 'text',
        label: 'Folder ID',
        placeholder: '0 (root)',
        defaultValue: '0',
      },
      fileUrl: {
        type: 'text',
        label: 'File URL (for upload)',
        placeholder: 'https://example.com/file.pdf',
      },
    },
  },

  // --- AI/LLM MANQUANTS -----------------------------------------------------

  openAI: {
    type: 'openAI',
    icon: 'Bot',
    category: 'ai',
    description: 'OpenAI GPT-4o, GPT-4, GPT-3.5 — chat, completion, images, audio',
    config: {
      operation: {
        type: 'select',
        label: 'Operation',
        options: [
          { label: 'Chat Completion', value: 'chatCompletion' },
          { label: 'Text Completion', value: 'completion' },
          { label: 'Generate Image (DALL-E)', value: 'imageGeneration' },
          { label: 'Create Embedding', value: 'embedding' },
          { label: 'Audio Transcription (Whisper)', value: 'audioTranscription' },
          { label: 'Moderate Content', value: 'moderation' },
        ],
        defaultValue: 'chatCompletion',
      },
      model: {
        type: 'select',
        label: 'Model',
        options: [
          { label: 'GPT-4o', value: 'gpt-4o' },
          { label: 'GPT-4o Mini', value: 'gpt-4o-mini' },
          { label: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
          { label: 'GPT-4.1', value: 'gpt-4.1' },
          { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
          { label: 'o1', value: 'o1' },
          { label: 'o3-mini', value: 'o3-mini' },
          { label: 'DALL-E 3', value: 'dall-e-3' },
          { label: 'whisper-1', value: 'whisper-1' },
        ],
        defaultValue: 'gpt-4o',
      },
      systemPrompt: {
        type: 'codeEditor',
        label: 'System Prompt',
        defaultValue: 'You are a helpful assistant.',
      },
      userMessage: {
        type: 'text',
        label: 'User Message',
        placeholder: '{{ $json.message }}',
      },
      apiKey: {
        type: 'text',
        label: 'OpenAI API Key',
        placeholder: 'sk-xxxxxxxxxxxx',
      },
      builtinTools: {
        type: 'aiBuiltinTools',
        label: 'Built-in Tools',
        tools: [
          { value: 'webSearch', label: 'Web Search', description: 'Real-time internet search' },
          { value: 'codeInterpreter', label: 'Code Interpreter', description: 'Execute Python code in a sandbox' },
          { value: 'fileSearch', label: 'File Search', description: 'Search through uploaded files' },
        ],
        defaultValue: {},
      },
      aiOptions: {
        type: 'aiOptions',
        label: 'Options',
        availableOptions: [
          { key: 'temperature', label: 'Temperature', inputType: 'number', min: 0, max: 2, step: 0.01, defaultValue: 1 },
          { key: 'maxTokens', label: 'Max Tokens', inputType: 'number', min: 1, defaultValue: 1024 },
          { key: 'topP', label: 'Top P', inputType: 'number', min: 0, max: 1, step: 0.01, defaultValue: 1 },
          { key: 'frequencyPenalty', label: 'Frequency Penalty', inputType: 'number', min: -2, max: 2, step: 0.01, defaultValue: 0 },
          { key: 'presencePenalty', label: 'Presence Penalty', inputType: 'number', min: -2, max: 2, step: 0.01, defaultValue: 0 },
          { key: 'seed', label: 'Seed', inputType: 'number', min: 0, defaultValue: 0 },
          { key: 'responseFormat', label: 'Response Format', inputType: 'select', options: [{ label: 'Auto', value: 'auto' }, { label: 'JSON Object', value: 'json_object' }, { label: 'Text', value: 'text' }], defaultValue: 'auto' },
          { key: 'topLogprobs', label: 'Top Logprobs', inputType: 'number', min: 0, max: 20, defaultValue: 0 },
          { key: 'stopSequences', label: 'Stop Sequences', inputType: 'text', placeholder: 'STOP,END' },
          { key: 'conversationId', label: 'Conversation ID', inputType: 'text', placeholder: '{{ $json.sessionId }}' },
          { key: 'serviceTier', label: 'Service Tier', inputType: 'select', options: [{ label: 'Auto', value: 'auto' }, { label: 'Default', value: 'default' }], defaultValue: 'auto' },
          { key: 'stream', label: 'Stream', inputType: 'boolean', defaultValue: false },
          { key: 'timeout', label: 'Timeout (ms)', inputType: 'number', min: 0, defaultValue: 30000 },
        ],
        defaultValue: {},
      },
    },
  },
  aiAgent: {
    type: 'aiAgent',
    icon: 'Mic',
    category: 'ai',
    description: 'Autonomous AI Agent with connected Chat Model, Memory and Tools',
    config: {
      model: {
        type: 'select',
        label: 'LLM Model',
        options: [
          { label: 'GPT-4o', value: 'gpt-4o' },
          { label: 'GPT-4o Mini', value: 'gpt-4o-mini' },
          { label: 'Claude 3.7 Sonnet', value: 'claude-3-7-sonnet-20250219' },
          { label: 'Claude 3.5 Sonnet', value: 'claude-3-5-sonnet-20241022' },
          { label: 'Gemini 2.0 Flash', value: 'gemini-2.0-flash' },
          { label: 'Gemini 1.5 Pro', value: 'gemini-1.5-pro' },
        ],
        defaultValue: 'gpt-4o',
      },
      systemPrompt: {
        type: 'codeEditor',
        label: 'System Prompt',
        defaultValue: 'You are a helpful assistant. Use the available tools to answer questions accurately.',
      },
      maxIterations: {
        type: 'number',
        label: 'Max Iterations',
        defaultValue: 10,
      },
      apiKey: {
        type: 'text',
        label: 'API Key',
        placeholder: 'sk-xxxxxxxxxxxx',
      },
      aiOptions: {
        type: 'aiOptions',
        label: 'Options',
        availableOptions: [
          { key: 'temperature', label: 'Temperature', inputType: 'number', min: 0, max: 2, step: 0.01, defaultValue: 1 },
          { key: 'maxTokens', label: 'Max Tokens', inputType: 'number', min: 1, defaultValue: 2048 },
          { key: 'topP', label: 'Top P', inputType: 'number', min: 0, max: 1, step: 0.01, defaultValue: 1 },
          { key: 'conversationId', label: 'Conversation ID', inputType: 'text', placeholder: '{{ $json.sessionId }}' },
          { key: 'returnIntermediateSteps', label: 'Return Intermediate Steps', inputType: 'boolean', defaultValue: false },
          { key: 'stream', label: 'Stream', inputType: 'boolean', defaultValue: false },
          { key: 'timeout', label: 'Timeout (ms)', inputType: 'number', min: 0, defaultValue: 60000 },
        ],
        defaultValue: {},
      },
    },
  },
  vectorStore: {
    type: 'vectorStore',
    icon: 'Database',
    category: 'ai',
    description: 'Stockage et recherche de vecteurs pour RAG (Pinecone, Qdrant, Weaviate)',
    config: {
      operation: {
        type: 'select',
        label: 'Operation',
        options: [
          { label: 'Insert Vectors', value: 'insert' },
          { label: 'Search Similar', value: 'search' },
          { label: 'Delete Vectors', value: 'delete' },
          { label: 'Get Vector', value: 'get' },
        ],
        defaultValue: 'search',
      },
      provider: {
        type: 'select',
        label: 'Provider',
        options: [
          { label: 'Pinecone', value: 'pinecone' },
          { label: 'Qdrant', value: 'qdrant' },
          { label: 'Weaviate', value: 'weaviate' },
          { label: 'Chroma', value: 'chroma' },
        ],
        defaultValue: 'pinecone',
      },
      apiKey: {
        type: 'text',
        label: 'API Key',
      },
      indexName: {
        type: 'text',
        label: 'Index / Collection Name',
        placeholder: 'my-vectors',
      },
      topK: {
        type: 'number',
        label: 'Top K Results',
        defaultValue: 5,
      },
      query: {
        type: 'textarea',
        label: 'Search Query / Vector',
        placeholder: '{{ $json.text }}',
      },
    },
  },

  embeddings: {
    type: 'embeddings',
    icon: 'Cpu',
    category: 'ai',
    description: 'G�n�re des vecteurs d\'embeddings � partir de texte',
    config: {
      provider: {
        type: 'select',
        label: 'Provider',
        options: [
          { label: 'OpenAI', value: 'openai' },
          { label: 'Cohere', value: 'cohere' },
          { label: 'HuggingFace', value: 'huggingface' },
          { label: 'Ollama (Local)', value: 'ollama' },
        ],
        defaultValue: 'openai',
      },
      model: {
        type: 'text',
        label: 'Model',
        placeholder: 'text-embedding-3-small',
        defaultValue: 'text-embedding-3-small',
      },
      text: {
        type: 'textarea',
        label: 'Input Text',
        placeholder: '{{ $json.content }}',
      },
      apiKey: {
        type: 'text',
        label: 'API Key',
        placeholder: 'sk-xxxxxxxxxxxx',
      },
    },
  },

  // --- BINARY NODES MANQUANTS -----------------------------------------------

  readWriteBinaryFile: {
    type: 'readWriteBinaryFile',
    icon: 'File',
    category: 'logic',
    description: 'Lire et �crire des fichiers binaires (images, PDF, documents)',
    config: {
      operation: {
        type: 'select',
        label: 'Operation',
        options: [
          { label: 'Read File', value: 'read' },
          { label: 'Write File', value: 'write' },
        ],
        defaultValue: 'read',
      },
      filePath: {
        type: 'text',
        label: 'File Path',
        placeholder: '/data/output/file.pdf',
      },
      encoding: {
        type: 'select',
        label: 'Encoding',
        options: [
          { label: 'Binary', value: 'binary' },
          { label: 'Base64', value: 'base64' },
          { label: 'UTF-8', value: 'utf8' },
        ],
        defaultValue: 'binary',
      },
    },
  },

  compression: {
    type: 'compression',
    icon: 'Archive',
    category: 'logic',
    description: 'Compresser et d�compresser des fichiers (ZIP, GZIP, TAR)',
    config: {
      operation: {
        type: 'select',
        label: 'Operation',
        options: [
          { label: 'Compress (ZIP)', value: 'compress' },
          { label: 'Decompress', value: 'decompress' },
          { label: 'List Archive', value: 'list' },
        ],
        defaultValue: 'compress',
      },
      format: {
        type: 'select',
        label: 'Format',
        options: [
          { label: 'ZIP', value: 'zip' },
          { label: 'GZIP', value: 'gzip' },
          { label: 'TAR.GZ', value: 'tar.gz' },
        ],
        defaultValue: 'zip',
      },
      sourceData: {
        type: 'text',
        label: 'Source Path / Data Field',
        placeholder: '{{ $json.files }} or /path/to/files',
      },
      outputPath: {
        type: 'text',
        label: 'Output Path',
        placeholder: '/data/output/archive.zip',
      },
    },
  },

  crypto: {
    type: 'crypto',
    icon: 'Lock',
    category: 'logic',
    description: 'Chiffrement, d�chiffrement et hachage de donn�es',
    config: {
      operation: {
        type: 'select',
        label: 'Operation',
        options: [
          { label: 'Hash', value: 'hash' },
          { label: 'HMAC', value: 'hmac' },
          { label: 'Encrypt (AES)', value: 'encrypt' },
          { label: 'Decrypt (AES)', value: 'decrypt' },
          { label: 'Generate Key Pair', value: 'generateKeyPair' },
          { label: 'Sign', value: 'sign' },
          { label: 'Verify', value: 'verify' },
        ],
        defaultValue: 'hash',
      },
      algorithm: {
        type: 'select',
        label: 'Algorithm',
        options: [
          { label: 'SHA-256', value: 'sha256' },
          { label: 'SHA-512', value: 'sha512' },
          { label: 'MD5', value: 'md5' },
          { label: 'AES-256-CBC', value: 'aes-256-cbc' },
          { label: 'RSA', value: 'rsa' },
        ],
        defaultValue: 'sha256',
      },
      data: {
        type: 'textarea',
        label: 'Data to Process',
        placeholder: '{{ $json.sensitiveData }}',
      },
      key: {
        type: 'text',
        label: 'Secret Key',
        placeholder: 'your-secret-key',
      },
      encoding: {
        type: 'select',
        label: 'Output Encoding',
        options: [
          { label: 'Hex', value: 'hex' },
          { label: 'Base64', value: 'base64' },
        ],
        defaultValue: 'hex',
      },
    },
  },
};

