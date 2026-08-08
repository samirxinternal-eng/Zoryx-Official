const mongoose = require('mongoose');

// Singleton document holding runtime-editable settings (e.g. the admin can
// change the per-ad USDT reward from the Mini App without redeploying).
const settingsSchema = new mongoose.Schema(
  {
    singleton: { type: String, default: 'main', unique: true },
    adRewardUSDT: { type: Number, default: 0.5 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
