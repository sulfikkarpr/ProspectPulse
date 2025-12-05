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

// Admin access: either has admin role OR has verified admin key
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.userRole) {
    return next(new AppError('Unauthorized', 401));
  }

  // Allow if user is admin OR has verified admin key
  if (req.userRole === 'admin' || req.adminKeyVerified) {
    return next();
  }

  return next(new AppError('Forbidden: Admin access required', 403));
};

export const requireMentor = requireRole('admin', 'mentor');
export const requireAny = requireRole('admin', 'mentor', 'member');

