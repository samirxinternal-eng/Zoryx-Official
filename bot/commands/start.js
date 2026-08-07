const User = require('../../models/User');

const REFERRAL_REWARD = 500;

module.exports = async function startCommand(ctx) {
  const telegramId = String(ctx.from.id);
  const username = ctx.from.username || '';
  const firstName = ctx.from.first_name || '';
  const referrerId = ctx.startPayload; // set when opened via t.me/Bot?start=ID

  let user = await User.findOne({ telegramId });

  if (!user) {
    const referredBy =
      referrerId && referrerId !== telegramId ? referrerId : null;

    user = await User.create({ telegramId, username, firstName, referredBy });

    if (referredBy) {
      const referrer = await User.findOne({ telegramId: referredBy });
      if (referrer) {
        referrer.coins += REFERRAL_REWARD;
        referrer.referralCount += 1;
        await referrer.save();
      }
    }
  }

  await ctx.reply(
    `✨ Welcome to ZORY X Bot, ${firstName || 'friend'}!\n\n` +
      `Tap to earn, complete tasks, watch ads for bonus coins, and climb the leaderboard.\n\n` +
      `Open the app below to get started.`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🚀 Open ZORY X',
              web_app: { url: process.env.WEBHOOK_URL }
            }
          ]
        ]
      }
    }
  );
};
