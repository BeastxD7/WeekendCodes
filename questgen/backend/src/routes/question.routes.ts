import { Router } from 'express';
import { createQuestion, getQuestion, updateQuestion, deleteQuestion, updateOptions } from '../controllers/question.controller';
import { authenticate, isResourceOwner } from '../middleware/auth.middleware';

const router = Router();

// All question routes require authentication
router.use(authenticate);

// Create a new question
router.post('/', createQuestion);

// Get a question by ID
router.get('/:id', getQuestion);

// Update a question
router.put('/:id', updateQuestion);

// Delete a question
router.delete('/:id', deleteQuestion);

// Update options for a question
router.put('/:id/options', updateOptions);

export default router;