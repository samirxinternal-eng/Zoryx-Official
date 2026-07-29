// ==========================================
// Zoryx Telegram WebApp
// client/app.js
// ==========================================

let currentUser = null;

let tapCount = 0;

let energy = 1000;

let maxEnergy = 1000;

const tapPower = 1;


// ==========================================
// Initialize
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {

    console.log("🚀 Starting Zoryx...");


    showLoading(true);


    if (!window.TelegramApp) {

        alert("Telegram WebApp not found.");

        return;

    }


    try {


        await login();


        registerEvents();


        startEnergyRecharge();


    } catch (err) {


        console.error(err);


        TelegramApp.alert(
            "Application failed to start."
        );


    }


});



// ==========================================
// Login
// ==========================================

async function login() {


    const res = await API.login();


    if (!res.success) {


        showLoading(false);


        TelegramApp.popup(
            "Login Failed",
            res.message || "Unable to authenticate."
        );


        return;

    }



    currentUser = res.user;


    console.log(
        "Logged In:",
        currentUser
    );



    energy = currentUser.energy || 1000;

    maxEnergy = currentUser.maxEnergy || 1000;



    updateUserUI();


    await loadUserData();


    showLoading(false);


}




// ==========================================
// Load User
// ==========================================

async function loadUserData() {


    if (!currentUser) return;



    try {


        const profile = await API.getProfile(

            currentUser.telegramId

        );



        if(profile.success && profile.user){


            currentUser = profile.user;



            energy =
                currentUser.energy || energy;



            maxEnergy =
                currentUser.maxEnergy || maxEnergy;



            updateUserUI();


        }



    } catch(err){

        console.error(err);

    }


}




// ==========================================
// Update UI
// ==========================================

function updateUserUI(){


    if(!currentUser) return;



    setText(
        "userName",
        currentUser.firstName ||
        TelegramApp.getFirstName() ||
        "User"
    );



    setText(
        "userLevel",
        `Level ${currentUser.level || 1}`
    );



    setText(
        "balance",
        (currentUser.balance || 0) + tapCount
    );



    const photo =
        document.getElementById(
            "userPhoto"
        );



    if(photo){


        photo.src =
            currentUser.photo ||
            TelegramApp.getPhoto() ||
            "icon-192.png";


    }



    updateEnergy(
        energy,
        maxEnergy
    );


}




// ==========================================
// Energy UI
// ==========================================

function updateEnergy(current,max){


    const text =
        document.getElementById(
            "energyText"
        );


    const fill =
        document.getElementById(
            "energyFill"
        );



    if(text){

        text.textContent =
            `${current} / ${max}`;

    }



    if(fill){

        fill.style.width =
            ((current / max) * 100)
            + "%";

    }


}





// ==========================================
// Events
// ==========================================

function registerEvents(){


    const coin =
        document.getElementById(
            "coin"
        );



    if(coin){


        coin.addEventListener(
            "click",
            tapCoin
        );


    }



    document
    .querySelectorAll(".nav")
    .forEach(btn=>{


        btn.addEventListener(
            "click",
            ()=>{


                document
                .querySelectorAll(".nav")
                .forEach(x=>
                    x.classList.remove("active")
                );


                btn.classList.add(
                    "active"
                );


            }
        );


    });


}





// ==========================================
// Tap Coin
// ==========================================

async function tapCoin(){


    if(energy <= 0){


        TelegramApp.popup(
            "Energy Empty",
            "Wait for recharge!"
        );


        return;

    }



    energy--;


    tapCount += tapPower;



    updateEnergy(
        energy,
        maxEnergy
    );


    setText(
        "balance",
        (currentUser.balance || 0)
        + tapCount
    );



    TelegramApp.haptic(
        "light"
    );



    const coin =
        document.getElementById(
            "coin"
        );



    if(coin){


        coin.style.transform =
            "scale(.90)";


        setTimeout(()=>{


            coin.style.transform =
                "scale(1)";


        },100);


    }




    // Save after tap

    if(currentUser){


        try{


            await API.addBalance(

                currentUser.telegramId,

                tapPower

            );


        }catch(err){

            console.log(err);

        }


    }



}




// ==========================================
// Energy Recharge
// ==========================================

function startEnergyRecharge(){


    setInterval(()=>{


        if(energy < maxEnergy){


            energy++;


            updateEnergy(
                energy,
                maxEnergy
            );


        }



    },10000);


}




// ==========================================
// Loading
// ==========================================

function showLoading(show){


    const loading =
        document.getElementById(
            "loading"
        );


    const app =
        document.getElementById(
            "app"
        );



    if(!loading || !app)
        return;



    if(show){


        loading.style.display =
            "flex";


        app.style.display =
            "none";


    }else{


        loading.style.display =
            "none";


        app.style.display =
            "block";


    }


}





// ==========================================
// Helper
// ==========================================

function setText(id,value){


    const el =
        document.getElementById(id);



    if(el){

        el.textContent =
            value;

    }


}





// ==========================================
// Global
// ==========================================

window.Zoryx = {


    reload:
        loadUserData,


    getUser(){

        return currentUser;

    }


};
