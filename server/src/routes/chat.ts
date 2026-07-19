import express from 'express';
import { sendChatMessage } from '../controllers/chatController';

const router = express.Router();

/**
 * POST /api/chat/:workflowId/send
 * Send a message to the chat trigger and execute the workflow
 */
router.post('/:workflowId/send', sendChatMessage);

export default router;
