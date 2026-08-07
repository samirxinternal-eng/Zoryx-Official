require('dotenv').config();

const ownerIds = (process.env.ADMIN_IDS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

module.exports = {
  BOT_TOKEN: process.env.BOT_TOKEN,
  BOT_USERNAME: process.env.BOT_USERNAME || 'ZoryXBot',
  MONGODB_URI: process.env.MONGODB_URI,
  OWNER_IDS: ownerIds,
  WEBAPP_URL: process.env.WEBAPP_URL || '',
  WEBHOOK_DOMAIN: process.env.WEBHOOK_DOMAIN || '',
  PORT: process.env.PORT || 3000,
  MONETAG_ZONE_ID: process.env.MONETAG_ZONE_ID || '',
  REFERRAL_REWARD: Number(process.env.REFERRAL_REWARD || 50),
  AD_REWARD: Number(process.env.AD_REWARD || 20),
  SUPPORTED_LANGS: ['bn', 'en', 'hi', 'ar'],
  DEFAULT_LANG: 'bn',
};
