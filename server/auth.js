import crypto from "crypto";

// ========================================
// Telegram Mini App Auth Verification
// ========================================

export function verifyTelegramAuth(body) {

    try {

        const { initData } = body;

        if (!initData) {
            return {
                success: false,
                message: "InitData Missing"
            };
        }

        const params = new URLSearchParams(initData);

        const hash = params.get("hash");

        if (!hash) {
            return {
                success: false,
                message: "Invalid Hash"
            };
        }

        params.delete("hash");

        const dataCheckString = [...params.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `${key}=${value}`)
            .join("\n");

        const secretKey = crypto
            .createHmac("sha256", "WebAppData")
            .update(process.env.BOT_TOKEN)
            .digest();

        const calculatedHash = crypto
            .createHmac("sha256", secretKey)
            .update(dataCheckString)
            .digest("hex");

        if (calculatedHash !== hash) {
            return {
                success: false,
                message: "Unauthorized"
            };
        }

        const user = JSON.parse(params.get("user"));

        return {
            success: true,
            user
        };

    } catch (error) {

        return {
            success: false,
            message: error.message
        };

    }
    
 }
