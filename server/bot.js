const { Telegraf } = require('telegraf');

// Replace with your actual bot token or load from environment variables
const BOT_TOKEN = process.env.BOT_TOKEN || '8759518055:AAFt-nlhikzxY5tWBAC6DFxREY5AAIiedb8';

const bot = new Telegraf(BOT_TOKEN);

// Start command with Web App Launch and Referral parameter handling
bot.start((ctx) => {
    const startPayload = ctx.payload; // Captures referral ID if user started via t.me/bot?start=xxx
    const webAppUrl = process.env.WEBAPP_URL || 'https://zoryxminibotweb.onrender.com';

    ctx.reply(
        `Welcome to Zoryx VIP Tap-to-Earn! 🪙\n\nTap the button below to launch the app and start earning coins and XP.`,
        {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '🚀 Launch Zoryx App',
                            web_app: { url: webAppUrl }
                        }
                    ],
                    [
                        {
                            text: '📢 Join Channel',
                            url: 'https://t.me/'
                        },
                        {
                            text: '💬 Support Chat',
                            url: 'https://t.me/'
                        }
                    ]
                ]
            }
        }
    );
});

// Launch bot with conflict resolution (drops pending updates to prevent 409 Conflict)
async function startBot() {
    try {
        await bot.telegram.deleteWebhook({ drop_pending_updates: true });
        console.log("Webhook cleared successfully.");
        
        await bot.launch();
        console.log("🤖 Telegram Bot is running successfully...");
    } catch (error) {
        console.error("Bot launch error:", error);
    }
}

startBot();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = bot;
