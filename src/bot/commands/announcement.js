const User = require('../../models/User');
const { t } = require('../../locales');
const { isAdmin, getPermissions } = require('../middlewares/adminCheck');
const { DEFAULT_LANG } = require('../../config');

// Step 1: /announcement -> ask admin to send the message text
async function announcementCommand(ctx) {
  const telegramId = String(ctx.from.id);
  const admin = await isAdmin(telegramId);
  const perms = await getPermissions(telegramId);

  const user = await User.findOne({ telegramId });
  const locale = t((user && user.language) || DEFAULT_LANG);

  if (!admin || !perms.canAnnounce) {
    return; // silent, same as /help for non-admins
  }

  await User.updateOne({ telegramId }, { awaitingAnnouncement: true });
  return ctx.reply(locale.announcementAsk);
}

// Step 2: called from the generic text listener in bot.js when
// user.awaitingAnnouncement === true
async function broadcastMessage(ctx, adminUser) {
  const locale = t(adminUser.language || DEFAULT_LANG);
  await User.updateOne({ telegramId: adminUser.telegramId }, { awaitingAnnouncement: false });

  const messageText = ctx.message.text;
  const users = await User.find({ isFake: false }, { telegramId: 1 }).lean();

  await ctx.reply(locale.announcementSending(users.length));

  let sent = 0;
  let failed = 0;

  for (const u of users) {
    try {
      await ctx.telegram.sendMessage(u.telegramId, messageText);
      sent++;
    } catch (e) {
      failed++;
    }
    // gentle throttle to avoid Telegram flood limits
    await new Promise((r) => setTimeout(r, 40));
  }

  return ctx.reply(locale.announcementDone(sent, failed));
}

module.exports = { announcementCommand, broadcastMessage };
