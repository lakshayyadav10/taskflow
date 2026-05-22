import { z }          from 'zod';
import { TaskModel }  from './task.model.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError }   from '../../utils/apiError.js';

const createSchema = z.object({
  title:       z.string().min(1).max(200),
  description: z.string().max(2000).optional().default(''),
  priority:    z.enum(['low', 'medium', 'high']).optional().default('medium'),
  status:      z.enum(['todo', 'in_progress', 'done']).optional().default('todo'),
  dueDate:     z.string().datetime({ offset: true }).optional().nullable(),
  assignedTo:  z.string().length(24).optional().nullable(),
});

const updateSchema = createSchema.partial();

// GET /api/v1/projects/:projectId/tasks
export const listTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const isAdmin = req.projectRole === 'admin';

  // Admins see all; members only see tasks assigned to them
  const filter = { projectId };
  if (!isAdmin) filter.assignedTo = req.user._id;

  const tasks = await TaskModel.find(filter)
    .populate('assignedTo', 'name email')
    .populate('createdBy',  'name email')
    .sort({ dueDate: 1, createdAt: -1 });

  res.json({ tasks });
});

// POST /api/v1/projects/:projectId/tasks  (project admin only)
export const createTask = asyncHandler(async (req, res) => {
  const data = createSchema.parse(req.body);
  const task = await TaskModel.create({
    ...data,
    projectId: req.params.projectId,
    createdBy: req.user._id,
  });
  await task.populate(['assignedTo', 'createdBy']);
  res.status(201).json({ message: 'Task created', task });
});

// GET /api/v1/projects/:projectId/tasks/:id
export const getTask = asyncHandler(async (req, res) => {
  const task = await TaskModel.findOne({
    _id:       req.params.id,
    projectId: req.params.projectId,
  })
    .populate('assignedTo', 'name email')
    .populate('createdBy',  'name email');

  if (!task) throw new ApiError(404, 'Task not found');

  // Members can only view tasks assigned to them
  if (
    req.projectRole === 'member' &&
    task.assignedTo?._id.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, 'Access denied');
  }

  res.json({ task });
});

// PUT /api/v1/projects/:projectId/tasks/:id
export const updateTask = asyncHandler(async (req, res) => {
  const task = await TaskModel.findOne({
    _id:       req.params.id,
    projectId: req.params.projectId,
  });
  if (!task) throw new ApiError(404, 'Task not found');

  const isAdmin = req.projectRole === 'admin';

  if (!isAdmin) {
    // Members can ONLY update status on tasks assigned to them
    if (task.assignedTo?.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'Access denied');
    }
    const { status } = z.object({ status: z.enum(['todo', 'in_progress', 'done']) }).parse(req.body);
    task.status = status;
    await task.save();
    return res.json({ message: 'Status updated', task });
  }

  // Admins can update everything
  const data = updateSchema.parse(req.body);
  Object.assign(task, data);
  await task.save();
  await task.populate(['assignedTo', 'createdBy']);
  res.json({ message: 'Task updated', task });
});

// DELETE /api/v1/projects/:projectId/tasks/:id  (project admin only)
export const deleteTask = asyncHandler(async (req, res) => {
  const task = await TaskModel.findOneAndDelete({
    _id:       req.params.id,
    projectId: req.params.projectId,
  });
  if (!task) throw new ApiError(404, 'Task not found');
  res.json({ message: 'Task deleted' });
});

// PATCH /api/v1/projects/:projectId/tasks/:id/assign  (project admin only)
export const assignTask = asyncHandler(async (req, res) => {
  const { userId } = z.object({ userId: z.string().length(24).nullable() }).parse(req.body);

  if (userId) {
    const isMember = req.project.members.some((m) => m.user._id.toString() === userId);
    if (!isMember) throw new ApiError(400, 'User is not a project member');
  }

  const task = await TaskModel.findOneAndUpdate(
    { _id: req.params.id, projectId: req.params.projectId },
    { assignedTo: userId || null },
    { new: true }
  ).populate('assignedTo', 'name email');

  if (!task) throw new ApiError(404, 'Task not found');
  res.json({ message: 'Task assigned', task });
});
