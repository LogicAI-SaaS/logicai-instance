/**
 * ExecutionLogsPanel - Panel for displaying node execution logs
 * Features:
 * - Shows execution logs for all nodes in execution order
 * - Displays errors, success, and running status
 * - Collapsible panel
 * - Auto-scroll to latest logs
 * - Side panel with HTTP request/response details
 */

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, X, CheckCircle, XCircle, Loader2, Clock, Network, Eye, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface ExecutionLog {
  id: string;
  nodeId: string;
  nodeName: string;
  nodeType: string;
  status: 'running' | 'success' | 'error';
  message: string;
  timestamp: Date;
  duration?: number;
  details?: any;
  httpDetails?: {
    url: string;
    method: string;
    status?: number;
    statusText?: string;
    headers?: Record<string, any>;
    requestBody?: any;
    responseData?: any;
  };
}

interface ExecutionLogsPanelProps {
  logs: ExecutionLog[];
  onClear: () => void;
  onClose: () => void;
}

export default function ExecutionLogsPanel({ logs, onClear, onClose }: ExecutionLogsPanelProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [selectedLog, setSelectedLog] = useState<ExecutionLog | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sort logs by timestamp to ensure chronological order
  const sortedLogs = [...logs].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const getStatusIcon = (status: ExecutionLog['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusColor = (status: ExecutionLog['status']) => {
    switch (status) {
      case 'running':
        return 'border-blue-500/30 bg-blue-500/5';
      case 'success':
        return 'border-green-500/30 bg-green-500/5';
      case 'error':
        return 'border-red-500/30 bg-red-500/5';
    }
  };

  return (
    <div className="flex h-full">
      {/* Main Logs Panel */}
      <div className="flex-1 bg-bg-card flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-white">{t('logs.title')}</h3>
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-700 text-gray-300">
            {logs.length}
          </span>
          {logs.some((log) => log.status === 'running') && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-500/20 text-blue-300">
              {t('logs.running')}
            </span>
          )}
          {logs.some((log) => log.status === 'error') && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-500/20 text-red-300">
              {t('logs.errors')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-2 hover:bg-white/10 rounded transition-colors ${
              autoScroll ? 'text-orange-500' : 'text-gray-400'
            }`}
            title={autoScroll ? t('logs.autoScrollOn') : t('logs.autoScrollOff')}
          >
            <Clock className="w-4 h-4" />
          </button>
          <button
            onClick={onClear}
            className="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
          >
            {t('logs.clear')}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-white/10 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Logs Content */}
      {isExpanded && (
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-2"
        >
          {logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-sm">{t('logs.empty')}</p>
              <p className="text-xs mt-1">{t('logs.emptyHint')}</p>
            </div>
          ) : (
            sortedLogs.map((log) => (
              <div
                key={log.id}
                className={`p-3 rounded-lg border ${getStatusColor(log.status)} transition-all duration-200 cursor-pointer hover:border-white/20 ${
                  selectedLog?.id === log.id ? 'ring-2 ring-orange-500/50' : ''
                }`}
                onClick={() => setSelectedLog(log)}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getStatusIcon(log.status)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white">
                        {log.nodeName}
                      </span>
                      <span className="text-xs text-gray-500 capitalize">
                        {log.nodeType}
                      </span>
                      {log.duration && (
                        <span className="text-xs text-gray-400">
                          {log.duration}ms
                        </span>
                      )}
                      {log.httpDetails && (
                        <span className="flex items-center gap-1 text-xs text-blue-400">
                          <Network className="w-3 h-3" />
                          HTTP
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-sm ${
                        log.status === 'error'
                          ? 'text-red-400'
                          : log.status === 'success'
                          ? 'text-green-400'
                          : 'text-blue-400'
                      }`}
                    >
                      {log.message}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-600">
                        {log.timestamp.toLocaleTimeString('fr-FR')}
                      </p>
                      {(log.httpDetails || log.details) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                          className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          {t('logs.viewDetails')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
      </div>

      {/* Side Details Panel */}
      {selectedLog && (
        <div
          className="w-96 bg-bg-card border-l border-white/10 overflow-y-auto"
          style={{
            backdropFilter: 'blur(20px)',
            boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div className="sticky top-0 bg-bg-card/95 backdrop-blur-sm border-b border-white/10 p-4 z-10">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-orange-500" />
                {t('logs.detailsTitle')}
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 hover:bg-white/10 rounded transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div>
              <p className="text-sm font-medium text-white">{selectedLog.nodeName}</p>
              <p className="text-xs text-gray-500 capitalize">{selectedLog.nodeType}</p>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Status Badge */}
            <div className="flex items-center gap-2">
              {getStatusIcon(selectedLog.status)}
              <span className="text-xs font-medium text-gray-400 uppercase">
                {selectedLog.status}
              </span>
              {selectedLog.duration && (
                <span className="text-xs text-gray-500">
                  {selectedLog.duration}ms
                </span>
              )}
            </div>

            {/* HTTP Details */}
            {selectedLog.httpDetails && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
                  <Network className="w-4 h-4" />
                  {t('logs.httpDetails')}
                </div>

                {/* Request */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                    <ArrowRight className="w-3 h-3" />
                    {t('logs.request')}
                  </div>
                  <div className="bg-black/30 rounded p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-xs font-mono font-semibold rounded bg-blue-500/20 text-blue-300">
                        {selectedLog.httpDetails.method}
                      </span>
                      <span className="text-xs text-gray-400 font-mono break-all">
                        {selectedLog.httpDetails.url}
                      </span>
                    </div>
                    {selectedLog.httpDetails.requestBody && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Body:</p>
                        <pre className="text-xs text-gray-300 overflow-x-auto">
                          {JSON.stringify(selectedLog.httpDetails.requestBody, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>

                {/* Response */}
                {selectedLog.httpDetails.status && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                      <ArrowRight className="w-3 h-3 rotate-180" />
                    {t('logs.response')}
                    </div>
                    <div className="bg-black/30 rounded p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 text-xs font-mono font-semibold rounded ${
                            selectedLog.httpDetails.status >= 200 && selectedLog.httpDetails.status < 300
                              ? 'bg-green-500/20 text-green-300'
                              : selectedLog.httpDetails.status >= 400
                              ? 'bg-red-500/20 text-red-300'
                              : 'bg-yellow-500/20 text-yellow-300'
                          }`}
                        >
                          {selectedLog.httpDetails.status}
                        </span>
                        <span className="text-xs text-gray-400">
                          {selectedLog.httpDetails.statusText}
                        </span>
                      </div>
                      {selectedLog.httpDetails.responseData && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Data:</p>
                          <pre className="text-xs text-gray-300 overflow-x-auto max-h-64 overflow-y-auto">
                            {JSON.stringify(selectedLog.httpDetails.responseData, null, 2)}
                          </pre>
                        </div>
                      )}
                      {selectedLog.httpDetails.headers && Object.keys(selectedLog.httpDetails.headers).length > 0 && (
                        <details>
                          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                            Headers
                          </summary>
                          <pre className="mt-2 text-xs text-gray-400 overflow-x-auto">
                            {JSON.stringify(selectedLog.httpDetails.headers, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* General Details */}
            {selectedLog.details && !selectedLog.httpDetails && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-400">{t('logs.generalDetails')}</p>
                <pre className="p-3 bg-black/30 rounded text-xs text-gray-300 overflow-x-auto">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            )}

            {/* Message */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-400">Message</p>
              <p
                className={`text-sm p-3 bg-black/30 rounded ${
                  selectedLog.status === 'error'
                    ? 'text-red-400'
                    : selectedLog.status === 'success'
                    ? 'text-green-400'
                    : 'text-blue-400'
                }`}
              >
                {selectedLog.message}
              </p>
            </div>

            {/* Timestamp */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-400">Timestamp</p>
              <p className="text-xs text-gray-500">
                {selectedLog.timestamp.toLocaleString('fr-FR')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
