import { Request, Response } from 'express';
import { Participation, Question, Quiz, Answer, Option, QuestionType } from '@prisma/client';
import { getPrismaClient } from '../utils/db.util';
import { sendSuccess, sendError } from '../utils/response.util';

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
interface StartParticipationRequest {
  quizId: string;
}

interface SubmitAnswerRequest {
  questionId: string;
  optionId?: string;
  textAnswer?: string;
}

// Define interfaces for responses
interface QuestionWithOptions extends Question {
  options: Option[];
}

interface ParticipationWithDetails extends Participation {
  quiz: Quiz;
  answers: Answer[];
}

interface QuestionResult {
  questionId: string;
  content: string;
  type: QuestionType;
  points: number;
  userAnswer: {
    optionId?: string;
    textAnswer?: string;
    isCorrect: boolean;
  };
  correctOptions?: Option[];
}

interface ParticipationResult {
  id: string;
  startedAt: Date;
  completedAt: Date;
  score: number;
  totalPoints: number;
  percentageScore: number;
  questions: QuestionResult[];
}

// Start a new participation
export const startParticipation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const { quizId } = req.body as StartParticipationRequest;

    // Check if quiz exists and is published
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      return sendError(res, 'Quiz not found', 404);
    }

    if (!quiz.published) {
      return sendError(res, 'Quiz is not published', 400);
    }

    // Check if user already has an active participation for this quiz
    const activeParticipation = await prisma.participation.findFirst({
      where: {
        quizId,
        userId: req.user.userId,
        completedAt: null,
      },
    });

    if (activeParticipation) {
      return sendError(res, {
        message: 'You already have an active participation for this quiz',
        participationId: activeParticipation.id,
      }, 400);
    }

    // Create participation
    const participation = await prisma.participation.create({
      data: {
        quiz: {
          connect: { id: quizId },
        },
        user: {
          connect: { id: req.user.userId },
        },
      },
      include: {
        quiz: {
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
        },
      },
    });

    // Return first question
    const firstQuestion = participation.quiz.questions[0];

    // Remove correct answer information
    const sanitizedQuestion = {
      ...firstQuestion,
      options: firstQuestion.options.map(option => ({
        id: option.id,
        content: option.content,
        questionId: option.questionId,
      })),
    };

    return sendSuccess(res, {
      participationId: participation.id,
      quizTitle: participation.quiz.title,
      timeLimit: participation.quiz.timeLimit,
      startedAt: participation.startedAt,
      currentQuestion: sanitizedQuestion,
      totalQuestions: participation.quiz.questions.length,
    }, 201);
  } catch (error) {
    console.error('Start participation error:', error);
    return sendError(res, 'Internal server error', 500);
  }
};

// Submit answer for a question
export const submitAnswer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const participationId = req.params.id;
    const { questionId, optionId, textAnswer } = req.body as SubmitAnswerRequest;

    // Check if participation exists and belongs to user
    const participation = await prisma.participation.findUnique({
      where: { id: participationId },
      include: {
        quiz: {
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
        },
        answers: true,
      },
    });

    if (!participation) {
      return sendError(res, 'Participation not found', 404);
    }

    if (participation.userId !== req.user.userId) {
      return sendError(res, 'Access denied', 403);
    }

    if (participation.completedAt) {
      return sendError(res, 'Participation already completed', 400);
    }

    // Check if question exists in quiz
    const question = participation.quiz.questions.find(q => q.id === questionId);

    if (!question) {
      return sendError(res, 'Question not found in this quiz', 404);
    }

    // Check if answer already exists for this question
    const existingAnswer = participation.answers.find(a => a.questionId === questionId);

    if (existingAnswer) {
      return sendError(res, 'Answer already submitted for this question', 400);
    }

    // Determine if answer is correct
    let isCorrect = false;

    if (question.type === 'SHORT_ANSWER') {
      // For short answer questions, we would need some logic to determine correctness
      // This could be exact match, case-insensitive match, or more complex NLP
      // For now, we'll just store the answer without marking it correct/incorrect
      isCorrect = false; // Default to false instead of null for type safety
    } else {
      // For multiple choice questions
      if (!optionId) {
        return sendError(res, 'Option ID is required for this question type', 400);
      }

      // Check if option exists in question
      const option = question.options.find(o => o.id === optionId);

      if (!option) {
        return sendError(res, 'Option not found in this question', 404);
      }

      isCorrect = option.isCorrect;
    }

    // Create answer
    const answer = await prisma.answer.create({
      data: {
        question: {
          connect: { id: questionId },
        },
        participation: {
          connect: { id: participationId },
        },
        selectedOption: optionId
          ? {
              connect: { id: optionId },
            }
          : undefined,
        textAnswer,
        isCorrect,
      },
    });

    // Find next question
    const currentQuestionIndex = participation.quiz.questions.findIndex(q => q.id === questionId);
    const nextQuestion = participation.quiz.questions[currentQuestionIndex + 1];

    if (nextQuestion) {
      // Return next question
      const sanitizedQuestion = {
        ...nextQuestion,
        options: nextQuestion.options.map(option => ({
          id: option.id,
          content: option.content,
          questionId: option.questionId,
        })),
      };

      return sendSuccess(res, {
        answerId: answer.id,
        isCorrect,
        nextQuestion: sanitizedQuestion,
        questionNumber: currentQuestionIndex + 2,
        totalQuestions: participation.quiz.questions.length,
      });
    } else {
      // No more questions, return completion status
      return sendSuccess(res, {
        answerId: answer.id,
        isCorrect,
        isLastQuestion: true,
      });
    }
  } catch (error) {
    console.error('Submit answer error:', error);
    return sendError(res, 'Internal server error', 500);
  }
};

// Complete participation
export const completeParticipation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const participationId = req.params.id;

    // Check if participation exists and belongs to user
    const participation = await prisma.participation.findUnique({
      where: { id: participationId },
      include: {
        quiz: {
          include: {
            questions: true,
          },
        },
        answers: true,
      },
    });

    if (!participation) {
      return sendError(res, 'Participation not found', 404);
    }

    if (participation.userId !== req.user.userId) {
      return sendError(res, 'Access denied', 403);
    }

    if (participation.completedAt) {
      return sendError(res, 'Participation already completed', 400);
    }

    // Calculate score
    const correctAnswers = participation.answers.filter(a => a.isCorrect);
    const totalPoints = participation.quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const earnedPoints = correctAnswers.reduce((sum, a) => {
      const question = participation.quiz.questions.find(q => q.id === a.questionId);
      return sum + (question ? question.points : 0);
    }, 0);

    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

    // Update participation
    const completedParticipation = await prisma.participation.update({
      where: { id: participationId },
      data: {
        completedAt: new Date(),
        score,
      },
    });

    return sendSuccess(res, {
      participationId: completedParticipation.id,
      completedAt: completedParticipation.completedAt,
      score: completedParticipation.score,
    });
  } catch (error) {
    console.error('Complete participation error:', error);
    return sendError(res, 'Internal server error', 500);
  }
};

// Get participation results
export const getResults = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const participationId = req.params.id;

    // Check if participation exists and belongs to user
    const participation = await prisma.participation.findUnique({
      where: { id: participationId },
      include: {
        quiz: {
          include: {
            questions: {
              include: {
                options: true,
              },
            },
          },
        },
        answers: {
          include: {
            selectedOption: true,
            question: true,
          },
        },
      },
    });

    if (!participation) {
      return sendError(res, 'Participation not found', 404);
    }

    if (participation.userId !== req.user.userId) {
      return sendError(res, 'Access denied', 403);
    }

    if (!participation.completedAt) {
      return sendError(res, 'Participation not completed yet', 400);
    }

    // Calculate total points
    const totalPoints = participation.quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const percentageScore = totalPoints > 0 ? (participation.score / 100) * totalPoints : 0;

    // Prepare question results
    const questionResults: QuestionResult[] = participation.quiz.questions.map(question => {
      const answer = participation.answers.find(a => a.questionId === question.id);
      const correctOptions = question.options.filter(o => o.isCorrect);

      return {
        questionId: question.id,
        content: question.content,
        type: question.type,
        points: question.points,
        userAnswer: {
          optionId: answer?.optionId || undefined,
          textAnswer: answer?.textAnswer || undefined,
          isCorrect: answer?.isCorrect || false,
        },
        correctOptions: question.type !== 'SHORT_ANSWER' ? correctOptions : undefined,
      };
    });

    // Prepare result
    const result: ParticipationResult = {
      id: participation.id,
      startedAt: participation.startedAt,
      completedAt: participation.completedAt,
      score: participation.score,
      totalPoints,
      percentageScore,
      questions: questionResults,
    };

    return sendSuccess(res, result);
  } catch (error) {
    console.error('Get results error:', error);
    return sendError(res, 'Internal server error', 500);
  }
};