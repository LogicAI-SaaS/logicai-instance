/**
 * Execution-Aware Node Wrapper
 *
 * Wraps a node component with execution status display.
 * Shows visual indicators for execution state.
 */

import React, { useMemo } from 'react';
import type { NodeProps } from '@xyflow/react';
import { useExecution } from '../../contexts/ExecutionContext';
import { NODE_STATUS_DISPLAY } from '../../types/execution';
import type { NodeStatus } from '../../types/execution';

export interface ExecutionAwareNodeProps extends NodeProps {
  /** Inner node component to render */
  children: React.ReactNode;
  /** Override the execution status (for testing) */
  overrideStatus?: NodeStatus;
}

/**
 * Get status color with opacity for background
 */
const getStatusBackground = (status: NodeStatus): string => {
  const colors: Record<NodeStatus, string> = {
    idle: 'rgba(107, 114, 128, 0)',
    pending: 'rgba(245, 158, 11, 0.1)',
    running: 'rgba(59, 130, 246, 0.15)',
    success: 'rgba(16, 185, 129, 0.1)',
    error: 'rgba(239, 68, 68, 0.15)',
    skipped: 'rgba(139, 92, 246, 0.1)',
  };
  return colors[status];
};

/**
 * Get status border color
 */
const getStatusBorder = (status: NodeStatus): string => {
  const colors: Record<NodeStatus, string> = {
    idle: 'transparent',
    pending: '#f59e0b',
    running: '#3b82f6',
    success: '#10b981',
    error: '#ef4444',
    skipped: '#8b5cf6',
  };
  return colors[status];
};

/**
 * Get status glow/shadow
 */
const getStatusShadow = (status: NodeStatus): string => {
  const colors: Record<NodeStatus, string> = {
    idle: 'none',
    pending: '0 0 20px rgba(245, 158, 11, 0.3)',
    running: '0 0 20px rgba(59, 130, 246, 0.4)',
    success: 'none',
    error: '0 0 20px rgba(239, 68, 68, 0.4)',
    skipped: 'none',
  };
  return colors[status];
};

/**
 * Get status animation class
 */
const getStatusAnimation = (status: NodeStatus): string => {
  switch (status) {
    case 'running':
      return 'animate-pulse';
    case 'pending':
      return 'animate-pulse';
    default:
      return '';
  }
};

/**
 * Execution status badge component
 */
const ExecutionBadge: React.FC<{
  status: NodeStatus;
  duration?: number;
  error?: string;
}> = ({ status, duration, error }) => {
  const display = NODE_STATUS_DISPLAY[status];

  if (status === 'idle') {
    return null;
  }

  return (
    <div className="absolute -top-2 -right-2 z-10">
      <div
        className={`
          flex items-center justify-center
          w-6 h-6 rounded-full
          text-white text-xs font-bold
          shadow-lg
          ${getStatusAnimation(status)}
        `}
        style={{
          backgroundColor: display.color,
          boxShadow: getStatusShadow(status),
        }}
        title={`${display.label}${duration ? ` (${duration}ms)` : ''}${error ? `: ${error}` : ''}`}
      >
        {display.icon}
      </div>
    </div>
  );
};

/**
 * Execution progress bar for running nodes
 */
const ExecutionProgress: React.FC<{ progress?: number }> = ({ progress = 0 }) => {
  if (progress <= 0 || progress >= 100) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-b-md overflow-hidden">
      <div
        className="h-full bg-blue-500 transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

/**
 * Main Execution-Aware Node Wrapper
 */
export const ExecutionAwareNode: React.FC<ExecutionAwareNodeProps> = ({
  id,
  children,
  overrideStatus,
}) => {
  const { getNodeExecution } = useExecution();

  // Get execution status for this node
  const execution = useMemo(() => {
    return getNodeExecution(id);
  }, [id, getNodeExecution]);

  const status = overrideStatus || execution?.status || 'idle';
  const duration = execution?.duration;
  const error = execution?.error;

  const backgroundColor = getStatusBackground(status);
  const borderColor = getStatusBorder(status);
  const boxShadow = getStatusShadow(status);
  const animation = getStatusAnimation(status);

  return (
    <div
      className={`
        relative
        ${animation}
        transition-all duration-300
      `}
      style={{
        backgroundColor,
        border: borderColor ? `2px solid ${borderColor}` : undefined,
        boxShadow,
      }}
    >
      {children}

      {/* Execution status badge */}
      <ExecutionBadge status={status} duration={duration} error={error} />

      {/* Duration tooltip on hover */}
      {(status === 'success' || status === 'error') && duration && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity">
          {duration}ms
        </div>
      )}
    </div>
  );
};

/**
 * Higher-order component to wrap a node with execution awareness
 */
export const withExecutionAwareness = <P extends NodeProps>(
  NodeComponent: React.ComponentType<P>
): React.FC<P> => {
  return (props) => {
    return (
      <ExecutionAwareNode {...props}>
        <NodeComponent {...props} />
      </ExecutionAwareNode>
    );
  };
};

export default ExecutionAwareNode;
