import mongoose       from 'mongoose';
import { TaskModel }  from '../tasks/task.model.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

// GET /api/v1/dashboard
// Optional query: ?projectId=<id>  to scope to a single project
export const getDashboard = asyncHandler(async (req, res) => {
  const { projectId } = req.query;

  const baseMatch = {};
  if (projectId) {
    baseMatch.projectId = new mongoose.Types.ObjectId(projectId);
  }

  const now = new Date();

  const [statusAgg, userAgg, overdueList, total] = await Promise.all([
    // Tasks by status
    TaskModel.aggregate([
      { $match: baseMatch },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    // Tasks per user (only assigned)
    TaskModel.aggregate([
      { $match: { ...baseMatch, assignedTo: { $ne: null } } },
      { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
      {
        $lookup: {
          from: 'users', localField: '_id', foreignField: '_id', as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0, userId: '$_id',
          name: '$user.name', email: '$user.email',
          taskCount: '$count',
        },
      },
      { $sort: { taskCount: -1 } },
    ]),

    // Overdue tasks (past dueDate, not done)
    TaskModel.find({
      ...baseMatch,
      dueDate: { $lt: now, $ne: null },
      status:  { $ne: 'done' },
    })
      .populate('assignedTo', 'name email')
      .sort({ dueDate: 1 })
      .limit(50),

    // Total count
    TaskModel.countDocuments(baseMatch),
  ]);

  // Normalise status array → flat object
  const byStatus = { todo: 0, in_progress: 0, done: 0 };
  statusAgg.forEach(({ _id, count }) => { byStatus[_id] = count; });

  res.json({
    total,
    byStatus,
    byUser: userAgg,
    overdue: { count: overdueList.length, tasks: overdueList },
  });
});
