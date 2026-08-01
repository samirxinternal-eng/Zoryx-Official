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


// ==========================================
// Toast
// ==========================================

TelegramApp.toast = (message, duration = 2500) => {

    const container = document.getElementById("toastContainer");

    if (!container) {

        console.log(message);

        return;

    }

    const toast = document.createElement("div");

    toast.className = "toast";

    toast.textContent = message;

    container.appendChild(toast);

    requestAnimationFrame(() => {

        toast.classList.add("show");

    });

    setTimeout(() => {

        toast.classList.remove("show");

        setTimeout(() => {

            toast.remove();

        }, 300);

    }, duration);

};



// ==========================================
// Main Button
// ==========================================

TelegramApp.mainButton = {

    show(text, callback) {

        if (!tg.MainButton) return;

        tg.MainButton.setText(text);

        tg.MainButton.show();

        tg.MainButton.offClick();

        if (callback) {

            tg.MainButton.onClick(callback);

        }

    },

    hide() {

        if (tg.MainButton) {

            tg.MainButton.hide();

        }

    },

    enable() {

        if (tg.MainButton) {

            tg.MainButton.enable();

        }

    },

    disable() {

        if (tg.MainButton) {

            tg.MainButton.disable();

        }

    },

    loading(show = true) {

        if (!tg.MainButton) return;

        if (show) {

            tg.MainButton.showProgress();

        } else {

            tg.MainButton.hideProgress();

        }

    }

};



// ==========================================
// Back Button
// ==========================================

TelegramApp.backButton = {

    show(callback) {

        if (!tg.BackButton) return;

        tg.BackButton.show();

        tg.BackButton.offClick();

        if (callback) {

            tg.BackButton.onClick(callback);

        }

    },

    hide() {

        if (tg.BackButton) {

            tg.BackButton.hide();

        }

    }

};



// ==========================================
// Loader
// ==========================================

TelegramApp.showLoader = () => {

    const loading = document.getElementById("loading");

    if (loading) {

        loading.style.display = "flex";

    }

};

TelegramApp.hideLoader = () => {

    const loading = document.getElementById("loading");

    if (loading) {

        loading.style.display = "none";

    }

};



// ==========================================
// Close App
// ==========================================

TelegramApp.close = () => {

    if (tg.close) {

        tg.close();

    }

};



// ==========================================
// Open Telegram Link
// ==========================================

TelegramApp.openLink = (url) => {

    if (tg.openLink) {

        tg.openLink(url);

    } else {

        window.open(url, "_blank");

    }

};


// ==========================================
// Telegram Events
// ==========================================

TelegramApp.onThemeChanged = (callback) => {

    if (tg.onEvent) {

        tg.onEvent("themeChanged", callback);

    }

};

TelegramApp.onViewportChanged = (callback) => {

    if (tg.onEvent) {

        tg.onEvent("viewportChanged", callback);

    }

};



// ==========================================
// App Information
// ==========================================

TelegramApp.getInfo = () => {

    return {

        version: TelegramApp.version,

        platform: TelegramApp.platform,

        colorScheme: TelegramApp.colorScheme,

        user: TelegramApp.user,

        initData: TelegramApp.initData

    };

};



// ==========================================
// Apply Theme
// ==========================================

document.documentElement.setAttribute(

    "data-theme",

    TelegramApp.colorScheme

);



// ==========================================
// Auto Update User Photo
// ==========================================

window.addEventListener("DOMContentLoaded", () => {

    const photo = document.getElementById("userPhoto");

    if (photo && TelegramApp.getPhoto()) {

        photo.src = TelegramApp.getPhoto();

    }

    const profilePhoto = document.getElementById("profilePhoto");

    if (profilePhoto && TelegramApp.getPhoto()) {

        profilePhoto.src = TelegramApp.getPhoto();

    }

});



// ==========================================
// Debug
// ==========================================

console.log("=================================");

console.log("🚀 Zoryx Telegram Ready");

console.log("User ID :", TelegramApp.getUserId());

console.log("Name :", TelegramApp.getFullName());

console.log("Username :", TelegramApp.getUsername());

console.log("Platform :", TelegramApp.platform);

console.log("Version :", TelegramApp.version);

console.log("=================================");



// ==========================================
// Export
// ==========================================

window.TelegramApp = TelegramApp;
