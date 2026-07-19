/**
 * API Response Types
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface WorkflowExecutionResult {
  workflowId: string;
  nodeId: string;
  status: 'pending' | 'running' | 'success' | 'error';
  input?: any;
  output?: any;
  error?: string;
  startedAt: string;
  completedAt?: string;
}

export interface ExecutionDetails {
  results: Array<[string, any]>;
  executionTime: number;
}
