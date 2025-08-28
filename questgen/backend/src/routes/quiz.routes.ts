import { Router } from 'express';
import * as quizController from '../controllers/quiz.controller';
import { authenticate, isResourceOwner } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route POST /api/quizzes
 * @desc Create a new quiz
 * @access Private
 */
router.post('/', authenticate, quizController.createQuiz);

/**
 * @route GET /api/quizzes
 * @desc Get all quizzes
 * @access Private
 */
router.get('/', authenticate, quizController.getQuizzes);

/**
 * @route GET /api/quizzes/:id
 * @desc Get quiz by ID
 * @access Private
 */
router.get('/:id', authenticate, quizController.getQuizById);

/**
 * @route PUT /api/quizzes/:id
 * @desc Update quiz
 * @access Private (Creator only)
 */
router.put('/:id', authenticate, isResourceOwner('creatorId'), quizController.updateQuiz);

/**
 * @route DELETE /api/quizzes/:id
 * @desc Delete quiz
 * @access Private (Creator only)
 */
router.delete('/:id', authenticate, isResourceOwner('creatorId'), quizController.deleteQuiz);

/**
 * @route PUT /api/quizzes/:id/publish
 * @desc Publish quiz
 * @access Private (Creator only)
 */
router.put('/:id/publish', authenticate, isResourceOwner('creatorId'), quizController.publishQuiz);

export default router;