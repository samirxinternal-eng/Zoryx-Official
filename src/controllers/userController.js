const User = require('../models/User');
const bot = require('../bot/bot');
const { verifyInitData } = require('../utils/verifyTelegram');
const { isAdmin } = require('../bot/middlewares/adminCheck');
const { BOT_USERNAME, AD_REWARD, SUPPORTED_LANGS, DEFAULT_LANG } = require('../config');

// Attach req.tgUser after validating Telegram initData sent from the Mini App.
// All /api routes (except webhook) should go through this.
async function requireTelegramAuth(req, res, next) {
  const initData = req.headers['x-telegram-init-data'] || req.body.initData;
  const tgUser = verifyInitData(initData);
  if (!tgUser) {
    return res.status(401).json({ error: 'Invalid or missing Telegram auth data' });
  }
  req.tgUser = tgUser;
  next();
}

async function getMe(req, res) {
  const telegramId = String(req.tgUser.id);
  let user = await User.findOne({ telegramId });

  if (!user) {
    user = await User.create({
      telegramId,
      firstName: req.tgUser.first_name || '',
      lastName: req.tgUser.last_name || '',
      username: req.tgUser.username || '',
      language: null,
    });
  }

  // try to fetch a fresh profile photo (best-effort, non-blocking on failure)
  let photoUrl = user.photoUrl;
  try {
    const photos = await bot.telegram.getUserProfilePhotos(telegramId, 0, 1);
    if (photos && photos.total_count > 0) {
      const fileId = photos.photos[0][0].file_id;
      const link = await bot.telegram.getFileLink(fileId);
      photoUrl = link.href;
      if (photoUrl !== user.photoUrl) {
        user.photoUrl = photoUrl;
        await user.save();
      }
    }
  } catch (e) {
    /* profile photo optional, ignore errors */
  }

  const admin = await isAdmin(telegramId);

  return res.json({
    telegramId: user.telegramId,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    photoUrl: user.photoUrl,
    language: user.language,
    coins: user.coins,
    energy: user.energy,
    referralCount: user.referralCount,
    isAdmin: admin,
    referralLink: `https://t.me/${BOT_USERNAME}?start=ref_${user.telegramId}`,
  });
}

async function setLanguage(req, res) {
  const { lang } = req.body;
  if (!SUPPORTED_LANGS.includes(lang)) {
    return res.status(400).json({ error: 'Unsupported language' });
  }
  const telegramId = String(req.tgUser.id);
  await User.updateOne({ telegramId }, { language: lang }, { upsert: true });
  return res.json({ ok: true, language: lang });
}

async function getLeaderboard(req, res) {
  const top = await User.find({}, { firstName: 1, username: 1, photoUrl: 1, coins: 1, telegramId: 1 })
    .sort({ coins: -1 })
    .limit(50)
    .lean();

  return res.json(
    top.map((u, i) => ({
      rank: i + 1,
      name: u.firstName || u.username || 'Player',
      photoUrl: u.photoUrl || '',
      coins: u.coins,
      isYou: u.telegramId === String(req.tgUser.id),
    }))
  );
}

async function watchAd(req, res) {
  const telegramId = String(req.tgUser.id);
  const user = await User.findOne({ telegramId });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const COOLDOWN_MS = 30 * 1000; // 30s between ad rewards, basic anti-spam
  if (user.lastAdWatchAt && Date.now() - new Date(user.lastAdWatchAt).getTime() < COOLDOWN_MS) {
    return res.status(429).json({ error: 'Please wait before watching another ad' });
  }

  user.coins += AD_REWARD;
  user.energy = Math.min(100, user.energy + 10);
  user.lastAdWatchAt = new Date();
  await user.save();

  return res.json({ ok: true, coins: user.coins, energy: user.energy, rewarded: AD_REWARD });
}

module.exports = { requireTelegramAuth, getMe, setLanguage, getLeaderboard, watchAd };
