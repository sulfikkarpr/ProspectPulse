import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';
import { pool } from '../db/connection';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
  adminKeyVerified?: boolean;
}

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string; adminKeyVerified?: boolean };

    req.userId = decoded.userId;
    req.userRole = decoded.role;
    req.adminKeyVerified = decoded.adminKeyVerified || false;
    
    // Check if user is approved (except for auth endpoints)
    const userQuery = 'SELECT is_approved FROM users WHERE id = $1';
    const userResult = await pool.query(userQuery, [decoded.userId]);
    
    if (userResult.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    // Allow access to auth endpoints even if not approved
    const isAuthEndpoint = req.path.startsWith('/api/auth/');
    if (!isAuthEndpoint && !userResult.rows[0].is_approved) {
      throw new AppError('User not approved. Please wait for admin approval.', 403);
    }
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', 401));
    } else {
      next(error);
    }
  }
};

export const generateToken = (userId: string, role: string, adminKeyVerified?: boolean): string => {
  return jwt.sign({ userId, role, adminKeyVerified: adminKeyVerified || false }, JWT_SECRET, { expiresIn: '7d' });
};

