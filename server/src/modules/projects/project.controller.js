import { z }            from 'zod';
import { ProjectModel } from './project.model.js';
import { UserModel }    from '../users/user.model.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError }     from '../../utils/apiError.js';

const createSchema = z.object({
  name:        z.string().min(2).max(100),
  description: z.string().max(500).optional().default(''),
});

const updateSchema = createSchema.partial();

const addMemberSchema = z.object({
  userId: z.string().length(24),
  role:   z.enum(['admin', 'member']).optional().default('member'),
});

// GET /api/v1/projects
export const listProjects = asyncHandler(async (req, res) => {
  const projects = await ProjectModel.find({ 'members.user': req.user._id })
    .populate('createdBy', 'name email')
    .populate('members.user', 'name email')
    .sort({ createdAt: -1 });
  res.json({ projects });
});

// POST /api/v1/projects
export const createProject = asyncHandler(async (req, res) => {
  const data = createSchema.parse(req.body);
  const project = await ProjectModel.create({
    ...data,
    createdBy: req.user._id,
    members:   [{ user: req.user._id, role: 'admin' }], // creator is always admin
  });
  await project.populate([
    { path: 'createdBy', select: 'name email' },
    { path: 'members.user', select: 'name email' },
  ]);
  res.status(201).json({ message: 'Project created', project });
});

// GET /api/v1/projects/:id
export const getProject = asyncHandler(async (req, res) => {
  const project = await ProjectModel.findById(req.params.id)
    .populate('createdBy', 'name email')
    .populate('members.user', 'name email');
  if (!project) throw new ApiError(404, 'Project not found');

  const isMember = project.members.some(
    (m) => m.user._id.toString() === req.user._id.toString()
  );
  if (!isMember) throw new ApiError(403, 'Access denied');

  res.json({ project });
});

// PUT /api/v1/projects/:id  (project admin only — guarded by middleware)
export const updateProject = asyncHandler(async (req, res) => {
  const data    = updateSchema.parse(req.body);
  const project = await ProjectModel.findByIdAndUpdate(req.params.id, data, { new: true })
    .populate('members.user', 'name email');
  if (!project) throw new ApiError(404, 'Project not found');
  res.json({ message: 'Project updated', project });
});

// DELETE /api/v1/projects/:id  (project admin only)
export const deleteProject = asyncHandler(async (req, res) => {
  await ProjectModel.findByIdAndDelete(req.params.id);
  res.json({ message: 'Project deleted' });
});

// POST /api/v1/projects/:id/members  (project admin only)
export const addMember = asyncHandler(async (req, res) => {
  const { userId, role } = addMemberSchema.parse(req.body);

  const user = await UserModel.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');

  const project = await ProjectModel.findById(req.params.id);
  if (!project) throw new ApiError(404, 'Project not found');

  const already = project.members.some((m) => m.user.toString() === userId);
  if (already) throw new ApiError(409, 'User is already a member');

  project.members.push({ user: userId, role });
  await project.save();
  await project.populate('members.user', 'name email');

  res.status(201).json({ message: 'Member added', project });
});

// DELETE /api/v1/projects/:id/members/:userId  (project admin only)
export const removeMember = asyncHandler(async (req, res) => {
  const project = await ProjectModel.findById(req.params.id);
  if (!project) throw new ApiError(404, 'Project not found');

  const remaining = project.members.filter(
    (m) => m.user.toString() !== req.params.userId
  );
  const stillHasAdmin = remaining.some((m) => m.role === 'admin');
  if (!stillHasAdmin) throw new ApiError(400, 'Cannot remove the last admin');

  project.members = remaining;
  await project.save();
  res.json({ message: 'Member removed', project });
});
