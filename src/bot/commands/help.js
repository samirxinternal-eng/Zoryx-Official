const User = require('../../models/User');
const { t } = require('../../locales');
const { isAdmin } = require('../middlewares/adminCheck');
const { DEFAULT_LANG } = require('../../config');

module.exports = async function helpCommand(ctx) {
  const telegramId = String(ctx.from.id);

  const admin = await isAdmin(telegramId);
  if (!admin) {
    // IMPORTANT: regular users get NO response at all for /help
    return;
  }

  const user = await User.findOne({ telegramId });
  const locale = t((user && user.language) || DEFAULT_LANG);

  return ctx.replyWithMarkdown(`${locale.helpTitle}\n\n${locale.helpBody}`);
};
