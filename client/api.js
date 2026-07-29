// ==========================================
// Zoryx Telegram WebApp
// client/api.js
// ==========================================

const API = {
    BASE_URL: window.location.origin,

    async request(endpoint, method = "GET", data = null) {
        try {
            const options = {
                method,
                headers: {
                    "Content-Type": "application/json"
                }
            };

            if (data) {
                options.body = JSON.stringify(data);
            }

            const response = await fetch(`${this.BASE_URL}${endpoint}`, options);

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "API Request Failed");
            }

            return result;

        } catch (error) {
            console.error("API Error:", error);
            return {
                success: false,
                message: error.message
            };
        }
    },

    // ======================================
    // Authentication
    // ======================================

    async login() {
        return await this.request("/api/auth/login", "POST", {
            initData: TelegramApp.initData
        });
    },

    // ======================================
    // User
    // ======================================

    async getProfile(userId) {
        return await this.request(`/api/user/${userId}`);
    },

    async updateProfile(userId, data) {
        return await this.request(`/api/user/${userId}`, "PUT", data);
    },

    // ======================================
    // Balance
    // ======================================

    async getBalance(userId) {
        return await this.request(`/api/balance/${userId}`);
    },

    async addBalance(userId, amount) {
        return await this.request("/api/balance/add", "POST", {
            userId,
            amount
        });
    },

    // ======================================
    // Daily Reward
    // ======================================

    async claimDaily(userId) {
        return await this.request("/api/reward/daily", "POST", {
            userId
        });
    },

    // ======================================
    // Referral
    // ======================================

    async getReferrals(userId) {
        return await this.request(`/api/referrals/${userId}`);
    },

    // ======================================
    // Leaderboard
    // ======================================

    async getLeaderboard() {
        return await this.request("/api/leaderboard");
    }
};

// Global Access
window.API = API;
