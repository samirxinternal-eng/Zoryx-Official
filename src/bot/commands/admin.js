const User = require('../../models/User');
const Admin = require('../../models/Admin');
const Task = require('../../models/Task');
const { t } = require('../../locales');
const { isOwner } = require('../middlewares/adminCheck');
const { DEFAULT_LANG } = require('../../config');

async function localeFor(telegramId) {
  const user = await User.findOne({ telegramId: String(telegramId) });
  return t((user && user.language) || DEFAULT_LANG);
}

async function addAdminCommand(ctx) {
  const telegramId = String(ctx.from.id);
  const locale = await localeFor(telegramId);
  if (!isOwner(telegramId)) return; // silent for non-owners

  const parts = ctx.message.text.trim().split(/\s+/);
  if (parts.length < 2) return ctx.reply(locale.addAdminUsage);

  const newAdminId = parts[1].replace('@', '');
  await Admin.findOneAndUpdate(
    { telegramId: newAdminId },
    { telegramId: newAdminId, addedBy: telegramId },
    { upsert: true }
  );
  return ctx.reply(locale.addAdminDone(newAdminId));
}

async function removeAdminCommand(ctx) {
  const telegramId = String(ctx.from.id);
  const locale = await localeFor(telegramId);
  if (!isOwner(telegramId)) return;

  const parts = ctx.message.text.trim().split(/\s+/);
  if (parts.length < 2) return ctx.reply(locale.addAdminUsage);

  const targetId = parts[1].replace('@', '');
  await Admin.deleteOne({ telegramId: targetId });
  return ctx.reply(locale.removeAdminDone(targetId));
}

async function statsCommand(ctx) {
  const telegramId = String(ctx.from.id);
  const locale = await localeFor(telegramId);
  if (!isOwner(telegramId)) return;

  const [users, admins, tasks] = await Promise.all([
    User.countDocuments({ isFake: false }),
    Admin.countDocuments({}),
    Task.countDocuments({}),
  ]);

  return ctx.replyWithMarkdown(locale.stats(users, admins, tasks));
}

module.exports = { addAdminCommand, removeAdminCommand, statsCommand };
