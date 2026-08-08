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
    userSelectedPlatform: 'telegram_channel',
    activePlatformFilter: 'all',
    activeLbTab: 'tasks',
    activeActivityCat: 'invite',
    weeklyTimerInterval: null,
  };

  async function api(path, opts = {}) {
    const res = await fetch(`/api${path}`, {
      method: opts.method || 'GET',
      headers: { 'Content-Type': 'application/json', 'X-Telegram-Init-Data': initData },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  }

  let toastTimer;
  function showToast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.add('hidden'), 2600);
  }

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  // ================= Navigation =================
  function navigate(page) {
    document.querySelectorAll('.page').forEach((p) => p.classList.remove('active'));
    document.getElementById(`page-${page}`).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach((b) => b.classList.toggle('active', b.dataset.nav === page));
    if (page === 'tasks') loadTasks();
    if (page === 'rank') { loadStats(); loadLeaderboard(); }
    if (page === 'activity') loadAchievements();
  }
  document.querySelectorAll('[data-nav]').forEach((btn) => {
    btn.addEventListener('click', () => {
      navigate(btn.dataset.nav);
      if (btn.dataset.openWithdraw) openWithdrawModal();
    });
  });

  // ================= Ticker =================
  const TICKER_NAMES = ['J***6', 'T***E', 'L***6', 'S***A', 'E***1', 'M***y', 'CI***s', 'Am***2', 'R***k', 'F***a'];
  function randomAmount() { return (Math.random() * 4.5 + 0.4).toFixed(3); }
  function tickTicker() {
    const name = TICKER_NAMES[Math.floor(Math.random() * TICKER_NAMES.length)];
    const el = document.getElementById('tickerText');
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = '';
    el.textContent = `💰 ${name} ${I18N.t('justWithdrew')} ${randomAmount()} USDT`;
  }
  setInterval(tickTicker, 3800);

  // ================= Load current user =================
  async function loadMe() {
    const me = await api('/me');
    state.me = me;

    const fullName = `${me.firstName || ''} ${me.lastName || ''}`.trim() || 'Player';
    document.getElementById('userName').textContent = fullName;
    document.getElementById('userName2').textContent = fullName;
    document.getElementById('userUsername').textContent = me.username ? `@${me.username}` : '';
    const avatarUrl = me.photoUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + me.telegramId;
    document.getElementById('userPhoto').src = avatarUrl;
    document.getElementById('userPhoto2').src = avatarUrl;

    document.getElementById('coinBalance').textContent = me.coins.toFixed(1).replace(/\.0$/, '');
    document.getElementById('usdtBalance').textContent = me.usdtBalance.toFixed(2);
    document.getElementById('referralCountHome').textContent = me.referralCount;
    document.getElementById('tasksDoneHome').textContent = me.completedTasksCount;
    document.getElementById('walletUSDT').textContent = me.usdtBalance.toFixed(3);

    document.getElementById('checkinStreak').textContent = me.checkInStreak;
    document.getElementById('checkinStreak2').textContent = me.checkInStreak;
    document.getElementById('checkinReward').textContent = me.dailyCheckInReward;
    document.getElementById('checkinReward2').textContent = me.dailyCheckInReward;
    const checkinUsdt = (me.dailyCheckInReward * me.coinToUsdtRate).toFixed(2);
    document.getElementById('checkinRewardUsdt').textContent = checkinUsdt;
    document.getElementById('checkinRewardUsdt2').textContent = checkinUsdt;
    setCheckinButtons(me.canCheckInToday);

    document.getElementById('addTaskFab').classList.toggle('hidden', !me.isAdmin);
    document.getElementById('pendingTasksBtn').classList.toggle('hidden', !me.isAdmin);
    if (me.isAdmin) refreshPendingCount();

    document.getElementById('taskNotifLink').href = me.officialChannel;
    document.getElementById('announcementsLink').href = me.officialChannel;
    document.getElementById('communityLink').href = me.communityChannel;

    if (!me.language) {
      document.getElementById('langModal').classList.remove('hidden');
    } else {
      await I18N.load(me.language);
    }
  }

  function setCheckinButtons(canCheckIn) {
    [document.getElementById('checkinBtn'), document.getElementById('checkinBtn2')].forEach((btn) => {
      btn.disabled = !canCheckIn;
      btn.textContent = canCheckIn ? I18N.t('checkIn') : '✔ ' + I18N.t('completed');
    });
  }

  async function doCheckIn() {
    try {
      const result = await api('/checkin', { method: 'POST' });
      document.getElementById('coinBalance').textContent = result.coins.toFixed(1).replace(/\.0$/, '');
      document.getElementById('usdtBalance').textContent = result.usdtBalance.toFixed(2);
      document.getElementById('checkinStreak').textContent = result.checkInStreak;
      document.getElementById('checkinStreak2').textContent = result.checkInStreak;
      setCheckinButtons(false);
      showToast(`🎉 +${result.rewarded} ZX`);
    } catch (e) {
      showToast(e.message);
    }
  }
  document.getElementById('checkinBtn').addEventListener('click', doCheckIn);
  document.getElementById('checkinBtn2').addEventListener('click', doCheckIn);

  // ================= Language =================
  document.getElementById('langBtn').addEventListener('click', () => document.getElementById('langModal').classList.remove('hidden'));
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
    btn.addEventListener('click', () => document.getElementById(btn.dataset.close).classList.add('hidden'));
  });

  // ================= Tasks =================
  const PLATFORM_ICON = {
    telegram_channel: '✈️', telegram_bot: '🤖', discord: '🎮', youtube: '▶️',
    tiktok: '🎵', facebook: '📘', twitter: '🐦', instagram: '📷', website: '🌐',
  };

  function renderTaskCard(task, showAdminControls) {
    const icon = PLATFORM_ICON[task.platform] || '🌐';
    let actionHtml = '';
    if (task.status === 'completed') {
      actionHtml = `<button class="task-action-btn done" disabled>✔ ${I18N.t('completed')}</button>`;
    } else if (task.status === 'started') {
      actionHtml = `<button class="task-action-btn check" data-check="${task.id}">${I18N.t('check')}</button>`;
    } else {
      actionHtml = `<button class="task-action-btn go" data-go="${task.id}" data-url="${task.url}">${I18N.t('go')}</button>`;
    }
    const deleteHtml = showAdminControls
      ? `<button class="task-delete-btn" data-delete="${task.id}" title="${I18N.t('delete')}">🗑</button>`
      : '';
    const card = document.createElement('div');
    card.className = 'task-card';
    card.dataset.platform = task.platform;
    card.dataset.title = task.title.toLowerCase();
    card.innerHTML = `
      <div class="task-badge">${I18N.t('mustDoTag')}</div>
      <div class="task-icon">${icon}</div>
      <div class="task-info"><h4>${escapeHtml(task.title)}</h4><span>+${task.rewardCoins} 🪙</span></div>
      ${actionHtml}
      ${deleteHtml}
    `;
    return card;
  }

  function attachTaskHandlers(container) {
    container.querySelectorAll('[data-go]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const taskId = btn.dataset.go;
        const url = btn.dataset.url;
        try {
          await api('/tasks/go', { method: 'POST', body: { taskId } });
          if (tg && tg.openTelegramLink && /t\.me\//.test(url)) tg.openTelegramLink(url);
          else if (tg && tg.openLink) tg.openLink(url, { try_instant_view: false });
          else window.open(url, '_blank');
          loadTasks();
        } catch (e) { showToast(e.message); }
      });
    });
    container.querySelectorAll('[data-check]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const taskId = btn.dataset.check;
        try {
          const result = await api('/tasks/check', { method: 'POST', body: { taskId } });
          if (result.status === 'completed') {
            showToast(`🎉 +${result.rewardCoins || 0} 🪙`);
            document.getElementById('coinBalance').textContent = result.coins.toFixed(1).replace(/\.0$/, '');
            document.getElementById('usdtBalance').textContent = result.usdtBalance.toFixed(2);
            loadTasks();
          }
        } catch (e) { showToast(e.message); }
      });
    });
    container.querySelectorAll('[data-delete]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const taskId = btn.dataset.delete;
        if (!window.confirm(I18N.t('confirmDeleteTask'))) return;
        try {
          await api(`/tasks/${taskId}`, { method: 'DELETE' });
          showToast(I18N.t('taskDeleted'));
          loadTasks();
        } catch (e) { showToast(e.message); }
      });
    });
  }

  async function loadTasks() {
    const listEl = document.getElementById('taskList');
    listEl.innerHTML = `<p class="muted">${I18N.t('loading')}</p>`;
    const { tasks } = await api('/tasks');
    state.tasks = tasks;

    const previewEl = document.getElementById('homeTaskPreview');
    previewEl.innerHTML = '';
    tasks.slice(0, 3).forEach((t) => previewEl.appendChild(renderTaskCard(t, false)));
    attachTaskHandlers(previewEl);

    renderFilteredTasks();
  }

  function renderFilteredTasks() {
    const listEl = document.getElementById('taskList');
    const query = (document.getElementById('taskSearchInput').value || '').toLowerCase();
    const filtered = state.tasks.filter((t) => {
      const platformMatch = state.activePlatformFilter === 'all' || t.platform === state.activePlatformFilter;
      const searchMatch = !query || t.title.toLowerCase().includes(query);
      return platformMatch && searchMatch;
    });

    if (!filtered.length) {
      listEl.innerHTML = `<p class="muted">${I18N.t('noTasks')}</p>`;
      return;
    }
    const isAdmin = !!(state.me && state.me.isAdmin);
    listEl.innerHTML = '';
    filtered.forEach((t) => listEl.appendChild(renderTaskCard(t, isAdmin)));
    attachTaskHandlers(listEl);
  }

  document.getElementById('taskSearchInput').addEventListener('input', renderFilteredTasks);
  document.querySelectorAll('#platformChips .chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#platformChips .chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      state.activePlatformFilter = chip.dataset.filter;
      renderFilteredTasks();
    });
  });

  // ================= Add Task (admin, free) =================
  document.getElementById('addTaskFab').addEventListener('click', () => document.getElementById('addTaskModal').classList.remove('hidden'));
  document.querySelectorAll('#platformSwitcher .platform-opt').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#platformSwitcher .platform-opt').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.selectedPlatform = btn.dataset.platform;
    });
  });
  document.getElementById('submitTaskBtn').addEventListener('click', async () => {
    const title = document.getElementById('taskTitleInput').value.trim();
    const url = document.getElementById('taskUrlInput').value.trim();
    const rewardCoins = document.getElementById('taskRewardInput').value;
    if (!title || !url) return showToast(I18N.t('fillAllFields'));
    try {
      await api('/tasks', { method: 'POST', body: { title, url, platform: state.selectedPlatform, rewardCoins } });
      showToast(I18N.t('taskAdded'));
      document.getElementById('addTaskModal').classList.add('hidden');
      document.getElementById('taskTitleInput').value = '';
      document.getElementById('taskUrlInput').value = '';
      document.getElementById('taskRewardInput').value = 1;
      loadTasks();
    } catch (e) { showToast(e.message); }
  });

  // ================= User Paid Task Submission =================
  document.getElementById('userAddTaskFab').addEventListener('click', async () => {
    try {
      const info = await api('/tasks/payment-info');
      document.getElementById('payNetwork').textContent = info.network;
      document.getElementById('payAddress').textContent = info.address;
    } catch (e) {}
    document.getElementById('userTaskModal').classList.remove('hidden');
  });
  document.querySelectorAll('#userPlatformSwitcher .platform-opt').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#userPlatformSwitcher .platform-opt').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.userSelectedPlatform = btn.dataset.platform;
    });
  });
  function updateBudgetPreview() {
    const reward = Number(document.getElementById('userTaskRewardInput').value) || 0;
    const slots = Number(document.getElementById('userTaskSlotsInput').value) || 0;
    const totalCoins = reward * slots;
    const totalUsdt = (totalCoins * (state.me ? state.me.coinToUsdtRate : 0.1)).toFixed(2);
    document.getElementById('budgetPreview').textContent = `${I18N.t('totalBudget')}: ${totalCoins.toFixed(1)} ZX (~$${totalUsdt})`;
  }
  document.getElementById('userTaskRewardInput').addEventListener('input', updateBudgetPreview);
  document.getElementById('userTaskSlotsInput').addEventListener('input', updateBudgetPreview);
  document.getElementById('copyPayAddressBtn').addEventListener('click', () => {
    const addr = document.getElementById('payAddress').textContent;
    navigator.clipboard?.writeText(addr).catch(() => {});
    showToast(I18N.t('linkCopied'));
  });
  document.getElementById('submitUserTaskBtn').addEventListener('click', async () => {
    const title = document.getElementById('userTaskTitleInput').value.trim();
    const url = document.getElementById('userTaskUrlInput').value.trim();
    const rewardCoins = document.getElementById('userTaskRewardInput').value;
    const maxCompletions = document.getElementById('userTaskSlotsInput').value;
    if (!title || !url) return showToast(I18N.t('fillAllFields'));
    try {
      await api('/tasks/submit', { method: 'POST', body: { title, url, platform: state.userSelectedPlatform, rewardCoins, maxCompletions } });
      showToast(I18N.t('taskSubmitted'));
      document.getElementById('userTaskModal').classList.add('hidden');
    } catch (e) { showToast(e.message); }
  });

  // ================= Admin: Pending Paid Tasks =================
  async function refreshPendingCount() {
    try {
      const { tasks } = await api('/tasks/pending');
      document.getElementById('pendingCount').textContent = tasks.length;
    } catch (e) {}
  }
  document.getElementById('pendingTasksBtn').addEventListener('click', async () => {
    const listEl = document.getElementById('pendingTasksList');
    listEl.innerHTML = `<p class="muted">${I18N.t('loading')}</p>`;
    document.getElementById('pendingTasksModal').classList.remove('hidden');
    try {
      const { tasks } = await api('/tasks/pending');
      if (!tasks.length) {
        listEl.innerHTML = `<p class="muted">${I18N.t('noPendingTasks')}</p>`;
        return;
      }
      listEl.innerHTML = '';
      tasks.forEach((t) => {
        const div = document.createElement('div');
        div.className = 'pending-task-item';
        div.innerHTML = `
          <h4>${escapeHtml(t.title)}</h4>
          <p>${PLATFORM_ICON[t.platform] || '🌐'} ${t.platform} · ${t.rewardCoins} ZX x ${t.maxCompletions} = ${t.budgetCoins.toFixed(1)} ZX (~$${t.budgetUSDT})</p>
          <p>Sponsor: ${t.sponsorTelegramId}</p>
          <div class="pending-task-actions">
            <button class="approve-btn" data-approve="${t.id}">✅ ${I18N.t('approve')}</button>
            <button class="reject-btn" data-reject="${t.id}">❌ ${I18N.t('reject')}</button>
          </div>
        `;
        listEl.appendChild(div);
      });
      listEl.querySelectorAll('[data-approve]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          try {
            await api(`/tasks/pending/${btn.dataset.approve}/approve`, { method: 'POST' });
            showToast('✅');
            document.getElementById('pendingTasksBtn').click();
            refreshPendingCount();
            loadTasks();
          } catch (e) { showToast(e.message); }
        });
      });
      listEl.querySelectorAll('[data-reject]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          try {
            await api(`/tasks/pending/${btn.dataset.reject}/reject`, { method: 'POST' });
            showToast('🗑');
            document.getElementById('pendingTasksBtn').click();
            refreshPendingCount();
          } catch (e) { showToast(e.message); }
        });
      });
    } catch (e) {
      listEl.innerHTML = `<p class="muted">${e.message}</p>`;
    }
  });

  // ================= Rank / Friends =================
  document.getElementById('copyLinkBtn').addEventListener('click', () => {
    const input = document.getElementById('referralLinkInput');
    input.select();
    navigator.clipboard?.writeText(input.value).catch(() => document.execCommand('copy'));
    showToast(I18N.t('linkCopied'));
  });
  document.getElementById('shareLinkBtn').addEventListener('click', () => {
    const link = document.getElementById('referralLinkInput').value;
    const shareText = '🚀 Join ZORY X BOT and start earning ZX Coin today! Complete simple tasks, invite friends, and climb the leaderboard 🏆';
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(shareText)}`;
    if (tg && tg.openTelegramLink) tg.openTelegramLink(shareUrl);
    else window.open(shareUrl, '_blank');
  });

  async function loadStats() {
    try {
      const s = await api('/stats');
      document.getElementById('statTasks').textContent = s.totalTasks.toLocaleString();
      document.getElementById('statRewards').textContent = '$' + s.totalRewardsUSD.toLocaleString();
      document.getElementById('statUsers').textContent = s.totalUsers.toLocaleString();
      document.getElementById('statDays').textContent = s.runningDays + 'D';
    } catch (e) {}
    if (state.me) {
      document.getElementById('referralLinkInput').value = state.me.referralLink;
    }
  }

  document.querySelectorAll('.tab-row [data-lb]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-row [data-lb]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeLbTab = btn.dataset.lb;
      loadLeaderboard();
    });
  });

  function startWeeklyCountdown() {
    clearInterval(state.weeklyTimerInterval);
    const el = document.getElementById('weeklyCountdown');
    if (state.activeLbTab !== 'weekly') { el.classList.add('hidden'); return; }
    el.classList.remove('hidden');
    function tick() {
      const now = new Date();
      const day = now.getUTCDay();
      const daysUntilMonday = (8 - day) % 7 || 7;
      const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysUntilMonday));
      const diff = next.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000) % 24;
      const d = Math.floor(diff / 86400000);
      const m = Math.floor(diff / 60000) % 60;
      const s = Math.floor(diff / 1000) % 60;
      document.getElementById('weeklyTimer').textContent = `${d}d ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    tick();
    state.weeklyTimerInterval = setInterval(tick, 1000);
  }

  async function loadLeaderboard() {
    const listEl = document.getElementById('leaderboardList');
    listEl.innerHTML = `<p class="muted">${I18N.t('loading')}</p>`;
    startWeeklyCountdown();
    const rows = await api(`/leaderboard?type=${state.activeLbTab}`);
    listEl.innerHTML = '';
    const unit = state.activeLbTab === 'invites' ? '' : ' USDT';
    rows.forEach((r) => {
      const row = document.createElement('div');
      row.className = 'lb-row' + (r.isYou ? ' you' : '');
      const rankClass = r.rank === 1 ? 'top1' : r.rank === 2 ? 'top2' : r.rank === 3 ? 'top3' : '';
      const medal = r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : r.rank;
      row.innerHTML = `
        <div class="lb-rank ${rankClass}">${medal}</div>
        <img class="lb-avatar" src="${r.photoUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + r.name}" />
        <div class="lb-name">${escapeHtml(r.name)}</div>
        <div class="lb-coins">${r.value}${unit}</div>
      `;
      listEl.appendChild(row);
    });
  }

  // ================= Activity =================
  document.querySelectorAll('#page-activity .tab-row [data-activity]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#page-activity .tab-row [data-activity]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.activity-tab').forEach((t) => t.classList.remove('active'));
      document.getElementById(`activity-${btn.dataset.activity}`).classList.add('active');
    });
  });
  document.querySelectorAll('.sub-tab-row .sub-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sub-tab-row .sub-tab').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeActivityCat = btn.dataset.cat;
      renderAchievements();
    });
  });

  let cachedAchievements = [];
  async function loadAchievements() {
    const data = await api('/achievements');
    cachedAchievements = data.achievements;
    document.getElementById('achDone').textContent = data.completedCount;
    document.getElementById('achTotal').textContent = data.totalCount;
    renderAchievements();
  }
  function renderAchievements() {
    const listEl = document.getElementById('achievementList');
    const filtered = cachedAchievements.filter((a) => a.category === state.activeActivityCat);
    listEl.innerHTML = '';
    filtered.forEach((a) => {
      const pct = Math.min(100, Math.round((a.progress / a.target) * 100));
      const div = document.createElement('div');
      div.className = 'achievement-card';
      const btnLabel = a.claimed ? '✔ ' + I18N.t('claimed') : a.claimable ? I18N.t('claim') : `${a.progress}/${a.target}`;
      const usdtReward = (a.rewardCoins * (state.me ? state.me.coinToUsdtRate : 0.1)).toFixed(2);
      div.innerHTML = `
        <div class="ach-top">
          <span class="ach-icon">${a.icon}</span>
          <div class="ach-text"><strong>${I18N.t(a.titleKey)}</strong><small>${I18N.t(a.descKey)}</small></div>
          <span class="ach-reward">+${usdtReward} USDT<br/>+${a.rewardCoins} ZX</span>
        </div>
        <div class="ach-progress-bar"><div class="ach-progress-fill" style="width:${pct}%"></div></div>
        <div class="ach-bottom">
          <span class="muted small">${a.progress}/${a.target}</span>
          <button class="ach-claim-btn" data-claim="${a.id}" ${a.claimable ? '' : 'disabled'}>${btnLabel}</button>
        </div>
      `;
      listEl.appendChild(div);
    });
    listEl.querySelectorAll('[data-claim]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        try {
          const result = await api('/achievements/claim', { method: 'POST', body: { achievementId: btn.dataset.claim } });
          const rewardedUsdt = (result.rewarded * (state.me ? state.me.coinToUsdtRate : 0.1)).toFixed(2);
          showToast(`🎉 +${rewardedUsdt} USDT / +${result.rewarded} ZX`);
          document.getElementById('coinBalance').textContent = result.coins.toFixed(1).replace(/\.0$/, '');
          document.getElementById('usdtBalance').textContent = result.usdtBalance.toFixed(2);
          loadAchievements();
        } catch (e) { showToast(e.message); }
      });
    });
  }

  // ================= Watch Ad =================
  async function watchAdFlow() {
    try {
      if (typeof window.showMonetagRewardedAd === 'function') {
        await window.showMonetagRewardedAd();
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
      const result = await api('/ads/watch', { method: 'POST' });
      document.getElementById('coinBalance').textContent = result.coins.toFixed(1).replace(/\.0$/, '');
      document.getElementById('usdtBalance').textContent = result.usdtBalance.toFixed(2);
      showToast(I18N.t('adRewardMsg'));
    } catch (e) {
      showToast(e.message || I18N.t('adCooldownMsg'));
    }
  }
  document.getElementById('watchAdBtn').addEventListener('click', watchAdFlow);
  document.getElementById('watchAdHomeBtn').addEventListener('click', () => { navigate('tasks'); watchAdFlow(); });

  // ================= Withdraw =================
  async function openWithdrawModal() {
    document.getElementById('withdrawModal').classList.remove('hidden');
    try {
      const info = await api('/withdraw/info');
      document.getElementById('wdBalance').textContent = info.withdrawableUSDT.toFixed(3);
      document.getElementById('wdMin').textContent = `${info.minUSDT} USDT`;
      document.getElementById('wdAmountInput').dataset.max = info.withdrawableUSDT;
    } catch (e) {}
  }
  document.getElementById('openWithdrawBtn').addEventListener('click', openWithdrawModal);
  document.querySelectorAll('.tab-row [data-wtab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#withdrawModal .tab-row [data-wtab]').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.withdraw-tab').forEach((t) => t.classList.remove('active'));
      document.getElementById(`withdrawTab-${btn.dataset.wtab}`).classList.add('active');
      if (btn.dataset.wtab === 'history') loadWithdrawHistory();
    });
  });
  document.getElementById('wdMaxBtn').addEventListener('click', () => {
    const max = document.getElementById('wdAmountInput').dataset.max || '0';
    document.getElementById('wdAmountInput').value = max;
    document.getElementById('wdArrival').textContent = `${Number(max).toFixed(3)} USDT`;
  });
  document.getElementById('wdAmountInput').addEventListener('input', (e) => {
    const val = Number(e.target.value) || 0;
    document.getElementById('wdArrival').textContent = `${val.toFixed(3)} USDT`;
  });
  document.getElementById('submitWithdrawBtn').addEventListener('click', async () => {
    const amountUSDT = document.getElementById('wdAmountInput').value;
    const recipientAddress = document.getElementById('wdAddressInput').value.trim();
    try {
      const result = await api('/withdraw', { method: 'POST', body: { amountUSDT, recipientAddress } });
      showToast(I18N.t('withdrawSubmitted'));
      document.getElementById('coinBalance').textContent = result.coins.toFixed(1).replace(/\.0$/, '');
      document.getElementById('usdtBalance').textContent = result.usdtBalance.toFixed(2);
      document.getElementById('walletUSDT').textContent = result.usdtBalance.toFixed(3);
      document.getElementById('wdAmountInput').value = '';
      document.getElementById('wdAddressInput').value = '';
      openWithdrawModal();
    } catch (e) { showToast(e.message); }
  });
  async function loadWithdrawHistory() {
    const listEl = document.getElementById('withdrawHistoryList');
    listEl.innerHTML = `<p class="muted">${I18N.t('loading')}</p>`;
    const list = await api('/withdraw/history');
    if (!list.length) { listEl.innerHTML = `<p class="muted">${I18N.t('noWithdrawals')}</p>`; return; }
    listEl.innerHTML = '';
    list.forEach((w) => {
      const div = document.createElement('div');
      div.className = 'wh-item';
      div.innerHTML = `
        <div><strong>${w.amountUSDT} USDT</strong><br/><small class="muted">${new Date(w.createdAt).toLocaleDateString()}</small></div>
        <span class="wh-status ${w.status}">${w.status.toUpperCase()}</span>
      `;
      listEl.appendChild(div);
    });
  }

  // ================= Boot =================
  (async function init() {
    try {
      await I18N.load('bn');
      await loadMe();
      const cfg = await api('/config');
      state.monetagZoneId = cfg.monetagZoneId;
      tickTicker();
      await loadStats();
    } catch (e) {
      console.error(e);
      showToast('Failed to load. Please reopen the app.');
    } finally {
      document.getElementById('loadingScreen').classList.add('fade-out');
      document.getElementById('app').classList.remove('hidden');
      setTimeout(() => document.getElementById('loadingScreen').remove(), 500);
    }
  })();
})();
