// ==========================================
// Zoryx Telegram WebApp
// client/app.js
// ==========================================

"use strict";



// ==========================================
// Global State
// ==========================================

const App = {};

App.user = null;

App.telegramId = 0;

App.balance = 0;

App.energy = 0;

App.maxEnergy = 1000;

App.totalTap = 0;

App.level = 1;

App.referrals = 0;

App.loading = false;

App.initialized = false;



// ==========================================
// DOM Helper
// ==========================================

const $ = (id) => document.getElementById(id);



// ==========================================
// Loading
// ==========================================

App.showLoading = () => {

    const loading = $("loading");

    if (loading) {

        loading.style.display = "flex";

    }

};



App.hideLoading = () => {

    const loading = $("loading");

    if (loading) {

        loading.style.display = "none";

    }

};



// ==========================================
// User Interface Update
// ==========================================

App.updateUI = () => {

    if ($("balance")) {

        $("balance").textContent =

            Number(App.balance).toLocaleString();

    }

    if ($("energy")) {

        $("energy").textContent =

            `${App.energy}/${App.maxEnergy}`;

    }

    if ($("level")) {

        $("level").textContent =

            App.level;

    }

    if ($("userName")) {

        $("userName").textContent =

            App.user?.firstName ||

            TelegramApp.getFirstName();

    }

    const photo =

        App.user?.photo ||

        TelegramApp.getPhoto();

    if (

        photo &&

        $("userPhoto")

    ) {

        $("userPhoto").src = photo;

    }

};



// ==========================================
// Login
// ==========================================

App.login = async () => {

    App.showLoading();

    const result =

        await API.login();

    if (!result.success) {

        App.hideLoading();

        TelegramApp.alert(

            result.message ||

            "Login Failed"

        );

        return false;

    }

    App.user = result.user;

    App.telegramId =

        result.user.telegramId;

    App.balance =

        result.user.balance;

    App.energy =

        result.user.energy;

    App.maxEnergy =

        result.user.maxEnergy;

    App.totalTap =

        result.user.totalTap;

    App.level =

        result.user.level;

    App.referrals =

        result.user.referrals || 0;

    App.updateUI();

    App.hideLoading();

    return true;

};



// ==========================================
// App Start
// ==========================================

App.start = async () => {

    if (App.initialized) return;

    App.initialized = true;

    const ok =

        await App.login();

    if (!ok) return;

    console.log(

        "✅ Zoryx Started"

    );

};



// ==========================================
// Load User Profile
// ==========================================

App.loadProfile = async () => {

    const result = await API.getProfile(

        App.telegramId

    );

    if (!result.success) {

        console.log(

            "Profile Load Failed"

        );

        return;

    }

    App.user = result.user;

    App.balance = result.user.balance;

    App.energy = result.user.energy;

    App.maxEnergy = result.user.maxEnergy;

    App.level = result.user.level;

    App.totalTap = result.user.totalTap;

    App.referrals = result.user.referrals || 0;

    App.updateUI();

};



// ==========================================
// Refresh Balance
// ==========================================

App.refreshBalance = async () => {

    const result = await API.getProfile(

        App.telegramId

    );

    if (!result.success) return;

    App.balance = result.user.balance;

    App.updateUI();

};



// ==========================================
// Refresh Energy
// ==========================================

App.refreshEnergy = async () => {

    const result = await API.getProfile(

        App.telegramId

    );

    if (!result.success) return;

    App.energy = result.user.energy;

    App.maxEnergy = result.user.maxEnergy;

    App.updateUI();

};



// ==========================================
// Refresh User
// ==========================================

App.refreshUser = async () => {

    const result = await API.getProfile(

        App.telegramId

    );

    if (!result.success) return;

    App.user = result.user;

    App.balance = result.user.balance;

    App.energy = result.user.energy;

    App.maxEnergy = result.user.maxEnergy;

    App.totalTap = result.user.totalTap;

    App.level = result.user.level;

    App.referrals = result.user.referrals || 0;

    App.updateUI();

};



// ==========================================
// Auto Refresh
// ==========================================

App.startAutoRefresh = () => {

    setInterval(async () => {

        if (!App.telegramId) return;

        await App.refreshUser();

    }, 5000);

};



// ==========================================
// Initial Data Load
// ==========================================

App.loadData = async () => {

    await App.loadProfile();

    App.startAutoRefresh();

    console.log(

        "✅ User Data Loaded"

    );

};


// ==========================================
// Navigation
// ==========================================

App.currentPage = "home";

App.showPage = (page) => {

    document.querySelectorAll(".page").forEach(el => {

        el.classList.remove("active");

    });

    document.querySelectorAll(".nav-item").forEach(el => {

        el.classList.remove("active");

    });

    const pageElement = document.getElementById(page);

    if (pageElement) {

        pageElement.classList.add("active");

    }

    const navElement = document.querySelector(

        `[data-page="${page}"]`

    );

    if (navElement) {

        navElement.classList.add("active");

    }

    App.currentPage = page;

};



// ==========================================
// Navigation Events
// ==========================================

App.initNavigation = () => {

    document.querySelectorAll(".nav-item").forEach(item => {

        item.addEventListener("click", () => {

            const page = item.dataset.page;

            if (!page) return;

            TelegramApp.haptic("light");

            App.showPage(page);

        });

    });

};



// ==========================================
// Coin Tap
// ==========================================

App.tapCoin = async () => {

    if (App.loading) return;

    if (App.energy <= 0) {

        TelegramApp.toast("Energy Empty");

        TelegramApp.haptic("warning");

        return;

    }

    App.loading = true;

    TelegramApp.haptic("light");

    const result = await API.tap(

        App.telegramId,

        1

    );

    App.loading = false;

    if (!result.success) {

        TelegramApp.toast(

            result.message ||

            "Tap Failed"

        );

        return;

    }

    App.balance = result.balance;

    App.energy = result.energy;

    App.totalTap++;

    App.updateUI();

    if (typeof App.coinEffect === "function") {

        App.coinEffect();

    }

    if (typeof App.floatingText === "function") {

        App.floatingText("+1");

    }

};



// ==========================================
// Coin Event
// ==========================================

App.initCoin = () => {

    const coin = document.getElementById("coin");

    if (!coin) return;

    coin.addEventListener(

        "click",

        App.tapCoin

    );

};



// ==========================================
// Popup Close
// ==========================================

App.initPopup = () => {

    const overlay = document.getElementById("overlay");

    if (overlay) {

        overlay.addEventListener(

            "click",

            TelegramApp.closePopup

        );

    }

    const close = document.getElementById("popupClose");

    if (close) {

        close.addEventListener(

            "click",

            TelegramApp.closePopup

        );

    }

};



// ==========================================
// Initialize
// ==========================================

App.init = async () => {

    await App.start();

    await App.loadData();

    App.initNavigation();

    App.initCoin();

    App.initPopup();

};


// ==========================================
// Coin Animation
// ==========================================

App.coinEffect = () => {

    const coin = document.getElementById("coin");

    if (!coin) return;

    coin.classList.remove("tap");

    void coin.offsetWidth;

    coin.classList.add("tap");

};



// ==========================================
// Floating +Coin Text
// ==========================================

App.floatingText = (text = "+1") => {

    const coin = document.getElementById("coin");

    if (!coin) return;

    const floating = document.createElement("div");

    floating.className = "floating-coin";

    floating.innerText = text;

    const rect = coin.getBoundingClientRect();

    floating.style.left =

        rect.left + rect.width / 2 + "px";

    floating.style.top =

        rect.top + "px";

    document.body.appendChild(floating);

    setTimeout(() => {

        floating.remove();

    }, 1000);

};



// ==========================================
// Animate Balance
// ==========================================

App.animateBalance = (

    from,

    to,

    duration = 300

) => {

    const element = document.getElementById("balance");

    if (!element) return;

    const start = performance.now();

    function animate(now) {

        const progress = Math.min(

            (now - start) / duration,

            1

        );

        const value = Math.floor(

            from + (to - from) * progress

        );

        element.innerText =

            value.toLocaleString();

        if (progress < 1) {

            requestAnimationFrame(animate);

        }

    }

    requestAnimationFrame(animate);

};



// ==========================================
// Animate Energy
// ==========================================

App.animateEnergy = () => {

    const bar = document.getElementById("energyFill");

    if (!bar) return;

    const percent =

        (App.energy / App.maxEnergy) * 100;

    bar.style.width =

        percent + "%";

};



// ==========================================
// Level Progress
// ==========================================

App.updateLevelBar = () => {

    const progress =

        document.getElementById("levelProgress");

    if (!progress) return;

    const nextLevel =

        App.level * 1000;

    const value =

        Math.min(

            (App.totalTap / nextLevel) * 100,

            100

        );

    progress.style.width =

        value + "%";

};



// ==========================================
// Auto Energy Refresh
// ==========================================

App.startEnergyLoop = () => {

    setInterval(async () => {

        if (!App.telegramId) return;

        const result =

            await API.getProfile(

                App.telegramId

            );

        if (!result.success) return;

        App.energy =

            result.user.energy;

        App.maxEnergy =

            result.user.maxEnergy;

        App.animateEnergy();

        App.updateUI();

    }, 4000);

};



// ==========================================
// Update Effects
// ==========================================

App.updateEffects = () => {

    App.animateEnergy();

    App.updateLevelBar();

};


// ==========================================
// Leaderboard
// ==========================================

App.loadLeaderboard = async () => {

    const result = await API.getLeaderboard();

    if (!result.success) return;

    const container = document.getElementById(

        "leaderboardList"

    );

    if (!container) return;

    container.innerHTML = "";

    result.leaderboard.forEach((user, index) => {

        const item = document.createElement("div");

        item.className = "leaderboard-item";

        item.innerHTML = `

            <div class="leaderboard-rank">
                #${index + 1}
            </div>

            <div class="leaderboard-user">

                <img
                    src="${user.photo || "icon-192.png"}"
                    class="leader-avatar"
                >

                <div>

                    <div class="leader-name">

                        ${user.firstName || "User"}

                    </div>

                    <div class="leader-level">

                        Level ${user.level || 1}

                    </div>

                </div>

            </div>

            <div class="leader-balance">

                ${Number(user.balance).toLocaleString()}

            </div>

        `;

        container.appendChild(item);

    });

};



// ==========================================
// Referral
// ==========================================

App.loadReferral = async () => {

    const result = await API.getReferrals(

        App.telegramId

    );

    if (!result.success) return;

    App.referrals =

        result.referrals || 0;

    const text = document.getElementById(

        "referralCount"

    );

    if (text) {

        text.textContent =

            App.referrals;

    }

};



// ==========================================
// Share Referral
// ==========================================

App.shareReferral = () => {

    const link =

        `https://t.me/${TelegramApp.getUsername()}?start=${App.telegramId}`;

    if (navigator.share) {

        navigator.share({

            title: "Zoryx",

            text: "Join Zoryx",

            url: link

        });

    } else {

        navigator.clipboard.writeText(link);

        TelegramApp.toast(

            "Referral Link Copied"

        );

    }

};



// ==========================================
// Home Refresh
// ==========================================

App.refreshHome = async () => {

    await App.refreshUser();

    await App.loadReferral();

    await App.loadLeaderboard();

    App.updateEffects();

};



// ==========================================
// Auto Home Refresh
// ==========================================

App.startHomeLoop = () => {

    setInterval(() => {

        App.refreshHome();

    }, 10000);

};


// ==========================================
// Daily Reward
// ==========================================

App.dailyReward = () => {

    const today = new Date().toDateString();

    const last = localStorage.getItem("zoryx_daily");

    if (last === today) {

        return;

    }

    localStorage.setItem(

        "zoryx_daily",

        today

    );

    App.balance += 100;

    App.updateUI();

    TelegramApp.popup(

        "🎁 Daily Reward",

        "You received 100 Coins!"

    );

};



// ==========================================
// Statistics
// ==========================================

App.updateStats = () => {

    const tapText = document.getElementById("totalTap");

    if (tapText) {

        tapText.textContent =

            Number(App.totalTap).toLocaleString();

    }

    const balanceText = document.getElementById("balance");

    if (balanceText) {

        balanceText.textContent =

            Number(App.balance).toLocaleString();

    }

    const energyText = document.getElementById("energy");

    if (energyText) {

        energyText.textContent =

            `${App.energy}/${App.maxEnergy}`;

    }

};



// ==========================================
// Bind Buttons
// ==========================================

App.bindButtons = () => {

    const referralBtn =

        document.getElementById("referralButton");

    if (referralBtn) {

        referralBtn.addEventListener(

            "click",

            App.shareReferral

        );

    }

    const refreshBtn =

        document.getElementById("refreshButton");

    if (refreshBtn) {

        refreshBtn.addEventListener(

            "click",

            App.refreshHome

        );

    }

};



// ==========================================
// Startup
// ==========================================

window.addEventListener(

    "DOMContentLoaded",

    async () => {

        try {

            await App.init();

            App.startEnergyLoop();

            App.startHomeLoop();

            App.dailyReward();

            App.bindButtons();

            App.updateStats();

            App.updateEffects();

            console.log(

                "🚀 Zoryx App Ready"

            );

        }

        catch (error) {

            console.error(error);

            TelegramApp.alert(

                "Application Failed To Start"

            );

        }

    }

);



// ==========================================
// Export
// ==========================================

window.App = App;

// ==========================================
// XP & Level System
// ==========================================

App.xp = 0;

App.xpPerTap = 1;

App.levelXp = 100;



// ==========================================
// Add XP
// ==========================================

App.addXP = (amount = 1) => {

    App.xp += amount;

    while (App.xp >= App.levelXp) {

        App.xp -= App.levelXp;

        App.level++;

        App.maxEnergy += 100;

        App.energy = App.maxEnergy;

        TelegramApp.haptic("success");

        TelegramApp.popup(

            "🎉 Level Up!",

            `Congratulations!\nYou reached Level ${App.level}`

        );

    }

    App.updateXPBar();

    App.updateUI();

};



// ==========================================
// XP Progress
// ==========================================

App.updateXPBar = () => {

    const bar = document.getElementById("xpFill");

    if (!bar) return;

    const percent =

        (App.xp / App.levelXp) * 100;

    bar.style.width =

        percent + "%";

};



// ==========================================
// Level Reward
// ==========================================

App.levelReward = () => {

    const reward =

        App.level * 500;

    App.balance += reward;

    TelegramApp.toast(

        `+${reward} Coins`

    );

    App.updateUI();

};



// ==========================================
// Tap Bonus
// ==========================================

App.tapBonus = () => {

    if (

        App.level >= 5

    ) {

        return 2;

    }

    if (

        App.level >= 15

    ) {

        return 3;

    }

    if (

        App.level >= 30

    ) {

        return 5;

    }

    return 1;

};



// ==========================================
// Update After Tap
// ==========================================

App.afterTap = () => {

    App.addXP(

        App.xpPerTap

    );

    App.updateStats();

    App.updateEffects();

};



// ==========================================
// Save Local
// ==========================================

App.saveLocal = () => {

    localStorage.setItem(

        "zoryx_cache",

        JSON.stringify({

            level: App.level,

            xp: App.xp

        })

    );

};



// ==========================================
// Load Local
// ==========================================

App.loadLocal = () => {

    const cache =

        localStorage.getItem(

            "zoryx_cache"

        );

    if (!cache) return;

    try {

        const data =

            JSON.parse(cache);

        App.level =

            data.level || 1;

        App.xp =

            data.xp || 0;

    }

    catch (e) {

        console.log(e);

    }

    App.updateXPBar();

};


// ==========================================
// Earn System
// ==========================================

App.tasks = [];



// ==========================================
// Load Tasks
// ==========================================

App.loadTasks = async () => {

    const tasks = [

        {
            id: 1,
            title: "Join Telegram Channel",
            reward: 1000,
            completed: false
        },

        {
            id: 2,
            title: "Join Telegram Group",
            reward: 1500,
            completed: false
        },

        {
            id: 3,
            title: "Invite 1 Friend",
            reward: 2500,
            completed: false
        },

        {
            id: 4,
            title: "Tap 100 Times",
            reward: 500,
            completed: false
        }

    ];

    App.tasks = tasks;

    App.renderTasks();

};



// ==========================================
// Render Tasks
// ==========================================

App.renderTasks = () => {

    const container = document.getElementById("taskList");

    if (!container) return;

    container.innerHTML = "";

    App.tasks.forEach(task => {

        const card = document.createElement("div");

        card.className = "task-card";

        card.innerHTML = `

            <div class="task-left">

                <div class="task-title">

                    ${task.title}

                </div>

                <div class="task-reward">

                    🪙 ${task.reward}

                </div>

            </div>

            <button
                class="task-button"
                data-id="${task.id}"
            >

                ${task.completed ? "Claimed" : "Claim"}

            </button>

        `;

        container.appendChild(card);

    });

    document.querySelectorAll(".task-button")

    .forEach(button => {

        button.addEventListener(

            "click",

            () => {

                const id = Number(

                    button.dataset.id

                );

                App.claimTask(id);

            }

        );

    });

};



// ==========================================
// Claim Task
// ==========================================

App.claimTask = (id) => {

    const task = App.tasks.find(

        t => t.id === id

    );

    if (!task) return;

    if (task.completed) {

        TelegramApp.toast(

            "Already Claimed"

        );

        return;

    }

    task.completed = true;

    App.balance += task.reward;

    App.updateUI();

    App.updateStats();

    TelegramApp.haptic("success");

    TelegramApp.toast(

        `+${task.reward} Coins`

    );

    App.renderTasks();

};



// ==========================================
// Earn Page
// ==========================================

App.openEarn = async () => {

    App.showPage("earn");

    await App.loadTasks();

};



// ==========================================
// Daily Mission Check
// ==========================================

App.checkMission = () => {

    if (

        App.totalTap >= 100

    ) {

        const task = App.tasks.find(

            t => t.id === 4

        );

        if (

            task &&

            !task.completed

        ) {

            TelegramApp.toast(

                "Mission Complete!"

            );

        }

    }

};



// ==========================================
// Refresh Earn
// ==========================================

App.refreshEarn = async () => {

    await App.loadTasks();

};


// ==========================================
// Lucky Spin
// ==========================================

App.spinCooldown = false;

App.spinRewards = [

    100,

    250,

    500,

    1000,

    2500,

    5000,

    10000

];



App.spin = async () => {

    if (App.spinCooldown) {

        TelegramApp.toast(

            "Please Wait..."

        );

        return;

    }

    App.spinCooldown = true;

    TelegramApp.haptic("medium");

    const reward =

        App.spinRewards[

            Math.floor(

                Math.random() *

                App.spinRewards.length

            )

        ];

    App.balance += reward;

    App.updateUI();

    App.updateStats();

    TelegramApp.popup(

        "🎉 Lucky Spin",

        `Congratulations!\nYou won ${reward.toLocaleString()} Coins`

    );

    setTimeout(() => {

        App.spinCooldown = false;

    }, 5000);

};



// ==========================================
// Daily Reward
// ==========================================

App.claimDailyReward = () => {

    const today =

        new Date()

        .toDateString();

    const lastClaim =

        localStorage.getItem(

            "zoryx_daily_reward"

        );

    if (

        lastClaim === today

    ) {

        TelegramApp.toast(

            "Today's reward already claimed"

        );

        return;

    }

    const reward = 500;

    App.balance += reward;

    App.updateUI();

    App.updateStats();

    localStorage.setItem(

        "zoryx_daily_reward",

        today

    );

    TelegramApp.haptic("success");

    TelegramApp.popup(

        "🎁 Daily Reward",

        `You received ${reward} Coins`

    );

};



// ==========================================
// Save Progress
// ==========================================

App.saveProgress = () => {

    localStorage.setItem(

        "zoryx_progress",

        JSON.stringify({

            balance: App.balance,

            level: App.level,

            xp: App.xp,

            totalTap: App.totalTap,

            referrals: App.referrals

        })

    );

};



// ==========================================
// Restore Progress
// ==========================================

App.restoreProgress = () => {

    const save =

        localStorage.getItem(

            "zoryx_progress"

        );

    if (!save) return;

    try {

        const data =

            JSON.parse(save);

        App.balance =

            data.balance || App.balance;

        App.level =

            data.level || App.level;

        App.xp =

            data.xp || App.xp;

        App.totalTap =

            data.totalTap || App.totalTap;

        App.referrals =

            data.referrals || App.referrals;

        App.updateUI();

        App.updateStats();

        App.updateXPBar();

    }

    catch (error) {

        console.error(error);

    }

};



// ==========================================
// Auto Save
// ==========================================

App.startAutoSave = () => {

    setInterval(() => {

        App.saveProgress();

    }, 10000);

};


// ==========================================
// Settings
// ==========================================

App.settings = {

    sound: true,

    vibration: true

};



// ==========================================
// Load Settings
// ==========================================

App.loadSettings = () => {

    const settings = localStorage.getItem(

        "zoryx_settings"

    );

    if (!settings) return;

    try {

        App.settings = {

            ...App.settings,

            ...JSON.parse(settings)

        };

    }

    catch (e) {

        console.log(e);

    }

};



// ==========================================
// Save Settings
// ==========================================

App.saveSettings = () => {

    localStorage.setItem(

        "zoryx_settings",

        JSON.stringify(App.settings)

    );

};



// ==========================================
// Toggle Sound
// ==========================================

App.toggleSound = () => {

    App.settings.sound =

        !App.settings.sound;

    App.saveSettings();

    TelegramApp.toast(

        App.settings.sound

        ? "Sound Enabled"

        : "Sound Disabled"

    );

};



// ==========================================
// Toggle Vibration
// ==========================================

App.toggleVibration = () => {

    App.settings.vibration =

        !App.settings.vibration;

    App.saveSettings();

    TelegramApp.toast(

        App.settings.vibration

        ? "Vibration Enabled"

        : "Vibration Disabled"

    );

};



// ==========================================
// Online Status
// ==========================================

App.updateConnection = () => {

    const status = document.getElementById(

        "connectionStatus"

    );

    if (!status) return;

    if (navigator.onLine) {

        status.textContent = "🟢 Online";

    } else {

        status.textContent = "🔴 Offline";

    }

};



// ==========================================
// Network Events
// ==========================================

window.addEventListener(

    "online",

    App.updateConnection

);

window.addEventListener(

    "offline",

    App.updateConnection

);



// ==========================================
// Upgrade Tap System
// ==========================================

App.processTap = async () => {

    if (App.energy <= 0) {

        TelegramApp.toast(

            "Energy Empty"

        );

        return;

    }

    const bonus =

        App.tapBonus();

    const result =

        await API.tap(

            App.telegramId,

            bonus

        );

    if (!result.success) {

        TelegramApp.toast(

            result.message

        );

        return;

    }

    const oldBalance =

        App.balance;

    App.balance =

        result.balance;

    App.energy =

        result.energy;

    App.totalTap += bonus;

    App.animateBalance(

        oldBalance,

        App.balance

    );

    App.coinEffect();

    App.floatingText(

        `+${bonus}`

    );

    App.addXP(

        App.xpPerTap * bonus

    );

    App.checkMission();

    App.updateEffects();

    App.updateStats();

    App.saveProgress();

};



// ==========================================
// Replace Coin Click
// ==========================================

App.initCoin = () => {

    const coin =

        document.getElementById("coin");

    if (!coin) return;

    coin.onclick =

        App.processTap;

};



// ==========================================
// Initialize Settings
// ==========================================

App.loadSettings();

App.updateConnection();


// ==========================================
// Utility Functions
// ==========================================

App.sleep = (ms) => {

    return new Promise(resolve => {

        setTimeout(resolve, ms);

    });

};



App.formatNumber = (number) => {

    return Number(number || 0).toLocaleString();

};



App.random = (min, max) => {

    return Math.floor(

        Math.random() *

        (max - min + 1)

    ) + min;

};



// ==========================================
// Notification
// ==========================================

App.notify = (

    title,

    message

) => {

    TelegramApp.popup(

        title,

        message

    );

};



// ==========================================
// Error Handler
// ==========================================

App.handleError = (error) => {

    console.error(error);

    TelegramApp.toast(

        error.message ||

        "Something went wrong"

    );

};



// ==========================================
// Loading Screen
// ==========================================

App.showLoader = () => {

    const loader =

        document.getElementById(

            "loading"

        );

    if (loader) {

        loader.style.display =

            "flex";

    }

};



App.hideLoader = () => {

    const loader =

        document.getElementById(

            "loading"

        );

    if (loader) {

        loader.style.display =

            "none";

    }

};



// ==========================================
// Restart App
// ==========================================

App.restart = async () => {

    try {

        App.showLoader();

        await App.refreshUser();

        await App.refreshHome();

        App.updateEffects();

        App.hideLoader();

    }

    catch (error) {

        App.hideLoader();

        App.handleError(error);

    }

};



// ==========================================
// Logout
// ==========================================

App.logout = () => {

    localStorage.removeItem(

        "zoryx_progress"

    );

    localStorage.removeItem(

        "zoryx_cache"

    );

    TelegramApp.confirm(

        "Restart Zoryx?",

        (ok) => {

            if (ok) {

                location.reload();

            }

        }

    );

};



// ==========================================
// Keyboard Shortcut
// ==========================================

document.addEventListener(

    "keydown",

    (event) => {

        if (

            event.key === "F5"

        ) {

            event.preventDefault();

            App.restart();

        }

    }

);



// ==========================================
// Visibility
// ==========================================

document.addEventListener(

    "visibilitychange",

    () => {

        if (

            !document.hidden

        ) {

            App.refreshUser();

        }

    }

);



// ==========================================
// Final Startup
// ==========================================

App.bootstrap = async () => {

    try {

        App.showLoader();

        App.loadSettings();

        App.loadLocal();

        App.restoreProgress();

        const online = await API.isOnline();

        if (!online) {

            TelegramApp.toast(

                "Server Offline"

            );

        }

        await App.init();

        await App.refreshHome();

        App.startAutoRefresh();

        App.startEnergyLoop();

        App.startHomeLoop();

        App.startAutoSave();

        App.updateEffects();

        App.updateStats();

        App.hideLoader();

        console.log("");

        console.log("================================");

        console.log("🚀 Zoryx Mini App Ready");

        console.log("User :", App.user?.firstName);

        console.log("Level :", App.level);

        console.log("Balance :", App.balance);

        console.log("Energy :", App.energy);

        console.log("================================");

        console.log("");

    }

    catch (error) {

        App.hideLoader();

        App.handleError(error);

    }

};



// ==========================================
// Auto Save Before Exit
// ==========================================

window.addEventListener(

    "beforeunload",

    () => {

        App.saveProgress();

        App.saveLocal();

        App.saveSettings();

    }

);



// ==========================================
// Telegram Theme Change
// ==========================================

if (

    window.Telegram &&

    Telegram.WebApp

) {

    Telegram.WebApp.onEvent(

        "themeChanged",

        () => {

            document.body.setAttribute(

                "data-theme",

                Telegram.WebApp.colorScheme

            );

        }

    );

}



// ==========================================
// Application Start
// ==========================================

window.addEventListener(

    "load",

    async () => {

        await App.bootstrap();

    }

);



// ==========================================
// Global Export
// ==========================================

window.App = App;
