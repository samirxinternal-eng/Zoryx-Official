// ==========================================
// Zoryx Telegram WebApp
// client/app.js
// ==========================================

let currentUser = null;

// ==========================================
// Initialize App
// ==========================================

document.addEventListener("DOMContentLoaded", async () => {
    console.log("Starting Zoryx...");

    if (!window.TelegramApp) {
        alert("Telegram WebApp not found.");
        return;
    }

    await login();

    registerEvents();
});

// ==========================================
// Login
// ==========================================

async function login() {

    try {

        const res = await API.login();

        if (!res.success) {
            TelegramApp.popup(
                "Login Failed",
                res.message || "Unable to authenticate."
            );
            return;
        }

        currentUser = res.user;

        console.log("Logged In:", currentUser);

        updateUserUI();

        await loadUserData();

    } catch (err) {

        console.error(err);

        TelegramApp.alert("Unexpected error.");

    }

}

// ==========================================
// Load User Data
// ==========================================

async function loadUserData() {

    if (!currentUser) return;

    try {

        const profile = await API.getProfile(currentUser.telegramId);

        if (profile.success && profile.user) {
            currentUser = profile.user;
            updateUserUI();
        }

    } catch (e) {
        console.error(e);
    }

}

// ==========================================
// Update UI
// ==========================================

function updateUserUI() {

    if (!currentUser) return;

    setText("username",
        currentUser.firstName ||
        TelegramApp.getFirstName()
    );

    setText("balance",
        currentUser.balance ?? 0
    );

    setText("level",
        currentUser.level ?? 1
    );

    setText("referrals",
        currentUser.referrals ?? 0
    );

    const avatar = document.getElementById("avatar");

    if (avatar) {

        avatar.src =
            currentUser.photo ||
            TelegramApp.getPhoto() ||
            "https://placehold.co/120x120";

    }

}

// ==========================================
// Register Button Events
// ==========================================

function registerEvents() {

    const rewardBtn = document.getElementById("dailyReward");

    if (rewardBtn) {

        rewardBtn.addEventListener("click", claimDailyReward);

    }

}

// ==========================================
// Daily Reward
// ==========================================

async function claimDailyReward() {

    if (!currentUser) return;

    TelegramApp.haptic("medium");

    const res = await API.claimDaily(currentUser.telegramId);

    if (res.success) {

        TelegramApp.popup(
            "Success",
            res.message || "Reward Claimed!"
        );

        await loadUserData();

    } else {

        TelegramApp.popup(
            "Failed",
            res.message || "Please try again later."
        );

    }

}

// ==========================================
// Helpers
// ==========================================

function setText(id, value) {

    const el = document.getElementById(id);

    if (el) {
        el.textContent = value;
    }

}

// ==========================================
// Global
// ==========================================

window.Zoryx = {

    reload: loadUserData,

    user() {
        return currentUser;
    }

};
