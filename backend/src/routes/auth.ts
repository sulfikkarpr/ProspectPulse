import { Router } from 'express';
import { getAuthUrlHandler, callbackHandler, getMeHandler } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

export const authRoutes = Router();

authRoutes.get('/url', getAuthUrlHandler);
authRoutes.get('/callback', callbackHandler);
authRoutes.get('/me', authenticate, getMeHandler);

