import { Router } from 'express';
import WorkflowController from '../controllers/workflowController';

const router = Router();

/**
 * Workflow Routes
 * Base path: /api/workflows
 */

// GET /api/workflows - Get all workflows
router.get('/', WorkflowController.getAllWorkflows);

// GET /api/workflows/:id - Get a single workflow
router.get('/:id', WorkflowController.getWorkflow);

// POST /api/workflows - Create a new workflow
router.post('/', WorkflowController.createWorkflow);

// PUT /api/workflows/:id - Update a workflow
router.put('/:id', WorkflowController.updateWorkflow);

// DELETE /api/workflows/:id - Delete a workflow
router.delete('/:id', WorkflowController.deleteWorkflow);

// POST /api/workflows/:id/execute - Execute a workflow manually
router.post('/:id/execute', WorkflowController.executeWorkflow);

// GET /api/workflows/:id/executions - Get workflow execution history
router.get('/:id/executions', WorkflowController.getWorkflowExecutions);

export default router;
