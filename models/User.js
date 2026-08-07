const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  username: { type: String, default: '' },
  firstName: { type: String, default: '' },
  coins: { type: Number, default: 0 },
  referredBy: { type: String, default: null },
  referralCount: { type: Number, default: 0 },
  completedTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  lastAdWatch: { type: Date, default: null },
  joinedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
