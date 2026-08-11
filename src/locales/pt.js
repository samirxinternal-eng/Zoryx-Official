module.exports = {
  chooseLanguage: `🌐 Escolha seu idioma:`,
  languageSet: `✅ Idioma definido para português!`,
  marketingIntro: `🚀 O volume de tarefas e os ganhos estão disparando, e o bot está funcionando perfeitamente!\n\n💰 Centenas de novas tarefas surgem diariamente, e alguns usuários já ganham entre $100 e $3000 por mês através do bot.\n\n🎉 Abra o bot e comece a gerar sua própria renda online hoje mesmo!\n\n🌐 Por favor, selecione seu idioma`,
  welcome: (name) =>
    `🎉 *Bem-vindo ao ZORY X BOT!*\n\nOlá, ${name}!\n\n💰 Complete tarefas de redes sociais para ganhar USDT\n📅 Faça check-in diário para ganhar USDT\n👥 Convide amigos e ganhe até 20% de comissão\n\n🚀 Convide amigos e ganhe de $100 a $3000 USDT por mês\n\n👇 Toque abaixo para começar a ganhar!`,
  welcomeLinks: (officialChannel, communityChannel) =>
    `🔔 Notificações ➔ ${officialChannel}\n📢 Anúncios ➔ ${officialChannel}\n👥 Comunidade ➔ ${communityChannel}\n\n⚡ Fique atualizado e não perca novas tarefas!`,
  openApp: `🚀 Abrir ZORY X BOT`,
  changeLanguage: `🌐 Mudar idioma`,
  ownerHelpTitle: `🛠 *Lista de comandos do proprietário — ZORY X BOT*`,
  ownerHelpBody: `/start — Iniciar o bot e mostrar mensagem de boas-vindas\n/help — Esta lista de comandos\n/announcement — Transmitir mensagem para todos os usuários\n/addadmin <telegram_id> — Adicionar novo administrador (somente proprietário)\n/removeadmin <telegram_id> — Remover administrador (somente proprietário)\n/stats — Estatísticas de usuários/administradores do bot\n/totalusers — Total de usuários que iniciaram o bot\n/withdrawals — Listar solicitações de saque pendentes\n/approvewithdraw <id> — Marcar saque como enviado\n/rejectwithdraw <id> — Rejeitar saque e reembolsar o saldo\n\nℹ️ As tarefas são adicionadas/editadas na seção *Earn* do Mini App.`,
  adminHelpTitle: `🛠 *Lista de comandos do administrador — ZORY X BOT*`,
  adminHelpBody: `/announcement — Transmitir mensagem para todos os usuários\n/totalusers — Total de usuários que iniciaram o bot\n/withdrawals — Listar solicitações de saque pendentes\n/approvewithdraw <id> — Marcar saque como enviado\n/rejectwithdraw <id> — Rejeitar saque e reembolsar o saldo`,
  announcementAsk: `📢 Agora envie sua mensagem de anúncio. Ela será transmitida a todos os usuários.`,
  announcementSending: (count) => `⏳ ${count}...`,
  announcementDone: (sent, failed) => `✅ Enviado: ${sent} / Falhou: ${failed}`,
  notAdmin: `⛔ Este comando é apenas para administradores.`,
  addAdminUsage: `Uso: /addadmin <telegram_id>`,
  addAdminDone: (id) => `✅ ${id}`,
  removeAdminDone: (id) => `🗑️ ${id}`,
  stats: (users, admins, tasks) => `📊 usuários: ${users} | admins: ${admins} | tarefas: ${tasks}`,
  totalUsersText: (count) => `📊 Total de usuários que iniciaram o bot: *${count}*`,
};
