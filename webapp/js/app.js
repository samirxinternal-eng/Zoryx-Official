(function () {
  const tg = window.Telegram ? window.Telegram.WebApp : null;
  if (tg) {
    tg.ready();
    tg.expand();
    try { tg.setHeaderColor('#1a1035'); } catch (e) {}
  }

  const initData = tg ? tg.initData : '';
  let state = {
    me: null,
    tasks: [],
    monetagZoneId: '',
    selectedPlatform: 'telegram_channel',
  };

  // ================= API helper =================
  async function api(path, opts = {}) {
    const res = await fetch(`/api${path}`, {
      method: opts.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Telegram-Init-Data': initData,
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  }

  // ================= Toast =================
  let toastTimer;
  function showToast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.add('hidden'), 2600);
  }

  // ================= Navigation =================
  function navigate(page) {
    document.querySelectorAll('.page').forEach((p) => p.classList.remove('active'));
    document.getElementById(`page-${page}`).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach((b) => b.classList.toggle('active', b.dataset.nav === page));
    if (page === 'earn') loadTasks();
    if (page === 'leaderboard') loadLeaderboard();
    if (page === 'friends') loadFriends();
  }

  document.querySelectorAll('[data-nav]').forEach((btn) => {
    btn.addEventListener('click', () => navigate(btn.dataset.nav));
  });

  // ================= Load current user =================
  async function loadMe() {
    const me = await api('/me');
    state.me = me;

    document.getElementById('userName').textContent = `${me.firstName || ''} ${me.lastName || ''}`.trim() || 'Player';
    document.getElementById('userUsername').textContent = me.username ? `@${me.username}` : '';
    document.getElementById('userPhoto').src = me.photoUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + me.telegramId;
    document.getElementById('coinBalance').textContent = me.coins;
    document.getElementById('energyBalance').textContent = me.energy;
    document.getElementById('referralCountHome').textContent = me.referralCount;

    document.getElementById('addTaskFab').classList.toggle('hidden', !me.isAdmin);

    if (!me.language) {
      document.getElementById('langModal').classList.remove('hidden');
    } else {
      await I18N.load(me.language);
    }
  }

  // ================= Language =================
  document.getElementById('langBtn').addEventListener('click', () => {
    document.getElementById('langModal').classList.remove('hidden');
  });

  document.querySelectorAll('.lang-option').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const lang = btn.dataset.lang;
      await api('/language', { method: 'POST', body: { lang } });
      await I18N.load(lang);
      document.getElementById('langModal').classList.add('hidden');
      showToast('✅');
    });
  });

  document.querySelectorAll('[data-close]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.getElementById(btn.dataset.close).classList.add('hidden');
    });
  });

  // ================= Tasks (Earn) =================
  const PLATFORM_ICON = {
    telegram_channel: '✈️',
    telegram_bot: '🤖',
    discord: '🎮',
    youtube: '▶️',
    tiktok: '🎵',
    facebook: '📘',
    twitter: '🐦',
    instagram: '📷',
    website: '🌐',
  };

  async function loadTasks() {
    const listEl = document.getElementById('taskList');
    listEl.innerHTML = `<p class="muted">${I18N.t('loading')}</p>`;
    const { tasks } = await api('/tasks');
    state.tasks = tasks;

    if (!tasks.length) {
      listEl.innerHTML = `<p class="muted">${I18N.t('noTasks')}</p>`;
      return;
    }

    listEl.innerHTML = '';
    tasks.forEach((task) => {
      const card = document.createElement('div');
      card.className = 'task-card';

      const icon = PLATFORM_ICON[task.platform] || '🌐';
      let actionHtml = '';
      if (task.status === 'completed') {
        actionHtml = `<button class="task-action-btn done" disabled>✔ ${I18N.t('completed')}</button>`;
      } else if (task.status === 'started') {
        actionHtml = `<button class="task-action-btn check" data-check="${task.id}">${I18N.t('check')}</button>`;
      } else {
        actionHtml = `<button class="task-action-btn go" data-go="${task.id}" data-url="${task.url}">${I18N.t('go')}</button>`;
      }

      card.innerHTML = `
        <div class="task-icon">${icon}</div>
        <div class="task-info">
          <h4>${escapeHtml(task.title)}</h4>
          <span>+${task.rewardCoins} 🪙</span>
        </div>
        ${actionHtml}
      `;
      listEl.appendChild(card);
    });

    listEl.querySelectorAll('[data-go]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const taskId = btn.dataset.go;
        const url = btn.dataset.url;
        try {
          await api('/tasks/go', { method: 'POST', body: { taskId } });
          if (tg && tg.openTelegramLink && /t\.me\//.test(url)) {
            tg.openTelegramLink(url);
          } else if (tg && tg.openLink) {
            tg.openLink(url, { try_instant_view: false });
          } else {
            window.open(url, '_blank');
          }
          loadTasks();
        } catch (e) {
          showToast(e.message);
        }
      });
    });

    listEl.querySelectorAll('[data-check]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const taskId = btn.dataset.check;
        try {
          const result = await api('/tasks/check', { method: 'POST', body: { taskId } });
          if (result.status === 'completed') {
            showToast(`🎉 +${result.rewardCoins || 0} 🪙`);
            document.getElementById('coinBalance').textContent = result.coins;
            loadTasks();
          }
        } catch (e) {
          showToast(e.message);
        }
      });
    });
  }

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  // ================= Add Task (admin) =================
  document.getElementById('addTaskFab').addEventListener('click', () => {
    document.getElementById('addTaskModal').classList.remove('hidden');
  });

  document.querySelectorAll('.platform-opt').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.platform-opt').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.selectedPlatform = btn.dataset.platform;
    });
  });

  document.getElementById('submitTaskBtn').addEventListener('click', async () => {
    const title = document.getElementById('taskTitleInput').value.trim();
    const url = document.getElementById('taskUrlInput').value.trim();
    const rewardCoins = document.getElementById('taskRewardInput').value;

    if (!title || !url) {
      showToast(I18N.t('fillAllFields'));
      return;
    }

    try {
      await api('/tasks', {
        method: 'POST',
        body: { title, url, platform: state.selectedPlatform, rewardCoins },
      });
      showToast(I18N.t('taskAdded'));
      document.getElementById('addTaskModal').classList.add('hidden');
      document.getElementById('taskTitleInput').value = '';
      document.getElementById('taskUrlInput').value = '';
      document.getElementById('taskRewardInput').value = 10;
      loadTasks();
    } catch (e) {
      showToast(e.message);
    }
  });

  // ================= Friends =================
  async function loadFriends() {
    const me = state.me || (await api('/me'));
    document.getElementById('referralLinkInput').value = me.referralLink;
    document.getElementById('referralCountFriends').textContent = me.referralCount;
  }

  document.getElementById('copyLinkBtn').addEventListener('click', () => {
    const input = document.getElementById('referralLinkInput');
    input.select();
    navigator.clipboard?.writeText(input.value).catch(() => document.execCommand('copy'));
    showToast(I18N.t('linkCopied'));
  });

  document.getElementById('shareLinkBtn').addEventListener('click', () => {
    const link = document.getElementById('referralLinkInput').value;
    const shareText =
      '🚀 Join ZORY X BOT and start earning coins today! Complete simple tasks, invite friends, and climb the leaderboard 🏆';
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(shareText)}`;
    if (tg && tg.openTelegramLink) {
      tg.openTelegramLink(shareUrl);
    } else {
      window.open(shareUrl, '_blank');
    }
  });

  // ================= Leaderboard =================
  async function loadLeaderboard() {
    const listEl = document.getElementById('leaderboardList');
    listEl.innerHTML = `<p class="muted">${I18N.t('loading')}</p>`;
    const rows = await api('/leaderboard');
    listEl.innerHTML = '';
    rows.forEach((r) => {
      const row = document.createElement('div');
      row.className = 'lb-row' + (r.isYou ? ' you' : '');
      const rankClass = r.rank === 1 ? 'top1' : r.rank === 2 ? 'top2' : r.rank === 3 ? 'top3' : '';
      const medal = r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : r.rank;
      row.innerHTML = `
        <div class="lb-rank ${rankClass}">${medal}</div>
        <img class="lb-avatar" src="${r.photoUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + r.name}" />
        <div class="lb-name">${escapeHtml(r.name)}</div>
        <div class="lb-coins">${r.coins} 🪙</div>
      `;
      listEl.appendChild(row);
    });
  }

  // ================= Watch Ad =================
  async function watchAdFlow() {
    // If Monetag SDK is present (loaded via zone script), trigger its rewarded interstitial.
    // Function name pattern depends on the Monetag zone script you add in index.html.
    // Falls back to a short simulated delay if no ad SDK function is available.
    try {
      if (typeof window.showMonetagRewardedAd === 'function') {
        await window.showMonetagRewardedAd();
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
      const result = await api('/ads/watch', { method: 'POST' });
      document.getElementById('coinBalance').textContent = result.coins;
      document.getElementById('energyBalance').textContent = result.energy;
      showToast(I18N.t('adRewardMsg'));
    } catch (e) {
      showToast(e.message || I18N.t('adCooldownMsg'));
    }
  }
  document.getElementById('watchAdBtn').addEventListener('click', watchAdFlow);
  document.getElementById('watchAdHomeBtn').addEventListener('click', () => {
    navigate('earn');
    watchAdFlow();
  });

  // ================= Boot =================
  (async function init() {
    try {
      await I18N.load('bn'); // default until we know the user's saved language
      await loadMe();
      const cfg = await api('/config');
      state.monetagZoneId = cfg.monetagZoneId;
    } catch (e) {
      console.error(e);
      showToast('Failed to load. Please reopen the app.');
    }
  })();
})();
