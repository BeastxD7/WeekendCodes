import { Request, Response } from 'express';
import { QuestionType } from '@prisma/client';
import { getPrismaClient } from '../utils/db.util';
import { sendSuccess, sendError, sendValidationError } from '../utils/response.util';
import { validateRequired } from '../utils/validation.util';

const prisma = getPrismaClient();

// Extend Express Request interface to include user information
interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

// Define interfaces for request bodies
interface CreateQuestionRequest {
  quizId: string;
  content: string;
  type: QuestionType;
  points: number;
  order?: number;
  options?: {
    content: string;
    isCorrect: boolean;
  }[];
}

interface UpdateQuestionRequest {
  content?: string;
  type?: QuestionType;
  points?: number;
  order?: number;
}

// Create a new question
export const createQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const { quizId, content, type, points, order, options } = req.body as CreateQuestionRequest;
    
    // Validate required fields
    const requiredFields = ['quizId', 'content', 'type', 'points'];
    const missingFields = validateRequired(req.body, requiredFields);
    if (missingFields.length > 0) {
      return sendValidationError(res, `Missing required fields: ${missingFields.join(', ')}`);
    }

    // Check if quiz exists and user is the owner
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      return sendError(res, 'Quiz not found', 404);
    }

    if (quiz.creatorId !== req.user.userId) {
      return sendError(res, 'Access denied', 403);
    }

    // If quiz is published, don't allow adding questions
    if (quiz.published) {
      return sendError(res, 'Cannot add questions to a published quiz', 400);
    }

    // Determine order if not provided
    let questionOrder = order;
    if (!questionOrder) {
      const lastQuestion = await prisma.question.findFirst({
        where: { quizId },
        orderBy: { order: 'desc' },
      });
      questionOrder = lastQuestion ? lastQuestion.order + 1 : 1;
    }

    // Create question
    const question = await prisma.question.create({
      data: {
        content,
        type,
        points,
        order: questionOrder,
        quiz: {
          connect: { id: quizId },
        },
        options: type !== 'SHORT_ANSWER' && options
          ? {
              create: options,
            }
          : undefined,
      },
      include: {
        options: true,
      },
    });

    return sendSuccess(res, question, 201);
  } catch (error) {
    console.error('Create question error:', error);
    return sendError(res, 'Internal server error', 500);
  }
};

// Get a question by ID
export const getQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const questionId = req.params.id;

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        options: true,
        quiz: true,
      },
    });

    if (!question) {
      return sendError(res, 'Question not found', 404);
    }

    // Check if user is the quiz owner
    if (question.quiz.creatorId !== req.user.userId) {
      return sendError(res, 'Access denied', 403);
    }

    return sendSuccess(res, question);
  } catch (error) {
    console.error('Get question error:', error);
    return sendError(res, 'Internal server error', 500);
  }
};

// Update a question
export const updateQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const questionId = req.params.id;
    const { content, type, points, order } = req.body as UpdateQuestionRequest;

    // Check if question exists
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        quiz: true,
      },
    });

    if (!question) {
      return sendError(res, 'Question not found', 404);
    }

    // Check if user is the quiz owner
    if (question.quiz.creatorId !== req.user.userId) {
      return sendError(res, 'Access denied', 403);
    }

    // If quiz is published, don't allow updating questions
    if (question.quiz.published) {
      return sendError(res, 'Cannot update questions in a published quiz', 400);
    }

    // Update question
    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: {
        content,
        type,
        points,
        order,
      },
      include: {
        options: true,
      },
    });

    return sendSuccess(res, updatedQuestion);
  } catch (error) {
    console.error('Update question error:', error);
    return sendError(res, 'Internal server error', 500);
  }
};

// Delete a question
export const deleteQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const questionId = req.params.id;

    // Check if question exists
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        quiz: true,
      },
    });

    if (!question) {
      return sendError(res, 'Question not found', 404);
    }

    // Check if user is the quiz owner
    if (question.quiz.creatorId !== req.user.userId) {
      return sendError(res, 'Access denied', 403);
    }

    // If quiz is published, don't allow deleting questions
    if (question.quiz.published) {
      return sendError(res, 'Cannot delete questions from a published quiz', 400);
    }

    // Delete question
    await prisma.question.delete({
      where: { id: questionId },
    });

    // Reorder remaining questions
    const remainingQuestions = await prisma.question.findMany({
      where: {
        quizId: question.quizId,
        order: {
          gt: question.order,
        },
      },
      orderBy: {
        order: 'asc',
      },
    });

    // Update order of remaining questions
    for (const q of remainingQuestions) {
      await prisma.question.update({
        where: { id: q.id },
        data: { order: q.order - 1 },
      });
    }

    return sendSuccess(res, { message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Delete question error:', error);
    return sendError(res, 'Internal server error', 500);
  }
};

// Create or update options for a question
export const updateOptions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const questionId = req.params.id;
    const options = req.body.options as { id?: string; content: string; isCorrect: boolean }[];
    
    // Validate required fields
    if (!options || !Array.isArray(options)) {
      return sendValidationError(res, 'Options array is required');
    }

    // Check if question exists
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        quiz: true,
        options: true,
      },
    });

    if (!question) {
      return sendError(res, 'Question not found', 404);
    }

    // Check if user is the quiz owner
    if (question.quiz.creatorId !== req.user.userId) {
      return sendError(res, 'Access denied', 403);
    }

    // If quiz is published, don't allow updating options
    if (question.quiz.published) {
      return sendError(res, 'Cannot update options in a published quiz', 400);
    }

    // Check if question type supports options
    if (question.type === 'SHORT_ANSWER') {
      return sendError(res, 'Short answer questions do not support options', 400);
    }

    // Start a transaction to handle option updates
    const result = await prisma.$transaction(async (prisma) => {
      // Delete existing options
      await prisma.option.deleteMany({
        where: { questionId },
      });

      // Create new options
      const createdOptions = [];
      for (const option of options) {
        const createdOption = await prisma.option.create({
          data: {
            content: option.content,
            isCorrect: option.isCorrect,
            question: {
              connect: { id: questionId },
            },
          },
        });
        createdOptions.push(createdOption);
      }

      return createdOptions;
    });

    return sendSuccess(res, result);
  } catch (error) {
    console.error('Update options error:', error);
    return sendError(res, 'Internal server error', 500);
  }
};