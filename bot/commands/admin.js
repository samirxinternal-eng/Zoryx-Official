const User = require('../../models/User');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function broadcast(ctx) {
  const message = ctx.message.text.replace('/broadcast', '').trim();
  if (!message) return ctx.reply('Format: /broadcast Your message here');

  const users = await User.find();
  await ctx.reply(`📢 Sending to ${users.length} users...`);

  let sent = 0;
  let failed = 0;

  for (const user of users) {
    try {
      await ctx.telegram.sendMessage(user.telegramId, message);
      sent++;
    } catch (err) {
      failed++;
    }
    await sleep(50); // stay comfortably under Telegram's rate limit
  }

  await ctx.reply(`✅ Broadcast done — sent: ${sent}, failed: ${failed}`);
}

async function stats(ctx) {
  const totalUsers = await User.countDocuments();
  const result = await User.aggregate([
    { $group: { _id: null, totalCoins: { $sum: '$coins' } } }
  ]);
  const totalCoins = result[0]?.totalCoins || 0;

  await ctx.reply(
    `📊 Aura Coin Stats\n\nUsers: ${totalUsers}\nCoins distributed: ${totalCoins}`
  );
}

module.exports = { broadcast, stats };
