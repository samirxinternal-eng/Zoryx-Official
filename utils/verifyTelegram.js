const crypto = require('crypto');

// Verifies the initData string Telegram's WebApp SDK signs for every
// session, so the API can trust the user ID it receives instead of
// letting the client just claim to be anyone. Returns the parsed
// Telegram user object, or null if the signature doesn't check out.
function verifyTelegramWebAppData(initData) {
  if (!initData) return null;

  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  if (!hash) return null;
  urlParams.delete('hash');

  const dataCheckString = [...urlParams.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(process.env.BOT_TOKEN)
    .digest();

  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  if (calculatedHash !== hash) return null;

  const userStr = urlParams.get('user');
  return userStr ? JSON.parse(userStr) : null;
}

module.exports = verifyTelegramWebAppData;
