// ========================================
// Zoryx Telegram WebApp
// server/routes.js
// ========================================

import express from "express";
import crypto from "crypto";

import { getDatabase } from "./database.js";
import { verifyTelegramAuth } from "./auth.js";

const router = express.Router();



// ========================================
// Config
// ========================================

const DEFAULT_ENERGY = 1000;
const DEFAULT_LEVEL = 1;
const ENERGY_RESTORE_TIME = 4000;



// ========================================
// Energy Calculator
// ========================================

function calculateEnergy(user) {

    let energy = user.energy ?? DEFAULT_ENERGY;

    let lastEnergyUpdate = user.lastEnergyUpdate
        ? new Date(user.lastEnergyUpdate).getTime()
        : Date.now();

    const now = Date.now();

    const restoreCount = Math.floor(

        (now - lastEnergyUpdate) /

        ENERGY_RESTORE_TIME

    );

    if (restoreCount > 0) {

        energy += restoreCount;

        if (energy > (user.maxEnergy || DEFAULT_ENERGY)) {

            energy = user.maxEnergy || DEFAULT_ENERGY;

        }

        lastEnergyUpdate = now;

    }

    return {

        energy,

        lastEnergyUpdate: new Date(lastEnergyUpdate)

    };

}



// ========================================
// Health Check
// ========================================

router.get("/", (req, res) => {

    res.json({

        success: true,

        project: "Zoryx",

        version: "1.0.0",

        server: "Online",

        database: "MongoDB"

    });

});


// ========================================
// Telegram Login
// ========================================

router.post("/auth/login", async (req, res) => {

    try {

        const auth = verifyTelegramAuth(req.body);

        if (!auth.success) {

            return res.status(401).json(auth);

        }

        const db = getDatabase();

        const users = db.collection("users");

        const telegramUser = auth.user;

        let user = await users.findOne({

            telegramId: telegramUser.id

        });

        if (!user) {

            user = {

                uid: crypto.randomUUID(),

                telegramId: telegramUser.id,

                firstName: telegramUser.first_name || "User",

                lastName: telegramUser.last_name || "",

                username: telegramUser.username || "",

                photo: telegramUser.photo_url || "",

                balance: 0,

                energy: DEFAULT_ENERGY,

                maxEnergy: DEFAULT_ENERGY,

                totalTap: 0,

                level: DEFAULT_LEVEL,

                referrals: 0,

                createdAt: new Date(),

                updatedAt: new Date(),

                lastEnergyUpdate: new Date()

            };

            await users.insertOne(user);

        } else {

            const energyData = calculateEnergy(user);

            user.energy = energyData.energy;

            user.lastEnergyUpdate = energyData.lastEnergyUpdate;

            user.firstName = telegramUser.first_name || user.firstName;

            user.lastName = telegramUser.last_name || user.lastName;

            user.username = telegramUser.username || user.username;

            user.photo = telegramUser.photo_url || user.photo;

            user.updatedAt = new Date();

            await users.updateOne(

                {

                    telegramId: user.telegramId

                },

                {

                    $set: {

                        firstName: user.firstName,

                        lastName: user.lastName,

                        username: user.username,

                        photo: user.photo,

                        energy: user.energy,

                        lastEnergyUpdate: user.lastEnergyUpdate,

                        updatedAt: user.updatedAt

                    }

                }

            );

        }

        return res.json({

            success: true,

            user

        });

    }

    catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

});


// ========================================
// Get User Profile
// ========================================

router.get("/user/:telegramId", async (req, res) => {

    try {

        const telegramId = Number(req.params.telegramId);

        const db = getDatabase();

        const users = db.collection("users");

        let user = await users.findOne({

            telegramId

        });

        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User Not Found"

            });

        }

        const energyData = calculateEnergy(user);

        user.energy = energyData.energy;

        user.lastEnergyUpdate = energyData.lastEnergyUpdate;

        await users.updateOne(

            {

                telegramId

            },

            {

                $set: {

                    energy: user.energy,

                    lastEnergyUpdate: user.lastEnergyUpdate

                }

            }

        );

        return res.json({

            success: true,

            user

        });

    }

    catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

});



// ========================================
// Update User Profile
// ========================================

router.put("/user/:telegramId", async (req, res) => {

    try {

        const telegramId = Number(req.params.telegramId);

        const db = getDatabase();

        const users = db.collection("users");

        await users.updateOne(

            {

                telegramId

            },

            {

                $set: {

                    ...req.body,

                    updatedAt: new Date()

                }

            }

        );

        const user = await users.findOne({

            telegramId

        });

        return res.json({

            success: true,

            user

        });

    }

    catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

});


// ========================================
// Tap
// ========================================

router.post("/tap", async (req, res) => {

    try {

        const telegramId = Number(req.body.telegramId);

        const tap = Math.max(
            1,
            Number(req.body.tap) || 1
        );

        const db = getDatabase();

        const users = db.collection("users");

        let user = await users.findOne({

            telegramId

        });

        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User Not Found"

            });

        }

        const energyData = calculateEnergy(user);

        let energy = energyData.energy;

        if (energy <= 0) {

            return res.json({

                success: false,

                message: "Energy Empty",

                energy: 0

            });

        }

        const realTap = Math.min(

            tap,

            energy

        );

        energy -= realTap;

        await users.updateOne(

            {

                telegramId

            },

            {

                $inc: {

                    balance: realTap,

                    totalTap: realTap

                },

                $set: {

                    energy,

                    lastEnergyUpdate: new Date(),

                    updatedAt: new Date()

                }

            }

        );

        const updatedUser = await users.findOne({

            telegramId

        });

        return res.json({

            success: true,

            balance: updatedUser.balance,

            energy: updatedUser.energy,

            totalTap: updatedUser.totalTap,

            level: updatedUser.level

        });

    }

    catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

});



// ========================================
// Balance Add
// ========================================

router.post("/balance/add", async (req, res) => {

    try {

        const telegramId = Number(req.body.telegramId);

        const amount = Number(req.body.amount);

        if (amount <= 0) {

            return res.json({

                success: false,

                message: "Invalid Amount"

            });

        }

        const db = getDatabase();

        const users = db.collection("users");

        await users.updateOne(

            {

                telegramId

            },

            {

                $inc: {

                    balance: amount

                },

                $set: {

                    updatedAt: new Date()

                }

            }

        );

        const user = await users.findOne({

            telegramId

        });

        res.json({

            success: true,

            balance: user.balance

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

});



// ========================================
// Referrals
// ========================================

router.get("/referrals/:telegramId", async (req, res) => {

    try {

        const telegramId = Number(req.params.telegramId);

        const db = getDatabase();

        const user = await db.collection("users").findOne({

            telegramId

        });

        res.json({

            success: true,

            referrals: user?.referrals || 0

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

});



// ========================================
// Leaderboard
// ========================================

router.get("/leaderboard", async (req, res) => {

    try {

        const db = getDatabase();

        const leaderboard = await db
            .collection("users")
            .find(
                {},
                {
                    projection: {

                        firstName: 1,

                        username: 1,

                        photo: 1,

                        balance: 1,

                        level: 1

                    }

                }
            )
            .sort({

                balance: -1

            })
            .limit(50)
            .toArray();

        res.json({

            success: true,

            leaderboard

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

});



// ========================================
// Export Router
// ========================================

export default router;
