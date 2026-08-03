import express from 'express';
import { User } from './database.js';
// auth.js ফাইলটি পরবর্তীতে আমরা তৈরি করবো, তাই ইমপোর্ট করে রাখছি
import { validateTelegramData } from './auth.js'; 

const router = express.Router();

// গেমের বেসিক লজিক কনস্ট্যান্ট
const ENERGY_RECHARGE_PER_SECOND = 1;
const DAILY_REWARD_AMOUNT = 5000;
const LEVEL_UP_BASE_XP = 1000;

// ==========================================
// AUTHENTICATION & SYNC
// ==========================================

// POST /auth/login
router.post('/auth/login', async (req, res) => {
    try {
        const { telegramId, firstName, lastName, username, photo, referredBy } = req.body;

        if (!telegramId) return res.status(400).json({ success: false, message: 'Telegram ID is required' });

        let user = await User.findOne({ telegramId });

        if (!user) {
            user = new User({
                telegramId,
                firstName: firstName || '',
                lastName: lastName || '',
                username: username || '',
                photo: photo || '',
                referredBy: referredBy || null
            });
            await user.save();
        }

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /sync/:telegramId (Auto Energy Recovery)
router.get('/sync/:telegramId', async (req, res) => {
    try {
        const user = await User.findOne({ telegramId: req.params.telegramId });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const now = new Date();
        const lastUpdate = new Date(user.updatedAt);
        const secondsPassed = Math.floor((now - lastUpdate) / 1000);

        if (secondsPassed > 0 && user.energy < user.maxEnergy) {
            const recoveredEnergy = secondsPassed * ENERGY_RECHARGE_PER_SECOND;
            user.energy = Math.min(user.maxEnergy, user.energy + recoveredEnergy);
            await user.save();
        }

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// USER PROFILE
// ==========================================

// GET /user/:telegramId
router.get('/user/:telegramId', async (req, res) => {
    try {
        const user = await User.findOne({ telegramId: req.params.telegramId });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT /user/:telegramId
router.put('/user/:telegramId', async (req, res) => {
    try {
        const updatedUser = await User.findOneAndUpdate(
            { telegramId: req.params.telegramId },
            { $set: req.body },
            { new: true }
        );
        res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// CORE GAME MECHANICS (TAP TO EARN)
// ==========================================

// POST /tap
router.post('/tap', async (req, res) => {
    try {
        const { telegramId, tapCount } = req.body;
        const user = await User.findOne({ telegramId });

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (user.energy < tapCount) return res.status(400).json({ success: false, message: 'Not enough energy' });

        user.energy -= tapCount;
        user.balance += tapCount;
        user.totalTap += tapCount;
        user.xp += tapCount;

        // Level Up Logic
        const nextLevelXp = user.level * LEVEL_UP_BASE_XP;
        if (user.xp >= nextLevelXp) {
            user.level += 1;
            user.maxEnergy += 500;
            user.energy = user.maxEnergy; // Refill energy on level up
        }

        await user.save();
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// LEADERBOARD & STATS
// ==========================================

// GET /leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const topUsers = await User.find().sort({ balance: -1 }).limit(100).select('telegramId username firstName lastName balance level photo');
        res.status(200).json({ success: true, data: topUsers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /leaderboard/rank/:telegramId
router.get('/leaderboard/rank/:telegramId', async (req, res) => {
    try {
        const user = await User.findOne({ telegramId: req.params.telegramId });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const rank = await User.countDocuments({ balance: { $gt: user.balance } }) + 1;
        res.status(200).json({ success: true, rank });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /stats
router.get('/stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const globalTapsData = await User.aggregate([{ $group: { _id: null, total: { $sum: "$totalTap" } } }]);
        const totalTaps = globalTapsData[0]?.total || 0;
        
        res.status(200).json({ success: true, totalUsers, totalTaps });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// DAILY REWARDS
// ==========================================

// GET /daily/:telegramId
router.get('/daily/:telegramId', async (req, res) => {
    try {
        const user = await User.findOne({ telegramId: req.params.telegramId });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const now = new Date();
        let canClaim = true;

        if (user.lastDailyReward) {
            const timeDiff = now - new Date(user.lastDailyReward);
            const hoursDiff = timeDiff / (1000 * 60 * 60);
            if (hoursDiff < 24) canClaim = false;
        }

        res.status(200).json({ success: true, canClaim, rewardAmount: DAILY_REWARD_AMOUNT });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /daily/claim
router.post('/daily/claim', async (req, res) => {
    try {
        const { telegramId } = req.body;
        const user = await User.findOne({ telegramId });
        
        const now = new Date();
        if (user.lastDailyReward && (now - new Date(user.lastDailyReward)) / (1000 * 60 * 60) < 24) {
            return res.status(400).json({ success: false, message: 'Reward already claimed today' });
        }

        user.balance += DAILY_REWARD_AMOUNT;
        user.lastDailyReward = now;
        await user.save();

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// REFERRAL SYSTEM
// ==========================================

// GET /referral/:telegramId
router.get('/referral/:telegramId', async (req, res) => {
    try {
        const user = await User.findOne({ telegramId: req.params.telegramId });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        
        const referralsList = await User.find({ _id: { $in: user.referrals } }).select('username firstName lastName balance photo');
        res.status(200).json({ success: true, count: user.referrals.length, data: referralsList });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /referral/join
router.post('/referral/join', async (req, res) => {
    try {
        const { telegramId, referrerId } = req.body;
        if (telegramId === referrerId) return res.status(400).json({ success: false, message: 'Self referral not allowed' });

        const referrer = await User.findOne({ telegramId: referrerId });
        const user = await User.findOne({ telegramId });

        if (referrer && user && !user.referredBy) {
            user.referredBy = referrerId;
            referrer.referrals.push(user._id);
            await referrer.save();
            await user.save();
            return res.status(200).json({ success: true, message: 'Referral connected' });
        }
        res.status(400).json({ success: false, message: 'Referral failed or already used' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /referral/claim
router.post('/referral/claim', async (req, res) => {
    try {
        const { telegramId, amount } = req.body; // Logic for claiming referral bonus
        const user = await User.findOne({ telegramId });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        user.balance += amount;
        await user.save();
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /leaderboard/referrals
router.get('/leaderboard/referrals', async (req, res) => {
    try {
        const topReferrers = await User.aggregate([
            { $project: { telegramId: 1, username: 1, firstName: 1, photo: 1, referralCount: { $size: { $ifNull: ["$referrals", []] } } } },
            { $sort: { referralCount: -1 } },
            { $limit: 100 }
        ]);
        res.status(200).json({ success: true, data: topReferrers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ==========================================
// TASKS & SPINS
// ==========================================

// GET /tasks/:telegramId
router.get('/tasks/:telegramId', async (req, res) => {
    try {
        const user = await User.findOne({ telegramId: req.params.telegramId });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        
        const completedTasks = user.get('completedTasks') || [];
        res.status(200).json({ success: true, data: completedTasks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /task/claim
router.post('/task/claim', async (req, res) => {
    try {
        const { telegramId, taskId, reward } = req.body;
        const user = await User.findOne({ telegramId });

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const completed = user.get('completedTasks') || [];
        if (completed.includes(taskId)) {
            return res.status(400).json({ success: false, message: 'Task already claimed' });
        }

        completed.push(taskId);
        user.set('completedTasks', completed);
        user.balance += reward;

        await user.save();
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /spin/:telegramId
router.get('/spin/:telegramId', async (req, res) => {
    try {
        const user = await User.findOne({ telegramId: req.params.telegramId });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        
        const lastSpin = user.get('lastSpinDate') || null;
        res.status(200).json({ success: true, lastSpinDate: lastSpin });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST /spin
router.post('/spin', async (req, res) => {
    try {
        const { telegramId, cost, winnings } = req.body; // Frontend will send cost and calculated winnings
        const user = await User.findOne({ telegramId });

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (user.balance < cost) return res.status(400).json({ success: false, message: 'Insufficient balance' });

        user.balance -= cost;
        user.balance += winnings;
        user.set('lastSpinDate', new Date());

        await user.save();
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
