// ==========================================
// Zoryx Telegram WebApp
// client/telegram.js
// ==========================================

const tg = window.Telegram.WebApp;

// Initialize Telegram WebApp
tg.ready();
tg.expand();

// Theme
document.body.style.background = tg.themeParams.bg_color || "#0b0b0f";

// Enable Closing Confirmation
tg.enableClosingConfirmation();

// User Information
const telegramUser = tg.initDataUnsafe?.user || null;

// Export User
window.TelegramApp = {
    tg,
    user: telegramUser,
    initData: tg.initData,

    isTelegram() {
        return !!telegramUser;
    },

    getUser() {
        return telegramUser;
    },

    getUserId() {
        return telegramUser?.id || null;
    },

    getUsername() {
        return telegramUser?.username || "";
    },

    getFirstName() {
        return telegramUser?.first_name || "";
    },

    getLastName() {
        return telegramUser?.last_name || "";
    },

    getPhoto() {
        return telegramUser?.photo_url || "";
    },

    getLanguage() {
        return telegramUser?.language_code || "en";
    },

    haptic(type = "light") {
        try {
            tg.HapticFeedback.impactOccurred(type);
        } catch (e) {}
    },

    popup(title, message) {
        tg.showPopup({
            title,
            message,
            buttons: [
                {
                    type: "ok"
                }
            ]
        });
    },

    alert(message) {
        tg.showAlert(message);
    },

    close() {
        tg.close();
    }
};

// Debug (Browser Mode)
if (!telegramUser) {
    console.warn("Running outside Telegram.");

    window.TelegramApp.user = {
        id: 123456789,
        username: "developer",
        first_name: "Developer",
        last_name: "",
        language_code: "en",
        photo_url: ""
    };
}

console.log("Telegram User:", window.TelegramApp.user);
