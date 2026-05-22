import { UserModel }  from '../users/user.model.js';
import { TaskModel }  from '../tasks/task.model.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

// GET /api/v1/admin/users
export const listUsers = asyncHandler(async (_req, res) => {
  const users = await UserModel.find()
    .select('-passwordHash -passwordSalt')
    .sort({ createdAt: -1 });
  res.json({ success: true, count: users.length, data: { users } });
});

// GET /api/v1/admin/tasks
export const listAllTasks = asyncHandler(async (_req, res) => {
  const tasks = await TaskModel.find()
    .populate('assignedTo', 'name email role')
    .populate('createdBy',  'name email')
    .populate('projectId',  'name')
    .sort({ createdAt: -1 });
  res.json({ success: true, count: tasks.length, data: { tasks } });
});
