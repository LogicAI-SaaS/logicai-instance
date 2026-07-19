/**
 * Auto-Save Hook
 *
 * Automatically saves workflow at specified intervals.
 * Prevents data loss and shows save status to user.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Node, Edge } from '@xyflow/react';

export interface AutoSaveOptions {
  /** Auto-save interval in milliseconds (default: 30000 = 30s) */
  interval?: number;
  /** Enable/disable auto-save (default: true) */
  enabled?: boolean;
  /** Delay before first save in milliseconds (default: 5000 = 5s) */
  initialDelay?: number;
}

export interface AutoSaveState {
  /** When the workflow was last saved */
  lastSaved: Date | null;
  /** Whether a save is currently in progress */
  isSaving: boolean;
  /** Whether there are unsaved changes */
  hasUnsavedChanges: boolean;
  /** Manually trigger a save */
  save: () => Promise<void>;
}

/**
 * Hook for auto-saving workflow
 *
 * @param workflowId - Unique identifier for the workflow
 * @param nodes - Current nodes
 * @param edges - Current edges
 * @param saveFn - Function to save workflow (should be wrapped in useCallback)
 * @param options - Auto-save configuration
 * @returns Auto-save state and save function
 */
export const useAutoSave = (
  workflowId: string,
  nodes: Node[],
  edges: Edge[],
  saveFn: (id: string, data: { nodes: Node[]; edges: Edge[] }) => Promise<void>,
  options: AutoSaveOptions = {}
): AutoSaveState => {
  const {
    interval = 30000,
    enabled = true,
    initialDelay = 5000,
  } = options;

  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Track previous values for change detection
  const prevNodesRef = useRef<Node[]>(nodes);
  const prevEdgesRef = useRef<Edge[]>(edges);

  // Detect changes
  useEffect(() => {
    const nodesChanged = JSON.stringify(prevNodesRef.current) !== JSON.stringify(nodes);
    const edgesChanged = JSON.stringify(prevEdgesRef.current) !== JSON.stringify(edges);

    if (nodesChanged || edgesChanged) {
      setHasUnsavedChanges(true);
      prevNodesRef.current = nodes;
      prevEdgesRef.current = edges;
    }
  }, [nodes, edges]);

  // Save function
  const save = useCallback(async () => {
    if (!workflowId || isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      await saveFn(workflowId, { nodes, edges });
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Auto-save failed:', error);
      // Don't update state on error, will retry on next interval
    } finally {
      setIsSaving(false);
    }
  }, [workflowId, nodes, edges, saveFn, isSaving]);

  // Auto-save timer
  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Initial save after delay
    const initialTimer = setTimeout(() => {
      if (hasUnsavedChanges) {
        save();
      }
    }, initialDelay);

    // Interval saves
    const intervalTimer = setInterval(() => {
      if (hasUnsavedChanges) {
        save();
      }
    }, interval);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, [enabled, interval, initialDelay, hasUnsavedChanges, save]);

  // Save before page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  return {
    lastSaved,
    isSaving,
    hasUnsavedChanges,
    save,
  };
};
