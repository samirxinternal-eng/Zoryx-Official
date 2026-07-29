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

const ENERGY_RESTORE_TIME = 10000; 
// 10 second = 1 energy



// ========================================
// Energy Calculator
// ========================================

function calculateEnergy(user){


    if(!user.lastEnergyUpdate){

        return {
            energy:user.energy || 1000,
            lastEnergyUpdate:new Date()
        };

    }



    const now = Date.now();


    const last =
        new Date(
            user.lastEnergyUpdate
        ).getTime();



    const passed =
        Math.floor(
            (now-last) /
            ENERGY_RESTORE_TIME
        );



    let energy =
        user.energy || 0;



    if(passed > 0){


        energy += passed;



        if(
            energy >
            user.maxEnergy
        ){

            energy =
            user.maxEnergy;

        }


    }



    return {

        energy,

        lastEnergyUpdate:new Date()

    };


}





// ========================================
// API Status
// ========================================


router.get("/",(req,res)=>{


    res.json({

        success:true,

        project:"Zoryx",

        status:"Online"

    });


});






// ========================================
// Telegram Login
// ========================================


router.post("/auth/login",async(req,res)=>{


try{


const result =
verifyTelegramAuth(
    req.body
);



if(!result.success){

return res.status(401).json(result);

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


energy:1000,


maxEnergy:1000,


lastEnergyUpdate:new Date(),


level:1,


totalTap:0,


referrals:0,


createdAt:new Date()


};



await users.insertOne(user);



}else{


const energyData =
calculateEnergy(user);



await users.updateOne(

{
telegramId:user.telegramId
},

{
$set:energyData
}

);



user.energy =
energyData.energy;



}



res.json({

success:true,

user

});



}catch(error){


res.status(500).json({

success:false,

message:error.message

});


}



});







// ========================================
// Profile
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

return res.status(404).json({

success:false,

message:"User Not Found"

});

}




const energyData =
calculateEnergy(user);



await users.updateOne(

{
telegramId:user.telegramId
},

{
$set:energyData
}

);



user.energy =
energyData.energy;



res.json({

success:true,

user

});



}catch(error){


res.status(500).json({

success:false,

message:error.message

});


}



});








// ========================================
// TAP
// ========================================


router.post("/tap",async(req,res)=>{


try{


const {
telegramId,
tap
}
=
req.body;



const db =
getDatabase();



const users =
db.collection("users");



let user =
await users.findOne({

telegramId:Number(telegramId)

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



if(energy <= 0){


return res.json({

success:false,

message:"Energy Empty"

});


}



const amount =
Number(tap) || 1;




energy -= 1;



await users.updateOne(

{
telegramId:Number(telegramId)
},

{

$inc:{

balance:amount,

totalTap:amount

},


$set:{

energy,

lastEnergyUpdate:new Date()

}


}

);




const updated =
await users.findOne({

telegramId:Number(telegramId)

});




res.json({

success:true,

balance:
updated.balance,

energy:
updated.energy


});




}catch(error){


res.status(500).json({

success:false,

message:error.message

});


}


});







// ========================================
// Balance Add
// ========================================


router.post("/balance/add",async(req,res)=>{


try{


const {
userId,
amount
}=req.body;



const db =
getDatabase();



await db.collection("users")
.updateOne(

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
// Referral
// ========================================


router.get(
"/referrals/:telegramId",
async(req,res)=>{


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


});







// ========================================
// Leaderboard
// ========================================


router.get(
"/leaderboard",
async(req,res)=>{


const db =
getDatabase();


const leaderboard =
await db.collection("users")
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


});





export default router;
