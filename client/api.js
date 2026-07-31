// ==========================================
// Zoryx Telegram WebApp
// client/api.js
// ==========================================

const API = {};


// ==========================================
// Config
// ==========================================

API.BASE_URL =
window.location.hostname === "localhost"
?

"http://localhost:3000"

:

window.location.origin;





// ==========================================
// Request Helper
// ==========================================

API.request = async(

url,

method="GET",

body=null

)=>{

try{

const options={

method,

headers:{

"Content-Type":
"application/json"

}

};

if(body){

options.body=
JSON.stringify(body);

}

const response=
await fetch(

API.BASE_URL+url,

options

);

const json=
await response.json();

return json;

}
catch(error){

console.error(

"API Error:",

error

);

return{

success:false,

message:
"Network Error"

};

}

};





// ==========================================
// Login
// ==========================================

API.login =
async()=>{

return await API.request(

"/auth/login",

"POST",

TelegramApp.getInitData()

);

};





// ==========================================
// Get Profile
// ==========================================

API.getProfile =
async(

telegramId

)=>{

return await API.request(

`/user/${telegramId}`

);

};





// ==========================================
// Update Profile
// ==========================================

API.updateProfile =
async(

telegramId,

data

)=>{

return await API.request(

`/user/${telegramId}`,

"PUT",

data

);

};



// ==========================================
// Tap
// ==========================================

API.tap =
async(

telegramId,

tap=1

)=>{

return await API.request(

"/tap",

"POST",

{

telegramId,

tap

}

);

};





// ==========================================
// Get Tasks
// ==========================================

API.getTasks =
async(

telegramId

)=>{

return await API.request(

`/tasks/${telegramId}`

);

};





// ==========================================
// Claim Task
// ==========================================

API.claimTask =
async(

telegramId,

taskId

)=>{

return await API.request(

"/task/claim",

"POST",

{

telegramId,

taskId

}

);

};





// ==========================================
// Daily Status
// ==========================================

API.dailyStatus =
async(

telegramId

)=>{

return await API.request(

`/daily/${telegramId}`

);

};





// ==========================================
// Claim Daily Reward
// ==========================================

API.claimDaily =
async(

telegramId

)=>{

return await API.request(

"/daily/claim",

"POST",

{

telegramId

}

);

};





// ==========================================
// Leaderboard
// ==========================================

API.getLeaderboard =
async()=>{

return await API.request(

"/leaderboard"

);

};



// ==========================================
// Referral Info
// ==========================================

API.getReferral =
async(telegramId)=>{

    return await API.request(

        `/referral/${telegramId}`

    );

};



// ==========================================
// Join Referral
// ==========================================

API.joinReferral =
async(

telegramId,

referralCode

)=>{

    return await API.request(

        "/referral/join",

        "POST",

        {

            telegramId,

            referralCode

        }

    );

};



// ==========================================
// Claim Referral Reward
// ==========================================

API.claimReferral =
async(

telegramId

)=>{

    return await API.request(

        "/referral/claim",

        "POST",

        {

            telegramId

        }

    );

};



// ==========================================
// Lucky Spin Status
// ==========================================

API.getSpin =
async(

telegramId

)=>{

    return await API.request(

        `/spin/${telegramId}`

    );

};



// ==========================================
// Lucky Spin
// ==========================================

API.spin =
async(

telegramId

)=>{

    return await API.request(

        "/spin",

        "POST",

        {

            telegramId

        }

    );

};



// ==========================================
// User Rank
// ==========================================

API.getRank =
async(

telegramId

)=>{

    return await API.request(

        `/leaderboard/rank/${telegramId}`

    );

};



// ==========================================
// Top Referrals
// ==========================================

API.getTopReferrals =
async()=>{

    return await API.request(

        "/leaderboard/referrals"

    );

};



// ==========================================
// Server Statistics
// ==========================================

API.getStats =
async()=>{

    return await API.request(

        "/stats"

    );

};



// ==========================================
// Export
// ==========================================

window.API = API;
