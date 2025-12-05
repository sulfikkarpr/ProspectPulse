import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireMentor, requireAdmin } from '../middleware/rbac';
import { getUsers, getMentors, updateUserRole, getPendingUsers, approveUser, deleteUser } from '../controllers/userController';

export const userRoutes = Router();

userRoutes.use(authenticate);
userRoutes.get('/', requireMentor, getUsers);
userRoutes.get('/mentors', getMentors);
userRoutes.get('/pending', requireAdmin, getPendingUsers);
userRoutes.post('/:id/approve', requireAdmin, approveUser);
userRoutes.put('/:id/role', requireAdmin, updateUserRole);
userRoutes.delete('/:id', requireAdmin, deleteUser);

