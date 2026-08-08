const mongoose = require('mongoose');

const PLATFORMS = [
  'telegram_channel',
  'telegram_bot',
  'discord',
  'youtube',
  'tiktok',
  'facebook',
  'twitter',
  'instagram',
  'website',
];

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    platform: { type: String, enum: PLATFORMS, default: 'website' },
    rewardCoins: { type: Number, default: 1 },
    channelUsername: { type: String, default: null },
    active: { type: Boolean, default: true },
    createdBy: { type: String, default: 'owner' },

    // ==== user-submitted paid tasks ====
    source: { type: String, enum: ['admin', 'user'], default: 'admin' },
    sponsorTelegramId: { type: String, default: null },
    paymentStatus: { type: String, enum: ['none', 'pending', 'confirmed', 'rejected'], default: 'none' },
    maxCompletions: { type: Number, default: null }, // null = unlimited
    completionsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

taskSchema.statics.PLATFORMS = PLATFORMS;

module.exports = mongoose.model('Task', taskSchema);
