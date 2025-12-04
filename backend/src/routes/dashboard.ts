import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getDailyStats,
  getWeeklyStats,
  getMonthlyStats,
} from '../controllers/dashboardController';

export const dashboardRoutes = Router();

dashboardRoutes.use(authenticate);

dashboardRoutes.get('/daily', getDailyStats);
dashboardRoutes.get('/weekly', getWeeklyStats);
dashboardRoutes.get('/monthly', getMonthlyStats);

