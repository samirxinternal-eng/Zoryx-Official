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
// POST /api/auth/login
// ========================================

router.post("/auth/login", async (req, res) => {

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

                firstName:
                    result.user.first_name || "User",

                lastName:
                    result.user.last_name || "",

                username:
                    result.user.username || "",

                photo:
                    result.user.photo_url || "",


                balance: 0,

                energy: 1000,

                maxEnergy: 1000,

                level: 1,

                totalTap: 0,

                referrals: 0,

                lastReward: null,

                createdAt: new Date()

            };


            await users.insertOne(user);

        }


        res.json({

            success: true,

            user

        });


    } catch (error) {


        res.status(500).json({

            success: false,

            message: error.message

        });


    }

});



// ========================================
// Get User Profile
// GET /api/user/:telegramId
// ========================================

router.get("/user/:telegramId", async (req, res) => {


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



        res.json({

            success: true,

            user

        });



    } catch (error) {


        res.status(500).json({

            success: false,

            message: error.message

        });


    }


});



// ========================================
// Update User
// PUT /api/user/:telegramId
// ========================================

router.put("/user/:telegramId", async (req, res) => {


    try {


        const db = getDatabase();

        const users = db.collection("users");


        await users.updateOne(

            {
                telegramId: Number(req.params.telegramId)
            },

            {
                $set: req.body
            }

        );


        const user = await users.findOne({

            telegramId: Number(req.params.telegramId)

        });



        res.json({

            success: true,

            user

        });



    } catch (error) {


        res.status(500).json({

            success: false,

            message: error.message

        });


    }


});



// ========================================
// Balance
// GET /api/balance/:telegramId
// ========================================

router.get("/balance/:telegramId", async (req, res) => {


    try {


        const db = getDatabase();

        const users = db.collection("users");


        const user = await users.findOne({

            telegramId: Number(req.params.telegramId)

        });


        res.json({

            success: true,

            balance: user?.balance || 0

        });



    } catch(error) {


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


});



// ========================================
// Add Balance
// POST /api/balance/add
// ========================================

router.post("/balance/add", async(req,res)=>{


    try{


        const {
            userId,
            amount
        } = req.body;



        const db = getDatabase();

        const users = db.collection("users");


        await users.updateOne(

            {
                telegramId:Number(userId)
            },

            {

                $inc:{
                    balance:Number(amount)
                }

            }

        );



        res.json({

            success:true

        });



    }catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


});



// ========================================
// Daily Reward
// POST /api/reward/daily
// ========================================

router.post("/reward/daily", async(req,res)=>{


    try{


        const {
            userId
        } = req.body;



        const reward = 100;


        const db = getDatabase();

        const users = db.collection("users");


        await users.updateOne(

            {
                telegramId:Number(userId)
            },

            {

                $inc:{
                    balance:reward
                },

                $set:{
                    lastReward:new Date()
                }

            }

        );



        res.json({

            success:true,

            message:`+${reward} Zoryx Coin Reward Added`

        });



    }catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


});



// ========================================
// Referrals
// GET /api/referrals/:telegramId
// ========================================

router.get("/referrals/:telegramId", async(req,res)=>{


    try{


        const db=getDatabase();

        const users=db.collection("users");


        const user=await users.findOne({

            telegramId:Number(req.params.telegramId)

        });


        res.json({

            success:true,

            referrals:user?.referrals || 0

        });


    }catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


});



// ========================================
// Leaderboard
// GET /api/leaderboard
// ========================================

router.get("/leaderboard", async(req,res)=>{


    try{


        const db=getDatabase();

        const users=db.collection("users");


        const leaderboard =
            await users
            .find({})
            .sort({
                balance:-1
            })
            .limit(20)
            .toArray();



        res.json({

            success:true,

            leaderboard

        });



    }catch(error){


        res.status(500).json({

            success:false,

            message:error.message

        });


    }


});



export default router;
