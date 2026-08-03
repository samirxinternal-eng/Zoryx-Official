import { initTelegramWebApp, getTelegramUserData, renderUserProfile } from './telegram.js';
import { loginUser, syncUserData, sendTapData, getLeaderboard, getDailyStatus, claimDailyReward, getReferralInfo, joinReferral, getTasks, claimTask, getSpinInfo, processSpin } from './api.js';

// গেম স্টেট ভেরিয়েবল
let state = {
    telegramId: null,
    balance: 0,
    energy: 1000,
    maxEnergy: 1000,
    totalTap: 0,
    level: 1,
    xp: 0,
    pendingTaps: 0,
    isSaving: false
};

// গেম ইনিশিয়ালাইজেশন
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // ১. Telegram WebApp ইনিশিয়েট করা
        const tg = initTelegramWebApp();
        const tgUser = getTelegramUserData();

        // ২. UI-তে ইউজারের প্রোফাইল রেন্ডার করা
        renderUserProfile(tgUser);

        // ৩. ব্যাকএন্ডে লগইন বা সাইনআপ করা
        const startParam = tg?.initDataUnsafe?.start_param || null;
        const loginResponse = await loginUser({
            telegramId: tgUser.id.toString(),
            firstName: tgUser.first_name || '',
            lastName: tgUser.last_name || '',
            username: tgUser.username || '',
            photo: tgUser.photo_url || '',
            referredBy: startParam
        });

        if (loginResponse && loginResponse.data) {
            updateStateFromData(loginResponse.data);
        }

        // ৪. রেফারেল জয়েনিং হ্যান্ডেল করা (যদি স্টার্ট প্যারামিটার থাকে)
        if (startParam && startParam !== tgUser.id.toString()) {
            try {
                await joinReferral(tgUser.id.toString(), startParam);
            } catch (err) {
                console.error("Referral join error:", err);
            }
        }

        // ৫. ইভেন্ট লিসেনার ও ইন্টারভ্যাল সেটআপ করা
        setupEventListeners();
        startAutoRefreshAndSync();

    } catch (error) {
        console.error("Initialization Error:", error);
    }
});

// ডেটা দিয়ে গেম স্টেট আপডেট এবং UI রিফ্রেশ করা
function updateStateFromData(data) {
    state.telegramId = data.telegramId;
    state.balance = data.balance ?? state.balance;
    state.energy = data.energy ?? state.energy;
    state.maxEnergy = data.maxEnergy ?? state.maxEnergy;
    state.totalTap = data.totalTap ?? state.totalTap;
    state.level = data.level ?? state.level;
    state.xp = data.xp ?? state.xp;

    updateUI();
}

// UI আপডেট করার ফাংশন
function updateUI() {
    document.getElementById('coin-balance').textContent = state.balance.toLocaleString();
    document.getElementById('current-energy').textContent = Math.floor(state.energy);
    document.getElementById('max-energy').textContent = state.maxEnergy;
    document.getElementById('header-xp').textContent = `${state.xp} XP`;
    document.getElementById('user-level').textContent = `Level ${state.level}`;

    // এনার্জি বার প্রোগ্রেস আপডেট
    const energyBar = document.getElementById('energy-bar');
    if (energyBar) {
        const percentage = Math.max(0, Math.min(100, (state.energy / state.maxEnergy) * 100));
        energyBar.style.width = `${percentage}%`;
    }
}

// ইভেন্ট লিসেনার সেটআপ
function setupEventListeners() {
    const tapCoin = document.getElementById('tap-coin');
    
    if (tapCoin) {
        // ট্যাপ মেকানিক (Multi-touch বা দ্রুত ক্লিকের জন্য অপ্টিমাইজড)
        tapCoin.addEventListener('click', (e) => {
            if (state.energy <= 0) return;

            const tapValue = 1;
            state.energy = Math.max(0, state.energy - tapValue);
            state.balance += tapValue;
            state.totalTap += tapValue;
            state.xp += tapValue;
            state.pendingTaps += tapValue;

            updateUI();
            triggerTapAnimation(e, tapCoin);
        });
    }

    // টপ নাবিগেশন ট্যাব সুইচিং
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            const tabName = item.getAttribute('data-tab');
            handleTabSwitch(tabName);
        });
    });
}

// ট্যাপ করার সময় ছোট ফ্লোটিং অ্যানিমেশন এফেক্ট
function triggerTapAnimation(event, container) {
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const floatText = document.createElement('div');
    floatText.textContent = '+1';
    floatText.style.position = 'absolute';
    floatText.style.left = `${x}px`;
    floatText.style.top = `${y}px`;
    floatText.style.color = '#38bdf8';
    floatText.style.fontWeight = '800';
    floatText.style.fontSize = '20px';
    floatText.style.pointerEvents = 'none';
    floatText.style.transition = 'transform 0.6s ease, opacity 0.6s ease';
    
    container.appendChild(floatText);

    setTimeout(() => {
        floatText.style.transform = 'translateY(-50px)';
        floatText.style.opacity = '0';
    }, 20);

    setTimeout(() => {
        floatText.remove();
    }, 600);
}

// অটো সেভ (Auto Save) এবং অটো রিফ্রেশ (Auto Refresh) সিস্টেম
function startAutoRefreshAndSync() {
    // প্রতি ৩ সেকেন্ড পর পর পেন্ডিং ট্যাপগুলো ব্যাকএন্ডে সেভ করা (Auto Save)
    setInterval(async () => {
        if (state.pendingTaps > 0 && state.telegramId && !state.isSaving) {
            state.isSaving = true;
            const tapsToSend = state.pendingTaps;
            state.pendingTaps = 0;

            try {
                const response = await sendTapData(state.telegramId, tapsToSend);
                if (response && response.data) {
                    updateStateFromData(response.data);
                }
            } catch (error) {
                console.error("Auto-save tap error:", error);
                // ফেইল করলে ট্যাপগুলো আবার ব্যাকআপে ফিরিয়ে দেওয়া
                state.pendingTaps += tapsToSend;
            } finally {
                state.isSaving = false;
            }
        }
    }, 3000);

    // প্রতি ১০ সেকেন্ড পর পর সার্ভার থেকে লেটেস্ট এনার্জি ও ব্যালেন্স সিঙ্ক করা (Auto Refresh)
    setInterval(async () => {
        if (state.telegramId && state.pendingTaps === 0) {
            try {
                const response = await syncUserData(state.telegramId);
                if (response && response.data) {
                    updateStateFromData(response.data);
                }
            } catch (error) {
                console.error("Auto-sync error:", error);
            }
        }
    }, 10000);
}

// ট্যাব সুইচ হ্যান্ডেলার (ভবিষ্যত এক্সটেনশনের জন্য প্রস্তুত)
function handleTabSwitch(tabName) {
    console.log(`Switched to tab: ${tabName}`);
    // এখানে অন্যান্য পেজ বা সেকশন রেন্ডার করার লজিক যুক্ত করা যাবে।
                    }
