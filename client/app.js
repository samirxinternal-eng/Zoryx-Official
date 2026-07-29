// ==========================================
// Zoryx Telegram WebApp
// client/app.js
// ==========================================


let currentUser = null;

let energy = 1000;

let maxEnergy = 1000;

let localBalance = 0;

let tapPower = 1;


// Effect Control
let activeEffects = [];


// Server Save Control
let pendingTap = 0;
let savingTap = false;





// ==========================================
// Initialize
// ==========================================


document.addEventListener(
"DOMContentLoaded",
async()=>{


    console.log(
        "🚀 Zoryx Starting..."
    );


    showLoading(true);



    try{


        await login();


        registerEvents();


        startEnergyRecharge();



    }
    catch(error){


        console.error(error);


        TelegramApp.alert(
            "Application Error"
        );


    }


});









// ==========================================
// Login
// ==========================================


async function login(){


    const res =
    await API.login();



    if(!res.success){


        showLoading(false);


        TelegramApp.popup(
            "Login Failed",
            res.message || "Unable to login"
        );


        return;

    }



    currentUser =
    res.user;



    localBalance =
    currentUser.balance || 0;



    energy =
    currentUser.energy ?? 1000;



    maxEnergy =
    currentUser.maxEnergy ?? 1000;



    updateUserUI();



    await loadUserData();



    showLoading(false);


}









// ==========================================
// Load User
// ==========================================


async function loadUserData(){


    if(!currentUser)
        return;



    const res =
    await API.getProfile(
        currentUser.telegramId
    );



    if(res.success){


        currentUser =
        res.user;



        localBalance =
        currentUser.balance || 0;



        energy =
        currentUser.energy ?? energy;



        maxEnergy =
        currentUser.maxEnergy ?? maxEnergy;



        updateUserUI();


    }


}









// ==========================================
// Update UI
// ==========================================


function updateUserUI(){


    if(!currentUser)
        return;



    setText(
        "userName",
        currentUser.firstName || "User"
    );



    setText(
        "userLevel",
        `Level ${currentUser.level || 1}`
    );



    setText(
        "balance",
        localBalance
    );



    const photo =
    document.getElementById(
        "userPhoto"
    );



    if(photo){


        photo.src =
        currentUser.photo ||
        "icon-192.png";


    }



    updateEnergyUI();


}









// ==========================================
// Energy UI
// ==========================================


function updateEnergyUI(){


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
        `${energy} / ${maxEnergy}`;

    }



    if(fill){


        fill.style.width =
        `${(energy/maxEnergy)*100}%`;


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
            handleCoinTap
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


        });


    });



}









// ==========================================
// Coin Tap
// ==========================================


function handleCoinTap(event){



    if(!currentUser)
        return;



    if(energy <= 0){


        TelegramApp.popup(
            "Energy Empty",
            "Wait for recharge"
        );


        return;

    }





    // Instant Update

    energy -= 1;


    localBalance += tapPower;


    pendingTap += tapPower;



    updateEnergyUI();


    setText(
        "balance",
        localBalance
    );



    TelegramApp.haptic(
        "light"
    );



    animateCoin();



    createTapEffect(
        event.clientX,
        event.clientY
    );



    syncTap();



}









// ==========================================
// Server Sync
// ==========================================


async function syncTap(){


    if(
        savingTap ||
        pendingTap <= 0
    )
    return;



    savingTap = true;



    const amount =
    pendingTap;



    pendingTap = 0;



    try{


        const result =
        await API.tap(

            currentUser.telegramId,

            amount

        );



        if(result.success){


            energy =
            result.energy;


            localBalance =
            result.balance;



            updateEnergyUI();


            setText(
                "balance",
                localBalance
            );


        }



    }
    catch(error){


        console.log(
            error
        );


    }



    savingTap = false;



    if(pendingTap > 0){

        syncTap();

    }


}









// ==========================================
// Coin Animation
// ==========================================


function animateCoin(){


    const coin =
    document.getElementById(
        "coin"
    );



    if(!coin)
        return;



    coin.style.transform =
    "scale(.88)";



    setTimeout(()=>{


        coin.style.transform =
        "scale(1)";


    },80);



}









// ==========================================
// Notcoin Style Effect
// ==========================================


function createTapEffect(x,y){



    if(activeEffects.length >= 3){


        const old =
        activeEffects.shift();


        old.remove();


    }




    const effect =
    document.createElement(
        "div"
    );



    effect.className =
    "tap-effect";



    effect.innerText =
    "+1";



    effect.style.left =
    x + "px";



    effect.style.top =
    y + "px";



    document.body.appendChild(
        effect
    );



    activeEffects.push(
        effect
    );



    setTimeout(()=>{


        effect.remove();


        activeEffects =
        activeEffects.filter(
            e=>e!==effect
        );


    },450);



}









// ==========================================
// Energy Recharge
// ==========================================


function startEnergyRecharge(){


    setInterval(()=>{


        if(
            energy < maxEnergy
        ){


            energy++;


            updateEnergyUI();


        }



    },4000);



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



    loading.style.display =
    show ? "flex":"none";



    app.style.display =
    show ? "none":"block";


}









function setText(id,value){


    const el =
    document.getElementById(
        id
    );



    if(el){


        el.textContent =
        value;


    }


}








window.Zoryx = {


    reload:
    loadUserData,


    getUser(){


        return currentUser;


    }


};
