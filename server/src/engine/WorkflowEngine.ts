import { topologicalSort, Graph } from './topologicalSort';
import nodeRegistry from '../nodes/NodeRegistry';
import { BaseNode } from '../nodes/base/BaseNode';
import { ExecutionContext, NodeExecutionResult, WorkflowExecutionMeta } from '../types';

/**
 * Workflow Node Definition (from React Flow)
 */
export interface WorkflowNodeDef {
  id: string;
  type: string;
  data: {
    label: string;
    config: Record<string, any>;
    [key: string]: any;
  };
}

/**
 * Workflow Edge Definition (from React Flow)
 */
export interface WorkflowEdgeDef {
  source: string;
  target: string;
}

/**
 * Workflow Definition
 */
export interface WorkflowDef {
  id: string;
  name: string;
  nodes: WorkflowNodeDef[];
  edges: WorkflowEdgeDef[];
}

/**
 * Workflow Execution Result
 */
export interface WorkflowExecutionResult {
  success: boolean;
  results: Map<string, NodeExecutionResult>;
  errors: Array<{ nodeId: string; error: string }>;
  executionTime: number;
}

/**
 * Workflow Engine - Executes workflows by orchestrating nodes in topological order
 */
export class WorkflowEngine {
  private workflow: WorkflowDef;
  private executionContext: ExecutionContext;
  private startTime: number;

  constructor(workflow: WorkflowDef, initialData: any = {}) {
    this.workflow = workflow;
    this.startTime = Date.now();

    // Initialize execution context
    this.executionContext = {
      $json: initialData,
      $workflow: {
        id: workflow.id,
        name: workflow.name,
      },
      $node: {
        id: '',
        name: '',
        type: '',
      },
    };
  }

  /**
   * Execute the workflow
   * @returns The execution result
   */
  async execute(): Promise<WorkflowExecutionResult> {
    const results = new Map<string, NodeExecutionResult>();
    const errors: Array<{ nodeId: string; error: string }> = [];

    try {
      // Get execution order using topological sort
      const executionOrder = this.getExecutionOrder();

      // Execute each node in order
      for (const nodeId of executionOrder) {
        const node = this.createNodeFromDef(nodeId);
        if (!node) {
          errors.push({ nodeId, error: `Failed to create node: ${nodeId}` });
          continue;
        }

        // Update context with current node info
        this.executionContext.$node = {
          id: node.getId(),
          name: node.getName(),
          type: node.getType(),
        };

        try {
          // Execute the node
          const result = await node.execute(this.executionContext);

          // Store the result
          results.set(nodeId, result);

          // Update $json for the next node if the node returned data
          if (result.success && result.data !== undefined) {
            // Handle condition nodes specially - they pass through $json
            if (node.getType() === 'condition' && result.data.$json) {
              this.executionContext.$json = result.data.$json;
            } else if (node.getType() !== 'condition') {
              this.executionContext.$json = result.data;
            }
          }

          // If node failed, stop execution (unless it's a condition node that continues)
          if (!result.success) {
            errors.push({
              nodeId,
              error: result.error || 'Node execution failed',
            });
            // Continue execution for now; could implement stop-on-error behavior
          }
        } catch (error: any) {
          const errorMessage = error.message || 'Unknown error';
          errors.push({ nodeId, error: errorMessage });
          results.set(nodeId, {
            success: false,
            error: errorMessage,
          });
        }
      }

      const executionTime = Date.now() - this.startTime;
      const hasErrors = errors.length > 0;

      return {
        success: !hasErrors,
        results,
        errors,
        executionTime,
      };
    } catch (error: any) {
      const executionTime = Date.now() - this.startTime;
      return {
        success: false,
        results,
        errors: [{ nodeId: 'workflow', error: error.message || 'Workflow execution failed' }],
        executionTime,
      };
    }
  }

  /**
   * Get the execution order using topological sort
   * @returns Array of node IDs in execution order
   */
  private getExecutionOrder(): string[] {
    const graph: Graph = {
      nodes: this.workflow.nodes.map(node => ({ id: node.id })),
      edges: this.workflow.edges,
    };

    return topologicalSort(graph);
  }

  /**
   * Create a node instance from a workflow node definition
   * @param nodeId - The node ID
   * @returns The node instance or null if creation failed
   */
  private createNodeFromDef(nodeId: string): BaseNode | null {
    const nodeDef = this.workflow.nodes.find(n => n.id === nodeId);
    if (!nodeDef) {
      return null;
    }

    try {
      // Use data.type instead of type for compatibility with React Flow nodes
      const nodeType = nodeDef.data?.type || nodeDef.type;
      
      return nodeRegistry.createNode(
        nodeType,
        nodeDef.id,
        nodeDef.data.label,
        nodeDef.data.config
      );
    } catch (error) {
      console.error(`Failed to create node ${nodeId}:`, error);
      return null;
    }
  }

  /**
   * Execute a workflow from a definition
   * @param workflow - The workflow definition
   * @param initialData - Initial data for $json
   * @returns The execution result
   */
  static async executeWorkflow(
    workflow: WorkflowDef,
    initialData: any = {}
  ): Promise<WorkflowExecutionResult> {
    const engine = new WorkflowEngine(workflow, initialData);
    return engine.execute();
  }

  /**
   * Validate a workflow definition
   * @param workflow - The workflow definition
   * @returns True if valid, throws error if invalid
   */
  static validateWorkflow(workflow: WorkflowDef): boolean {
    if (!workflow.id) {
      throw new Error('Workflow ID is required');
    }

    if (!workflow.name) {
      throw new Error('Workflow name is required');
    }

    if (!workflow.nodes || workflow.nodes.length === 0) {
      throw new Error('Workflow must have at least one node');
    }

    // Check for duplicate node IDs
    const nodeIds = new Set<string>();
    for (const node of workflow.nodes) {
      if (nodeIds.has(node.id)) {
        throw new Error(`Duplicate node ID: ${node.id}`);
      }
      nodeIds.add(node.id);
    }

    // Validate topological sort (will throw if there's a cycle)
    const graph: Graph = {
      nodes: workflow.nodes.map(node => ({ id: node.id })),
      edges: workflow.edges,
    };

    try {
      topologicalSort(graph);
    } catch (error) {
      throw new Error(`Invalid workflow structure: ${error}`);
    }

    return true;
  }
}
