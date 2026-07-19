import { Request, Response } from 'express';
import databaseService from '../services/databaseService';
import { getDatabaseForInstance } from '../config/database';
import { WorkflowEngine, WorkflowDef } from '../engine/WorkflowEngine';

/**
 * Récupère l'instance ID depuis le token JWT
 */
function getInstanceIdFromRequest(req: Request): string {
  // Essayer de récupérer depuis le header Authorization
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      // Le token contient userId et instanceId encodés en base64
      // Pour l'instant, on utilise l'instance ID depuis les variables d'environnement
      const instanceId = process.env.INSTANCE_ID || 'default-instance';
      return instanceId;
    } catch {
      // Ignore les erreurs de décodage
    }
  }
  // Fallback sur l'instance ID des variables d'environnement
  return process.env.INSTANCE_ID || 'default-instance';
}

/**
 * Workflow Controller - Handles workflow CRUD operations
 */
export class WorkflowController {
  /**
   * Get all workflows
   * GET /api/workflows
   */
  static async getAllWorkflows(req: Request, res: Response): Promise<void> {
    try {
      const instanceId = getInstanceIdFromRequest(req);
      const prisma = getDatabaseForInstance(instanceId);
      const workflows = await prisma.workflow.findMany({
        orderBy: { updatedAt: 'desc' },
      });

      res.json({
        success: true,
        data: workflows,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch workflows',
      });
    }
  }

  /**
   * Get a single workflow by ID
   * GET /api/workflows/:id
   */
  static async getWorkflow(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const workflowId = id as string;
      const instanceId = getInstanceIdFromRequest(req);
      const prisma = getDatabaseForInstance(instanceId);

      const workflow = await prisma.workflow.findUnique({
        where: { id: workflowId },
        include: {
          executions: {
            orderBy: { startedAt: 'desc' },
            take: 10,
          },
        },
      });

      if (!workflow) {
        res.status(404).json({
          success: false,
          error: 'Workflow not found',
        });
        return;
      }

      res.json({
        success: true,
        data: workflow,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch workflow',
      });
    }
  }

  /**
   * Create a new workflow
   * POST /api/workflows
   */
  static async createWorkflow(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, nodes, edges } = req.body;
      const instanceId = getInstanceIdFromRequest(req);
      
      console.log(`🔧 Creating workflow for instance: ${instanceId}`);
      console.log(`   Name: ${name}`);
      console.log(`   Nodes:`, nodes ? JSON.stringify(nodes).substring(0, 100) : 'null');
      console.log(`   Edges:`, edges ? JSON.stringify(edges).substring(0, 100) : 'null');

      const prisma = getDatabaseForInstance(instanceId);

      // Validate input
      if (!name) {
        res.status(400).json({
          success: false,
          error: 'Workflow name is required',
        });
        return;
      }

      // Ensure nodes and edges are arrays
      const workflowNodes = Array.isArray(nodes) ? nodes : [];
      const workflowEdges = Array.isArray(edges) ? edges : [];

      console.log(`📝 Creating workflow with ${workflowNodes.length} nodes and ${workflowEdges.length} edges`);

      // Create workflow
      const workflow = await prisma.workflow.create({
        data: {
          name,
          description: description || null,
          nodes: workflowNodes,
          edges: workflowEdges,
        },
      });

      console.log(`✅ Workflow created successfully: ${workflow.id}`);

      res.status(201).json({
        success: true,
        data: workflow,
      });
    } catch (error: any) {
      console.error('❌ Failed to create workflow:', error);
      console.error('   Error message:', error.message);
      console.error('   Error stack:', error.stack);
      
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create workflow',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      });
    }
  }

  /**
   * Update a workflow
   * PUT /api/workflows/:id
   */
  static async updateWorkflow(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const workflowId = id as string;
      const { name, description, nodes, edges, isActive } = req.body;
      const instanceId = getInstanceIdFromRequest(req);
      const prisma = getDatabaseForInstance(instanceId);

      // Check if workflow exists
      const existing = await prisma.workflow.findUnique({
        where: { id: workflowId },
      });

      if (!existing) {
        res.status(404).json({
          success: false,
          error: 'Workflow not found',
        });
        return;
      }

      // Update workflow
      const workflow = await prisma.workflow.update({
        where: { id: workflowId },
        data: {
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description }),
          ...(nodes !== undefined && { nodes }),
          ...(edges !== undefined && { edges }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      res.json({
        success: true,
        data: workflow,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update workflow',
      });
    }
  }

  /**
   * Delete a workflow
   * DELETE /api/workflows/:id
   */
  static async deleteWorkflow(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const workflowId = id as string;
      const instanceId = getInstanceIdFromRequest(req);
      const prisma = getDatabaseForInstance(instanceId);

      // Check if workflow exists
      const existing = await prisma.workflow.findUnique({
        where: { id: workflowId },
      });

      if (!existing) {
        res.status(404).json({
          success: false,
          error: 'Workflow not found',
        });
        return;
      }

      // Delete workflow (executions will be cascade deleted)
      await prisma.workflow.delete({
        where: { id: workflowId },
      });

      res.json({
        success: true,
        message: 'Workflow deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete workflow',
      });
    }
  }

  /**
   * Execute a workflow manually
   * POST /api/workflows/:id/execute
   */
  static async executeWorkflow(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const workflowId = id as string;
      const data = req.body || {};
      const instanceId = getInstanceIdFromRequest(req);
      const prisma = getDatabaseForInstance(instanceId);

      // Fetch workflow
      const workflow = await prisma.workflow.findUnique({
        where: { id: workflowId },
      });

      if (!workflow) {
        res.status(404).json({
          success: false,
          error: 'Workflow not found',
        });
        return;
      }

      // Build workflow definition
      const workflowDef: WorkflowDef = {
        id: workflow.id,
        name: workflow.name,
        nodes: workflow.nodes as any,
        edges: workflow.edges as any,
      };

      // Validate workflow
      WorkflowEngine.validateWorkflow(workflowDef);

      // Execute workflow
      const result = await WorkflowEngine.executeWorkflow(workflowDef, data);

      // Store execution records
      const nodes = workflow.nodes as any[];
      for (const [nodeId, nodeResult] of result.results.entries()) {
        const nodeDef = nodes.find((n: any) => n.id === nodeId);
        await prisma.nodeExecution.create({
          data: {
            workflowId: workflow.id,
            nodeId,
            nodeName: nodeDef?.data?.label || nodeId,
            status: nodeResult.success ? 'success' : 'error',
            input: data,
            output: nodeResult.data,
            error: nodeResult.error,
            completedAt: new Date(),
          },
        });
      }

      // Send response
      console.log('📊 Workflow execution result:', { success: result.success, errorsCount: result.errors.length });
      if (result.success) {
        console.log('✅ Workflow executed successfully');
        res.json({
          success: true,
          data: {
            results: Array.from(result.results.entries()),
            executionTime: result.executionTime,
          },
        });
      } else {
        console.error('❌ Workflow execution failed with errors:', result.errors);
        res.status(500).json({
          success: false,
          error: 'Workflow execution failed',
          details: result.errors,
        });
      }
    } catch (error: any) {
      console.error('❌ Workflow execution error:', error);
      console.error('Stack trace:', error.stack);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to execute workflow',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      });
    }
  }

  /**
   * Get workflow execution history
   * GET /api/workflows/:id/executions
   */
  static async getWorkflowExecutions(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const workflowId = id as string;
      const limit = parseInt(req.query.limit as string) || 50;
      const instanceId = getInstanceIdFromRequest(req);
      const prisma = getDatabaseForInstance(instanceId);

      const executions = await prisma.nodeExecution.findMany({
        where: { workflowId },
        orderBy: { startedAt: 'desc' },
        take: limit,
      });

      res.json({
        success: true,
        data: executions,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch executions',
      });
    }
  }
}

export default WorkflowController;
