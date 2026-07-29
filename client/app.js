// ==========================================
// Zoryx Telegram WebApp
// client/app.js
// ==========================================


let currentUser = null;

let energy = 1000;

let maxEnergy = 1000;

let tapPower = 1;

let localBalance = 0;

let saving = false;


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


        startEnergyRecharge();



    }catch(error){


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
            res.message ||
            "Unable to login"
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
// Load Profile
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


async function handleCoinTap(e){



    e.stopPropagation();



    if(energy <= 0){


        TelegramApp.popup(
            "Energy Empty",
            "Wait for recharge"
        );


        return;


    }





    energy--;

    localBalance += tapPower;



    updateEnergyUI();


    setText(
        "balance",
        localBalance
    );



    TelegramApp.haptic(
        "light"
    );



    animateCoin();



    createTapEffect();



    saveTap();



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
    "scale(.9)";



    setTimeout(()=>{


        coin.style.transform =
        "scale(1)";


    },100);


}







// ==========================================
// Save Tap
// ==========================================


async function saveTap(){


    if(
        !currentUser ||
        saving
    )
    return;



    saving=true;



    try{


        await API.addBalance(

            currentUser.telegramId,

            tapPower

        );



    }catch(error){


        console.log(error);


    }



    saving=false;



}







// ==========================================
// +1 Effect
// ==========================================


function createTapEffect(){


    const coin =
    document.getElementById(
        "coin"
    );


    const area =
    document.getElementById(
        "coinArea"
    );



    if(!coin || !area)
    return;




    const effect =
    document.createElement(
        "div"
    );



    effect.className =
    "tap-effect";



    effect.innerText =
    "+1";



    const rect =
    coin.getBoundingClientRect();



    effect.style.left =
    (rect.width/2)+"px";



    effect.style.top =
    (rect.height/2)+"px";



    area.appendChild(
        effect
    );



    setTimeout(()=>{


        effect.remove();


    },800);



}







// ==========================================
// Energy Recharge
// ==========================================


function startEnergyRecharge(){


    setInterval(async()=>{


        if(
            energy < maxEnergy
        ){


            energy++;


            updateEnergyUI();



            if(currentUser){


                await API.updateProfile(

                    currentUser.telegramId,

                    {

                        energy

                    }

                );


            }



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



    loading.style.display =
    show ? "flex":"none";



    app.style.display =
    show ? "none":"block";



}







function setText(id,value){


    const el =
    document.getElementById(id);



    if(el)
    el.textContent=value;


}







window.Zoryx={


    reload:
    loadUserData,


    getUser(){


        return currentUser;


    }


};
