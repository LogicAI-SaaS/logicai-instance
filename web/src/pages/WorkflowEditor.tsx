/**
 * WorkflowEditor - Main workflow editing page
 * Features:
 * - React Flow canvas with drag & drop
 * - Sidebar for node configuration
 * - Toolbar with save, execute, activate/deactivate
 * - Dark mode styling
 * - Export/Import workflows
 * - Auto-save
 * - Execution tracking
 * - Data flow visualization
 * - Templates gallery
 * - Command palette
 * - Keyboard shortcuts
 */

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  ScrollText,
  Settings,
  Loader2,
  MessageSquare,
  Key,
  BookTemplate,
  Keyboard,
  Search,
} from 'lucide-react';
import WorkflowCanvas from '../components/canvas/WorkflowCanvas';
import NodeSidebar from '../components/sidebar/NodeSidebar';
import NodeConfigModal from '../components/modal/NodeConfigModal';
import { EdgeContextActions } from '../components/canvas/EdgeContextActions';
import { NodeHoverActions } from '../components/canvas/NodeHoverActions';
import ToolbarNavigationModal from '../components/modal/ToolbarNavigationModal';
import ExecutionLogsPanel from '../components/panel/ExecutionLogsPanel';
import ChatPanel from '../components/panel/ChatPanel';
import { ToastContainer } from '../components/ui/Toast';
import type { ToastType } from '../components/ui/Toast';
import { WorkflowToolbar } from '../components/workflow/WorkflowToolbar';
import { ExecutionStatusPanel } from '../components/workflow/ExecutionStatusPanel';
import { DataFlowInspector } from '../components/workflow/DataFlowInspector';
import { TemplateGallery } from '../components/templates/TemplateGallery';
import { KeyboardShortcutsModal } from '../components/help/KeyboardShortcutsModal';
import { CommandPalette } from '../components/command/CommandPalette';
import { useAutoSave } from '../hooks/useAutoSave';
import { useCollaboration } from '../hooks/useCollaboration';
import { PresenceAvatars } from '../components/workflow/PresenceAvatars';
import { useExecution } from '../contexts/ExecutionContext';
import { workflowApi } from '../lib/api';
import { generateWorkflow } from '../lib/zai';
import { NODE_TYPES_METADATA } from '../types/node';
import { exportWorkflow, copyToClipboard } from '../lib/workflowExporter';
import type { WorkflowTemplate } from '../lib/workflowTemplates';
import type { ExecutionLog } from '../components/panel/ExecutionLogsPanel';
import type { CustomNode, NodeType, BaseNodeConfig } from '../types/node';
import type { Edge, NodeChange, EdgeChange, Connection } from '@xyflow/react';
import { applyNodeChanges, applyEdgeChanges, addEdge, getConnectedEdges, ReactFlowProvider, useReactFlow } from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';

function WorkflowEditorContent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { dispatch: executionDispatch, state: executionState } = useExecution();
  const reactFlowInstance = useReactFlow();

  // ── Collaboration identity (read once from localStorage) ──────────────────
  const [collabUserId] = useState<string>(() => {
    try { const u = JSON.parse(localStorage.getItem('auth_user') || '{}'); return String(u.id || u.userId || 'anon'); } catch { return 'anon'; }
  });
  const [collabUserName] = useState<string>(() => {
    try { const u = JSON.parse(localStorage.getItem('auth_user') || '{}'); return (`${u.firstName || ''} ${u.lastName || ''}`).trim() || u.email || 'Membre'; } catch { return 'Membre'; }
  });
  const remoteChangeIds = useRef<Set<string>>(new Set());
  const isInitialLoad = useRef(true);
  const nodesRef = useRef<CustomNode[]>([]);
  const lastPositionBroadcast = useRef<Record<string, number>>({});
  const lastCursorBroadcast = useRef(0);

  const [nodes, setNodes] = useState<CustomNode[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<CustomNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [workflow, setWorkflow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);
  const [showLogsPanel, setShowLogsPanel] = useState(false);
  const [showNavModal, setShowNavModal] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [showExecutionPanel, setShowExecutionPanel] = useState(false);
  const [showDataInspector, setShowDataInspector] = useState(false);
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [toasts, setToasts] = useState<Array<{ id: string; type: ToastType; message: string; duration?: number }>>([]);

  // Toast helper functions
  const showToast = useCallback((type: ToastType, message: string, duration?: number) => {
    const id = uuidv4();
    setToasts(prev => [...prev, { id, type, message, duration }]);
  }, []);

  const closeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);
  const [editedTitle, setEditedTitle] = useState('');
  const [panelsSplit, setPanelsSplit] = useState(50);
  const [isResizing, setIsResizing] = useState(false);

  // ── Bottom bar (resizable, splittable) ───────────────────────────────────
  type BottomTab = 'chat' | 'logs' | 'split';
  const [bottomTab, setBottomTab]         = useState<BottomTab>('logs');
  const [bottomOpen, setBottomOpen]       = useState(false);
  const [bottomHeight, setBottomHeight]   = useState(260);
  const [isBottomResizing, setIsBottomResizing] = useState(false);
  const bottomResizeStartY = useRef<number>(0);
  const bottomResizeStartH = useRef<number>(260);
  const BOTTOM_MIN = 80;
  const BOTTOM_MAX = () => Math.floor(window.innerHeight * 0.7);
  // Split layout
  const [splitDir, setSplitDir]         = useState<'h' | 'v'>('h');
  const [splitVRatio, setSplitVRatio]   = useState(50);
  const [isSplitVResizing, setIsSplitVResizing] = useState(false);
  const splitVResizeStartY = useRef<number>(0);
  const splitVResizeStartR = useRef<number>(50);
  const [showSplitMenu, setShowSplitMenu] = useState(false);
  const splitMenuRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<CustomNode | null>(null);
  const [disabledNodes, setDisabledNodes] = useState<Set<string>>(new Set());
  // Use refs (not state) for timer IDs — state causes stale-closure race conditions
  // where handleActionsMouseEnter sees an old null instead of the active timer.
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Convert execution state to executionResults for NodeConfigModal
  const executionResults = useMemo(() => {
    const results: Record<string, any> = {};
    executionState.nodeExecutions.forEach((execution, nodeId) => {
      if (execution.status === 'success' && execution.outputData) {
        results[nodeId] = execution.outputData;
      }
    });
    return results;
  }, [executionState.nodeExecutions]);

  // ── Realtime collaboration — movements only (cursor + node drag) ─────────
  const collab = useCollaboration({
    instanceId: 'main',
    memberId: collabUserId,
    memberName: collabUserName,
    workflowId: id || undefined,
    // Only apply remote position changes — do NOT apply add/remove/config
    onNodeUpdate: (node) => {
      // Guard: ignore if this change originated locally
      if (remoteChangeIds.current.has(node.id)) return;
      setNodes((prev) => prev.map((n) =>
        n.id === node.id ? { ...n, position: node.position } : n
      ));
    },
  });

  // Auto-save hook
  const { lastSaved, hasUnsavedChanges, save: autoSave } = useAutoSave(
    id || '',
    nodes as any,
    edges,
    async (workflowId, data) => {
      if (id && id !== 'new') {
        await workflowApi.update(workflowId, data as any);
      }
    }
  );

  useEffect(() => {
    if (id && id !== 'new') {
      loadWorkflow(id);
    } else {
      setLoading(false);
      isInitialLoad.current = false;
    }
  }, [id]);

  // Listen for openCommandPalette event dispatched by node output stubs
  useEffect(() => {
    const handler = () => setShowCommandPalette(true);
    window.addEventListener('openCommandPalette', handler);
    return () => window.removeEventListener('openCommandPalette', handler);
  }, []);

  // Auto-open chat panel if there's a textual chat trigger
  useEffect(() => {
    const hasTextualChatTrigger = nodes.some(
      (node) =>
        node.data.type === 'chatTrigger' &&
        node.data.config?.platform === 'textual'
    );

    if (hasTextualChatTrigger && !showChatPanel) {
      setShowChatPanel(true);
    }
  }, [nodes]);

  // Keep nodesRef in sync for handleNodesChange position broadcast
  useEffect(() => { nodesRef.current = nodes; }, [nodes]);

  async function loadWorkflow(workflowId: string) {
    try {
      setLoading(true);
      const data = await workflowApi.getById(workflowId);
      setWorkflow(data);
      setNodes(data.nodes || []);
      setEdges(data.edges || []);
      isInitialLoad.current = false;
    } catch (err: any) {
      alert(err.message || 'Failed to load workflow');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!id || id === 'new') {
      showToast('warning', t('editor.needWorkflow'));
      return;
    }

    try {
      setSaving(true);
      // Use the auto-save function to ensure state updates
      await autoSave();
      showToast('success', t('editor.saveSuccess'));
    } catch (err: any) {
      showToast('error', t('editor.saveFailed', { msg: err.message || t('editor.unknownError') }));
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handleExecute() {
    if (!id || id === 'new') {
      showToast('warning', t('editor.needSave'));
      return;
    }

    try {
      setExecuting(true);
      setShowLogsPanel(true);
      setShowExecutionPanel(true);

      // Start execution tracking
      executionDispatch({
        type: 'START_EXECUTION',
        executionId: uuidv4(),
        nodeIds: nodes.map(n => n.id),
      });

      // Add execution start log
      const startLog: ExecutionLog = {
        id: uuidv4(),
        nodeId: 'workflow',
        nodeName: 'Workflow',
        nodeType: 'workflow',
        status: 'running',
        message: t('editor.executionStarting'),
        timestamp: new Date(),
      };
      setExecutionLogs([startLog]);

      const result = await workflowApi.execute(id);

      // Parse real execution results from backend
      const nodeLogs: ExecutionLog[] = [];
      
      if (result.results) {
        // results is an array of [nodeId, NodeExecutionResult] tuples
        for (const [nodeId, nodeResult] of result.results) {
          const node = nodes.find(n => n.id === nodeId);
          if (!node) continue;

          // Mark node as running first
          executionDispatch({ type: 'START_NODE', nodeId: node.id });

          // Extract HTTP details if available
          let httpDetails = undefined;
          if (nodeResult._http) {
            httpDetails = {
              url: nodeResult._http.url,
              method: nodeResult._http.method,
              status: nodeResult._http.status,
              statusText: nodeResult._http.statusText,
              headers: nodeResult._http.headers,
              responseData: nodeResult.data,
            };
          }

          // Create log entry
          const log: ExecutionLog = {
            id: uuidv4(),
            nodeId: node.id,
            nodeName: node.data.label,
            nodeType: node.data.type,
            status: nodeResult.success ? 'success' : 'error',
            message: nodeResult.success 
              ? t('editor.nodeSuccess', { name: node.data.label })
              : t('editor.errorMsg', { error: nodeResult.error || t('editor.execFailed') }),

            timestamp: new Date(),
            duration: nodeResult._http?.duration,
            details: nodeResult.data,
            httpDetails,
          };

          nodeLogs.push(log);

          // Mark node as complete
          executionDispatch({
            type: 'COMPLETE_NODE',
            nodeId: node.id,
            outputData: nodeResult.data,
            duration: nodeResult._http?.duration,
          });

          // Add log incrementally for better UX
          setExecutionLogs((prev) => [...prev, log]);
          
          // Small delay to show progression
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Complete execution
      executionDispatch({ type: 'COMPLETE_EXECUTION', success: true });

      const successLog: ExecutionLog = {
        id: uuidv4(),
        nodeId: 'workflow',
        nodeName: 'Workflow',
        nodeType: 'workflow',
        status: 'success',
        message: t('editor.executionSuccess', { ms: result.executionTime }),
        timestamp: new Date(),
        duration: result.executionTime,
      };
      setExecutionLogs((prev) => [...prev, successLog]);
    } catch (err: any) {
      executionDispatch({ type: 'COMPLETE_EXECUTION', success: false });

      const errorLog: ExecutionLog = {
        id: uuidv4(),
        nodeId: 'workflow',
        nodeName: 'Workflow',
        nodeType: 'workflow',
        status: 'error',
        message: t('editor.executionFailed', { msg: err.message }),
        timestamp: new Date(),
        details: err.response?.data?.details || err,
      };
      setExecutionLogs((prev) => [...prev, errorLog]);
    } finally {
      setExecuting(false);
    }
  }

  const handleClearLogs = useCallback(() => {
    setExecutionLogs([]);
  }, []);

  const handleCloseLogsPanel = useCallback(() => {
    setShowLogsPanel(false);
  }, []);

  const handleCloseExecutionPanel = useCallback(() => {
    setShowExecutionPanel(false);
  }, []);

  const handleCloseDataInspector = useCallback(() => {
    setShowDataInspector(false);
  }, []);

  const handleSendMessage = async (message: string): Promise<string> => {
    // Check for /logik command
    if (message.trim().startsWith('/logik ')) {
      const prompt = message.trim().substring(7).trim();
      
      if (!prompt) {
        return t('editor.logikNoDesc');
      }

      try {
        // Generate workflow using Z.ai
        const result = await generateWorkflow(prompt, NODE_TYPES_METADATA);
        
        // Create nodes with proper positioning
        const createdNodes: CustomNode[] = [];
        let currentX = 100;
        const y = 200;
        
        for (let i = 0; i < result.nodes.length; i++) {
          const nodeSpec = result.nodes[i];
          const nodeId = uuidv4();
          
          const newNode: CustomNode = {
            id: nodeId,
            type: 'custom',
            position: nodeSpec.position || { x: currentX, y },
            data: {
              id: uuidv4(),
              type: nodeSpec.type as NodeType,
              label: nodeSpec.label,
              config: nodeSpec.config,
            },
          };
          
          createdNodes.push(newNode);
          currentX += 250; // Space nodes horizontally
        }
        
        // Add nodes to canvas
        setNodes((prev) => [...prev, ...createdNodes]);
        
        // Create edges
        const newEdges = result.edges.map((edge) => ({
          id: uuidv4(),
          source: createdNodes[edge.source].id,
          target: createdNodes[edge.target].id,
        }));
        
        setEdges((prev) => [...prev, ...newEdges]);
        
        // Return explanation with Markdown formatting
        return `## ${t('editor.workflowCreated')}\n\n${result.explanation}\n\n${t('editor.workflowStats', { nodes: result.nodes.length, edges: result.edges.length })}`;
      } catch (error: any) {
        console.error('Error generating workflow:', error);
        return `## Erreur\n\n${t('editor.workflowGenerateFailed')}: ${error.message}`;
      }
    }
    
    // Normal chat message - send to workflow
    if (!id || id === 'new') {
      throw new Error(t('editor.needSave'));
    }

    try {
      const response = await fetch(`/api/chat/${id}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          userId: 'test-user',
          userName: 'Test User',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      const data = await response.json();
      return data.data?.response || 'Workflow executed successfully';
    } catch (error: any) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  async function handleToggleActive() {
    if (!id || id === 'new') {
      showToast('warning', t('editor.needSave'));
      return;
    }

    try {
      const updated = await workflowApi.update(id, {
        isActive: !workflow?.isActive,
      });
      setWorkflow(updated);
    } catch (err: any) {
      showToast('error', t('editor.updateFailed', { msg: err.message || 'Erreur inconnue' }));
    }
  }

  const handleAddNode = useCallback((type: NodeType, positionOrConfig?: { x: number; y: number } | BaseNodeConfig, preConfig?: BaseNodeConfig) => {
    // Check if we're inserting between nodes
    const insertContext = sessionStorage.getItem('insertBetween');
    let shouldInsertBetween = false;
    let insertData: any = null;
    
    if (insertContext) {
      try {
        insertData = JSON.parse(insertContext);
        shouldInsertBetween = true;
        sessionStorage.removeItem('insertBetween');
      } catch (e) {
        console.error('Failed to parse insert context:', e);
      }
    }

    // Check if we're connecting from an existing node's output stub
    const connectFromContext = sessionStorage.getItem('connectFrom');
    let connectFromData: { sourceNodeId: string; sourceHandle: string | null; position: { x: number; y: number } } | null = null;
    if (connectFromContext) {
      try {
        connectFromData = JSON.parse(connectFromContext);
        sessionStorage.removeItem('connectFrom');
      } catch (e) {
        console.error('Failed to parse connectFrom context:', e);
      }
    }

    // Determine if second param is position or config
    let position: { x: number; y: number } | undefined = undefined;
    let config: BaseNodeConfig | undefined = undefined;
    
    if (positionOrConfig && 'x' in positionOrConfig && 'y' in positionOrConfig) {
      position = positionOrConfig as { x: number; y: number };
      config = preConfig;
    } else {
      position = undefined;
      config = positionOrConfig as BaseNodeConfig | undefined;
    }
    
    const defaultConfig = getDefaultConfig(type);
    const finalConfig = config ? { ...defaultConfig, ...config } : defaultConfig;
    
    // If no position provided, place at center of current viewport
    if (!position) {
      if (shouldInsertBetween && insertData?.position) {
        position = insertData.position;
      } else if (connectFromData?.position) {
        position = connectFromData.position;
      } else {
        const canvasElement = document.querySelector('.react-flow__pane');
        if (canvasElement) {
          const rect = canvasElement.getBoundingClientRect();
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          position = reactFlowInstance.screenToFlowPosition({
            x: centerX,
            y: centerY,
          });
        } else {
          // Fallback to default position if canvas not found
          position = { x: 250, y: 200 };
        }
      }
    }
    
    // Check if there's already a node too close to this position
    // Add spacing if collision detected
    const minDistance = 100; // Minimum distance between nodes
    const offsetAmount = 120; // Offset to apply when collision detected
    let finalPosition = { ...position };
    let attempts = 0;
    const maxAttempts = 10;
    
    // Skip collision detection if inserting between
    if (!shouldInsertBetween) {
      while (attempts < maxAttempts) {
        const hasCollision = nodes.some(existingNode => {
          const dx = existingNode.position.x - finalPosition.x;
          const dy = existingNode.position.y - finalPosition.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          return distance < minDistance;
        });
        
        if (!hasCollision) {
          break;
        }
        
        // Apply offset in a spiral pattern
        const angle = (attempts * Math.PI * 2) / 8; // 8 directions
        finalPosition = {
          x: position.x + Math.cos(angle) * offsetAmount,
          y: position.y + Math.sin(angle) * offsetAmount,
        };
        
        attempts++;
      }
    }
    
    const TRIGGER_TYPES: NodeType[] = [
      'schedule', 'webhook', 'onSuccessFailure', 'formTrigger', 'chatTrigger',
      'clickTrigger', 'emailTrigger', 'httpPollTrigger', 'cronTrigger',
    ];
    const isAddingTrigger = TRIGGER_TYPES.includes(type);
    const hasTrigger = nodes.some((n) => TRIGGER_TYPES.includes(n.data.type));

    const newNodeId = uuidv4();
    const newNode: CustomNode = {
      id: newNodeId,
      type: 'custom',
      position: finalPosition,
      data: {
        id: uuidv4(),
        type,
        label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
        config: finalConfig,
      },
    };

    // Auto-add a clickTrigger if no trigger exists and the placed node is not a trigger
    if (!isAddingTrigger && !hasTrigger && !shouldInsertBetween) {
      const triggerId = uuidv4();
      const triggerNode: CustomNode = {
        id: triggerId,
        type: 'custom',
        position: { x: finalPosition.x - 220, y: finalPosition.y },
        data: {
          id: uuidv4(),
          type: 'clickTrigger',
          label: 'Click Trigger',
          config: getDefaultConfig('clickTrigger'),
        },
      };
      setNodes((prev) => [...prev, triggerNode, newNode]);
      setEdges((prev) => [
        ...prev,
        { id: uuidv4(), source: triggerId, target: newNodeId },
      ]);
    } else {
      setNodes((prev) => [...prev, newNode]);
    }

    // Loop node: auto-create a "Replace Me" placeholder node + wired edges
    if (type === 'loop' && !shouldInsertBetween) {
      const replaceMeId = uuidv4();
      const replaceMeNode: CustomNode = {
        id: replaceMeId,
        type: 'custom',
        position: { x: finalPosition.x + 220, y: finalPosition.y + 80 },
        data: {
          id: uuidv4(),
          type: 'editFields' as any,
          label: 'Replace Me',
          config: {},
        },
      };
      setNodes((prev) => [...prev, replaceMeNode]);
      setEdges((prev) => [
        ...prev,
        // loop output → Replace Me input
        { id: uuidv4(), source: newNodeId, sourceHandle: 'loop', target: replaceMeId },
        // Replace Me output → loop input
        { id: uuidv4(), source: replaceMeId, target: newNodeId },
      ]);
    }


    // Auto-wire the new node if triggered from an output stub
    if (connectFromData) {
      setEdges((prev) => [
        ...prev,
        {
          id: uuidv4(),
          source: connectFromData.sourceNodeId,
          ...(connectFromData.sourceHandle ? { sourceHandle: connectFromData.sourceHandle } : {}),
          target: newNodeId,
        },
      ]);
    }

    if (shouldInsertBetween && insertData) {
      setEdges((eds) => {
        // Remove old edges
        const filteredEdges = eds.filter(
          (edge) => !insertData.edgeIds.includes(edge.id)
        );

        // Create new edges: source -> new node -> targets
        const newEdges: Edge[] = [
          {
            id: uuidv4(),
            source: insertData.sourceNodeId,
            target: newNodeId,
          },
        ];

        insertData.targetNodeIds.forEach((targetId: string) => {
          newEdges.push({
            id: uuidv4(),
            source: newNodeId,
            target: targetId,
          });
        });

        return [...filteredEdges, ...newEdges];
      });
    }
  }, [reactFlowInstance, nodes]);

  const handleApplyTemplate = useCallback((template: WorkflowTemplate) => {
    setNodes(template.nodes as CustomNode[]);
    setEdges(template.edges);
  }, []);

  const handleExport = useCallback(() => {
    const metadata = {
      name: workflow?.name || 'My Workflow',
      description: 'Exported from LogicAI',
      author: 'LogicAI',
      tags: ['workflow'],
    };
    exportWorkflow(nodes, edges, metadata);
  }, [nodes, edges, workflow]);

  const handleImport = useCallback(async (data: { nodes: CustomNode[]; edges: Edge[] }) => {
    setNodes(data.nodes);
    setEdges(data.edges);
  }, []);

  const handleCopy = useCallback(async () => {
    await copyToClipboard(nodes, edges);
  }, [nodes, edges]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      const data = JSON.parse(text);
      setNodes((data.nodes || []) as CustomNode[]);
      setEdges(data.edges || []);
    } catch (err) {
      console.error('Failed to paste from clipboard:', err);
    }
  }, []);

  const handleClear = useCallback(() => {
    if (confirm(t('editor.clearConfirm'))) {
      setNodes([]);
      setEdges([]);
    }
  }, []);

  const handleNodeUpdate = useCallback((nodeId: string, config: BaseNodeConfig) => {
    setNodes((prev) =>
      prev.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, config } }
          : node
      )
    );
  }, []);

  const handleNodesChange = useCallback((changes: NodeChange<CustomNode>[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
    // Broadcast position changes (drag) with 50 ms throttle
    if (!isInitialLoad.current && collab.isConnected) {
      const now = Date.now();
      changes.forEach((change) => {
        if (change.type !== 'position' || !change.position) return;
        if (remoteChangeIds.current.has(change.id)) return;
        const last = lastPositionBroadcast.current[change.id] || 0;
        if (now - last >= 50) {
          lastPositionBroadcast.current[change.id] = now;
          const node = nodesRef.current.find((n) => n.id === change.id);
          if (node) collab.broadcastNodeUpdate({ ...node, position: change.position as { x: number; y: number } });
        }
      });
    }
  }, [collab.isConnected, collab.broadcastNodeUpdate]);

  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const handleConnect = useCallback((connection: Connection) => {
    // Empêcher qu'un nœud se connecte à lui-même
    if (connection.source === connection.target) {
      showToast('warning', t('editor.selfConnect'));
      return;
    }

    const targetNode = nodes.find(n => n.id === connection.target);

    if (targetNode) {
      const nodeType = targetNode.data.type;
      const triggerTypes: NodeType[] = [
        'schedule',
        'webhook',
        'onSuccessFailure',
        'formTrigger',
        'chatTrigger',
        'clickTrigger',
        'emailTrigger',
        'httpPollTrigger',
        'cronTrigger',
      ];

      if (triggerTypes.includes(nodeType)) {
        showToast('warning', t('editor.triggerNoIncoming'));
        return;
      }
    }

    setEdges((eds) => addEdge({ ...connection, id: uuidv4() }, eds));
  }, [nodes]);

  const handleNodeClick = useCallback((_: any, node: CustomNode) => {
    setSelectedNode(node as CustomNode);
    setSelectedEdge(null);
    setShowDataInspector(false);
  }, []);

  const handleNodeDoubleClick = useCallback((_: any, node: CustomNode) => {
    setSelectedNode(node);
    setSelectedEdge(null);
    setIsConfigModalOpen(true);
  }, []);

  const handleEdgeClick = useCallback((_: any, edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
    setShowDataInspector(false);
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
    setShowDataInspector(false);
  }, []);

  const handleDeleteSelected = useCallback(() => {
    if (selectedNode) {
      const connectedEdges = getConnectedEdges([selectedNode], edges);
      setEdges((eds) => eds.filter((edge) => !connectedEdges.some((ce) => ce.id === edge.id)));
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
      setSelectedNode(null);
    } else if (selectedEdge) {
      setEdges((eds) => eds.filter((edge) => edge.id !== selectedEdge.id));
      setSelectedEdge(null);
    }
  }, [selectedNode, selectedEdge, edges]);

  const handleDeleteConnections = useCallback((nodeId: string) => {
    const connectedEdges = edges.filter(
      (edge) => edge.source === nodeId || edge.target === nodeId
    );
    setEdges((eds) => eds.filter((edge) => !connectedEdges.some((ce) => ce.id === edge.id)));
  }, [edges]);

  const handleDeleteEdge = useCallback((edgeId: string) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
    setSelectedEdge(null);
  }, []);

  const handleAddNodeBetweenEdge = useCallback((sourceId: string, targetId: string, edgeId: string) => {
    // Calculate position between source and target
    const sourceNode = nodes.find((n) => n.id === sourceId);
    const targetNode = nodes.find((n) => n.id === targetId);
    
    if (!sourceNode || !targetNode) return;

    const newPosition = {
      x: (sourceNode.position.x + targetNode.position.x) / 2,
      y: (sourceNode.position.y + targetNode.position.y) / 2,
    };

    // Store context for insertion
    sessionStorage.setItem('insertBetween', JSON.stringify({
      sourceNodeId: sourceId,
      targetNodeIds: [targetId],
      position: newPosition,
      edgeIds: [edgeId],
    }));

    setShowCommandPalette(true);
  }, [nodes]);

  const handleNodeMouseEnter = useCallback((_: any, node: CustomNode) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    if (hideTimeoutRef.current)  { clearTimeout(hideTimeoutRef.current); hideTimeoutRef.current = null; }
    hoverTimeoutRef.current = setTimeout(() => { setHoveredNode(node); }, 200);
  }, []);

  const handleNodeMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) { clearTimeout(hoverTimeoutRef.current); hoverTimeoutRef.current = null; }
    hideTimeoutRef.current = setTimeout(() => { setHoveredNode(null); }, 350);
  }, []);

  const handleActionsMouseEnter = useCallback(() => {
    // Refs always hold the live timer ID — no stale-closure problem
    if (hideTimeoutRef.current) { clearTimeout(hideTimeoutRef.current); hideTimeoutRef.current = null; }
  }, []);

  const handleActionsMouseLeave = useCallback(() => {
    // Small delay so a quick move back onto the node re-cancels it
    hideTimeoutRef.current = setTimeout(() => { setHoveredNode(null); }, 120);
  }, []);

  const handleStartFromNode = useCallback((nodeId: string) => {
    // TODO: Implement execution starting from specific node
    console.log('Start execution from node:', nodeId);
    handleExecute();
  }, []);

  const handleToggleNodeDisabled = useCallback((nodeId: string) => {
    const isNowDisabled = !disabledNodes.has(nodeId);
    setDisabledNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
    // Persist disabled state into node.data so CustomNode can render it visually
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, disabled: isNowDisabled } } : n
      )
    );
  }, [disabledNodes, setNodes]);

  const handleDeleteNodeWithReconnect = useCallback((nodeId: string) => {
    // Find incoming and outgoing edges
    const incomingEdges = edges.filter((edge) => edge.target === nodeId);
    const outgoingEdges = edges.filter((edge) => edge.source === nodeId);

    // Create new edges connecting inputs to outputs
    const newEdges: Edge[] = [];
    incomingEdges.forEach((inEdge) => {
      outgoingEdges.forEach((outEdge) => {
        newEdges.push({
          id: uuidv4(),
          source: inEdge.source,
          target: outEdge.target,
          sourceHandle: inEdge.sourceHandle,
          targetHandle: outEdge.targetHandle,
        });
      });
    });

    // Remove the node and its edges, add new reconnecting edges
    setEdges((eds) => {
      const filtered = eds.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      );
      return [...filtered, ...newEdges];
    });
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setHoveredNode(null);
  }, [edges]);

  const handleOpenNodeOptions = useCallback((nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      setSelectedNode(node);
      setIsConfigModalOpen(true);
      setHoveredNode(null);
    }
  }, [nodes]);

  const handleToggleMiniMap = useCallback(() => {
    setShowMiniMap(prev => !prev);
  }, []);

  // Broadcast cursor position to collaborators (throttled at 50 ms)
  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!collab.isConnected) return;
    const now = Date.now();
    if (now - lastCursorBroadcast.current < 50) return;
    lastCursorBroadcast.current = now;
    const pos = reactFlowInstance.screenToFlowPosition({ x: e.clientX, y: e.clientY });
    collab.sendCursorPosition(pos.x, pos.y);
  }, [collab.isConnected, collab.sendCursorPosition, reactFlowInstance]);

  const handleTitleDoubleClick = useCallback(() => {
    setEditedTitle(workflow?.name || 'New Workflow');
    setIsEditingTitle(true);
  }, [workflow?.name]);

  const handleTitleSave = useCallback(async () => {
    if (!editedTitle.trim()) {
      setIsEditingTitle(false);
      return;
    }

    const newTitle = editedTitle.trim();

    if (workflow) {
      setWorkflow({ ...workflow, name: newTitle });
    }

    setIsEditingTitle(false);

    if (id && id !== 'new') {
      try {
        await workflowApi.update(id, { name: newTitle });
        showToast('success', t('editor.nameUpdated'));
      } catch (err: any) {
        console.error('Failed to update workflow name:', err);
        showToast('error', t('editor.nameSaveFailed', { msg: err.message || 'Erreur inconnue' }));
      }
    }
  }, [editedTitle, workflow, id]);

  const handleTitleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
      setEditedTitle(workflow?.name || 'New Workflow');
    }
  }, [handleTitleSave, workflow?.name]);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;

    const container = document.querySelector('[data-panels-container]') as HTMLElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;

    setPanelsSplit(Math.max(20, Math.min(80, percentage)));
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    setIsBottomResizing(false);
    setIsSplitVResizing(false);
  }, [setIsBottomResizing]);

  // ── Bottom bar vertical resize ────────────────────────────────────────────
  const handleBottomResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    bottomResizeStartY.current = e.clientY;
    bottomResizeStartH.current = bottomHeight;
    setIsBottomResizing(true);
  }, [bottomHeight]);

  useEffect(() => {
    if (!isBottomResizing) return;
    const onMove = (e: MouseEvent) => {
      const delta = bottomResizeStartY.current - e.clientY;
      const next = Math.max(BOTTOM_MIN, Math.min(BOTTOM_MAX(), bottomResizeStartH.current + delta));
      setBottomHeight(next);
    };
    const onUp = () => setIsBottomResizing(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [isBottomResizing]);

  // ── Split-V (top/bottom) drag resize ─────────────────────────────────────
  const handleSplitVResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    splitVResizeStartY.current = e.clientY;
    splitVResizeStartR.current = splitVRatio;
    setIsSplitVResizing(true);
  }, [splitVRatio]);

  useEffect(() => {
    if (!isSplitVResizing) return;
    const onMove = (e: MouseEvent) => {
      const contentH = bottomHeight - 36;
      const delta = e.clientY - splitVResizeStartY.current;
      const pct = contentH > 0 ? (delta / contentH) * 100 : 0;
      setSplitVRatio(r => Math.max(20, Math.min(80, splitVResizeStartR.current + pct)));
    };
    const onUp = () => setIsSplitVResizing(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [isSplitVResizing, bottomHeight]);

  // Close split menu on outside click
  useEffect(() => {
    if (!showSplitMenu) return;
    const handle = (e: MouseEvent) => {
      if (splitMenuRef.current && !splitMenuRef.current.contains(e.target as Node)) {
        setShowSplitMenu(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [showSplitMenu]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K - Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
      // ? - Shortcuts modal
      if (e.key === '?' && !e.target) {
        e.preventDefault();
        setShowShortcutsModal(prev => !prev);
      }
      // Ctrl/Cmd + S - Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      // Ctrl/Cmd + Enter - Execute
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleExecute();
      }
      // Delete/Backspace - Delete selected
      if ((e.key === 'Delete' || e.key === 'Backspace') && !(
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      )) {
        handleDeleteSelected();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, handleExecute, handleDeleteSelected]);

  function getDefaultConfig(type: NodeType): BaseNodeConfig {
    switch (type) {
      case 'webhook':
        return { method: 'POST', path: '/webhook' };
      case 'httpRequest':
        return { url: '', method: 'POST', headers: {}, body: {} };
      case 'setVariable':
        return { key: '', value: '', valueType: 'string' };
      case 'if':
        return { condition: '' };
      case 'switch':
        return { mode: 'expression', expression: '', rules: '', fallbackOutput: 0 };
      case 'merge':
        return { mode: 'append', clashHandling: 'preferInput1' };
      case 'code':
        return { language: 'javascript', code: '', mode: 'runOnceForEachItem' };
      case 'chatTrigger':
        return { platform: 'textual' };
      case 'clickTrigger':
        return { baseUrl: 'http://localhost:5173' };
      case 'emailTrigger':
        return { host: '', port: 993, username: '', password: '', folder: 'INBOX' };
      case 'httpPollTrigger':
        return { url: '', interval: 60000, method: 'GET' };
      case 'cronTrigger':
        return { cronExpression: '* * * * *' };
      case 'mySQL':
        return { operation: 'executeQuery', query: '', host: 'localhost', port: 3306, database: '', user: '', password: '' };
      case 'mongoDB':
        return { operation: 'find', collection: '', query: '{}', connectionString: 'mongodb://localhost:27017/mydb' };
      case 'redis':
        return { operation: 'get', key: '', value: '', host: 'localhost', port: 6379 };
      case 'supabase':
        return { operation: 'select', table: '', query: '{}', supabaseUrl: '', supabaseKey: '' };
      case 'humanInTheLoop':
        return { timeout: 3600000, notificationType: 'none' };
      case 'smartDataCleaner':
        return { cleaningRules: {} };
      case 'aiCostGuardian':
        return { maxTokens: 4000, targetField: 'prompt', strategy: 'truncate' };
      case 'noCodeBrowserAutomator':
        return { actions: [] };
      case 'aggregatorMultiSearch':
        return { query: '', engines: ['google', 'duckduckgo'], maxResults: 10, sortByRelevance: true, deduplicate: true };
      case 'liveCanvasDebugger':
        return { operations: [] };
      case 'socialMockupPreview':
        return { platform: 'twitter', content: '', mediaUrls: [], metadata: {} };
      case 'rateLimiterBypass':
        return { maxRetries: 5, baseDelay: 1000, maxDelay: 60000 };
      case 'ghost':
        return { operations: [] };
      case 'appleEcosystem':
        return { service: 'imessage', action: 'send', parameters: { to: '', message: '' } };
      case 'androidEcosystem':
        return { service: 'messages', action: 'sendSMS', deviceId: '', parameters: { to: '', message: '' } };
      case 'gitHub':
        return { resource: 'repository', action: 'get', parameters: { accessToken: '', owner: '', repo: '' } };
      case 'figma':
        return { resource: 'file', action: 'get', parameters: { fileKey: '', accessToken: '' } };
      case 'windowsControl':
        return { service: 'powershell', action: 'execute', whitelistEnabled: true, commandTimeout: 30000, parameters: { command: '' } };
      case 'streaming':
        return { platform: 'twitch', resource: 'stream', action: 'getInfo', parameters: { accessToken: '', userId: '' } };
      case 'infrastructure':
        return { service: 'ssh', action: 'execute', parameters: { host: '', port: 22, username: '', privateKey: '', password: '', command: '' } };
      default:
        return {};
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background-dark">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brand-blue animate-spin mx-auto mb-4" />
          <p className="text-gray-400">{t('editor.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background-dark">
      {/* Enhanced Toolbar */}
      <WorkflowToolbar
        nodes={nodes}
        edges={edges}
        onSave={handleSave}
        onExecute={handleExecute}
        onClear={handleClear}
        onImport={handleImport as any}
        isExecuting={executing}
        isSaving={saving}
        lastSaved={lastSaved}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      {/* Navigation Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-bg-card">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-800 rounded transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </button>
          <div>
            {isEditingTitle ? (
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={handleTitleKeyDown}
                className="text-lg font-semibold text-white bg-white/10 border border-white/10 rounded outline-none focus:ring-0"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <h1
                className="text-lg font-semibold text-white cursor-pointer hover:text-brand-blue transition-colors select-none"
                onDoubleClick={handleTitleDoubleClick}
              >
              {workflow?.name || t('editor.newWorkflow')}
              </h1>
            )}
            <p className="text-xs text-gray-500">
              {workflow?.id || t('editor.notSaved')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTemplateGallery(true)}
            className="p-2 hover:bg-gray-800 rounded transition-colors"
            title={t('editor.titleTemplates')}
          >
            <BookTemplate className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={() => setShowCommandPalette(true)}
            className="p-2 hover:bg-gray-800 rounded transition-colors"
            title={t('editor.titleCommandPalette')}
          >
            <Search className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={() => setShowShortcutsModal(true)}
            className="p-2 hover:bg-gray-800 rounded transition-colors"
            title={t('editor.titleShortcuts')}
          >
            <Keyboard className="w-5 h-5 text-gray-400" />
          </button>
          {/* Collaborators online */}
          <PresenceAvatars members={collab.members} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Canvas + Sidebar */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Canvas */}
          <div className="flex-1" onMouseMove={handleCanvasMouseMove}>
            <WorkflowCanvas
              nodes={nodes}
              edges={edges}
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
              onConnect={handleConnect}
              onNodeClick={handleNodeClick}
              onNodeDoubleClick={handleNodeDoubleClick}
              onNodeMouseEnter={handleNodeMouseEnter}
              onNodeMouseLeave={handleNodeMouseLeave}
              onEdgeClick={handleEdgeClick}
              onPaneClick={handlePaneClick}
              showMiniMap={showMiniMap}
              onToggleMiniMap={handleToggleMiniMap}
              showChatPanel={showChatPanel}
              onToggleChatPanel={() => setShowChatPanel(!showChatPanel)}
              showExecutionPanel={showExecutionPanel}
              onToggleExecutionPanel={() => setShowExecutionPanel(!showExecutionPanel)}
              remoteCursors={collab.remoteCursors}
            />
          </div>

          {/* Edge Context Actions */}
          {selectedEdge && (
            <EdgeContextActions
              edge={selectedEdge}
              nodes={nodes}
              onDeleteEdge={handleDeleteEdge}
              onAddNodeBetween={handleAddNodeBetweenEdge}
            />
          )}

          {/* Node Hover Actions */}
          {hoveredNode && (
            <NodeHoverActions
              node={hoveredNode}
              edges={edges}
              onStartFrom={handleStartFromNode}
              onToggleDisabled={handleToggleNodeDisabled}
              onDeleteWithReconnect={handleDeleteNodeWithReconnect}
              onOpenOptions={handleOpenNodeOptions}
              isDisabled={disabledNodes.has(hoveredNode.id)}
              onMouseEnter={handleActionsMouseEnter}
              onMouseLeave={handleActionsMouseLeave}
            />
          )}

          {/* Sidebar */}
          <NodeSidebar
            selectedNode={null}
            onNodeUpdate={handleNodeUpdate}
            onNodeAdd={handleAddNode}
            onNodeDeselect={() => {}}
          />
        </div>

        {/* ── Bottom Bar (always rendered, collapsed = just header) ─────── */}
        <div
          className="flex flex-col border-t border-white/10 bg-black relative select-none"
          style={{ height: bottomOpen ? `${bottomHeight}px` : '36px', flexShrink: 0 }}
        >
          {/* Vertical drag handle — only shown when open */}
          {bottomOpen && (
            <div
              onMouseDown={handleBottomResizeStart}
              className={`absolute top-0 inset-x-0 h-1 cursor-row-resize z-10 group ${isBottomResizing ? 'bg-brand-blue' : 'hover:bg-brand-blue/60 bg-transparent'}`}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-white/10 group-hover:bg-brand-blue/50 transition-colors" />
            </div>
          )}

          {/* Header bar */}
          <div className="flex items-center h-9 px-3 gap-1 shrink-0 border-b border-white/10">
            {/* Tab buttons */}
            {/* Left tabs: Chat & Logs */}
            {([
              { id: 'chat' as const, label: t('bottomPanel.chat'), icon: <MessageSquare className="w-3.5 h-3.5" /> },
              { id: 'logs' as const, label: t('bottomPanel.logs'), icon: <ScrollText    className="w-3.5 h-3.5" /> },
            ]).map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (!bottomOpen) { setBottomOpen(true); setBottomTab(tab.id); }
                  else if (bottomTab === tab.id) { setBottomOpen(false); }
                  else { setBottomTab(tab.id); }
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  bottomOpen && bottomTab === tab.id
                    ? 'bg-brand-blue/20 text-brand-blue border border-brand-blue/40'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon}{tab.label}
              </button>
            ))}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Split dropdown — right side */}
            <div className="relative" ref={splitMenuRef}>
              <button
                type="button"
                onClick={() => setShowSplitMenu(v => !v)}
                title="Split"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  bottomOpen && bottomTab === 'split'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {splitDir === 'v'
                  ? <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="12" height="5.5" rx="1"/><rect x="1" y="7.5" width="12" height="5.5" rx="1"/></svg>
                  : <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="5.5" height="12" rx="1"/><rect x="7.5" y="1" width="5.5" height="12" rx="1"/></svg>
                }
                {t('bottomPanel.splitLabel')}
              </button>

              {showSplitMenu && (
                <div className="absolute bottom-full right-0 mb-1.5 w-44 rounded-lg border border-white/10 bg-[#0d0d0d] shadow-2xl z-50 py-1">
                  <button
                    type="button"
                    onClick={() => { setSplitDir('h'); setBottomTab('split'); setBottomOpen(true); setShowSplitMenu(false); }}
                    className={`flex items-center gap-2.5 w-full px-3 py-2 text-xs transition-colors ${
                      splitDir === 'h' && bottomTab === 'split' && bottomOpen ? 'text-purple-300 bg-purple-500/10' : 'text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="5.5" height="12" rx="1"/><rect x="7.5" y="1" width="5.5" height="12" rx="1"/></svg>
                    {t('bottomPanel.splitSideBySide')}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSplitDir('v'); setBottomTab('split'); setBottomOpen(true); setShowSplitMenu(false); }}
                    className={`flex items-center gap-2.5 w-full px-3 py-2 text-xs transition-colors ${
                      splitDir === 'v' && bottomTab === 'split' && bottomOpen ? 'text-purple-300 bg-purple-500/10' : 'text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="12" height="5.5" rx="1"/><rect x="1" y="7.5" width="12" height="5.5" rx="1"/></svg>
                    {t('bottomPanel.splitTopBottom')}
                  </button>
                </div>
              )}
            </div>

            {/* Close button */}
            {bottomOpen && (
              <button
                type="button"
                onClick={() => setBottomOpen(false)}
                className="p-1 rounded text-gray-500 hover:text-white hover:bg-white/5 transition-colors"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            )}
          </div>

          {/* Panel content */}
          {bottomOpen && (
            <div
              className={`flex flex-1 overflow-hidden min-h-0 ${bottomTab === 'split' && splitDir === 'v' ? 'flex-col' : ''}`}
              data-panels-container
            >
              {/* Chat panel */}
              {(bottomTab === 'chat' || bottomTab === 'split') && (
                <div
                  className="flex flex-col overflow-hidden"
                  style={
                    bottomTab === 'split'
                      ? splitDir === 'h'
                        ? { width: `${panelsSplit}%`, minWidth: '20%' }
                        : { height: `${splitVRatio}%`, minHeight: '20%' }
                      : { flex: '1 1 0' }
                  }
                >
                  <ChatPanel
                    isOpen={true}
                    onClose={() => { if (bottomTab === 'chat') setBottomOpen(false); else setBottomTab('logs'); }}
                    onSendMessage={handleSendMessage}
                    workflowId={id}
                  />
                </div>
              )}

              {/* Split divider */}
              {bottomTab === 'split' && (
                splitDir === 'h' ? (
                  <div
                    onMouseDown={handleResizeStart}
                    className={`w-1 shrink-0 bg-white/10 hover:bg-brand-blue transition-colors cursor-col-resize relative group ${isResizing ? 'bg-brand-blue' : ''}`}
                  >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-1 h-8 bg-brand-blue/50 rounded-full" />
                    </div>
                  </div>
                ) : (
                  <div
                    onMouseDown={handleSplitVResizeStart}
                    className={`h-1 shrink-0 w-full bg-white/10 hover:bg-brand-blue transition-colors cursor-row-resize relative group ${isSplitVResizing ? 'bg-brand-blue' : ''}`}
                  >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="h-1 w-8 bg-brand-blue/50 rounded-full" />
                    </div>
                  </div>
                )
              )}

              {/* Logs panel */}
              {(bottomTab === 'logs' || bottomTab === 'split') && (
                <div
                  className={`flex flex-col overflow-hidden ${
                    bottomTab === 'split'
                      ? splitDir === 'h' ? 'border-l border-white/10' : 'border-t border-white/10'
                      : ''
                  }`}
                  style={
                    bottomTab === 'split'
                      ? splitDir === 'h'
                        ? { width: `${100 - panelsSplit}%`, minWidth: '20%' }
                        : { height: `${100 - splitVRatio}%`, minHeight: '20%' }
                      : { flex: '1 1 0' }
                  }
                >
                  <ExecutionLogsPanel
                    logs={executionLogs}
                    onClear={handleClearLogs}
                    onClose={() => { if (bottomTab === 'logs') setBottomOpen(false); else setBottomTab('chat'); }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Configuration Modal */}
      <NodeConfigModal
        selectedNode={selectedNode}
        onNodeUpdate={handleNodeUpdate}
        onClose={() => setIsConfigModalOpen(false)}
        isOpen={isConfigModalOpen}
        nodes={nodes}
        edges={edges}
        executionResults={executionResults}
      />

      {/* Toolbar Navigation Modal */}
      <ToolbarNavigationModal
        isOpen={showNavModal}
        onClose={() => setShowNavModal(false)}
        onSave={handleSave}
        onExecute={handleExecute}
        onToggleActive={handleToggleActive}
        onDeleteSelected={handleDeleteSelected}
        saving={saving}
        executing={executing}
        isActive={workflow?.isActive || false}
        hasSelection={!!selectedNode || !!selectedEdge}
        workflowId={id}
      />

      {/* Execution Status Panel */}

      {/* Data Flow Inspector */}
      <DataFlowInspector
        isOpen={showDataInspector}
        onClose={handleCloseDataInspector}
        selectedEdge={selectedEdge}
      />

      {/* Template Gallery */}
      <TemplateGallery
        isOpen={showTemplateGallery}
        onClose={() => setShowTemplateGallery(false)}
        onApplyTemplate={handleApplyTemplate}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onAddNode={handleAddNode as any}
        onSave={handleSave}
        onExecute={handleExecute}
        onExport={handleExport}
        onImport={async () => {}}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={closeToast} />
      </div>
  );
}

// Wrapper component to provide ReactFlowProvider
export default function WorkflowEditor() {
  return (
    <ReactFlowProvider>
      <WorkflowEditorContent />
    </ReactFlowProvider>
  );
}
