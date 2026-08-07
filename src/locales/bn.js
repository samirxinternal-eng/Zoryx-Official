module.exports = {
  chooseLanguage: '🌐 আপনার ভাষা বেছে নিন / Choose your language:',
  languageSet: '✅ ভাষা বাংলা সেট করা হয়েছে!',
  welcome: (name) =>
    `👋 স্বাগতম, *${name}*!\n\n✨ *ZORY X BOT* এ আপনাকে স্বাগতম — টাস্ক সম্পূর্ণ করুন, কয়েন আয় করুন, বন্ধুদের ইনভাইট করুন এবং লিডারবোর্ডে উঠে আসুন!\n\n👇 নিচের বাটনে ক্লিক করে অ্যাপ চালু করুন।`,
  openApp: '🚀 ZORY X BOT ওপেন করুন',
  changeLanguage: '🌐 ভাষা পরিবর্তন',
  helpTitle: '🛠 *এডমিন কমান্ড লিস্ট — ZORY X BOT*',
  helpBody:
    '/start — বট চালু ও ওয়েলকাম মেসেজ\n' +
    '/help — এই কমান্ড লিস্ট (শুধু এডমিনদের জন্য)\n' +
    '/announcement — সকল ইউজারকে মেসেজ পাঠান\n' +
    '/addadmin <telegram_id> — নতুন এডমিন যোগ করুন (শুধু ওনার)\n' +
    '/removeadmin <telegram_id> — এডমিন রিমুভ করুন (শুধু ওনার)\n' +
    '/stats — বট এর মোট ইউজার/এডমিন পরিসংখ্যান\n\n' +
    'ℹ️ টাস্ক যোগ/এডিট করা যাবে Mini App এর *Earn* সেকশন থেকে (শুধু এডমিনদের কাছে বাটন দেখা যাবে)।',
  announcementAsk: '📢 এখন আপনার অ্যানাউন্সমেন্ট মেসেজটি পাঠান। এটি সকল ইউজারের কাছে ফরওয়ার্ড হবে।',
  announcementSending: (count) => `⏳ ${count} জন ইউজারের কাছে পাঠানো হচ্ছে...`,
  announcementDone: (sent, failed) => `✅ অ্যানাউন্সমেন্ট শেষ!\nপাঠানো হয়েছে: ${sent}\nব্যর্থ: ${failed}`,
  notAdmin: '⛔ এই কমান্ডটি শুধু এডমিনদের জন্য।',
  addAdminUsage: 'ব্যবহার: /addadmin <telegram_id>',
  addAdminDone: (id) => `✅ ${id} কে এডমিন হিসেবে যোগ করা হয়েছে।`,
  removeAdminDone: (id) => `🗑 ${id} কে এডমিন থেকে সরানো হয়েছে।`,
  stats: (users, admins, tasks) =>
    `📊 *পরিসংখ্যান*\n👥 মোট ইউজার: ${users}\n🛡 মোট এডমিন: ${admins}\n📝 মোট টাস্ক: ${tasks}`,
};
