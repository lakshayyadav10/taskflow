import { ProjectModel } from '../modules/projects/project.model.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Requires the caller to be a member of the project (any role).
// Attaches req.project and req.projectRole ('admin' | 'member').
export const requireProjectMember = asyncHandler(async (req, _res, next) => {
  const projectId = req.params.projectId || req.params.id;
  const project = await ProjectModel.findById(projectId).populate('members.user', 'name email');
  if (!project) throw new ApiError(404, 'Project not found');

  const membership = project.members.find(
    (m) => m.user._id.toString() === req.user._id.toString()
  );
  if (!membership) throw new ApiError(403, 'You are not a member of this project');

  req.project     = project;
  req.projectRole = membership.role; // 'admin' or 'member'
  next();
});

// Requires the caller to be an admin of the project.
export const requireProjectAdmin = asyncHandler(async (req, _res, next) => {
  const projectId = req.params.projectId || req.params.id;
  const project = await ProjectModel.findById(projectId).populate('members.user', 'name email');
  if (!project) throw new ApiError(404, 'Project not found');

  const membership = project.members.find(
    (m) => m.user._id.toString() === req.user._id.toString()
  );
  if (!membership || membership.role !== 'admin') {
    throw new ApiError(403, 'Project admin access required');
  }

  req.project     = project;
  req.projectRole = 'admin';
  next();
});
