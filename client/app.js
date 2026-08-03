import { initTelegramWebApp, getTelegramUserData, renderUserProfile } from './telegram.js';
import { loginUser, syncUserData, sendTapData, getLeaderboard, joinReferral } from './api.js';

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

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const tg = initTelegramWebApp();
        const tgUser = getTelegramUserData();

        renderUserProfile(tgUser);

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

        if (startParam && startParam !== tgUser.id.toString()) {
            try {
                await joinReferral(tgUser.id.toString(), startParam);
            } catch (err) {
                console.error("Referral join error:", err);
            }
        }

        setupEventListeners();
        startAutoRefreshAndSync();

    } catch (error) {
        console.error("Initialization Error:", error);
    }
});

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

function updateUI() {
    const balanceEl = document.getElementById('coin-balance');
    const energyEl = document.getElementById('current-energy');
    const maxEnergyEl = document.getElementById('max-energy');
    const xpEl = document.getElementById('header-xp');
    const levelEl = document.getElementById('user-level');
    
    // Level Page Elements
    const infoLevelEl = document.getElementById('info-level');
    const infoXpEl = document.getElementById('info-xp');

    // Frens Page Elements
    const frensCountEl = document.getElementById('frens-count');
    const frensEarnedEl = document.getElementById('frens-earned');

    if (balanceEl) balanceEl.textContent = state.balance.toLocaleString();
    if (energyEl) energyEl.textContent = Math.floor(state.energy);
    if (maxEnergyEl) maxEnergyEl.textContent = state.maxEnergy;
    if (xpEl) xpEl.textContent = `${state.xp} XP`;
    if (levelEl) levelEl.textContent = `⭐ Level ${state.level}`;
    
    if (infoLevelEl) infoLevelEl.textContent = state.level;
    if (infoXpEl) infoXpEl.textContent = state.xp.toLocaleString();

    if (frensCountEl) frensCountEl.textContent = state.referralCount || 0;
    if (frensEarnedEl) frensEarnedEl.textContent = (state.referralEarnings || 0).toLocaleString();

    const energyBar = document.getElementById('energy-bar');
    if (energyBar) {
        const percentage = Math.max(0, Math.min(100, (state.energy / state.maxEnergy) * 100));
        energyBar.style.width = `${percentage}%`;
    }
}

function setupEventListeners() {
    const tapCoin = document.getElementById('tap-coin');
    
    if (tapCoin) {
        tapCoin.addEventListener('click', (e) => {
            if (state.energy <= 0) return;

            const tapValue = 1;
            state.energy = Math.max(0, state.energy - tapValue);
            state.balance += tapValue;
            state.totalTap += tapValue;
            state.xp += tapValue;
            state.pendingTaps += tapValue;

            // Level up logic (Every 1000 XP increases level by 1)
            const calculatedLevel = Math.floor(state.xp / 1000) + 1;
            if (calculatedLevel > state.level) {
                state.level = calculatedLevel;
            }

            updateUI();
            triggerTapAnimation(e, tapCoin);
        });
    }

    // Bottom Navigation Bar Items Switching Logic
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            const tabName = item.getAttribute('data-tab');
            switchTab(tabName);
        });
    });

    // Top Right Rank Button Click Handler
    const topRankBtn = document.querySelector('.top-rank-btn');
    if (topRankBtn) {
        topRankBtn.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            switchTab('leaderboard');
        });
    }

    // Quick Boost Button from Home Page
    const boostQuickBtn = document.querySelector('.boost-quick-btn');
    if (boostQuickBtn) {
        boostQuickBtn.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            switchTab('boost');
        });
    }

    // Referral Link Copy Button
    const inviteBtn = document.getElementById('invite-btn');
    if (inviteBtn) {
        inviteBtn.addEventListener('click', () => {
            const botUsername = "ZoryxMiniBot"; // Your bot username
            const refLink = `https://t.me/${botUsername}?start=${state.telegramId}`;
            navigator.clipboard.writeText(refLink).then(() => {
                alert("Referral link copied to clipboard!");
            }).catch(err => {
                console.error("Failed to copy link", err);
            });
        });
    }
}

function switchTab(tabName) {
    const views = document.querySelectorAll('.view-section');
    views.forEach(view => {
        view.classList.remove('active');
    });

    const activeView = document.getElementById(`view-${tabName}`);
    if (activeView) {
        activeView.classList.add('active');
    }

    if (tabName === 'leaderboard') {
        fetchLeaderboardData();
    }
}

async function fetchLeaderboardData() {
    const listContainer = document.getElementById('leaderboard-list');
    if (!listContainer) return;

    try {
        listContainer.innerHTML = 'Loading elite rankings...';
        const res = await getLeaderboard();
        if (res && res.success && res.data) {
            let html = '<ul style="list-style: none; padding: 0;">';
            res.data.forEach((user, index) => {
                html += `<li style="padding: 12px 10px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 700;">#${index + 1} ${user.username || user.firstName || 'VIP Player'}</span>
                    <span style="color: #fbbf24; font-weight: 800;">🪙 ${user.balance.toLocaleString()}</span>
                </li>`;
            });
            html += '</ul>';
            listContainer.innerHTML = html;
        } else {
            listContainer.innerHTML = 'No rankings available.';
        }
    } catch (err) {
        listContainer.innerHTML = 'Failed to load leaderboard.';
    }
}

function triggerTapAnimation(event, container) {
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const floatText = document.createElement('div');
    floatText.textContent = '+1';
    floatText.style.position = 'absolute';
    floatText.style.left = `${x}px`;
    floatText.style.top = `${y}px`;
    floatText.style.color = '#fbbf24';
    floatText.style.fontWeight = '900';
    floatText.style.fontSize = '24px';
    floatText.style.pointerEvents = 'none';
    floatText.style.transition = 'transform 0.6s ease, opacity 0.6s ease';
    floatText.style.zIndex = '100';
    
    container.appendChild(floatText);

    setTimeout(() => {
        floatText.style.transform = 'translateY(-70px)';
        floatText.style.opacity = '0';
    }, 20);

    setTimeout(() => {
        floatText.remove();
    }, 600);
}

function startAutoRefreshAndSync() {
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
                state.pendingTaps += tapsToSend;
            } finally {
                state.isSaving = false;
            }
        }
    }, 3000);

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
