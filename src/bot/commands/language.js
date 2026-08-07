const User = require('../../models/User');
const { t } = require('../../locales');
const { languageKeyboard, mainMenuKeyboard } = require('../keyboards');
const { DEFAULT_LANG } = require('../../config');

async function setLanguageAction(ctx) {
  const code = ctx.match[1]; // from regex setlang_(bn|en|hi|ar)
  const telegramId = String(ctx.from.id);

  const user = await User.findOneAndUpdate(
    { telegramId },
    { language: code },
    { new: true, upsert: true }
  );

  const locale = t(code);
  await ctx.answerCbQuery(locale.languageSet);

  const displayName = ctx.from.first_name || ctx.from.username || 'Friend';
  await ctx.editMessageText(
    locale.welcome(displayName),
    { parse_mode: 'Markdown', ...mainMenuKeyboard(locale) }
  );
}

async function changeLanguageAction(ctx) {
  await ctx.answerCbQuery();
  await ctx.editMessageText(t(DEFAULT_LANG).chooseLanguage, languageKeyboard());
}

module.exports = { setLanguageAction, changeLanguageAction };
