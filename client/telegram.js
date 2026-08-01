// ==========================================
// Zoryx Telegram WebApp
// client/telegram.js
// ==========================================

const tg = window.Telegram?.WebApp;

if (!tg) {

    alert("Telegram WebApp SDK Not Found");

    throw new Error("Telegram WebApp SDK Not Found");

}

tg.ready();

tg.expand();

if (typeof tg.enableClosingConfirmation === "function") {

    tg.enableClosingConfirmation();

}

const TelegramApp = {};



// ==========================================
// App Info
// ==========================================

TelegramApp.webApp = tg;

TelegramApp.version = tg.version || "Unknown";

TelegramApp.platform = tg.platform || "Unknown";

TelegramApp.colorScheme = tg.colorScheme || "dark";

TelegramApp.themeParams = tg.themeParams || {};

TelegramApp.initData = tg.initData || "";

TelegramApp.initDataUnsafe = tg.initDataUnsafe || {};



// ==========================================
// Telegram User
// ==========================================

TelegramApp.user = tg.initDataUnsafe?.user || {

    id: 0,

    is_bot: false,

    first_name: "Guest",

    last_name: "",

    username: "",

    language_code: "en",

    photo_url: ""

};



// ==========================================
// User Helper
// ==========================================

TelegramApp.getUser = () => TelegramApp.user;

TelegramApp.getUserId = () => TelegramApp.user.id || 0;

TelegramApp.getFirstName = () => TelegramApp.user.first_name || "Guest";

TelegramApp.getLastName = () => TelegramApp.user.last_name || "";

TelegramApp.getFullName = () => {

    return (
        (TelegramApp.user.first_name || "") +
        " " +
        (TelegramApp.user.last_name || "")
    ).trim();

};

TelegramApp.getUsername = () => TelegramApp.user.username || "";

TelegramApp.getPhoto = () => TelegramApp.user.photo_url || "";

TelegramApp.getLanguage = () => TelegramApp.user.language_code || "en";



// ==========================================
// Login Payload
// ==========================================

TelegramApp.getInitData = () => {

    return {

        ...tg.initDataUnsafe,

        initData: tg.initData

    };

};



// ==========================================
// Console Log
// ==========================================

console.log("Telegram WebApp Loaded");

console.log("Telegram User :", TelegramApp.user);

console.log("Telegram Version :", TelegramApp.version);

console.log("Telegram Platform :", TelegramApp.platform);


// ==========================================
// Theme
// ==========================================

TelegramApp.setHeaderColor = (color) => {

    try {

        if (tg.setHeaderColor) {

            tg.setHeaderColor(color);

        }

    } catch (e) {

        console.log(e);

    }

};

TelegramApp.setBackgroundColor = (color) => {

    try {

        if (tg.setBackgroundColor) {

            tg.setBackgroundColor(color);

        }

    } catch (e) {

        console.log(e);

    }

};



// ==========================================
// Haptic Feedback
// ==========================================

TelegramApp.haptic = (type = "light") => {

    try {

        if (!tg.HapticFeedback) return;

        switch (type) {

            case "light":
                tg.HapticFeedback.impactOccurred("light");
                break;

            case "medium":
                tg.HapticFeedback.impactOccurred("medium");
                break;

            case "heavy":
                tg.HapticFeedback.impactOccurred("heavy");
                break;

            case "success":
                tg.HapticFeedback.notificationOccurred("success");
                break;

            case "warning":
                tg.HapticFeedback.notificationOccurred("warning");
                break;

            case "error":
                tg.HapticFeedback.notificationOccurred("error");
                break;

            default:
                tg.HapticFeedback.impactOccurred("light");

        }

    } catch (e) {

        console.log(e);

    }

};



// ==========================================
// Popup
// ==========================================

TelegramApp.popup = (title, message) => {

    const popup = document.getElementById("popup");

    const overlay = document.getElementById("overlay");

    if (!popup) return;

    document.getElementById("popupTitle").textContent = title;

    document.getElementById("popupMessage").textContent = message;

    popup.classList.remove("hidden");

    if (overlay) {

        overlay.classList.remove("hidden");

    }

};



// ==========================================
// Close Popup
// ==========================================

TelegramApp.closePopup = () => {

    const popup = document.getElementById("popup");

    const overlay = document.getElementById("overlay");

    if (popup) {

        popup.classList.add("hidden");

    }

    if (overlay) {

        overlay.classList.add("hidden");

    }

};



// ==========================================
// Alert
// ==========================================

TelegramApp.alert = (text) => {

    if (tg.showAlert) {

        tg.showAlert(text);

    } else {

        alert(text);

    }

};



// ==========================================
// Confirm
// ==========================================

TelegramApp.confirm = (text, callback) => {

    if (tg.showConfirm) {

        tg.showConfirm(text, callback);

    } else {

        callback(confirm(text));

    }

};


