// যেহেতু একই সার্ভার থেকে ফ্রন্টএন্ড ও ব্যাকএন্ড রান হচ্ছে, তাই বেস URL রুট হিসেবে কাজ করবে
const API_BASE_URL = '/api';

/**
 * সাধারণ ফেচ রিকোয়েস্ট হ্যান্ডেলার ফাংশন
 */
async function request(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }
        return data;
    } catch (error) {
        console.error(`API Error [${endpoint}]:`, error.message);
        throw error;
    }
}

// === AUTHENTICATION & SYNC API ===

export async function loginUser(userData) {
    return request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(userData)
    });
}

export async function syncUserData(telegramId) {
    return request(`/sync/${telegramId}`);
}

// === USER PROFILE API ===

export async function getUser(telegramId) {
    return request(`/user/${telegramId}`);
}

export async function updateUser(telegramId, updateData) {
    return request(`/user/${telegramId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
    });
}

// === CORE GAME MECHANICS API ===

export async function sendTapData(telegramId, tapCount) {
    return request('/tap', {
        method: 'POST',
        body: JSON.stringify({ telegramId, tapCount })
    });
}

// === LEADERBOARD & STATS API ===

export async function getLeaderboard() {
    return request('/leaderboard');
}

export async function getUserRank(telegramId) {
    return request(`/leaderboard/rank/${telegramId}`);
}

export async function getGameStats() {
    return request('/stats');
}

export async function getReferralLeaderboard() {
    return request('/leaderboard/referrals');
}

// === DAILY REWARDS API ===

export async function getDailyStatus(telegramId) {
    return request(`/daily/${telegramId}`);
}

export async function claimDailyReward(telegramId) {
    return request('/daily/claim', {
        method: 'POST',
        body: JSON.stringify({ telegramId })
    });
}

// === REFERRAL API ===

export async function getReferralInfo(telegramId) {
    return request(`/referral/${telegramId}`);
}

export async function joinReferral(telegramId, referrerId) {
    return request('/referral/join', {
        method: 'POST',
        body: JSON.stringify({ telegramId, referrerId })
    });
}

// === TASKS & SPINS API ===

export async function getTasks(telegramId) {
    return request(`/tasks/${telegramId}`);
}

export async function claimTask(telegramId, taskId, reward) {
    return request('/task/claim', {
        method: 'POST',
        body: JSON.stringify({ telegramId, taskId, reward })
    });
}

export async function getSpinInfo(telegramId) {
    return request(`/spin/${telegramId}`);
}

export async function processSpin(telegramId, cost, winnings) {
    return request('/spin', {
        method: 'POST',
        body: JSON.stringify({ telegramId, cost, winnings })
    });
}
