/**
 * Workflow Templates
 *
 * Pre-built workflow templates for common use cases.
 */

import type { Node, Edge } from '@xyflow/react';

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'automation' | 'integration' | 'ai' | 'data' | 'communication';
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  nodes: Node[];
  edges: Edge[];
  thumbnail?: string;
  author?: string;
  popularity?: number;
}

/**
 * Template library
 */
export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  // ============================================
  // AUTOMATION TEMPLATES
  // ============================================
  {
    id: 'auto-reply-email',
    name: 'Auto-Reply to Emails',
    description: 'Automatically send personalized replies to incoming emails based on keywords.',
    category: 'automation',
    tags: ['email', 'automation', 'productivity'],
    difficulty: 'beginner',
    nodes: [
      {
        id: 'email-trigger',
        type: 'emailTrigger',
        position: { x: 100, y: 100 },
        data: { label: 'Email Trigger' },
      },
      {
        id: 'condition',
        type: 'condition',
        position: { x: 350, y: 100 },
        data: { label: 'Check Keywords' },
      },
      {
        id: 'reply-yes',
        type: 'email',
        position: { x: 600, y: 50 },
        data: { label: 'Send Reply (Yes)' },
      },
      {
        id: 'reply-no',
        type: 'email',
        position: { x: 600, y: 200 },
        data: { label: 'Send Reply (No)' },
      },
    ],
    edges: [
      { id: 'e1', source: 'email-trigger', target: 'condition' },
      { id: 'e2', source: 'condition', target: 'reply-yes', label: 'Match' },
      { id: 'e3', source: 'condition', target: 'reply-no', label: 'No Match' },
    ],
    popularity: 85,
  },
  {
    id: 'scheduled-report',
    name: 'Scheduled Report Generator',
    description: 'Generate and email reports on a schedule (daily, weekly, monthly).',
    category: 'automation',
    tags: ['scheduled', 'reporting', 'email'],
    difficulty: 'beginner',
    nodes: [
      {
        id: 'cron',
        type: 'cronTrigger',
        position: { x: 100, y: 100 },
        data: { label: 'Schedule Trigger' },
      },
      {
        id: 'query-db',
        type: 'postgres',
        position: { x: 350, y: 100 },
        data: { label: 'Query Database' },
      },
      {
        id: 'format',
        type: 'set',
        position: { x: 600, y: 100 },
        data: { label: 'Format Report' },
      },
      {
        id: 'send-email',
        type: 'email',
        position: { x: 850, y: 100 },
        data: { label: 'Email Report' },
      },
    ],
    edges: [
      { id: 'e1', source: 'cron', target: 'query-db' },
      { id: 'e2', source: 'query-db', target: 'format' },
      { id: 'e3', source: 'format', target: 'send-email' },
    ],
    popularity: 92,
  },

  // ============================================
  // INTEGRATION TEMPLATES
  // ============================================
  {
    id: 'slack-notifications',
    name: 'Multi-Channel Slack Notifications',
    description: 'Send notifications to multiple Slack channels based on events.',
    category: 'integration',
    tags: ['slack', 'notifications', 'messaging'],
    difficulty: 'beginner',
    nodes: [
      {
        id: 'webhook',
        type: 'webhook',
        position: { x: 100, y: 100 },
        data: { label: 'Webhook Trigger' },
      },
      {
        id: 'switch',
        type: 'switch',
        position: { x: 350, y: 100 },
        data: { label: 'Route by Type' },
      },
      {
        id: 'slack-ops',
        type: 'slack',
        position: { x: 600, y: 50 },
        data: { label: '#ops' },
      },
      {
        id: 'slack-sales',
        type: 'slack',
        position: { x: 600, y: 150 },
        data: { label: '#sales' },
      },
      {
        id: 'slack-general',
        type: 'slack',
        position: { x: 600, y: 250 },
        data: { label: '#general' },
      },
    ],
    edges: [
      { id: 'e1', source: 'webhook', target: 'switch' },
      { id: 'e2', source: 'switch', target: 'slack-ops', label: 'Ops' },
      { id: 'e3', source: 'switch', target: 'slack-sales', label: 'Sales' },
      { id: 'e4', source: 'switch', target: 'slack-general', label: 'Other' },
    ],
    popularity: 88,
  },
  {
    id: 'sync-sheets',
    name: 'Google Sheets Sync',
    description: 'Synchronize data between Google Sheets and a database.',
    category: 'integration',
    tags: ['google', 'sheets', 'database', 'sync'],
    difficulty: 'intermediate',
    nodes: [
      {
        id: 'sheet-watch',
        type: 'googleSheetsTrigger',
        position: { x: 100, y: 100 },
        data: { label: 'Watch Sheet' },
      },
      {
        id: 'check-db',
        type: 'postgres',
        position: { x: 350, y: 100 },
        data: { label: 'Check Exists' },
      },
      {
        id: 'condition',
        type: 'condition',
        position: { x: 600, y: 100 },
        data: { label: 'Exists?' },
      },
      {
        id: 'update',
        type: 'postgres',
        position: { x: 850, y: 50 },
        data: { label: 'Update' },
      },
      {
        id: 'insert',
        type: 'postgres',
        position: { x: 850, y: 200 },
        data: { label: 'Insert' },
      },
    ],
    edges: [
      { id: 'e1', source: 'sheet-watch', target: 'check-db' },
      { id: 'e2', source: 'check-db', target: 'condition' },
      { id: 'e3', source: 'condition', target: 'update', label: 'Yes' },
      { id: 'e4', source: 'condition', target: 'insert', label: 'No' },
    ],
    popularity: 75,
  },

  // ============================================
  // AI TEMPLATES
  // ============================================
  {
    id: 'ai-chatbot',
    name: 'AI Chatbot Flow',
    description: 'Build an AI-powered chatbot with context and memory.',
    category: 'ai',
    tags: ['ai', 'chatbot', 'openai', 'automation'],
    difficulty: 'intermediate',
    nodes: [
      {
        id: 'chat-input',
        type: 'chatTrigger',
        position: { x: 100, y: 100 },
        data: { label: 'Chat Input' },
      },
      {
        id: 'get-history',
        type: 'postgres',
        position: { x: 350, y: 100 },
        data: { label: 'Get History' },
      },
      {
        id: 'ai-agent',
        type: 'aiAgent',
        position: { x: 600, y: 100 },
        data: { label: 'AI Agent' },
      },
      {
        id: 'save-history',
        type: 'postgres',
        position: { x: 850, y: 100 },
        data: { label: 'Save Response' },
      },
      {
        id: 'reply',
        type: 'chatTrigger',
        position: { x: 1100, y: 100 },
        data: { label: 'Send Reply' },
      },
    ],
    edges: [
      { id: 'e1', source: 'chat-input', target: 'get-history' },
      { id: 'e2', source: 'get-history', target: 'ai-agent' },
      { id: 'e3', source: 'ai-agent', target: 'save-history' },
      { id: 'e4', source: 'save-history', target: 'reply' },
    ],
    popularity: 95,
  },
  {
    id: 'ai-content-generator',
    name: 'AI Content Generator',
    description: 'Generate marketing content using AI with templates.',
    category: 'ai',
    tags: ['ai', 'content', 'marketing', 'openai'],
    difficulty: 'beginner',
    nodes: [
      {
        id: 'webhook',
        type: 'webhook',
        position: { x: 100, y: 100 },
        data: { label: 'Content Request' },
      },
      {
        id: 'template',
        type: 'set',
        position: { x: 350, y: 100 },
        data: { label: 'Select Template' },
      },
      {
        id: 'openai',
        type: 'openai',
        position: { x: 600, y: 100 },
        data: { label: 'Generate Content' },
      },
      {
        id: 'format',
        type: 'set',
        position: { x: 850, y: 100 },
        data: { label: 'Format Output' },
      },
      {
        id: 'respond',
        type: 'httpResponse',
        position: { x: 1100, y: 100 },
        data: { label: 'Return Content' },
      },
    ],
    edges: [
      { id: 'e1', source: 'webhook', target: 'template' },
      { id: 'e2', source: 'template', target: 'openai' },
      { id: 'e3', source: 'openai', target: 'format' },
      { id: 'e4', source: 'format', target: 'respond' },
    ],
    popularity: 82,
  },

  // ============================================
  // DATA PROCESSING TEMPLATES
  // ============================================
  {
    id: 'data-pipeline',
    name: 'ETL Data Pipeline',
    description: 'Extract, Transform, Load data pipeline for data processing.',
    category: 'data',
    tags: ['etl', 'data', 'database', 'transformation'],
    difficulty: 'advanced',
    nodes: [
      {
        id: 'schedule',
        type: 'cronTrigger',
        position: { x: 100, y: 100 },
        data: { label: 'Schedule' },
      },
      {
        id: 'extract',
        type: 'httpRequest',
        position: { x: 350, y: 100 },
        data: { label: 'Extract Data' },
      },
      {
        id: 'validate',
        type: 'code',
        position: { x: 600, y: 100 },
        data: { label: 'Validate' },
      },
      {
        id: 'transform',
        type: 'code',
        position: { x: 850, y: 100 },
        data: { label: 'Transform' },
      },
      {
        id: 'load',
        type: 'postgres',
        position: { x: 1100, y: 100 },
        data: { label: 'Load to DB' },
      },
    ],
    edges: [
      { id: 'e1', source: 'schedule', target: 'extract' },
      { id: 'e2', source: 'extract', target: 'validate' },
      { id: 'e3', source: 'validate', target: 'transform' },
      { id: 'e4', source: 'transform', target: 'load' },
    ],
    popularity: 78,
  },
  {
    id: 'csv-to-json',
    name: 'CSV to JSON Converter',
    description: 'Convert CSV files to JSON format with validation.',
    category: 'data',
    tags: ['csv', 'json', 'conversion', 'files'],
    difficulty: 'beginner',
    nodes: [
      {
        id: 'file-upload',
        type: 'webhook',
        position: { x: 100, y: 100 },
        data: { label: 'Upload CSV' },
      },
      {
        id: 'parse',
        type: 'code',
        position: { x: 350, y: 100 },
        data: { label: 'Parse CSV' },
      },
      {
        id: 'validate',
        type: 'code',
        position: { x: 600, y: 100 },
        data: { label: 'Validate Data' },
      },
      {
        id: 'convert',
        type: 'set',
        position: { x: 850, y: 100 },
        data: { label: 'Convert to JSON' },
      },
      {
        id: 'download',
        type: 'httpResponse',
        position: { x: 1100, y: 100 },
        data: { label: 'Download JSON' },
      },
    ],
    edges: [
      { id: 'e1', source: 'file-upload', target: 'parse' },
      { id: 'e2', source: 'parse', target: 'validate' },
      { id: 'e3', source: 'validate', target: 'convert' },
      { id: 'e4', source: 'convert', target: 'download' },
    ],
    popularity: 70,
  },

  // ============================================
  // COMMUNICATION TEMPLATES
  // ============================================
  {
    id: 'email-campaign',
    name: 'Email Campaign Automation',
    description: 'Automate email campaigns with personalized content.',
    category: 'communication',
    tags: ['email', 'marketing', 'automation'],
    difficulty: 'intermediate',
    nodes: [
      {
        id: 'schedule',
        type: 'cronTrigger',
        position: { x: 100, y: 100 },
        data: { label: 'Schedule' },
      },
      {
        id: 'get-recipients',
        type: 'postgres',
        position: { x: 350, y: 100 },
        data: { label: 'Get Recipients' },
      },
      {
        id: 'batch',
        type: 'splitInBatches',
        position: { x: 600, y: 100 },
        data: { label: 'Batch' },
      },
      {
        id: 'personalize',
        type: 'set',
        position: { x: 850, y: 100 },
        data: { label: 'Personalize' },
      },
      {
        id: 'send',
        type: 'email',
        position: { x: 1100, y: 100 },
        data: { label: 'Send Email' },
      },
    ],
    edges: [
      { id: 'e1', source: 'schedule', target: 'get-recipients' },
      { id: 'e2', source: 'get-recipients', target: 'batch' },
      { id: 'e3', source: 'batch', target: 'personalize' },
      { id: 'e4', source: 'personalize', target: 'send' },
      { id: 'e5', source: 'send', target: 'batch' },
    ],
    popularity: 86,
  },
  {
    id: 'social-publisher',
    name: 'Social Media Publisher',
    description: 'Publish content to multiple social media platforms.',
    category: 'communication',
    tags: ['social', 'twitter', 'linkedin', 'facebook'],
    difficulty: 'intermediate',
    nodes: [
      {
        id: 'trigger',
        type: 'webhook',
        position: { x: 100, y: 100 },
        data: { label: 'Content Ready' },
      },
      {
        id: 'validate',
        type: 'code',
        position: { x: 350, y: 100 },
        data: { label: 'Validate & Format' },
      },
      {
        id: 'twitter',
        type: 'twitter',
        position: { x: 600, y: 50 },
        data: { label: 'Twitter' },
      },
      {
        id: 'linkedin',
        type: 'linkedin',
        position: { x: 600, y: 150 },
        data: { label: 'LinkedIn' },
      },
      {
        id: 'facebook',
        type: 'facebook',
        position: { x: 600, y: 250 },
        data: { label: 'Facebook' },
      },
      {
        id: 'aggregate',
        type: 'merge',
        position: { x: 850, y: 150 },
        data: { label: 'Aggregate Results' },
      },
    ],
    edges: [
      { id: 'e1', source: 'trigger', target: 'validate' },
      { id: 'e2', source: 'validate', target: 'twitter' },
      { id: 'e3', source: 'validate', target: 'linkedin' },
      { id: 'e4', source: 'validate', target: 'facebook' },
      { id: 'e5', source: 'twitter', target: 'aggregate' },
      { id: 'e6', source: 'linkedin', target: 'aggregate' },
      { id: 'e7', source: 'facebook', target: 'aggregate' },
    ],
    popularity: 80,
  },
];

/**
 * Get templates by category
 */
export const getTemplatesByCategory = (category: WorkflowTemplate['category']): WorkflowTemplate[] => {
  return WORKFLOW_TEMPLATES.filter((t) => t.category === category);
};

/**
 * Get template by ID
 */
export const getTemplateById = (id: string): WorkflowTemplate | undefined => {
  return WORKFLOW_TEMPLATES.find((t) => t.id === id);
};

/**
 * Search templates
 */
export const searchTemplates = (query: string): WorkflowTemplate[] => {
  const lowerQuery = query.toLowerCase();
  return WORKFLOW_TEMPLATES.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
};

/**
 * Get popular templates
 */
export const getPopularTemplates = (limit: number = 6): WorkflowTemplate[] => {
  return [...WORKFLOW_TEMPLATES]
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, limit);
};
