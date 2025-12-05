import { Response, NextFunction } from 'express';
import { pool } from '../db/connection';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

const updateUserRoleSchema = z.object({
  role: z.enum(['admin', 'mentor', 'member']),
});

export const getUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      return next(new AppError('Unauthorized', 401));
    }

    // Check if user is approved
    const userCheckQuery = 'SELECT is_approved FROM users WHERE id = $1';
    const userCheckResult = await pool.query(userCheckQuery, [req.userId]);
    
    if (userCheckResult.rows.length === 0 || !userCheckResult.rows[0].is_approved) {
      return next(new AppError('User not approved', 403));
    }

    const query = 'SELECT id, name, email, role, is_approved, created_at FROM users ORDER BY name';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

export const getPendingUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      return next(new AppError('Unauthorized', 401));
    }

    // Only admins (or users with verified admin key) can see pending users
    if (req.userRole !== 'admin' && !req.adminKeyVerified) {
      return next(new AppError('Forbidden: Only admins can view pending users', 403));
    }

    const query = `
      SELECT id, name, email, avatar_url, role, is_approved, created_at 
      FROM users 
      WHERE is_approved = false 
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

export const approveUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      return next(new AppError('Unauthorized', 401));
    }

    // Only admins (or users with verified admin key) can approve users
    if (req.userRole !== 'admin' && !req.adminKeyVerified) {
      return next(new AppError('Forbidden: Only admins can approve users', 403));
    }

    const { id } = req.params;

    // Check if user exists
    const checkQuery = 'SELECT * FROM users WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return next(new AppError('User not found', 404));
    }

    // Approve user
    const updateQuery = `
      UPDATE users 
      SET is_approved = true, updated_at = NOW()
      WHERE id = $1
      RETURNING id, name, email, role, is_approved, created_at
    `;

    const result = await pool.query(updateQuery, [id]);

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const getMentors = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      return next(new AppError('Unauthorized', 401));
    }

    const query = `
      SELECT id, name, email, role 
      FROM users 
      WHERE role IN ('admin', 'mentor')
      ORDER BY name
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      return next(new AppError('Unauthorized', 401));
    }

    // Only admins (or users with verified admin key) can update roles
    if (req.userRole !== 'admin' && !req.adminKeyVerified) {
      return next(new AppError('Forbidden: Only admins can update user roles', 403));
    }

    const { id } = req.params;
    const validated = updateUserRoleSchema.parse(req.body);

    // Check if user exists
    const checkQuery = 'SELECT * FROM users WHERE id = $1';
    const checkResult = await pool.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return next(new AppError('User not found', 404));
    }

    // Update user role
    const updateQuery = `
      UPDATE users 
      SET role = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, name, email, role, created_at
    `;

    const result = await pool.query(updateQuery, [validated.role, id]);

    res.json(result.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
};
