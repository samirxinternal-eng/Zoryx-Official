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
