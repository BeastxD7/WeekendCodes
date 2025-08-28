import { Request, Response } from 'express';
import { getPrismaClient } from '../utils/db.util';
import { sendSuccess, sendError, sendValidationError } from '../utils/response.util';
import { validateRequired } from '../utils/validation.util';
import { Quiz, Question, Option, QuestionType } from '@prisma/client';

const prisma = getPrismaClient();

// Define interfaces for request bodies
interface CreateQuizRequest {
  title: string;
  description?: string;
  timeLimit?: number;
  questions: CreateQuestionRequest[];
}

interface CreateQuestionRequest {
  content: string;
  type: QuestionType;
  points: number;
  order: number;
  options: CreateOptionRequest[];
}

interface CreateOptionRequest {
  content: string;
  isCorrect: boolean;
}

interface UpdateQuizRequest {
  title?: string;
  description?: string;
  timeLimit?: number;
  published?: boolean;
}

// Define interfaces for responses
interface QuizResponse {
  id: string;
  title: string;
  description?: string;
  timeLimit?: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  creatorId: string;
}

interface QuestionResponse {
  id: string;
  content: string;
  type: QuestionType;
  points: number;
  order: number;
  options: OptionResponse[];
}

interface OptionResponse {
  id: string;
  content: string;
  isCorrect: boolean;
}

interface DetailedQuizResponse extends QuizResponse {
  questions: QuestionResponse[];
}

// Extend Express Request interface to include user information
interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

// Create a new quiz
export const createQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const { title, description, timeLimit, questions } = req.body as CreateQuizRequest;

    // Create quiz
    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        timeLimit,
        creator: {
          connect: { id: req.user.userId },
        },
      },
    });

    // Create questions and options
    if (questions && questions.length > 0) {
      for (const questionData of questions) {
        const question = await prisma.question.create({
          data: {
            content: questionData.content,
            type: questionData.type,
            points: questionData.points,
            order: questionData.order,
            quiz: {
              connect: { id: quiz.id },
            },
          },
        });

        // Create options for the question
        if (questionData.options && questionData.options.length > 0) {
          for (const optionData of questionData.options) {
            await prisma.option.create({
              data: {
                content: optionData.content,
                isCorrect: optionData.isCorrect,
                question: {
                  connect: { id: question.id },
                },
              },
            });
          }
        }
      }
    }

    // Return created quiz
    const createdQuiz = await prisma.quiz.findUnique({
      where: { id: quiz.id },
      include: {
        questions: {
          include: {
            options: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    return sendSuccess(res, createdQuiz, 201);
  } catch (error) {
    console.error('Create quiz error:', error);
    return sendError(res, 'Internal server error', 500);
  }
};

// Get all quizzes
export const getQuizzes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    // Get query parameters
    const published = req.query.published === 'true';
    const creatorId = req.query.creatorId as string;

    // Build filter
    const filter: any = {};
    
    if (req.query.published !== undefined) {
      filter.published = published;
    }
    
    if (creatorId) {
      filter.creatorId = creatorId;
    }

    // Get quizzes
    const quizzes = await prisma.quiz.findMany({
      where: filter,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return sendSuccess(res, quizzes);
  } catch (error) {
    console.error('Get quizzes error:', error);
    return sendError(res, 'Internal server error', 500);
  }
};

// Get quiz by ID
export const getQuizById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const quizId = req.params.id;

    // Get quiz
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            options: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!quiz) {
      return sendError(res, 'Quiz not found', 404);
    }

    // Check if user is creator or quiz is published
    if (quiz.creatorId !== req.user.userId && !quiz.published) {
      return sendError(res, 'Access denied', 403);
    }

    return sendSuccess(res, quiz);
  } catch (error) {
    console.error('Get quiz error:', error);
    return sendError(res, 'Internal server error', 500);
  }
};

// Update quiz
export const updateQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const quizId = req.params.id;
    const { title, description, timeLimit, published } = req.body as UpdateQuizRequest;

    // Check if quiz exists and user is creator
    const existingQuiz = await prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!existingQuiz) {
      return sendError(res, 'Quiz not found', 404);
    }

    if (existingQuiz.creatorId !== req.user.userId) {
      return sendError(res, 'Access denied', 403);
    }

    // Update quiz
    const updatedQuiz = await prisma.quiz.update({
      where: { id: quizId },
      data: {
        title,
        description,
        timeLimit,
        published,
      },
    });

    return sendSuccess(res, updatedQuiz);
  } catch (error) {
    console.error('Update quiz error:', error);
    return sendError(res, 'Internal server error', 500);
  }
};

// Delete quiz
export const deleteQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const quizId = req.params.id;

    // Check if quiz exists and user is creator
    const existingQuiz = await prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!existingQuiz) {
      return sendError(res, 'Quiz not found', 404);
    }

    if (existingQuiz.creatorId !== req.user.userId) {
      return sendError(res, 'Access denied', 403);
    }

    // Delete quiz (cascade will delete questions and options)
    await prisma.quiz.delete({
      where: { id: quizId },
    });

    return sendSuccess(res, null, 204);
  } catch (error) {
    console.error('Delete quiz error:', error);
    return sendError(res, 'Internal server error', 500);
  }
};

// Publish quiz
export const publishQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const quizId = req.params.id;

    // Check if quiz exists and user is creator
    const existingQuiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!existingQuiz) {
      return sendError(res, 'Quiz not found', 404);
    }

    if (existingQuiz.creatorId !== req.user.userId) {
      return sendError(res, 'Access denied', 403);
    }

    // Validate quiz has questions
    if (!existingQuiz.questions || existingQuiz.questions.length === 0) {
      return sendError(res, 'Quiz must have at least one question', 400);
    }

    // Validate each question has options
    for (const question of existingQuiz.questions) {
      if (!question.options || question.options.length === 0) {
        return sendError(res, `Question "${question.content}" must have at least one option`, 400);
      }

      // Validate each question has at least one correct option
      if (question.type !== 'SHORT_ANSWER' && !question.options.some(option => option.isCorrect)) {
        return sendError(res, `Question "${question.content}" must have at least one correct option`, 400);
      }
    }

    // Publish quiz
    const updatedQuiz = await prisma.quiz.update({
      where: { id: quizId },
      data: {
        published: true,
      },
    });

    return sendSuccess(res, updatedQuiz);
  } catch (error) {
    console.error('Publish quiz error:', error);
    return sendError(res, 'Internal server error', 500);
  }
};