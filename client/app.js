// ==========================================
// Zoryx Telegram Mini App
// client/app.js
// PART 1
// ==========================================

"use strict";

// ==========================================
// Global
// ==========================================

let currentUser = null;

let localBalance = 0;

let energy = 1000;

let maxEnergy = 1000;

let tapPower = 1;

let pendingTap = 0;

let savingTap = false;

let activeEffects = [];

let currentPage = "home";

let rechargeTimer = null;

// ==========================================
// DOM Ready
// ==========================================

document.addEventListener(
"DOMContentLoaded",
async()=>{

    console.log("🚀 Zoryx Started");

    showLoading(true);

    try{

        await login();

        registerEvents();

        startEnergyRecharge();

        switchPage("home");

        showLoading(false);

    }
    catch(e){

        console.error(e);

        showLoading(false);

        popup(
            "Error",
            "Unable to start application."
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

        popup(
            "Login Failed",
            res.message || "Unknown Error"
        );

        throw new Error("Login Failed");

    }

    currentUser =
    res.user;

    await loadUserData();

}

// ==========================================
// Load Profile
// ==========================================

async function loadUserData(){

    const result =
    await API.getProfile(
        currentUser.telegramId
    );

    if(result.success){

        currentUser =
        result.user;

    }

    localBalance =
    currentUser.balance || 0;

    energy =
    currentUser.energy ?? 1000;

    maxEnergy =
    currentUser.maxEnergy ?? 1000;

    updateUserUI();

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
        "Level " + (currentUser.level || 1)
    );

    setText(
        "balance",
        Number(localBalance).toLocaleString()
    );

    const photo =
    currentUser.photo ||
    "icon-192.png";

    const ids=[

        "userPhoto",

        "profilePhoto"

    ];

    ids.forEach(id=>{

        const img=
        document.getElementById(id);

        if(img){

            img.src=photo;

        }

    });

    setText(

        "profileName",

        currentUser.firstName || "User"

    );

    setText(

        "profileUsername",

        currentUser.username ?

        "@"+currentUser.username :

        "@telegram"

    );

    setText(

        "telegramId",

        currentUser.telegramId || "-"

    );

    setText(

        "uid",

        currentUser.uid || "-"

    );

    setText(

        "profileBalance",

        Number(localBalance).toLocaleString()

    );

    setText(

        "totalTap",

        Number(currentUser.totalTap || 0)

        .toLocaleString()

    );

    setText(

        "profileReferral",

        currentUser.referrals || 0

    );

    setText(

        "joinDate",

        currentUser.joinDate || "-"

    );

    setText(

        "currentLevel",

        "Level " + (currentUser.level || 1)

    );

    updateEnergyUI();

}

// ==========================================
// Energy
// ==========================================

function updateEnergyUI(){

    const txt=
    document.getElementById(
    "energyText"
    );

    const fill=
    document.getElementById(
    "energyFill"
    );

    if(txt){

        txt.innerHTML=

        energy+" / "+maxEnergy;

    }

    if(fill){

        fill.style.width=

        (energy/maxEnergy)*100+"%";

    }

}

// ==========================================
// Navigation
// ==========================================

function registerEvents(){

    document
    .querySelectorAll(".nav")
    .forEach(btn=>{

        btn.onclick=()=>{

            switchPage(

                btn.dataset.page

            );

        };

    });

    document
    .getElementById("settingButton")
    ?.addEventListener(

        "click",

        ()=>{

            openSettings();

        }

    );

    document
    .getElementById("closeSettings")
    ?.addEventListener(

        "click",

        closeSettings

    );

}

// ==========================================
// Page Switch
// ==========================================

function switchPage(page){

    currentPage=page;

    document
    .querySelectorAll(".page")
    .forEach(x=>x.classList.remove("active"));

    document
    .querySelectorAll(".nav")
    .forEach(x=>x.classList.remove("active"));

    const p=
    document.getElementById(
        page+"Page"
    );

    if(p){

        p.classList.add("active");

    }

    document
    .querySelector(

    '.nav[data-page="'+page+'"]'

    )?.classList.add("active");

}

// ==========================================
// Loading
// ==========================================

function showLoading(show){

    document
    .getElementById("loading")
    .style.display=

    show?"flex":"none";

    document
    .getElementById("app")
    .classList.toggle(

        "hidden",

        show

    );

}

// ==========================================
// Popup
// ==========================================

function popup(title,msg){

    document
    .getElementById("popupTitle")
    .textContent=title;

    document
    .getElementById("popupMessage")
    .textContent=msg;

    document
    .getElementById("popup")
    .classList.remove("hidden");

    document
    .getElementById("overlay")
    .classList.remove("hidden");

    document
    .getElementById("popupButton")
    .onclick=()=>{

        document
        .getElementById("popup")
        .classList.add("hidden");

        document
        .getElementById("overlay")
        .classList.add("hidden");

    };

}

// ==========================================
// Toast
// ==========================================

function toast(text){

    const box=
    document.createElement("div");

    box.className="toast";

    box.textContent=text;

    document
    .getElementById("toastContainer")
    .appendChild(box);

    setTimeout(()=>{

        box.remove();

    },2500);

}

// ==========================================
// Settings
// ==========================================

function openSettings(){

    document
    .getElementById("settingsSheet")
    .classList.remove("hidden");

    document
    .getElementById("overlay")
    .classList.remove("hidden");

}

function closeSettings(){

    document
    .getElementById("settingsSheet")
    .classList.add("hidden");

    document
    .getElementById("overlay")
    .classList.add("hidden");

}

// ==========================================
// Helper
// ==========================================

function setText(id,val){

    const el=
    document.getElementById(id);

    if(el){

        el.textContent=val;

    }

        }


// ==========================================
// Coin Events
// ==========================================

function registerCoin(){

    const coin =
    document.getElementById("coin");

    if(!coin)
    return;

    coin.addEventListener(

        "click",

        handleCoinTap

    );

}

// ==========================================
// Coin Tap
// ==========================================

function handleCoinTap(e){

    if(!currentUser)
    return;

    if(energy<=0){

        toast("Energy Empty");

        return;

    }

    energy--;

    localBalance+=tapPower;

    pendingTap+=tapPower;

    updateEnergyUI();

    setText(

        "balance",

        Number(localBalance)

        .toLocaleString()

    );

    animateCoin();

    createRipple(e);

    createTapEffect(e);

    if(window.Telegram?.WebApp){

        Telegram.WebApp

        .HapticFeedback

        .impactOccurred("light");

    }

    syncTap();

}

// ==========================================
// Coin Animation
// ==========================================

function animateCoin(){

    const coin=

    document.getElementById(

        "coin"

    );

    if(!coin)
    return;

    coin.classList.remove(

        "coinBounce"

    );

    void coin.offsetWidth;

    coin.classList.add(

        "coinBounce"

    );

}

// ==========================================
// Ripple Effect
// ==========================================

function createRipple(event){

    const box=

    document.getElementById(

        "rippleContainer"

    );

    if(!box)
    return;

    const ripple=

    document.createElement(

        "div"

    );

    ripple.className="ripple";

    const rect=

    document

    .getElementById("coin")

    .getBoundingClientRect();

    ripple.style.left=

    (event.clientX-rect.left)+"px";

    ripple.style.top=

    (event.clientY-rect.top)+"px";

    box.appendChild(ripple);

    setTimeout(()=>{

        ripple.remove();

    },550);

}

// ==========================================
// Floating +1
// ==========================================

function createTapEffect(event){

    const area=

    document.getElementById(

        "tapEffects"

    );

    if(!area)
    return;

    const effect=

    document.createElement(

        "div"

    );

    effect.className=

    "tap-effect";

    effect.innerHTML="+1";

    const rect=

    document

    .getElementById("coin")

    .getBoundingClientRect();

    effect.style.left=

    (event.clientX-rect.left)+"px";

    effect.style.top=

    (event.clientY-rect.top)+"px";

    area.appendChild(effect);

    activeEffects.push(effect);

    if(activeEffects.length>8){

        activeEffects

        .shift()

        .remove();

    }

    setTimeout(()=>{

        effect.remove();

        activeEffects=

        activeEffects.filter(

        x=>x!==effect

        );

    },550);

}

// ==========================================
// Register Extra Events
// ==========================================

registerCoin();

