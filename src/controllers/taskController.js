const Task = require('../models/Task');
const TaskCompletion = require('../models/TaskCompletion');
const User = require('../models/User');
const bot = require('../bot/bot');
const { isAdmin, getPermissions } = require('../bot/middlewares/adminCheck');
const { extractChannelUsername } = require('../utils/extractChannel');

const MIN_WAIT_MS = 8000; // user must wait a few seconds after "Go" before "Check" succeeds
// (basic anti-cheat for platforms we can't verify via API, e.g. YouTube/Discord/etc.)

async function listTasks(req, res) {
  const telegramId = String(req.tgUser.id);
  const admin = await isAdmin(telegramId);

  const tasks = await Task.find({ active: true }).sort({ createdAt: -1 }).lean();
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
      status: c ? c.status : 'new', // new | started | completed
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

  const channelUsername = platform === 'telegram_channel' ? extractChannelUsername(url) : null;

  const task = await Task.create({
    title,
    url,
    platform,
    rewardCoins: Number(rewardCoins) || 10,
    channelUsername,
    createdBy: telegramId,
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

// Step 1: user taps "Go" -> record that they left to complete the task
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

// Step 2: user taps "Check" -> verify & reward
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

  // real verification for telegram channel join tasks
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
    // for platforms we can't verify via API (bot start on another bot, youtube,
    // discord, tiktok, facebook, twitter, instagram, generic website):
    // require the user to have waited a minimum time after tapping "Go"
    const elapsed = Date.now() - new Date(completion.startedAt).getTime();
    if (elapsed < MIN_WAIT_MS) {
      return res.status(400).json({
        error: 'Please complete the task first, then tap Check again.',
      });
    }
  }

  completion.status = 'completed';
  completion.completedAt = new Date();
  await completion.save();

  const user = await User.findOneAndUpdate(
    { telegramId },
    { $inc: { coins: task.rewardCoins } },
    { new: true }
  );

  return res.json({ ok: true, status: 'completed', rewardCoins: task.rewardCoins, coins: user.coins });
}

module.exports = { listTasks, createTask, deleteTask, startTask, checkTask };
