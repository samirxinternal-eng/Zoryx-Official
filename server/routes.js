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


// ========================================
// Get User Profile
// ========================================

router.get(
"/user/:telegramId",
async(req,res)=>{

try{

    const telegramId =
    Number(
        req.params.telegramId
    );

    const db =
    getDatabase();

    const users =
    db.collection(
        "users"
    );

    let user =
    await users.findOne({

        telegramId

    });

    if(!user){

        return res.status(404).json({

            success:false,

            message:"User Not Found"

        });

    }

    // Recharge Energy

    const energyData =
    calculateEnergy(user);

    if(

        energyData.energy !==
        user.energy

    ){

        await users.updateOne(

            {

                telegramId

            },

            {

                $set:{

                    energy:
                    energyData.energy,

                    lastEnergyUpdate:
                    energyData.lastEnergyUpdate

                }

            }

        );

        user.energy =
        energyData.energy;

        user.lastEnergyUpdate =
        energyData.lastEnergyUpdate;

    }

    // Next Level XP

    const nextLevelXP =

    (user.level || 1) * 1000;

    res.json({

        success:true,

        user:{

            uid:
            user.uid,

            telegramId:
            user.telegramId,

            firstName:
            user.firstName,

            lastName:
            user.lastName,

            username:
            user.username,

            photo:
            user.photo,

            balance:
            user.balance,

            energy:
            user.energy,

            maxEnergy:
            user.maxEnergy,

            level:
            user.level,

            xp:
            user.xp,

            nextLevelXP,

            totalTap:
            user.totalTap,

            referrals:
            user.referrals,

            completedTasks:
            user.completedTasks || [],

            claimedDaily:
            user.claimedDaily || false,

            spinUsed:
            user.spinUsed || false,

            createdAt:
            user.createdAt

        }

    });

}
catch(error){

    console.log(error);

    res.status(500).json({

        success:false,

        message:error.message

    });

}

});

// ========================================
// Update User Profile
// ========================================

router.put(
"/user/:telegramId",
async(req,res)=>{

try{

    const telegramId =
    Number(
        req.params.telegramId
    );

    const{

        firstName,

        lastName,

        username,

        photo

    }=req.body;

    const db =
    getDatabase();

    const users =
    db.collection(
        "users"
    );

    const user =
    await users.findOne({

        telegramId

    });

    if(!user){

        return res.status(404).json({

            success:false,

            message:"User Not Found"

        });

    }

    const updateData={};

    if(

        typeof firstName==="string"

    ){

        updateData.firstName=
        firstName.trim();

    }

    if(

        typeof lastName==="string"

    ){

        updateData.lastName=
        lastName.trim();

    }

    if(

        typeof username==="string"

    ){

        updateData.username=
        username.trim();

    }

    if(

        typeof photo==="string"

    ){

        updateData.photo=
        photo.trim();

    }

    if(

        Object.keys(updateData)
        .length===0

    ){

        return res.json({

            success:false,

            message:
            "Nothing To Update"

        });

    }

    updateData.updatedAt=
    new Date();

    await users.updateOne(

        {

            telegramId

        },

        {

            $set:updateData

        }

    );

    const updatedUser =
    await users.findOne({

        telegramId

    });

    res.json({

        success:true,

        message:
        "Profile Updated",

        user:updatedUser

    });

}
catch(error){

    console.log(error);

    res.status(500).json({

        success:false,

        message:error.message

    });

}

});


// ========================================
// Tap Coin
// ========================================

router.post(
"/tap",
async(req,res)=>{

try{

    const telegramId =
    Number(
        req.body.telegramId
    );

    const tap =
    Math.max(
        1,
        Number(req.body.tap) || 1
    );

    const db =
    getDatabase();

    const users =
    db.collection(
        "users"
    );

    let user =
    await users.findOne({

        telegramId

    });

    if(!user){

        return res.status(404).json({

            success:false,

            message:"User Not Found"

        });

    }

    // Recharge Energy

    const energyData =
    calculateEnergy(user);

    user.energy =
    energyData.energy;

    user.lastEnergyUpdate =
    energyData.lastEnergyUpdate;

    // Energy Check

    if(user.energy<=0){

        return res.json({

            success:false,

            message:"Energy Empty",

            energy:0

        });

    }

    // ========================================
    // Anti Auto Click
    // ========================================

    const anti =
    detectAutoClick(user);

    if(anti.blocked){

        const minusCoin =
        Math.min(

            tap,

            user.balance

        );

        await users.updateOne(

            {

                telegramId

            },

            {

                $inc:{

                    balance:-minusCoin

                },

                $set:{

                    tapCount:
                    anti.tapCount,

                    lastTapTime:
                    anti.lastTapTime,

                    energy:
                    user.energy,

                    lastEnergyUpdate:
                    user.lastEnergyUpdate

                }

            }

        );

        return res.json({

            success:false,

            autoClicker:true,

            message:"Auto Click Detected",

            penalty:minusCoin,

            balance:
            user.balance-minusCoin,

            energy:
            user.energy

        });

    }

    // Save Tap Counter

    user.tapCount =
    anti.tapCount;

    user.lastTapTime =
    anti.lastTapTime;

    // Energy Consume

    user.energy--;

    let earnedCoin =
    tap;

    let earnedXP =
    tap;



    // ========================================
    // XP & Level System
    // ========================================

    let xp =
    (user.xp || 0) +
    earnedXP;

    let level =
    user.level || 1;

    let needXP =
    level * 1000;

    while(xp >= needXP){

        xp -= needXP;

        level++;

        needXP =
        level * 1000;

    }

    // ========================================
    // Save User
    // ========================================

    await users.updateOne(

        {

            telegramId

        },

        {

            $inc:{

                balance:earnedCoin,

                totalTap:tap

            },

            $set:{

                energy:user.energy,

                xp,

                level,

                tapCount:user.tapCount,

                lastTapTime:user.lastTapTime,

                lastEnergyUpdate:
                user.lastEnergyUpdate

            }

        }

    );

    const updated =
    await users.findOne({

        telegramId

    });

    res.json({

        success:true,

        balance:
        updated.balance,

        energy:
        updated.energy,

        xp:
        updated.xp,

        level:
        updated.level,

        totalTap:
        updated.totalTap,

        earnedCoin,

        earnedXP

    });

}
catch(error){

    console.log(error);

    res.status(500).json({

        success:false,

        message:error.message

    });

}

});


// ========================================
// Get Tasks
// ========================================

router.get(
"/tasks/:telegramId",
async(req,res)=>{

try{

    const telegramId =
    Number(
        req.params.telegramId
    );

    const db =
    getDatabase();

    const users =
    db.collection(
        "users"
    );

    const tasks =
    db.collection(
        "tasks"
    );

    const user =
    await users.findOne({

        telegramId

    });

    if(!user){

        return res.status(404).json({

            success:false,

            message:"User Not Found"

        });

    }

    let taskList =
    await tasks.find({

        active:true

    })
    .sort({

        order:1

    })
    .toArray();

    // ========================================
    // Create Default Tasks
    // ========================================

    if(taskList.length===0){

        const defaultTasks=[

        {

            id:"join_channel",

            order:1,

            icon:"📢",

            title:"Join Official Channel",

            reward:5000,

            type:"telegram",

            active:true

        },

        {

            id:"join_group",

            order:2,

            icon:"👥",

            title:"Join Community Group",

            reward:5000,

            type:"telegram",

            active:true

        },

        {

            id:"start_bot",

            order:3,

            icon:"🤖",

            title:"Start Official Bot",

            reward:7000,

            type:"telegram",

            active:true

        },

        {

            id:"visit_site",

            order:4,

            icon:"🌐",

            title:"Visit Official Website",

            reward:4000,

            type:"website",

            active:true

        },

        {

            id:"share",

            order:5,

            icon:"📤",

            title:"Share Zoryx",

            reward:10000,

            type:"share",

            active:true

        },

        {

            id:"daily",

            order:6,

            icon:"🎁",

            title:"Daily Reward",

            reward:3000,

            type:"daily",

            active:true

        }

        ];

        await tasks.insertMany(
            defaultTasks
        );

        taskList =
        defaultTasks;

    }

    const completed =
    user.completedTasks || [];

    taskList =
    taskList.map(task=>({

        ...task,

        completed:
        completed.includes(
            task.id
        )

    }));

    res.json({

        success:true,

        tasks:taskList

    });

}
catch(error){

    console.log(error);

    res.status(500).json({

        success:false,

        message:error.message

    });

}

});


// ========================================
// Claim Task
// ========================================

router.post(
"/task/claim",
async(req,res)=>{

try{

    const telegramId =
    Number(
        req.body.telegramId
    );

    const taskId =
    String(
        req.body.taskId || ""
    );

    const db =
    getDatabase();

    const users =
    db.collection("users");

    const tasks =
    db.collection("tasks");

    const user =
    await users.findOne({

        telegramId

    });

    if(!user){

        return res.status(404).json({

            success:false,

            message:"User Not Found"

        });

    }

    const task =
    await tasks.findOne({

        id:taskId,

        active:true

    });

    if(!task){

        return res.json({

            success:false,

            message:"Task Not Found"

        });

    }

    const completed =
    user.completedTasks || [];

    if(

        completed.includes(taskId)

    ){

        return res.json({

            success:false,

            message:
            "Task Already Claimed"

        });

    }

    // ========================================
    // Reward
    // ========================================

    let reward =
    Number(task.reward)||0;

    let xp =
    (user.xp||0)+reward;

    let level =
    user.level||1;

    let needXP =
    level*1000;

    while(

        xp>=needXP

    ){

        xp-=needXP;

        level++;

        needXP=
        level*1000;

    }

    completed.push(
        taskId
    );

    await users.updateOne(

        {

            telegramId

        },

        {

            $inc:{

                balance:reward

            },

            $set:{

                xp,

                level,

                completedTasks:
                completed

            }

        }

    );

    const updated =
    await users.findOne({

        telegramId

    });

    res.json({

        success:true,

        message:
        "Task Claimed",

        reward,

        balance:
        updated.balance,

        xp:
        updated.xp,

        level:
        updated.level,

        completedTasks:
        updated.completedTasks

    });

}
catch(error){

    console.log(error);

    res.status(500).json({

        success:false,

        message:error.message

    });

}

});


// ========================================
// Daily Reward
// Reset: 05:00 GMT
// ========================================

function getDailyResetTime(){

    const now = new Date();

    const reset = new Date(now);

    reset.setUTCHours(5,0,0,0);

    if(now >= reset){

        reset.setUTCDate(
            reset.getUTCDate()+1
        );

    }

    return reset;

}

function canClaimDaily(lastClaim){

    if(!lastClaim)
    return true;

    const last =
    new Date(lastClaim);

    const now =
    new Date();

    const todayReset =
    new Date(now);

    todayReset.setUTCHours(
        5,0,0,0
    );

    if(now < todayReset){

        todayReset.setUTCDate(
            todayReset.getUTCDate()-1
        );

    }

    return last < todayReset;

}



// ========================================
// Daily Status
// ========================================

router.get(
"/daily/:telegramId",
async(req,res)=>{

try{

    const telegramId =
    Number(req.params.telegramId);

    const db =
    getDatabase();

    const users =
    db.collection("users");

    const user =
    await users.findOne({

        telegramId

    });

    if(!user){

        return res.json({

            success:false,

            message:"User Not Found"

        });

    }

    res.json({

        success:true,

        canClaim:
        canClaimDaily(
            user.lastDailyClaim
        ),

        nextReset:
        getDailyResetTime()

    });

}
catch(error){

    res.status(500).json({

        success:false,

        message:error.message

    });

}

});



// ========================================
// Claim Daily Reward
// ========================================

router.post(
"/daily/claim",
async(req,res)=>{

try{

    const telegramId =
    Number(req.body.telegramId);

    const db =
    getDatabase();

    const users =
    db.collection("users");

    const user =
    await users.findOne({

        telegramId

    });

    if(!user){

        return res.json({

            success:false,

            message:"User Not Found"

        });

    }

    if(

        !canClaimDaily(
            user.lastDailyClaim
        )

    ){

        return res.json({

            success:false,

            message:
            "Already Claimed"

        });

    }

    const reward = 5000;

    let xp =
    (user.xp||0)+reward;

    let level =
    user.level||1;

    let needXP =
    level*1000;

    while(xp>=needXP){

        xp-=needXP;

        level++;

        needXP=
        level*1000;

    }

    await users.updateOne(

        {

            telegramId

        },

        {

            $inc:{

                balance:reward

            },

            $set:{

                xp,

                level,

                lastDailyClaim:
                new Date()

            }

        }

    );

    const updated =
    await users.findOne({

        telegramId

    });

    res.json({

        success:true,

        reward,

        balance:
        updated.balance,

        xp:
        updated.xp,

        level:
        updated.level,

        nextReset:
        getDailyResetTime()

    });

}
catch(error){

    res.status(500).json({

        success:false,

        message:error.message

    });

}

});


// ========================================
// Referral System
// ========================================

const REFERRAL_REWARDS = {

    1:{
        energy:3000,
        coin:0
    },

    3:{
        energy:15000,
        coin:0
    },

    5:{
        energy:25000,
        coin:0
    },

    10:{
        energy:0,
        coin:500000
    },

    20:{
        energy:0,
        coin:500000
    },

    30:{
        energy:0,
        coin:500000
    },

    50:{
        energy:0,
        coin:500000
    },

    100:{
        energy:0,
        coin:500000
    },

    200:{
        energy:0,
        coin:500000
    },

    300:{
        energy:0,
        coin:500000
    },

    500:{
        energy:0,
        coin:500000
    }

};


// ========================================
// Referral Info
// ========================================

router.get(
"/referral/:telegramId",
async(req,res)=>{

try{

    const telegramId =
    Number(
        req.params.telegramId
    );

    const db =
    getDatabase();

    const users =
    db.collection(
        "users"
    );

    const user =
    await users.findOne({

        telegramId

    });

    if(!user){

        return res.json({

            success:false,

            message:"User Not Found"

        });

    }

    res.json({

        success:true,

        referralCode:
        user.uid,

        totalFriends:
        user.referrals || 0,

        claimed:
        user.claimedReferralReward || [],

        rewards:
        REFERRAL_REWARDS

    });

}
catch(error){

    res.status(500).json({

        success:false,

        message:error.message

    });

}

});



// ========================================
// Join By Referral
// ========================================

router.post(
"/referral/join",
async(req,res)=>{

try{

    const{

        telegramId,

        referralCode

    }=req.body;

    const db =
    getDatabase();

    const users =
    db.collection(
        "users"
    );

    const user =
    await users.findOne({

        telegramId:Number(
            telegramId
        )

    });

    if(!user){

        return res.json({

            success:false,

            message:"User Not Found"

        });

    }

    if(

        user.referredBy

    ){

        return res.json({

            success:false,

            message:
            "Referral Already Used"

        });

    }

    const owner =
    await users.findOne({

        uid:
        referralCode

    });

    if(!owner){

        return res.json({

            success:false,

            message:
            "Invalid Referral"

        });

    }

    if(

        owner.telegramId===

        user.telegramId

    ){

        return res.json({

            success:false,

            message:
            "Own Referral Not Allowed"

        });

    }

    await users.updateOne(

        {

            telegramId:
            owner.telegramId

        },

        {

            $inc:{

                referrals:1

            }

        }

    );

    await users.updateOne(

        {

            telegramId:
            user.telegramId

        },

        {

            $set:{

                referredBy:
                owner.uid,

                spinAvailable:true

            }

        }

    );

    res.json({

        success:true,

        message:
        "Referral Success"

    });

}
catch(error){

    res.status(500).json({

        success:false,

        message:error.message

    });

}

});


// ========================================
// Claim Referral Milestone Reward
// ========================================

router.post(
"/referral/claim",
async(req,res)=>{

try{

    const telegramId =
    Number(
        req.body.telegramId
    );

    const db =
    getDatabase();

    const users =
    db.collection("users");

    const user =
    await users.findOne({

        telegramId

    });

    if(!user){

        return res.json({

            success:false,

            message:"User Not Found"

        });

    }

    const total =
    user.referrals || 0;

    let claimed =
    user.claimedReferralReward || [];

    let target = null;

    Object.keys(
        REFERRAL_REWARDS
    ).forEach(level=>{

        if(

            total >= Number(level) &&

            !claimed.includes(
                Number(level)
            )

        ){

            if(

                target===null ||

                Number(level)>
                target

            ){

                target=
                Number(level);

            }

        }

    });

    if(target===null){

        return res.json({

            success:false,

            message:
            "No Reward Available"

        });

    }

    const reward =
    REFERRAL_REWARDS[target];

    claimed.push(
        target
    );

    const update={

        claimedReferralReward:
        claimed

    };

    if(reward.energy){

        update.maxEnergy=
        (user.maxEnergy||1000)
        +reward.energy;

        update.energy=
        (user.energy||1000)
        +reward.energy;

    }

    if(reward.coin){

        update.balance=
        (user.balance||0)
        +reward.coin;

    }

    await users.updateOne(

        {

            telegramId

        },

        {

            $set:update

        }

    );

    const updated =
    await users.findOne({

        telegramId

    });

    res.json({

        success:true,

        reward,

        balance:
        updated.balance,

        energy:
        updated.energy,

        maxEnergy:
        updated.maxEnergy,

        claimed:
        updated.claimedReferralReward

    });

}
catch(error){

    console.log(error);

    res.status(500).json({

        success:false,

        message:error.message

    });

}

});


// ========================================
// Lucky Spin System
// ========================================

const SPIN_REWARDS = [

    1000,
    2500,
    5000,
    10000,
    25000,
    50000,
    100000,
    250000

];



// ========================================
// Lucky Spin Status
// ========================================

router.get(
"/spin/:telegramId",
async(req,res)=>{

try{

    const telegramId =
    Number(
        req.params.telegramId
    );

    const db =
    getDatabase();

    const users =
    db.collection(
        "users"
    );

    const user =
    await users.findOne({

        telegramId

    });

    if(!user){

        return res.json({

            success:false,

            message:"User Not Found"

        });

    }

    res.json({

        success:true,

        canSpin:
        Boolean(
            user.spinAvailable
        ),

        alreadyUsed:
        Boolean(
            user.spinUsed
        )

    });

}
catch(error){

    res.status(500).json({

        success:false,

        message:error.message

    });

}

});



// ========================================
// Claim Lucky Spin
// ========================================

router.post(
"/spin",
async(req,res)=>{

try{

    const telegramId =
    Number(
        req.body.telegramId
    );

    const db =
    getDatabase();

    const users =
    db.collection(
        "users"
    );

    const user =
    await users.findOne({

        telegramId

    });

    if(!user){

        return res.json({

            success:false,

            message:"User Not Found"

        });

    }

    if(

        !user.spinAvailable

    ){

        return res.json({

            success:false,

            message:
            "Lucky Spin Not Available"

        });

    }

    if(

        user.spinUsed

    ){

        return res.json({

            success:false,

            message:
            "Lucky Spin Already Used"

        });

    }

    const reward =

    SPIN_REWARDS[
        Math.floor(
            Math.random() *
            SPIN_REWARDS.length
        )
    ];

    await users.updateOne(

        {

            telegramId

        },

        {

            $inc:{

                balance:reward

            },

            $set:{

                spinUsed:true,

                spinAvailable:false,

                lastSpin:
                new Date()

            }

        }

    );

    const updated =
    await users.findOne({

        telegramId

    });

    res.json({

        success:true,

        reward,

        balance:
        updated.balance,

        spinUsed:
        true

    });

}
catch(error){

    console.log(error);

    res.status(500).json({

        success:false,

        message:error.message

    });

}

});


// ========================================
// User Rank
// ========================================

router.get(
"/leaderboard/rank/:telegramId",
async(req,res)=>{

try{

    const telegramId =
    Number(req.params.telegramId);

    const db =
    getDatabase();

    const users =
    db.collection("users");

    const list =
    await users.find(
        {},
        {
            projection:{
                telegramId:1,
                balance:1
            }
        }
    )
    .sort({
        balance:-1
    })
    .toArray();

    const rank =
    list.findIndex(
        u=>u.telegramId===telegramId
    )+1;

    res.json({

        success:true,

        rank:
        rank>0 ? rank : null,

        totalUsers:
        list.length

    });

}
catch(error){

    res.status(500).json({

        success:false,

        message:error.message

    });

}

});



// ========================================
// Top Referrers
// ========================================

router.get(
"/leaderboard/referrals",
async(req,res)=>{

try{

    const db =
    getDatabase();

    const users =
    db.collection("users");

    const list =
    await users.find(
        {},
        {
            projection:{
                firstName:1,
                username:1,
                referrals:1,
                level:1
            }
        }
    )
    .sort({
        referrals:-1
    })
    .limit(20)
    .toArray();

    res.json({

        success:true,

        leaderboard:list

    });

}
catch(error){

    res.status(500).json({

        success:false,

        message:error.message

    });

}

});



// ========================================
// User Statistics
// ========================================

router.get(
"/stats",
async(req,res)=>{

try{

    const db =
    getDatabase();

    const users =
    db.collection("users");

    const totalUsers =
    await users.countDocuments();

    const totalCoins =
    await users.aggregate([
        {
            $group:{
                _id:null,
                total:{
                    $sum:"$balance"
                }
            }
        }
    ]).toArray();

    const totalTaps =
    await users.aggregate([
        {
            $group:{
                _id:null,
                total:{
                    $sum:"$totalTap"
                }
            }
        }
    ]).toArray();

    res.json({

        success:true,

        users:
        totalUsers,

        totalCoins:
        totalCoins[0]?.total || 0,

        totalTaps:
        totalTaps[0]?.total || 0

    });

}
catch(error){

    res.status(500).json({

        success:false,

        message:error.message

    });

}

});



// ========================================
// Export
// ========================================

export default router;
    
