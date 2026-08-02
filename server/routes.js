// ==========================================
// Zoryx Telegram Mini App
// server/routes.js
// Part 1
// ==========================================

"use strict";

import express from "express";
import { User } from "./database.js";

const router = express.Router();


// ==========================================
// Health Check
// ==========================================

router.get("/", (req, res) => {

    return res.json({

        success: true,

        message: "Zoryx API Running"

    });

});


// ==========================================
// Ping
// ==========================================

router.get("/ping", (req, res) => {

    return res.json({

        success: true,

        pong: true,

        timestamp: Date.now()

    });

});


// ==========================================
// Login
// POST /auth/login
// ==========================================

router.post("/auth/login", async (req, res) => {

    try {

        const data = req.body || {};

        const telegramId = Number(
            data.id ||
            data.telegramId ||
            data.user?.id
        );

        if (!telegramId) {

            return res.json({

                success: false,

                message: "Invalid Telegram User"

            });

        }

        let user = await User.findOne({

            telegramId

        });

        if (!user) {

            user = await User.create({

                telegramId,

                firstName:
                    data.first_name ||
                    data.firstName ||
                    data.user?.first_name ||
                    "",

                lastName:
                    data.last_name ||
                    data.lastName ||
                    data.user?.last_name ||
                    "",

                username:
                    data.username ||
                    data.user?.username ||
                    "",

                photo:
                    data.photo_url ||
                    data.photo ||
                    data.user?.photo_url ||
                    ""

            });

        }

        return res.json({

            success: true,

            user

        });

    }

    catch (error) {

        console.error(error);

        return res.json({

            success: false,

            message: "Login Failed"

        });

    }

});


// ==========================================
// Get User Profile
// GET /user/:telegramId
// ==========================================

router.get("/user/:telegramId", async (req, res) => {

    try {

        const telegramId = Number(

            req.params.telegramId

        );

        const user = await User.findOne({

            telegramId

        });

        if (!user) {

            return res.json({

                success: false,

                message: "User Not Found"

            });

        }

        return res.json({

            success: true,

            user

        });

    }

    catch (error) {

        console.error(error);

        return res.json({

            success: false,

            message: "Profile Load Failed"

        });

    }

});


// ==========================================
// Update User Profile
// PUT /user/:telegramId
// ==========================================

router.put("/user/:telegramId", async (req, res) => {

    try {

        const telegramId = Number(

            req.params.telegramId

        );

        const update = req.body || {};

        const user = await User.findOneAndUpdate(

            {

                telegramId

            },

            {

                $set: update

            },

            {

                new: true

            }

        );

        if (!user) {

            return res.json({

                success: false,

                message: "User Not Found"

            });

        }

        return res.json({

            success: true,

            user

        });

    }

    catch (error) {

        console.error(error);

        return res.json({

            success: false,

            message: "Profile Update Failed"

        });

    }

});


// ==========================================
// Tap Coin
// POST /tap
// ==========================================

router.post("/tap", async (req, res) => {

    try {

        const telegramId = Number(req.body.telegramId);
        const tap = Number(req.body.tap || 1);

        const user = await User.findOne({ telegramId });

        if (!user) {

            return res.json({
                success: false,
                message: "User Not Found"
            });

        }

        if (user.energy < tap) {

            return res.json({
                success: false,
                message: "Not Enough Energy"
            });

        }

        user.balance += tap;
        user.energy -= tap;
        user.totalTap += tap;
        user.xp += tap;

        const needXP = user.level * 100;

        if (user.xp >= needXP) {

            user.xp = 0;
            user.level += 1;
            user.maxEnergy += 100;
            user.energy = user.maxEnergy;

        }

        await user.save();

        return res.json({

            success: true,

            balance: user.balance,

            energy: user.energy,

            level: user.level,

            xp: user.xp

        });

    }

    catch (error) {

        console.error(error);

        return res.json({

            success: false,

            message: "Tap Failed"

        });

    }

});


// ==========================================
// Leaderboard
// GET /leaderboard
// ==========================================

router.get("/leaderboard", async (req, res) => {

    try {

        const leaderboard = await User.find()

            .sort({

                balance: -1

            })

            .limit(100)

            .lean();

        return res.json({

            success: true,

            leaderboard

        });

    }

    catch (error) {

        console.error(error);

        return res.json({

            success: false,

            leaderboard: []

        });

    }

});


// ==========================================
// User Rank
// GET /leaderboard/rank/:telegramId
// ==========================================

router.get("/leaderboard/rank/:telegramId", async (req, res) => {

    try {

        const telegramId = Number(

            req.params.telegramId

        );

        const users = await User.find()

            .sort({

                balance: -1

            })

            .select("telegramId");

        const rank =

            users.findIndex(

                user =>

                    user.telegramId === telegramId

            ) + 1;

        return res.json({

            success: true,

            rank

        });

    }

    catch (error) {

        console.error(error);

        return res.json({

            success: false,

            rank: 0

        });

    }

});


// ==========================================
// Server Statistics
// GET /stats
// ==========================================

router.get("/stats", async (req, res) => {

    try {

        const totalUsers =

            await User.countDocuments();

        const users =

            await User.find();

        let totalCoins = 0;
        let totalTaps = 0;

        users.forEach(user => {

            totalCoins += user.balance;
            totalTaps += user.totalTap;

        });

        return res.json({

            success: true,

            totalUsers,

            totalCoins,

            totalTaps

        });

    }

    catch (error) {

        console.error(error);

        return res.json({

            success: false

        });

    }

});


// ==========================================
// Sync User
// GET /sync/:telegramId
// ==========================================

router.get("/sync/:telegramId", async (req, res) => {

    try {

        const telegramId = Number(

            req.params.telegramId

        );

        const user =

            await User.findOne({

                telegramId

            });

        if (!user) {

            return res.json({

                success: false,

                message: "User Not Found"

            });

        }

        return res.json({

            success: true,

            user

        });

    }

    catch (error) {

        console.error(error);

        return res.json({

            success: false,

            message: "Sync Failed"

        });

    }

});


// ==========================================
// Daily Reward Status
// GET /daily/:telegramId
// ==========================================

router.get("/daily/:telegramId", async (req, res) => {

    try {

        const telegramId = Number(req.params.telegramId);

        const user = await User.findOne({ telegramId });

        if (!user) {

            return res.json({

                success: false,

                message: "User Not Found"

            });

        }

        const today = new Date().toDateString();

        const claimed =

            user.lastDailyReward &&

            new Date(user.lastDailyReward).toDateString() === today;

        return res.json({

            success: true,

            claimed

        });

    }

    catch (error) {

        console.error(error);

        return res.json({

            success: false

        });

    }

});


// ==========================================
// Claim Daily Reward
// POST /daily/claim
// ==========================================

router.post("/daily/claim", async (req, res) => {

    try {

        const telegramId = Number(req.body.telegramId);

        const user = await User.findOne({ telegramId });

        if (!user) {

            return res.json({

                success: false,

                message: "User Not Found"

            });

        }

        const today = new Date().toDateString();

        if (

            user.lastDailyReward &&

            new Date(user.lastDailyReward).toDateString() === today

        ) {

            return res.json({

                success: false,

                message: "Already Claimed"

            });

        }

        const reward = 500;

        user.balance += reward;

        user.lastDailyReward = new Date();

        await user.save();

        return res.json({

            success: true,

            reward,

            balance: user.balance

        });

    }

    catch (error) {

        console.error(error);

        return res.json({

            success: false

        });

    }

});


// ==========================================
// Tasks
// GET /tasks/:telegramId
// ==========================================

router.get("/tasks/:telegramId", async (req, res) => {

    return res.json({

        success: true,

        tasks: [

            {

                id: 1,

                title: "Join Telegram Channel",

                reward: 1000

            },

            {

                id: 2,

                title: "Join Telegram Group",

                reward: 1500

            },

            {

                id: 3,

                title: "Invite 1 Friend",

                reward: 2500

            },

            {

                id: 4,

                title: "Tap 100 Times",

                reward: 500

            }

        ]

    });

});


// ==========================================
// Claim Task
// POST /task/claim
// ==========================================

router.post("/task/claim", async (req, res) => {

    try {

        const telegramId = Number(req.body.telegramId);

        const reward = 1000;

        const user = await User.findOne({ telegramId });

        if (!user) {

            return res.json({

                success: false,

                message: "User Not Found"

            });

        }

        user.balance += reward;

        await user.save();

        return res.json({

            success: true,

            reward,

            balance: user.balance

        });

    }

    catch (error) {

        console.error(error);

        return res.json({

            success: false

        });

    }

});


// ==========================================
// Referral
// ==========================================

router.get("/referral/:telegramId", async (req, res) => {

    try {

        const telegramId = Number(req.params.telegramId);

        const user = await User.findOne({ telegramId });

        if (!user) {

            return res.json({

                success: false

            });

        }

        return res.json({

            success: true,

            referrals: user.referrals

        });

    }

    catch {

        return res.json({

            success: false

        });

    }

});



router.post("/referral/join", async (req, res) => {

    return res.json({

        success: true

    });

});



router.post("/referral/claim", async (req, res) => {

    return res.json({

        success: true

    });

});


// ==========================================
// Lucky Spin
// ==========================================

router.get("/spin/:telegramId", async (req, res) => {

    return res.json({

        success: true,

        available: true

    });

});



router.post("/spin", async (req, res) => {

    try {

        const telegramId = Number(req.body.telegramId);

        const rewards = [

            100,

            250,

            500,

            1000,

            2500,

            5000,

            10000

        ];

        const reward =

            rewards[

                Math.floor(

                    Math.random() *

                    rewards.length

                )

            ];

        const user = await User.findOne({

            telegramId

        });

        if (!user) {

            return res.json({

                success: false,

                message: "User Not Found"

            });

        }

        user.balance += reward;

        await user.save();

        return res.json({

            success: true,

            reward,

            balance: user.balance

        });

    }

    catch (error) {

        console.error(error);

        return res.json({

            success: false

        });

    }

});


// ==========================================
// Top Referral Leaderboard
// ==========================================

router.get("/leaderboard/referrals", async (req, res) => {

    try {

        const leaderboard = await User.find()

            .sort({

                referrals: -1

            })

            .limit(100)

            .lean();

        return res.json({

            success: true,

            leaderboard

        });

    }

    catch {

        return res.json({

            success: false,

            leaderboard: []

        });

    }

});


// ==========================================
// Export Router
// ==========================================

export default router;
