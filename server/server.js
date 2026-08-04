// ======================================================
// ZORYX TELEGRAM MINI APP
// server/server.js
// PART 1
// ======================================================

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const { Telegraf } = require("telegraf");

const app = express();

// ======================================================
// CONFIG
// ======================================================

const PORT = process.env.PORT || 10000;

const BOT_TOKEN = process.env.BOT_TOKEN;

const WEBAPP_URL =
process.env.WEBAPP_URL ||
"https://zoryxminibotweb.onrender.com";

const MONGO_URI =
process.env.MONGO_URI;

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(cors());

app.use(express.json({
    limit:"10mb"
}));

app.use(express.urlencoded({
    extended:true
}));

app.use(express.static(
    path.join(__dirname,"../client")
));

// ======================================================
// TELEGRAM BOT
// ======================================================

const bot = new Telegraf(BOT_TOKEN);

// ======================================================
// MONGODB CONNECT
// ======================================================

mongoose.connect(MONGO_URI)

.then(()=>{

    console.log("✅ MongoDB Connected Successfully.");

})

.catch((err)=>{

    console.error(
        "❌ MongoDB Connection Error:",
        err.message
    );

});

// ======================================================
// USER SCHEMA
// ======================================================

const userSchema = new mongoose.Schema({

    telegramId:{
        type:String,
        required:true,
        unique:true
    },

    firstName:{
        type:String,
        default:""
    },

    lastName:{
        type:String,
        default:""
    },

    username:{
        type:String,
        default:""
    },

    photo:{
        type:String,
        default:""
    },

    balance:{
        type:Number,
        default:0
    },

    energy:{
        type:Number,
        default:1000
    },

    maxEnergy:{
        type:Number,
        default:1000
    },

    totalTap:{
        type:Number,
        default:0
    },

    xp:{
        type:Number,
        default:0
    },

    level:{
        type:Number,
        default:1
    },

    tapPower:{
        type:Number,
        default:1
    },

    referredBy:{
        type:String,
        default:null
    },

    referralCount:{
        type:Number,
        default:0
    },

    referralEarnings:{
        type:Number,
        default:0
    },

    referralRewardGiven:{
        type:Boolean,
        default:false
    },

    dailyRewardClaimed:{
        type:Boolean,
        default:false
    },

    lastDailyClaim:{
        type:Date,
        default:null
    },

    lastTapTime:{
        type:Number,
        default:0
    },

    createdAt:{
        type:Date,
        default:Date.now
    },

    updatedAt:{
        type:Date,
        default:Date.now
    }

});

// ======================================================
// AUTO UPDATE DATE
// ======================================================

userSchema.pre("save",function(next){

    this.updatedAt = new Date();

    next();

});

// ======================================================
// MODEL
// ======================================================

const User = mongoose.model(
    "User",
    userSchema
);

// ======================================================
// HEALTH CHECK
// ======================================================

app.get("/",(req,res)=>{

    res.json({

        success:true,

        app:"Zoryx Telegram Mini App",

        status:"Running"

    });

});

// ======================================================
// PART 1 END
// ======================================================


// ======================================================
// PART 1A
// GLOBAL CONFIG & HELPER FUNCTIONS
// ======================================================

// Energy Settings
const ENERGY_RECHARGE_TIME = 2;      // 2 seconds = +1 Energy
const MAX_TAPS_PER_SECOND = 15;
const REFERRAL_REWARD = 5000;
const NEW_USER_REWARD = 1000;
const XP_PER_TAP = 1;

// ======================================================
// GET USER LEVEL
// ======================================================

function getLevelFromXP(xp){

    return Math.floor(xp / 1000) + 1;

}

// ======================================================
// GET REQUIRED XP
// ======================================================

function getNextLevelXP(level){

    return level * 1000;

}

// ======================================================
// ENERGY RECHARGE
// ======================================================

function rechargeEnergy(user){

    const now = Date.now();

    const lastUpdate = new Date(
        user.updatedAt
    ).getTime();

    const secondsPassed = Math.floor(

        (now - lastUpdate) / 1000

    );

    if(secondsPassed >= ENERGY_RECHARGE_TIME){

        const energyGain = Math.floor(

            secondsPassed /
            ENERGY_RECHARGE_TIME

        );

        user.energy = Math.min(

            user.maxEnergy,

            user.energy + energyGain

        );

    }

}

// ======================================================
// SAFE USER RESPONSE
// ======================================================

function buildUserResponse(user){

    return{

        telegramId:user.telegramId,

        firstName:user.firstName,

        lastName:user.lastName,

        username:user.username,

        photo:user.photo,

        balance:user.balance,

        energy:user.energy,

        maxEnergy:user.maxEnergy,

        totalTap:user.totalTap,

        xp:user.xp,

        level:user.level,

        tapPower:user.tapPower,

        referralCount:user.referralCount,

        referralEarnings:user.referralEarnings

    };

}

// ======================================================
// API ERROR
// ======================================================

function serverError(res,error){

    console.error(error);

    return res.status(500).json({

        success:false,

        message:"Internal Server Error"

    });

}

// ======================================================
// PART 1A END
// ======================================================

