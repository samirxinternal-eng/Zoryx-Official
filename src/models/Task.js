const mongoose = require('mongoose');

// platform decides which logo/icon shows in the Mini App
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
    rewardCoins: { type: Number, default: 10 },
    // channelUsername is auto-extracted from url when platform is telegram_channel
    // so we can verify real membership via bot.telegram.getChatMember
    channelUsername: { type: String, default: null },
    active: { type: Boolean, default: true },
    createdBy: { type: String, default: 'owner' },
  },
  { timestamps: true }
);

taskSchema.statics.PLATFORMS = PLATFORMS;

module.exports = mongoose.model('Task', taskSchema);
