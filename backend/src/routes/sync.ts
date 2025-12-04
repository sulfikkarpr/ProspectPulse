import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { syncSheets, getSyncStatus } from '../controllers/syncController';

export const syncRoutes = Router();

syncRoutes.use(authenticate);
syncRoutes.post('/sheets', syncSheets);
syncRoutes.get('/status', getSyncStatus);

