import TelegramBot from 'node-telegram-bot-api';

const token = process.env.BOT_TOKEN;

// যদি বট টোকেন না থাকে তবে ক্র্যাশ না করে ওয়ার্নিং দিবে
if (!token) {
    console.warn("⚠️ BOT_TOKEN is missing in environment variables. Telegram bot will not start.");
}

const bot = token ? new TelegramBot(token, { polling: true }) : null;

if (bot) {
    console.log("🤖 Telegram Bot is running successfully...");

    // /start কমান্ড হ্যান্ডেলার
    bot.onText(/\/start(?:\s+(.+))?/, (msg, match) => {
        const chatId = msg.chat.id;
        const firstName = msg.from.first_name || 'VIP Player';
        const startParam = match ? match[1] : ''; // রেফারেল প্যারামিটার ক্যাপচার করার জন্য

        // আপনার Render-এর মিনি অ্যাপ লিংক (ওয়েব অ্যাপ ইউআরএল)
        // যদি রেফারেল কোড থাকে তবে তা স্টার্ট অ্যাপ ইউআরএলের সাথে পাস হবে
        let webAppUrl = 'https://zoryxminibotweb.onrender.com';
        if (startParam) {
            webAppUrl = `https://zoryxminibotweb.onrender.com?startapp=${startParam}`;
        }

        const welcomeMessage = `✨ **Welcome to Zoryx, ${firstName}!** ✨\n\n` +
            `The ultimate VIP Tap-To-Earn game on Telegram.\n` +
            `Tap the coin, invite friends, complete elite tasks, and earn massive rewards!\n\n` +
            `🚀 Click the button below to launch the game and start earning!`;

        const opts = {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '🚀 Play Now',
                            web_app: { url: webAppUrl }
                        }
                    ],
                    [
                        {
                            text: '📢 Join Community',
                            url: 'https://t.me/your_community_channel' // আপনার টেলিগ্রাম চ্যানেল বা গ্রুপ লিংক এখানে দিতে পারেন
                        }
                    ]
                ]
            }
        };

        bot.sendMessage(chatId, welcomeMessage, opts);
    });
}

export default bot;
