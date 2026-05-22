import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireProjectAdmin } from '../../middleware/projectRole.middleware.js';
import {
  listProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} from './project.controller.js';

export const projectRoutes = Router();

projectRoutes.use(requireAuth);

projectRoutes.get('/',                                       listProjects);
projectRoutes.post('/',                                      createProject);
projectRoutes.get('/:id',                                    getProject);
projectRoutes.put('/:id',         requireProjectAdmin,       updateProject);
projectRoutes.delete('/:id',      requireProjectAdmin,       deleteProject);
projectRoutes.post('/:id/members',     requireProjectAdmin,  addMember);
projectRoutes.delete('/:id/members/:userId', requireProjectAdmin, removeMember);
