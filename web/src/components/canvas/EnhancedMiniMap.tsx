/**
 * Enhanced Mini-Map
 *
 * An enhanced mini-map for large workflow navigation with:
 * - Customizable node colors by type
 * - Pan and zoom indicator
 * - Click to navigate
 * - Compact and full modes
 */

import React, { useMemo } from 'react';
import { MiniMap as ReactFlowMiniMap, useReactFlow } from '@xyflow/react';
import type { MiniMapProps, MiniMapNodeProps, Node } from '@xyflow/react';

/**
 * Hex colors matching the Tailwind border classes used in CustomNode COLOR_MAP
 */
const NODE_COLORS: Record<string, string> = {
  // Core
  webhook:            '#a855f7',
  httpRequest:        '#3b82f6',
  setVariable:        '#22c55e',
  editFields:         '#818cf8',
  code:               '#a78bfa',
  filter:             '#22d3ee',
  switch:             '#fb923c',
  merge:              '#f472b6',
  splitInBatches:     '#2dd4bf',
  wait:               '#9ca3af',
  errorTrigger:       '#f87171',
  executeWorkflow:    '#34d399',
  limit:              '#a3e635',
  sort:               '#38bdf8',
  // Triggers
  schedule:           '#f59e0b',
  onSuccessFailure:   '#f43f5e',
  formTrigger:        '#60a5fa',
  chatTrigger:        '#6366f1',
  clickTrigger:       '#ec4899',
  emailTrigger:       '#6b7280',
  httpPollTrigger:    '#14b8a6',
  cronTrigger:        '#eab308',
  // HTTP & data
  htmlExtract:        '#4ade80',
  rssRead:            '#fb923c',
  ftp:                '#c084fc',
  ssh:                '#6b7280',
  // Database
  mySQL:              '#2563eb',
  mongoDB:            '#16a34a',
  redis:              '#dc2626',
  supabase:           '#10b981',
  // Communication
  email:              '#6b7280',
  slack:              '#9333ea',
  discord:            '#6366f1',
  telegram:           '#06b6d4',
  whatsApp:           '#22c55e',
  // Cloud / productivity
  googleSheets:       '#16a34a',
  googleDrive:        '#eab308',
  airtable:           '#3b82f6',
  notion:             '#9ca3af',
  trello:             '#f97316',
  // AI/LLM
  openAI:             '#34d399',
  aiAgent:            '#a78bfa',
  vectorStore:        '#f472b6',
  embeddings:         '#22d3ee',
  // Memory/Tool sub-nodes
  memory:             '#8b5cf6',
  tool:               '#f59e0b',
  // Exclusive custom
  humanInTheLoop:     '#ec4899',
  smartDataCleaner:   '#eab308',
  aiCostGuardian:     '#06b6d4',
  noCodeBrowserAutomator: '#6366f1',
  aggregatorMultiSearch:  '#14b8a6',
  pdfIntelligentParser:   '#f43f5e',
  liveCanvasDebugger:     '#a3e635',
  socialMockupPreview:    '#a78bfa',
  rateLimiterBypass:      '#f59e0b',
  ghost:              '#9ca3af',
};

/**
 * Get node fill color based on type
 */
const getNodeColor = (node: Node): string =>
  NODE_COLORS[node.type || ''] ?? '#4b5563';

/** Custom node renderer — bypasses React Flow CSS variable overrides */
const MiniMapNodeRenderer = ({ x, y, width, height, color }: MiniMapNodeProps) => (
  <rect x={x} y={y} width={width} height={height} rx={3} fill={color as string} fillOpacity={0.9} />
);

/**
 * Enhanced MiniMap Component
 */
export const EnhancedMiniMap: React.FC<
  Omit<MiniMapProps, 'nodeColor'> & {
    /** Show node labels in mini-map */
    showLabels?: boolean;
    /** Compact mode (smaller, no labels) */
    compact?: boolean;
    /** Position of mini-map */
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  }
> = ({
  showLabels = false,
  compact = false,
  position = 'bottom-right',
  ...props
}) => {
  const nodeColor = useMemo(() => (node: Node) => getNodeColor(node), []);

  const positionClasses: Record<string, string> = {
    'top-left':     'top-4 left-4',
    'top-right':    'top-4 right-4',
    'bottom-left':  'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  const w = compact ? 160 : 200;
  const h = compact ? 120 : 150;

  return (
    <div className={`${positionClasses[position]} transition-all duration-200 ${compact ? 'scale-75 origin-bottom-right' : ''}`}>
      {/* Make minimap edges visible on dark background */}
      <style>{`
        .react-flow__minimap svg path.react-flow__minimap-edge {
          stroke: rgba(255,255,255,0.4) !important;
          stroke-width: 1.5px !important;
          fill: none !important;
        }
      `}</style>

      <ReactFlowMiniMap
        nodeColor={nodeColor}
        nodeComponent={MiniMapNodeRenderer}
        maskColor="rgba(0,0,0,0.55)"
        pannable
        zoomable
        style={{ width: w, height: h, background: '#0a0a0a', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 8 }}
        {...props}
      />
    </div>
  );
};

/**
 * Mini-map with legend showing node types
 */
export const MiniMapWithLegend: React.FC<{
  /** Show/hide the legend */
  showLegend?: boolean;
  /** Compact mode */
  compact?: boolean;
}> = ({ showLegend = true, compact = false }) => {
  const { getNodes } = useReactFlow();
  const nodes = getNodes();

  // Get unique node types and their counts
  const nodeTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    nodes.forEach((node) => {
      const type = node.type || 'unknown';
      counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
  }, [nodes]);

  return (
    <div className="flex flex-col gap-2">
      {/* Mini-map */}
      <EnhancedMiniMap compact={compact} position="top-right" />

      {/* Legend */}
      {showLegend && !compact && (
        <div className="absolute top-4 right-4 mt-[170px] bg-black border border-white/5 rounded-lg shadow-lg p-3">
          <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Node Types ({Object.keys(nodeTypeCounts).length})
          </h3>
          <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto">
            {Object.entries(nodeTypeCounts)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 10)
              .map(([type, count]) => {
                const color = NODE_COLORS[type] ?? '#6b7280';
                return (
                  <div
                    key={type}
                    className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400"
                  >
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: color }}
                    />
                    <span className="flex-1 truncate">{type}</span>
                    <span className="font-mono text-gray-500">{count}</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedMiniMap;
