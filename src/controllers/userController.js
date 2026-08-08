const User = require('../models/User');
const WithdrawRequest = require('../models/WithdrawRequest');
const Task = require('../models/Task');
const bot = require('../bot/bot');
const { verifyInitData } = require('../utils/verifyTelegram');
const { isAdmin, isOwner } = require('../bot/middlewares/adminCheck');
const { coinsToUsdt, isSameUTCDate, addCoins, getWeekKey, msUntilNextWeekReset } = require('../utils/economy');
const { ACHIEVEMENTS, getProgress } = require('../utils/achievements');
const {
  BOT_USERNAME,
  AD_REWARD,
  DAILY_CHECKIN_REWARD,
  SUPPORTED_LANGS,
  WITHDRAW_MIN_USDT,
  TASK_PAYMENT_ADDRESS,
  TASK_PAYMENT_NETWORK,
  OFFICIAL_CHANNEL,
  COMMUNITY_CHANNEL,
  BASE_FAKE_USERS,
  BASE_FAKE_TASKS,
  BASE_FAKE_REWARDS_USD,
  LAUNCH_DATE,
  COIN_TO_USDT_RATE,
} = require('../config');

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
    /* profile photo optional */
  }

  const admin = await isAdmin(telegramId);
  const canCheckInToday = !isSameUTCDate(user.lastCheckInAt, new Date());

  return res.json({
    telegramId: user.telegramId,
    firstName: user.firstName,
    lastName: user.lastName,
    username: user.username,
    photoUrl: user.photoUrl,
    language: user.language,
    coins: user.coins,
    usdtBalance: coinsToUsdt(user.coins),
    referralCount: user.referralCount,
    completedTasksCount: user.completedTasksCount,
    checkInStreak: user.checkInStreak,
    canCheckInToday,
    dailyCheckInReward: DAILY_CHECKIN_REWARD,
    isAdmin: admin,
    referralLink: `https://t.me/${BOT_USERNAME}?start=ref_${user.telegramId}`,
    coinToUsdtRate: COIN_TO_USDT_RATE,
    officialChannel: OFFICIAL_CHANNEL,
    communityChannel: COMMUNITY_CHANNEL,
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

// ================= Daily Check-in =================
async function dailyCheckIn(req, res) {
  const telegramId = String(req.tgUser.id);
  const user = await User.findOne({ telegramId });
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (isSameUTCDate(user.lastCheckInAt, new Date())) {
    return res.status(400).json({ error: 'Already checked in today' });
  }

  const wasYesterday =
    user.lastCheckInAt &&
    Date.now() - new Date(user.lastCheckInAt).getTime() < 48 * 60 * 60 * 1000;

  user.checkInStreak = wasYesterday ? user.checkInStreak + 1 : 1;
  user.lastCheckInAt = new Date();
  addCoins(user, DAILY_CHECKIN_REWARD);
  await user.save();

  return res.json({
    ok: true,
    coins: user.coins,
    usdtBalance: coinsToUsdt(user.coins),
    checkInStreak: user.checkInStreak,
    rewarded: DAILY_CHECKIN_REWARD,
  });
}

// ================= Leaderboard =================
async function getLeaderboard(req, res) {
  const type = req.query.type || 'tasks'; // tasks | invites | weekly
  const telegramId = String(req.tgUser.id);

  if (type === 'invites') {
    const top = await User.find({}, { firstName: 1, username: 1, photoUrl: 1, referralCount: 1, telegramId: 1 })
      .sort({ referralCount: -1 })
      .limit(50)
      .lean();
    return res.json(
      top.map((u, i) => ({
        rank: i + 1,
        name: u.firstName || u.username || 'Player',
        photoUrl: u.photoUrl || '',
        value: u.referralCount,
        isYou: u.telegramId === telegramId,
      }))
    );
  }

  if (type === 'weekly') {
    const currentWeekKey = getWeekKey();
    const top = await User.find(
      { weeklyWeekKey: currentWeekKey },
      { firstName: 1, username: 1, photoUrl: 1, weeklyCoins: 1, telegramId: 1 }
    )
      .sort({ weeklyCoins: -1 })
      .limit(50)
      .lean();
    return res.json(
      top.map((u, i) => ({
        rank: i + 1,
        name: u.firstName || u.username || 'Player',
        photoUrl: u.photoUrl || '',
        value: coinsToUsdt(u.weeklyCoins),
        isYou: u.telegramId === telegramId,
      }))
    );
  }

  // default: "tasks" -> total earnings (USDT) ranking
  const top = await User.find({}, { firstName: 1, username: 1, photoUrl: 1, coins: 1, telegramId: 1 })
    .sort({ coins: -1 })
    .limit(50)
    .lean();
  return res.json(
    top.map((u, i) => ({
      rank: i + 1,
      name: u.firstName || u.username || 'Player',
      photoUrl: u.photoUrl || '',
      value: coinsToUsdt(u.coins),
      isYou: u.telegramId === telegramId,
    }))
  );
}

// ================= Live platform stats =================
async function getStats(req, res) {
  const [realUsers, realTasksCompleted] = await Promise.all([
    User.countDocuments({ isFake: false }),
    User.aggregate([{ $group: { _id: null, total: { $sum: '$completedTasksCount' } } }]),
  ]);
  const realCoinsAgg = await User.aggregate([{ $group: { _id: null, total: { $sum: '$coins' } } }]);
  const realTasksTotal = (realTasksCompleted[0] && realTasksCompleted[0].total) || 0;
  const realRewardsUSD = coinsToUsdt((realCoinsAgg[0] && realCoinsAgg[0].total) || 0);

  const runningDays = Math.max(1, Math.floor((Date.now() - new Date(LAUNCH_DATE).getTime()) / 86400000));

  return res.json({
    totalTasks: BASE_FAKE_TASKS + realTasksTotal,
    totalRewardsUSD: Math.round((BASE_FAKE_REWARDS_USD + realRewardsUSD) * 100) / 100,
    totalUsers: BASE_FAKE_USERS + realUsers,
    runningDays,
  });
}

// ================= Achievements =================
async function getAchievements(req, res) {
  const telegramId = String(req.tgUser.id);
  const user = await User.findOne({ telegramId });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const list = ACHIEVEMENTS.map((a) => {
    const progress = getProgress(user, a);
    return {
      id: a.id,
      category: a.category,
      icon: a.icon,
      titleKey: a.titleKey,
      descKey: a.descKey,
      target: a.target,
      progress: Math.min(progress, a.target),
      rewardCoins: a.rewardCoins,
      claimed: user.claimedAchievements.includes(a.id),
      claimable: progress >= a.target && !user.claimedAchievements.includes(a.id),
    };
  });

  return res.json({
    achievements: list,
    completedCount: list.filter((a) => a.claimed).length,
    totalCount: list.length,
  });
}

async function claimAchievement(req, res) {
  const telegramId = String(req.tgUser.id);
  const { achievementId } = req.body;
  const def = ACHIEVEMENTS.find((a) => a.id === achievementId);
  if (!def) return res.status(404).json({ error: 'Achievement not found' });

  const user = await User.findOne({ telegramId });
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.claimedAchievements.includes(achievementId)) {
    return res.status(400).json({ error: 'Already claimed' });
  }
  const progress = getProgress(user, def);
  if (progress < def.target) {
    return res.status(400).json({ error: 'Not completed yet' });
  }

  user.claimedAchievements.push(achievementId);
  addCoins(user, def.rewardCoins);
  await user.save();

  return res.json({ ok: true, coins: user.coins, usdtBalance: coinsToUsdt(user.coins), rewarded: def.rewardCoins });
}

// ================= Ads =================
async function watchAd(req, res) {
  const telegramId = String(req.tgUser.id);
  const user = await User.findOne({ telegramId });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const COOLDOWN_MS = 30 * 1000;
  if (user.lastAdWatchAt && Date.now() - new Date(user.lastAdWatchAt).getTime() < COOLDOWN_MS) {
    return res.status(429).json({ error: 'Please wait before watching another ad' });
  }

  addCoins(user, AD_REWARD);
  user.lastAdWatchAt = new Date();
  await user.save();

  return res.json({ ok: true, coins: user.coins, usdtBalance: coinsToUsdt(user.coins), rewarded: AD_REWARD });
}

// ================= Withdraw =================
async function getWithdrawInfo(req, res) {
  const telegramId = String(req.tgUser.id);
  const user = await User.findOne({ telegramId });
  if (!user) return res.status(404).json({ error: 'User not found' });

  return res.json({
    withdrawableUSDT: coinsToUsdt(user.coins),
    minUSDT: WITHDRAW_MIN_USDT,
    feeUSDT: 0,
  });
}

async function createWithdrawRequest(req, res) {
  const telegramId = String(req.tgUser.id);
  const { amountUSDT, recipientAddress } = req.body;

  if (!recipientAddress || !/^0x[a-fA-F0-9]{40}$/.test(recipientAddress.trim())) {
    return res.status(400).json({ error: 'Please enter a valid BEP20 (0x...) address' });
  }
  const amount = Number(amountUSDT);
  if (!amount || amount < WITHDRAW_MIN_USDT) {
    return res.status(400).json({ error: `Minimum withdrawal is ${WITHDRAW_MIN_USDT} USDT` });
  }

  const user = await User.findOne({ telegramId });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const userBalanceUSDT = coinsToUsdt(user.coins);
  if (amount > userBalanceUSDT) {
    return res.status(400).json({ error: 'Amount exceeds your withdrawable balance' });
  }

  const coinsToDeduct = amount / COIN_TO_USDT_RATE;
  user.coins -= coinsToDeduct;
  await user.save();

  const request = await WithdrawRequest.create({
    userId: telegramId,
    amountCoins: coinsToDeduct,
    amountUSDT: amount,
    recipientAddress: recipientAddress.trim(),
    status: 'pending',
  });

  // notify owners so they can process it manually within 24h
  const { OWNER_IDS } = require('../config');
  for (const ownerId of OWNER_IDS) {
    try {
      await bot.telegram.sendMessage(
        ownerId,
        `💸 New withdraw request\nUser: ${telegramId}\nAmount: ${amount} USDT\nAddress: ${recipientAddress}\nRequest ID: ${request._id}\n\nUse /withdrawals to review pending requests.`
      );
    } catch (e) {
      /* ignore unreachable owner */
    }
  }

  return res.json({ ok: true, requestId: request._id, coins: user.coins, usdtBalance: coinsToUsdt(user.coins) });
}

async function listMyWithdrawals(req, res) {
  const telegramId = String(req.tgUser.id);
  const list = await WithdrawRequest.find({ userId: telegramId }).sort({ createdAt: -1 }).limit(30).lean();
  return res.json(
    list.map((w) => ({
      id: w._id,
      amountUSDT: w.amountUSDT,
      recipientAddress: w.recipientAddress,
      status: w.status,
      createdAt: w.createdAt,
    }))
  );
}

// ================= Paid task submission info (for regular users) =================
async function getTaskPaymentInfo(req, res) {
  return res.json({
    address: TASK_PAYMENT_ADDRESS,
    network: TASK_PAYMENT_NETWORK,
  });
}

module.exports = {
  requireTelegramAuth,
  getMe,
  setLanguage,
  dailyCheckIn,
  getLeaderboard,
  getStats,
  getAchievements,
  claimAchievement,
  watchAd,
  getWithdrawInfo,
  createWithdrawRequest,
  listMyWithdrawals,
  getTaskPaymentInfo,
};
