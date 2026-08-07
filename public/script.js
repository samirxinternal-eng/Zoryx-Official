const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  tg.setHeaderColor?.('#0b0a14');
  tg.setBackgroundColor?.('#0b0a14');
}

const initData = tg?.initData || '';
const RING_CIRCUMFERENCE = 628;
const LEVEL_STEP = 1000; // coins needed per level

let currentUser = null;
let monetagZoneId = null;

async function loadAdSdk() {
  try {
    const config = await api('/config');
    monetagZoneId = config.monetagZoneId;
    if (!monetagZoneId) return; // not configured yet — button just won't work

    const script = document.createElement('script');
    script.src = '//libtl.com/sdk.js';
    script.dataset.zone = monetagZoneId;
    script.dataset.sdk = `show_${monetagZoneId}`;
    document.body.appendChild(script);
  } catch (err) {
    console.error('Ad SDK failed to load', err);
  }
}

async function watchAd() {
  const btn = document.getElementById('watch-ad-btn');

  if (!monetagZoneId) {
    return tg?.showAlert?.('Ads are not set up yet.') ?? alert('Ads are not set up yet.');
  }

  const showAdFn = window[`show_${monetagZoneId}`];
  if (typeof showAdFn !== 'function') {
    return tg?.showAlert?.('Ad not ready — try again in a moment.');
  }

  const original = btn.textContent;
  btn.textContent = '...';
  btn.disabled = true;

  try {
    await showAdFn(); // resolves once the rewarded ad has been watched fully
    const { coins } = await api('/ad/reward', { method: 'POST' });
    updateCoinDisplay(coins);
    spawnParticle();
  } catch (err) {
    // ad closed early, failed to load, or cooldown still active — no reward
    if (err?.message) tg?.showAlert ? tg.showAlert(err.message) : console.log(err.message);
  } finally {
    btn.textContent = original;
    btn.disabled = false;
  }
}

async function api(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Telegram-Init-Data': initData,
      ...(options.headers || {})
    }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

function updateCoinDisplay(coins) {
  document.getElementById('coin-balance').textContent = coins.toLocaleString();

  const level = Math.floor(coins / LEVEL_STEP) + 1;
  const progress = (coins % LEVEL_STEP) / LEVEL_STEP;
  const offset = RING_CIRCUMFERENCE * (1 - progress);

  document.getElementById('level-number').textContent = level;
  document.getElementById('level-ring-fill').style.strokeDashoffset = offset;
}

function spawnParticle() {
  const field = document.getElementById('particle-field');
  const el = document.createElement('div');
  el.className = 'particle';
  el.textContent = '+1';
  el.style.left = `${45 + Math.random() * 10}%`;
  field.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

async function loadUser() {
  try {
    currentUser = await api('/user');
    updateCoinDisplay(currentUser.coins);
    document.getElementById('referral-count').textContent = `${currentUser.referralCount} joined`;
  } catch (err) {
    console.error('Could not load profile', err);
  }
}

async function handleTap() {
  spawnParticle();
  tg?.HapticFeedback?.impactOccurred?.('light');

  if (currentUser) {
    currentUser.coins += 1;
    updateCoinDisplay(currentUser.coins); // optimistic, corrected below
  }

  try {
    const { coins } = await api('/tap', { method: 'POST' });
    if (currentUser) currentUser.coins = coins;
    updateCoinDisplay(coins);
  } catch (err) {
    console.error('Tap failed', err);
  }
}

const TASK_TYPE_LABEL = {
  channel: '📢 Join channel',
  link: '🔗 Visit link',
  bot: '🤖 Try this bot'
};

function renderTasks(tasks) {
  const list = document.getElementById('task-list');

  if (tasks.length === 0) {
    list.innerHTML = `<div class="empty-state">No tasks yet — check back soon.</div>`;
    return;
  }

  list.innerHTML = tasks.map((t) => `
    <div class="task-card">
      <div class="task-card__info">
        <span class="task-card__type">${TASK_TYPE_LABEL[t.type] || TASK_TYPE_LABEL.link}</span>
        <span class="task-card__title">${escapeHtml(t.title)}</span>
        <span class="task-card__reward">+${t.reward} coins</span>
      </div>
      <div class="task-card__actions">
        <button class="btn btn--ghost" data-action="go" data-url="${escapeHtml(t.url)}">Go</button>
        <button class="btn btn--primary" data-action="claim" data-id="${t._id}">Claim</button>
      </div>
    </div>
  `).join('');
}

async function loadTasks() {
  try {
    renderTasks(await api('/tasks'));
  } catch (err) {
    console.error('Could not load tasks', err);
  }
}

async function claimTask(taskId, btn) {
  const original = btn.textContent;
  btn.textContent = '...';
  btn.disabled = true;

  try {
    const { coins } = await api(`/tasks/${taskId}/complete`, { method: 'POST' });
    if (currentUser) currentUser.coins = coins;
    updateCoinDisplay(coins);
    btn.textContent = 'Claimed';
    btn.closest('.task-card').style.opacity = '0.5';
  } catch (err) {
    btn.textContent = original;
    btn.disabled = false;
    tg?.showAlert ? tg.showAlert(err.message || 'Could not claim this task') : alert(err.message);
  }
}

function renderLeaderboard(users) {
  const list = document.getElementById('board-list');

  if (users.length === 0) {
    list.innerHTML = `<div class="empty-state">No one's tapped yet — be the first.</div>`;
    return;
  }

  list.innerHTML = users.map((u, i) => `
    <div class="board-row ${i < 3 ? 'is-top' : ''}">
      <span class="board-row__rank">#${i + 1}</span>
      <span class="board-row__name">${escapeHtml(u.firstName || u.username || 'Anonymous')}</span>
      <span class="board-row__coins">${u.coins.toLocaleString()}</span>
    </div>
  `).join('');
}

async function loadLeaderboard() {
  try {
    renderLeaderboard(await api('/leaderboard'));
  } catch (err) {
    console.error('Could not load leaderboard', err);
  }
}

// ---------- Tab navigation ----------
function switchView(name) {
  document.querySelectorAll('.view').forEach((v) => {
    v.hidden = v.id !== `view-${name}`;
  });
  document.querySelectorAll('.tabbar__item').forEach((item) => {
    item.classList.toggle('is-active', item.dataset.view === name);
  });

  if (name === 'tasks') loadTasks();
  if (name === 'leaderboard') loadLeaderboard();
}

document.querySelectorAll('.tabbar__item').forEach((item) => {
  item.addEventListener('click', () => switchView(item.dataset.view));
});

// ---------- Wire up ----------
document.getElementById('tap-orb').addEventListener('click', handleTap);

document.getElementById('task-list').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;

  if (btn.dataset.action === 'go') {
    tg?.openLink ? tg.openLink(btn.dataset.url) : window.open(btn.dataset.url, '_blank');
  }
  if (btn.dataset.action === 'claim') {
    claimTask(btn.dataset.id, btn);
  }
});

document.getElementById('copy-referral').addEventListener('click', async () => {
  if (!currentUser?.referralLink) return;
  try {
    await navigator.clipboard.writeText(currentUser.referralLink);
    tg?.showAlert ? tg.showAlert('Referral link copied!') : alert('Copied!');
  } catch (err) {
    tg?.showAlert?.(currentUser.referralLink);
  }
});

document.getElementById('watch-ad-btn').addEventListener('click', watchAd);

loadUser();
loadAdSdk();
