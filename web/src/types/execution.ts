/**
 * Execution Types
 *
 * Types for tracking workflow and node execution state
 */

import type { Node } from '@xyflow/react';

/**
 * Node execution status
 */
export type NodeStatus = 'idle' | 'pending' | 'running' | 'success' | 'error' | 'skipped';

/**
 * Node execution data
 */
export interface NodeExecutionData {
  /** Node ID */
  nodeId: string;
  /** Current status */
  status: NodeStatus;
  /** Execution start time */
  startTime?: Date;
  /** Execution end time */
  endTime?: Date;
  /** Execution duration in milliseconds */
  duration?: number;
  /** Input data received */
  inputData?: any;
  /** Output data produced */
  outputData?: any;
  /** Error message if status is 'error' */
  error?: string;
  /** Retry count */
  retryCount?: number;
  /** Execution log messages */
  logs?: ExecutionLog[];
}

/**
 * Execution log entry
 */
export interface ExecutionLog {
  /** Timestamp */
  timestamp: Date;
  /** Log level */
  level: 'info' | 'warn' | 'error' | 'debug';
  /** Log message */
  message: string;
  /** Additional data */
  data?: any;
}

/**
 * Workflow execution state
 */
export interface WorkflowExecutionState {
  /** Whether workflow is currently executing */
  isExecuting: boolean;
  /** Workflow execution start time */
  startTime?: Date;
  /** Workflow execution end time */
  endTime?: Date;
  /** Total workflow duration */
  duration?: number;
  /** Execution ID (unique per execution) */
  executionId?: string;
  /** Currently executing node ID */
  currentNodeId?: string;
  /** Node execution data by node ID */
  nodeExecutions: Map<string, NodeExecutionData>;
  /** Completed nodes count */
  completedCount: number;
  /** Total nodes to execute */
  totalCount: number;
  /** Overall success/failure state */
  status: 'idle' | 'running' | 'completed' | 'failed' | 'cancelled';
  /** Execution logs */
  logs: ExecutionLog[];
}

/**
 * Execution action types
 */
export type ExecutionAction =
  | { type: 'START_EXECUTION'; executionId: string; nodeIds: string[] }
  | { type: 'START_NODE'; nodeId: string }
  | { type: 'COMPLETE_NODE'; nodeId: string; outputData?: any; duration: number }
  | { type: 'FAIL_NODE'; nodeId: string; error: string; duration?: number }
  | { type: 'SKIP_NODE'; nodeId: string; reason?: string }
  | { type: 'RETRY_NODE'; nodeId: string; retryCount: number }
  | { type: 'ADD_LOG'; level: ExecutionLog['level']; message: string; data?: any; nodeId?: string }
  | { type: 'COMPLETE_EXECUTION'; success: boolean }
  | { type: 'CANCEL_EXECUTION' }
  | { type: 'RESET_EXECUTION' };

/**
 * Execution context value
 */
export interface ExecutionContextValue {
  /** Current execution state */
  state: WorkflowExecutionState;
  /** Dispatch an action */
  dispatch: React.Dispatch<ExecutionAction>;
  /** Get execution data for a specific node */
  getNodeExecution: (nodeId: string) => NodeExecutionData | undefined;
  /** Get all logs for a specific node */
  getNodeLogs: (nodeId: string) => ExecutionLog[];
  /** Get all logs */
  getAllLogs: () => ExecutionLog[];
}

/**
 * Node execution status display info
 */
export interface NodeStatusDisplay {
  status: NodeStatus;
  label: string;
  color: string;
  icon: string;
}

/**
 * Status display mappings
 */
export const NODE_STATUS_DISPLAY: Record<NodeStatus, NodeStatusDisplay> = {
  idle: {
    status: 'idle',
    label: 'Idle',
    color: '#6b7280',
    icon: '○',
  },
  pending: {
    status: 'pending',
    label: 'Pending',
    color: '#f59e0b',
    icon: '◔',
  },
  running: {
    status: 'running',
    label: 'Running',
    color: '#3b82f6',
    icon: '◕',
  },
  success: {
    status: 'success',
    label: 'Success',
    color: '#10b981',
    icon: '●',
  },
  error: {
    status: 'error',
    label: 'Error',
    color: '#ef4444',
    icon: '✕',
  },
  skipped: {
    status: 'skipped',
    label: 'Skipped',
    color: '#8b5cf6',
    icon: '⊘',
  },
};

/**
 * Execution statistics
 */
export interface ExecutionStatistics {
  totalNodes: number;
  completedNodes: number;
  failedNodes: number;
  skippedNodes: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  successRate: number;
}
