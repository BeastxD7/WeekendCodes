import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { getToken } from "next-auth/jwt";
dotenv.config();


// Extend Express' Request to add a `user` property
export interface AuthenticatedRequest extends Request {
  user?: string | JwtPayload;
}



export const authMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  console.log("auth middleware called");

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return res.status(401).json({ message: 'No valid token found' });
  }

  console.log("Decoded token:", token);
  req.user = token;
  next();
};

