const Task = require('../models/Task');
const TaskCompletion = require('../models/TaskCompletion');
const User = require('../models/User');
const bot = require('../bot/bot');
const { isAdmin, getPermissions, isOwner } = require('../bot/middlewares/adminCheck');
const { extractChannelUsername } = require('../utils/extractChannel');
const { addCoins, coinsToUsdt } = require('../utils/economy');
const { MIN_TASK_REWARD_COINS, MAX_TASK_REWARD_COINS, OWNER_IDS } = require('../config');

const MIN_WAIT_MS = 8000;

function validateReward(rewardCoins) {
  const r = Number(rewardCoins);
  if (Number.isNaN(r)) return null;
  if (r < MIN_TASK_REWARD_COINS || r > MAX_TASK_REWARD_COINS) return null;
  return Math.round(r * 10) / 10;
}

async function listTasks(req, res) {
  const telegramId = String(req.tgUser.id);
  const admin = await isAdmin(telegramId);

  const tasks = await Task.find({
    active: true,
    $or: [{ maxCompletions: null }, { $expr: { $lt: ['$completionsCount', '$maxCompletions'] } }],
  })
    .sort({ createdAt: -1 })
    .lean();

  const completions = await TaskCompletion.find({ userId: telegramId }).lean();
  const completionMap = new Map(completions.map((c) => [String(c.taskId), c]));

  const result = tasks.map((task) => {
    const c = completionMap.get(String(task._id));
    return {
      id: task._id,
      title: task.title,
      url: task.url,
      platform: task.platform,
      rewardCoins: task.rewardCoins,
      status: c ? c.status : 'new',
    };
  });

  return res.json({ tasks: result, isAdmin: admin });
}

async function createTask(req, res) {
  const telegramId = String(req.tgUser.id);
  const admin = await isAdmin(telegramId);
  const perms = await getPermissions(telegramId);
  if (!admin || !perms.canAddTask) {
    return res.status(403).json({ error: 'Not authorized to add tasks' });
  }

  const { title, url, platform, rewardCoins } = req.body;
  if (!title || !url || !platform) {
    return res.status(400).json({ error: 'title, url and platform are required' });
  }
  if (!Task.PLATFORMS.includes(platform)) {
    return res.status(400).json({ error: 'Invalid platform' });
  }
  const reward = validateReward(rewardCoins);
  if (reward === null) {
    return res.status(400).json({ error: `Reward must be between ${MIN_TASK_REWARD_COINS} and ${MAX_TASK_REWARD_COINS} coins` });
  }

  const channelUsername = platform === 'telegram_channel' ? extractChannelUsername(url) : null;

  const task = await Task.create({
    title,
    url,
    platform,
    rewardCoins: reward,
    channelUsername,
    createdBy: telegramId,
    source: 'admin',
    active: true,
  });

  return res.json({ ok: true, task });
}

async function deleteTask(req, res) {
  const telegramId = String(req.tgUser.id);
  const admin = await isAdmin(telegramId);
  const perms = await getPermissions(telegramId);
  if (!admin || !perms.canAddTask) {
    return res.status(403).json({ error: 'Not authorized' });
  }
  await Task.findByIdAndUpdate(req.params.id, { active: false });
  return res.json({ ok: true });
}

// ==== Regular users submitting a paid task (pending admin approval) ====
async function submitUserTask(req, res) {
  const telegramId = String(req.tgUser.id);
  const { title, url, platform, rewardCoins, maxCompletions } = req.body;

  if (!title || !url || !platform) {
    return res.status(400).json({ error: 'title, url and platform are required' });
  }
  if (!Task.PLATFORMS.includes(platform)) {
    return res.status(400).json({ error: 'Invalid platform' });
  }
  const reward = validateReward(rewardCoins);
  if (reward === null) {
    return res.status(400).json({ error: `Reward must be between ${MIN_TASK_REWARD_COINS} and ${MAX_TASK_REWARD_COINS} coins` });
  }
  const slots = Number(maxCompletions);
  if (!slots || slots < 1) {
    return res.status(400).json({ error: 'Please specify how many people can complete this task' });
  }

  const channelUsername = platform === 'telegram_channel' ? extractChannelUsername(url) : null;

  const task = await Task.create({
    title,
    url,
    platform,
    rewardCoins: reward,
    channelUsername,
    createdBy: telegramId,
    source: 'user',
    sponsorTelegramId: telegramId,
    paymentStatus: 'pending',
    maxCompletions: slots,
    active: false,
  });

  for (const ownerId of OWNER_IDS) {
    try {
      await bot.telegram.sendMessage(
        ownerId,
        `🆕 New paid task submitted (awaiting payment confirmation)\nBy: ${telegramId}\nTitle: ${title}\nPlatform: ${platform}\nReward/user: ${reward} coins\nSlots: ${slots}\nBudget: ${(reward * slots).toFixed(1)} coins (~$${coinsToUsdt(reward * slots)})\nTask ID: ${task._id}\n\nOpen the Mini App → Earn → Pending Tasks to approve or reject.`
      );
    } catch (e) {
      /* ignore */
    }
  }

  return res.json({ ok: true, task });
}

async function listPendingUserTasks(req, res) {
  const telegramId = String(req.tgUser.id);
  if (!(await isAdmin(telegramId))) return res.status(403).json({ error: 'Not authorized' });

  const tasks = await Task.find({ source: 'user', paymentStatus: 'pending' }).sort({ createdAt: -1 }).lean();
  return res.json({
    tasks: tasks.map((t) => ({
      id: t._id,
      title: t.title,
      url: t.url,
      platform: t.platform,
      rewardCoins: t.rewardCoins,
      maxCompletions: t.maxCompletions,
      sponsorTelegramId: t.sponsorTelegramId,
      budgetCoins: t.rewardCoins * t.maxCompletions,
      budgetUSDT: coinsToUsdt(t.rewardCoins * t.maxCompletions),
      createdAt: t.createdAt,
    })),
  });
}

async function approveUserTask(req, res) {
  const telegramId = String(req.tgUser.id);
  if (!(await isAdmin(telegramId))) return res.status(403).json({ error: 'Not authorized' });

  const task = await Task.findById(req.params.id);
  if (!task || task.source !== 'user') return res.status(404).json({ error: 'Task not found' });

  task.paymentStatus = 'confirmed';
  task.active = true;
  await task.save();

  try {
    await bot.telegram.sendMessage(task.sponsorTelegramId, `✅ Your task "${task.title}" has been approved and is now live!`);
  } catch (e) {}

  return res.json({ ok: true });
}

async function rejectUserTask(req, res) {
  const telegramId = String(req.tgUser.id);
  if (!(await isAdmin(telegramId))) return res.status(403).json({ error: 'Not authorized' });

  const task = await Task.findById(req.params.id);
  if (!task || task.source !== 'user') return res.status(404).json({ error: 'Task not found' });

  task.paymentStatus = 'rejected';
  task.active = false;
  await task.save();

  try {
    await bot.telegram.sendMessage(task.sponsorTelegramId, `❌ Your task "${task.title}" was rejected. Please contact support if you believe this is a mistake.`);
  } catch (e) {}

  return res.json({ ok: true });
}

// ==== Go / Check flow ====
async function startTask(req, res) {
  const telegramId = String(req.tgUser.id);
  const { taskId } = req.body;

  const task = await Task.findById(taskId);
  if (!task || !task.active) return res.status(404).json({ error: 'Task not found' });

  await TaskCompletion.findOneAndUpdate(
    { userId: telegramId, taskId },
    { $setOnInsert: { startedAt: new Date() }, status: 'started' },
    { upsert: true, new: true }
  );

  return res.json({ ok: true, status: 'started' });
}

async function checkTask(req, res) {
  const telegramId = String(req.tgUser.id);
  const { taskId } = req.body;

  const task = await Task.findById(taskId);
  if (!task || !task.active) return res.status(404).json({ error: 'Task not found' });

  const completion = await TaskCompletion.findOne({ userId: telegramId, taskId });
  if (!completion) {
    return res.status(400).json({ error: 'Tap "Go" first before checking' });
  }
  if (completion.status === 'completed') {
    return res.json({ ok: true, status: 'completed', alreadyCompleted: true });
  }

  if (task.platform === 'telegram_channel' && task.channelUsername) {
    try {
      const member = await bot.telegram.getChatMember(task.channelUsername, telegramId);
      const joined = ['member', 'administrator', 'creator'].includes(member.status);
      if (!joined) {
        return res.status(400).json({ error: 'Please join the channel first, then check again.' });
      }
    } catch (e) {
      return res.status(400).json({
        error: 'Could not verify channel membership. Make sure ZORY X BOT is an admin of that channel.',
      });
    }
  } else {
    const elapsed = Date.now() - new Date(completion.startedAt).getTime();
    if (elapsed < MIN_WAIT_MS) {
      return res.status(400).json({ error: 'Please complete the task first, then tap Check again.' });
    }
  }

  if (task.maxCompletions && task.completionsCount >= task.maxCompletions) {
    return res.status(400).json({ error: 'This task has reached its completion limit.' });
  }

  completion.status = 'completed';
  completion.completedAt = new Date();
  await completion.save();

  task.completionsCount += 1;
  await task.save();

  const user = await User.findOne({ telegramId });
  addCoins(user, task.rewardCoins);
  user.completedTasksCount += 1;
  await user.save();

  return res.json({
    ok: true,
    status: 'completed',
    rewardCoins: task.rewardCoins,
    coins: user.coins,
    usdtBalance: coinsToUsdt(user.coins),
  });
}

module.exports = {
  listTasks,
  createTask,
  deleteTask,
  submitUserTask,
  listPendingUserTasks,
  approveUserTask,
  rejectUserTask,
  startTask,
  checkTask,
};
