const User = require('../../models/User');
const { t } = require('../../locales');
const { languageKeyboard, mainMenuKeyboard } = require('../keyboards');
const { REFERRAL_REWARD, DEFAULT_LANG } = require('../../config');

module.exports = async function startCommand(ctx) {
  const from = ctx.from;
  const telegramId = String(from.id);
  const payload = ctx.startPayload; // e.g. "ref_123456"

  let user = await User.findOne({ telegramId });
  const isNewUser = !user;

  if (!user) {
    let referredBy = null;
    if (payload && payload.startsWith('ref_')) {
      const refId = payload.replace('ref_', '');
      if (refId && refId !== telegramId) referredBy = refId;
    }

    user = await User.create({
      telegramId,
      firstName: from.first_name || '',
      lastName: from.last_name || '',
      username: from.username || '',
      referredBy,
    });

    if (referredBy) {
      const referrer = await User.findOneAndUpdate(
        { telegramId: referredBy },
        { $inc: { coins: REFERRAL_REWARD, referralCount: 1 } },
        { new: true }
      );
      if (referrer) {
        try {
          const rl = t(referrer.language || DEFAULT_LANG);
          await ctx.telegram.sendMessage(
            referrer.telegramId,
            `🎉 +${REFERRAL_REWARD} coins! ${from.first_name || 'A friend'} joined using your invite link.`
          );
        } catch (e) {
          /* user may have blocked the bot, ignore */
        }
      }
    }
  } else {
    // keep profile info fresh
    user.firstName = from.first_name || user.firstName;
    user.lastName = from.last_name || user.lastName;
    user.username = from.username || user.username;
    await user.save();
  }

  if (!user.language) {
    // first time -> ask language before showing welcome
    return ctx.reply(t(DEFAULT_LANG).chooseLanguage, languageKeyboard());
  }

  const locale = t(user.language);
  const displayName = from.first_name || from.username || 'Friend';
  return ctx.replyWithMarkdown(locale.welcome(displayName), mainMenuKeyboard(locale));
};
