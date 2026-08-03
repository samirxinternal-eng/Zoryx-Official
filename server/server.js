import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// টেলিগ্রাম বট ইম্পোর্ট (যাতে সার্ভার স্টার্ট হওয়ার সাথে বটও রান হয়)
import './bot.js';

// এনভায়রনমেন্ট ভেরিয়েবল কনফিগারেশন
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

// মিডলওয়্যার
app.use(cors());
app.use(express.json());

// ফ্রন্টএন্ড স্ট্যাটিক ফাইল সার্ভ করার জন্য (public বা client ফোল্ডার)
const clientPath = path.join(__dirname, '../client');
app.use(express.static(clientPath));

// --- MONGODB DATABASE CONNECTION ---
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI is missing in environment variables!");
}

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("✅ MongoDB Connected Successfully.");
})
.catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
});

// --- API SCHEMAS & MODELS ---
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
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// --- API ROUTES ---

// ১. Login / Register Route
app.post('/api/auth/login', async (req, res) => {
    try {
        const { telegramId, firstName, lastName, username, photo, referredBy } = req.body;
        if (!telegramId) {
            return res.status(400).json({ success: false, message: 'Telegram ID is required' });
        }

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

            // যদি রেফারেল থাকে তবে ইনভাইটকারীকে বোনাস দেওয়া যেতে পারে
            if (referredBy && referredBy !== telegramId) {
                await User.updateOne({ telegramId: referredBy }, { $inc: { balance: 1000, xp: 500 } });
            }
        } else {
            // ইনফো আপডেট করা
            user.firstName = firstName || user.firstName;
            user.lastName = lastName || user.lastName;
            user.username = username || user.username;
            user.photo = photo || user.photo;
            await user.save();
        }

        res.json({ success: true, data: user });
    } catch (error) {
        console.error("Auth login error:", error);
        res.status(500, ).json({ success: false, message: 'Internal server error' });
    }
});

// ২. Sync User Data Route
app.get('/api/sync/:telegramId', async (req, res) => {
    try {
        const { telegramId } = req.params;
        const user = await User.findOne({ telegramId });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ৩. Tap & Earn Route
app.post('/api/tap', async (req, res) => {
    try {
        const { telegramId, tapCount } = req.body;
        if (!telegramId || !tapCount) {
            return res.status(400).json({ success: false, message: 'Invalid data' });
        }

        const user = await User.findOne({ telegramId });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.balance += tapCount;
        user.totalTap += tapCount;
        user.xp += tapCount;

        // লেভেল আপ লজিক (প্রতি ১০০০ XP তে লেভেল ১ বৃদ্ধি)
        const calculatedLevel = Math.floor(user.xp / 1000) + 1;
        if (calculatedLevel > user.level) {
            user.level = calculatedLevel;
        }

        // এনার্জি রিডিউস করা
        user.energy = Math.max(0, user.energy - tapCount);

        await user.save();
        res.json({ success: true, data: user });
    } catch (error) {
        console.error("Tap error:", error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ৪. Leaderboard Route
app.get('/api/leaderboard', async (req, res) => {
    try {
        const topUsers = await User.find().sort({ balance: -1 }).limit(50).select('username firstName balance level');
        res.json({ success: true, data: topUsers });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ৫. Referral Join Route
app.post('/api/referral/join', async (req, res) => {
    try {
        const { telegramId, referrerId } = req.body;
        if (!telegramId || !referrerId || telegramId === referrerId) {
            return res.status(400).json({ success: false, message: 'Invalid referral' });
        }

        const user = await User.findOne({ telegramId });
        if (user && !user.referredBy) {
            user.referredBy = referrerId;
            await user.save();
            await User.updateOne({ telegramId: referrerId }, { $inc: { balance: 500 } });
        }
        res.json({ success: true, message: 'Referral processed' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ফলব্যাক রুট (সরাসরি ফ্রন্টএন্ড ইনডেক্সে রিডাইরেক্ট করার জন্য)
app.get('*', (req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
});

// সার্ভার লিসেনিং
app.listen(PORT, () => {
    console.log(`🚀 Zoryx VIP Server is running on port ${PORT}`);
});
