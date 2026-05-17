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
  renderRooms(overview.rooms);
  renderPlayers(overview.players);
  renderEvents(overview.events);
}

function renderVisualAnalytics(overview) {
  const { stats, players } = overview;
  const playerCount = Math.max(1, stats.players);
  const telegramPercent = Math.round((stats.telegramPlayers / playerCount) * 100);
  const activePercent = Math.round((stats.active24h / playerCount) * 100);
  const zenPlayers = players.filter((player) => Number(player.sessions) > 0 || Number(player.resonance) > 0).length;
  const zenPercent = Math.round((zenPlayers / playerCount) * 100);
  const eventSignal = Math.min(100, Math.round((stats.eventCount / Math.max(1, stats.players * 4)) * 100));
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
  updateMetric(elements.metricEventsLabel, elements.metricEventsBar, formatNumber(stats.eventCount), eventSignal);
}

function updateMetric(label, bar, text, percent) {
  if (label) label.textContent = text;
  if (bar) bar.style.setProperty("--value", `${Math.min(100, Math.max(0, percent))}%`);
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
    player_progress: "Прогрес гравця"
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
  return escapeHtml(JSON.stringify(event));
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

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
