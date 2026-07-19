/**
 * EdgeContextActions - Contextual actions for selected edge
 * Features:
 * - Delete connection button
 * - Add node button (inserts node between the two connected nodes)
 */

import { Trash2, Plus } from 'lucide-react';
import type { CustomNode } from '../../types/node';
import type { Edge } from '@xyflow/react';
import { useReactFlow } from '@xyflow/react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface EdgeContextActionsProps {
  edge: Edge;
  nodes: CustomNode[];
  onDeleteEdge: (edgeId: string) => void;
  onAddNodeBetween: (sourceId: string, targetId: string, edgeId: string) => void;
}

export function EdgeContextActions({
  edge,
  nodes,
  onDeleteEdge,
  onAddNodeBetween,
}: EdgeContextActionsProps) {
  const { t } = useTranslation();
  const [screenPosition, setScreenPosition] = useState({ x: 0, y: 0 });
  const reactFlow = useReactFlow();

  useEffect(() => {
    // Calculate midpoint between source and target nodes
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    
    if (sourceNode && targetNode) {
      // Find the edge element in the DOM
      const edgeElement = document.querySelector(`[data-id="${edge.id}"]`);
      if (edgeElement) {
        const svgPath = edgeElement.querySelector('path');
        if (svgPath) {
          const pathLength = svgPath.getTotalLength();
          const midPoint = svgPath.getPointAtLength(pathLength / 2);
          
          // Get the bounding rect of the ReactFlow pane to calculate absolute position
          const pane = document.querySelector('.react-flow__pane');
          if (pane) {
            const paneRect = pane.getBoundingClientRect();
            setScreenPosition({
              x: midPoint.x + paneRect.left,
              y: midPoint.y + paneRect.top,
            });
          }
        }
      }
    }
  }, [edge, nodes, reactFlow.getZoom(), reactFlow.getViewport()]);

  return (
    <div
      className="absolute z-50 pointer-events-none"
      style={{
        left: screenPosition.x,
        top: screenPosition.y,
        transform: 'translate(-50%, -100px)',
      }}
    >
      <div className="flex items-center gap-2 bg-gray-900/95 backdrop-blur-sm border border-gray-700/50 rounded-lg px-2 py-1.5 shadow-xl pointer-events-auto animate-fadeIn">
        {/* Delete Connection */}
        <button
          onClick={() => onDeleteEdge(edge.id)}
          className="transition-colors group"
          title="Supprimer la connexion"
        >
          <Trash2 className="w-2 h-2 text-red-400 group-hover:text-red-300" />
        </button>

        {/* Add Node Between */}
        <button
          onClick={() => onAddNodeBetween(edge.source, edge.target, edge.id)}
          className="transition-colors group"
          title={t('canvas.insertNode')}
        >
          <Plus className="w-2 h-2 text-brand-blue group-hover:text-blue-300" />
        </button>
      </div>
    </div>
  );
}
