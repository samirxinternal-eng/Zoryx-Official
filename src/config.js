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

  // ===== ZX Coin economy =====
  // 10 ZX Coin = 1 USDT  ->  1 coin = 0.1 USDT
  COIN_TO_USDT_RATE: Number(process.env.COIN_TO_USDT_RATE || 0.1),
  COIN_NAME: 'ZX Coin',
  REFERRAL_REWARD: Number(process.env.REFERRAL_REWARD || 5), // coins
  AD_REWARD: Number(process.env.AD_REWARD || 2), // coins
  DAILY_CHECKIN_REWARD: Number(process.env.DAILY_CHECKIN_REWARD || 2), // coins
  MIN_TASK_REWARD_COINS: 0.2,
  MAX_TASK_REWARD_COINS: 100,

  // ===== Withdraw =====
  WITHDRAW_MIN_USDT: Number(process.env.WITHDRAW_MIN_USDT || 2),

  // ===== Paid task submission (regular users pay to post a task) =====
  TASK_PAYMENT_ADDRESS:
    process.env.TASK_PAYMENT_ADDRESS || 'UQAVEPBT35E0amE3PpQObBDC9ZGAflMcNlUpwCRVph2eHXkg',
  TASK_PAYMENT_NETWORK: process.env.TASK_PAYMENT_NETWORK || 'TON (USDT-TON)',

  // ===== Official links =====
  OFFICIAL_CHANNEL: process.env.OFFICIAL_CHANNEL || 'https://t.me/zoryxofficial',
  COMMUNITY_CHANNEL: process.env.COMMUNITY_CHANNEL || 'https://t.me/zoryxofficial',

  // ===== Live-looking platform stats (base "warm-up" numbers + real DB counts on top) =====
  BASE_FAKE_USERS: Number(process.env.BASE_FAKE_USERS || 620627),
  BASE_FAKE_TASKS: Number(process.env.BASE_FAKE_TASKS || 22644),
  BASE_FAKE_REWARDS_USD: Number(process.env.BASE_FAKE_REWARDS_USD || 124811),
  LAUNCH_DATE: process.env.LAUNCH_DATE || '2026-01-05T00:00:00.000Z',

  SUPPORTED_LANGS: ['bn', 'en', 'hi', 'ar'],
  DEFAULT_LANG: 'bn',
};
