module.exports = {
  chooseLanguage: `🌐 اختر لغتك:`,
  languageSet: `✅ تم ضبط اللغة على العربية!`,
  marketingIntro: `🚀 حجم المهام والأرباح في تصاعد سريع، والبوت يعمل بسلاسة تامة!\n\n💰 يتم طرح مئات المهام الجديدة يوميًا، وبعض المستخدمين يكسبون بالفعل من 100$ إلى 3000$ شهريًا عبر البوت.\n\n🎉 افتح البوت وابدأ في تحقيق دخلك الخاص عبر الإنترنت اليوم!\n\n🌐 الرجاء اختيار لغتك`,
  welcome: (name) =>
    `🎉 *مرحبًا بك في ZORY X BOT!*\n\nمرحبًا، ${name}!\n\n💰 أكمل مهام وسائل التواصل الاجتماعي لكسب USDT\n📅 سجّل حضورك يوميًا لكسب USDT\n👥 ادعُ أصدقاءك واحصل على عمولة تصل إلى 20%\n\n🚀 ادعُ أصدقاءك لتكسب من 100$ إلى 3000$ USDT شهريًا\n\n👇 اضغط أدناه لتبدأ الربح!`,
  welcomeLinks: (officialChannel, communityChannel) =>
    `🔔 الإشعارات ➔ ${officialChannel}\n📢 الإعلانات ➔ ${officialChannel}\n👥 المجتمع ➔ ${communityChannel}\n\n⚡ ابقَ على اطلاع ولا تفوّت المهام الجديدة!`,
  openApp: `🚀 افتح ZORY X BOT`,
  changeLanguage: `🌐 تغيير اللغة`,
  ownerHelpTitle: `🛠 *قائمة أوامر المالك — ZORY X BOT*`,
  ownerHelpBody: `/start — بدء البوت وعرض رسالة الترحيب\n/help — قائمة الأوامر هذه\n/announcement — إرسال رسالة لجميع المستخدمين\n/addadmin <telegram_id> — إضافة مشرف جديد (المالك فقط)\n/removeadmin <telegram_id> — إزالة مشرف (المالك فقط)\n/stats — إحصائيات المستخدمين والمشرفين\n/totalusers — إجمالي عدد من بدأ استخدام البوت\n/withdrawals — قائمة طلبات السحب المعلقة\n/approvewithdraw <id> — تحديد السحب كمُرسَل\n/rejectwithdraw <id> — رفض السحب واسترجاع الرصيد\n\nℹ️ يتم إضافة/تعديل المهام من قسم *Earn* في التطبيق المصغر.`,
  adminHelpTitle: `🛠 *قائمة أوامر المشرف — ZORY X BOT*`,
  adminHelpBody: `/announcement — إرسال رسالة لجميع المستخدمين\n/totalusers — إجمالي عدد من بدأ استخدام البوت\n/withdrawals — قائمة طلبات السحب المعلقة\n/approvewithdraw <id> — تحديد السحب كمُرسَل\n/rejectwithdraw <id> — رفض السحب واسترجاع الرصيد`,
  announcementAsk: `📢 أرسل الآن رسالة الإعلان. سيتم إرسالها لجميع المستخدمين.`,
  announcementSending: (count) => `⏳ ${count}...`,
  announcementDone: (sent, failed) => `✅ أُرسل: ${sent} / فشل: ${failed}`,
  notAdmin: `⛔ هذا الأمر للمشرفين فقط.`,
  addAdminUsage: `الاستخدام: /addadmin <telegram_id>`,
  addAdminDone: (id) => `✅ ${id}`,
  removeAdminDone: (id) => `🗑️ ${id}`,
  stats: (users, admins, tasks) => `📊 مستخدمون: ${users} | مشرفون: ${admins} | مهام: ${tasks}`,
  totalUsersText: (count) => `📊 إجمالي عدد من بدأ استخدام البوت: *${count}*`,
  checkinReminder: (streak, reward) =>
    `📅 *تذكير بتسجيل الحضور*\n\n⏰ لم تسجل حضورك اليوم بعد!\n🔥 السلسلة الحالية: ${streak} أيام\n🎁 مكافأة اليوم: ${reward} USDT\n\nلا تنسَ تسجيل حضورك يوميًا!`,
  checkInNowBtn: `📅 سجّل الآن`,
};
