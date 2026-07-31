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

const ENERGY_RESTORE_TIME = 4000;

const MAX_TAP_PER_SECOND = 30;

// ========================================
// Energy Calculator
// ========================================

function calculateEnergy(user){

    let energy =
    user.energy ??
    DEFAULT_ENERGY;

    let last =
    user.lastEnergyUpdate
    ?
    new Date(
        user.lastEnergyUpdate
    ).getTime()
    :
    Date.now();

    const now =
    Date.now();

    const restore =
    Math.floor(

        (now-last) /

        ENERGY_RESTORE_TIME

    );

    if(restore>0){

        energy += restore;

        if(

            energy >

            (user.maxEnergy ??
            DEFAULT_ENERGY)

        ){

            energy =
            user.maxEnergy ??
            DEFAULT_ENERGY;

        }

        last = now;

    }

    return{

        energy,

        lastEnergyUpdate:
        new Date(last)

    };

}

// ========================================
// Anti Auto Click
// ========================================

function detectAutoClick(user){

    const now =
    Date.now();

    const last =
    user.lastTapTime
    ?
    new Date(
        user.lastTapTime
    ).getTime()
    :
    now;

    const diff =
    now-last;

    let tapCount =
    user.tapCount || 0;

    if(diff<=1000){

        tapCount++;

    }
    else{

        tapCount=1;

    }

    return{

        blocked:
        tapCount>
        MAX_TAP_PER_SECOND,

        tapCount,

        lastTapTime:
        new Date(now)

    };

}

// ========================================
// Home
// ========================================

router.get(
"/",
(req,res)=>{

    res.json({

        success:true,

        project:"Zoryx",

        version:"1.0.0",

        server:"Online",

        database:"MongoDB"

    });

});

// ========================================
// Telegram Login
// ========================================

router.post(
"/auth/login",
async(req,res)=>{

try{

    const auth =

    verifyTelegramAuth(
        req.body
    );

    if(!auth.success){

        return res
        .status(401)
        .json(auth);

    }

    const db =
    getDatabase();

    const users =
    db.collection(
        "users"
    );

    let user =
    await users.findOne({

        telegramId:
        auth.user.id

    });

    if(!user){

        user={

            uid:
            crypto.randomUUID(),

            telegramId:
            auth.user.id,

            firstName:
            auth.user.first_name || "User",

            lastName:
            auth.user.last_name || "",

            username:
            auth.user.username || "",

            photo:
            auth.user.photo_url || "",

            balance:0,

            totalTap:0,

            energy:
            DEFAULT_ENERGY,

            maxEnergy:
            DEFAULT_ENERGY,

            level:1,

            xp:0,

            referrals:0,

            completedTasks:[],

            claimedDaily:false,

            spinUsed:false,

            tapCount:0,

            lastTapTime:
            new Date(),

            lastEnergyUpdate:
            new Date(),

            createdAt:
            new Date()

        };

        await users.insertOne(
            user
        );

    }

    else{

        const energy =
        calculateEnergy(
            user
        );

        await users.updateOne(

        {

            telegramId:
            user.telegramId

        },

        {

            $set:energy

        }

        );

        user.energy =
        energy.energy;

    }

    res.json({

        success:true,

        user

    });

}
catch(error){

    res.status(500).json({

        success:false,

        message:error.message

    });

}

});



