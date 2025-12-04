import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createPreTalk,
  getPreTalks,
  getPreTalkById,
  updatePreTalk,
  completePreTalk,
} from '../controllers/preTalkController';

export const preTalkRoutes = Router();

preTalkRoutes.use(authenticate);

preTalkRoutes.post('/', createPreTalk);
preTalkRoutes.get('/', getPreTalks);
preTalkRoutes.get('/:id', getPreTalkById);
preTalkRoutes.put('/:id', updatePreTalk);
preTalkRoutes.post('/:id/complete', completePreTalk);

