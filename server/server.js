const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Telegraf } = require('telegraf');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('client')); // Serves frontend files from 'client' folder

// MongoDB Connection (Cleaned up deprecated options to avoid warnings)
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://samir:samir@cluster0.mongodb.net/zoryxdb?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected Successfully.'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// User Schema & Model
const userSchema = new mongoose.Schema({
    telegramId: { type: String, required: true, unique: true },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    username: { type: String, default: '' },
    photo: { type: String, default: '' },
    balance: { type: Number, default: 0 },
    energy: { type: Number, default: 1000 },
    maxEnergy: { type: Number, default: 1000 },
    totalTap: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    referredBy: { type: String, default: null },
    referralCount: { type: Number, default: 0 },
    referralEarnings: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// ================= API ROUTES =================

// 1. User Login / Registration
app.post('/api/login', async (req, res) => {
    try {
        const { telegramId, firstName, lastName, username, photo, referredBy } = req.body;
        if (!telegramId) return res.status(400).json({ success: false, message: 'Telegram ID is required' });

        let user = await User.findOne({ telegramId });

        if (!user) {
            user = new User({
                telegramId,
                firstName,
                lastName,
                username,
                photo,
                referredBy: referredBy && referredBy !== telegramId ? referredBy : null
            });
            await user.save();

            // Handle referral bonus if referred by someone valid
            if (user.referredBy) {
                const referrer = await User.findOne({ telegramId: user.referredBy });
                if (referrer) {
                    referrer.referralCount += 1;
                    referrer.balance += 5000; // Bonus coins for referrer
                    referrer.referralEarnings += 5000;
                    await referrer.save();
                }
            }
        } else {
            // Update info if changed
            user.firstName = firstName || user.firstName;
            user.lastName = lastName || user.lastName;
            user.username = username || user.username;
            user.photo = photo || user.photo;
            await user.save();
        }

        res.json({ success: true, data: user });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// 2. Sync / Get User Data
app.get('/api/user/:telegramId', async (req, res) => {
    try {
        const user = await User.findOne({ telegramId: req.params.telegramId });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// 3. Handle Taps & XP / Energy update
app.post('/api/tap', async (req, res) => {
    try {
        const { telegramId, taps } = req.body;
        if (!telegramId || typeof taps !== 'number') {
            return res.status(400).json({ success: false, message: 'Invalid data' });
        }

        const user = await User.findOne({ telegramId });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Update coins, taps, xp, and energy
        user.balance += taps;
        user.totalTap += taps;
        user.xp += taps;
        user.energy = Math.max(0, user.energy - taps);
        
        // Level calculation (Every 1000 XP = 1 Level)
        const calculatedLevel = Math.floor(user.xp / 1000) + 1;
        if (calculatedLevel > user.level) {
            user.level = calculatedLevel;
        }

        user.lastUpdated = Date.now();
        await user.save();

        res.json({ success: true, data: user });
    } catch (error) {
        console.error('Tap sync error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// 4. Leaderboard Route
app.get('/api/leaderboard', async (req, res) => {
    try {
        const topUsers = await User.find().sort({ balance: -1 }).limit(20).select('username firstName balance level');
        res.json({ success: true, data: topUsers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ================= TELEGRAM BOT INTEGRATION =================
const BOT_TOKEN = process.env.BOT_TOKEN || '8759518055:AAFt-nlhikzxY5tWBAC6DFxREY5AAIiedb8';
const bot = new Telegraf(BOT_TOKEN);
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://zoryxminibotweb.onrender.com';

bot.start((ctx) => {
    ctx.reply(
        `Welcome to Zoryx VIP Tap-to-Earn! 🪙\n\nTap the button below to launch the app and start earning.`,
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🚀 Launch Zoryx App', web_app: { url: WEBAPP_URL } }],
                    [{ text: '📢 Channel', url: 'https://t.me/' }, { text: '💬 Support', url: 'https://t.me/' }]
                ]
            }
        }
    );
});

// Start Express Server & Bot together securely with conflict clearance
app.listen(PORT, async () => {
    console.log(`🚀 Zoryx VIP Server is running on port ${PORT}`);
    
    try {
        await bot.telegram.deleteWebhook({ drop_pending_updates: true });
        console.log('🧹 Telegram Webhook cleared successfully.');
        
        await bot.launch();
        console.log('🤖 Telegram Bot is running successfully...');
    } catch (err) {
        console.error('Bot launch error:', err);
    }
});

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
