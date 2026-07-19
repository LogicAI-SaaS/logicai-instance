/**
 * NodeConfigModal - Modal for Node Configuration
 * Features:
 * - Modern UI with glassmorphism effects
 * - Opens as a centered modal overlay
 * - Dynamic form based on node type
 * - LogicAI-style dynamic variables from REAL execution data
 * - DRAG AND DROP data sources into input fields
 * - Display output data from executed nodes
 * - Clean, focused, modern UI
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import { X, Settings, ArrowLeft, ArrowRight, ChevronDown, ChevronRight, Braces, GripVertical, ChevronDownSquare, FolderOpen, FileText, SlidersHorizontal, Sparkles, Info, RotateCcw, AlertTriangle, StickyNote, Palette, GitFork, PenTool } from 'lucide-react';
import type { Edge } from '@xyflow/react';
import type { CustomNode, BaseNodeConfig } from '../../types/node';
import { FormBuilderField } from './FormBuilderField';
import { FilterBuilderField } from './FilterBuilderField';
import { SortBuilderField } from './SortBuilderField';
import { CodeEditorField } from './CodeEditorField';
import { WorkflowSelectField } from './WorkflowSelectField';
import { HttpRequestBuilderField } from './HttpRequestBuilderField';
import { FtpBuilderField } from './FtpBuilderField';
import { CleaningRulesBuilderField } from './CleaningRulesBuilderField';
import { BrowserActionsBuilderField } from './BrowserActionsBuilderField';
import { EnginesSelectField } from './EnginesSelectField';
import { DebugOperationsBuilderField } from './DebugOperationsBuilderField';
import { GhostOperationsBuilderField } from './GhostOperationsBuilderField';
import { AiBuiltinToolsField } from './AiBuiltinToolsField';
import { AiOptionsField } from './AiOptionsField';
import { IfConditionsBuilderField } from './IfConditionsBuilderField';
import { SqlQueryBuilderField, type SqlBuilderConnection } from './SqlQueryBuilderField';
import DatabaseConnectionField, { type DbNodeType, type ResolvedConnection } from './DatabaseConnectionField';
import { CredentialPickerSection } from '../credentials/CredentialPickerSection';
import { NODE_CREDENTIAL_MAP } from '../../types/credentials';
import { NODE_TYPES_METADATA } from '../../types/node';
import { suggestVariables } from '../../lib/variableParser';
import {
  Webhook, Globe, Variable, GitBranch, Edit, Code, Filter, Hash, Grid, Clock,
  AlertCircle, PlaySquare, Activity, FileInput, Rss, Upload, Terminal, Database,
  Mail, MessageSquare, MessageCircle, Send, Table, HardDrive, Table2, Book, Trello,
  Bot, Mic, Archive, Lock, ArrowUpDown, File, GitMerge, Cpu,
  UserCheck, Shield, Search, Bug, Eye, Zap, Ghost,
  Smartphone, Laptop, Monitor, Radio, Server, MousePointerClick, RefreshCw,
  Kanban,
} from 'lucide-react';

// Custom scrollbar + select option styles
const customScrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(31, 41, 55, 0.5);
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(75, 85, 99, 0.8);
    border-radius: 4px;
    transition: background 0.2s;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(107, 114, 128, 1);
  }
  select {
    color-scheme: dark;
  }
  option {
    background-color: #0d0d0d;
    color: #ffffff;
  }
`;

// Sample output data for each node type (matches actual node execute() return shape)
const NODE_OUTPUT_SAMPLES: Partial<Record<string, any>> = {
  // ─── Triggers ────────────────────────────────────────────────────────────────
  clickTrigger: {
    _trigger: {
      type: 'manualClick',
      mode: 'ui',
      buttonText: 'Execute Workflow',
      requireConfirmation: false,
      timestamp: '2024-01-15T10:30:00.000Z',
      triggeredBy: 'user_interaction',
      executionId: 'clicktrigger-1705312200000-abc123',
    },
  },
  webhook: {
    body: { username: 'john_doe', email: 'john@example.com', action: 'signup' },
    headers: { 'content-type': 'application/json', 'x-source': 'web' },
    query: { source: 'web', ref: 'landing' },
    method: 'POST',
    path: '/webhook/my-workflow',
  },
  schedule: {
    _schedule: {
      cronExpression: '0 9 * * 1-5',
      nextExecution: '2024-01-16T09:00:00.000Z',
      triggerTimes: 1,
    },
  },
  cronTrigger: {
    _cronTrigger: {
      expression: '0 9 * * 1-5',
      nextRun: '2024-01-16T09:00:00.000Z',
      lastRun: '2024-01-15T09:00:00.000Z',
      timezone: 'UTC',
      description: 'Every weekday at 9:00 AM',
    },
  },
  emailTrigger: {
    from: 'sender@example.com',
    to: ['recipient@myapp.com'],
    subject: 'New order #1234',
    body: 'Hello, a new order was placed.',
    date: '2024-01-15T10:30:00.000Z',
    messageId: '<abc123@example.com>',
    attachments: [],
  },
  httpPollTrigger: {
    status: 200,
    data: { id: 42, status: 'updated', timestamp: '2024-01-15T10:30:00.000Z' },
    polledAt: '2024-01-15T10:30:00.000Z',
    url: 'https://api.example.com/status',
    changed: true,
  },
  formTrigger: {
    formId: 'form_abc123',
    submittedAt: '2024-01-15T10:30:00.000Z',
    fields: {
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Hello, I would like more information.',
    },
    metadata: { ip: '192.168.1.1', userAgent: 'Mozilla/5.0', referrer: 'https://example.com' },
  },
  chatTrigger: {
    sessionId: 'sess_abc123',
    message: 'Hello, can you help me?',
    from: { id: 'user_456', name: 'John Doe' },
    timestamp: '2024-01-15T10:30:00.000Z',
    channel: 'web-chat',
  },
  logicaiTrigger: {
    eventType: 'workflow.triggered',
    workflowId: 'wf_abc123',
    triggeredAt: '2024-01-15T10:30:00.000Z',
    payload: { source: 'logicai', data: {} },
  },
  errorTrigger: {
    error: {
      message: 'Node execution failed',
      nodeId: 'node_abc',
      nodeType: 'httpRequest',
      timestamp: '2024-01-15T10:30:00.000Z',
      stack: 'Error: Node execution failed\n  at HttpRequestNode.execute...',
    },
    workflowId: 'wf_abc123',
    executionId: 'exec_789',
  },

  // ─── HTTP / Integration ──────────────────────────────────────────────────────
  httpRequest: {
    id: 1,
    name: 'Sample API Response',
    status: 'active',
    createdAt: '2024-01-15T10:30:00.000Z',
    data: [
      { id: 1, name: 'Item 1', value: 100 },
      { id: 2, name: 'Item 2', value: 200 },
    ],
  },

  // ─── Logic / Control Flow ────────────────────────────────────────────────────
  if: {
    condition: true,
    branch: 'true',
    value: undefined,
  },
  condition: {
    condition: true,
    branch: 'true',
    value: undefined,
  },
  switch: {
    matchedCase: 'option_a',
    caseIndex: 0,
    value: 'processed_value',
    inputData: { id: 1, status: 'active' },
  },
  loop: {
    results: [
      { index: 0, item: { id: 1, name: 'Item 1' }, isFirst: true, isLast: false },
      { index: 1, item: { id: 2, name: 'Item 2' }, isFirst: false, isLast: false },
      { index: 2, item: { id: 3, name: 'Item 3' }, isFirst: false, isLast: true },
    ],
    count: 3,
    operation: 'forEach',
  },
  merge: {
    merged: [
      { id: 1, name: 'John', source: 'a', email: 'john@example.com' },
      { id: 2, name: 'Jane', source: 'b', email: 'jane@example.com' },
    ],
    count: 2,
    strategy: 'merge',
  },
  splitInBatches: {
    batch: [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
      { id: 3, name: 'Item 3' },
    ],
    batchIndex: 0,
    batchSize: 3,
    totalItems: 9,
    hasMore: true,
  },
  onSuccessFailure: {
    status: 'success',
    executionId: 'exec_abc123',
    startedAt: '2024-01-15T10:30:00.000Z',
    finishedAt: '2024-01-15T10:30:05.000Z',
    durationMs: 5000,
  },
  executeWorkflow: {
    workflowId: 'wf_sub_abc123',
    executionId: 'exec_sub_789',
    status: 'success',
    result: { processed: true, output: 'Workflow completed' },
    durationMs: 1200,
  },
  humanInTheLoop: {
    taskId: 'task_abc123',
    status: 'approved',
    approvedBy: 'admin@example.com',
    approvedAt: '2024-01-15T11:00:00.000Z',
    notes: 'Looks good',
    inputData: { invoice: 1234, amount: 500 },
  },
  wait: {
    waitedMs: 5000,
    resumedAt: '2024-01-15T10:30:05.000Z',
    condition: 'timeout',
  },

  // ─── Data Manipulation ───────────────────────────────────────────────────────
  editFields: {
    id: 123,
    fullName: 'John Doe',
    email: 'john@example.com',
    status: 'processed',
    updatedAt: '2024-01-15T10:30:00.000Z',
  },
  setVariable: {
    id: 123,
    username: 'john_doe',
    email: 'john@example.com',
    myVariable: 'Hello World',
  },
  filter: [
    { id: 1, name: 'Active User', status: 'active', score: 92 },
    { id: 3, name: 'Another Match', status: 'active', score: 87 },
  ],
  sort: [
    { id: 3, name: 'Alice', score: 98 },
    { id: 1, name: 'Bob', score: 92 },
    { id: 2, name: 'Charlie', score: 85 },
  ],
  code: {
    result: 'Execution successful',
    output: { processed: true, count: 42, items: ['a', 'b', 'c'] },
    logs: ['Processing started', 'Step 1 complete', 'Done'],
    executionTime: 150,
  },
  date: {
    iso: '2024-01-15T10:30:00.000Z',
    timestamp: 1705312200000,
    formatted: 'January 15, 2024',
    components: { year: 2024, month: 1, day: 15, hour: 10, minute: 30, second: 0 },
    timezone: 'UTC',
    operation: 'now',
  },
  uuid: {
    uuid: '550e8400-e29b-41d4-a716-446655440000',
    version: 4,
    input: null,
  },
  textFormatter: {
    output: 'Hello, World!',
    input: 'hello, world!',
    operation: 'uppercase',
    length: 13,
  },
  htmlExtract: {
    title: 'Example Page',
    text: 'Extracted text content from the page',
    links: ['https://example.com/page1', 'https://example.com/page2'],
    meta: { description: 'Page description', keywords: 'example, page' },
    html: '<h1>Example Page</h1>',
  },
  crypto: {
    input: 'Hello World',
    output: '2ef7bde608ce5404e97d5f042f95f89f1c232871',
    algorithm: 'sha1',
    encoding: 'hex',
  },
  compression: {
    originalSize: 1024,
    compressedSize: 512,
    ratio: 0.5,
    format: 'gzip',
    output: '<compressed_buffer>',
  },
  readWriteBinaryFile: {
    path: '/data/output.json',
    size: 1024,
    encoding: 'utf-8',
    content: '{"key":"value"}',
    operation: 'read',
  },

  // ─── AI / LLM ────────────────────────────────────────────────────────────────
  openAI: {
    id: 'chatcmpl-abc123',
    object: 'chat.completion',
    created: 1705312200,
    model: 'gpt-4o',
    choices: [{
      index: 0,
      message: { role: 'assistant', content: 'Hello! How can I help you today?' },
      finishReason: 'stop',
    }],
    usage: { promptTokens: 12, completionTokens: 10, totalTokens: 22 },
  },
  anthropic: {
    id: 'msg_abc123',
    type: 'message',
    role: 'assistant',
    content: [{ type: 'text', text: 'I can help you with that. Here\'s what I found...' }],
    model: 'claude-3-5-sonnet-20241022',
    stopReason: 'end_turn',
    usage: { inputTokens: 15, outputTokens: 25 },
  },
  gemini: {
    candidates: [{
      content: { parts: [{ text: 'Here is my response to your query.' }], role: 'model' },
      finishReason: 'STOP',
      safetyRatings: [],
    }],
    usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 12, totalTokenCount: 22 },
    modelVersion: 'gemini-1.5-pro',
  },
  perplexity: {
    id: 'resp_abc123',
    model: 'llama-3.1-sonar-large-128k-online',
    choices: [{
      index: 0,
      message: { role: 'assistant', content: 'Based on recent sources...' },
      finishReason: 'stop',
    }],
    citations: ['https://example.com/source1', 'https://example.com/source2'],
    usage: { promptTokens: 10, completionTokens: 50, totalTokens: 60 },
  },
  openrouter: {
    id: 'gen_abc123',
    model: 'openai/gpt-4o',
    choices: [{
      index: 0,
      message: { role: 'assistant', content: 'Here is my answer.' },
      finishReason: 'stop',
    }],
    usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
  },
  ollama: {
    model: 'llama3.2',
    response: 'Here is my response generated locally.',
    done: true,
    context: [1, 2, 3],
    totalDuration: 1500000000,
    evalCount: 25,
    evalDuration: 1200000000,
  },
  glm: {
    id: 'resp_abc123',
    model: 'glm-4',
    choices: [{
      index: 0,
      message: { role: 'assistant', content: 'Je peux vous aider avec ça.' },
      finishReason: 'stop',
    }],
    usage: { promptTokens: 8, completionTokens: 12, totalTokens: 20 },
  },
  aiAgent: {
    output: 'Task completed successfully.',
    steps: [
      { tool: 'search', input: 'query', output: 'search results' },
      { tool: 'summarize', input: 'search results', output: 'summary' },
    ],
    totalTokens: 350,
    model: 'gpt-4o',
  },
  embeddings: {
    model: 'text-embedding-ada-002',
    object: 'list',
    data: [{ object: 'embedding', index: 0, embedding: [0.123, -0.456, 0.789] }],
    usage: { promptTokens: 8, totalTokens: 8 },
  },
  vectorStore: {
    operation: 'query',
    matches: [
      { id: 'vec_1', score: 0.95, metadata: { text: 'Similar document 1', source: 'doc.pdf' } },
      { id: 'vec_2', score: 0.88, metadata: { text: 'Similar document 2', source: 'page.html' } },
    ],
    namespace: 'default',
  },
  smartDataCleaner: {
    cleaned: { name: 'John Doe', email: 'john@example.com', phone: '+1-555-0123' },
    changes: [
      { field: 'email', original: 'JOHN@EXAMPLE.COM', cleaned: 'john@example.com' },
      { field: 'phone', original: '5550123', cleaned: '+1-555-0123' },
    ],
    quality: { score: 0.95, issues: [] },
  },
  aiCostGuardian: {
    allowed: true,
    estimatedCost: 0.0025,
    budget: { used: 12.50, limit: 50.00, remaining: 37.50 },
    model: 'gpt-4o',
    tokens: { prompt: 100, completion: 150 },
  },
  aggregatorMultiSearch: {
    query: 'example search query',
    results: [
      { engine: 'google', title: 'Result 1', url: 'https://example.com/1', snippet: '...' },
      { engine: 'bing', title: 'Result 2', url: 'https://example.com/2', snippet: '...' },
    ],
    totalResults: 2,
    engines: ['google', 'bing'],
  },

  // ─── Databases ───────────────────────────────────────────────────────────────
  mySQL: {
    rows: [
      { id: 1, name: 'John Doe', email: 'john@example.com', createdAt: '2024-01-01' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', createdAt: '2024-01-02' },
    ],
    rowCount: 2,
    fields: ['id', 'name', 'email', 'createdAt'],
    affectedRows: 0,
  },
  postgreSQL: {
    rows: [
      { id: 1, title: 'Product A', price: 29.99, stock: 150 },
      { id: 2, title: 'Product B', price: 49.99, stock: 75 },
    ],
    rowCount: 2,
    command: 'SELECT',
    fields: [{ name: 'id' }, { name: 'title' }, { name: 'price' }, { name: 'stock' }],
  },
  mongoDB: {
    documents: [
      { _id: '507f1f77bcf86cd799439011', name: 'Document 1', value: 100, tags: ['a', 'b'] },
      { _id: '507f191e810c19729de860ea', name: 'Document 2', value: 200, tags: ['c'] },
    ],
    count: 2,
    acknowledged: true,
  },
  redis: {
    key: 'cache:user:123',
    value: '{"id":123,"name":"John Doe","role":"admin"}',
    ttl: 3600,
    type: 'string',
    operation: 'get',
  },
  supabase: {
    data: [
      { id: 1, title: 'Row 1', status: 'active', created_at: '2024-01-15T10:00:00Z' },
      { id: 2, title: 'Row 2', status: 'inactive', created_at: '2024-01-14T09:00:00Z' },
    ],
    count: 2,
    status: 200,
    statusText: 'OK',
  },
  firebase: {
    documents: [
      { id: 'doc_abc', data: { name: 'Firebase Doc', value: 42, timestamp: '2024-01-15' } },
    ],
    collection: 'my-collection',
    count: 1,
  },
  sqlite: {
    rows: [
      { id: 1, key: 'config.theme', value: 'dark' },
      { id: 2, key: 'config.lang', value: 'en' },
    ],
    rowCount: 2,
    lastID: 0,
    changes: 0,
  },
  s3: {
    bucket: 'my-bucket',
    key: 'uploads/file.json',
    etag: '"d41d8cd98f00b204e9800998ecf8427e"',
    size: 1024,
    lastModified: '2024-01-15T10:30:00.000Z',
    contentType: 'application/json',
    url: 'https://my-bucket.s3.amazonaws.com/uploads/file.json',
  },

  // ─── Google ───────────────────────────────────────────────────────────────────
  googleSheets: {
    spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjGMUUqptbfs',
    range: 'Sheet1!A1:D4',
    values: [
      ['Name', 'Email', 'Phone', 'Status'],
      ['John Doe', 'john@example.com', '555-1234', 'Active'],
      ['Jane Smith', 'jane@example.com', '555-5678', 'Active'],
    ],
    rowCount: 3,
    columnCount: 4,
    updatedRows: 0,
  },
  googleDrive: {
    kind: 'drive#file',
    id: '1a2b3c4d5e6f7g8h9i0j',
    name: 'My Document.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: '45678',
    modifiedTime: '2024-01-15T10:30:00.000Z',
    webViewLink: 'https://drive.google.com/file/d/1a2b3c4d/view',
    parents: ['folder_abc123'],
  },
  gmail: {
    id: 'msg_abc123',
    threadId: 'thread_xyz789',
    labelIds: ['INBOX', 'UNREAD'],
    from: 'sender@example.com',
    to: ['me@example.com'],
    subject: 'Hello from Gmail automation',
    date: '2024-01-15T10:30:00.000Z',
    snippet: 'This is the beginning of the email...',
    body: 'Full email body text here.',
  },

  // ─── Storage ─────────────────────────────────────────────────────────────────
  oneDrive: {
    id: 'file_abc123',
    name: 'document.pdf',
    size: 102400,
    createdDateTime: '2024-01-15T10:30:00.000Z',
    lastModifiedDateTime: '2024-01-15T10:30:00.000Z',
    webUrl: 'https://onedrive.live.com/view?id=file_abc123',
    folder: null,
    file: { mimeType: 'application/pdf' },
  },
  dropbox: {
    name: 'photo.jpg',
    path_lower: '/photos/photo.jpg',
    id: 'id:abc123',
    client_modified: '2024-01-15T10:30:00.000Z',
    server_modified: '2024-01-15T10:30:01.000Z',
    rev: 'abc123def456',
    size: 204800,
    is_downloadable: true,
  },
  ftp: {
    path: '/uploads/data.csv',
    size: 8192,
    modified: '2024-01-15T10:30:00.000Z',
    permissions: '-rw-r--r--',
    operation: 'upload',
    success: true,
  },
  ssh: {
    stdout: 'total 48\ndrwxr-xr-x  5 ubuntu ubuntu 4096 Jan 15 10:30 .\n',
    stderr: '',
    exitCode: 0,
    command: 'ls -la',
    host: '192.168.1.100',
  },

  // ─── Communication ────────────────────────────────────────────────────────────
  email: {
    accepted: ['recipient@example.com'],
    rejected: [],
    messageId: '<abc123@mailer.example.com>',
    response: '250 OK: message queued',
    envelope: { from: 'sender@example.com', to: ['recipient@example.com'] },
  },
  twilio: {
    sid: 'SMxxxxxxxx',
    accountSid: 'ACxxxxxxxx',
    to: '+1-555-0100',
    from: '+1-555-0200',
    body: 'Your verification code is: 123456',
    status: 'sent',
    direction: 'outbound-api',
    price: '-0.0075',
    priceUnit: 'USD',
  },
  sendGrid: {
    statusCode: 202,
    body: '',
    headers: { 'x-message-id': 'abc123', server: 'nginx' },
    to: 'recipient@example.com',
    subject: 'Your order confirmation',
  },
  mailchimp: {
    id: 'campaign_abc123',
    status: 'sent',
    emailsSent: 1250,
    openRate: 0.32,
    clickRate: 0.12,
    unsubscribeCount: 3,
    listName: 'Newsletter Subscribers',
  },

  // ─── Messaging ──────────────────────────────────────────────────────────────
  slack: {
    ok: true,
    channel: 'C0123456789',
    ts: '1705312200.123456',
    message: { text: 'Workflow notification sent', bot_id: 'B12345678', type: 'message' },
  },
  slackSendMessage: {
    ok: true,
    channel: 'C0123456789',
    ts: '1705312200.123456',
    message: { text: 'Hello from workflow!', bot_id: 'B12345678' },
  },
  slackUpdateMessage: {
    ok: true,
    channel: 'C0123456789',
    ts: '1705312200.123456',
    text: 'Updated message content',
  },
  slackUploadFile: {
    ok: true,
    file: {
      id: 'F0123456789',
      name: 'report.csv',
      mimetype: 'text/csv',
      size: 4096,
      url_private: 'https://files.slack.com/files/U0/F0/report.csv',
    },
  },
  discord: {
    id: '123456789012345678',
    type: 0,
    content: 'Workflow message sent!',
    channel_id: '111222333444555666',
    author: { id: '987654321', username: 'WorkflowBot', bot: true },
    timestamp: '2024-01-15T10:30:00.000000+00:00',
  },
  discordSendMessage: {
    id: '123456789012345678',
    content: 'Hello from workflow!',
    channel_id: '111222333444555666',
    timestamp: '2024-01-15T10:30:00.000000+00:00',
  },
  discordSendEmbed: {
    id: '987654321098765432',
    embeds: [{ title: 'Workflow Update', description: 'Task completed', color: 5763719 }],
    channel_id: '111222333444555666',
  },
  discordManageChannel: {
    id: '111222333444555666',
    type: 0,
    name: 'general',
    topic: 'Updated by workflow',
    guild_id: '999888777666555444',
  },
  telegram: {
    ok: true,
    result: {
      message_id: 12345,
      from: { id: 7654321, is_bot: true, first_name: 'WorkflowBot', username: 'workflow_bot' },
      chat: { id: -100123456789, title: 'My Group', type: 'supergroup' },
      date: 1705312200,
      text: 'Notification from workflow',
    },
  },
  telegramSendMessage: {
    ok: true,
    result: { message_id: 12346, chat: { id: 987654321, type: 'private' }, text: 'Hello from workflow!', date: 1705312200 },
  },
  telegramSendPhoto: {
    ok: true,
    result: { message_id: 12347, photo: [{ file_id: 'AgACAgIAAxk', width: 800, height: 600 }], caption: 'Photo caption' },
  },
  telegramBotCommand: {
    updateId: 123456789,
    message: { from: { id: 987654321, username: 'user' }, text: '/start', date: 1705312200 },
    command: 'start',
    args: [],
  },
  whatsapp: {
    messaging_product: 'whatsapp',
    contacts: [{ input: '+1234567890', wa_id: '1234567890' }],
    messages: [{ id: 'wamid.HBgNMTIzNDU2Nzg5MAUCABIYFDMzNEE1ODc4Q0ZGQTE4OUQ3NDBBAA==' }],
  },
  whatsappSendMessage: {
    messaging_product: 'whatsapp',
    contacts: [{ input: '+1234567890', wa_id: '1234567890' }],
    messages: [{ id: 'wamid.abc123' }],
  },
  whatsappSendMedia: {
    messaging_product: 'whatsapp',
    contacts: [{ input: '+1234567890', wa_id: '1234567890' }],
    messages: [{ id: 'wamid.media_abc123' }],
    mediaType: 'image',
  },
  whatsappSendLocation: {
    messaging_product: 'whatsapp',
    contacts: [{ input: '+1234567890', wa_id: '1234567890' }],
    messages: [{ id: 'wamid.location_abc123' }],
    location: { latitude: 48.8566, longitude: 2.3522, name: 'Paris', address: 'France' },
  },

  // ─── Social Media ────────────────────────────────────────────────────────────
  instagram: {
    id: '17896129668004550',
    media_type: 'IMAGE',
    media_url: 'https://example.com/photo.jpg',
    username: 'mybusiness',
    timestamp: '2024-01-15T10:30:00+0000',
    like_count: 42,
    comments_count: 5,
  },
  instagramPost: {
    id: '17896129668004551',
    permalink: 'https://www.instagram.com/p/abc123/',
    media_type: 'IMAGE',
    timestamp: '2024-01-15T10:30:00+0000',
    status: 'PUBLISHED',
  },
  instagramStory: {
    id: '17896129668004552',
    media_type: 'IMAGE',
    timestamp: '2024-01-15T10:30:00+0000',
    expiresAt: '2024-01-16T10:30:00+0000',
    status: 'PUBLISHED',
  },
  instagramReels: {
    id: '17896129668004553',
    media_type: 'REELS',
    permalink: 'https://www.instagram.com/reel/abc123/',
    timestamp: '2024-01-15T10:30:00+0000',
    status: 'PUBLISHED',
  },
  facebook: {
    id: '123456789',
    name: 'My Business Page',
    category: 'Software Company',
    fan_count: 1250,
    posts: { data: [{ id: 'post_abc', message: 'Latest update', created_time: '2024-01-15T10:30:00+0000' }] },
  },
  facebookPost: {
    id: 'post_abc123_xyz',
    story: 'My Business Page shared a link.',
    created_time: '2024-01-15T10:30:00+0000',
    permalink_url: 'https://www.facebook.com/my-page/posts/abc123',
  },
  facebookUploadPhoto: {
    id: 'photo_abc123',
    post_id: 'post_xyz789',
    url: 'https://www.facebook.com/photo?fbid=photo_abc123',
  },
  facebookPagePost: {
    id: 'page_post_abc123',
    pageId: '987654321',
    created_time: '2024-01-15T10:30:00+0000',
    permalink_url: 'https://www.facebook.com/page/posts/abc123',
  },
  twitter: {
    id: '1234567890123456789',
    text: 'Hello from our workflow automation! 🚀',
    author_id: '987654321',
    created_at: '2024-01-15T10:30:00.000Z',
    public_metrics: { retweet_count: 5, reply_count: 2, like_count: 15, quote_count: 1 },
  },
  twitterTweet: {
    data: {
      id: '1234567890123456790',
      text: 'Automated tweet from workflow! #automation',
      created_at: '2024-01-15T10:30:00.000Z',
    },
  },
  twitterReply: {
    data: {
      id: '1234567890123456791',
      text: 'Replying to your tweet with automation!',
      in_reply_to_user_id: '111222333',
    },
  },
  twitterLike: { data: { liked: true } },
  twitterRetweet: { data: { retweeted: true } },
  linkedin: {
    id: 'urn:li:share:123456789',
    activity: 'urn:li:activity:123456789',
    created: { actor: 'urn:li:person:abc123', time: 1705312200000 },
    text: { text: 'Sharing via workflow automation.' },
  },
  linkedinPost: {
    id: 'urn:li:share:123456790',
    activity: 'urn:li:activity:123456790',
    lifecycleState: 'PUBLISHED',
  },
  linkedinShareArticle: {
    id: 'urn:li:share:123456791',
    articleUrl: 'https://example.com/my-article',
    title: 'Shared Article Title',
    lifecycleState: 'PUBLISHED',
  },
  linkedinMessage: {
    id: 'urn:li:message:123456789',
    to: 'urn:li:person:xyz789',
    body: 'Hello from workflow!',
    deliveredAt: '2024-01-15T10:30:00.000Z',
  },
  tiktok: {
    data: { share_url: 'https://www.tiktok.com/@user/video/123456789', video_id: '123456789' },
    extra: { logid: 'log_abc' },
  },
  tiktokUploadVideo: {
    data: { publish_id: 'publ_abc123', status: 'PROCESSING_UPLOAD' },
    extra: { logid: 'log_abc' },
  },
  tiktokGetVideoInfo: {
    data: {
      videos: [{
        id: '123456789', title: 'My Video', cover_image_url: 'https://p16.tiktokcdn.com/thumb.jpg',
        view_count: 5000, like_count: 350, share_count: 42, comment_count: 18,
        duration: 30, create_time: 1705312200,
      }],
    },
  },
  tiktokGetUserInfo: {
    data: {
      user: { open_id: 'user_abc', union_id: 'union_xyz', display_name: 'MyAccount', avatar_url: 'https://p16.tiktokcdn.com/avatar.jpg' },
    },
  },
  twitch: {
    data: [{
      id: '123456789',
      user_login: 'mychannel',
      type: 'live',
      title: 'Live stream title',
      viewer_count: 342,
      started_at: '2024-01-15T10:00:00Z',
      thumbnail_url: 'https://static-cdn.jtvnw.net/thumbnails/live/123-{width}x{height}.jpg',
    }],
  },
  youtube: {
    kind: 'youtube#video',
    etag: 'etag_abc123',
    id: 'dQw4w9WgXcQ',
    snippet: { title: 'My Video Title', description: 'Video description', publishedAt: '2024-01-15T10:30:00.000Z' },
    statistics: { viewCount: '12500', likeCount: '450', commentCount: '38' },
  },
  kick: {
    data: {
      id: 12345,
      slug: 'mychannel',
      is_live: true,
      session: { viewers: 82, playback_url: 'https://kick.com/mychannel' },
    },
  },
  snapchat: {
    media: { id: 'media_abc123', status: 'ACTIVE', type: 'IMAGE' },
    ad: { id: 'ad_abc123', status: 'ACTIVE', name: 'My Snapchat Ad' },
  },

  // ─── CRM / Project Management ─────────────────────────────────────────────────
  hubSpot: {
    id: '12345',
    properties: {
      email: 'contact@example.com',
      firstname: 'John',
      lastname: 'Doe',
      hs_object_id: '12345',
      createdate: '2024-01-15T10:30:00.000Z',
      lastmodifieddate: '2024-01-15T10:30:00.000Z',
    },
    createdAt: '2024-01-15T10:30:00.000Z',
    updatedAt: '2024-01-15T10:30:00.000Z',
    archived: false,
  },
  salesforce: {
    Id: '0011g00003DmUQaAAN',
    Name: 'Acme Corp',
    Account: { Id: 'acc_abc', Name: 'Acme Corp' },
    Status: 'Open',
    Amount: 15000,
    CloseDate: '2024-03-31',
    StageName: 'Negotiation/Review',
  },
  jira: {
    id: 'PROJ-123',
    key: 'PROJ-123',
    fields: {
      summary: 'Bug: Login fails on mobile',
      status: { name: 'In Progress' },
      assignee: { displayName: 'John Doe', emailAddress: 'john@example.com' },
      priority: { name: 'High' },
      created: '2024-01-15T10:30:00.000Z',
    },
    self: 'https://mycompany.atlassian.net/rest/api/3/issue/PROJ-123',
  },
  asana: {
    gid: '1234567890123456',
    name: 'Design new landing page',
    notes: 'This task needs to be completed by end of sprint.',
    completed: false,
    due_on: '2024-01-31',
    assignee: { gid: 'user_abc', name: 'Jane Smith' },
    projects: [{ gid: 'proj_xyz', name: 'Website Redesign' }],
  },
  linear: {
    id: 'issue_abc123',
    identifier: 'ENG-42',
    title: 'Implement dark mode',
    description: 'Add dark mode support to the web app.',
    state: { name: 'In Progress', color: '#f2c94c' },
    assignee: { name: 'Alice', email: 'alice@example.com' },
    priority: 2,
  },
  zendesk: {
    ticket: {
      id: 98765,
      subject: 'Issue with my account',
      status: 'open',
      priority: 'normal',
      requester_id: 123456,
      assignee_id: 654321,
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-01-15T10:30:00Z',
    },
  },

  // ─── E-commerce ────────────────────────────────────────────────────────────────
  stripe: {
    id: 'pi_3MtweB2eZvKYlo2C1234abcd',
    object: 'payment_intent',
    amount: 4999,
    currency: 'usd',
    status: 'succeeded',
    customer: 'cus_OkXxFr1234abcd',
    description: 'Order #1234 — Premium Plan',
    receipt_email: 'customer@example.com',
    created: 1705312200,
  },
  payPal: {
    id: 'PAYID-abc123',
    intent: 'CAPTURE',
    status: 'COMPLETED',
    purchase_units: [{ amount: { currency_code: 'USD', value: '49.99' } }],
    payer: { email_address: 'buyer@example.com', name: { given_name: 'John', surname: 'Doe' } },
    create_time: '2024-01-15T10:30:00Z',
    update_time: '2024-01-15T10:30:05Z',
  },
  shopify: {
    order: {
      id: 5678901234,
      order_number: '#1234',
      total_price: '49.99',
      currency: 'USD',
      financial_status: 'paid',
      fulfillment_status: null,
      customer: { id: 123, email: 'customer@example.com', first_name: 'John', last_name: 'Doe' },
      line_items: [{ id: 1, title: 'Premium Plan', quantity: 1, price: '49.99' }],
      created_at: '2024-01-15T10:30:00.000Z',
    },
  },
  wooCommerce: {
    id: 12345,
    status: 'processing',
    currency: 'USD',
    date_created: '2024-01-15T10:30:00',
    total: '49.99',
    billing: { first_name: 'John', last_name: 'Doe', email: 'john@example.com' },
    line_items: [{ id: 1, name: 'Product Name', quantity: 1, total: '49.99' }],
  },

  // ─── Other Services ──────────────────────────────────────────────────────────
  notion: {
    object: 'list',
    results: [
      {
        id: 'page_abc123',
        archived: false,
        created_time: '2024-01-01T00:00:00.000Z',
        last_edited_time: '2024-01-15T10:30:00.000Z',
        properties: { title: { title: [{ text: { content: 'My Notion Page' } }] } },
        url: 'https://www.notion.so/page_abc123',
      },
    ],
    has_more: false,
  },
  trello: {
    id: 'board_abc123',
    name: 'Project Board',
    url: 'https://trello.com/b/abc123/project-board',
    lists: [
      { id: 'list_abc', name: 'To Do', cards: [{ id: 'card_1', name: 'Task 1', labels: [{ color: 'red', name: 'urgent' }] }] },
      { id: 'list_xyz', name: 'In Progress', cards: [] },
    ],
    members: [{ id: 'member_1', fullName: 'John Doe', username: 'johndoe' }],
  },
  airtable: {
    records: [
      {
        id: 'recABC123',
        createdTime: '2024-01-15T10:30:00.000Z',
        fields: { Name: 'John Doe', Email: 'john@example.com', Status: 'Active', Score: 92 },
      },
      {
        id: 'recXYZ789',
        createdTime: '2024-01-14T09:00:00.000Z',
        fields: { Name: 'Jane Smith', Email: 'jane@example.com', Status: 'Active', Score: 88 },
      },
    ],
    offset: undefined,
  },
  gitHub: {
    id: 12345678,
    node_id: 'R_kgDOABC123',
    name: 'example-repo',
    full_name: 'myorg/example-repo',
    private: false,
    owner: { login: 'myorg', id: 987654321, type: 'Organization' },
    html_url: 'https://github.com/myorg/example-repo',
    description: 'Example repository created via workflow',
    stargazers_count: 42,
    forks_count: 5,
    open_issues_count: 3,
    default_branch: 'main',
  },
  figma: {
    name: 'Design System',
    key: 'ABC123DEF456',
    last_modified: '2024-01-15T10:30:00Z',
    document: {
      id: 'doc_abc123',
      children: [
        {
          type: 'CANVAS',
          name: 'Page 1',
          children: [
            { type: 'FRAME', name: 'Button Component', width: 200, height: 50 },
            { type: 'FRAME', name: 'Input Component', width: 300, height: 40 },
          ],
        },
      ],
    },
    thumbnailUrl: 'https://www.figma.com/file/ABC123/thumbnail',
  },
  rssRead: {
    feed: {
      title: 'My RSS Feed',
      link: 'https://example.com',
      description: 'Latest news and updates',
    },
    items: [
      { title: 'Article 1', link: 'https://example.com/1', pubDate: '2024-01-15T10:00:00Z', summary: 'First article summary...' },
      { title: 'Article 2', link: 'https://example.com/2', pubDate: '2024-01-14T09:00:00Z', summary: 'Second article summary...' },
    ],
    itemCount: 2,
  },
  ghost: {
    post: {
      id: 'post_abc123',
      uuid: '550e8400-e29b-41d4-a716-446655440001',
      title: 'My Blog Post',
      slug: 'my-blog-post',
      status: 'published',
      published_at: '2024-01-15T10:30:00.000Z',
      url: 'https://myblog.ghost.io/my-blog-post/',
      reading_time: 3,
    },
  },
  noCodeBrowserAutomator: {
    steps: [
      { action: 'navigate', url: 'https://example.com', status: 'success' },
      { action: 'click', selector: '#submit-button', status: 'success' },
      { action: 'extract', selector: '.result', value: 'Action completed!', status: 'success' },
    ],
    screenshot: 'data:image/png;base64,iVBORw0KGgo...',
    pageTitle: 'Example Page',
    currentUrl: 'https://example.com/result',
  },
  liveCanvasDebugger: {
    canvasState: { nodes: 5, edges: 4, executedNodes: 3 },
    debugInfo: { activeNode: 'node_abc', executionStack: ['node_1', 'node_2', 'node_abc'] },
    timestamp: '2024-01-15T10:30:00.000Z',
  },
  socialMockupPreview: {
    mockup: {
      platform: 'instagram',
      previewUrl: 'data:image/png;base64,iVBORw0KGgo...',
      caption: 'My post caption',
      dimensions: { width: 1080, height: 1080 },
    },
    generatedAt: '2024-01-15T10:30:00.000Z',
  },
  rateLimiterBypass: {
    allowed: true,
    remaining: 45,
    limit: 100,
    resetAt: '2024-01-15T11:00:00.000Z',
    strategy: 'token_bucket',
  },
  windowsControl: {
    action: 'screenshot',
    result: { success: true, filepath: 'C:\\screenshots\\screen_20240115.png', width: 1920, height: 1080 },
    timestamp: '2024-01-15T10:30:00.000Z',
  },
  streaming: {
    chunks: ['Hello', ' World', '!'],
    totalTokens: 42,
    model: 'gpt-4o',
    finishReason: 'stop',
    streamComplete: true,
  },
  infrastructure: {
    service: 'docker',
    action: 'run',
    containerId: 'abc123def456',
    status: 'running',
    ports: { '8080/tcp': [{ HostIp: '0.0.0.0', HostPort: '8080' }] },
  },
  appleEcosystem: {
    success: true,
    action: 'createReminder',
    result: { id: 'reminder_abc', title: 'Call client', dueDate: '2024-01-16T14:00:00Z', list: 'Work' },
  },
  androidEcosystem: {
    success: true,
    action: 'sendSMS',
    result: { to: '+1-555-0100', message: 'Your code is: 123456', sent: true, timestamp: '2024-01-15T10:30:00.000Z' },
  },
};

interface NodeConfigModalProps {
  selectedNode: CustomNode | null;
  onNodeUpdate: (nodeId: string, config: BaseNodeConfig) => void;
  onClose: () => void;
  isOpen: boolean;
  nodes: CustomNode[];
  edges: Edge[];
  executionResults?: Record<string, any>; // Real execution results: { nodeId: outputData }
}

// Draggable Variable Item Component
interface DraggableVariableProps {
  variable: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }> | React.ReactNode;
  iconClassName?: string;
  onDragStart: (variable: string) => void;
  onDragEnd: () => void;
}

function DraggableVariable({ variable, label, description, icon, iconClassName, onDragStart, onDragEnd }: DraggableVariableProps) {
  const handleDragStart = (e: React.DragEvent) => {
    // NE PAS faire e.preventDefault() ici sinon le drag ne démarre pas !
    e.dataTransfer.setData('application/x-variable', variable);
    e.dataTransfer.effectAllowed = 'copy';
    onDragStart(variable);
  };

  // Render icon - if it's a component, create element with className; if it's already a node, render as-is
  const renderIcon = () => {
    if (typeof icon === 'function') {
      const IconComponent = icon as React.ComponentType<{ className?: string }>;
      return React.createElement(IconComponent, { className: iconClassName || 'w-4 h-4' });
    }
    // If icon is already a React element, render it
    if (React.isValidElement(icon)) {
      return icon;
    }
    // Fallback for non-renderable icons
    return null;
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg cursor-grab active:cursor-grabbing transition-all group border border-white/10 hover:border-brand-blue/40 select-none transform hover:scale-[1.02]"
    >
      <div className="pointer-events-none cursor-grab text-gray-500 group-hover:text-gray-400 transition-colors">
        {React.createElement(GripVertical, { className: 'w-4 h-4' })}
      </div>
      <div className="flex-1 min-w-0 pointer-events-none">
        <code className="text-xs text-brand-blue font-mono block truncate group-hover:text-blue-300 transition-colors">
          {variable}
        </code>
        <p className="text-[10px] text-gray-500 truncate group-hover:text-gray-400 transition-colors">{label}</p>
      </div>
      <div className="text-gray-400 pointer-events-none group-hover:text-gray-300 transition-colors">
        {renderIcon()}
      </div>
    </div>
  );
}

// JSON Explorer Component for dynamic variables
interface JsonExplorerProps {
  data: any;
  path?: string;
  onDragStart: (variable: string) => void;
  onDragEnd: () => void;
  level?: number;
}

function JsonExplorer({ data, path = '$json', onDragStart, onDragEnd, level = 0 }: JsonExplorerProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpand = (key: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const renderValue = (key: string | null, value: any, currentPath: string) => {
    const isObject = value !== null && typeof value === 'object';
    const isArray = Array.isArray(value);
    const variable = `{{ ${currentPath} }}`;
    const displayKey = key || '';

    if (isObject) {
      const isExpanded = expanded.has(currentPath);
      const itemCount = Object.keys(value).length;

      return (
        <div key={currentPath} className={level > 0 ? 'ml-4' : ''}>
          <div
            className="flex items-center gap-1 py-1 px-2 hover:bg-white/5 rounded cursor-pointer transition-colors group"
            onClick={() => toggleExpand(currentPath)}
          >
            {isExpanded ? (
              <ChevronDownSquare className="w-3.5 h-3.5 text-brand-blue flex-shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
            )}
            {isArray ? (
              <FolderOpen className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
            ) : (
              <Braces className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
            )}
            <span className="text-xs text-gray-300 font-mono flex-1">{displayKey}</span>
            <span className="text-[10px] text-gray-600">{itemCount} items</span>
          </div>
          {isExpanded && (
            <div className="ml-2 border-l border-white/10 pl-2">
              {Object.entries(value).map(([k, v]) => renderValue(k, v, `${currentPath}.${k}`))}
            </div>
          )}
        </div>
      );
    }

    return (
      <DraggableVariable
        key={currentPath}
        variable={variable}
        label={displayKey}
        description={String(value)}
        icon={
          <div className="w-6 h-6 flex items-center justify-center bg-white/10 rounded">
            {typeof value === 'string' ? (
              <FileText className="w-3 h-3 text-green-400" />
            ) : typeof value === 'number' ? (
              <Hash className="w-3 h-3 text-blue-400" />
            ) : typeof value === 'boolean' ? (
              <Activity className="w-3 h-3 text-orange-400" />
            ) : (
              <Variable className="w-3 h-3 text-gray-400" />
            )}
          </div>
        }
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      />
    );
  };

  return (
    <div>
      {data !== null && typeof data === 'object' ? (
        <div className="space-y-0.5">
          {Object.entries(data).map(([key, value]) => renderValue(key, value, `${path}.${key}`))}
        </div>
      ) : (
        <DraggableVariable
          variable={`{{ ${path} }}`}
          label="Value"
          description={String(data)}
          icon={<Variable className="w-4 h-4 text-gray-400" />}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        />
      )}
    </div>
  );
}

// Drop Zone Input Component
interface DropZoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'textarea';
  rows?: number;
  onVariableDrop?: (variable: string) => void;
}

function DropZoneInput({ value, onChange, placeholder, type = 'text', rows = 4, onVariableDrop }: DropZoneInputProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only set to false if we're leaving the component entirely
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setIsDraggingOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);

    const variable = e.dataTransfer.getData('application/x-variable');
    if (variable && inputRef.current) {
      const input = inputRef.current;
      const cursorPosition = input.selectionStart || value.length;
      const cursorEnd = input.selectionEnd || cursorPosition;

      // Format the variable as inline code with backticks
      const formattedVariable = `\`${variable}\``;

      // Insert at cursor position
      const newValue = value.slice(0, cursorPosition) + formattedVariable + value.slice(cursorEnd);
      onChange(newValue);

      // Restore focus and set cursor position after the inserted variable
      setTimeout(() => {
        input.focus();
        const newPosition = cursorPosition + formattedVariable.length;
        input.setSelectionRange(newPosition, newPosition);
      }, 0);

      // Also call the optional callback if provided
      if (onVariableDrop) {
        onVariableDrop(variable);
      }
    }
  };

  const inputClassName = `
    w-full px-4 py-2.5 bg-black/30 border rounded-xl text-white text-sm
    focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent
    font-mono transition-all duration-200
    ${isDraggingOver ? 'border-brand-blue ring-2 ring-brand-blue/40 bg-brand-blue/10 scale-[1.01]' : 'border-white/10 hover:border-white/20'}
    ${type === 'textarea' ? 'resize-none' : ''}
  `;

  // Function to render markdown-like formatting for variables in backticks
  const renderMarkdownPreview = (text: string) => {
    if (!text || typeof text !== 'string' || !text.includes('`')) return null;

    const parts = text.split(/(`[^`]+`)/g);
    return (
      <div className="mt-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm">
        <div className="flex items-center gap-2 mb-1">
          <Eye className="w-3.5 h-3.5 text-brand-blue" />
          <span className="text-gray-400 text-xs font-medium">{t('modal.node.preview')}</span>
        </div>
        <div className="text-white break-words">
          {parts.map((part, i) => {
            if (part.startsWith('`') && part.endsWith('`')) {
              const content = part.slice(1, -1);
              return (
                <code
                  key={i}
                  className="px-2 py-0.5 bg-brand-blue/20 text-brand-blue border border-brand-blue/30 rounded font-mono text-xs"
                >
                  {content}
                </code>
              );
            }
            return <span key={i}>{part}</span>;
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      {type === 'textarea' ? (
        <>
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={inputClassName}
          />
          {renderMarkdownPreview(value)}
        </>
      ) : (
        <>
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={inputClassName}
          />
          {renderMarkdownPreview(value)}
        </>
      )}
      {isDraggingOver && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-brand-blue/5 rounded-xl border-2 border-brand-blue/50 animate-pulse">
          <div className="bg-brand-blue/90 text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-brand-blue shadow-lg flex items-center gap-2">
            <GripVertical className="w-3 h-3" />
            {t('modal.node.dropToInsert')}
          </div>
        </div>
      )}
    </div>
  );
}

// Default settings value
const DEFAULT_SETTINGS = {
  alwaysOutputData: false,
  executeOnce: false,
  retryOnFail: false,
  onError: 'stopWorkflow' as 'stopWorkflow' | 'continueErrorMessage' | 'continueErrorOutput',
  notes: '',
  displayNotesInFlow: false,
  notesBackground: '#1e1e2e',
  notesTextColor: '#e2e8f0',
};

export type NodeSettings = typeof DEFAULT_SETTINGS;

export default function NodeConfigModal({
  selectedNode,
  onNodeUpdate,
  onClose,
  isOpen,
  nodes,
  edges,
  executionResults = {},
}: NodeConfigModalProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [config, setConfig] = useState<BaseNodeConfig>({});
  const [activeTab, setActiveTab] = useState<'parameters' | 'settings'>('parameters');
  const [settings, setSettings] = useState<NodeSettings>({ ...DEFAULT_SETTINGS });
  const [selectedInputNode, setSelectedInputNode] = useState<string | null>(null);
  const [selectedOutputNode, setSelectedOutputNode] = useState<string | null>(null);
  const [draggedVariable, setDraggedVariable] = useState<string | null>(null);
  const [activeFieldKey, setActiveFieldKey] = useState<string | null>(null);
  const [notesPreview, setNotesPreview] = useState(false);

  // Update config & settings when selected node changes
  useEffect(() => {
    if (selectedNode) {
      setConfig(selectedNode.data.config || {});
      setSettings({ ...DEFAULT_SETTINGS, ...((selectedNode.data.config as any)?.__settings || {}) });
      setSelectedInputNode(null);
      setSelectedOutputNode(null);
      setActiveTab('parameters');
    }
  }, [selectedNode]);

  // Find connected nodes (input - nodes that connect to this node)
  const inputNodes = useMemo(() => {
    if (!selectedNode) return [];
    return nodes.filter(node =>
      edges.some(edge => edge.source === node.id && edge.target === selectedNode.id)
    );
  }, [selectedNode, edges, nodes]);

  // Find connected nodes (output - nodes that this node connects to)
  const outputNodes = useMemo(() => {
    if (!selectedNode) return [];
    return nodes.filter(node =>
      edges.some(edge => edge.source === selectedNode.id && edge.target === node.id)
    );
  }, [selectedNode, edges, nodes]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleConfigChange = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    if (selectedNode) {
      onNodeUpdate(selectedNode.id, newConfig);
    }
  };

  const handleSettingChange = <K extends keyof NodeSettings>(key: K, value: NodeSettings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    const newConfig = { ...config, __settings: newSettings };
    setConfig(newConfig);
    if (selectedNode) {
      onNodeUpdate(selectedNode.id, newConfig);
    }
  };

  // Handle variable drop into field
  const handleVariableDrop = (fieldKey: string, variable: string) => {
    // Get current input element to find cursor position
    const input = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
    if (input && (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA')) {
      const currentValue = config[fieldKey] || '';
      const cursorPosition = input.selectionStart || currentValue.length;

      // Insert variable at cursor position
      const newValue =
        currentValue.slice(0, cursorPosition) +
        variable +
        currentValue.slice(input.selectionEnd || cursorPosition);

      handleConfigChange(fieldKey, newValue);

      // Move cursor after inserted variable
      setTimeout(() => {
        const newPosition = cursorPosition + variable.length;
        input.setSelectionRange(newPosition, newPosition);
      }, 0);
    }
  };

  const nodeTypeMetadata = selectedNode
    ? NODE_TYPES_METADATA[selectedNode.data.type]
    : null;

  // Credential type required by this node (if any)
  const credentialType = selectedNode ? (NODE_CREDENTIAL_MAP[selectedNode.data.type] ?? null) : null;

  // Database node types that expose connection fields
  const DB_NODE_TYPES: Set<string> = new Set(['mySQL', 'postgreSQL', 'redis', 'mongoDB']);
  const isDbNode = selectedNode
    ? DB_NODE_TYPES.has(selectedNode.data.type) ||
      (nodeTypeMetadata as any)?.category === 'database'
    : false;
  const dbNodeType = isDbNode ? (selectedNode!.data.type as DbNodeType) : null;

  /** Apply a resolved DB connection to the node config fields */
  const applyDbConnection = (resolved: ResolvedConnection) => {
    const patch: Record<string, unknown> = {
      __dbConnectionId: resolved.connectionId,
    };
    if (resolved.host !== undefined)     patch.host = resolved.host;
    if (resolved.port !== undefined)     patch.port = resolved.port;
    if (resolved.database !== undefined) patch.database = resolved.database;
    if (resolved.username !== undefined) patch.user = resolved.username;
    if (resolved.password !== undefined) patch.password = resolved.password;
    if (resolved.ssl !== undefined)      patch.ssl = resolved.ssl;
    if (resolved.connectionString)       patch.connectionString = resolved.connectionString;
    const newConfig = { ...config, ...patch };
    setConfig(newConfig);
    if (selectedNode) onNodeUpdate(selectedNode.id, newConfig);
  };

  // Get selected input node data
  const selectedInputNodeData = useMemo(() => {
    if (!selectedInputNode) return null;
    return nodes.find(n => n.id === selectedInputNode);
  }, [selectedInputNode, nodes]);

  // Get output data for selected input node (REAL execution data or fallback to sample)
  const selectedInputNodeOutput = useMemo(() => {
    if (!selectedInputNodeData) return null;

    // First try to get real execution data
    const realData = executionResults[selectedInputNodeData.id];
    if (realData) {
      return realData;
    }

    // Fallback to sample data if no execution yet
    return NODE_OUTPUT_SAMPLES[selectedInputNodeData.data.type] || {
      _info: 'No execution data yet',
      _note: 'Execute this node at least once to see real data',
    };
  }, [selectedInputNodeData, executionResults]);

  // Get current node's output data (if it has been executed)
  const currentNodeOutput = useMemo(() => {
    if (!selectedNode) return null;
    return executionResults[selectedNode.id] || null;
  }, [selectedNode, executionResults]);

  // Workflow and node variables (always available)
  const workflowVariables = useMemo(() => [
    {
      variable: '{{ $workflow.id }}',
      label: 'Workflow ID',
      description: 'ID du workflow actuel',
      icon: Settings,
      iconClassName: 'w-4 h-4 text-purple-400',
    },
    {
      variable: '{{ $workflow.name }}',
      label: 'Workflow Name',
      description: 'Nom du workflow',
      icon: Settings,
      iconClassName: 'w-4 h-4 text-purple-400',
    },
    {
      variable: '{{ $node.id }}',
      label: 'Node ID',
      description: 'ID du nœud actuel',
      icon: GitBranch,
      iconClassName: 'w-4 h-4 text-orange-400',
    },
    {
      variable: '{{ $node.name }}',
      label: 'Node Name',
      description: 'Nom du nœud',
      icon: GitBranch,
      iconClassName: 'w-4 h-4 text-orange-400',
    },
  ], []);

  const handleDragStart = (variable: string) => {
    setDraggedVariable(variable);
  };

  const handleDragEnd = () => {
    setDraggedVariable(null);
  };

  if (!isOpen || !selectedNode) return null;

  return (
    <>
      {/* Custom scrollbar styles */}
      <style dangerouslySetInnerHTML={{ __html: customScrollbarStyles }} />

      <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal Content - 3 Column Layout */}
        <div className="relative w-full max-w-8xl mx-4 rounded-xl shadow-2xl border max-h-[90vh] overflow-hidden flex flex-col bg-card border-white/10 animate-scaleIn"
          style={{
            backdropFilter: 'blur(20px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)'
          }}
        >
          {/* Header - Modern Design */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-card">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-gradient-to-br from-brand-blue/20 to-purple-600/20 rounded-xl border border-white/15 shadow-lg">
                {getNodeIcon(selectedNode.data.type)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  {selectedNode.data.label}
                  {currentNodeOutput && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-green-500/20 text-green-400 rounded-full border border-green-500/30 animate-pulse">
                      {t('modal.node.executed')}
                    </span>
                  )}
                  {!currentNodeOutput && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-white/10 text-gray-400 rounded-full border border-white/10">
                      {t('modal.node.notExecuted')}
                    </span>
                  )}
                </h2>
                <p className="text-sm text-gray-400 capitalize mt-0.5">
                  {selectedNode.data.type}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-white/5 rounded-xl transition-all hover:scale-105 active:scale-95 group"
            >
              <X className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            </button>
          </div>

          {/* Scrollable Content - 3 Column Layout */}
          <div className="flex-1 overflow-hidden flex min-h-0">
            {/* Left Panel - Input Nodes & Variables */}
            <div className="w-80 border-r border-white/10 overflow-y-auto p-4 space-y-4 bg-card custom-scrollbar">
              {/* Input Nodes Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <ArrowLeft className="w-4 h-4 text-green-400" />
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
                    {t('modal.node.inputsSection')}
                  </h3>
                </div>

                {inputNodes.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                      <ArrowLeft className="w-8 h-8 text-gray-600" />
                    </div>
                    <p className="text-sm text-gray-500">{t('modal.node.noNodeConnected')}</p>
                    <p className="text-xs text-gray-600 mt-1">{t('modal.node.connectNodes')}</p>
                  </div>
                ) : (
                  inputNodes.map(node => {
                    const hasExecutionData = !!executionResults[node.id];
                    return (
                      <div
                        key={node.id}
                        className={`p-3 rounded-xl border cursor-pointer transition-all transform hover:scale-[1.02] ${selectedInputNode === node.id
                            ? 'bg-gradient-to-br from-green-900/40 to-green-800/30 border-green-500/60 shadow-lg shadow-green-500/20'
                            : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                          }`}
                        onClick={() => setSelectedInputNode(node.id)}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="shrink-0">
                            {getNodeIcon(node.data.type)}
                          </div>
                          <span className="text-sm font-medium text-white truncate flex-1">
                            {node.data.label}
                          </span>
                          {hasExecutionData && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-green-500/30 text-green-300 rounded border border-green-500/50">
                              ●
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 capitalize">
                          {node.data.type}
                        </p>
                        {hasExecutionData && selectedInputNode === node.id && (
                          <p className="text-[10px] text-green-400 mt-1 flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            {t('modal.node.realDataAvailable')}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Variables Section - Draggable & Dynamic */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Braces className="w-4 h-4 text-brand-blue" />
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
                    Variables (Drag & Drop)
                  </h3>
                </div>

                {!selectedInputNode ? (
                  <></>
                ) : (
                  <div className="space-y-3">
                    {/* Selected Node Info */}
                    <div className="p-3 bg-gradient-to-br from-green-900/30 to-emerald-900/20 rounded-xl border border-green-500/30 shadow-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-green-400 font-bold flex items-center gap-1">
                          <Activity className="w-3.5 h-3.5" />
                          {t('modal.node.selectedNode')}
                        </p>
                        {executionResults[selectedInputNode] ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-green-500/30 text-green-300 rounded-full border border-green-500/50">
                            {t('modal.node.realData')}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-yellow-500/30 text-yellow-300 rounded-full border border-yellow-500/50">
                            {t('modal.node.sampleData')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-white font-medium">
                        {selectedInputNodeData?.data.label}
                      </p>
                      <p className="text-xs text-gray-400 capitalize">
                        {selectedInputNodeData?.data.type}
                      </p>
                    </div>

                    {/* JSON Explorer - Dynamic Variables */}
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-brand-blue font-bold flex items-center gap-1">
                          <Braces className="w-3.5 h-3.5" />
                          Structure de Sortie
                        </p>
                        <GripVertical className="w-4 h-4 text-gray-600" />
                      </div>
                      <p className="text-[10px] text-gray-500 mb-3">
                        {t('modal.node.dragHint')}
                      </p>
                      <div className="max-h-64 overflow-y-auto custom-scrollbar">
                        <JsonExplorer
                          data={selectedInputNodeOutput}
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                        />
                      </div>
                    </div>

                    {/* Workflow Variables (always available at bottom) */}
                    <div className="pt-3 border-t border-white/10">
                      <p className="text-xs text-gray-500 mb-2 text-center font-medium">Variables Globales</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {workflowVariables.map((item) => (
                          <div
                            key={item.variable}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData('application/x-variable', item.variable);
                              e.dataTransfer.effectAllowed = 'copy';
                              handleDragStart(item.variable);
                            }}
                            onDragEnd={handleDragEnd}
                            className="flex items-center gap-1 px-2 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg cursor-grab active:cursor-grabbing transition-all border border-white/10 hover:border-purple-500/30"
                          >
                            <div className="shrink-0 text-gray-600 text-[10px]">
                              <GripVertical className="w-3 h-3" />
                            </div>
                            <code className="text-[10px] text-purple-400 font-mono truncate">
                              {item.variable.replace('{{ ', '').replace(' }}', '')}
                            </code>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Center Panel - Configuration */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Tabs */}
              <div className="flex border-b border-white/10 px-6 pt-3 shrink-0 bg-black">
                <button
                  onClick={() => setActiveTab('parameters')}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-lg transition-all ${activeTab === 'parameters'
                      ? 'text-white border-b-2 border-brand-blue'
                      : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  Parameters
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-lg transition-all ${activeTab === 'settings'
                      ? 'text-white border-b-2 border-brand-blue'
                      : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Settings
                  {(settings.notes || settings.alwaysOutputData || settings.executeOnce || settings.retryOnFail || settings.onError !== 'stopWorkflow') && (
                    <span className="w-2 h-2 rounded-full bg-brand-blue" />
                  )}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar bg-black">
                {/* === PARAMETERS TAB === */}
                {activeTab === 'parameters' && (<>
                  {/* Description */}
                  {nodeTypeMetadata?.description && (
                    <div className="p-4 bg-gradient-to-br from-blue-900/10 to-purple-900/10 rounded-xl border border-blue-500/20">
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {nodeTypeMetadata.description}
                      </p>
                    </div>
                  )}

                  {/* Drag Indicator */}
                  {draggedVariable && (
                    <div className="p-4 bg-gradient-to-r from-brand-blue/20 to-purple-600/20 border border-brand-blue/40 rounded-xl flex items-center gap-3 shadow-lg animate-pulse">
                      <GripVertical className="w-5 h-5 text-brand-blue shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-brand-blue font-bold mb-0.5">
                          🎯 Glissez la variable dans un champ
                        </p>
                        <code className="text-xs text-brand-blue/80 font-mono">
                          {draggedVariable}
                        </code>
                      </div>
                    </div>
                  )}

                  {/* Node Output Data (if executed) */}
                  {currentNodeOutput && (
                    <div className="p-4 bg-gradient-to-br from-emerald-900/20 to-green-900/10 rounded-xl border border-emerald-500/30 shadow-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                          <Activity className="w-4 h-4" />
                          {t('modal.node.outputSection')}
                        </h4>
                        <span className="px-2 py-1 text-xs font-bold bg-green-500/30 text-green-300 rounded-full border border-green-500/50 animate-pulse">
                          {t('modal.node.lastExecution')}
                        </span>
                      </div>
                      <div className="max-h-48 overflow-y-auto custom-scrollbar bg-black/30 rounded-lg p-3 border border-white/10">
                        <JsonExplorer
                          data={currentNodeOutput}
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                        />
                      </div>
                    </div>
                  )}

                  {/* Configuration Form */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
                        <Settings className="w-4 h-4 text-brand-blue" />
                        Configuration
                      </h3>
                      <span className="text-xs text-gray-500">
                        {Object.keys(nodeTypeMetadata?.config || {}).length} champs
                      </span>
                    </div>

                    {/* ── Credential Picker ── */}
                    {credentialType && (
                      <CredentialPickerSection
                        credentialType={credentialType}
                        selectedCredentialId={String(config.__credentialId ?? '')}
                        onApply={(credId, patch) => {
                          const newConfig = { ...config, ...patch, __credentialId: credId };
                          setConfig(newConfig);
                          if (selectedNode) onNodeUpdate(selectedNode.id, newConfig);
                        }}
                      />
                    )}

                    {/* ── Database Connection Picker ── */}
                    {isDbNode && dbNodeType && (
                      <DatabaseConnectionField
                        nodeType={dbNodeType}
                        value={String(config.__dbConnectionId ?? '')}
                        onChange={applyDbConnection}
                        onNavigateToDb={() => {
                          onClose();
                          navigate('/database');
                        }}
                      />
                    )}

                    {nodeTypeMetadata &&
                      Object.entries(nodeTypeMetadata.config).map(([key, fieldConfig]) => {
                        // Hide raw connection fields when a saved connection is active
                        const DB_CONNECTION_FIELDS = new Set(['host', 'port', 'database', 'user', 'password', 'ssl', 'connectionString']);
                        if (isDbNode && config.__dbConnectionId && DB_CONNECTION_FIELDS.has(key)) {
                          const rawValue = config[key] ?? (fieldConfig as any).defaultValue ?? '';
                          return (
                            <div key={key} className="p-3 rounded-xl border border-white/5 bg-white/[0.02] opacity-60">
                              <p className="text-xs text-gray-500 font-medium mb-0.5">{(fieldConfig as any).label}</p>
                              <p className="text-sm font-mono text-gray-400 truncate">{String(rawValue)}</p>
                            </div>
                          );
                        }

                        const fieldMeta = fieldConfig as {
                          type: 'text' | 'textarea' | 'select' | 'number' | 'boolean' | 'formBuilder' | 'filterBuilder' | 'sortBuilder' | 'codeEditor' | 'workflowSelect' | 'httpRequestBuilder' | 'ftpBuilder' | 'cleaningRulesBuilder' | 'browserActionsBuilder' | 'enginesSelect' | 'debugOperationsBuilder' | 'ghostOperationsBuilder' | 'aiBuiltinTools' | 'aiOptions' | 'ifConditionsBuilder' | 'sqlQueryBuilder';
                          label: string;
                          placeholder?: string;
                          options?: { label: string; value: string }[];
                          defaultValue?: any;
                        };

                        const isTextField = fieldMeta.type === 'text' || fieldMeta.type === 'textarea';
                        const isActiveField = activeFieldKey === key;

                        return (
                          <div
                            key={key}
                            className={`p-4 rounded-xl border transition-all transform ${isActiveField
                                ? 'bg-gradient-to-br from-brand-blue/10 to-purple-600/10 border-brand-blue/40 shadow-lg scale-[1.01]'
                                : 'bg-white/5 border-white/10 hover:border-white/20'
                              }`}
                            onMouseEnter={() => isTextField && setActiveFieldKey(key)}
                            onMouseLeave={() => setActiveFieldKey(null)}
                          >
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-200 mb-2.5">
                              {fieldMeta.label}
                              {isTextField && isActiveField && (
                                <span className="text-xs text-brand-blue font-normal">
                                  (Glissez une variable ici)
                                </span>
                              )}
                            </label>
                            {fieldMeta.type === 'httpRequestBuilder' ? (
                              <HttpRequestBuilderField
                                value={config[key] ?? fieldMeta.defaultValue ?? {}}
                                onChange={(val) => handleConfigChange(key, val)}
                              />
                            ) : fieldMeta.type === 'ftpBuilder' ? (
                              <FtpBuilderField
                                value={config[key] ?? fieldMeta.defaultValue ?? {}}
                                onChange={(val) => handleConfigChange(key, val)}
                              />
                            ) : fieldMeta.type === 'cleaningRulesBuilder' ? (
                              <CleaningRulesBuilderField
                                value={config[key] ?? fieldMeta.defaultValue ?? []}
                                onChange={(val) => handleConfigChange(key, val)}
                              />
                            ) : fieldMeta.type === 'browserActionsBuilder' ? (
                              <BrowserActionsBuilderField
                                value={config[key] ?? fieldMeta.defaultValue ?? []}
                                onChange={(val) => handleConfigChange(key, val)}
                              />
                            ) : fieldMeta.type === 'enginesSelect' ? (
                              <EnginesSelectField
                                value={config[key] ?? fieldMeta.defaultValue ?? []}
                                onChange={(val) => handleConfigChange(key, val)}
                              />
                            ) : fieldMeta.type === 'debugOperationsBuilder' ? (
                              <DebugOperationsBuilderField
                                value={config[key] ?? fieldMeta.defaultValue ?? []}
                                onChange={(val) => handleConfigChange(key, val)}
                              />
                            ) : fieldMeta.type === 'ghostOperationsBuilder' ? (
                              <GhostOperationsBuilderField
                                value={config[key] ?? fieldMeta.defaultValue ?? []}
                                onChange={(val) => handleConfigChange(key, val)}
                              />
                            ) : fieldMeta.type === 'ifConditionsBuilder' ? (
                              <IfConditionsBuilderField
                                value={config[key] ?? fieldMeta.defaultValue ?? { combineWith: 'and', conditions: [] }}
                                onChange={(val) => handleConfigChange(key, val)}
                              />
                            ) : fieldMeta.type === 'sqlQueryBuilder' ? (
                              <SqlQueryBuilderField
                                value={config[key] ?? fieldMeta.defaultValue ?? ''}
                                dialect={selectedNode?.data.type === 'postgreSQL' ? 'postgresql' : 'mysql'}
                                onChange={(sql, builderState) => handleConfigChange(key, builderState)}
                                connection={config.__dbConnectionId ? {
                                  connectionId: String(config.__dbConnectionId),
                                  engine: selectedNode?.data.type === 'postgreSQL' ? 'postgresql' : 'mysql',
                                  host: String(config.host ?? ''),
                                  port: Number(config.port ?? 0),
                                  database: String(config.database ?? ''),
                                  username: String(config.user ?? ''),
                                  password: String(config.password ?? ''),
                                  ssl: Boolean(config.ssl ?? false),
                                } : undefined}
                              />
                            ) : fieldMeta.type === 'aiBuiltinTools' ? (
                              <AiBuiltinToolsField
                                value={config[key] ?? fieldMeta.defaultValue ?? {}}
                                onChange={(val) => handleConfigChange(key, val)}
                                tools={(fieldMeta as any).tools ?? []}
                              />
                            ) : fieldMeta.type === 'aiOptions' ? (
                              <AiOptionsField
                                value={config[key] ?? fieldMeta.defaultValue ?? {}}
                                onChange={(val) => handleConfigChange(key, val)}
                                availableOptions={(fieldMeta as any).availableOptions ?? []}
                              />
                            ) : fieldMeta.type === 'formBuilder' ? (
                              <FormBuilderField
                                value={config[key] ?? fieldMeta.defaultValue ?? []}
                                onChange={(fields) => handleConfigChange(key, fields)}
                              />
                            ) : fieldMeta.type === 'filterBuilder' ? (
                              <FilterBuilderField
                                value={config[key] ?? fieldMeta.defaultValue ?? { combineConditions: 'and', conditions: [] }}
                                onChange={(val) => handleConfigChange(key, val)}
                              />
                            ) : fieldMeta.type === 'sortBuilder' ? (
                              <SortBuilderField
                                value={config[key] ?? fieldMeta.defaultValue ?? { sortType: 'simple', fields: [], disableDotNotation: false }}
                                onChange={(val) => handleConfigChange(key, val)}
                              />
                            ) : fieldMeta.type === 'codeEditor' ? (
                              <CodeEditorField
                                value={config[key] ?? fieldMeta.defaultValue ?? ''}
                                onChange={(val) => handleConfigChange(key, val)}
                                language={(config['language'] as any) ?? 'javascript'}
                              />
                            ) : fieldMeta.type === 'workflowSelect' ? (
                              <WorkflowSelectField
                                value={config[key] ?? fieldMeta.defaultValue ?? ''}
                                onChange={(val) => handleConfigChange(key, val)}
                              />
                            ) : fieldMeta.type === 'select' ? (
                              <select
                                value={config[key] || fieldMeta.defaultValue || ''}
                                onChange={(e) =>
                                  handleConfigChange(key, e.target.value)
                                }
                                className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all duration-200 hover:border-white/20 cursor-pointer"
                              >
                                {fieldMeta.options?.map((option) => (
                                  <option key={option.value} value={option.value} className="bg-[#0d0d0d] text-white">
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            ) : fieldMeta.type === 'boolean' ? (
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handleConfigChange(key, !config[key])}
                                  className={`relative w-10 h-5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2 focus:ring-offset-black ${config[key] ? 'bg-brand-blue' : 'bg-white/20'}`}
                                >
                                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${config[key] ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                                <span className={`text-sm font-medium transition-colors ${config[key] ? 'text-green-400' : 'text-gray-400'}`}>
                                  {config[key] ? t('modal.node.enabled') : t('modal.node.disabled')}
                                </span>
                              </div>
                            ) : isTextField ? (
                              <DropZoneInput
                                value={config[key] || ''}
                                onChange={(value) => handleConfigChange(key, value)}
                                placeholder={fieldMeta.placeholder}
                                type={fieldMeta.type === 'textarea' ? 'textarea' : 'text'}
                                rows={4}
                                onVariableDrop={(variable) => handleVariableDrop(key, variable)}
                              />
                            ) : (
                              <input
                                type="number"
                                value={config[key] || ''}
                                onChange={(e) =>
                                  handleConfigChange(key, parseFloat(e.target.value) || 0)
                                }
                                placeholder={fieldMeta.placeholder}
                                className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all duration-200 hover:border-white/20"
                              />
                            )}
                          </div>
                        );
                      })}
                  </div>
                </>
                )}

                {/* === SETTINGS TAB === */}
                {activeTab === 'settings' && (
                  <div className="space-y-4">
                    {/* Always Output Data */}
                    <div className="p-4 rounded-xl border bg-white/5 border-white/10 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Info className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-semibold text-gray-200">Always Output Data</span>
                        </div>
                        <button
                          onClick={() => handleSettingChange('alwaysOutputData', !settings.alwaysOutputData)}
                          className={`relative w-10 h-5 rounded-full transition-colors ${settings.alwaysOutputData ? 'bg-brand-blue' : 'bg-white/20'
                            }`}
                        >
                          <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${settings.alwaysOutputData ? 'translate-x-5' : 'translate-x-0'
                            }`} />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">If enabled, the node returns an empty item when there are no results.</p>
                    </div>

                    {/* Execute Once */}
                    <div className="p-4 rounded-xl border bg-white/5 border-white/10 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <RotateCcw className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-semibold text-gray-200">Execute Once</span>
                        </div>
                        <button
                          onClick={() => handleSettingChange('executeOnce', !settings.executeOnce)}
                          className={`relative w-10 h-5 rounded-full transition-colors ${settings.executeOnce ? 'bg-brand-blue' : 'bg-white/20'
                            }`}
                        >
                          <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${settings.executeOnce ? 'translate-x-5' : 'translate-x-0'
                            }`} />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">If enabled, the node executes only once regardless of how many items the previous node returns.</p>
                    </div>

                    {/* Retry on Fail */}
                    <div className="p-4 rounded-xl border bg-white/5 border-white/10 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-semibold text-gray-200">Retry on Fail</span>
                        </div>
                        <button
                          onClick={() => handleSettingChange('retryOnFail', !settings.retryOnFail)}
                          className={`relative w-10 h-5 rounded-full transition-colors ${settings.retryOnFail ? 'bg-brand-blue' : 'bg-white/20'
                            }`}
                        >
                          <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${settings.retryOnFail ? 'translate-x-5' : 'translate-x-0'
                            }`} />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">If enabled, the node retries execution on failure.</p>
                    </div>

                    {/* On Error */}
                    <div className="p-4 rounded-xl border bg-white/5 border-white/10 space-y-2">
                      <div className="flex items-center gap-2.5 mb-2">
                        <AlertTriangle className="w-4 h-4 text-orange-400" />
                        <span className="text-sm font-semibold text-gray-200">On Error</span>
                      </div>
                      <select
                        value={settings.onError}
                        onChange={(e) => handleSettingChange('onError', e.target.value as NodeSettings['onError'])}
                        className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue hover:border-white/20 cursor-pointer"
                      >
                        <option value="stopWorkflow" className="bg-[#0d0d0d] text-white">Stop Workflow</option>
                        <option value="continueErrorMessage" className="bg-[#0d0d0d] text-white">Continue (pass error message)</option>
                        <option value="continueErrorOutput" className="bg-[#0d0d0d] text-white">Continue (pass item to extra error input)</option>
                      </select>
                    </div>

                    {/* Notes */}
                    <div className="p-4 rounded-xl border bg-white/5 border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <StickyNote className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm font-semibold text-gray-200">Notes</span>
                        </div>
                        <button
                          onClick={() => setNotesPreview(p => !p)}
                          className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${notesPreview
                              ? 'bg-brand-blue/20 border-brand-blue/50 text-brand-blue'
                              : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                            }`}
                        >
                          {notesPreview ? 'Edit' : 'Preview'}
                        </button>
                      </div>

                      {notesPreview ? (
                        <div
                          className="min-h-[120px] p-3 rounded-lg border border-white/10 prose prose-invert prose-sm max-w-none text-sm"
                          style={{ background: settings.notesBackground, color: settings.notesTextColor }}
                        >
                          <ReactMarkdown>{settings.notes || '*No notes yet...*'}</ReactMarkdown>
                        </div>
                      ) : (
                        <textarea
                          value={settings.notes}
                          onChange={(e) => handleSettingChange('notes', e.target.value)}
                          placeholder="Add notes (markdown supported)..."
                          rows={5}
                          className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue hover:border-white/20 resize-none font-mono"
                        />
                      )}

                      {/* Display Notes in Flow */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2">
                          <StickyNote className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-xs font-medium text-gray-300">Display Notes in Flow</span>
                        </div>
                        <button
                          onClick={() => handleSettingChange('displayNotesInFlow', !settings.displayNotesInFlow)}
                          className={`relative w-10 h-5 rounded-full transition-colors ${settings.displayNotesInFlow ? 'bg-brand-blue' : 'bg-white/20'
                            }`}
                        >
                          <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${settings.displayNotesInFlow ? 'translate-x-5' : 'translate-x-0'
                            }`} />
                        </button>
                      </div>

                      {/* Color pickers — only shown when Display Notes in Flow is on */}
                      {settings.displayNotesInFlow && (
                        <div className="space-y-3 pt-2 border-t border-white/10">
                          <div className="flex items-center gap-2 mb-1">
                            <Palette className="w-3.5 h-3.5 text-purple-400" />
                            <span className="text-xs font-semibold text-gray-300">Canvas Note Colors</span>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {/* Background color */}
                            <div className="space-y-1.5">
                              <label className="text-xs text-gray-400">Background</label>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-8 h-8 rounded-lg border-2 border-white/20 shrink-0 cursor-pointer overflow-hidden relative"
                                  style={{ background: settings.notesBackground }}
                                >
                                  <input
                                    type="color"
                                    value={settings.notesBackground}
                                    onChange={(e) => handleSettingChange('notesBackground', e.target.value)}
                                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                  />
                                </div>
                                <input
                                  type="text"
                                  value={settings.notesBackground}
                                  onChange={(e) => handleSettingChange('notesBackground', e.target.value)}
                                  className="flex-1 px-2 py-1.5 bg-black/30 border border-white/10 rounded-lg text-gray-300 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-brand-blue"
                                />
                              </div>
                              {/* Preset swatches */}
                              <div className="flex gap-1 flex-wrap">
                                {['#1e1e2e', '#0d1117', '#1a1a2e', '#16213e', '#0f3460', '#1b2838', '#2d1b33', '#1a2f1a'].map(c => (
                                  <button
                                    key={c}
                                    onClick={() => handleSettingChange('notesBackground', c)}
                                    className={`w-5 h-5 rounded border transition-transform hover:scale-110 ${settings.notesBackground === c ? 'border-white scale-110' : 'border-white/20'
                                      }`}
                                    style={{ background: c }}
                                    title={c}
                                  />
                                ))}
                              </div>
                            </div>
                            {/* Text color */}
                            <div className="space-y-1.5">
                              <label className="text-xs text-gray-400">Text Color</label>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-8 h-8 rounded-lg border-2 border-white/20 shrink-0 cursor-pointer overflow-hidden relative"
                                  style={{ background: settings.notesTextColor }}
                                >
                                  <input
                                    type="color"
                                    value={settings.notesTextColor}
                                    onChange={(e) => handleSettingChange('notesTextColor', e.target.value)}
                                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                  />
                                </div>
                                <input
                                  type="text"
                                  value={settings.notesTextColor}
                                  onChange={(e) => handleSettingChange('notesTextColor', e.target.value)}
                                  className="flex-1 px-2 py-1.5 bg-black/30 border border-white/10 rounded-lg text-gray-300 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-brand-blue"
                                />
                              </div>
                              {/* Preset swatches */}
                              <div className="flex gap-1 flex-wrap">
                                {['#e2e8f0', '#ffffff', '#94a3b8', '#fbbf24', '#34d399', '#60a5fa', '#f472b6', '#c4b5fd'].map(c => (
                                  <button
                                    key={c}
                                    onClick={() => handleSettingChange('notesTextColor', c)}
                                    className={`w-5 h-5 rounded border transition-transform hover:scale-110 ${settings.notesTextColor === c ? 'border-white scale-110' : 'border-white/20'
                                      }`}
                                    style={{ background: c }}
                                    title={c}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Output Nodes */}
            <div className="w-80 border-l border-white/10 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-card">
              <div className="flex items-center gap-2 mb-4">
                <ArrowRight className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
                  Sorties (Output)
                </h3>
              </div>

              {outputNodes.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <ArrowRight className="w-8 h-8 text-gray-600" />
                  </div>
                  <p className="text-sm text-gray-500">{t('modal.node.noNodeConnected')}</p>
                  <p className="text-xs text-gray-600 mt-1">{t('modal.node.outputReceiveHint')}</p>
                </div>
              ) : (
                outputNodes.map(node => (
                  <div
                    key={node.id}
                    className={`p-3 rounded-xl border cursor-pointer transition-all transform hover:scale-[1.02] ${selectedOutputNode === node.id
                        ? 'bg-gradient-to-br from-blue-900/40 to-blue-800/30 border-blue-500/60 shadow-lg shadow-blue-500/20'
                        : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                      }`}
                    onClick={() => setSelectedOutputNode(node.id)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="shrink-0">
                        {getNodeIcon(node.data.type)}
                      </div>
                      <span className="text-sm font-medium text-white truncate">
                        {node.data.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 capitalize">
                      {node.data.type}
                    </p>
                    {selectedOutputNode === node.id && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-xs text-blue-400 mb-2 font-medium">
                          Variables disponibles
                        </p>
                        <div className="space-y-1.5">
                          <div
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData('application/x-variable', '{{ $json }}');
                              e.dataTransfer.effectAllowed = 'copy';
                              handleDragStart('{{ $json }}');
                            }}
                            onDragEnd={handleDragEnd}
                            className="flex items-center gap-2 px-2 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg cursor-grab active:cursor-grabbing transition-all border border-white/10 hover:border-blue-500/30 group"
                          >
                            <GripVertical className="w-3.5 h-3.5 text-gray-500 shrink-0 group-hover:text-gray-400" />
                            <code className="text-xs text-brand-blue font-mono flex-1">
                              {'{{ $json }}'}
                            </code>
                            <Braces className="w-3.5 h-3.5 text-brand-blue opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData('application/x-variable', '{{ $workflow.id }}');
                              e.dataTransfer.effectAllowed = 'copy';
                              handleDragStart('{{ $workflow.id }}');
                            }}
                            onDragEnd={handleDragEnd}
                            className="flex items-center gap-2 px-2 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg cursor-grab active:cursor-grabbing transition-all border border-white/10 hover:border-purple-500/30 group"
                          >
                            <GripVertical className="w-3.5 h-3.5 text-gray-500 shrink-0 group-hover:text-gray-400" />
                            <code className="text-xs text-purple-400 font-mono flex-1">
                              {'{{ $workflow.id }}'}
                            </code>
                            <Settings className="w-3.5 h-3.5 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer - Version + Ask AI */}
          <div className="px-6 py-3 border-t border-white/10 bg-card">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-600 font-mono">
                  v{(NODE_TYPES_METADATA[selectedNode?.data.type as keyof typeof NODE_TYPES_METADATA] as any)?.version ?? '1.0'} · {selectedNode?.data.type}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 hover:border-blue-400/60 text-blue-300 hover:text-white text-xs font-semibold rounded-xl transition-all"
                  title="Ask AI to configure this node"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Ask AI to configure
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-bg-modal shadow-lg shadow-orange-500/20 text-sm"
                >
                  ✓ Done
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function getNodeIcon(type: string) {
  const iconMap: Partial<Record<string, { component: any; className: string }>> = {
    // CORE NODES
    webhook: { component: Webhook, className: 'w-6 h-6 text-purple-400' },
    httpRequest: { component: Globe, className: 'w-6 h-6 text-blue-400' },
    setVariable: { component: Variable, className: 'w-6 h-6 text-green-400' },
    condition: { component: GitBranch, className: 'w-6 h-6 text-orange-400' },
    editFields: { component: Edit, className: 'w-6 h-6 text-indigo-400' },
    code: { component: Code, className: 'w-6 h-6 text-violet-400' },
    filter: { component: Filter, className: 'w-6 h-6 text-cyan-400' },
    switch: { component: GitBranch, className: 'w-6 h-6 text-orange-400' },
    merge: { component: GitMerge, className: 'w-6 h-6 text-pink-400' },
    splitInBatches: { component: Grid, className: 'w-6 h-6 text-teal-400' },
    wait: { component: Clock, className: 'w-6 h-6 text-gray-400' },
    errorTrigger: { component: AlertCircle, className: 'w-6 h-6 text-red-400' },
    executeWorkflow: { component: PlaySquare, className: 'w-6 h-6 text-emerald-400' },
    limit: { component: Hash, className: 'w-6 h-6 text-lime-400' },
    sort: { component: ArrowUpDown, className: 'w-6 h-6 text-sky-400' },

    // TRIGGER NODES
    schedule: { component: Clock, className: 'w-6 h-6 text-amber-500' },
    onSuccessFailure: { component: Activity, className: 'w-6 h-6 text-rose-500' },
    formTrigger: { component: FileInput, className: 'w-6 h-6 text-blue-400' },
    chatTrigger: { component: MessageCircle, className: 'w-6 h-6 text-indigo-500' },
    clickTrigger: { component: MousePointerClick, className: 'w-6 h-6 text-pink-500' },
    emailTrigger: { component: Mail, className: 'w-6 h-6 text-gray-500' },
    httpPollTrigger: { component: RefreshCw, className: 'w-6 h-6 text-teal-500' },
    cronTrigger: { component: Clock, className: 'w-6 h-6 text-yellow-500' },

    // HTTP & DATA
    htmlExtract: { component: Globe, className: 'w-6 h-6 text-green-400' },
    rssRead: { component: Rss, className: 'w-6 h-6 text-orange-400' },
    ftp: { component: Upload, className: 'w-6 h-6 text-purple-400' },
    ssh: { component: Terminal, className: 'w-6 h-6 text-gray-500' },

    // DATABASE
    mySQL: { component: Database, className: 'w-6 h-6 text-blue-600' },
    mongoDB: { component: Database, className: 'w-6 h-6 text-green-600' },
    redis: { component: Database, className: 'w-6 h-6 text-red-600' },
    supabase: { component: Database, className: 'w-6 h-6 text-emerald-500' },

    // COMMUNICATION
    email: { component: Mail, className: 'w-6 h-6 text-gray-500' },
    slack: { component: MessageSquare, className: 'w-6 h-6 text-purple-600' },
    discord: { component: MessageCircle, className: 'w-6 h-6 text-indigo-500' },
    telegram: { component: Send, className: 'w-6 h-6 text-cyan-500' },
    whatsApp: { component: MessageSquare, className: 'w-6 h-6 text-green-500' },

    // CLOUD PRODUCTIVITY
    googleSheets: { component: Table, className: 'w-6 h-6 text-green-600' },
    googleDrive: { component: HardDrive, className: 'w-6 h-6 text-yellow-500' },
    airtable: { component: Table2, className: 'w-6 h-6 text-blue-500' },
    notion: { component: Book, className: 'w-6 h-6 text-gray-400' },
    trello: { component: Kanban, className: 'w-6 h-6 text-orange-500' },

    // AI/LLM
    openAI: { component: Bot, className: 'w-6 h-6 text-emerald-400' },
    aiAgent: { component: Mic, className: 'w-6 h-6 text-violet-400' },
    vectorStore: { component: Database, className: 'w-6 h-6 text-pink-400' },
    embeddings: { component: Cpu, className: 'w-6 h-6 text-cyan-400' },

    // BINARY
    readWriteBinaryFile: { component: File, className: 'w-6 h-6 text-gray-400' },
    compression: { component: Archive, className: 'w-6 h-6 text-orange-400' },
    crypto: { component: Lock, className: 'w-6 h-6 text-red-400' },

    // EXCLUSIVE CUSTOM NODES
    humanInTheLoop: { component: UserCheck, className: 'w-6 h-6 text-pink-500' },
    smartDataCleaner: { component: Sparkles, className: 'w-6 h-6 text-yellow-500' },
    aiCostGuardian: { component: Shield, className: 'w-6 h-6 text-cyan-500' },
    noCodeBrowserAutomator: { component: Globe, className: 'w-6 h-6 text-indigo-500' },
    aggregatorMultiSearch: { component: Search, className: 'w-6 h-6 text-teal-500' },
    liveCanvasDebugger: { component: Bug, className: 'w-6 h-6 text-lime-500' },
    socialMockupPreview: { component: Eye, className: 'w-6 h-6 text-violet-500' },
    rateLimiterBypass: { component: Zap, className: 'w-6 h-6 text-amber-500' },
    ghost: { component: Ghost, className: 'w-6 h-6 text-gray-400' },

    // ADVANCED INTEGRATION NODES
    appleEcosystem: { component: Laptop, className: 'w-6 h-6 text-gray-300' },
    androidEcosystem: { component: Smartphone, className: 'w-6 h-6 text-green-400' },
    gitHub: { component: GitFork, className: 'w-6 h-6 text-gray-300' },
    figma: { component: PenTool, className: 'w-6 h-6 text-pink-400' },
    windowsControl: { component: Monitor, className: 'w-6 h-6 text-blue-400' },
    streaming: { component: Radio, className: 'w-6 h-6 text-purple-400' },
    infrastructure: { component: Server, className: 'w-6 h-6 text-orange-400' },
  };

  const iconData = iconMap[type];
  if (!iconData) {
    return React.createElement(Variable, { className: 'w-6 h-6 text-gray-400' });
  }
  return React.createElement(iconData.component, { className: iconData.className });
}
