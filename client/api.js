// ==========================================
// Zoryx Telegram WebApp
// client/api.js
// ==========================================

const API = {};



// ==========================================
// Config
// ==========================================

API.BASE_URL =
window.location.origin + "/api";

API.TIMEOUT = 15000;



// ==========================================
// Request Helper
// ==========================================

API.request = async (

    endpoint,

    method = "GET",

    body = null

) => {

    try {

        const controller = new AbortController();

        const timeout = setTimeout(() => {

            controller.abort();

        }, API.TIMEOUT);

        const options = {

            method,

            headers: {

                "Content-Type": "application/json"

            },

            signal: controller.signal

        };

        if (body) {

            options.body = JSON.stringify(body);

        }

        const response = await fetch(

            API.BASE_URL + endpoint,

            options

        );

        clearTimeout(timeout);

        const data = await response.json();

        if (!response.ok) {

            return {

                success: false,

                message:

                    data.message ||

                    "Server Error"

            };

        }

        return data;

    }

    catch (error) {

        console.error("API Error :", error);

        return {

            success: false,

            message: error.message ||

            "Network Error"

        };

    }

};



// ==========================================
// Telegram Login
// ==========================================

API.login = async () => {

    return await API.request(

        "/auth/login",

        "POST",

        TelegramApp.getInitData()

    );

};



// ==========================================
// Get User Profile
// ==========================================

API.getProfile = async (

    telegramId

) => {

    return await API.request(

        `/user/${telegramId}`

    );

};



// ==========================================
// Update User Profile
// ==========================================

API.updateProfile = async (

    telegramId,

    data

) => {

    return await API.request(

        `/user/${telegramId}`,

        "PUT",

        data

    );

};


// ==========================================
// Tap
// ==========================================

API.tap = async (

    telegramId,

    tap = 1

) => {

    return await API.request(

        "/tap",

        "POST",

        {

            telegramId,

            tap

        }

    );

};



// ==========================================
// Balance Add
// ==========================================

API.addBalance = async (

    telegramId,

    amount

) => {

    return await API.request(

        "/balance/add",

        "POST",

        {

            telegramId,

            amount

        }

    );

};



// ==========================================
// Referral Info
// ==========================================

API.getReferrals = async (

    telegramId

) => {

    return await API.request(

        `/referrals/${telegramId}`

    );

};



// ==========================================
// Leaderboard
// ==========================================

API.getLeaderboard = async () => {

    return await API.request(

        "/leaderboard"

    );

};



// ==========================================
// Health Check
// ==========================================

API.getStatus = async () => {

    return await API.request(

        "/"

    );

};



// ==========================================
// Ping
// ==========================================

API.ping = async () => {

    try {

        const start = Date.now();

        const result = await API.getStatus();

        const end = Date.now();

        return {

            success: result.success,

            ping: end - start

        };

    }

    catch {

        return {

            success: false,

            ping: -1

        };

    }

};


// ==========================================
// Connection Check
// ==========================================

API.isOnline = async () => {

    try {

        const result = await API.getStatus();

        return result.success === true;

    }
    catch {

        return false;

    }

};



// ==========================================
// Retry Request
// ==========================================

API.retry = async (

    callback,

    retry = 3

) => {

    let lastError = null;

    for (

        let i = 0;

        i < retry;

        i++

    ) {

        try {

            const result = await callback();

            if (result.success) {

                return result;

            }

            lastError = result;

        }
        catch (error) {

            lastError = {

                success: false,

                message: error.message

            };

        }

    }

    return lastError || {

        success: false,

        message: "Request Failed"

    };

};



// ==========================================
// API Information
// ==========================================

API.version = "1.0.0";

API.project = "Zoryx";



// ==========================================
// Export
// ==========================================

window.API = API;

console.log("=================================");

console.log("🚀 Zoryx API Ready");

console.log("Base URL :", API.BASE_URL);

console.log("Version :", API.version);

console.log("=================================");
