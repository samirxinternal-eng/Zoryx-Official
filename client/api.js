// ==========================================
// Zoryx Telegram Mini App
// client/api.js
// Production Version 2.0
// Part 1
// ==========================================

"use strict";



// ==========================================
// API Object
// ==========================================

const API = {};



// ==========================================
// Base URL
// ==========================================

API.BASE_URL =

    window.location.hostname === "localhost"

        ? "http://localhost:3000"

        : window.location.origin;



// ==========================================
// API Timeout
// ==========================================

API.TIMEOUT = 15000;



// ==========================================
// Default Headers
// ==========================================

API.defaultHeaders = () => ({

    "Content-Type": "application/json",

    "Accept": "application/json"

});



// ==========================================
// Build URL
// ==========================================

API.url = (endpoint = "") => {

    return API.BASE_URL + endpoint;

};



// ==========================================
// Request Helper
// ==========================================

API.request = async (

    endpoint,

    method = "GET",

    body = null

) => {

    const controller =

        new AbortController();

    const timeout =

        setTimeout(

            () => controller.abort(),

            API.TIMEOUT

        );

    try {

        const options = {

            method,

            headers:

                API.defaultHeaders(),

            signal:

                controller.signal

        };

        if (

            body !== null

        ) {

            options.body =

                JSON.stringify(body);

        }

        const response =

            await fetch(

                API.url(endpoint),

                options

            );

        clearTimeout(timeout);

        const json =

            await response.json();

        return json;

    }

    catch (error) {

        clearTimeout(timeout);

        console.error(

            "API Error:",

            error

        );

        return {

            success: false,

            message:

                error.name ===

                "AbortError"

                    ? "Request Timeout"

                    : "Network Error"

        };

    }

};



// ==========================================
// GET
// ==========================================

API.get = async (

    endpoint

) => {

    return await API.request(

        endpoint,

        "GET"

    );

};



// ==========================================
// POST
// ==========================================

API.post = async (

    endpoint,

    body = {}

) => {

    return await API.request(

        endpoint,

        "POST",

        body

    );

};



// ==========================================
// PUT
// ==========================================

API.put = async (

    endpoint,

    body = {}

) => {

    return await API.request(

        endpoint,

        "PUT",

        body

    );

};



// ==========================================
// DELETE
// ==========================================

API.delete = async (

    endpoint

) => {

    return await API.request(

        endpoint,

        "DELETE"

    );

};



// ==========================================
// Health Check
// ==========================================

API.isOnline = async () => {

    const result =

        await API.get("/");

    return result.success === true;

};


// ==========================================
// Telegram Login
// ==========================================

API.login = async () => {

    return await API.post(

        "/auth/login",

        TelegramApp.getInitData()

    );

};



// ==========================================
// Get User Profile
// ==========================================

API.getProfile = async (

    telegramId

) => {

    return await API.get(

        `/user/${telegramId}`

    );

};



// ==========================================
// Update Profile
// ==========================================

API.updateProfile = async (

    telegramId,

    data = {}

) => {

    return await API.put(

        `/user/${telegramId}`,

        data

    );

};



// ==========================================
// Tap Coin
// ==========================================

API.tap = async (

    telegramId,

    amount = 1

) => {

    return await API.post(

        "/tap",

        {

            telegramId,

            tap: amount

        }

    );

};



// ==========================================
// Leaderboard
// ==========================================

API.getLeaderboard = async () => {

    return await API.get(

        "/leaderboard"

    );

};



// ==========================================
// User Rank
// ==========================================

API.getRank = async (

    telegramId

) => {

    return await API.get(

        `/leaderboard/rank/${telegramId}`

    );

};



// ==========================================
// Server Statistics
// ==========================================

API.getStats = async () => {

    return await API.get(

        "/stats"

    );

};



// ==========================================
// Sync User
// ==========================================

API.syncUser = async (

    telegramId

) => {

    return await API.get(

        `/sync/${telegramId}`

    );

};



// ==========================================
// Ping Server
// ==========================================

API.ping = async () => {

    return await API.get(

        "/ping"

    );

};


// ==========================================
// Daily Status
// ==========================================

API.getDailyStatus = async (

    telegramId

) => {

    return await API.get(

        `/daily/${telegramId}`

    );

};



// ==========================================
// Claim Daily Reward
// ==========================================

API.claimDailyReward = async (

    telegramId

) => {

    return await API.post(

        "/daily/claim",

        {

            telegramId

        }

    );

};



// ==========================================
// Tasks
// ==========================================

API.getTasks = async (

    telegramId

) => {

    return await API.get(

        `/tasks/${telegramId}`

    );

};



// ==========================================
// Claim Task
// ==========================================

API.claimTask = async (

    telegramId,

    taskId

) => {

    return await API.post(

        "/task/claim",

        {

            telegramId,

            taskId

        }

    );

};



// ==========================================
// Referral Information
// ==========================================

API.getReferral = async (

    telegramId

) => {

    return await API.get(

        `/referral/${telegramId}`

    );

};



// ==========================================
// Join Referral
// ==========================================

API.joinReferral = async (

    telegramId,

    referralCode

) => {

    return await API.post(

        "/referral/join",

        {

            telegramId,

            referralCode

        }

    );

};



// ==========================================
// Claim Referral Reward
// ==========================================

API.claimReferralReward = async (

    telegramId

) => {

    return await API.post(

        "/referral/claim",

        {

            telegramId

        }

    );

};



// ==========================================
// Lucky Spin Status
// ==========================================

API.getSpinStatus = async (

    telegramId

) => {

    return await API.get(

        `/spin/${telegramId}`

    );

};



// ==========================================
// Lucky Spin
// ==========================================

API.spin = async (

    telegramId

) => {

    return await API.post(

        "/spin",

        {

            telegramId

        }

    );

};



// ==========================================
// Top Referrals
// ==========================================

API.getTopReferrals = async () => {

    return await API.get(

        "/leaderboard/referrals"

    );

};



// ==========================================
// Export
// ==========================================

window.API = API;
