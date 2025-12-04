import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireMentor, requireAdmin } from '../middleware/rbac';
import { getUsers, getMentors, updateUserRole } from '../controllers/userController';

export const userRoutes = Router();

userRoutes.use(authenticate);
userRoutes.get('/', requireMentor, getUsers);
userRoutes.get('/mentors', getMentors);
userRoutes.put('/:id/role', requireAdmin, updateUserRole);

