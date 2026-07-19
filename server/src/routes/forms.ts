import { Router } from 'express';
import FormsController from '../controllers/formsController';

const router = Router();

/**
 * Form Routes
 * These routes handle form submissions for Form Trigger nodes
 */

// GET /forms/:formId - Get form definition and render form
router.get('/:formId', FormsController.getForm);

// POST /forms/:formId/submit - Submit form data and trigger workflow
router.post('/:formId/submit', FormsController.submitForm);

// GET /forms/:formId/responses - Get all form responses (admin)
router.get('/:formId/responses', FormsController.getFormResponses);

export default router;
