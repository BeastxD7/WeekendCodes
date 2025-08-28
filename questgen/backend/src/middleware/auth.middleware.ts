import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.config';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

// Extend Express Request interface to include user information
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: UserRole;
      };
    }
  }
}

// Interface for JWT payload
interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

// Middleware to authenticate JWT token
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'Authentication token is required' });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;

    // Add user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to check if user is admin
export const isAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.user && req.user.role === UserRole.ADMIN) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admin role required' });
  }
};

// Middleware to check if user is the owner of a resource
export const isResourceOwner = (resourceField: string) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      const resourceId = req.params.id;
      const userId = req.user.userId;

      // Check if user is admin (admins can access any resource)
      if (req.user.role === UserRole.ADMIN) {
        next();
        return;
      }

      // Get the resource type from the request path
      const path = req.path.split('/')[1]; // e.g., /quizzes/123 -> quizzes
      let resource;

      // Check ownership based on resource type
      switch (path) {
        case 'quizzes':
          resource = await prisma.quiz.findUnique({
            where: { id: resourceId },
          });
          break;
        // Add other resource types as needed
        default:
          res.status(404).json({ message: 'Resource not found' });
          return;
      }

      if (!resource) {
        res.status(404).json({ message: 'Resource not found' });
        return;
      }

      // Check if user is the owner
      if ((resource as any)[resourceField] === userId) {
        next();
      } else {
        res.status(403).json({ message: 'Access denied: Not the resource owner' });
      }
    } catch (error) {
      console.error('Resource ownership check error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
};