const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    telegramId: { type: String, required: true, unique: true, index: true },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    username: { type: String, default: '' },
    photoUrl: { type: String, default: '' },
    language: { type: String, default: null }, // null = not chosen yet
    coins: { type: Number, default: 0 },
    energy: { type: Number, default: 100 },
    referredBy: { type: String, default: null },
    referralCount: { type: Number, default: 0 },
    lastAdWatchAt: { type: Date, default: null },
    isFake: { type: Boolean, default: false }, // seeded leaderboard-only users
    isBlocked: { type: Boolean, default: false },
    awaitingAnnouncement: { type: Boolean, default: false }, // admin flow state
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
