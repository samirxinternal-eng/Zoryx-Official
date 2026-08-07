const Task = require('../../models/Task');

const VALID_TYPES = ['channel', 'link', 'bot'];
const USAGE =
  'Format: /addtask Title | https://url.com | 100 | channel\n' +
  'Type is one of: channel (join a channel), link (visit a link), bot (try another bot).\n' +
  'Type is optional — leave it off and it defaults to "link".';

async function addTask(ctx) {
  const input = ctx.message.text.replace('/addtask', '').trim();
  const parts = input.split('|').map((p) => p.trim());

  if (parts.length !== 3 && parts.length !== 4) return ctx.reply(USAGE);

  const [title, url, rewardStr, typeInput] = parts;
  const reward = parseInt(rewardStr, 10);
  const type = typeInput ? typeInput.toLowerCase() : 'link';

  if (!title || !url || Number.isNaN(reward)) return ctx.reply(USAGE);
  if (!VALID_TYPES.includes(type)) {
    return ctx.reply(`Type must be one of: ${VALID_TYPES.join(', ')}`);
  }

  const task = await Task.create({ title, url, reward, type });
  await ctx.reply(
    `✅ Task added\nID: ${task._id}\nTitle: ${title}\nType: ${type}\nReward: ${reward} coins`
  );
}

async function removeTask(ctx) {
  const taskId = ctx.message.text.replace('/removetask', '').trim();
  if (!taskId) return ctx.reply('Format: /removetask <taskId>');

  try {
    const task = await Task.findByIdAndDelete(taskId);
    if (!task) return ctx.reply('Task not found.');
    await ctx.reply(`🗑 Removed: ${task.title}`);
  } catch (err) {
    await ctx.reply('That doesn\'t look like a valid task ID.');
  }
}

async function listTasks(ctx) {
  const tasks = await Task.find().sort({ createdAt: -1 });
  if (tasks.length === 0) return ctx.reply('No tasks yet. Add one with /addtask');

  const list = tasks
    .map(
      (t) =>
        `• [${t.type}] ${t.title} — ${t.reward} coins${t.active ? '' : ' (inactive)'}\n  ID: ${t._id}`
    )
    .join('\n\n');

  await ctx.reply(`📋 All tasks:\n\n${list}`);
}

module.exports = { addTask, removeTask, listTasks };
