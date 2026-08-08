const { COIN_TO_USDT_RATE } = require('../config');

function coinsToUsdt(coins) {
  return Math.round(coins * COIN_TO_USDT_RATE * 1000) / 1000;
}

// ISO week key like "2026-W32", used to lazily bucket/reset weekly leaderboard coins
function getWeekKey(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo}`;
}

// Milliseconds until next Monday 00:00 UTC (when the weekly board resets)
function msUntilNextWeekReset() {
  const now = new Date();
  const day = now.getUTCDay(); // 0 = Sunday
  const daysUntilMonday = (8 - day) % 7 || 7;
  const next = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysUntilMonday)
  );
  return next.getTime() - now.getTime();
}

// Adds `coins` to a user's balance + weekly bucket (lazily resetting the
// weekly bucket if the ISO week has rolled over). Does NOT save() - caller
// is expected to save the user document.
function addCoins(user, coins) {
  const currentWeekKey = getWeekKey();
  if (user.weeklyWeekKey !== currentWeekKey) {
    user.weeklyWeekKey = currentWeekKey;
    user.weeklyCoins = 0;
  }
  user.coins += coins;
  user.weeklyCoins += coins;
}

function isSameUTCDate(a, b) {
  if (!a || !b) return false;
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

module.exports = { coinsToUsdt, getWeekKey, msUntilNextWeekReset, addCoins, isSameUTCDate };
