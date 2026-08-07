const { Telegraf } = require('telegraf');
const isAdmin = require('./middleware/isAdmin');
const startCommand = require('./commands/start');
const helpCommand = require('./commands/help');
const { addTask, removeTask, listTasks } = require('./commands/tasks');
const { broadcast, stats } = require('./commands/admin');

const bot = new Telegraf(process.env.BOT_TOKEN);

// Public — the only command a regular user ever gets a reply from
bot.command('start', startCommand);

// Admin only. isAdmin() silently drops the request for everyone else,
// so /help (and these others) never respond to non-admins at all.
bot.command('help', isAdmin, helpCommand);
bot.command('addtask', isAdmin, addTask);
bot.command('removetask', isAdmin, removeTask);
bot.command('alltasks', isAdmin, listTasks);
bot.command('broadcast', isAdmin, broadcast);
bot.command('stats', isAdmin, stats);

bot.catch((err, ctx) => {
  console.error(`Bot error on ${ctx.updateType}:`, err);
});

module.exports = bot;
