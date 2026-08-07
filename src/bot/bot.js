const { Telegraf } = require('telegraf');
const { BOT_TOKEN } = require('../config');
const User = require('../models/User');

const startCommand = require('./commands/start');
const helpCommand = require('./commands/help');
const { setLanguageAction, changeLanguageAction } = require('./commands/language');
const { announcementCommand, broadcastMessage } = require('./commands/announcement');
const { addAdminCommand, removeAdminCommand, statsCommand } = require('./commands/admin');

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN is missing in .env');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

// commands
bot.start(startCommand);
bot.command('help', helpCommand);
bot.command('announcement', announcementCommand);
bot.command('addadmin', addAdminCommand);
bot.command('removeadmin', removeAdminCommand);
bot.command('stats', statsCommand);

// callback buttons
bot.action(/setlang_(bn|en|hi|ar)/, setLanguageAction);
bot.action('change_lang', changeLanguageAction);

// generic text listener -> only used for the "waiting for announcement text" flow.
// For every other unknown command / text, the bot stays SILENT for normal users,
// exactly as requested (only /start ever replies to regular users).
bot.on('text', async (ctx) => {
  if (ctx.message.text.startsWith('/')) return; // unknown commands -> ignore silently

  const telegramId = String(ctx.from.id);
  const user = await User.findOne({ telegramId });
  if (user && user.awaitingAnnouncement) {
    return broadcastMessage(ctx, user);
  }
  // otherwise: do nothing (silent), as requested
});

bot.catch((err, ctx) => {
  console.error(`Bot error for update ${ctx.updateType}:`, err);
});

module.exports = bot;
