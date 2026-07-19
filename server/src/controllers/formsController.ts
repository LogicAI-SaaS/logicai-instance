import { Request, Response } from 'express';
import databaseService from '../services/databaseService';
import { WorkflowEngine, WorkflowDef } from '../engine/WorkflowEngine';
import { FormTriggerNode } from '../nodes/implementations/FormTriggerNode';

const prisma = databaseService.getPrisma();

/**
 * Forms Controller - Handles form trigger submissions
 */
export class FormsController {
  /**
   * Get form definition
   * GET /api/forms/:formId
   */
  static async getForm(req: Request, res: Response): Promise<void> {
    try {
      const  formId  = req.params.formId as string;

      // Try to get form from FormTriggerNode
      const formDef = FormTriggerNode.getForm(formId);

      if (!formDef) {
        // If not in memory, try to fetch from database
        const workflow = await prisma.workflow.findFirst({
          where: {
            nodes: {
              // @ts-ignore - Prisma JSON query
              path: ['$[*].id'],
              array_contains: formId,
            },
          },
        });

        if (!workflow) {
          res.status(404).json({
            success: false,
            error: 'Form not found',
          });
          return;
        }

        // Extract form node configuration from workflow
        const nodes = workflow.nodes as any[];
        const formNode = nodes.find((n: any) => n.id === formId);

        if (!formNode || formNode.type !== 'formTrigger') {
          res.status(404).json({
            success: false,
            error: 'Form trigger node not found in workflow',
          });
          return;
        }

        // Return form configuration
        res.json({
          success: true,
          data: {
            formId,
            workflowId: workflow.id,
            title: formNode.data?.config?.formTitle || 'Form',
            description: formNode.data?.config?.formDescription || '',
            fields: formNode.data?.config?.fields || [],
            submitButtonText: formNode.data?.config?.submitButtonText || 'Submit',
            responseMessage: formNode.data?.config?.responseMessage || 'Thank you!',
            redirectUrl: formNode.data?.config?.redirectUrl || null,
            allowMultipleSubmissions: formNode.data?.config?.allowMultipleSubmissions !== false,
            captchaEnabled: formNode.data?.config?.captchaEnabled === true,
          },
        });
        return;
      }

      res.json({
        success: true,
        data: formDef,
      });
    } catch (error: any) {
      console.error('Error fetching form:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch form',
      });
    }
  }

  /**
   * Submit form data and trigger workflow
   * POST /api/forms/:formId/submit
   */
  static async submitForm(req: Request, res: Response): Promise<void> {
    try {
      const formId = req.params.formId as string;
      const formData = req.body;

      // Find workflow containing this form trigger node
      const workflow = await prisma.workflow.findFirst({
        where: {
          isActive: true,
          nodes: {
            // @ts-ignore - Prisma JSON query
            path: ['$[*].id'],
            array_contains: formId,
          },
        },
      });

      if (!workflow) {
        res.status(404).json({
          success: false,
          error: 'Workflow not found or not active',
        });
        return;
      }

      // Extract form node configuration
      const nodes = workflow.nodes as any[];
      const formNode = nodes.find((n: any) => n.id === formId);

      if (!formNode || formNode.type !== 'formTrigger') {
        res.status(404).json({
          success: false,
          error: 'Form trigger node not found',
        });
        return;
      }

      const fields = formNode.data?.config?.fields || [];

      // Validate required fields
      for (const field of fields) {
        if (field.required && !formData[field.name]) {
          res.status(400).json({
            success: false,
            error: `Field "${field.label}" is required`,
          });
          return;
        }
      }

      // Store form submission using FormTriggerNode
      try {
        const submission = FormTriggerNode.submitForm(formId, formData);

        // Build workflow definition
        const workflowDef: WorkflowDef = {
          id: workflow.id,
          name: workflow.name,
          nodes: workflow.nodes as any,
          edges: workflow.edges as any,
        };

        // Execute workflow with form data
        const triggerData = {
          formId,
          submissionId: submission.id,
          submittedAt: submission.submittedAt,
          ...formData,
        };

        const result = await WorkflowEngine.executeWorkflow(workflowDef, triggerData);

        // Store execution records asynchronously
        for (const [nodeId, nodeResult] of result.results.entries()) {
          const nodeDef = nodes.find((n: any) => n.id === nodeId);
          prisma.nodeExecution
            .create({
              data: {
                workflowId: workflow.id,
                nodeId,
                nodeName: nodeDef?.data?.label || nodeId,
                status: nodeResult.success ? 'success' : 'error',
                input: triggerData,
                output: nodeResult.data,
                error: nodeResult.error,
                completedAt: new Date(),
              },
            })
            .catch(console.error);
        }

        // Get response configuration
        const responseMessage = formNode.data?.config?.responseMessage || 'Thank you for your submission!';
        const redirectUrl = formNode.data?.config?.redirectUrl;

        res.json({
          success: true,
          message: responseMessage,
          redirectUrl,
          submissionId: submission.id,
          workflowExecuted: result.success,
        });
      } catch (validationError: any) {
        res.status(400).json({
          success: false,
          error: validationError.message,
        });
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to submit form',
      });
    }
  }

  /**
   * Get form responses (admin only)
   * GET /api/forms/:formId/responses
   */
  static async getFormResponses(req: Request, res: Response): Promise<void> {
    try {
      const formId = req.params.formId as string;

      const responses = FormTriggerNode.getFormResponses(formId);

      res.json({
        success: true,
        data: responses,
      });
    } catch (error: any) {
      console.error('Error fetching form responses:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch form responses',
      });
    }
  }
}

export default FormsController;
