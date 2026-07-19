/**
 * Data Flow Edge
 *
 * Custom edge component that shows data preview on hover.
 * Displays data flowing between nodes with visual indicators.
 */

import React, { useState, useMemo } from 'react';
import type { EdgeProps } from '@xyflow/react';
import {
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
} from '@xyflow/react';
import { useExecution } from '../../contexts/ExecutionContext';

export interface DataFlowEdgeData {
  /** Source node output data */
  sourceData?: any;
  /** Target node input data */
  targetData?: any;
  /** Data type label */
  dataType?: string;
  /** Number of items in array data */
  itemCount?: number;
  /** Whether edge is active (data flowing) */
  isActive?: boolean;
}

/**
 * Custom edge with data flow visualization
 */
export const DataFlowEdge: React.FC<any> = ({
  id,
  source,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  selected,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { getNodeExecution } = useExecution();

  // Explicitly cast data to our edge data type
  const edgeData = data as DataFlowEdgeData | undefined;

  // Get source node execution status
  const sourceExecution = useMemo(() => {
    return getNodeExecution(source as string);
  }, [source, getNodeExecution]);

  // Calculate bezier path
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Determine edge color based on execution state
  const edgeColor = useMemo(() => {
    if (selected) return '#3b82f6'; // Blue when selected
    if (edgeData?.isActive) return '#10b981'; // Green when active
    if (sourceExecution?.status === 'running') return '#f59e0b'; // Orange when source running
    if (sourceExecution?.status === 'success') return '#10b981'; // Green when source succeeded
    if (sourceExecution?.status === 'error') return '#ef4444'; // Red when source failed
    return '#94a3b8'; // Default gray
  }, [selected, edgeData?.isActive, sourceExecution?.status]);

  // Determine edge width
  const edgeWidth = selected || edgeData?.isActive ? 3 : 2;

  // Animated dash for active edges
  const isAnimated = edgeData?.isActive || sourceExecution?.status === 'running';

  return (
    <>
      <g
        className="group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Main edge */}
        <BaseEdge
          id={id}
          path={edgePath}
          markerEnd={markerEnd}
          style={{
            ...style,
            stroke: edgeColor,
            strokeWidth: edgeWidth,
            strokeDasharray: isAnimated ? '8 4' : undefined,
            animation: isAnimated ? 'dash 1s linear infinite' : undefined,
          }}
        />

        {/* Glow effect for active/selected edges */}
        {(selected || edgeData?.isActive) && (
          <BaseEdge
            id={`${id}-glow`}
            path={edgePath}
            markerEnd={markerEnd}
            style={{
              stroke: edgeColor,
              strokeWidth: edgeWidth + 6,
              opacity: 0.3,
              filter: 'blur(4px)',
            }}
          />
        )}

        {/* Data type badge */}
        {edgeData?.dataType && (isHovered || selected) && (
          <EdgeLabelRenderer>
            <div
              style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                pointerEvents: 'none',
              }}
              className="px-2 py-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-300 whitespace-nowrap z-10"
            >
              {edgeData?.itemCount !== undefined && (
                <span className="font-medium">{edgeData?.itemCount} items</span>
              )}
              {edgeData?.itemCount === undefined && edgeData?.dataType && (
                <span className="font-medium">{edgeData?.dataType}</span>
              )}
            </div>
          </EdgeLabelRenderer>
        )}

        {/* Data preview tooltip on hover */}
        {isHovered && edgeData?.sourceData && (
          <EdgeLabelRenderer>
            <div
              style={{
                position: 'absolute',
                transform: `translate(-50%, -100%) translate(${labelX}px, ${labelY - 10}px)`,
                pointerEvents: 'none',
              }}
              className="w-64 p-3 bg-gray-900 dark:bg-gray-800 text-white rounded-lg shadow-xl border border-gray-700 text-xs z-20"
            >
              <div className="font-semibold mb-2 text-gray-300">Data Preview</div>
              <pre className="overflow-x-auto text-gray-400">
                {JSON.stringify(data.sourceData, null, 2).slice(0, 200)}
                {JSON.stringify(data.sourceData, null, 2).length > 200 && '...'}
              </pre>
            </div>
          </EdgeLabelRenderer>
        )}
      </g>

      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -12;
          }
        }
      `}</style>
    </>
  );
};

/**
 * Edge with animated particles for data flow
 */
export const AnimatedDataEdge: React.FC<any> = (props) => {
  const { sourceX, sourceY, targetX, targetY, data } = props;
  const edgeData = data as DataFlowEdgeData | undefined;

  const [particles, setParticles] = useState<Array<{ id: string; progress: number }>>([]);

  // Add particle when data is active
  React.useEffect(() => {
    if (edgeData?.isActive) {
      const id = Math.random().toString(36);
      setParticles((prev) => [...prev, { id, progress: 0 }]);

      // Animate particle
      const animation = setInterval(() => {
        setParticles((prev) => {
          const updated = prev.map((p) =>
            p.id === id ? { ...p, progress: p.progress + 0.02 } : p
          );
          // Remove completed particles
          return updated.filter((p) => p.progress < 1);
        });
      }, 16);

      return () => clearInterval(animation);
    }
  }, [edgeData?.isActive]);

  return (
    <>
      <DataFlowEdge {...props} />
      {/* Render particles */}
      {particles.map((particle) => {
        const x = sourceX + (targetX - sourceX) * particle.progress;
        const y = sourceY + (targetY - sourceY) * particle.progress;

        return (
          <circle
            key={particle.id}
            cx={x}
            cy={y}
            r={4}
            fill="#10b981"
            opacity={1 - particle.progress}
          />
        );
      })}
    </>
  );
};

export default DataFlowEdge;
