/**
 * Execution Status Panel
 *
 * Displays real-time execution status, progress, and logs.
 */

import React, { useState, useMemo } from 'react';
import { X, CheckCircle, XCircle, Clock, AlertCircle, Info, Filter } from 'lucide-react';
import { useExecution, useExecutionProgress } from '../../contexts/ExecutionContext';
import { NODE_STATUS_DISPLAY } from '../../types/execution';
import type { ExecutionLog, ExecutionStatistics } from '../../types/execution';

export interface ExecutionStatusPanelProps {
  /** Whether the panel is open */
  isOpen: boolean;
  /** Close the panel */
  onClose: () => void;
}

/**
 * Format distance to now (native JS replacement for date-fns formatDistanceToNow)
 */
const formatDistanceToNow = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

/**
 * Log level colors
 */
const LOG_LEVEL_COLORS: Record<ExecutionLog['level'], string> = {
  info: 'text-blue-600 dark:text-blue-400',
  warn: 'text-yellow-600 dark:text-yellow-400',
  error: 'text-red-600 dark:text-red-400',
  debug: 'text-gray-600 dark:text-gray-400',
};

const LOG_LEVEL_ICONS: Record<ExecutionLog['level'], React.ComponentType<{ className?: string }>> = {
  info: Info,
  warn: AlertCircle,
  error: XCircle,
  debug: Clock,
};

/**
 * Calculate execution statistics
 */
const calculateStatistics = (
  nodeExecutions: Map<string, any>
): ExecutionStatistics => {
  const executions = Array.from(nodeExecutions.values());
  const completedNodes = executions.filter((e) => e.status === 'success');
  const failedNodes = executions.filter((e) => e.status === 'error');
  const skippedNodes = executions.filter((e) => e.status === 'skipped');
  const durations = completedNodes.map((e) => e.duration || 0).filter((d) => d > 0);

  return {
    totalNodes: executions.length,
    completedNodes: completedNodes.length,
    failedNodes: failedNodes.length,
    skippedNodes: skippedNodes.length,
    avgDuration: durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
    minDuration: durations.length > 0 ? Math.min(...durations) : 0,
    maxDuration: durations.length > 0 ? Math.max(...durations) : 0,
    successRate: executions.length > 0 ? (completedNodes.length / executions.length) * 100 : 0,
  };
};

/**
 * Format duration
 */
const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
};

/**
 * Main Execution Status Panel Component
 */
export const ExecutionStatusPanel: React.FC<ExecutionStatusPanelProps> = ({ isOpen, onClose }) => {
  const { state, getAllLogs, getNodeExecution } = useExecution();
  const progress = useExecutionProgress();
  const [logFilter, setLogFilter] = useState<ExecutionLog['level'] | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'nodes'>('overview');

  // Calculate statistics
  const statistics = useMemo(() => {
    return calculateStatistics(state.nodeExecutions);
  }, [state.nodeExecutions]);

  // Filter logs
  const filteredLogs = useMemo(() => {
    const logs = getAllLogs();
    if (logFilter === 'all') return logs;
    return logs.filter((log) => log.level === logFilter);
  }, [getAllLogs, logFilter]);

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 right-0 h-full w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-xl z-20 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Execution Status
        </h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Progress bar */}
      {state.isExecuting && (
        <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Executing...
            </span>
            <span className="text-sm text-blue-600 dark:text-blue-400">
              {state.completedCount} / {state.totalCount}
            </span>
          </div>
          <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300 ease-out"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('overview')}
          className={`
            flex-1 px-4 py-3 text-sm font-medium transition-colors
            ${
              activeTab === 'overview'
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }
          `}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`
            flex-1 px-4 py-3 text-sm font-medium transition-colors
            ${
              activeTab === 'logs'
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }
          `}
        >
          Logs ({state.logs.length})
        </button>
        <button
          onClick={() => setActiveTab('nodes')}
          className={`
            flex-1 px-4 py-3 text-sm font-medium transition-colors
            ${
              activeTab === 'nodes'
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }
          `}
        >
          Nodes ({state.nodeExecutions.size})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'overview' && (
          <div className="p-4">
            {/* Status Summary */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Status
              </h3>
              <div className="flex items-center gap-2">
                {state.status === 'running' && (
                  <>
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Running for {formatDistanceToNow(state.startTime!)}
                    </span>
                  </>
                )}
                {state.status === 'completed' && (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Completed in {formatDuration(state.duration!)}
                    </span>
                  </>
                )}
                {state.status === 'failed' && (
                  <>
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Failed after {formatDuration(state.duration!)}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Statistics */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Statistics
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    {statistics.completedNodes}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Successful
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {statistics.failedNodes}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Failed</div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {statistics.skippedNodes}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Skipped</div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    {statistics.avgDuration.toFixed(0)}ms
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Avg Duration
                  </div>
                </div>
              </div>

              {/* Success Rate */}
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Success Rate</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {statistics.successRate.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-full rounded-full transition-all ${
                      statistics.successRate >= 90
                        ? 'bg-green-600'
                        : statistics.successRate >= 70
                        ? 'bg-yellow-600'
                        : 'bg-red-600'
                    }`}
                    style={{ width: `${statistics.successRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="p-4">
            {/* Log filter */}
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <select
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value as any)}
                className="text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
              >
                <option value="all">All Logs</option>
                <option value="info">Info</option>
                <option value="warn">Warnings</option>
                <option value="error">Errors</option>
                <option value="debug">Debug</option>
              </select>
            </div>

            {/* Logs list */}
            <div className="space-y-2">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                  No logs to display
                </div>
              ) : (
                filteredLogs.map((log, index) => (
                  <div
                    key={index}
                    className={`p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border-l-4 ${
                      log.level === 'error'
                        ? 'border-red-500'
                        : log.level === 'warn'
                        ? 'border-yellow-500'
                        : 'border-blue-500'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className={LOG_LEVEL_COLORS[log.level]}>
                        {(() => {
                          const IconComponent = LOG_LEVEL_ICONS[log.level];
                          return <IconComponent className="w-4 h-4" />;
                        })()}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-800 dark:text-gray-200">
                          {log.message}
                        </div>
                        {log.data && (
                          <pre className="mt-1 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        )}
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'nodes' && (
          <div className="p-4">
            <div className="space-y-2">
              {Array.from(state.nodeExecutions.entries()).map(([nodeId, execution]) => (
                <div
                  key={nodeId}
                  className={`
                    p-3 rounded-lg border-l-4
                    ${
                      execution.status === 'success'
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                        : execution.status === 'error'
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                        : execution.status === 'running'
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                        : execution.status === 'skipped'
                        ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500'
                        : 'bg-gray-50 dark:bg-gray-900 border-gray-500'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {NODE_STATUS_DISPLAY[execution.status].icon}
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {nodeId}
                      </span>
                    </div>
                    {execution.duration && (
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {formatDuration(execution.duration)}
                      </span>
                    )}
                  </div>
                  {execution.error && (
                    <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                      {execution.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExecutionStatusPanel;
