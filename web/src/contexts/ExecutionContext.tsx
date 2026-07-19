/**
 * Execution Context
 *
 * React context for tracking workflow execution state.
 * Provides execution data and status for all nodes.
 */

import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import type {
  WorkflowExecutionState,
  NodeExecutionData,
  ExecutionAction,
  ExecutionContextValue,
  ExecutionLog,
} from '../types/execution';

/**
 * Initial execution state
 */
const initialExecutionState: WorkflowExecutionState = {
  isExecuting: false,
  nodeExecutions: new Map(),
  completedCount: 0,
  totalCount: 0,
  status: 'idle',
  logs: [],
};

/**
 * Execution reducer
 */
function executionReducer(
  state: WorkflowExecutionState,
  action: ExecutionAction
): WorkflowExecutionState {
  switch (action.type) {
    case 'START_EXECUTION': {
      return {
        ...state,
        isExecuting: true,
        startTime: new Date(),
        endTime: undefined,
        duration: undefined,
        executionId: action.executionId,
        nodeExecutions: new Map(),
        completedCount: 0,
        totalCount: action.nodeIds.length,
        status: 'running',
        logs: [],
      };
    }

    case 'START_NODE': {
      const nodeExecutions = new Map(state.nodeExecutions);
      const existing = nodeExecutions.get(action.nodeId);

      nodeExecutions.set(action.nodeId, {
        nodeId: action.nodeId,
        status: 'running',
        startTime: new Date(),
        retryCount: existing?.retryCount || 0,
        logs: [],
      });

      return {
        ...state,
        currentNodeId: action.nodeId,
        nodeExecutions,
      };
    }

    case 'COMPLETE_NODE': {
      const nodeExecutions = new Map(state.nodeExecutions);
      const existing = nodeExecutions.get(action.nodeId);

      if (!existing) return state;

      nodeExecutions.set(action.nodeId, {
        ...existing,
        status: 'success',
        endTime: new Date(),
        duration: action.duration,
        outputData: action.outputData,
      });

      return {
        ...state,
        nodeExecutions,
        completedCount: state.completedCount + 1,
        currentNodeId: undefined,
      };
    }

    case 'FAIL_NODE': {
      const nodeExecutions = new Map(state.nodeExecutions);
      const existing = nodeExecutions.get(action.nodeId);

      if (!existing) return state;

      nodeExecutions.set(action.nodeId, {
        ...existing,
        status: 'error',
        endTime: new Date(),
        duration: action.duration,
        error: action.error,
      });

      return {
        ...state,
        nodeExecutions,
        completedCount: state.completedCount + 1,
        currentNodeId: undefined,
      };
    }

    case 'SKIP_NODE': {
      const nodeExecutions = new Map(state.nodeExecutions);

      nodeExecutions.set(action.nodeId, {
        nodeId: action.nodeId,
        status: 'skipped',
        endTime: new Date(),
        logs: [{ level: 'info', timestamp: new Date(), message: action.reason || 'Node skipped' }],
      });

      return {
        ...state,
        nodeExecutions,
        completedCount: state.completedCount + 1,
        currentNodeId: undefined,
      };
    }

    case 'RETRY_NODE': {
      const nodeExecutions = new Map(state.nodeExecutions);
      const existing = nodeExecutions.get(action.nodeId);

      if (!existing) return state;

      nodeExecutions.set(action.nodeId, {
        ...existing,
        retryCount: action.retryCount,
        status: 'running',
        startTime: new Date(),
      });

      return {
        ...state,
        nodeExecutions,
      };
    }

    case 'ADD_LOG': {
      const nodeExecutions = new Map(state.nodeExecutions);

      // Add log to specific node if provided
      if (action.nodeId) {
        const existing = nodeExecutions.get(action.nodeId);
        if (existing) {
          nodeExecutions.set(action.nodeId, {
            ...existing,
            logs: [
              ...(existing.logs || []),
              {
                timestamp: new Date(),
                level: action.level,
                message: action.message,
                data: action.data,
              },
            ],
          });
        }
      }

      // Add to global logs
      return {
        ...state,
        nodeExecutions,
        logs: [
          ...state.logs,
          {
            timestamp: new Date(),
            level: action.level,
            message: action.message,
            data: action.data,
          },
        ],
      };
    }

    case 'COMPLETE_EXECUTION': {
      const endTime = new Date();
      const duration = state.startTime ? endTime.getTime() - state.startTime.getTime() : 0;

      return {
        ...state,
        isExecuting: false,
        endTime,
        duration,
        status: action.success ? 'completed' : 'failed',
        currentNodeId: undefined,
      };
    }

    case 'CANCEL_EXECUTION': {
      return {
        ...state,
        isExecuting: false,
        status: 'cancelled',
        endTime: new Date(),
        currentNodeId: undefined,
      };
    }

    case 'RESET_EXECUTION': {
      return {
        ...initialExecutionState,
        nodeExecutions: new Map(),
      };
    }

    default:
      return state;
  }
}

/**
 * Execution context
 */
const ExecutionContext = createContext<ExecutionContextValue | null>(null);

/**
 * Execution Provider Props
 */
export interface ExecutionProviderProps {
  children: React.ReactNode;
}

/**
 * Execution Provider Component
 */
export const ExecutionProvider: React.FC<ExecutionProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(executionReducer, initialExecutionState);

  /**
   * Get execution data for a specific node
   */
  const getNodeExecution = useCallback(
    (nodeId: string): NodeExecutionData | undefined => {
      return state.nodeExecutions.get(nodeId);
    },
    [state.nodeExecutions]
  );

  /**
   * Get all logs for a specific node
   */
  const getNodeLogs = useCallback(
    (nodeId: string): ExecutionLog[] => {
      return state.nodeExecutions.get(nodeId)?.logs || [];
    },
    [state.nodeExecutions]
  );

  /**
   * Get all logs
   */
  const getAllLogs = useCallback((): ExecutionLog[] => {
    return state.logs;
  }, [state.logs]);

  const value = useMemo<ExecutionContextValue>(
    () => ({
      state,
      dispatch,
      getNodeExecution,
      getNodeLogs,
      getAllLogs,
    }),
    [state, getNodeExecution, getNodeLogs, getAllLogs]
  );

  return <ExecutionContext.Provider value={value}>{children}</ExecutionContext.Provider>;
};

/**
 * Hook to use execution context
 */
export const useExecution = (): ExecutionContextValue => {
  const context = useContext(ExecutionContext);
  if (!context) {
    throw new Error('useExecution must be used within ExecutionProvider');
  }
  return context;
};

/**
 * Hook to get execution state for a specific node
 */
export const useNodeExecution = (nodeId: string) => {
  const { getNodeExecution } = useExecution();
  return getNodeExecution(nodeId);
};

/**
 * Hook to check if workflow is executing
 */
export const useIsExecuting = (): boolean => {
  const { state } = useExecution();
  return state.isExecuting;
};

/**
 * Hook to get execution progress (0-1)
 */
export const useExecutionProgress = (): number => {
  const { state } = useExecution();
  if (state.totalCount === 0) return 0;
  return state.completedCount / state.totalCount;
};

export default ExecutionContext;
