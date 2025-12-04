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

    const query = 'SELECT id, name, email, role, created_at FROM users ORDER BY name';
    const result = await pool.query(query);
    res.json(result.rows);
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

    // Only admins can update roles
    if (req.userRole !== 'admin') {
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
