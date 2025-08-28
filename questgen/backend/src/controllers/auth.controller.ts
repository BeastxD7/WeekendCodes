import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getPrismaClient } from '../utils/db.util';
import { sendSuccess, sendError, sendValidationError } from '../utils/response.util';
import { isValidEmail, isStrongPassword, validateRequired } from '../utils/validation.util';
import { env } from '../config/env.config';
import { UserRole,User } from '@prisma/client';
import dotenv from 'dotenv'

dotenv.config()

const prisma = getPrismaClient();

// Define interfaces for request bodies
interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RefreshTokenRequest {
  refreshToken: string;
}

// Define interfaces for responses
interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthResponse {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
}

interface TokenResponse {
  accessToken: string;
}

// Register a new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, role = 'USER' } = req.body as RegisterRequest;

    // Validate required fields
    const requiredErrors = validateRequired({ email, password, name }, ['email', 'password', 'name']);
    if (Object.keys(requiredErrors).length > 0) {
      sendValidationError(res, requiredErrors);
      return;
    }

    // Validate email format
    if (!isValidEmail(email)) {
      sendValidationError(res, { email: 'Invalid email format' });
      return;
    }

    // Validate password strength
    if (!isStrongPassword(password)) {
      sendValidationError(res, { 
        password: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number' 
      });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      sendError(res, 'User already exists', 400);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Update user with refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    // Return user data and tokens
    const userResponse: UserResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    sendSuccess(res, {
      user: userResponse,
      accessToken,
      refreshToken,
    } as AuthResponse, 'User registered successfully', 201);
  } catch (error) {
    console.error('Registration error:', error);
    sendError(res, 'Internal server error', 500, error as Error);
  }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as LoginRequest;

    // Validate required fields
    const requiredErrors = validateRequired({ email, password }, ['email', 'password']);
    if (Object.keys(requiredErrors).length > 0) {
      sendValidationError(res, requiredErrors);
      return;
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      sendError(res, 'Invalid credentials', 401);
      return;
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      sendError(res, 'Invalid credentials', 401);
      return;
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Update user with refresh token
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    // Return user data and tokens
    const userResponse: UserResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    sendSuccess(res, {
      user: userResponse,
      accessToken,
      refreshToken,
    } as AuthResponse);
  } catch (error) {
    console.error('Login error:', error);
    sendError(res, 'Internal server error', 500, error as Error);
  }
};

// Refresh token
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken: token } = req.body as RefreshTokenRequest;

    if (!token) {
      sendError(res, 'Refresh token is required', 401);
      return;
    }

    // Find user with refresh token
    const user = await prisma.user.findFirst({
      where: { refreshToken: token },
    });

    if (!user) {
      sendError(res, 'Invalid refresh token', 403);
      return;
    }

    // Verify refresh token
    try {
      jwt.verify(token, env.jwtRefreshSecret);
    } catch (error) {
      sendError(res, 'Invalid refresh token', 403);
      return;
    }

    // Generate new access token
    const accessToken = generateAccessToken(user);

    sendSuccess(res, { accessToken } as TokenResponse, 'Token refreshed successfully');
  } catch (error) {
    console.error('Refresh token error:', error);
    sendError(res, 'Internal server error', 500, error as Error);
  }
};

// Logout user
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body as RefreshTokenRequest;

    if (!refreshToken) {
      sendError(res, 'Refresh token is required', 400);
      return;
    }

    // Find user with refresh token
    const user = await prisma.user.findFirst({
      where: { refreshToken },
    });

    if (user) {
      // Clear refresh token
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: null },
      });
    }

    sendSuccess(res, null, 'Logged out successfully');
  } catch (error) {
    console.error('Logout error:', error);
    sendError(res, 'Internal server error', 500, error as Error);
  }
};

// Helper functions
const generateAccessToken = (user: User): Promise<string> => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn as string | number },
      (err, token) => {
        if (err || !token) reject(err);
        else resolve(token);
      }
    );
  });
};

const generateRefreshToken = async (user: User): Promise<string> => { 
  const token = await jwt.sign({ userId: user.id }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn,
  });
  return token;
};
