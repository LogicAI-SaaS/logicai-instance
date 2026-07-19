/**
 * WorkflowCanvas - Main React Flow Canvas Component
 * Features:
 * - React Flow integration with CustomNode
 * - Dark mode styling
 * - Drag and drop node support
 * - Node and edge change handling
 * - Grid background
 * - Enhanced zoom controls and mini-map
 * - Execution-aware nodes and data flow edges
 */

import { useState } from 'react';
import { MessageSquare, ScrollText } from 'lucide-react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
} from '@xyflow/react';
import type {
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  NodeMouseHandler,
  EdgeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomNodeComponent from './CustomNode';
import { ZoomControls } from './ZoomControls';
import { EnhancedMiniMap } from './EnhancedMiniMap';
import { RemoteCursorsLayer } from './RemoteCursorsLayer';
import type { CustomNode } from '../../types/node';
import type { RemoteCursor } from '../../hooks/useCollaboration';

const nodeTypes = {
  custom: CustomNodeComponent,
};

interface WorkflowCanvasProps {
  nodes?: CustomNode[];
  edges?: Edge[];
  onNodesChange?: OnNodesChange<CustomNode>;
  onEdgesChange?: OnEdgesChange<Edge>;
  onConnect?: OnConnect;
  onNodeClick?: NodeMouseHandler<CustomNode>;
  onNodeDoubleClick?: NodeMouseHandler<CustomNode>;
  onNodeMouseEnter?: NodeMouseHandler<CustomNode>;
  onNodeMouseLeave?: NodeMouseHandler<CustomNode>;
  onEdgeClick?: EdgeMouseHandler<Edge>;
  onPaneClick?: (event: React.MouseEvent) => void;
  readOnly?: boolean;
  showMiniMap?: boolean;
  onToggleMiniMap?: () => void;
  showChatPanel?: boolean;
  onToggleChatPanel?: () => void;
  showExecutionPanel?: boolean;
  onToggleExecutionPanel?: () => void;
  remoteCursors?: RemoteCursor[];
}

export default function WorkflowCanvas({
  nodes = [],
  edges = [],
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onNodeDoubleClick,
  onNodeMouseEnter,
  onNodeMouseLeave,
  onEdgeClick,
  onPaneClick,
  readOnly = false,
  showMiniMap = true,
  onToggleMiniMap,
  showChatPanel = false,
  onToggleChatPanel,
  showExecutionPanel = false,
  onToggleExecutionPanel,
  remoteCursors = [],
}: WorkflowCanvasProps) {
  const [miniMapPosition, setMiniMapPosition] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'>('bottom-right');
  return (
    <div className="w-full h-full relative" style={{
      background: 'linear-gradient(135deg, #010101 0%, #0a0a0a 50%, #010101 100%)'
    }}>
      {/* Ambient glow effect */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(circle at 50% 50%, rgba(0, 112, 255, 0.03) 0%, transparent 50%)'
      }} />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={true}
        selectNodesOnDrag={false}
        deleteKeyCode="Delete"
        className="bg-transparent"
        style={{ background: 'transparent' }}
        defaultEdgeOptions={{
          animated: false,
          style: { stroke: '#4A4A4E', strokeWidth: 2 },
        }}
        panOnScroll={true}
        selectionOnDrag={true}
        selectionKeyCode="Control"
        multiSelectionKeyCode="Control"
        zoomOnScroll={true}
        zoomOnPinch={true}
        panOnDrag={true}
        minZoom={0.2}
        maxZoom={4}
        autoPanOnNodeDrag={false}
        autoPanOnConnect={false}
        preventScrolling={true}
        elevateNodesOnSelect={false}
        elevateEdgesOnSelect={false}
        snapToGrid={false}
        nodeOrigin={[0.5, 0.5]}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.5}
          color="#2A2A2E"
          style={{
            opacity: 0.6
          }}
        />
      </ReactFlow>

      {/* Remote cursors overlay — outside ReactFlow to avoid double-transform */}
      {remoteCursors.length > 0 && (
        <RemoteCursorsLayer cursors={remoteCursors} />
      )}

      {/* Enhanced Zoom Controls */}
      <ZoomControls
        showMiniMap={showMiniMap}
        onToggleMiniMap={onToggleMiniMap}
      />

      {/* Mini-Map */}
      {showMiniMap && (
        <EnhancedMiniMap
          showLabels={false}
          compact={false}
          position={miniMapPosition}
        />
      )}

      {/* Chat & Logs buttons removed — handled by the resizable BottomBar in WorkflowEditor */}
    </div>
  );
}
