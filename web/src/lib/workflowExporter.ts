/**
 * Workflow Exporter/Importer
 *
 * Provides functionality to export and import workflows as JSON files.
 * Supports clipboard operations for quick workflow sharing.
 */

import type { Node, Edge } from '@xyflow/react';

export interface WorkflowExport {
  nodes: Node[];
  edges: Edge[];
  version: string;
  exportedAt: string;
  metadata?: {
    name?: string;
    description?: string;
    author?: string;
    tags?: string[];
  };
}

/**
 * Export workflow to JSON file
 */
export const exportWorkflow = (
  nodes: Node[],
  edges: Edge[],
  metadata?: WorkflowExport['metadata']
): void => {
  const workflow: WorkflowExport = {
    nodes,
    edges,
    version: '1.0',
    exportedAt: new Date().toISOString(),
    metadata,
  };

  const data = JSON.stringify(workflow, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `workflow-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Import workflow from JSON file
 */
export const importWorkflow = async (
  file: File
): Promise<{ nodes: Node[]; edges: Edge[]; metadata?: WorkflowExport['metadata'] }> => {
  const text = await file.text();
  const workflow: WorkflowExport = JSON.parse(text);

  // Validate workflow structure
  if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
    throw new Error('Invalid workflow file: missing or invalid nodes');
  }

  if (!workflow.edges || !Array.isArray(workflow.edges)) {
    throw new Error('Invalid workflow file: missing or invalid edges');
  }

  return {
    nodes: workflow.nodes,
    edges: workflow.edges,
    metadata: workflow.metadata,
  };
};

/**
 * Copy workflow to clipboard
 */
export const copyToClipboard = async (
  nodes: Node[],
  edges: Edge[],
  metadata?: WorkflowExport['metadata']
): Promise<void> => {
  const workflow: WorkflowExport = {
    nodes,
    edges,
    version: '1.0',
    exportedAt: new Date().toISOString(),
    metadata,
  };

  await navigator.clipboard.writeText(JSON.stringify(workflow, null, 2));
};

/**
 * Paste workflow from clipboard
 */
export const pasteFromClipboard = async (): Promise<{
  nodes: Node[];
  edges: Edge[];
  metadata?: WorkflowExport['metadata'];
}> => {
  const text = await navigator.clipboard.readText();
  const workflow: WorkflowExport = JSON.parse(text);

  // Validate workflow structure
  if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
    throw new Error('Invalid clipboard content: missing or invalid nodes');
  }

  if (!workflow.edges || !Array.isArray(workflow.edges)) {
    throw new Error('Invalid clipboard content: missing or invalid edges');
  }

  return {
    nodes: workflow.nodes,
    edges: workflow.edges,
    metadata: workflow.metadata,
  };
};

/**
 * Validate workflow file before import
 */
export const validateWorkflowFile = (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const workflow: WorkflowExport = JSON.parse(content);

        const isValid =
          workflow.nodes &&
          Array.isArray(workflow.nodes) &&
          workflow.edges &&
          Array.isArray(workflow.edges);

        resolve(isValid);
      } catch {
        resolve(false);
      }
    };

    reader.onerror = () => resolve(false);

    reader.readAsText(file);
  });
};

/**
 * Get workflow file info without reading full content
 */
export const getWorkflowInfo = async (
  file: File
): Promise<{ nodeCount: number; edgeCount: number; metadata?: WorkflowExport['metadata'] } | null> => {
  try {
    const text = await file.text();
    const workflow: WorkflowExport = JSON.parse(text);

    return {
      nodeCount: workflow.nodes?.length || 0,
      edgeCount: workflow.edges?.length || 0,
      metadata: workflow.metadata,
    };
  } catch {
    return null;
  }
};

/**
 * Create workflow metadata
 */
export const createWorkflowMetadata = (
  name: string,
  description?: string,
  author?: string,
  tags?: string[]
): WorkflowExport['metadata'] => ({
  name,
  description,
  author,
  tags,
});
