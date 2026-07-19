/**
 * Node Description Registry - N8N-Style
 *
 * Central registry of all node descriptions following N8N's pattern.
 * These descriptions provide metadata for both backend (BaseNode) and frontend (UI).
 *
 * Structure matches N8N's INodeTypeDescription:
 * - displayName: Human-readable name
 * - name: Unique identifier (used as node type)
 * - subtitle: Dynamic subtitle (can use N8N expressions)
 * - defaults: Default appearance (name, color, icon)
 * - inputs: Input connection types
 * - outputs: Output connection types
 * - credentials: Supported credential types
 * - properties: Node configuration parameters
 * - category: UI category for sidebar organization
 */

import { INodeDescription } from '../../types';

/**
 * Category definitions for sidebar organization
 */
export const NodeCategories = {
  TRIGGER: 'trigger',
  LOGIC: 'logic',
  DATA: 'data',
  ACTION: 'action',
  AI: 'ai',
  COMMUNICATION: 'communication',
  PRODUCTIVITY: 'productivity',
  PROJECT_MANAGEMENT: 'project',
  STORAGE: 'storage',
  DATABASE: 'database',
  HTTP: 'http',
  PAYMENT: 'payment',
  ECOMMERCE: 'ecommerce',
  CRM: 'crm',
  SUPPORT: 'support',
  SOCIAL: 'social',
  APPLE: 'apple',
  ANDROID: 'android',
  DEVOPS: 'devops',
  DESIGN: 'design',
  STREAMING: 'streaming',
  ADVANCED: 'advanced',
  DEBUG: 'debug',
  AUTOMATION: 'automation',
} as const;

/**
 * Default colors for node categories (Tailwind border classes)
 */
export const CategoryColors: Record<string, string> = {
  trigger: 'border-amber-500',
  logic: 'border-orange-500',
  data: 'border-green-500',
  action: 'border-blue-500',
  ai: 'border-violet-400',
  communication: 'border-purple-600',
  productivity: 'border-cyan-400',
  project: 'border-indigo-400',
  storage: 'border-teal-400',
  database: 'border-blue-600',
  http: 'border-blue-500',
  payment: 'border-pink-500',
  ecommerce: 'border-rose-500',
  crm: 'border-yellow-500',
  support: 'border-lime-500',
  social: 'border-fuchsia-500',
  apple: 'border-gray-300',
  android: 'border-green-400',
  devops: 'border-orange-400',
  design: 'border-pink-400',
  streaming: 'border-purple-400',
  advanced: 'border-red-400',
  debug: 'border-lime-500',
  automation: 'border-emerald-400',
};

/**
 * Node Description Registry
 * All node types should register their description here
 */
export const NODE_DESCRIPTIONS: Record<string, INodeDescription> = {
  // ============================================
  // CORE TRIGGER NODES
  // ============================================
  webhook: {
    displayName: 'Webhook',
    name: 'webhook',
    subtitle: '={{$parameter.method + " " + $parameter.path}}',
    defaults: {
      name: 'Webhook',
      color: '#8b5cf6', // Violet
      icon: 'Webhook',
    },
    inputs: [],
    outputs: ['main'],
    properties: [
      {
        displayName: 'HTTP Method',
        name: 'method',
        type: 'select',
        default: 'POST',
        options: [
          { name: 'GET', value: 'GET' },
          { name: 'POST', value: 'POST' },
          { name: 'PUT', value: 'PUT' },
          { name: 'DELETE', value: 'DELETE' },
          { name: 'PATCH', value: 'PATCH' },
        ],
        description: 'The HTTP method to listen for',
      },
      {
        displayName: 'Path',
        name: 'path',
        type: 'string',
        default: '/webhook',
        placeholder: '/webhook',
        description: 'The webhook path (e.g., /webhook or /custom/path)',
      },
      {
        displayName: 'Response Mode',
        name: 'responseMode',
        type: 'select',
        default: 'lastNode',
        options: [
          { name: 'Last Node', value: 'lastNode' },
          { name: 'On Received', value: 'onReceived' },
        ],
        description: 'When to send the response',
      },
    ],
    category: NodeCategories.TRIGGER,
  },

  schedule: {
    displayName: 'Schedule Trigger',
    name: 'schedule',
    subtitle: '={{$parameter.cronExpression || "Interval"}}',
    defaults: {
      name: 'Schedule Trigger',
      color: '#f59e0b', // Amber
      icon: 'Clock',
    },
    inputs: [],
    outputs: ['main'],
    properties: [
      {
        displayName: 'Trigger Interval',
        name: 'triggerInterval',
        type: 'select',
        default: 'cron',
        options: [
          { name: 'Cron Expression', value: 'cron' },
          { name: 'Every Minute', value: 'everyMinute' },
          { name: 'Every Hour', value: 'everyHour' },
          { name: 'Every Day', value: 'everyDay' },
          { name: 'Every Week', value: 'everyWeek' },
          { name: 'Every Month', value: 'everyMonth' },
        ],
        description: 'How often the workflow should trigger',
      },
      {
        displayName: 'Cron Expression',
        name: 'cronExpression',
        type: 'string',
        default: '0 * * * *',
        placeholder: '0 * * * *',
        description: 'Cron expression (min hour day month dow)',
      },
    ],
    category: NodeCategories.TRIGGER,
  },

  clickTrigger: {
    displayName: 'Manual Trigger',
    name: 'clickTrigger',
    subtitle: '={{$parameter.buttonText || "Execute"}}',
    defaults: {
      name: 'Manual Trigger',
      color: '#ec4899', // Pink
      icon: 'MousePointerClick',
    },
    inputs: [],
    outputs: ['main'],
    properties: [
      {
        displayName: 'Button Text',
        name: 'buttonText',
        type: 'string',
        default: 'Execute',
        placeholder: 'Execute',
        description: 'Text to display on the trigger button in the UI',
      },
      {
        displayName: 'Button Style',
        name: 'buttonStyle',
        type: 'select',
        default: 'primary',
        options: [
          { name: 'Primary (Blue)', value: 'primary' },
          { name: 'Success (Green)', value: 'success' },
          { name: 'Warning (Orange)', value: 'warning' },
          { name: 'Danger (Red)', value: 'danger' },
        ],
        description: 'Visual style of the trigger button',
      },
      {
        displayName: 'Require Confirmation',
        name: 'requireConfirmation',
        type: 'boolean',
        default: false,
        description: 'Show a confirmation dialog before executing the workflow',
      },
      {
        displayName: 'Confirmation Message',
        name: 'confirmationMessage',
        type: 'string',
        default: 'Execute this workflow?',
        placeholder: 'Execute this workflow?',
        description: 'Custom confirmation message (if confirmation is enabled)',
      },
      {
        displayName: 'Minimum Interval',
        name: 'minInterval',
        type: 'string',
        placeholder: '30s',
        description: 'Minimum time between executions (e.g., 30s, 5m, 1h). Leave empty for no limit.',
      },
      {
        displayName: 'Additional Data',
        name: 'data',
        type: 'json',
        description: 'Additional data to pass with the trigger',
      },
    ],
    category: NodeCategories.TRIGGER,
  },

  logicaiTrigger: {
    displayName: 'LogicAI Trigger',
    name: 'logicaiTrigger',
    subtitle: '={{$parameter.instanceUuid ? "Instance: " + $parameter.instanceUuid : "LogicAI"}}',
    defaults: {
      name: 'LogicAI Trigger',
      color: '#10b981', // Emerald green
      icon: 'Workflow',
    },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      {
        displayName: 'API URL',
        name: 'apiUrl',
        type: 'string',
        default: 'http://localhost:3000',
        placeholder: 'http://localhost:3000',
        description: 'URL de l\'API LogicAI (peut être défini via LOGICAI_API_URL)',
      },
      {
        displayName: 'Token',
        name: 'token',
        type: 'string',
        typeOptions: {
          password: true,
        },
        default: '',
        placeholder: 'jwt-token-here',
        description: 'Token JWT d\'authentification (peut être défini via LOGICAI_TOKEN)',
        required: true,
      },
      {
        displayName: 'Instance UUID',
        name: 'instanceUuid',
        type: 'string',
        default: '',
        placeholder: 'abc-123-def-456',
        description: 'UUID de l\'instance LogicAI cible',
        required: true,
      },
      {
        displayName: 'Mode',
        name: 'mode',
        type: 'select',
        default: 'webhook',
        options: [
          { name: 'Webhook Path', value: 'webhook', description: 'Déclencher via un chemin webhook' },
          { name: 'Workflow ID', value: 'workflowId', description: 'Déclencher via l\'ID du workflow' },
        ],
        description: 'Méthode de déclenchement du workflow',
      },
      {
        displayName: 'Webhook Path',
        name: 'webhookPath',
        type: 'string',
        default: '',
        placeholder: 'contact-form',
        description: 'Chemin du webhook (sans le préfixe /webhook/)',
        displayOptions: {
          show: {
            mode: ['webhook'],
          },
        },
      },
      {
        displayName: 'Workflow ID',
        name: 'workflowId',
        type: 'string',
        default: '',
        placeholder: 'workflow-123',
        description: 'ID du workflow à déclencher',
        displayOptions: {
          show: {
            mode: ['workflowId'],
          },
        },
      },
      {
        displayName: 'HTTP Method',
        name: 'method',
        type: 'select',
        default: 'POST',
        options: [
          { name: 'GET', value: 'GET' },
          { name: 'POST', value: 'POST' },
          { name: 'PUT', value: 'PUT' },
          { name: 'PATCH', value: 'PATCH' },
          { name: 'DELETE', value: 'DELETE' },
        ],
        description: 'Méthode HTTP à utiliser',
      },
      {
        displayName: 'Data',
        name: 'data',
        type: 'json',
        default: '{}',
        placeholder: '{"key": "value"}',
        description: 'Données JSON à envoyer au workflow cible',
      },
      {
        displayName: 'Custom Headers',
        name: 'headers',
        type: 'json',
        default: '{}',
        placeholder: '{"X-Custom-Header": "value"}',
        description: 'En-têtes HTTP personnalisés (format JSON)',
      },
      {
        displayName: 'Timeout',
        name: 'timeout',
        type: 'number',
        default: 30000,
        description: 'Timeout de la requête en millisecondes (défaut: 30000)',
      },
    ],
    category: NodeCategories.TRIGGER,
  },

  // ============================================
  // CORE LOGIC NODES
  // ============================================
  httpRequest: {
    displayName: 'HTTP Request',
    name: 'httpRequest',
    subtitle: '={{$parameter.method + ": " + $parameter.url}}',
    defaults: {
      name: 'HTTP Request',
      color: '#3b82f6', // Blue
      icon: 'Globe',
    },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      {
        displayName: 'Method',
        name: 'method',
        type: 'select',
        default: 'GET',
        options: [
          { name: 'GET', value: 'GET' },
          { name: 'POST', value: 'POST' },
          { name: 'PUT', value: 'PUT' },
          { name: 'DELETE', value: 'DELETE' },
          { name: 'PATCH', value: 'PATCH' },
          { name: 'HEAD', value: 'HEAD' },
        ],
        description: 'The HTTP method to use',
      },
      {
        displayName: 'URL',
        name: 'url',
        type: 'string',
        placeholder: 'https://api.example.com/endpoint',
        required: true,
        description: 'The URL to request',
      },
      {
        displayName: 'Authentication',
        name: 'authentication',
        type: 'select',
        default: 'none',
        options: [
          { name: 'None', value: 'none' },
          { name: 'Generic Credential Type', value: 'genericCredentialType' },
          { name: 'Header Auth', value: 'headerAuth' },
          { name: 'Basic Auth', value: 'basicAuth' },
          { name: 'Digest Auth', value: 'digestAuth' },
          { name: 'OAuth1', value: 'oAuth1' },
          { name: 'OAuth2', value: 'oAuth2' },
        ],
        description: 'Authentication method to use',
      },
      {
        displayName: 'Headers',
        name: 'headerParameters',
        type: 'collection',
        placeholder: '{"Content-Type": "application/json"}',
        description: 'Header parameters to send',
      },
      {
        displayName: 'Body',
        name: 'bodyParameters',
        type: 'collection',
        placeholder: '{"key": "value"}',
        description: 'Body parameters to send',
      },
      {
        displayName: 'Query Parameters',
        name: 'queryParameters',
        type: 'collection',
        placeholder: '{"param": "value"}',
        description: 'Query parameters to send',
      },
    ],
    category: NodeCategories.HTTP,
  },

  setVariable: {
    displayName: 'Set Variable',
    name: 'setVariable',
    subtitle: '={{$parameter.key}}',
    defaults: {
      name: 'Set Variable',
      color: '#22c55e', // Green
      icon: 'Variable',
    },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      {
        displayName: 'Variable Key',
        name: 'key',
        type: 'string',
        placeholder: 'output.value',
        required: true,
        description: 'The variable key to set',
      },
      {
        displayName: 'Variable Value',
        name: 'value',
        type: 'string',
        placeholder: '={{$json.inputValue}}',
        description: 'The value to set (can use expressions)',
      },
      {
        displayName: 'Value Type',
        name: 'valueType',
        type: 'select',
        default: 'string',
        options: [
          { name: 'String', value: 'string' },
          { name: 'Number', value: 'number' },
          { name: 'Boolean', value: 'boolean' },
          { name: 'JSON', value: 'json' },
        ],
        description: 'The type of the value',
      },
    ],
    category: NodeCategories.LOGIC,
  },

  condition: {
    displayName: 'Condition (IF)',
    name: 'condition',
    subtitle: '={{$parameter.leftValue + " " + $parameter.condition + " " + $parameter.rightValue}}',
    defaults: {
      name: 'Condition',
      color: '#f97316', // Orange
      icon: 'GitBranch',
    },
    inputs: ['main'],
    outputs: ['main', 'main'],
    properties: [
      {
        displayName: 'Left Value',
        name: 'leftValue',
        type: 'string',
        placeholder: '={{$json.value}}',
        required: true,
        description: 'The left side of the condition',
      },
      {
        displayName: 'Operation',
        name: 'condition',
        type: 'select',
        default: 'equals',
        options: [
          { name: 'Equals', value: 'equals' },
          { name: 'Not Equals', value: 'notEquals' },
          { name: 'Less Than', value: 'lessThan' },
          { name: 'Less Than or Equal', value: 'lessThanOrEqual' },
          { name: 'Greater Than', value: 'greaterThan' },
          { name: 'Greater Than or Equal', value: 'greaterThanOrEqual' },
          { name: 'Contains', value: 'contains' },
          { name: 'Not Contains', value: 'notContains' },
          { name: 'Is Empty', value: 'isEmpty' },
          { name: 'Is Not Empty', value: 'isNotEmpty' },
          { name: 'Is True', value: 'isTrue' },
          { name: 'Is False', value: 'isFalse' },
          { name: 'Regex Match', value: 'regex' },
        ],
        description: 'The operation to perform',
      },
      {
        displayName: 'Right Value',
        name: 'rightValue',
        type: 'string',
        placeholder: 'expected value',
        description: 'The right side of the condition',
      },
    ],
    category: NodeCategories.LOGIC,
  },

  filter: {
    displayName: 'Filter',
    name: 'filter',
    subtitle: '={{$parameter.field + " " + $parameter.condition}}',
    defaults: {
      name: 'Filter',
      color: '#06b6d4', // Cyan
      icon: 'Filter',
    },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      {
        displayName: 'Field to Filter',
        name: 'field',
        type: 'string',
        placeholder: '={{$json.property}}',
        required: true,
        description: 'The field to filter on',
      },
      {
        displayName: 'Operation',
        name: 'condition',
        type: 'select',
        default: 'equals',
        options: [
          { name: 'Equals', value: 'equals' },
          { name: 'Not Equals', value: 'notEquals' },
          { name: 'Less Than', value: 'lessThan' },
          { name: 'Greater Than', value: 'greaterThan' },
          { name: 'Contains', value: 'contains' },
          { name: 'Not Contains', value: 'notContains' },
          { name: 'Exists', value: 'exists' },
          { name: 'Not Exists', value: 'notExists' },
        ],
        description: 'Filter condition',
      },
      {
        displayName: 'Value to Compare',
        name: 'value',
        type: 'string',
        placeholder: 'expected value',
        description: 'The value to compare against',
      },
    ],
    category: NodeCategories.DATA,
  },

  merge: {
    displayName: 'Merge',
    name: 'merge',
    subtitle: '={{$parameter.mode}}',
    defaults: {
      name: 'Merge',
      color: '#ec4899', // Pink
      icon: 'GitMerge',
    },
    inputs: ['main', 'main'],
    outputs: ['main'],
    properties: [
      {
        displayName: 'Mode',
        name: 'mode',
        type: 'select',
        default: 'merge',
        options: [
          { name: 'Merge', value: 'merge' },
          { name: 'Append', value: 'append' },
          { name: 'Keep Key Matches', value: 'keepKeyMatches' },
          { name: 'Remove Key Matches', value: 'removeKeyMatches' },
          { name: 'Multiplex', value: 'multiplex' },
          { name: 'Wait', value: 'wait' },
        ],
        description: 'How to merge the input data',
      },
      {
        displayName: 'Property to Match',
        name: 'propertyToMatch',
        type: 'string',
        placeholder: 'id',
        description: 'Property to match items from both inputs (for merge modes)',
      },
    ],
    category: NodeCategories.LOGIC,
  },

  code: {
    displayName: 'Code',
    name: 'code',
    subtitle: '={{$parameter.language}}',
    defaults: {
      name: 'Code',
      color: '#8b5cf6', // Violet
      icon: 'Code',
    },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      {
        displayName: 'Language',
        name: 'language',
        type: 'select',
        default: 'javascript',
        options: [
          { name: 'JavaScript', value: 'javascript' },
          { name: 'Python', value: 'python' },
          { name: 'TypeScript', value: 'typescript' },
        ],
        description: 'Programming language to use',
      },
      {
        displayName: 'Code',
        name: 'code',
        type: 'string',
        typeOptions: {
          rows: 10,
        },
        placeholder: '// Your code here\nreturn items.map(item => {\n  return item;\n});',
        required: true,
        description: 'The code to execute',
      },
      {
        displayName: 'Mode',
        name: 'mode',
        type: 'select',
        default: 'runOnceForAllItems',
        options: [
          { name: 'Run Once for All Items', value: 'runOnceForAllItems' },
          { name: 'Run Once for Each Item', value: 'runOnceForEachItem' },
        ],
        description: 'How to run the code',
      },
    ],
    category: NodeCategories.ADVANCED,
  },

  // ============================================
  // AI/LLM NODES
  // ============================================
  openAI: {
    displayName: 'OpenAI',
    name: 'openAI',
    subtitle: '={{$parameter.model}}',
    defaults: {
      name: 'OpenAI',
      color: '#10b981', // Emerald
      icon: 'OpenAI',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'openAiApi',
        required: true,
        displayName: 'OpenAI API',
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'select',
        default: 'text',
        options: [
          { name: 'Text', value: 'text' },
          { name: 'Image', value: 'image' },
          { name: 'Audio', value: 'audio' },
          { name: 'Fine-Tuning', value: 'fine-tuning' },
          { name: 'Moderation', value: 'moderation' },
        ],
        description: 'The type of resource to use',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'select',
        default: 'message',
        options: [
          { name: 'Message', value: 'message' },
          { name: 'Completion', value: 'completion' },
          { name: 'Embeddings', value: 'embeddings' },
          { name: 'Speech (Text to Audio)', value: 'speech' },
          { name: 'Transcription (Audio to Text)', value: 'transcription' },
          { name: 'Translation (Audio to Text)', value: 'translation' },
        ],
        description: 'The operation to perform',
      },
      {
        displayName: 'Model',
        name: 'model',
        type: 'select',
        default: 'gpt-4o',
        options: [
          { name: 'GPT-4o', value: 'gpt-4o' },
          { name: 'GPT-4o Mini', value: 'gpt-4o-mini' },
          { name: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
          { name: 'GPT-4', value: 'gpt-4' },
          { name: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
        ],
        description: 'The AI model to use',
      },
      {
        displayName: 'Prompt',
        name: 'text',
        type: 'string',
        typeOptions: {
          rows: 5,
        },
        placeholder: '={{$json.input}}',
        description: 'The prompt to send to the AI',
      },
      {
        displayName: 'Max Tokens',
        name: 'maxTokens',
        type: 'number',
        default: 1000,
        description: 'Maximum number of tokens to generate',
      },
      {
        displayName: 'Temperature',
        name: 'temperature',
        type: 'number',
        default: 0.7,
        typeOptions: {
          minValue: 0,
          maxValue: 2,
          numberPrecision: 0.1,
        },
        description: 'Controls randomness (0 = focused, 2 = creative)',
      },
    ],
    category: NodeCategories.AI,
  },

  aiAgent: {
    displayName: 'AI Agent',
    name: 'aiAgent',
    subtitle: '={{$parameter.agentType}}',
    defaults: {
      name: 'AI Agent',
      color: '#8b5cf6', // Violet
      icon: 'Mic',
    },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      {
        displayName: 'Agent Type',
        name: 'agentType',
        type: 'select',
        default: 'conversational',
        options: [
          { name: 'Conversational', value: 'conversational' },
          { name: 'Task Executor', value: 'taskExecutor' },
          { name: 'Research Assistant', value: 'researchAssistant' },
          { name: 'Code Assistant', value: 'codeAssistant' },
        ],
        description: 'The type of AI agent',
      },
      {
        displayName: 'System Prompt',
        name: 'systemPrompt',
        type: 'string',
        typeOptions: {
          rows: 5,
        },
        default: 'You are a helpful AI assistant.',
        description: 'The system prompt that defines the agent behavior',
      },
      {
        displayName: 'Enable Memory',
        name: 'enableMemory',
        type: 'boolean',
        default: true,
        description: 'Enable conversation memory',
      },
    ],
    category: NodeCategories.AI,
  },

  // ============================================
  // COMMUNICATION NODES
  // ============================================
  slack: {
    displayName: 'Slack',
    name: 'slack',
    subtitle: '={{$parameter.operation}}',
    defaults: {
      name: 'Slack',
      color: '#a855f7', // Purple
      icon: 'MessageSquare',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'slackApi',
        required: true,
        displayName: 'Slack API',
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'select',
        default: 'message',
        options: [
          { name: 'Message', value: 'message' },
          { name: 'Channel', value: 'channel' },
          { name: 'User', value: 'user' },
          { name: 'File', value: 'file' },
        ],
        description: 'The type of resource to work with',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'select',
        default: 'post',
        options: [
          { name: 'Post', value: 'post' },
          { name: 'Get', value: 'get' },
          { name: 'Update', value: 'update' },
          { name: 'Delete', value: 'delete' },
        ],
        description: 'The operation to perform',
      },
      {
        displayName: 'Channel',
        name: 'channel',
        type: 'string',
        placeholder: '#general',
        description: 'The channel to send the message to',
      },
      {
        displayName: 'Text',
        name: 'text',
        type: 'string',
        placeholder: '={{$json.message}}',
        description: 'The message text',
      },
    ],
    category: NodeCategories.COMMUNICATION,
  },

  email: {
    displayName: 'Email',
    name: 'email',
    subtitle: '={{$parameter.operation + " " + $parameter.to}}',
    defaults: {
      name: 'Email',
      color: '#6b7280', // Gray
      icon: 'Mail',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'smtp',
        required: true,
        displayName: 'SMTP',
      },
    ],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'select',
        default: 'send',
        options: [
          { name: 'Send', value: 'send' },
          { name: 'Receive', value: 'receive' },
        ],
        description: 'The operation to perform',
      },
      {
        displayName: 'From Email',
        name: 'fromEmail',
        type: 'string',
        placeholder: 'sender@example.com',
        required: true,
        description: 'The sender email address',
      },
      {
        displayName: 'To Email',
        name: 'toEmail',
        type: 'string',
        placeholder: 'recipient@example.com',
        required: true,
        description: 'The recipient email address',
      },
      {
        displayName: 'Subject',
        name: 'subject',
        type: 'string',
        placeholder: 'Email Subject',
        required: true,
        description: 'The email subject',
      },
      {
        displayName: 'Message',
        name: 'message',
        type: 'string',
        typeOptions: {
          rows: 8,
        },
        placeholder: 'Email body...',
        description: 'The email message content',
      },
    ],
    category: NodeCategories.COMMUNICATION,
  },

  // ============================================
  // DATABASE NODES
  // ============================================
  mySQL: {
    displayName: 'MySQL',
    name: 'mySQL',
    subtitle: '={{$parameter.operation}}',
    defaults: {
      name: 'MySQL',
      color: '#2563eb', // Blue
      icon: 'Database',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'mySql',
        required: true,
        displayName: 'MySQL',
      },
    ],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'select',
        default: 'executeQuery',
        options: [
          { name: 'Execute Query', value: 'executeQuery' },
          { name: 'Insert', value: 'insert' },
          { name: 'Update', value: 'update' },
          { name: 'Delete', value: 'delete' },
        ],
        description: 'The operation to perform',
      },
      {
        displayName: 'Query',
        name: 'query',
        type: 'string',
        typeOptions: {
          rows: 5,
        },
        placeholder: 'SELECT * FROM users WHERE id = {{$json.id}}',
        description: 'The SQL query to execute',
      },
    ],
    category: NodeCategories.DATABASE,
  },

  mongoDB: {
    displayName: 'MongoDB',
    name: 'mongoDB',
    subtitle: '={{$parameter.operation}}',
    defaults: {
      name: 'MongoDB',
      color: '#16a34a', // Green
      icon: 'MongoDB',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'mongoDb',
        required: true,
        displayName: 'MongoDB',
      },
    ],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'select',
        default: 'find',
        options: [
          { name: 'Find', value: 'find' },
          { name: 'Insert', value: 'insert' },
          { name: 'Update', value: 'update' },
          { name: 'Delete', value: 'delete' },
          { name: 'Aggregate', value: 'aggregate' },
        ],
        description: 'The operation to perform',
      },
      {
        displayName: 'Collection',
        name: 'collection',
        type: 'string',
        placeholder: 'users',
        required: true,
        description: 'The MongoDB collection name',
      },
      {
        displayName: 'Filter',
        name: 'filter',
        type: 'string',
        placeholder: '{"status": "active"}',
        description: 'MongoDB filter query',
      },
    ],
    category: NodeCategories.DATABASE,
  },

  // ============================================
  // PAYMENT & E-COMMERCE NODES
  // ============================================
  stripe: {
    displayName: 'Stripe',
    name: 'stripe',
    subtitle: '={{$parameter.resource + ": " + $parameter.operation}}',
    defaults: {
      name: 'Stripe',
      color: '#8b5cf6', // Purple
      icon: 'Stripe',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'stripeApi',
        required: true,
        displayName: 'Stripe API',
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'select',
        default: 'charge',
        options: [
          { name: 'Charge', value: 'charge' },
          { name: 'Customer', value: 'customer' },
          { name: 'Payment Intent', value: 'paymentIntent' },
          { name: 'Refund', value: 'refund' },
          { name: 'Subscription', value: 'subscription' },
        ],
        description: 'The Stripe resource to work with',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'select',
        default: 'get',
        options: [
          { name: 'Get', value: 'get' },
          { name: 'Create', value: 'create' },
          { name: 'Update', value: 'update' },
          { name: 'Delete', value: 'delete' },
          { name: 'Get All', value: 'getAll' },
        ],
        description: 'The operation to perform',
      },
      {
        displayName: 'Amount',
        name: 'amount',
        type: 'number',
        description: 'The amount in cents',
      },
      {
        displayName: 'Currency',
        name: 'currency',
        type: 'select',
        default: 'usd',
        options: [
          { name: 'USD', value: 'usd' },
          { name: 'EUR', value: 'eur' },
          { name: 'GBP', value: 'gbp' },
        ],
        description: 'The currency code',
      },
    ],
    category: NodeCategories.PAYMENT,
  },

  shopify: {
    displayName: 'Shopify',
    name: 'shopify',
    subtitle: '={{$parameter.resource + ": " + $parameter.operation}}',
    defaults: {
      name: 'Shopify',
      color: '#96bf48', // Shopify green
      icon: 'Shopify',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'shopifyApi',
        required: true,
        displayName: 'Shopify API',
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'select',
        default: 'product',
        options: [
          { name: 'Product', value: 'product' },
          { name: 'Order', value: 'order' },
          { name: 'Customer', value: 'customer' },
          { name: 'Inventory', value: 'inventory' },
        ],
        description: 'The Shopify resource to work with',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'select',
        default: 'get',
        options: [
          { name: 'Get', value: 'get' },
          { name: 'Create', value: 'create' },
          { name: 'Update', value: 'update' },
          { name: 'Delete', value: 'delete' },
          { name: 'Get All', value: 'getAll' },
        ],
        description: 'The operation to perform',
      },
    ],
    category: NodeCategories.ECOMMERCE,
  },

  // ============================================
  // CLOUD PRODUCTIVITY NODES
  // ============================================
  googleSheets: {
    displayName: 'Google Sheets',
    name: 'googleSheets',
    subtitle: '={{$parameter.operation}}',
    defaults: {
      name: 'Google Sheets',
      color: '#16a34a', // Green
      icon: 'GoogleSheets',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'googleSheetsOAuth2Api',
        required: true,
        displayName: 'Google Sheets',
      },
    ],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'select',
        default: 'lookup',
        options: [
          { name: 'Lookup', value: 'lookup' },
          { name: 'Append', value: 'append' },
          { name: 'Update', value: 'update' },
          { name: 'Delete', value: 'delete' },
          { name: 'Read', value: 'read' },
        ],
        description: 'The operation to perform',
      },
      {
        displayName: 'Spreadsheet ID',
        name: 'sheetId',
        type: 'string',
        placeholder: '1BxiMvs0XRA5nFMdKbBdB_3c',
        required: true,
        description: 'The Google Sheets spreadsheet ID',
      },
      {
        displayName: 'Sheet Name',
        name: 'sheetName',
        type: 'string',
        placeholder: 'Sheet1',
        description: 'The sheet name within the spreadsheet',
      },
    ],
    category: NodeCategories.PRODUCTIVITY,
  },

  notion: {
    displayName: 'Notion',
    name: 'notion',
    subtitle: '={{$parameter.resource + ": " + $parameter.operation}}',
    defaults: {
      name: 'Notion',
      color: '#6b7280', // Gray
      icon: 'Notion',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'notionApi',
        required: true,
        displayName: 'Notion API',
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'select',
        default: 'page',
        options: [
          { name: 'Page', value: 'page' },
          { name: 'Database', value: 'database' },
          { name: 'Block', value: 'block' },
        ],
        description: 'The Notion resource to work with',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'select',
        default: 'get',
        options: [
          { name: 'Get', value: 'get' },
          { name: 'Create', value: 'create' },
          { name: 'Update', value: 'update' },
          { name: 'Append', value: 'append' },
        ],
        description: 'The operation to perform',
      },
      {
        displayName: 'Page ID',
        name: 'pageId',
        type: 'string',
        placeholder: 'page_id',
        description: 'The Notion page ID',
      },
    ],
    category: NodeCategories.PRODUCTIVITY,
  },

  // ============================================
  // SOCIAL MEDIA NODES
  // ============================================
  twitter: {
    displayName: 'Twitter / X',
    name: 'twitter',
    subtitle: '={{$parameter.operation}}',
    defaults: {
      name: 'Twitter',
      color: '#0284c7', // Sky blue
      icon: 'Twitter',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'twitterOAuth1Api',
        required: true,
        displayName: 'Twitter API',
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'select',
        default: 'tweet',
        options: [
          { name: 'Tweet', value: 'tweet' },
          { name: 'User', value: 'user' },
          { name: 'Timeline', value: 'timeline' },
        ],
        description: 'The Twitter resource to work with',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'select',
        default: 'post',
        options: [
          { name: 'Post', value: 'post' },
          { name: 'Get', value: 'get' },
          { name: 'Delete', value: 'delete' },
          { name: 'Retweet', value: 'retweet' },
          { name: 'Like', value: 'like' },
        ],
        description: 'The operation to perform',
      },
      {
        displayName: 'Tweet Text',
        name: 'text',
        type: 'string',
        typeOptions: {
          rows: 3,
        },
        placeholder: '={{$json.message}}',
        description: 'The tweet text (max 280 characters)',
      },
    ],
    category: NodeCategories.SOCIAL,
  },

  instagram: {
    displayName: 'Instagram',
    name: 'instagram',
    subtitle: '={{$parameter.resource + ": " + $parameter.operation}}',
    defaults: {
      name: 'Instagram',
      color: '#ec4899', // Pink
      icon: 'Instagram',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'instagramOAuth2Api',
        required: true,
        displayName: 'Instagram API',
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'select',
        default: 'media',
        options: [
          { name: 'Media', value: 'media' },
          { name: 'User', value: 'user' },
          { name: 'Hashtag', value: 'hashtag' },
        ],
        description: 'The Instagram resource to work with',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'select',
        default: 'publish',
        options: [
          { name: 'Publish', value: 'publish' },
          { name: 'Get', value: 'get' },
          { name: 'Delete', value: 'delete' },
        ],
        description: 'The operation to perform',
      },
      {
        displayName: 'Image URL',
        name: 'imageUrl',
        type: 'string',
        placeholder: 'https://example.com/image.jpg',
        description: 'The image URL to post',
      },
      {
        displayName: 'Caption',
        name: 'caption',
        type: 'string',
        typeOptions: {
          rows: 3,
        },
        placeholder: 'Image caption...',
        description: 'The image caption',
      },
    ],
    category: NodeCategories.SOCIAL,
  },
};

/**
 * Get node description by type
 */
export function getNodeDescription(nodeType: string): INodeDescription | undefined {
  return NODE_DESCRIPTIONS[nodeType];
}

/**
 * Get all node descriptions
 */
export function getAllNodeDescriptions(): INodeDescription[] {
  return Object.values(NODE_DESCRIPTIONS);
}

/**
 * Get node descriptions by category
 */
export function getNodeDescriptionsByCategory(category: string): INodeDescription[] {
  return Object.values(NODE_DESCRIPTIONS).filter(
    (desc) => desc.category === category
  );
}

/**
 * Get all categories
 */
export function getAllCategories(): string[] {
  return Object.values(NodeCategories);
}
