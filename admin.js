const elements = {
  loginPanel: document.getElementById("loginPanel"),
  dashboard: document.getElementById("dashboard"),
  loginForm: document.getElementById("loginForm"),
  adminPassword: document.getElementById("adminPassword"),
  loginMessage: document.getElementById("loginMessage"),
  refreshBtn: document.getElementById("refreshBtn"),
  logoutBtn: document.getElementById("logoutBtn"),
  lastUpdated: document.getElementById("lastUpdated"),
  statPlayers: document.getElementById("statPlayers"),
  statTelegram: document.getElementById("statTelegram"),
  statActive: document.getElementById("statActive"),
  statScore: document.getElementById("statScore"),
  statTop: document.getElementById("statTop"),
  statSessions: document.getElementById("statSessions"),
  statResonance: document.getElementById("statResonance"),
  badgeServer: document.getElementById("badgeServer"),
  badgeTelegram: document.getElementById("badgeTelegram"),
  badgeEvents: document.getElementById("badgeEvents"),
  dataBackend: document.getElementById("dataBackend"),
  dataStorage: document.getElementById("dataStorage"),
  dataRequested: document.getElementById("dataRequested"),
  dataMigration: document.getElementById("dataMigration"),
  dataSupabase: document.getElementById("dataSupabase"),
  dataExportCount: document.getElementById("dataExportCount"),
  exportDataBtn: document.getElementById("exportDataBtn"),
  mapReadiness: document.getElementById("mapReadiness"),
  pipeTelegram: document.getElementById("pipeTelegram"),
  pipeServer: document.getElementById("pipeServer"),
  pipeData: document.getElementById("pipeData"),
  pipeAdmin: document.getElementById("pipeAdmin"),
  metricTelegramLabel: document.getElementById("metricTelegramLabel"),
  metricTelegramBar: document.getElementById("metricTelegramBar"),
  metricActiveLabel: document.getElementById("metricActiveLabel"),
  metricActiveBar: document.getElementById("metricActiveBar"),
  metricZenLabel: document.getElementById("metricZenLabel"),
  metricZenBar: document.getElementById("metricZenBar"),
  metricEventsLabel: document.getElementById("metricEventsLabel"),
  metricEventsBar: document.getElementById("metricEventsBar"),
  actionTotal: document.getElementById("actionTotal"),
  actionFarm: document.getElementById("actionFarm"),
  actionLab: document.getElementById("actionLab"),
  actionZen: document.getElementById("actionZen"),
  actionStars: document.getElementById("actionStars"),
  actionSummary: document.getElementById("actionSummary"),
  paymentTotal: document.getElementById("paymentTotal"),
  paymentPaid: document.getElementById("paymentPaid"),
  paymentStars: document.getElementById("paymentStars"),
  paymentPending: document.getElementById("paymentPending"),
  paymentSupport: document.getElementById("paymentSupport"),
  paymentPlatformSplit: document.getElementById("paymentPlatformSplit"),
  paymentsTable: document.getElementById("paymentsTable"),
  botStarsStatus: document.getElementById("botStarsStatus"),
  botStarsBalance: document.getElementById("botStarsBalance"),
  botStarsAvailableAt: document.getElementById("botStarsAvailableAt"),
  botStarsTransactionCount: document.getElementById("botStarsTransactionCount"),
  botStarsUpdatedAt: document.getElementById("botStarsUpdatedAt"),
  botStarsTransactions: document.getElementById("botStarsTransactions"),
  roomsGrid: document.getElementById("roomsGrid"),
  playersTable: document.getElementById("playersTable"),
  eventsList: document.getElementById("eventsList")
};

let refreshTimer = null;

init();

async function init() {
  bindEvents();

  try {
    const session = await api("/api/admin/session");
    if (!session.configured) {
      showLogin("ADMIN_PASSWORD ще не налаштований на сервері Render.");
      elements.adminPassword.disabled = true;
      elements.loginForm.querySelector("button").disabled = true;
      return;
    }

    if (session.authenticated) {
      showDashboard();
      await loadOverview();
      startRefresh();
    } else {
      showLogin("Введи пароль, який буде стояти у Render як ADMIN_PASSWORD.");
    }
  } catch (error) {
    showLogin("Не вдалося підключитися до сервера адмінки.");
  }
}

function bindEvents() {
  elements.loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const password = elements.adminPassword.value.trim();
    if (!password) {
      showLogin("Введи пароль.");
      return;
    }

    elements.loginMessage.textContent = "Перевіряю пароль...";
    try {
      await api("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ password })
      });
      elements.adminPassword.value = "";
      showDashboard();
      await loadOverview();
      startRefresh();
    } catch (error) {
      showLogin("Пароль не підійшов.");
    }
  });

  elements.refreshBtn.addEventListener("click", loadOverview);

  elements.exportDataBtn.addEventListener("click", () => {
    window.open("/api/admin/export", "_blank", "noopener");
  });

  elements.logoutBtn.addEventListener("click", async () => {
    await api("/api/admin/logout", { method: "POST" }).catch(() => {});
    stopRefresh();
    showLogin("Ти вийшов з адмінки.");
  });
}

async function loadOverview() {
  elements.refreshBtn.disabled = true;
  try {
    const overview = await api("/api/admin/overview");
    renderOverview(overview);
  } catch (error) {
    if (error.status === 401) {
      stopRefresh();
      showLogin("Сесія закінчилась. Увійди ще раз.");
      return;
    }
    elements.lastUpdated.textContent = "Не вдалося оновити дані.";
  } finally {
    elements.refreshBtn.disabled = false;
  }
}

function renderOverview(overview) {
  const { stats } = overview;
  elements.lastUpdated.textContent = `Оновлено: ${formatDateTime(overview.generatedAt)}`;
  elements.statPlayers.textContent = formatNumber(stats.players);
  elements.statTelegram.textContent = `${formatNumber(stats.telegramPlayers)} Telegram, ${formatNumber(stats.guests)} guest`;
  elements.statActive.textContent = formatNumber(stats.active24h);
  elements.statScore.textContent = formatNumber(stats.totalScore);
  elements.statTop.textContent = `топ: ${formatNumber(stats.topScore)}`;
  elements.statSessions.textContent = formatNumber(stats.totalSessions);
  elements.statResonance.textContent = `Zen: ${formatNumber(stats.totalResonance)}`;
  elements.badgeServer.textContent = "Server: online";
  elements.badgeTelegram.textContent = stats.telegramValidation ? "Telegram: protected" : "Telegram: test mode";
  elements.badgeEvents.textContent = `Events: ${formatNumber(stats.eventCount)}`;

  renderVisualAnalytics(overview);
  renderDataStore(overview);
  renderActionTracking(overview);
  renderPayments(overview);
  renderBotStars(overview.botStars);
  renderRooms(overview.rooms);
  renderPlayers(overview.players);
  renderEvents(overview.events);
}

function renderDataStore(overview) {
  const dataStore = overview.dataStore || {};
  const stats = overview.stats || {};
  const active = String(dataStore.active || "json").toUpperCase();
  const requested = String(dataStore.requested || "json").toLowerCase();
  const totalRecords = Number(stats.players || 0) + Number(stats.paymentOrderCount || 0) + Number(stats.eventCount || 0);

  elements.dataBackend.textContent = active;
  elements.dataStorage.textContent = dataStore.storage || ".data/players.json";
  elements.dataRequested.textContent = `requested: ${requested}`;
  elements.dataMigration.textContent = dataStore.migrationReady ? "Ready" : "Draft";
  elements.dataSupabase.textContent = dataStore.fallbackActive
    ? `Fallback: ${dataStore.lastError || "Supabase error"}`
    : dataStore.supabaseConfigured ? "Supabase env ready" : "Supabase not connected";
  elements.dataExportCount.textContent = `${formatNumber(totalRecords)} records`;
}

function renderVisualAnalytics(overview) {
  const { stats, players } = overview;
  const playerCount = Math.max(1, stats.players);
  const telegramPercent = Math.round((stats.telegramPlayers / playerCount) * 100);
  const activePercent = Math.round((stats.active24h / playerCount) * 100);
  const zenPlayers = players.filter((player) => Number(player.sessions) > 0 || Number(player.resonance) > 0).length;
  const zenPercent = Math.round((zenPlayers / playerCount) * 100);
  const eventSignal = Math.min(100, Math.round((stats.actionEventCount / Math.max(1, stats.players * 4)) * 100));
  const readiness = Math.min(
    100,
    34 + (stats.telegramValidation ? 16 : 7) + (stats.players > 0 ? 16 : 0) + (stats.eventCount > 0 ? 14 : 0) + 12
  );

  elements.mapReadiness.textContent = `${readiness}%`;
  elements.mapReadiness.style.setProperty("--ready", `${readiness}%`);
  elements.pipeTelegram.textContent = stats.telegramValidation ? "protected" : "test";
  elements.pipeServer.textContent = "online";
  elements.pipeData.textContent = stats.players > 0 ? `${formatNumber(stats.players)} players` : "waiting";
  elements.pipeAdmin.textContent = stats.eventCount > 0 ? `${formatNumber(stats.eventCount)} events` : "visible";

  updateMetric(elements.metricTelegramLabel, elements.metricTelegramBar, `${telegramPercent}%`, telegramPercent);
  updateMetric(elements.metricActiveLabel, elements.metricActiveBar, `${activePercent}%`, activePercent);
  updateMetric(elements.metricZenLabel, elements.metricZenBar, `${zenPercent}%`, zenPercent);
  updateMetric(elements.metricEventsLabel, elements.metricEventsBar, formatNumber(stats.actionEventCount), eventSignal);
}

function updateMetric(label, bar, text, percent) {
  if (label) label.textContent = text;
  if (bar) bar.style.setProperty("--value", `${Math.min(100, Math.max(0, percent))}%`);
}

function renderActionTracking(overview) {
  const { stats, actionSummary = [] } = overview;
  elements.actionTotal.textContent = `${formatNumber(stats.actionEventCount)} actions`;
  elements.actionFarm.textContent = formatNumber(stats.farmActionCount);
  elements.actionLab.textContent = formatNumber(stats.labActionCount);
  elements.actionZen.textContent = formatNumber(stats.zenActionCount);
  elements.actionStars.textContent = formatNumber(stats.starsActionCount);

  if (!actionSummary.length) {
    elements.actionSummary.innerHTML = `<div class="empty-state">No tracked actions yet. Open the game and press Grow, Lab, Zen or Stars.</div>`;
    return;
  }

  elements.actionSummary.innerHTML = actionSummary
    .map(
      (item) => `
        <div class="action-pill">
          <span>${escapeHtml(actionLabel(item.type))}</span>
          <strong>${formatNumber(item.count)}</strong>
        </div>
      `
    )
    .join("");
}

function renderPayments(overview) {
  const { stats, payments = [] } = overview;
  elements.paymentTotal.textContent = `${formatNumber(stats.paymentOrderCount)} orders`;
  elements.paymentPaid.textContent = formatNumber(stats.paidOrderCount);
  elements.paymentStars.textContent = formatNumber(stats.paidStars);
  elements.paymentPending.textContent = formatNumber(stats.pendingOrderCount);
  elements.paymentSupport.textContent = "Ready";
  renderPaymentPlatforms(stats.paidPaymentPlatforms || stats.paymentPlatforms || {});

  if (!payments.length) {
    elements.paymentsTable.innerHTML = `
      <tr>
        <td colspan="8"><div class="empty-state">No Stars orders yet. Open the Mini App in Telegram and press ★10.</div></td>
      </tr>
    `;
    return;
  }

  elements.paymentsTable.innerHTML = payments
    .map(
      (payment) => `
        <tr>
          <td><span class="payment-status ${paymentClass(payment.status)}">${escapeHtml(payment.status)}</span></td>
          <td>
            <span class="player-name">
              <b>${escapeHtml(payment.paidByName || payment.playerName || "Unknown")}</b>
              <span>${escapeHtml(payment.paidByUsername || payment.username || (payment.paidByTelegramId ? `tg:${payment.paidByTelegramId}` : payment.telegramId ? `tg:${payment.telegramId}` : payment.playerId || "-"))}</span>
            </span>
          </td>
          <td><span class="platform-badge ${platformClass(payment.platform)}">${escapeHtml(platformLabel(payment.platform))}</span></td>
          <td>${escapeHtml(payment.productId || "-")}</td>
          <td>${formatNumber(payment.stars)}</td>
          <td>+${formatNumber(payment.rewardEnergy)} energy</td>
          <td><span class="mono">${escapeHtml(shortId(payment.telegramPaymentChargeId || payment.payload || "-"))}</span></td>
          <td><span class="muted">${formatDateTime(payment.paidAt || payment.createdAt)}</span></td>
        </tr>
      `
    )
    .join("");
}

function renderPaymentPlatforms(platforms = {}) {
  const ordered = ["android", "ios", "desktop", "web", "unknown"];
  elements.paymentPlatformSplit.innerHTML = ordered
    .filter((platform) => platforms[platform])
    .map(
      (platform) => `
        <span class="platform-pill ${platformClass(platform)}">
          <b>${escapeHtml(platformLabel(platform))}</b>
          <strong>${formatNumber(platforms[platform])}</strong>
        </span>
      `
    )
    .join("") || `<span class="platform-pill muted-pill"><b>No platform data yet</b><strong>0</strong></span>`;
}

function renderBotStars(botStars = {}) {
  const transactions = botStars.transactions || [];
  elements.botStarsStatus.textContent = botStars.ok ? (botStars.cached ? "cached" : "live") : "error";
  elements.botStarsStatus.classList.toggle("bad", !botStars.ok);
  elements.botStarsBalance.textContent = formatNumber(botStars.balanceAmount);
  elements.botStarsAvailableAt.textContent = botStars.nextAvailableAt ? formatDateShort(botStars.nextAvailableAt) : "-";
  elements.botStarsTransactionCount.textContent = formatNumber(botStars.transactionCount);
  elements.botStarsUpdatedAt.textContent = botStars.updatedAt ? formatTimeOnly(botStars.updatedAt) : "-";

  if (!botStars.ok) {
    elements.botStarsTransactions.innerHTML = `<div class="empty-state">Telegram Stars API unavailable: ${escapeHtml(botStars.error || "unknown error")}</div>`;
    return;
  }

  if (!transactions.length) {
    elements.botStarsTransactions.innerHTML = `<div class="empty-state">No Telegram Star transactions returned yet.</div>`;
    return;
  }

  elements.botStarsTransactions.innerHTML = transactions
    .map((transaction) => {
      const partner = transaction.sourceUser || transaction.receiverUser;
      const partnerLabel = partner?.username || partner?.name || transaction.sourceType || transaction.receiverType || "Telegram";
      return `
        <div class="bot-stars-row">
          <span class="payment-status ${transaction.estimatedAvailableAt ? "pending" : "neutral"}">${escapeHtml(transaction.sourceType || "stars")}</span>
          <strong>${formatNumber(transaction.amount)} Stars</strong>
          <b>${escapeHtml(partnerLabel)}</b>
          <small>${formatDateTime(transaction.date)}</small>
          <em>${transaction.estimatedAvailableAt ? `available ~ ${formatDateShort(transaction.estimatedAvailableAt)}` : "no hold estimate"}</em>
          <i class="mono">${escapeHtml(transaction.shortId || "-")}</i>
        </div>
      `;
    })
    .join("");
}

function renderRooms(rooms) {
  elements.roomsGrid.innerHTML = rooms
    .map(
      (room) => `
        <article class="room-card">
          <span>${escapeHtml(room.status)}</span>
          <h3>${escapeHtml(room.name)}</h3>
          <p>${escapeHtml(room.focus)}</p>
          <small>Далі: ${escapeHtml(room.next)}</small>
        </article>
      `
    )
    .join("");
}

function renderPlayers(players) {
  if (!players.length) {
    elements.playersTable.innerHTML = `
      <tr>
        <td colspan="6"><div class="empty-state">Поки немає гравців.</div></td>
      </tr>
    `;
    return;
  }

  elements.playersTable.innerHTML = players
    .map((player) => {
      const nickname = player.username ? `@${player.username}` : player.telegramId ? `tg:${player.telegramId}` : "guest";
      return `
        <tr>
          <td>#${player.rank || "-"}</td>
          <td>
            <span class="player-name">
              <b>${escapeHtml(player.name || "Unknown")}</b>
              <span>${escapeHtml(nickname)}</span>
            </span>
          </td>
          <td>${formatNumber(player.score)}</td>
          <td>${formatNumber(player.resonance)}</td>
          <td>${formatNumber(player.sessions)}</td>
          <td><span class="muted">${formatDateTime(player.updatedAt)}</span></td>
        </tr>
      `;
    })
    .join("");
}

function renderEvents(events) {
  if (!events.length) {
    elements.eventsList.innerHTML = `<div class="empty-state">Журнал ще порожній.</div>`;
    return;
  }

  elements.eventsList.innerHTML = events
    .map(
      (event) => `
        <div class="event-item">
          <strong>
            <span>${eventTitle(event)}</span>
            <time>${formatDateTime(event.createdAt)}</time>
          </strong>
          <p>${eventText(event)}</p>
        </div>
      `
    )
    .join("");
}

function eventTitle(event) {
  const titles = {
    admin_login: "Вхід в адмінку",
    player_created: "Новий гравець",
    player_progress: "Прогрес гравця",
    app_opened: "App opened",
    room_opened: "Room opened",
    farm_grow_clicked: "Farm grow",
    farm_boost_clicked: "Farm boost",
    farm_collected: "Farm collected",
    farm_auto_collected: "Auto collected",
    farm_auto_collect_toggled: "Auto collect",
    farm_blocked_no_energy: "Farm no energy",
    lab_mutation_clicked: "Lab mutation",
    lab_auto_toggled: "Lab auto",
    lab_blocked_no_energy: "Lab no energy",
    zen_started: "Zen started",
    zen_paused: "Zen paused",
    zen_resumed: "Zen resumed",
    zen_completed: "Zen completed",
    zen_duration_selected: "Zen duration",
    mission_opened: "Mission opened",
    mission_claimed: "Mission claimed",
    stars_button_clicked: "Stars clicked",
    stars_preview_mock: "Stars preview",
    stars_invoice_created: "Stars invoice",
    stars_invoice_opened: "Stars opened",
    stars_invoice_closed: "Stars closed",
    stars_invoice_error: "Stars error",
    stars_invoice_failed: "Stars failed",
    stars_pre_checkout_approved: "Stars approved",
    stars_pre_checkout_rejected: "Stars rejected",
    stars_payment_recorded: "Stars paid",
    stars_payment_unmatched: "Stars unmatched",
    stars_payment_duplicate: "Stars duplicate",
    stars_payment_mismatch: "Stars mismatch",
    paysupport_requested: "Payment support",
    bot_app_command: "Bot command",
    bot_message_failed: "Bot reply failed",
    sound_toggled: "Sound toggled",
    progress_reset_clicked: "Progress reset"
  };
  return titles[event.type] || event.type;
}

function eventText(event) {
  if (event.type === "admin_login") return escapeHtml(event.label || "Адмінка відкрита.");
  if (event.type === "player_created") {
    return `${escapeHtml(event.name || "Unknown")} зайшов у гру. Score: ${formatNumber(event.score)}.`;
  }
  if (event.type === "player_progress") {
    return `${escapeHtml(event.name || "Unknown")}: +${formatNumber(event.scoreDelta)} score, +${formatNumber(
      event.resonanceDelta
    )} Zen, +${formatNumber(event.sessionDelta)} sessions.`;
  }
  if (event.kind === "player_action") {
    const details = actionDetailsText(event.details || {});
    return `${escapeHtml(event.name || "Guest")} did ${escapeHtml(actionLabel(event.type))}${details ? ` - ${details}` : ""}.`;
  }
  return escapeHtml(JSON.stringify(event));
}

function actionLabel(type) {
  return eventTitle({ type });
}

function actionDetailsText(details) {
  const preferred = ["room", "enabled", "harvest", "reward", "durationMs", "stars", "energyAdded", "mode", "orderId", "status", "productId", "command"];
  return preferred
    .filter((key) => Object.prototype.hasOwnProperty.call(details, key))
    .map((key) => `${key}: ${escapeHtml(details[key])}`)
    .join(", ");
}

function paymentClass(status) {
  if (status === "paid") return "paid";
  if (status === "pending") return "pending";
  if (status === "failed_to_create" || status === "payment_mismatch") return "bad";
  return "neutral";
}

function platformClass(platform) {
  const value = String(platform || "unknown").toLowerCase();
  if (value === "android") return "android";
  if (value === "ios") return "ios";
  if (value === "desktop") return "desktop";
  if (value === "web") return "web";
  return "unknown";
}

function platformLabel(platform) {
  const value = platformClass(platform);
  if (value === "ios") return "Apple iOS";
  if (value === "android") return "Android";
  if (value === "desktop") return "Desktop";
  if (value === "web") return "Web";
  return "Unknown";
}

function shortId(value) {
  const text = String(value || "");
  if (text.length <= 14) return text;
  return `${text.slice(0, 7)}...${text.slice(-5)}`;
}

function showLogin(message = "") {
  elements.dashboard.classList.add("hidden");
  elements.loginPanel.classList.remove("hidden");
  elements.loginMessage.textContent = message;
}

function showDashboard() {
  elements.loginPanel.classList.add("hidden");
  elements.dashboard.classList.remove("hidden");
}

function startRefresh() {
  stopRefresh();
  refreshTimer = window.setInterval(loadOverview, 15000);
}

function stopRefresh() {
  if (refreshTimer) window.clearInterval(refreshTimer);
  refreshTimer = null;
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    ...options
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || "Request failed");
    error.status = response.status;
    throw error;
  }
  return payload;
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("uk-UA");
}

function formatDateTime(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatDateShort(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit"
  }).format(new Date(value));
}

function formatTimeOnly(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("uk-UA", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
