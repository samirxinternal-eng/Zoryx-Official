// ========================================
// Zoryx Telegram WebApp
// server/auth.js
// ========================================

import crypto from "crypto";



// ========================================
// Config
// ========================================

const BOT_TOKEN = process.env.BOT_TOKEN || "";



// ========================================
// SHA256 Helper
// ========================================

function sha256(data) {

    return crypto
        .createHash("sha256")
        .update(data)
        .digest();

}



// ========================================
// HMAC Helper
// ========================================

function hmac(key, data) {

    return crypto
        .createHmac("sha256", key)
        .update(data)
        .digest("hex");

}



// ========================================
// Parse Init Data
// ========================================

function parseInitData(initData) {

    const params = new URLSearchParams(initData);

    const data = {};

    for (const [key, value] of params.entries()) {

        data[key] = value;

    }

    return data;

}



// ========================================
// Build Data Check String
// ========================================

function buildDataCheckString(data) {

    return Object.keys(data)

        .filter(key => key !== "hash")

        .sort()

        .map(key => `${key}=${data[key]}`)

        .join("\n");

        }


// ========================================
// Verify Telegram Login
// ========================================

export function verifyTelegramAuth(body) {

    try {

        if (!body || !body.initData) {

            return {

                success: false,

                message: "Telegram initData Missing"

            };

        }

        const data = parseInitData(body.initData);

        const receivedHash = data.hash;

        if (!receivedHash) {

            return {

                success: false,

                message: "Hash Missing"

            };

        }

        const dataCheckString = buildDataCheckString(data);

        const secretKey = crypto
            .createHmac("sha256", "WebAppData")
            .update(BOT_TOKEN)
            .digest();

        const calculatedHash = hmac(

            secretKey,

            dataCheckString

        );

        if (receivedHash !== calculatedHash) {

            return {

                success: false,

                message: "Telegram Verification Failed"

            };

        }

        let user = {};

        try {

            user = JSON.parse(data.user);

        }

        catch {

            return {

                success: false,

                message: "Invalid Telegram User"

            };

        }

        return {

            success: true,

            user

        };

    }

    catch (error) {

        return {

            success: false,

            message: error.message

        };

    }

    }


// ========================================
// Auth Date Validation
// ========================================

function validateAuthDate(data) {

    if (!data.auth_date) {

        return false;

    }

    const authTime = Number(data.auth_date);

    const currentTime = Math.floor(Date.now() / 1000);

    const maxAge = 86400;

    return (currentTime - authTime) <= maxAge;

}



// ========================================
// Verify Telegram Init Data
// ========================================

export function verifyTelegramInitData(initData) {

    const data = parseInitData(initData);

    const hash = data.hash;

    delete data.hash;

    const dataCheckString = buildDataCheckString(data);

    const secret = crypto
    .createHmac("sha256", "WebAppData")
    .update(BOT_TOKEN)
    .digest();

    const calculatedHash = crypto
        .createHmac("sha256", secret)
        .update(dataCheckString)
        .digest("hex");

    return hash === calculatedHash;

}



// ========================================
// Validate Request
// ========================================

export function validateTelegramRequest(body) {

    if (!body || !body.initData) {

        return {

            success: false,

            message: "Missing initData"

        };

    }

    if (!verifyTelegramInitData(body.initData)) {

        return {

            success: false,

            message: "Invalid Telegram Signature"

        };

    }

    const data = parseInitData(body.initData);

    if (!validateAuthDate(data)) {

        return {

            success: false,

            message: "Telegram Login Expired"

        };

    }

    return {

        success: true

    };

}



// ========================================
// Default Export
// ========================================

export default {

    verifyTelegramAuth,

    verifyTelegramInitData,

    validateTelegramRequest

};
