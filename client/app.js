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


// ==========================================
// Anti Auto Click Detection
// ==========================================

let tapHistory = [];

let autoClickStrike = 0;

const AUTO_CLICK_LIMIT = 35;

const AUTO_CLICK_WINDOW = 1000;

function detectAutoClick(){

    const now = Date.now();

    tapHistory.push(now);

    tapHistory = tapHistory.filter(

        time => now - time <= AUTO_CLICK_WINDOW

    );

    if(tapHistory.length >= AUTO_CLICK_LIMIT){

        autoClickStrike++;

        pendingTap = 0;

        localBalance = Math.max(

            0,

            localBalance - tapHistory.length

        );

        setText(

            "balance",

            Number(localBalance).toLocaleString()

        );

        popup(

            "Auto Click Detected",

            "Suspicious tapping detected.\nCoins removed."

        );

        tapHistory = [];

        return true;

    }

    return false;

}

// ==========================================
// Override Tap
// ==========================================

const originalHandleCoinTap = handleCoinTap;

handleCoinTap = function(event){

    if(detectAutoClick()){

        return;

    }

    originalHandleCoinTap(event);

};

// ==========================================
// Server Sync
// ==========================================

async function syncTap(){

    if(savingTap)
    return;

    if(pendingTap<=0)
    return;

    savingTap = true;

    const amount = pendingTap;

    pendingTap = 0;

    try{

        const result =

        await API.tap(

            currentUser.telegramId,

            amount

        );

        if(result.success){

            localBalance =

            result.balance;

            energy =

            result.energy;

            updateEnergyUI();

            setText(

                "balance",

                Number(localBalance)

                .toLocaleString()

            );

        }

    }

    catch(error){

        console.log(error);

        pendingTap += amount;

    }

    savingTap = false;

    if(pendingTap>0){

        syncTap();

    }

}

// ==========================================
// Queue Sync
// ==========================================

setInterval(()=>{

    if(

        pendingTap>0 &&

        !savingTap

    ){

        syncTap();

    }

},250);

// ==========================================
// Leaderboard Button
// ==========================================

const leaderboardButton =

document.getElementById(

    "leaderboardButton"

);

if(leaderboardButton){

    leaderboardButton.addEventListener(

        "click",

        ()=>{

            toast(

                "Leaderboard Coming Soon"

            );

        }

    );

}

// ==========================================
// Copy Referral
// ==========================================

const copyReferral =

document.getElementById(

    "copyReferral"

);

if(copyReferral){

    copyReferral.addEventListener(

        "click",

        ()=>{

            const input =

            document.getElementById(

                "referralLink"

            );

            if(!input)
            return;

            input.select();

            document.execCommand(

                "copy"

            );

            toast(

                "Referral Link Copied"

            );

        }

    );

}

// ==========================================
// Refresh Profile
// ==========================================

async function refreshProfile(){

    if(!currentUser)
    return;

    try{

        await loadUserData();

    }

    catch(error){

        console.log(error);

    }

     }


// ==========================================
// Energy Recharge
// ==========================================

function startEnergyRecharge(){

    setInterval(()=>{

        if(energy < maxEnergy){

            energy++;

            updateEnergyUI();

        }

    },4000);

}

// ==========================================
// Daily Reward
// Reset : 05:00 GMT
// ==========================================

function checkDailyReward(){

    const now = new Date();

    const utcHour = now.getUTCHours();

    const today = now.toISOString().slice(0,10);

    let lastClaim =

    localStorage.getItem(

        "dailyReward"

    );

    if(lastClaim===today && utcHour>=5){

        return;

    }

    if(utcHour>=5){

        document
        .getElementById("dailyModal")
        ?.classList.remove("hidden");

    }

}

document
.getElementById(
"claimDaily"
)
?.addEventListener(

"click",

()=>{

    localBalance+=5000;

    setText(

        "balance",

        Number(localBalance)

        .toLocaleString()

    );

    localStorage.setItem(

        "dailyReward",

        new Date()

        .toISOString()

        .slice(0,10)

    );

    document
    .getElementById("dailyModal")
    ?.classList.add("hidden");

    toast(

        "+5000 Coin Claimed"

    );

});

// ==========================================
// Lucky Spin
// ==========================================

function checkLuckySpin(){

    const url =

    new URLSearchParams(

        window.location.search

    );

    if(

        url.has("startapp")

    ){

        const modal =

        document.getElementById(

            "spinModal"

        );

        modal?.classList.remove(

            "hidden"

        );

    }

}

document
.getElementById(
"spinButton"
)
?.addEventListener(

"click",

()=>{

    const reward =

    Math.floor(

        Math.random()*5000

    )+1000;

    localBalance+=reward;

    setText(

        "balance",

        Number(localBalance)

        .toLocaleString()

    );

    document
    .getElementById("spinModal")
    ?.classList.add("hidden");

    popup(

        "Lucky Spin",

        `You won ${reward} Coins`

    );

});

// ==========================================
// Navigation
// ==========================================

function openPage(name){

    document

    .querySelectorAll(".page")

    .forEach(page=>{

        page.classList.remove(

            "active"

        );

    });

    const target =

    document.getElementById(

        name+"Page"

    );

    if(target){

        target.classList.add(

            "active"

        );

    }

    document

    .querySelectorAll(".nav")

    .forEach(btn=>{

        btn.classList.remove(

            "active"

        );

        if(

            btn.dataset.page===name

        ){

            btn.classList.add(

                "active"

            );

        }

    });

}

document
.querySelectorAll(".nav")
.forEach(btn=>{

    btn.addEventListener(

        "click",

        ()=>{

            openPage(

                btn.dataset.page

            );

        }

    );

});

// ==========================================
// Popup
// ==========================================

function popup(title,message){

    setText(

        "popupTitle",

        title

    );

    setText(

        "popupMessage",

        message

    );

    document

    .getElementById("popup")

    ?.classList.remove(

        "hidden"

    );

}

document
.getElementById(
"popupButton"
)
?.addEventListener(

"click",

()=>{

    document

    .getElementById("popup")

    ?.classList.add(

        "hidden"

    );

});

// ==========================================
// Toast
// ==========================================

function toast(text){

    const box =

    document

    .getElementById(

        "toastContainer"

    );

    if(!box)
    return;

    const item =

    document

    .createElement(

        "div"

    );

    item.className="toast";

    item.textContent=text;

    box.appendChild(item);

    setTimeout(()=>{

        item.remove();

    },2500);

}

// ==========================================
// Start
// ==========================================

startEnergyRecharge();

checkDailyReward();

checkLuckySpin();

// ==========================================
// Final Export
// ==========================================

window.Zoryx={

    reload(){

        loadUserData();

    },

    open(page){

        openPage(page);

    },

    getUser(){

        return currentUser;

    }

};



// ==========================================
// Leaderboard System
// ==========================================

let leaderboardData = [];

let leaderboardLoaded = false;

// ==========================================
// Load Leaderboard
// ==========================================

async function loadLeaderboard(){

    try{

        const result =
        await API.getLeaderboard();

        if(!result.success){

            toast("Unable to load leaderboard");

            return;

        }

        leaderboardData =
        result.data || [];

        leaderboardLoaded = true;

        renderLeaderboard();

    }

    catch(error){

        console.log(error);

        toast("Leaderboard Error");

    }

}

// ==========================================
// Render Leaderboard
// ==========================================

function renderLeaderboard(){

    let modal =
    document.getElementById(
        "leaderboardModal"
    );

    if(!modal)
        return;

    const list =
    document.getElementById(
        "leaderboardList"
    );

    if(!list)
        return;

    list.innerHTML = "";

    if(leaderboardData.length===0){

        list.innerHTML =

        `
        <div class="emptyLeaderboard">

            No Players Found

        </div>
        `;

        return;

    }

    leaderboardData.forEach(

        (user,index)=>{

            const item =
            document.createElement(
                "div"
            );

            item.className =
            "leaderItem";

            item.innerHTML =

            `
            <div class="leaderRank">

                #${index+1}

            </div>

            <img
            class="leaderPhoto"
            src="${user.photo || 'icon-192.png'}">

            <div class="leaderInfo">

                <div class="leaderName">

                    ${user.firstName}

                </div>

                <div class="leaderCoin">

                    ${Number(user.balance)
                    .toLocaleString()} Coin

                </div>

            </div>
            `;

            list.appendChild(item);

        }

    );

}

// ==========================================
// Open Leaderboard
// ==========================================

function openLeaderboard(){

    if(!leaderboardLoaded){

        loadLeaderboard();

    }

    document
    .getElementById(
        "leaderboardModal"
    )
    ?.classList.remove(
        "hidden"
    );

}

// ==========================================
// Close Leaderboard
// ==========================================

function closeLeaderboard(){

    document
    .getElementById(
        "leaderboardModal"
    )
    ?.classList.add(
        "hidden"
    );

}

// ==========================================
// Events
// ==========================================

document
.getElementById(
    "leaderboardButton"
)
?.addEventListener(

    "click",

    openLeaderboard

);

document
.getElementById(
    "closeLeaderboard"
)
?.addEventListener(

    "click",

    closeLeaderboard

); 

// ==========================================
// Leaderboard Refresh
// ==========================================

let leaderboardRefreshing = false;

async function refreshLeaderboard(){

    if(leaderboardRefreshing)
    return;

    leaderboardRefreshing = true;

    try{

        const result =
        await API.getLeaderboard();

        if(result.success){

            leaderboardData =
            result.data || [];

            renderLeaderboard();

        }

    }

    catch(error){

        console.log(error);

    }

    leaderboardRefreshing = false;

}

// ==========================================
// Highlight Current User
// ==========================================

function getRankClass(index){

    if(index===0)
    return "gold";

    if(index===1)
    return "silver";

    if(index===2)
    return "bronze";

    return "";

}

// ==========================================
// Update Render
// ==========================================

function createLeaderItem(user,index){

    const item =
    document.createElement("div");

    item.className =
    "leaderItem " +
    getRankClass(index);

    const isMe =

    currentUser &&

    user.telegramId ===

    currentUser.telegramId;

    item.innerHTML =

    `
    <div class="leaderRank">

        #${index+1}

    </div>

    <img
    class="leaderPhoto"
    src="${user.photo || "icon-192.png"}">

    <div class="leaderInfo">

        <div class="leaderName">

            ${user.firstName}

            ${isMe ? "⭐" : ""}

        </div>

        <div class="leaderCoin">

            ${Number(user.balance)
            .toLocaleString()}

            Coin

        </div>

    </div>
    `;

    return item;

}

// ==========================================
// New Render
// ==========================================

function renderLeaderboard(){

    const list =

    document.getElementById(

        "leaderboardList"

    );

    if(!list)
    return;

    list.innerHTML="";

    if(

        leaderboardData.length===0

    ){

        list.innerHTML=

        "<p class='emptyLeaderboard'>No Data</p>";

        return;

    }

    leaderboardData.forEach(

        (user,index)=>{

            list.appendChild(

                createLeaderItem(

                    user,

                    index

                )

            );

        }

    );

}

// ==========================================
// Auto Refresh
// ==========================================

setInterval(()=>{

    if(

        leaderboardLoaded

    ){

        refreshLeaderboard();

    }

},30000);


// ==========================================
// Leaderboard Top 3
// ==========================================

function renderTopPlayers(){

    const topBox =

    document.getElementById(

        "leaderboardTop"

    );

    if(!topBox)
    return;

    topBox.innerHTML="";

    leaderboardData
    .slice(0,3)
    .forEach((user,index)=>{

        const card=
        document.createElement("div");

        card.className=
        "topPlayer";

        let medal="🥉";

        if(index===0) medal="🥇";
        if(index===1) medal="🥈";

        card.innerHTML=`

            <div class="topMedal">

                ${medal}

            </div>

            <img
            class="topPhoto"
            src="${user.photo || "icon-192.png"}">

            <div class="topName">

                ${user.firstName}

            </div>

            <div class="topCoin">

                ${Number(user.balance)
                .toLocaleString()}

            </div>

        `;

        topBox.appendChild(card);

    });

}

// ==========================================
// Current User Rank
// ==========================================

function updateMyRank(){

    if(!currentUser)
    return;

    const rank=

    leaderboardData.findIndex(

        x=>

        x.telegramId===

        currentUser.telegramId

    );

    const myRank=

    document.getElementById(

        "myRank"

    );

    if(myRank){

        myRank.textContent=

        rank>=0 ?

        "#"+(rank+1)

        :

        "--";

    }

}

// ==========================================
// Search Player
// ==========================================

function searchLeaderboard(keyword){

    keyword=

    keyword.toLowerCase();

    const list=

    document.getElementById(

        "leaderboardList"

    );

    if(!list)
    return;

    list.innerHTML="";

    leaderboardData

    .filter(user=>

        user.firstName

        .toLowerCase()

        .includes(keyword)

    )

    .forEach((user,index)=>{

        list.appendChild(

            createLeaderItem(

                user,

                index

            )

        );

    });

}

// ==========================================
// Search Event
// ==========================================

const leaderSearch=

document.getElementById(

    "leaderboardSearch"

);

if(leaderSearch){

    leaderSearch

    .addEventListener(

        "input",

        e=>{

            searchLeaderboard(

                e.target.value

            );

        }

    );

}

// ==========================================
// Update Leaderboard UI
// ==========================================

const oldRender=

renderLeaderboard;

renderLeaderboard=function(){

    oldRender();

    renderTopPlayers();

    updateMyRank();

};

// ==========================================
// Refresh Button
// ==========================================

document
.getElementById(
"refreshLeaderboard"
)
?.addEventListener(

"click",

()=>{

    refreshLeaderboard();

    toast(

        "Leaderboard Updated"

    );

});


// ==========================================
// Earn / Task System
// ==========================================

let taskList = [];

let taskLoaded = false;

// ==========================================
// Load Tasks
// ==========================================

async function loadTasks(){

    try{

        const result =
        await API.getTasks();

        if(!result.success){

            toast("Unable to load tasks");

            return;

        }

        taskList =
        result.tasks || [];

        taskLoaded = true;

        renderTasks();

    }

    catch(error){

        console.log(error);

        toast("Task Loading Failed");

    }

}

// ==========================================
// Render Tasks
// ==========================================

function renderTasks(){

    const list =
    document.getElementById(
        "taskList"
    );

    if(!list)
    return;

    list.innerHTML = "";

    if(taskList.length===0){

        list.innerHTML =

        `
        <div class="emptyTask">

            No Task Available

        </div>
        `;

        return;

    }

    taskList.forEach(task=>{

        const item =
        document.createElement("div");

        item.className =
        "taskCard";

        item.innerHTML =

        `
        <div class="taskLeft">

            <div class="taskTitle">

                ${task.title}

            </div>

            <div class="taskReward">

                +${Number(task.reward).toLocaleString()} Coin

            </div>

        </div>

        <button
        class="taskButton"

        onclick="claimTask('${task.id}')">

            ${task.completed ? "Claimed" : "Claim"}

        </button>
        `;

        list.appendChild(item);

    });

}

// ==========================================
// Claim Task
// ==========================================

async function claimTask(id){

    try{

        const result =

        await API.claimTask(

            currentUser.telegramId,

            id

        );

        if(!result.success){

            popup(

                "Task",

                result.message

            );

            return;

        }

        localBalance =
        result.balance;

        setText(

            "balance",

            Number(localBalance)
            .toLocaleString()

        );

        toast(

            "+"+

            Number(result.reward)

            .toLocaleString()

            +" Coin"

        );

        loadTasks();

    }

    catch(error){

        console.log(error);

    }

}

// ==========================================
// Open Earn Page
// ==========================================

function openEarn(){

    if(!taskLoaded){

        loadTasks();

    }

}

// ==========================================
// Earn Navigation
// ==========================================

document

.querySelectorAll(".nav")

.forEach(btn=>{

    btn.addEventListener(

        "click",

        ()=>{

            if(

                btn.dataset.page===

                "earn"

            ){

                openEarn();

            }

        }

    );

});


