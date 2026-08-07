const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Task = require('../models/Task');
const verifyTelegramWebAppData = require('../utils/verifyTelegram');

// Confirms the request really came from this user's Telegram session
// before touching their coins.
function authenticate(req, res, next) {
  const initData = req.headers['x-telegram-init-data'];
  const userData = verifyTelegramWebAppData(initData);

  if (!userData) return res.status(401).json({ error: 'Invalid Telegram session' });

  req.telegramUser = userData;
  next();
}

const AD_REWARD = 20;
const AD_COOLDOWN_SECONDS = 30;

// Public config the Mini App needs on load (no secrets in here)
router.get('/config', (req, res) => {
  res.json({ monetagZoneId: process.env.MONETAG_ZONE_ID || null });
});

// Get (or create) the current user's profile
router.get('/user', authenticate, async (req, res) => {
  try {
    const telegramId = String(req.telegramUser.id);
    let user = await User.findOne({ telegramId });

    if (!user) {
      user = await User.create({
        telegramId,
        username: req.telegramUser.username || '',
        firstName: req.telegramUser.first_name || ''
      });
    }

    const referralLink = `https://t.me/${process.env.BOT_USERNAME}?start=${telegramId}`;
    res.json({ ...user.toObject(), referralLink });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load profile' });
  }
});

// Tap to earn — +1 coin per tap
router.post('/tap', authenticate, async (req, res) => {
  try {
    const telegramId = String(req.telegramUser.id);
    const user = await User.findOneAndUpdate(
      { telegramId },
      { $inc: { coins: 1 } },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ coins: user.coins });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Tap failed' });
  }
});

// Top 50 by coins
router.get('/leaderboard', async (req, res) => {
  try {
    const topUsers = await User.find()
      .sort({ coins: -1 })
      .limit(50)
      .select('firstName username coins');

    res.json(topUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load leaderboard' });
  }
});

// Active tasks
router.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find({ active: true }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load tasks' });
  }
});

// Reward for watching a rewarded ad — gated by a cooldown since the
// client can't be fully trusted to only call this after a real ad
router.post('/ad/reward', authenticate, async (req, res) => {
  try {
    const telegramId = String(req.telegramUser.id);
    const user = await User.findOne({ telegramId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const now = Date.now();
    const last = user.lastAdWatch ? user.lastAdWatch.getTime() : 0;
    const secondsSince = (now - last) / 1000;

    if (secondsSince < AD_COOLDOWN_SECONDS) {
      return res.status(429).json({
        error: `Wait ${Math.ceil(AD_COOLDOWN_SECONDS - secondsSince)}s before the next ad`
      });
    }

    user.coins += AD_REWARD;
    user.lastAdWatch = new Date();
    await user.save();

    res.json({ coins: user.coins, reward: AD_REWARD });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not grant ad reward' });
  }
});

// Claim a task's reward (once per user)
router.post('/tasks/:id/complete', authenticate, async (req, res) => {
  try {
    const telegramId = String(req.telegramUser.id);
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const user = await User.findOne({ telegramId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.completedTasks.includes(task._id)) {
      return res.status(400).json({ error: 'Already claimed' });
    }

    user.coins += task.reward;
    user.completedTasks.push(task._id);
    await user.save();

    res.json({ coins: user.coins });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not claim task' });
  }
});

module.exports = router;
