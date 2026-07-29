import express from "express";
import crypto from "crypto";
import { getDatabase } from "./database.js";
import { verifyTelegramAuth } from "./auth.js";

const router = express.Router();

// ========================================
// API Status
// ========================================

router.get("/", (req, res) => {
    res.json({
        success: true,
        project: "Zoryx",
        version: "1.0.0",
        status: "Online"
    });
});

// ========================================
// Telegram Login
// ========================================

router.post("/auth", async (req, res) => {

    try {

        const result = verifyTelegramAuth(req.body);

        if (!result.success) {
            return res.status(401).json(result);
        }

        const db = getDatabase();

        const users = db.collection("users");

        let user = await users.findOne({
            telegramId: result.user.id
        });

        if (!user) {

            user = {

                uid: crypto.randomUUID(),

                telegramId: result.user.id,

                firstName: result.user.first_name,

                lastName: result.user.last_name || "",

                username: result.user.username || "",

                photoUrl: result.user.photo_url || "",

                balance: 0,

                energy: 1000,

                level: 1,

                totalTap: 0,

                referral: 0,

                createdAt: new Date()

            };

            await users.insertOne(user);

        }

        return res.json({
            success: true,
            user
        });

    } catch (error) {

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

        const { telegramId, tap } = req.body;

        if (!telegramId || !tap) {

            return res.status(400).json({
                success: false,
                message: "Invalid Request"
            });

        }

        const db = getDatabase();

        const users = db.collection("users");

        await users.updateOne(

            { telegramId },

            {
                $inc: {
                    balance: tap,
                    totalTap: tap
                }
            }

        );

        const user = await users.findOne({ telegramId });

        return res.json({

            success: true,

            balance: user.balance,

            totalTap: user.totalTap

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

});

// ========================================
// Profile
// ========================================

router.get("/profile/:telegramId", async (req, res) => {

    try {

        const db = getDatabase();

        const users = db.collection("users");

        const user = await users.findOne({

            telegramId: Number(req.params.telegramId)

        });

        if (!user) {

            return res.status(404).json({

                success: false,

                message: "User Not Found"

            });

        }

        return res.json({

            success: true,

            user

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

});

export default router;
