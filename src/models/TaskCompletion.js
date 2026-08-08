const mongoose = require('mongoose');

const taskCompletionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    status: {
      type: String,
      enum: ['started', 'pending_verification', 'completed'],
      default: 'started',
    },
    submittedUsername: { type: String, default: null }, // username the user submitted for manual review
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

taskCompletionSchema.index({ userId: 1, taskId: 1 }, { unique: true });

module.exports = mongoose.model('TaskCompletion', taskCompletionSchema);
