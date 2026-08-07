const bn = require('./bn');
const en = require('./en');
const hi = require('./hi');
const ar = require('./ar');

const locales = { bn, en, hi, ar };

function t(lang) {
  return locales[lang] || locales.bn;
}

module.exports = { t, locales };
