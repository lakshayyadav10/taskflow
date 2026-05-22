import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '', maxlength: 2000 },
    priority: {
      type:    String,
      enum:    ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type:    String,
      enum:    ['todo', 'in_progress', 'done'],
      default: 'todo',
    },
    dueDate: { type: Date, default: null },
    projectId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Project',
      required: true,
    },
    createdBy: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    assignedTo: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     'User',
      default: null,
    },
  },
  { timestamps: true }
);

// Compound indexes for fast queries
taskSchema.index({ projectId: 1, status: 1 });
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ dueDate: 1, status: 1 });

export const TaskModel = mongoose.model('Task', taskSchema);
