import { Router }      from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';
import { listUsers, listAllTasks }  from './admin.controller.js';

export const adminRoutes = Router();

adminRoutes.use(requireAuth, requireRole('admin'));

adminRoutes.get('/users', listUsers);
adminRoutes.get('/tasks', listAllTasks);
