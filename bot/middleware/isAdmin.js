// Guards admin-only commands like /help, /addtask, /broadcast.
// If a non-admin runs one of these, the bot stays completely silent —
// no reply at all — by design.
module.exports = function isAdmin(ctx, next) {
  const userId = String(ctx.from.id);

  if (userId === process.env.ADMIN_ID) {
    return next();
  }

  // Non-admin: do nothing, no reply.
};
