module.exports = {
  chooseLanguage: '🌐 Choose your language:',
  languageSet: '✅ Language set to English!',
  welcome: (name) =>
    `👋 Welcome, *${name}*!\n\n✨ Welcome to *ZORY X BOT* — complete tasks, earn coins, invite friends and climb the leaderboard!\n\n👇 Tap the button below to launch the app.`,
  openApp: '🚀 Open ZORY X BOT',
  changeLanguage: '🌐 Change Language',
  helpTitle: '🛠 *Admin Command List — ZORY X BOT*',
  helpBody:
    '/start — Start the bot & welcome message\n' +
    '/help — This command list (admins only)\n' +
    '/announcement — Broadcast a message to all users\n' +
    '/addadmin <telegram_id> — Add a new admin (owner only)\n' +
    '/removeadmin <telegram_id> — Remove an admin (owner only)\n' +
    '/stats — Bot user/admin statistics\n\n' +
    'ℹ️ Tasks are added/edited from the Mini App *Earn* section (Add Task button is visible to admins only).',
  announcementAsk: '📢 Now send your announcement message. It will be broadcast to all users.',
  announcementSending: (count) => `⏳ Sending to ${count} users...`,
  announcementDone: (sent, failed) => `✅ Announcement finished!\nSent: ${sent}\nFailed: ${failed}`,
  notAdmin: '⛔ This command is for admins only.',
  addAdminUsage: 'Usage: /addadmin <telegram_id>',
  addAdminDone: (id) => `✅ ${id} has been added as an admin.`,
  removeAdminDone: (id) => `🗑 ${id} has been removed from admins.`,
  stats: (users, admins, tasks) =>
    `📊 *Stats*\n👥 Total users: ${users}\n🛡 Total admins: ${admins}\n📝 Total tasks: ${tasks}`,
};
