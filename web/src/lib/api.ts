/**
 * API Client for LogicAI-N8N Backend
 */

import axios from 'axios';
import type {
  Workflow,
  WorkflowFormData,
  ApiResponse,
  WorkflowExecutionResult,
  ExecutionDetails,
} from '../types/index';

// En production, utiliser une URL relative (même origine)
// En développement, utiliser VITE_API_URL si défini
const API_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Workflow API Methods
 */
export const workflowApi = {
  /**
   * Get all workflows
   */
  async getAll(): Promise<Workflow[]> {
    const response = await api.get<ApiResponse<Workflow[]>>('/api/workflows');
    return response.data.data || [];
  },

  /**
   * Get a single workflow by ID
   */
  async getById(id: string): Promise<Workflow> {
    const response = await api.get<ApiResponse<Workflow>>(`/api/workflows/${id}`);
    if (!response.data.data) {
      throw new Error('Workflow not found');
    }
    return response.data.data;
  },

  /**
   * Create a new workflow
   */
  async create(data: WorkflowFormData): Promise<Workflow> {
    const response = await api.post<ApiResponse<Workflow>>('/api/workflows', data);
    if (!response.data.data) {
      throw new Error(response.data.error || 'Failed to create workflow');
    }
    return response.data.data;
  },

  /**
   * Update a workflow
   */
  async update(id: string, data: Partial<WorkflowFormData>): Promise<Workflow> {
    const response = await api.put<ApiResponse<Workflow>>(`/api/workflows/${id}`, data);
    if (!response.data.data) {
      throw new Error(response.data.error || 'Failed to update workflow');
    }
    return response.data.data;
  },

  /**
   * Delete a workflow
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/api/workflows/${id}`);
  },

  /**
   * Execute a workflow manually
   */
  async execute(id: string, inputData?: any): Promise<ExecutionDetails> {
    const response = await api.post<ApiResponse<ExecutionDetails>>(
      `/api/workflows/${id}/execute`,
      inputData || {}
    );
    if (!response.data.data) {
      throw new Error(response.data.error || 'Failed to execute workflow');
    }
    return response.data.data;
  },

  /**
   * Get workflow execution history
   */
  async getExecutions(id: string, limit = 50): Promise<WorkflowExecutionResult[]> {
    const response = await api.get<ApiResponse<WorkflowExecutionResult[]>>(
      `/api/workflows/${id}/executions?limit=${limit}`
    );
    return response.data.data || [];
  },
};

/**
 * Health check
 */
export async function healthCheck(): Promise<boolean> {
  try {
    await api.get('/health');
    return true;
  } catch {
    return false;
  }
}

export default api;
