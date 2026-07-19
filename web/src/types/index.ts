/**
 * Types Index - Centralized exports
 */

export type { Workflow, WorkflowFormData } from './workflow';
export type {
  NodeType,
  NodeStatus,
  BaseNodeConfig,
  CustomNodeData,
  CustomNode,
  WebhookConfig,
  HttpRequestConfig,
  SetVariableConfig,
  ConditionConfig,
  NodeMetadata,
  NODE_TYPES_METADATA,
} from './node';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface WorkflowExecutionResult {
  id: string;
  workflowId: string;
  nodeId: string;
  nodeName: string;
  status: string;
  input?: any;
  output?: any;
  error?: string;
  startedAt: string;
  completedAt?: string;
}

export interface ExecutionDetails {
  workflowId?: string;
  status?: 'running' | 'success' | 'error';
  startedAt?: string;
  completedAt?: string;
  results: Array<[string, any]>;
  executionTime: number;
  error?: string;
}
