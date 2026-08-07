/**
 * Extracts a @username from a t.me/username or https://t.me/username link.
 * Returns null if the URL is not a recognizable public channel link
 * (private invite links like t.me/+xxxx can't be verified via getChatMember).
 */
function extractChannelUsername(url) {
  if (!url) return null;
  const match = url.match(/t\.me\/([A-Za-z0-9_]{5,32})\/?$/);
  if (!match) return null;
  return `@${match[1]}`;
}

module.exports = { extractChannelUsername };
