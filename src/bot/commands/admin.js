const User = require('../../models/User');
const Admin = require('../../models/Admin');
const Task = require('../../models/Task');
const WithdrawRequest = require('../../models/WithdrawRequest');
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
  if (!isOwner(telegramId)) return;

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

// ==== Withdraw request review (owner only) ====
async function withdrawalsCommand(ctx) {
  const telegramId = String(ctx.from.id);
  if (!isOwner(telegramId)) return;

  const pending = await WithdrawRequest.find({ status: 'pending' }).sort({ createdAt: 1 }).limit(15).lean();
  if (!pending.length) return ctx.reply('✅ No pending withdrawal requests.');

  let msg = `💸 *Pending Withdrawals (${pending.length})*\n\n`;
  pending.forEach((w) => {
    msg += `ID: \`${w._id}\`\nUser: ${w.userId}\nAmount: ${w.amountUSDT} USDT\nAddress: \`${w.recipientAddress}\`\n\n`;
  });
  msg += 'Use /approvewithdraw <id> after you send the funds manually, or /rejectwithdraw <id> to refund the user.';
  return ctx.replyWithMarkdown(msg);
}

async function approveWithdrawCommand(ctx) {
  const telegramId = String(ctx.from.id);
  if (!isOwner(telegramId)) return;

  const parts = ctx.message.text.trim().split(/\s+/);
  if (parts.length < 2) return ctx.reply('Usage: /approvewithdraw <request_id>');

  const request = await WithdrawRequest.findById(parts[1]);
  if (!request || request.status !== 'pending') return ctx.reply('Request not found or already processed.');

  request.status = 'completed';
  request.processedAt = new Date();
  await request.save();

  try {
    await ctx.telegram.sendMessage(request.userId, `✅ Your withdrawal of ${request.amountUSDT} USDT has been sent!`);
  } catch (e) {}

  return ctx.reply(`✅ Marked withdrawal ${request._id} as completed.`);
}

async function rejectWithdrawCommand(ctx) {
  const telegramId = String(ctx.from.id);
  if (!isOwner(telegramId)) return;

  const parts = ctx.message.text.trim().split(/\s+/);
  if (parts.length < 2) return ctx.reply('Usage: /rejectwithdraw <request_id>');

  const request = await WithdrawRequest.findById(parts[1]);
  if (!request || request.status !== 'pending') return ctx.reply('Request not found or already processed.');

  // refund the coins back to the user
  const user = await User.findOne({ telegramId: request.userId });
  if (user) {
    user.coins += request.amountCoins;
    await user.save();
  }

  request.status = 'rejected';
  request.processedAt = new Date();
  await request.save();

  try {
    await ctx.telegram.sendMessage(request.userId, `❌ Your withdrawal request of ${request.amountUSDT} USDT was rejected and the balance has been refunded.`);
  } catch (e) {}

  return ctx.reply(`🗑 Rejected withdrawal ${request._id} and refunded the user.`);
}

module.exports = {
  addAdminCommand,
  removeAdminCommand,
  statsCommand,
  withdrawalsCommand,
  approveWithdrawCommand,
  rejectWithdrawCommand,
};
