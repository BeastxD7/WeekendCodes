import { Router } from 'express';
import { startParticipation, submitAnswer, completeParticipation, getResults } from '../controllers/participation.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All participation routes require authentication
router.use(authenticate);

// Start a new participation
router.post('/', startParticipation);

// Submit answer for a question
router.post('/:id/answers', submitAnswer);

// Complete participation
router.post('/:id/complete', completeParticipation);

// Get participation results
router.get('/:id/results', getResults);

export default router;