// ==========================================
// Zoryx Telegram WebApp
// client/app.js
// ==========================================


let currentUser = null;

let energy = 1000;

let maxEnergy = 1000;

let tapPower = 1;

let localBalance = 0;



// ==========================================
// Initialize
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    async ()=>{


    console.log(
        "🚀 Starting Zoryx..."
    );


    showLoading(true);



    if(!window.TelegramApp){

        alert(
            "Telegram WebApp not found."
        );

        return;

    }



    try{


        await login();


        registerEvents();



    }catch(error){


        console.error(error);


        TelegramApp.alert(
            "Application failed."
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
            res.message
        );


        return;

    }



    currentUser =
        res.user;



    localBalance =
        currentUser.balance || 0;



    energy =
        currentUser.energy || 1000;



    maxEnergy =
        currentUser.maxEnergy || 1000;



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
            currentUser.energy || energy;



        maxEnergy =
            currentUser.maxEnergy || maxEnergy;



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
        currentUser.firstName ||
        "User"
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



}






// ==========================================
// Coin Tap
// ==========================================

async function handleCoinTap(event){



    if(energy <= 0){


        TelegramApp.popup(
            "Energy Empty",
            "Wait for recharge"
        );


        return;

    }





    energy -= 1;


    localBalance += tapPower;



    updateEnergyUI();


    setText(
        "balance",
        localBalance
    );



    TelegramApp.haptic(
        "light"
    );




    // Coin Animation

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






    // +1 Effect

    createTapEffect(
        event.clientX,
        event.clientY
    );






    // Save

    if(currentUser){


        await API.addBalance(

            currentUser.telegramId,

            tapPower

        );


    }



}






// ==========================================
// Floating +1 Effect
// ==========================================

function createTapEffect(x,y){



    const plus =
        document.createElement(
            "div"
        );



    plus.innerHTML =
        "+1";



    plus.style.position =
        "fixed";



    plus.style.left =
        x + "px";



    plus.style.top =
        y + "px";



    plus.style.color =
        "#ffc107";



    plus.style.fontSize =
        "24px";



    plus.style.fontWeight =
        "bold";



    plus.style.pointerEvents =
        "none";



    plus.style.zIndex =
        "9999";



    plus.style.transition =
        "all .7s ease";



    document.body.appendChild(
        plus
    );




    setTimeout(()=>{


        plus.style.transform =
        "translateY(-80px)";



        plus.style.opacity =
        "0";



    },20);




    setTimeout(()=>{


        plus.remove();


    },800);


}






// ==========================================
// Energy Recharge
// ==========================================

setInterval(()=>{


    if(
        energy < maxEnergy
    ){


        energy++;


        updateEnergyUI();


    }


},10000);







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
