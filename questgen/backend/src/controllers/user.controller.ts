import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { getPrismaClient } from '../utils/db.util';
import { sendSuccess, sendError, sendValidationError } from '../utils/response.util';
import { validateRequired, isValidEmail, isStrongPassword } from '../utils/validation.util';

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
interface UpdateProfileRequest {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

// Get user profile
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(res, user);
  } catch (error) {
    console.error('Get profile error:', error);
    return sendError(res, 'Internal server error', 500);
  }
};

// Update user profile
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const { name, email, currentPassword, newPassword } = req.body as UpdateProfileRequest;

    // Get current user data
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Validate email format if provided
    if (email && !isValidEmail(email)) {
      return sendValidationError(res, 'Invalid email format');
    }
    
    // Check if email is being changed and if it's already in use
    if (email && email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return sendError(res, 'Email already in use', 400);
      }
    }
    
    // Validate password strength if provided
    if (newPassword && !isStrongPassword(newPassword)) {
      return sendValidationError(res, 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character');
    }

    // Prepare update data
    const updateData: any = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;

    // Handle password change if requested
    if (currentPassword && newPassword) {
      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

      if (!isPasswordValid) {
        return sendError(res, 'Current password is incorrect', 400);
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return sendSuccess(res, updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    return sendError(res, 'Internal server error', 500);
  }
};

// Get user statistics
export const getUserStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    // Get quiz count
    const quizCount = await prisma.quiz.count({
      where: { creatorId: req.user.userId },
    });

    // Get participation count
    const participationCount = await prisma.participation.count({
      where: { userId: req.user.userId },
    });

    // Get average score
    const participations = await prisma.participation.findMany({
      where: {
        userId: req.user.userId,
        completedAt: { not: null },
      },
      select: { score: true },
    });

    const averageScore = participations.length > 0
      ? participations.reduce((sum, p) => sum + p.score, 0) / participations.length
      : 0;

    // Get recent participations
    const recentParticipations = await prisma.participation.findMany({
      where: { userId: req.user.userId },
      orderBy: { startedAt: 'desc' },
      take: 5,
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            creatorId: true,
            creator: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return sendSuccess(res, {
      quizCount,
      participationCount,
      averageScore,
      recentParticipations,
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    return sendError(res, 'Internal server error', 500);
  }
};