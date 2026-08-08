module.exports = {
  chooseLanguage: '🌐 اختر لغتك:',
  languageSet: '✅ تم ضبط اللغة على العربية!',
  welcome: (name) =>
    `👋 مرحباً، *${name}*!\n\n✨ مرحباً بك في *ZORY X BOT* — أكمل المهام، اكسب العملات، ادعُ أصدقاءك وتصدّر لوحة المتصدرين!\n\n👇 اضغط على الزر أدناه لفتح التطبيق.`,
  openApp: '🚀 افتح ZORY X BOT',
  changeLanguage: '🌐 تغيير اللغة',
  helpTitle: '🛠 *قائمة أوامر المشرف — ZORY X BOT*',
  helpBody:
    '/start — بدء البوت ورسالة الترحيب\n' +
    '/help — قائمة الأوامر هذه (للمشرفين فقط)\n' +
    '/announcement — إرسال رسالة لجميع المستخدمين\n' +
    '/addadmin <telegram_id> — إضافة مشرف جديد (المالك فقط)\n' +
    '/removeadmin <telegram_id> — إزالة مشرف (المالك فقط)\n' +
    '/stats — إحصائيات المستخدمين والمشرفين\n' +
    '/withdrawals — قائمة طلبات السحب المعلقة (المالك فقط)\n' +
    '/approvewithdraw <id> — تحديد السحب كمُرسَل\n' +
    '/rejectwithdraw <id> — رفض السحب واسترجاع الرصيد\n\n' +
    'ℹ️ يتم إضافة/تعديل المهام من قسم *Earn* في التطبيق المصغر (زر إضافة مهمة يظهر للمشرفين فقط).',
  announcementAsk: '📢 أرسل الآن رسالة الإعلان. سيتم إرسالها لجميع المستخدمين.',
  announcementSending: (count) => `⏳ جارٍ الإرسال إلى ${count} مستخدم...`,
  announcementDone: (sent, failed) => `✅ اكتمل الإعلان!\nتم الإرسال: ${sent}\nفشل: ${failed}`,
  notAdmin: '⛔ هذا الأمر للمشرفين فقط.',
  addAdminUsage: 'الاستخدام: /addadmin <telegram_id>',
  addAdminDone: (id) => `✅ تمت إضافة ${id} كمشرف.`,
  removeAdminDone: (id) => `🗑 تمت إزالة ${id} من المشرفين.`,
  stats: (users, admins, tasks) =>
    `📊 *الإحصائيات*\n👥 إجمالي المستخدمين: ${users}\n🛡 إجمالي المشرفين: ${admins}\n📝 إجمالي المهام: ${tasks}`,
};
