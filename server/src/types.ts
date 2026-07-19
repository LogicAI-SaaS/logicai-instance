/**
 * Types and interfaces for the LogicAI-N8N backend
 */

// Node configuration types
export interface NodeConfig {
  [key: string]: any;
}

// HTTP Request configuration
export interface HttpRequestConfig extends NodeConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  queryParams?: Record<string, string>;
}

// Webhook configuration
export interface WebhookConfig extends NodeConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
}

// SetVariable configuration
export interface SetVariableConfig extends NodeConfig {
  key: string;
  value: string;
  valueType?: 'string' | 'number' | 'boolean' | 'json';
}

// Condition configuration
export interface ConditionConfig extends NodeConfig {
  expression: string;
  truePath?: string;  // Node ID for true branch
  falsePath?: string; // Node ID for false branch
}

// Node execution data structure (N8N-style)
export interface NodeExecutionData {
  json: any;           // Main data object
  binary?: any;        // Binary data for files
  pairedItem?: any;    // Item pairing information
  error?: {            // Error information for continueOnFail
    message: string;
    description?: string;
  };
}

// Execution context passed between nodes (N8N-style)
export interface ExecutionContext {
  // Data from previous node(s)
  $json: any;
  $input?: NodeExecutionData[];
  $index?: number;     // Current item index when processing multiple items

  // Workflow metadata
  $workflow: {
    id: string;
    name: string;
    active?: boolean;
    settings?: Record<string, any>;
  };

  // Current node metadata
  $node: {
    id: string;
    name: string;
    type: string;
    version?: number;
    settings?: Record<string, any>;
  };

  // Execution metadata
  $execution?: {
    id: string;
    startTime: Date;
    resumeTime?: Date;
    mode?: 'manual' | 'trigger' | 'webhook' | 'retry';
  };

  // Context data
  $context?: any;
  $env?: Record<string, string>; // Environment variables
}

// Result of node execution
export interface NodeExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  [key: string]: any; // Allow extra properties for node-specific metadata
}

// Workflow execution metadata
export interface WorkflowExecutionMeta {
  workflowId: string;
  workflowName: string;
  startTime: Date;
}

// Credential types (N8N-style)
export interface ICredentialDataDecryptedObject {
  name: string;
  type: string;
  data: Record<string, any>;
  id?: string;
  [key: string]: any;
}

// Node parameter types
export interface INodeParameters {
  displayName: string;
  name: string;
  type: string;
  typeOptions?: any;
  description?: string;
  default?: any;
  required?: boolean;
  options?: Array<{ name: string; value: any; description?: string }>;
  placeholder?: string;
  hint?: string;
  [key: string]: any;
}

// Node description types (N8N-style)
export interface INodeDescription {
  displayName: string;
  name: string;
  subtitle?: string;
  type?: string;
  defaults?: {
    name: string;
    color: string;
    icon?: string;
  };
  inputs?: string[];
  outputs?: string[];
  properties: INodeParameters[];
  credentials?: any[];
  version?: number;
  [key: string]: any;
}

// HTTP Request options (N8N-style)
export interface IRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD';
  url: string;
  headers?: Record<string, string>;
  body?: any;
  qs?: Record<string, string>;      // Query string params
  params?: Record<string, string>;  // URL params
  json?: boolean;                   // Auto-parse JSON
  timeout?: number;
  auth?: {
    username: string;
    password: string;
  };
  bearer?: string;                  // Bearer token
  proxy?: {
    host: string;
    port: number;
    auth?: {
      username: string;
      password: string;
    };
  };
  withCredentials?: boolean;
  gzip?: boolean;
  followRedirect?: boolean;
  redirect?: {
    limit: number;
    followRedirects: boolean;
  };
}

// Credential storage interface
export interface ICredentialsDatabase {
  get(id: string): Promise<ICredentialDataDecryptedObject | null>;
  getAll(): Promise<ICredentialDataDecryptedObject[]>;
  upsert(credential: ICredentialDataDecryptedObject): Promise<string>;
  remove(id: string): Promise<boolean>;
}
