import { Request, Response } from 'express';
import databaseService from '../services/databaseService';
import { WorkflowEngine, WorkflowDef } from '../engine/WorkflowEngine';

const prisma = databaseService.getPrisma();

/**
 * Webhook Controller - Handles dynamic webhook routes
 */
export class WebhookController {
  /**
   * Handle incoming webhook request
   * POST /webhook/:workflowId
   */
  static async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const { workflowId } = req.params;

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

      // Check if workflow is active
      if (!workflow.isActive) {
        res.status(400).json({
          success: false,
          error: 'Workflow is not active',
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

      // Get webhook data from request
      const webhookData = {
        body: req.body,
        query: req.query,
        headers: req.headers,
        method: req.method,
        params: req.params,
      };

      // Execute workflow
      const result = await WorkflowEngine.executeWorkflow(workflowDef, webhookData);

      // Store execution records asynchronously (don't wait)
      for (const [nodeId, nodeResult] of result.results.entries()) {
        const nodeDef = (workflow.nodes as any)?.find((n: any) => n.id === nodeId);
        prisma.nodeExecution
          .create({
            data: {
              workflowId: workflow.id,
              nodeId,
              nodeName: nodeDef?.data?.label || nodeId,
              status: nodeResult.success ? 'success' : 'error',
              input: webhookData,
              output: nodeResult.data,
              error: nodeResult.error,
              completedAt: new Date(),
            },
          })
          .catch(console.error);
      }

      // Send response
      if (result.success) {
        // Get the last node's output to return to the webhook caller
        const lastResult = Array.from(result.results.values()).pop();

        res.json({
          success: true,
          message: 'Workflow executed successfully',
          data: lastResult?.data,
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Workflow execution failed',
          details: result.errors,
        });
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to handle webhook',
      });
    }
  }
}

export default WebhookController;
