import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { AppError } from './errorHandler';

type Role = 'admin' | 'mentor' | 'member';

export const requireRole = (...allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userRole) {
      return next(new AppError('Unauthorized', 401));
    }

    if (!allowedRoles.includes(req.userRole as Role)) {
      return next(new AppError('Forbidden: Insufficient permissions', 403));
    }

    next();
  };
};

export const requireAdmin = requireRole('admin');
export const requireMentor = requireRole('admin', 'mentor');
export const requireAny = requireRole('admin', 'mentor', 'member');

