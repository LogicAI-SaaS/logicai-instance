import { Router } from 'express';
import WebhookController from '../controllers/webhookController';

const router = Router();

/**
 * Webhook Routes
 * These are dynamic routes that trigger workflows
 */

// POST /webhook/:workflowId - Trigger a workflow via webhook
router.post('/:workflowId', WebhookController.handleWebhook);

// GET /webhook/:workflowId - Also support GET for webhooks
router.get('/:workflowId', WebhookController.handleWebhook);

export default router;
