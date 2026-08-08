const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    telegramId: { type: String, required: true, unique: true, index: true },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    username: { type: String, default: '' },
    photoUrl: { type: String, default: '' },
    language: { type: String, default: null },
    coins: { type: Number, default: 0 },
    energy: { type: Number, default: 100 },
    referredBy: { type: String, default: null },
    referralCount: { type: Number, default: 0 },
    completedTasksCount: { type: Number, default: 0 },
    lastAdWatchAt: { type: Date, default: null },
    lastCheckInAt: { type: Date, default: null },
    checkInStreak: { type: Number, default: 0 },
    claimedAchievements: { type: [String], default: [] },
    // weekly leaderboard bucket - reset lazily when the ISO week changes
    weeklyCoins: { type: Number, default: 0 },
    weeklyWeekKey: { type: String, default: null },
    isFake: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    awaitingAnnouncement: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
