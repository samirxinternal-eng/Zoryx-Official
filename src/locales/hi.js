module.exports = {
  chooseLanguage: '🌐 अपनी भाषा चुनें:',
  languageSet: '✅ भाषा हिंदी सेट कर दी गई है!',
  welcome: (name) =>
    `👋 स्वागत है, *${name}*!\n\n✨ *ZORY X BOT* में आपका स्वागत है — टास्क पूरे करें, कॉइन कमाएँ, दोस्तों को इनवाइट करें और लीडरबोर्ड में ऊपर आएं!\n\n👇 नीचे बटन दबाकर ऐप खोलें।`,
  openApp: '🚀 ZORY X BOT खोलें',
  changeLanguage: '🌐 भाषा बदलें',
  helpTitle: '🛠 *एडमिन कमांड लिस्ट — ZORY X BOT*',
  helpBody:
    '/start — बॉट शुरू करें और वेलकम मैसेज\n' +
    '/help — यह कमांड लिस्ट (सिर्फ़ एडमिन के लिए)\n' +
    '/announcement — सभी यूज़र्स को मैसेज भेजें\n' +
    '/addadmin <telegram_id> — नया एडमिन जोड़ें (सिर्फ़ ओनर)\n' +
    '/removeadmin <telegram_id> — एडमिन हटाएं (सिर्फ़ ओनर)\n' +
    '/stats — बॉट के यूज़र/एडमिन आँकड़े\n\n' +
    'ℹ️ टास्क Mini App के *Earn* सेक्शन से जोड़े/एडिट किए जा सकते हैं (Add Task बटन केवल एडमिन को दिखेगा)।',
  announcementAsk: '📢 अब अपना अनाउंसमेंट मैसेज भेजें। यह सभी यूज़र्स को भेजा जाएगा।',
  announcementSending: (count) => `⏳ ${count} यूज़र्स को भेजा जा रहा है...`,
  announcementDone: (sent, failed) => `✅ अनाउंसमेंट पूरा हुआ!\nभेजा गया: ${sent}\nविफल: ${failed}`,
  notAdmin: '⛔ यह कमांड केवल एडमिन के लिए है।',
  addAdminUsage: 'उपयोग: /addadmin <telegram_id>',
  addAdminDone: (id) => `✅ ${id} को एडमिन के रूप में जोड़ा गया।`,
  removeAdminDone: (id) => `🗑 ${id} को एडमिन से हटा दिया गया।`,
  stats: (users, admins, tasks) =>
    `📊 *आँकड़े*\n👥 कुल यूज़र: ${users}\n🛡 कुल एडमिन: ${admins}\n📝 कुल टास्क: ${tasks}`,
};
