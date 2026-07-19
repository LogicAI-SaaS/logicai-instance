/**
 * Workflow Types for LogicAI-N8N Frontend
 */

import type { Edge } from '@xyflow/react';
import type { CustomNode } from './node';

export interface Workflow {
  id: string;
  name: string;
  description?: string | null;
  nodes: CustomNode[];
  edges: Edge[];
  isActive: boolean;
  webhookPath?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowFormData {
  name: string;
  description?: string;
  nodes: CustomNode[];
  edges: Edge[];
  isActive?: boolean;
  webhookPath?: string | null;
}
