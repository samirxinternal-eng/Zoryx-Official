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

