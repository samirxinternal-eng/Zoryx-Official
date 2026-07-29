// ==========================================
// Zoryx Telegram WebApp
// client/app.js
// ==========================================


let currentUser = null;

let energy = 1000;

let maxEnergy = 1000;

let localBalance = 0;

let tapPower = 1;


// ==========================================
// Initialize
// ==========================================

document.addEventListener(
"DOMContentLoaded",
async()=>{


    console.log("🚀 Zoryx Starting...");


    showLoading(true);


    try{


        await login();


        registerEvents();


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

async function handleCoinTap(event){



    if(!currentUser)
        return;



    if(energy <= 0){


        TelegramApp.popup(
            "Energy Empty",
            "Wait for recharge"
        );


        return;

    }



    // Server Tap

    const result =
    await API.tap(

        currentUser.telegramId,

        tapPower

    );



    if(!result.success){


        TelegramApp.popup(
            "Error",
            result.message
        );


        return;

    }



    // Update From Server

    localBalance =
    result.balance;


    energy =
    result.energy;



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
    "scale(.90)";



    setTimeout(()=>{


        coin.style.transform =
        "scale(1)";


    },100);


}







// ==========================================
// +1 Effect
// ==========================================

function createTapEffect(x,y){


    const effect =
    document.createElement(
        "div"
    );


    effect.innerText =
    "+1";



    effect.style.position =
    "fixed";


    effect.style.left =
    x+"px";


    effect.style.top =
    y+"px";


    effect.style.color =
    "#ffc107";


    effect.style.fontSize =
    "26px";


    effect.style.fontWeight =
    "bold";


    effect.style.zIndex =
    "9999";


    effect.style.pointerEvents =
    "none";


    effect.style.transition =
    "all .8s ease";



    document.body.appendChild(
        effect
    );



    setTimeout(()=>{


        effect.style.transform =
        "translateY(-80px)";


        effect.style.opacity =
        "0";


    },20);



    setTimeout(()=>{


        effect.remove();


    },900);


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
    document.getElementById(id);



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
