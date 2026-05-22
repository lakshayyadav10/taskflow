import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireProjectMember, requireProjectAdmin } from '../../middleware/projectRole.middleware.js';
import {
  listTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  assignTask,
} from './task.controller.js';

// mergeParams allows access to :projectId from the parent router
export const taskRoutes = Router({ mergeParams: true });

taskRoutes.use(requireAuth);
taskRoutes.use(requireProjectMember); // every task route requires project membership

taskRoutes.get('/',    listTasks);
taskRoutes.post('/',   requireProjectAdmin, createTask);   // only admins can create
taskRoutes.get('/:id', getTask);
taskRoutes.put('/:id', updateTask);                        // role checked in controller
taskRoutes.delete('/:id', requireProjectAdmin, deleteTask);
taskRoutes.patch('/:id/assign', requireProjectAdmin, assignTask);
