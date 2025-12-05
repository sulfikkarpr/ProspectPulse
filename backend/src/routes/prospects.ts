import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createProspect,
  getProspects,
  getProspectById,
  updateProspect,
  deleteProspect,
} from '../controllers/prospectController';

export const prospectRoutes = Router();

prospectRoutes.use(authenticate);

prospectRoutes.post('/', createProspect);
prospectRoutes.get('/', getProspects);
prospectRoutes.get('/:id', getProspectById);
prospectRoutes.put('/:id', updateProspect);
prospectRoutes.delete('/:id', deleteProspect);

