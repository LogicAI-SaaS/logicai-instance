/**
 * Data Flow Inspector
 *
 * Panel to inspect data flowing between nodes.
 * Shows detailed view of data for selected connections.
 */

import React, { useState, useMemo } from 'react';
import { X, ChevronRight, ChevronDown, Search, Copy, Check } from 'lucide-react';
import type { Edge } from '@xyflow/react';
import { useExecution } from '../../contexts/ExecutionContext';

export interface DataFlowInspectorProps {
  /** Whether the panel is open */
  isOpen: boolean;
  /** Close the panel */
  onClose: () => void;
  /** Selected edge for inspection */
  selectedEdge?: Edge | null;
}

/**
 * JsonTree component for displaying JSON data
 */
const JsonTree: React.FC<{
  data: any;
  expanded?: boolean;
  onCopy?: (data: any) => void;
}> = ({ data, expanded = false, onCopy }) => {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy?.(data);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (data === null) {
    return <span className="text-purple-600 dark:text-purple-400">null</span>;
  }

  if (data === undefined) {
    return <span className="text-gray-500 dark:text-gray-400">undefined</span>;
  }

  if (typeof data === 'boolean') {
    return <span className="text-blue-600 dark:text-blue-400">{String(data)}</span>;
  }

  if (typeof data === 'number') {
    return <span className="text-green-600 dark:text-green-400">{String(data)}</span>;
  }

  if (typeof data === 'string') {
    return <span className="text-orange-600 dark:text-orange-400">"{data}"</span>;
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return <span className="text-gray-500">[]</span>;
    }

    return (
      <div className="ml-4">
        <span className="text-gray-600 dark:text-gray-400">[</span>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          {isExpanded ? (
            <ChevronDown className="w-3 h-3 inline" />
          ) : (
            <ChevronRight className="w-3 h-3 inline" />
          )}
          {data.length} items
        </button>
        {isExpanded && (
          <div className="ml-4 border-l border-gray-300 dark:border-gray-600 pl-2">
            {data.map((item, index) => (
              <div key={index} className="py-1">
                <span className="text-gray-500 dark:text-gray-400">{index}:</span>
                <JsonTree data={item} />
              </div>
            ))}
          </div>
        )}
        <span className="text-gray-600 dark:text-gray-400">]</span>
      </div>
    );
  }

  if (typeof data === 'object') {
    const keys = Object.keys(data);
    if (keys.length === 0) {
      return <span className="text-gray-500">{'{ }'}</span>;
    }

    return (
      <div className="ml-4">
        <span className="text-gray-600 dark:text-gray-400">{'{'}</span>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          {isExpanded ? (
            <ChevronDown className="w-3 h-3 inline" />
          ) : (
            <ChevronRight className="w-3 h-3 inline" />
          )}
          {keys.length} keys
        </button>
        {isExpanded && (
          <div className="ml-4 border-l border-gray-300 dark:border-gray-600 pl-2">
            {keys.map((key) => (
              <div key={key} className="py-1">
                <span className="text-purple-600 dark:text-purple-400">{key}:</span>
                <span className="ml-2">
                  <JsonTree data={data[key]} />
                </span>
              </div>
            ))}
          </div>
        )}
        <span className="text-gray-600 dark:text-gray-400">{'}'}</span>
      </div>
    );
  }

  return <span className="text-gray-500">{String(data)}</span>;
};

/**
 * Main Data Flow Inspector Component
 */
export const DataFlowInspector: React.FC<DataFlowInspectorProps> = ({
  isOpen,
  onClose,
  selectedEdge,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { getNodeExecution, state } = useExecution();

  // Get data for selected edge
  const edgeData = useMemo(() => {
    if (!selectedEdge) return null;

    const sourceExecution = getNodeExecution(selectedEdge.source);
    return {
      sourceId: selectedEdge.source,
      targetId: selectedEdge.target,
      sourceData: sourceExecution?.outputData,
      targetData: null, // Would need to track this
      status: sourceExecution?.status,
      timestamp: sourceExecution?.endTime,
      dataType: Array.isArray(sourceExecution?.outputData) ? 'array' : typeof sourceExecution?.outputData,
      itemCount: Array.isArray(sourceExecution?.outputData) ? sourceExecution.outputData.length : undefined,
    };
  }, [selectedEdge, getNodeExecution]);

  // Filter data by search query
  const filteredData = useMemo(() => {
    if (!edgeData?.sourceData || !searchQuery) return edgeData?.sourceData;

    const filterObject = (obj: any, query: string): any => {
      if (Array.isArray(obj)) {
        return obj.map((item) => filterObject(item, query)).filter(Boolean);
      }

      if (typeof obj === 'object' && obj !== null) {
        const result: any = {};
        for (const [key, value] of Object.entries(obj)) {
          if (key.toLowerCase().includes(query.toLowerCase())) {
            result[key] = value;
          } else if (typeof value === 'object') {
            const filtered = filterObject(value, query);
            if (filtered && (typeof filtered !== 'object' || Object.keys(filtered).length > 0)) {
              result[key] = filtered;
            }
          }
        }
        return Object.keys(result).length > 0 ? result : null;
      }

      return obj;
    };

    return filterObject(edgeData.sourceData, searchQuery);
  }, [edgeData, searchQuery]);

  const handleCopy = () => {
    if (filteredData) {
      navigator.clipboard.writeText(JSON.stringify(filteredData, null, 2));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 right-0 h-full w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-xl z-20 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Data Inspector
        </h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {!selectedEdge ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <p className="text-sm">Select a connection to inspect data</p>
          </div>
        ) : !edgeData?.sourceData ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <p className="text-sm">No data available</p>
            <p className="text-xs mt-1">Execute the workflow to see data</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Connection info */}
            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Connection
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded">
                  {edgeData.sourceId}
                </span>
                <span className="text-gray-400">→</span>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded">
                  {edgeData.targetId}
                </span>
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {edgeData.dataType && (
                  <span className="mr-3">Type: {edgeData.dataType}</span>
                )}
                {edgeData.itemCount !== undefined && (
                  <span>Items: {edgeData.itemCount}</span>
                )}
              </div>
            </div>

            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter data..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy JSON
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(filteredData, null, 2)], {
                    type: 'application/json',
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `data-${Date.now()}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md transition-colors"
              >
                Download
              </button>
            </div>

            {/* Data tree */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-x-auto">
              <JsonTree data={filteredData} expanded={true} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataFlowInspector;
