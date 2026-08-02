// ==========================================
// Zoryx Telegram Mini App
// client/app.js
// Production Version 2.0
// ==========================================

"use strict";



// ==========================================
// DOM Helper
// ==========================================

const $ = (id) => document.getElementById(id);

const $$ = (selector) =>
    document.querySelectorAll(selector);



// ==========================================
// Main Application
// ==========================================

const App = {

    initialized: false,

    loading: false,

    currentPage: "home",

    autoRefresh: null,

    energyLoop: null,

    autoSave: null,



    // ======================================
    // User
    // ======================================

    user: null,

    telegramId: 0,



    // ======================================
    // Game Data
    // ======================================

    balance: 0,

    energy: 1000,

    maxEnergy: 1000,

    totalTap: 0,

    level: 1,

    xp: 0,

    xpRequired: 100,

    referrals: 0,



    // ======================================
    // Settings
    // ======================================

    settings: {

        sound: true,

        vibration: true

    },



    // ======================================
    // Runtime Cache
    // ======================================

    tasks: [],

    leaderboard: [],

    profile: null

};



// ==========================================
// Storage Keys
// ==========================================

const STORAGE = {

    progress: "zoryx_progress",

    settings: "zoryx_settings",

    daily: "zoryx_daily_reward"

};



// ==========================================
// Loading
// ==========================================

App.showLoading = () => {

    const loader = $("loading");

    if (loader) {

        loader.style.display = "flex";

    }

};



App.hideLoading = () => {

    const loader = $("loading");

    if (loader) {

        loader.style.display = "none";

    }

};



// ==========================================
// Utilities
// ==========================================

App.formatNumber = (number) => {

    return Number(number || 0).toLocaleString();

};



App.sleep = (ms) =>

    new Promise(resolve =>

        setTimeout(resolve, ms)

    );



App.random = (min, max) =>

    Math.floor(

        Math.random() *

        (max - min + 1)

    ) + min;



// ==========================================
// Connection Status
// ==========================================

App.updateConnection = () => {

    const status = $("connectionStatus");

    if (!status) return;

    status.textContent =

        navigator.onLine

        ? "🟢 Online"

        : "🔴 Offline";

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
// Error Handler
// ==========================================

App.handleError = (error) => {

    console.error(error);

    if (

        window.TelegramApp &&

        TelegramApp.toast

    ) {

        TelegramApp.toast(

            error.message ||

            "Unexpected Error"

        );

    }

};



// ==========================================
// Save Settings
// ==========================================

App.saveSettings = () => {

    localStorage.setItem(

        STORAGE.settings,

        JSON.stringify(

            App.settings

        )

    );

};



// ==========================================
// Load Settings
// ==========================================

App.loadSettings = () => {

    try {

        const data =

            localStorage.getItem(

                STORAGE.settings

            );

        if (!data) return;

        App.settings = {

            ...App.settings,

            ...JSON.parse(data)

        };

    }

    catch (error) {

        console.error(error);

    }

};



// ==========================================
// Startup
// ==========================================

App.start = async () => {

    if (App.initialized) return;

    App.initialized = true;

    App.loadSettings();

    App.updateConnection();

    console.log(

        "🚀 Starting Zoryx..."

    );

};

// ==========================================
// Telegram Login
// ==========================================

App.login = async () => {

    try {

        App.showLoading();

        const result = await API.login();

        if (!result.success) {

            throw new Error(

                result.message ||

                "Login Failed"

            );

        }

        App.user = result.user;

        App.telegramId =

            Number(result.user.telegramId);

        return true;

    }

    catch (error) {

        App.handleError(error);

        return false;

    }

    finally {

        App.hideLoading();

    }

};



// ==========================================
// Load Profile
// ==========================================

App.loadProfile = async () => {

    try {

        const result =

            await API.getProfile(

                App.telegramId

            );

        if (!result.success) {

            throw new Error(

                result.message ||

                "Profile Load Failed"

            );

        }

        const user = result.user;

        App.balance =

            Number(user.balance || 0);

        App.energy =

            Number(user.energy || 0);

        App.maxEnergy =

            Number(user.maxEnergy || 1000);

        App.totalTap =

            Number(user.totalTap || 0);

        App.level =

            Number(user.level || 1);

        App.xp =

            Number(user.xp || 0);

        App.referrals =

            Number(user.referrals || 0);

    }

    catch (error) {

        App.handleError(error);

    }

};



// ==========================================
// Refresh User
// ==========================================

App.refreshUser = async () => {

    try {

        const result =

            await API.getProfile(

                App.telegramId

            );

        if (!result.success) {

            return;

        }

        const user = result.user;

        App.balance =

            Number(user.balance || 0);

        App.energy =

            Number(user.energy || 0);

        App.maxEnergy =

            Number(user.maxEnergy || 1000);

        App.totalTap =

            Number(user.totalTap || 0);

        App.level =

            Number(user.level || 1);

        App.xp =

            Number(user.xp || 0);

        App.referrals =

            Number(user.referrals || 0);

        App.updateUI();

    }

    catch (error) {

        App.handleError(error);

    }

};



// ==========================================
// Update UI
// ==========================================

App.updateUI = () => {

    if ($("userName")) {

        $("userName").textContent =

            TelegramApp.getFullName();

    }

    if ($("userUsername")) {

        $("userUsername").textContent =

            TelegramApp.getUsername();

    }

    if ($("userPhoto")) {

        $("userPhoto").src =

            TelegramApp.getPhoto();

    }

    if ($("balance")) {

        $("balance").textContent =

            App.formatNumber(

                App.balance

            );

    }

    if ($("energy")) {

        $("energy").textContent =

            `${App.energy}/${App.maxEnergy}`;

    }

    if ($("level")) {

        $("level").textContent =

            App.level;

    }

    if ($("totalTap")) {

        $("totalTap").textContent =

            App.formatNumber(

                App.totalTap

            );

    }

    if ($("referralCount")) {

        $("referralCount").textContent =

            App.referrals;

    }

};



// ==========================================
// Auto Refresh
// ==========================================

App.startAutoRefresh = () => {

    if (

        App.autoRefresh

    ) {

        clearInterval(

            App.autoRefresh

        );

    }

    App.autoRefresh =

        setInterval(

            async () => {

                if (

                    !App.telegramId

                ) return;

                await App.refreshUser();

            },

            5000

        );

};



// ==========================================
// Initialize User
// ==========================================

App.initializeUser = async () => {

    const ok =

        await App.login();

    if (!ok) {

        return false;

    }

    await App.loadProfile();

    App.updateUI();

    App.startAutoRefresh();

    return true;

};


// ==========================================
// Navigation
// ==========================================

App.showPage = (page) => {

    $$(".page").forEach(pageElement => {

        pageElement.classList.remove(

            "active"

        );

    });

    $$(".nav-item").forEach(item => {

        item.classList.remove(

            "active"

        );

    });

    const targetPage =

        document.getElementById(page);

    if (targetPage) {

        targetPage.classList.add(

            "active"

        );

    }

    const nav =

        document.querySelector(

            `[data-page="${page}"]`

        );

    if (nav) {

        nav.classList.add(

            "active"

        );

    }

    App.currentPage = page;

};



// ==========================================
// Navigation Events
// ==========================================

App.initNavigation = () => {

    $$(".nav-item").forEach(item => {

        item.addEventListener(

            "click",

            () => {

                const page =

                    item.dataset.page;

                if (!page) return;

                TelegramApp.haptic(

                    "light"

                );

                App.showPage(page);

            }

        );

    });

};



// ==========================================
// Coin Animation
// ==========================================

App.coinEffect = () => {

    const coin = $("coin");

    if (!coin) return;

    coin.classList.remove("tap");

    void coin.offsetWidth;

    coin.classList.add("tap");

};



// ==========================================
// Floating Text
// ==========================================

App.floatingText = (

    text = "+1"

) => {

    const coin = $("coin");

    if (!coin) return;

    const floating =

        document.createElement(

            "div"

        );

    floating.className =

        "floating-coin";

    floating.textContent =

        text;

    const rect =

        coin.getBoundingClientRect();

    floating.style.left =

        rect.left +

        rect.width / 2 +

        "px";

    floating.style.top =

        rect.top +

        "px";

    document.body.appendChild(

        floating

    );

    setTimeout(() => {

        floating.remove();

    }, 1000);

};



// ==========================================
// Coin Tap
// ==========================================

App.tapCoin = async () => {

    if (

        App.loading ||

        App.energy <= 0

    ) {

        TelegramApp.toast(

            "No Energy"

        );

        return;

    }

    App.loading = true;

    TelegramApp.haptic(

        "light"

    );

    try {

        const result =

            await API.tap(

                App.telegramId,

                1

            );

        if (

            !result.success

        ) {

            throw new Error(

                result.message

            );

        }

        App.balance =

            Number(

                result.balance

            );

        App.energy =

            Number(

                result.energy

            );

        App.totalTap++;

        App.coinEffect();

        App.floatingText(

            "+1"

        );

        App.updateUI();

    }

    catch (error) {

        App.handleError(error);

    }

    finally {

        App.loading = false;

    }

};



// ==========================================
// Coin Events
// ==========================================

App.initCoin = () => {

    const coin = $("coin");

    if (!coin) return;

    coin.addEventListener(

        "click",

        App.tapCoin

    );

};


// ==========================================
// XP Progress Bar
// ==========================================

App.updateXPBar = () => {

    const bar = $("xpFill");

    if (!bar) return;

    const percent = Math.min(

        (App.xp / App.xpRequired) * 100,

        100

    );

    bar.style.width = percent + "%";

};



// ==========================================
// Add XP
// ==========================================

App.addXP = (amount = 1) => {

    App.xp += amount;

    while (App.xp >= App.xpRequired) {

        App.xp -= App.xpRequired;

        App.level++;

        App.maxEnergy += 100;

        App.energy = App.maxEnergy;

        TelegramApp.haptic("success");

        TelegramApp.toast(

            `Level ${App.level} Reached`

        );

    }

    App.updateXPBar();

};



// ==========================================
// Energy Bar
// ==========================================

App.updateEnergyBar = () => {

    const bar = $("energyFill");

    if (!bar) return;

    const percent = Math.min(

        (App.energy / App.maxEnergy) * 100,

        100

    );

    bar.style.width = percent + "%";

};



// ==========================================
// Level Progress
// ==========================================

App.updateLevelProgress = () => {

    const progress = $("levelProgress");

    if (!progress) return;

    const percent = Math.min(

        (App.totalTap /

        (App.level * 1000)) * 100,

        100

    );

    progress.style.width =

        percent + "%";

};



// ==========================================
// Update Visual Effects
// ==========================================

App.updateEffects = () => {

    App.updateXPBar();

    App.updateEnergyBar();

    App.updateLevelProgress();

};



// ==========================================
// Balance Animation
// ==========================================

App.animateBalance = (

    oldValue,

    newValue,

    duration = 300

) => {

    const element = $("balance");

    if (!element) return;

    const start = performance.now();

    const animate = (time) => {

        const progress = Math.min(

            (time - start) / duration,

            1

        );

        const value = Math.floor(

            oldValue +

            (newValue - oldValue) *

            progress

        );

        element.textContent =

            App.formatNumber(value);

        if (progress < 1) {

            requestAnimationFrame(

                animate

            );

        }

    };

    requestAnimationFrame(

        animate

    );

};



// ==========================================
// Daily Reward Check
// ==========================================

App.checkDailyReward = () => {

    const today =

        new Date().toDateString();

    const claimed =

        localStorage.getItem(

            STORAGE.daily

        );

    if (claimed === today) {

        return;

    }

    TelegramApp.mainButton.show(

        "🎁 Claim Daily Reward",

        App.claimDailyReward

    );

};



// ==========================================
// Claim Daily Reward
// ==========================================

App.claimDailyReward = async () => {

    const result =

        await API.claimDailyReward(

            App.telegramId

        );

    if (!result.success) {

        TelegramApp.toast(

            result.message

        );

        return;

    }

    localStorage.setItem(

        STORAGE.daily,

        new Date().toDateString()

    );

    TelegramApp.mainButton.hide();

    App.balance = result.balance;

    App.updateUI();

    TelegramApp.popup(

        "🎉 Daily Reward",

        "Reward Claimed Successfully"

    );

};


// ==========================================
// Load Leaderboard
// ==========================================

App.loadLeaderboard = async () => {

    try {

        const result =

            await API.getLeaderboard();

        if (!result.success) {

            return;

        }

        App.leaderboard =

            result.leaderboard || [];

        const list = $("leaderboardList");

        if (!list) return;

        list.innerHTML = "";

        App.leaderboard.forEach(

            (user, index) => {

                const item =

                    document.createElement("div");

                item.className =

                    "leaderboard-item";

                item.innerHTML = `

                    <div class="leader-rank">

                        #${index + 1}

                    </div>

                    <div class="leader-user">

                        <img
                            src="${user.photo || TelegramApp.getPhoto()}"
                            class="leader-avatar"
                        >

                        <div>

                            <div class="leader-name">

                                ${user.firstName || "Unknown"}

                            </div>

                            <div class="leader-level">

                                Lv.${user.level || 1}

                            </div>

                        </div>

                    </div>

                    <div class="leader-balance">

                        ${App.formatNumber(user.balance)}

                    </div>

                `;

                list.appendChild(item);

            }

        );

    }

    catch (error) {

        App.handleError(error);

    }

};



// ==========================================
// Load Referral
// ==========================================

App.loadReferral = async () => {

    try {

        const result =

            await API.getReferral(

                App.telegramId

            );

        if (!result.success) {

            return;

        }

        App.referrals =

            Number(

                result.referrals || 0

            );

        const text =

            $("referralCount");

        if (text) {

            text.textContent =

                App.referrals;

        }

    }

    catch (error) {

        App.handleError(error);

    }

};



// ==========================================
// Share Referral
// ==========================================

App.shareReferral = async () => {

    const link =

        `https://t.me/${TelegramApp.getUsername()}?startapp=${App.telegramId}`;

    await TelegramApp.share(

        "Zoryx",

        "Join Zoryx and earn coins!",

        link

    );

};



// ==========================================
// Refresh Home
// ==========================================

App.refreshHome = async () => {

    await App.refreshUser();

    await App.loadLeaderboard();

    await App.loadReferral();

    App.updateEffects();

};



// ==========================================
// Home Auto Refresh
// ==========================================

App.startHomeLoop = () => {

    setInterval(

        App.refreshHome,

        10000

    );

};



// ==========================================
// Refresh Button
// ==========================================

App.bindHomeButtons = () => {

    const refresh =

        $("refreshButton");

    if (refresh) {

        refresh.onclick =

            App.refreshHome;

    }

    const referral =

        $("referralButton");

    if (referral) {

        referral.onclick =

            App.shareReferral;

    }

};


// ==========================================
// Load Tasks
// ==========================================

App.loadTasks = async () => {

    try {

        const result = await API.getTasks(

            App.telegramId

        );

        if (!result.success) {

            return;

        }

        App.tasks =

            result.tasks || [];

        App.renderTasks();

    }

    catch (error) {

        App.handleError(error);

    }

};



// ==========================================
// Render Tasks
// ==========================================

App.renderTasks = () => {

    const container = $("taskList");

    if (!container) return;

    container.innerHTML = "";

    App.tasks.forEach(task => {

        const card =

            document.createElement("div");

        card.className = "task-card";

        card.innerHTML = `

            <div class="task-info">

                <div class="task-title">

                    ${task.title}

                </div>

                <div class="task-reward">

                    🪙 ${App.formatNumber(task.reward)}

                </div>

            </div>

            <button

                class="task-button"

                data-id="${task.id}"

                ${task.completed ? "disabled" : ""}

            >

                ${task.completed ? "Claimed" : "Claim"}

            </button>

        `;

        container.appendChild(card);

    });

    container

        .querySelectorAll(

            ".task-button"

        )

        .forEach(button => {

            button.onclick = () => {

                App.claimTask(

                    Number(

                        button.dataset.id

                    )

                );

            };

        });

};



// ==========================================
// Claim Task
// ==========================================

App.claimTask = async (

    taskId

) => {

    try {

        const result =

            await API.claimTask(

                App.telegramId,

                taskId

            );

        if (!result.success) {

            TelegramApp.toast(

                result.message

            );

            return;

        }

        App.balance =

            Number(

                result.balance

            );

        await App.loadTasks();

        App.updateUI();

        TelegramApp.haptic(

            "success"

        );

        TelegramApp.toast(

            "Task Reward Claimed"

        );

    }

    catch (error) {

        App.handleError(error);

    }

};



// ==========================================
// Open Earn Page
// ==========================================

App.openEarnPage = async () => {

    App.showPage(

        "earn"

    );

    await App.loadTasks();

};



// ==========================================
// Refresh Earn
// ==========================================

App.refreshEarn = async () => {

    await App.loadTasks();

};



// ==========================================
// Earn Buttons
// ==========================================

App.bindEarnButtons = () => {

    const refresh =

        $("earnRefreshButton");

    if (refresh) {

        refresh.onclick =

            App.refreshEarn;

    }

};


// ==========================================
// Load Lucky Spin
// ==========================================

App.loadSpin = async () => {

    try {

        const result =

            await API.getSpinStatus(

                App.telegramId

            );

        if (!result.success) {

            return;

        }

        const button = $("spinButton");

        if (!button) return;

        button.disabled =

            !result.available;

        button.textContent =

            result.available

            ? "🎰 Spin"

            : "⏳ Cooldown";

    }

    catch (error) {

        App.handleError(error);

    }

};



// ==========================================
// Lucky Spin
// ==========================================

App.spin = async () => {

    try {

        TelegramApp.haptic("medium");

        const result =

            await API.spin(

                App.telegramId

            );

        if (!result.success) {

            TelegramApp.toast(

                result.message

            );

            return;

        }

        App.balance =

            Number(

                result.balance

            );

        App.updateUI();

        await App.loadSpin();

        TelegramApp.popup(

            "🎉 Congratulations",

            `You won ${App.formatNumber(result.reward)} Coins`

        );

    }

    catch (error) {

        App.handleError(error);

    }

};



// ==========================================
// Spin Button
// ==========================================

App.bindSpinButton = () => {

    const button = $("spinButton");

    if (!button) return;

    button.onclick = App.spin;

};



// ==========================================
// Load Statistics
// ==========================================

App.loadStatistics = async () => {

    try {

        const result =

            await API.getStats();

        if (!result.success) {

            return;

        }

        if ($("totalUsers")) {

            $("totalUsers").textContent =

                App.formatNumber(

                    result.totalUsers

                );

        }

        if ($("totalCoins")) {

            $("totalCoins").textContent =

                App.formatNumber(

                    result.totalCoins

                );

        }

        if ($("onlineUsers")) {

            $("onlineUsers").textContent =

                App.formatNumber(

                    result.onlineUsers

                );

        }

    }

    catch (error) {

        App.handleError(error);

    }

};



// ==========================================
// Statistics Auto Refresh
// ==========================================

App.startStatisticsLoop = () => {

    setInterval(

        App.loadStatistics,

        30000

    );

};


// ==========================================
// Join Referral
// ==========================================

App.joinReferral = async (

    referralCode

) => {

    try {

        const result =

            await API.joinReferral(

                App.telegramId,

                referralCode

            );

        if (!result.success) {

            TelegramApp.toast(

                result.message

            );

            return false;

        }

        TelegramApp.haptic(

            "success"

        );

        TelegramApp.toast(

            "Referral Joined"

        );

        await App.loadReferral();

        return true;

    }

    catch (error) {

        App.handleError(error);

        return false;

    }

};



// ==========================================
// Claim Referral Reward
// ==========================================

App.claimReferralReward = async () => {

    try {

        const result =

            await API.claimReferralReward(

                App.telegramId

            );

        if (!result.success) {

            TelegramApp.toast(

                result.message

            );

            return;

        }

        App.balance =

            Number(

                result.balance

            );

        App.updateUI();

        await App.loadReferral();

        TelegramApp.haptic(

            "success"

        );

        TelegramApp.popup(

            "🎉 Referral Reward",

            "Reward Claimed Successfully"

        );

    }

    catch (error) {

        App.handleError(error);

    }

};



// ==========================================
// Copy Invite Link
// ==========================================

App.copyInviteLink = async () => {

    const link =

        `https://t.me/${TelegramApp.getUsername()}?startapp=${App.telegramId}`;

    const ok =

        await TelegramApp.copy(

            link

        );

    if (ok) {

        TelegramApp.toast(

            "Invite Link Copied"

        );

    }

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
// Bind Settings
// ==========================================

App.bindSettings = () => {

    const sound =

        $("soundToggle");

    if (sound) {

        sound.onclick =

            App.toggleSound;

    }

    const vibration =

        $("vibrationToggle");

    if (vibration) {

        vibration.onclick =

            App.toggleVibration;

    }

    const invite =

        $("inviteButton");

    if (invite) {

        invite.onclick =

            App.copyInviteLink;

    }

    const referralClaim =

        $("claimReferralButton");

    if (referralClaim) {

        referralClaim.onclick =

            App.claimReferralReward;

    }

};


// ==========================================
// Save Progress
// ==========================================

App.saveProgress = () => {

    try {

        localStorage.setItem(

            STORAGE.progress,

            JSON.stringify({

                balance: App.balance,

                energy: App.energy,

                maxEnergy: App.maxEnergy,

                totalTap: App.totalTap,

                level: App.level,

                xp: App.xp,

                referrals: App.referrals

            })

        );

    }

    catch (error) {

        console.error(error);

    }

};



// ==========================================
// Load Progress
// ==========================================

App.loadProgress = () => {

    try {

        const data =

            localStorage.getItem(

                STORAGE.progress

            );

        if (!data) return;

        const save =

            JSON.parse(data);

        App.balance =

            Number(

                save.balance ||

                App.balance

            );

        App.energy =

            Number(

                save.energy ||

                App.energy

            );

        App.maxEnergy =

            Number(

                save.maxEnergy ||

                App.maxEnergy

            );

        App.totalTap =

            Number(

                save.totalTap ||

                App.totalTap

            );

        App.level =

            Number(

                save.level ||

                App.level

            );

        App.xp =

            Number(

                save.xp ||

                App.xp

            );

        App.referrals =

            Number(

                save.referrals ||

                App.referrals

            );

    }

    catch (error) {

        console.error(error);

    }

};



// ==========================================
// Auto Save
// ==========================================

App.startAutoSave = () => {

    if (

        App.autoSave

    ) {

        clearInterval(

            App.autoSave

        );

    }

    App.autoSave =

        setInterval(

            () => {

                App.saveProgress();

            },

            10000

        );

};



// ==========================================
// Before Exit
// ==========================================

App.beforeExit = () => {

    App.saveProgress();

    App.saveSettings();

};



// ==========================================
// Restart
// ==========================================

App.restart = async () => {

    App.showLoading();

    try {

        await App.refreshUser();

        await App.refreshHome();

        App.updateEffects();

    }

    finally {

        App.hideLoading();

    }

};



// ==========================================
// Logout
// ==========================================

App.logout = () => {

    localStorage.removeItem(

        STORAGE.progress

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
// Save Before Close
// ==========================================

window.addEventListener(

    "beforeunload",

    App.beforeExit

);


// ==========================================
// Bootstrap Application
// ==========================================

App.bootstrap = async () => {

    try {

        App.showLoading();

        await App.start();

        App.loadProgress();

        const success =

            await App.initializeUser();

        if (!success) {

            App.hideLoading();

            return;

        }

        await App.loadLeaderboard();

        await App.loadReferral();

        await App.loadTasks();

        await App.loadSpin();

        await App.loadStatistics();

        App.updateUI();

        App.updateEffects();

        App.checkDailyReward();

        App.initNavigation();

        App.initCoin();

        App.bindHomeButtons();

        App.bindEarnButtons();

        App.bindSettings();

        App.bindSpinButton();

        App.startAutoSave();

        App.startHomeLoop();

        App.startStatisticsLoop();

        App.hideLoading();

        console.log("");

        console.log(

            "===================================="

        );

        console.log(

            "🚀 Zoryx Mini App Ready"

        );

        console.log(

            "User :",

            TelegramApp.getFullName()

        );

        console.log(

            "Telegram ID :",

            App.telegramId

        );

        console.log(

            "Balance :",

            App.balance

        );

        console.log(

            "Level :",

            App.level

        );

        console.log(

            "===================================="

        );

        console.log("");

    }

    catch (error) {

        App.hideLoading();

        App.handleError(error);

    }

};



// ==========================================
// Visibility Change
// ==========================================

document.addEventListener(

    "visibilitychange",

    () => {

        if (

            !document.hidden &&

            App.telegramId

        ) {

            App.refreshUser();

        }

    }

);



// ==========================================
// Telegram Theme Changed
// ==========================================

if (

    window.Telegram &&

    Telegram.WebApp

) {

    Telegram.WebApp.onEvent(

        "themeChanged",

        () => {

            TelegramApp.applyTheme();

        }

    );

}



// ==========================================
// Start Application
// ==========================================

window.addEventListener(

    "load",

    async () => {

        await App.bootstrap();

    }

);



// ==========================================
// Export
// ==========================================

window.App = App;


// ==========================================
// Energy Regeneration
// ==========================================

App.startEnergyRegeneration = () => {

    if (App.energyLoop) {

        clearInterval(

            App.energyLoop

        );

    }

    App.energyLoop = setInterval(() => {

        if (

            App.energy <

            App.maxEnergy

        ) {

            App.energy++;

            App.updateUI();

            App.updateEnergyBar();

        }

    }, 1000);

};



// ==========================================
// Sync Local Cache
// ==========================================

App.syncCache = () => {

    App.profile = {

        telegramId: App.telegramId,

        balance: App.balance,

        energy: App.energy,

        maxEnergy: App.maxEnergy,

        totalTap: App.totalTap,

        level: App.level,

        xp: App.xp,

        referrals: App.referrals

    );

};



// ==========================================
// Refresh Dashboard
// ==========================================

App.refreshDashboard = () => {

    App.updateUI();

    App.updateEffects();

    App.syncCache();

};



// ==========================================
// Reset Runtime
// ==========================================

App.resetRuntime = () => {

    App.loading = false;

    App.tasks = [];

    App.leaderboard = [];

    App.profile = null;

};



// ==========================================
// Destroy Timers
// ==========================================

App.destroy = () => {

    if (App.autoRefresh) {

        clearInterval(

            App.autoRefresh

        );

    }

    if (App.homeLoop) {

        clearInterval(

            App.homeLoop

        );

    }

    if (App.energyLoop) {

        clearInterval(

            App.energyLoop

        );

    }

    if (App.autoSave) {

        clearInterval(

            App.autoSave

        );

    }

};



// ==========================================
// App Version
// ==========================================

App.version = "2.0.0";



// ==========================================
// Debug Information
// ==========================================

App.debug = () => {

    console.table({

        TelegramID: App.telegramId,

        Balance: App.balance,

        Energy: App.energy,

        MaxEnergy: App.maxEnergy,

        TotalTap: App.totalTap,

        Level: App.level,

        XP: App.xp,

        Referrals: App.referrals,

        Page: App.currentPage,

        Version: App.version

    });

};



// ==========================================
// Final Initialize
// ==========================================

App.finalize = () => {

    App.startEnergyRegeneration();

    App.refreshDashboard();

    console.log(

        "✅ Zoryx Final Initialization Complete"

    );

};



// ==========================================
// Auto Finalize
// ==========================================

window.addEventListener(

    "load",

    () => {

        setTimeout(

            () => {

                if (

                    App.initialized

                ) {

                    App.finalize();

                }

            },

            1000

        );

    }

);

// ==========================================
// Performance Monitor
// ==========================================

App.performance = {

    startedAt: Date.now(),

    uptime() {

        return Math.floor(

            (Date.now() - this.startedAt) / 1000

        );

    }

};



// ==========================================
// Memory Cleanup
// ==========================================

App.cleanup = () => {

    try {

        if (Array.isArray(App.tasks)) {

            App.tasks = [...App.tasks];

        }

        if (Array.isArray(App.leaderboard)) {

            App.leaderboard = [...App.leaderboard];

        }

    }

    catch (error) {

        console.error(error);

    }

};



// ==========================================
// Heartbeat
// ==========================================

App.startHeartbeat = () => {

    setInterval(() => {

        App.cleanup();

    }, 60000);

};



// ==========================================
// Application Information
// ==========================================

App.info = () => {

    return {

        name: "Zoryx",

        version: App.version,

        telegramId: App.telegramId,

        balance: App.balance,

        level: App.level,

        energy: App.energy,

        page: App.currentPage,

        uptime:

            App.performance.uptime()

    };

};



// ==========================================
// Reload Profile
// ==========================================

App.reloadProfile = async () => {

    await App.refreshUser();

    App.refreshDashboard();

};



// ==========================================
// Reset Application Cache
// ==========================================

App.resetCache = () => {

    App.tasks = [];

    App.leaderboard = [];

    App.profile = null;

};



// ==========================================
// Refresh Everything
// ==========================================

App.refreshAll = async () => {

    await App.refreshUser();

    await App.loadLeaderboard();

    await App.loadReferral();

    await App.loadTasks();

    await App.loadSpin();

    await App.loadStatistics();

    App.refreshDashboard();

};



// ==========================================
// Start Background Services
// ==========================================

App.startServices = () => {

    App.startHeartbeat();

};



// ==========================================
// Background Start
// ==========================================

setTimeout(() => {

    if (App.initialized) {

        App.startServices();

    }

}, 2000);



// ==========================================
// Console Banner
// ==========================================

console.log(

    "%cZORYX MINI APP v2.0",

    "color:#FFC107;font-size:16px;font-weight:bold;"

);

console.log(

    "%cProduction Build Loaded",

    "color:#00C853;font-size:12px;"

);
