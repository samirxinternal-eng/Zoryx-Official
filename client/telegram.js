// ==========================================
// Zoryx Telegram Mini App
// client/telegram.js
// Production Version 2.0
// Part 1
// ==========================================

"use strict";



// ==========================================
// Telegram WebApp
// ==========================================

const tg = window.Telegram?.WebApp;

if (!tg) {

    throw new Error(

        "Telegram WebApp SDK Not Found"

    );

}



// ==========================================
// Initialize Telegram
// ==========================================

tg.ready();

tg.expand();

tg.enableClosingConfirmation();



// ==========================================
// Telegram Application
// ==========================================

const TelegramApp = {};



// ==========================================
// Basic Information
// ==========================================

TelegramApp.version =

    tg.version || "1.0";

TelegramApp.platform =

    tg.platform || "unknown";

TelegramApp.colorScheme =

    tg.colorScheme || "dark";

TelegramApp.language =

    tg.initDataUnsafe?.user?.language_code ||

    "en";



// ==========================================
// User Object
// ==========================================

TelegramApp.user =

    tg.initDataUnsafe?.user || {};



// ==========================================
// Telegram InitData
// ==========================================

TelegramApp.getInitData = () => {

    return {

        initData: tg.initData,

        ...tg.initDataUnsafe

    };

};



// ==========================================
// Telegram ID
// ==========================================

TelegramApp.getTelegramId = () => {

    return Number(

        TelegramApp.user.id || 0

    );

};



// ==========================================
// First Name
// ==========================================

TelegramApp.getFirstName = () => {

    return (

        TelegramApp.user.first_name ||

        "Guest"

    );

};



// ==========================================
// Last Name
// ==========================================

TelegramApp.getLastName = () => {

    return (

        TelegramApp.user.last_name ||

        ""

    );

};



// ==========================================
// Full Name
// ==========================================

TelegramApp.getFullName = () => {

    return (

        (

            TelegramApp.getFirstName() +

            " " +

            TelegramApp.getLastName()

        ).trim()

    );

};



// ==========================================
// Username
// ==========================================

TelegramApp.getUsername = () => {

    return (

        TelegramApp.user.username ||

        ""

    );

};



// ==========================================
// Photo
// ==========================================

TelegramApp.getPhoto = () => {

    return (

        TelegramApp.user.photo_url ||

        "assets/images/avatar.png"

    );

};



// ==========================================
// Premium User
// ==========================================

TelegramApp.isPremium = () => {

    return Boolean(

        TelegramApp.user.is_premium

    );

};



// ==========================================
// Is Bot
// ==========================================

TelegramApp.isBot = () => {

    return Boolean(

        TelegramApp.user.is_bot

    );

};



// ==========================================
// Theme
// ==========================================

TelegramApp.getTheme = () => {

    return tg.colorScheme;

};



// ==========================================
// Theme Colors
// ==========================================

TelegramApp.getThemeParams = () => {

    return tg.themeParams || {};

};



// ==========================================
// Apply Theme
// ==========================================

TelegramApp.applyTheme = () => {

    document.body.setAttribute(

        "data-theme",

        TelegramApp.getTheme()

    );

};



// ==========================================
// Application Ready
// ==========================================

TelegramApp.initialize = () => {

    TelegramApp.applyTheme();

    console.log("");

    console.log("================================");

    console.log("Telegram Ready");

    console.log(

        "User :",

        TelegramApp.getFullName()

    );

    console.log(

        "Username :",

        TelegramApp.getUsername()

    );

    console.log(

        "Platform :",

        TelegramApp.platform

    );

    console.log(

        "Version :",

        TelegramApp.version

    );

    console.log("================================");

    console.log("");

};



// ==========================================
// Initialize
// ==========================================

TelegramApp.initialize();


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

    }

    catch (error) {

        console.error(error);

    }

};



// ==========================================
// Alert
// ==========================================

TelegramApp.alert = (message = "") => {

    if (tg.showAlert) {

        tg.showAlert(message);

    }

    else {

        window.alert(message);

    }

};



// ==========================================
// Confirm
// ==========================================

TelegramApp.confirm = (

    message,

    callback

) => {

    if (tg.showConfirm) {

        tg.showConfirm(

            message,

            callback

        );

    }

    else {

        callback(

            window.confirm(message)

        );

    }

};



// ==========================================
// Popup
// ==========================================

TelegramApp.popup = (

    title,

    message

) => {

    if (tg.showPopup) {

        tg.showPopup({

            title,

            message,

            buttons: [

                {

                    type: "ok"

                }

            ]

        });

        return;

    }

    const overlay =

        document.getElementById(

            "overlay"

        );

    const popup =

        document.getElementById(

            "popup"

        );

    const popupTitle =

        document.getElementById(

            "popupTitle"

        );

    const popupMessage =

        document.getElementById(

            "popupMessage"

        );

    if (

        overlay &&

        popup

    ) {

        popupTitle.textContent = title;

        popupMessage.textContent = message;

        overlay.classList.remove("hidden");

        popup.classList.remove("hidden");

    }

};



// ==========================================
// Close Popup
// ==========================================

TelegramApp.closePopup = () => {

    const overlay =

        document.getElementById(

            "overlay"

        );

    const popup =

        document.getElementById(

            "popup"

        );

    if (overlay) {

        overlay.classList.add(

            "hidden"

        );

    }

    if (popup) {

        popup.classList.add(

            "hidden"

        );

    }

};



// ==========================================
// Toast
// ==========================================

TelegramApp.toast = (

    message,

    duration = 2500

) => {

    const container =

        document.getElementById(

            "toastContainer"

        );

    if (!container) {

        console.log(message);

        return;

    }

    const toast =

        document.createElement("div");

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
// Loading
// ==========================================

TelegramApp.showLoading = () => {

    const loading =

        document.getElementById(

            "loading"

        );

    if (loading) {

        loading.style.display = "flex";

    }

};



TelegramApp.hideLoading = () => {

    const loading =

        document.getElementById(

            "loading"

        );

    if (loading) {

        loading.style.display = "none";

    }

};


// ==========================================
// Main Button
// ==========================================

TelegramApp.mainButton = {

    show(text, callback) {

        tg.MainButton.setText(text);

        tg.MainButton.show();

        tg.MainButton.offClick();

        if (typeof callback === "function") {

            tg.MainButton.onClick(callback);

        }

    },

    hide() {

        tg.MainButton.hide();

        tg.MainButton.offClick();

    },

    enable() {

        tg.MainButton.enable();

    },

    disable() {

        tg.MainButton.disable();

    },

    loading(status = true) {

        if (status) {

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

        tg.BackButton.show();

        tg.BackButton.offClick();

        if (typeof callback === "function") {

            tg.BackButton.onClick(callback);

        }

    },

    hide() {

        tg.BackButton.hide();

        tg.BackButton.offClick();

    }

};



// ==========================================
// Clipboard Copy
// ==========================================

TelegramApp.copy = async (text) => {

    try {

        await navigator.clipboard.writeText(text);

        TelegramApp.toast("Copied");

        return true;

    }

    catch (error) {

        console.error(error);

        TelegramApp.toast("Copy Failed");

        return false;

    }

};



// ==========================================
// Share Link
// ==========================================

TelegramApp.share = async (

    title,

    text,

    url

) => {

    try {

        if (navigator.share) {

            await navigator.share({

                title,

                text,

                url

            });

            return true;

        }

        await TelegramApp.copy(url);

        return true;

    }

    catch (error) {

        console.error(error);

        return false;

    }

};



// ==========================================
// Open Link
// ==========================================

TelegramApp.openLink = (

    url,

    instantView = false

) => {

    try {

        tg.openLink(

            url,

            {

                tryInstantView:

                    instantView

            }

        );

    }

    catch {

        window.open(

            url,

            "_blank"

        );

    }

};



// ==========================================
// Open Telegram Link
// ==========================================

TelegramApp.openTelegramLink = (

    url

) => {

    try {

        tg.openTelegramLink(

            url

        );

    }

    catch {

        window.open(

            url,

            "_blank"

        );

    }

};



// ==========================================
// Close Mini App
// ==========================================

TelegramApp.close = () => {

    tg.close();

};



// ==========================================
// Viewport Height
// ==========================================

TelegramApp.viewportHeight = () => {

    return tg.viewportHeight;

};



// ==========================================
// Theme Event
// ==========================================

tg.onEvent(

    "themeChanged",

    () => {

        TelegramApp.applyTheme();

    }

);



// ==========================================
// Viewport Event
// ==========================================

tg.onEvent(

    "viewportChanged",

    () => {

        document.documentElement.style.setProperty(

            "--tg-height",

            tg.viewportHeight + "px"

        );

    }

);



// ==========================================
// Ready Event
// ==========================================

TelegramApp.ready = () => {

    tg.ready();

    tg.expand();

    TelegramApp.applyTheme();

};



// ==========================================
// Export
// ==========================================

window.TelegramApp = TelegramApp;
