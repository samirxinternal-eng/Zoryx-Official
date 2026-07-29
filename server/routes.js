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

const ENERGY_RESTORE_TIME = 4000;

const DEFAULT_ENERGY = 1000;



// ========================================
// Energy Calculator
// ========================================

function calculateEnergy(user){


    let energy =
    user.energy ?? DEFAULT_ENERGY;



    let last =
    user.lastEnergyUpdate
    ?
    new Date(user.lastEnergyUpdate).getTime()
    :
    Date.now();



    const now =
    Date.now();



    const passed =
    Math.floor(
        (now - last) /
        ENERGY_RESTORE_TIME
    );



    if(passed > 0){


        energy += passed;



        if(
            energy >
            user.maxEnergy
        ){

            energy =
            user.maxEnergy;

        }



        last =
        now;


    }



    return {


        energy,


        lastEnergyUpdate:
        new Date(last)


    };


}







// ========================================
// Status
// ========================================


router.get("/",(req,res)=>{


    res.json({

        success:true,

        project:"Zoryx",

        status:"Online",

        version:"1.0.0"

    });


});







// ========================================
// Telegram Login
// ========================================


router.post(
"/auth/login",
async(req,res)=>{


try{


    const result =
    verifyTelegramAuth(
        req.body
    );



    if(!result.success){


        return res
        .status(401)
        .json(result);


    }



    const db =
    getDatabase();


    const users =
    db.collection("users");



    let user =
    await users.findOne({

        telegramId:
        result.user.id

    });





    if(!user){


        user={


            uid:
            crypto.randomUUID(),


            telegramId:
            result.user.id,


            firstName:
            result.user.first_name || "User",


            lastName:
            result.user.last_name || "",


            username:
            result.user.username || "",


            photo:
            result.user.photo_url || "",


            balance:0,


            energy:
            DEFAULT_ENERGY,


            maxEnergy:
            DEFAULT_ENERGY,


            lastEnergyUpdate:
            new Date(),


            level:1,


            totalTap:0,


            referrals:0,


            createdAt:
            new Date()


        };



        await users.insertOne(user);


    }
    else{


        const energyData =
        calculateEnergy(user);



        await users.updateOne(

            {
                telegramId:
                user.telegramId
            },

            {
                $set:
                energyData
            }

        );



        user.energy =
        energyData.energy;


        user.lastEnergyUpdate =
        energyData.lastEnergyUpdate;


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
// Get Profile
// ========================================


router.get(
"/user/:telegramId",
async(req,res)=>{


try{


    const db =
    getDatabase();



    const users =
    db.collection("users");



    let user =
    await users.findOne({

        telegramId:
        Number(req.params.telegramId)

    });



    if(!user){

        return res.json({

            success:false,

            message:"User Not Found"

        });

    }




    const energyData =
    calculateEnergy(user);



    await users.updateOne(

        {
            telegramId:
            user.telegramId
        },

        {
            $set:
            energyData
        }

    );



    user.energy =
    energyData.energy;



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
// Update Profile
// ========================================


router.put(
"/user/:telegramId",
async(req,res)=>{


try{


const db =
getDatabase();



await db.collection("users")
.updateOne(

{
telegramId:
Number(req.params.telegramId)
},

{

$set:req.body

}

);



res.json({

success:true

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
// Tap
// ========================================


router.post(
"/tap",
async(req,res)=>{


try{


const telegramId =
Number(req.body.telegramId);



const amount =
Math.max(
1,
Number(req.body.tap) || 1
);



const db =
getDatabase();



const users =
db.collection("users");



let user =
await users.findOne({

telegramId

});



if(!user){


return res.json({

success:false,

message:"User Not Found"

});


}





const energyData =
calculateEnergy(user);



let energy =
energyData.energy;



if(energy <=0){


return res.json({

success:false,

message:"Energy Empty"

});


}



energy--;



await users.updateOne(

{
telegramId
},

{

$inc:{

balance:amount,

totalTap:amount

},


$set:{

energy,

lastEnergyUpdate:
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

balance:
updated.balance,

energy:
updated.energy


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
// Balance Add
// ========================================


router.post(
"/balance/add",
async(req,res)=>{


try{


const userId =
Number(req.body.userId);



const amount =
Number(req.body.amount);



if(amount<=0){

return res.json({

success:false,

message:"Invalid Amount"

});

}



const db =
getDatabase();



await db.collection("users")
.updateOne(

{
telegramId:userId
},

{

$inc:{

balance:amount

}

}

);



res.json({

success:true

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
// Referral
// ========================================


router.get(
"/referrals/:telegramId",
async(req,res)=>{


try{


const db =
getDatabase();



const user =
await db.collection("users")
.findOne({

telegramId:
Number(req.params.telegramId)

});



res.json({

success:true,

referrals:
user?.referrals || 0

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
// Leaderboard
// ========================================


router.get(
"/leaderboard",
async(req,res)=>{


try{


const db =
getDatabase();



const leaderboard =
await db.collection("users")
.find(
{},
{
projection:{
firstName:1,
username:1,
balance:1,
level:1
}
}
)
.sort({

balance:-1

})
.limit(20)
.toArray();



res.json({

success:true,

leaderboard

});


}
catch(error){


res.status(500).json({

success:false,

message:error.message

});


}


});






export default router;
