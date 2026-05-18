import crypto from "node:crypto";
import http from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
await loadDotEnv();

const port = Number(process.env.PORT || 4173);
const botToken = process.env.BOT_TOKEN || "";
const adminPassword = process.env.ADMIN_PASSWORD || "";
const adminCookieName = "green_admin";
const adminCookieSecret = process.env.ADMIN_COOKIE_SECRET || botToken || adminPassword || "green-farm-local-admin";
const dataFile = join(root, ".data", "players.json");

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml"
};

let db = await readDatabase();

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (request.method === "OPTIONS") {
      return sendJson(response, 204, {});
    }

    if (url.pathname.startsWith("/api/")) {
      return handleApi(request, response, url);
    }

    if (request.method !== "GET") {
      return sendJson(response, 405, { error: "Method not allowed" });
    }

    if (url.pathname === "/admin" || url.pathname === "/admin/") {
      return serveStatic("/admin.html", response);
    }

    return serveStatic(url.pathname, response);
  } catch (error) {
    console.error(error);
    sendJson(response, 500, { error: "Server error" });
  }
});

server.listen(port, () => {
  console.log(`Green Farm backend running at http://localhost:${port}`);
});

async function handleApi(request, response, url) {
  if (request.method === "GET" && url.pathname === "/api/health") {
    return sendJson(response, 200, {
      ok: true,
      players: Object.keys(db.players).length,
      telegramValidation: Boolean(botToken)
    });
  }

  if (request.method === "GET" && url.pathname === "/api/admin/session") {
    return sendJson(response, 200, {
      ok: true,
      configured: Boolean(adminPassword),
      authenticated: isAdminAuthenticated(request)
    });
  }

  if (request.method === "POST" && url.pathname === "/api/admin/login") {
    if (!adminPassword) {
      return sendJson(response, 503, {
        error: "Admin password is not configured."
      });
    }

    const body = await readBody(request);
    if (!safeSecretCompare(String(body.password || ""), adminPassword)) {
      return sendJson(response, 401, { error: "Wrong password." });
    }

    logEvent("admin_login", { label: "Admin dashboard opened" });
    await saveDatabase();

    return sendJson(
      response,
      200,
      { ok: true },
      { "Set-Cookie": createAdminCookie(request) }
    );
  }

  if (request.method === "POST" && url.pathname === "/api/admin/logout") {
    return sendJson(
      response,
      200,
      { ok: true },
      { "Set-Cookie": clearAdminCookie(request) }
    );
  }

  if (url.pathname.startsWith("/api/admin/")) {
    if (!isAdminAuthenticated(request)) {
      return sendJson(response, 401, { error: "Admin login required." });
    }

    if (request.method === "GET" && url.pathname === "/api/admin/overview") {
      return sendJson(response, 200, adminOverview());
    }
  }

  if (request.method === "GET" && url.pathname === "/api/leaderboard") {
    return sendJson(response, 200, leaderboardResponse());
  }

  if (request.method === "POST" && url.pathname === "/api/player/sync") {
    const body = await readBody(request);
    const auth = validateTelegramInitData(body.initData);

    if (!auth.ok) {
      return sendJson(response, 401, { error: auth.error });
    }

    const result = upsertPlayer({
      clientId: body.clientId,
      user: auth.user,
      state: body.state,
      verified: auth.verified
    });
    const { player } = result;
    logPlayerProgress(result);
    await saveDatabase();

    return sendJson(response, 200, {
      ok: true,
      player,
      ...leaderboardResponse(player.id)
    });
  }

  if (request.method === "POST" && url.pathname === "/api/player/event") {
    const body = await readBody(request);
    const auth = validateTelegramInitData(body.initData);

    if (!auth.ok) {
      return sendJson(response, 401, { error: auth.error });
    }

    const result = upsertPlayer({
      clientId: body.clientId,
      user: auth.user,
      state: body.state,
      verified: auth.verified
    });
    const { player } = result;
    const eventType = safeEventType(body.type);

    logEvent(eventType, {
      kind: "player_action",
      playerId: player.id,
      name: player.name,
      username: player.username,
      verified: player.verified,
      details: safeEventDetails(body.details),
      state: safeStateSummary(body.state)
    });
    await saveDatabase();

    return sendJson(response, 200, {
      ok: true,
      playerId: player.id,
      eventType
    });
  }

  return sendJson(response, 404, { error: "API route not found" });
}

function upsertPlayer({ clientId, user, state, verified }) {
  const now = new Date().toISOString();
  const id = user?.id ? `tg:${user.id}` : `guest:${safeId(clientId)}`;
  const existing = db.players[id] || {};
  const isNew = !db.players[id];
  const score = safeNumber(state?.score);
  const energy = safeNumber(state?.energy);
  const resonance = safeNumber(state?.resonance);
  const sessions = safeNumber(state?.sessions);
  const artifact = safeNumber(state?.artifact);
  const name = displayName(user, existing.name || "Guest");

  const player = {
    id,
    telegramId: user?.id || null,
    username: user?.username || existing.username || null,
    name,
    score: Math.max(safeNumber(existing.score), score),
    energy,
    resonance,
    sessions,
    artifact,
    verified,
    createdAt: existing.createdAt || now,
    updatedAt: now
  };

  db.players[id] = player;
  return {
    player,
    isNew,
    scoreDelta: Math.max(0, player.score - safeNumber(existing.score)),
    resonanceDelta: Math.max(0, player.resonance - safeNumber(existing.resonance)),
    sessionDelta: Math.max(0, player.sessions - safeNumber(existing.sessions))
  };
}

function leaderboardResponse(currentPlayerId = null) {
  const players = Object.values(db.players)
    .sort((a, b) => b.score - a.score || String(a.name).localeCompare(String(b.name)))
    .map((player, index) => ({
      rank: index + 1,
      id: player.id,
      name: player.name,
      username: player.username,
      score: player.score,
      resonance: player.resonance,
      sessions: player.sessions,
      verified: player.verified
    }));

  return {
    leaderboard: players.slice(0, 50),
    rank: currentPlayerId ? players.findIndex((player) => player.id === currentPlayerId) + 1 || null : null
  };
}

function adminOverview() {
  const rankedPlayers = Object.values(db.players)
    .sort((a, b) => b.score - a.score || String(a.name).localeCompare(String(b.name)));
  const rankById = new Map(rankedPlayers.map((player, index) => [player.id, index + 1]));
  const playersByActivity = [...rankedPlayers].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  const now = Date.now();
  const active24h = playersByActivity.filter((player) => {
    const updatedAt = new Date(player.updatedAt).getTime();
    return Number.isFinite(updatedAt) && now - updatedAt < 24 * 60 * 60 * 1000;
  }).length;
  const totals = rankedPlayers.reduce(
    (accumulator, player) => {
      accumulator.score += safeNumber(player.score);
      accumulator.energy += safeNumber(player.energy);
      accumulator.resonance += safeNumber(player.resonance);
      accumulator.sessions += safeNumber(player.sessions);
      return accumulator;
    },
    { score: 0, energy: 0, resonance: 0, sessions: 0 }
  );
  const actionEvents = db.events.filter((event) => event.kind === "player_action");
  const actionCounts = countEvents(actionEvents);

  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    stats: {
      players: rankedPlayers.length,
      telegramPlayers: rankedPlayers.filter((player) => player.telegramId).length,
      verifiedPlayers: rankedPlayers.filter((player) => player.verified).length,
      guests: rankedPlayers.filter((player) => !player.telegramId).length,
      active24h,
      totalScore: totals.score,
      totalEnergy: totals.energy,
      totalResonance: totals.resonance,
      totalSessions: totals.sessions,
      topScore: rankedPlayers[0]?.score || 0,
      lastActiveAt: playersByActivity[0]?.updatedAt || null,
      telegramValidation: Boolean(botToken),
      adminPasswordConfigured: Boolean(adminPassword),
      eventCount: db.events.length,
      actionEventCount: actionEvents.length,
      farmActionCount: countActionPrefix(actionEvents, "farm_"),
      labActionCount: countActionPrefix(actionEvents, "lab_"),
      zenActionCount: countActionPrefix(actionEvents, "zen_"),
      starsActionCount: countActionPrefix(actionEvents, "stars_"),
      roomOpenCount: actionEvents.filter((event) => event.type === "room_opened").length
    },
    actionSummary: Object.entries(actionCounts)
      .sort(([, left], [, right]) => right - left)
      .slice(0, 10)
      .map(([type, count]) => ({ type, count })),
    rooms: [
      {
        id: "farm",
        name: "Farm",
        status: "Prototype",
        focus: "Вирощування мікрокультур і перший ресурсний цикл",
        next: "Зберігати повний прогрес кожної капсули"
      },
      {
        id: "lab",
        name: "Lab",
        status: "Concept + visual shell",
        focus: "Мутації, артефакти, рідкість і майбутні NFT-продукти",
        next: "Описати формулу шансів і інвентар артефактів"
      },
      {
        id: "zen",
        name: "Zen",
        status: "Core product direction",
        focus: "Медитація, звук, Zen energy, головна цінність проекту",
        next: "Почати логувати старт/кінець Zen-сесій"
      }
    ],
    players: playersByActivity.slice(0, 100).map((player) => ({
      rank: rankById.get(player.id) || null,
      id: player.id,
      telegramId: player.telegramId,
      username: player.username,
      name: player.name,
      score: player.score,
      energy: player.energy,
      resonance: player.resonance,
      sessions: player.sessions,
      artifact: player.artifact,
      verified: player.verified,
      createdAt: player.createdAt,
      updatedAt: player.updatedAt
    })),
    leaderboard: leaderboardResponse().leaderboard,
    events: db.events.slice(0, 80)
  };
}

function logPlayerProgress({ player, isNew, scoreDelta, resonanceDelta, sessionDelta }) {
  if (isNew) {
    logEvent("player_created", {
      playerId: player.id,
      name: player.name,
      username: player.username,
      score: player.score,
      verified: player.verified
    });
    return;
  }

  if (scoreDelta > 0 || resonanceDelta > 0 || sessionDelta > 0) {
    logEvent("player_progress", {
      playerId: player.id,
      name: player.name,
      score: player.score,
      scoreDelta,
      resonance: player.resonance,
      resonanceDelta,
      sessions: player.sessions,
      sessionDelta
    });
  }
}

function logEvent(type, details = {}) {
  db.events.unshift({
    id: crypto.randomUUID(),
    type,
    createdAt: new Date().toISOString(),
    ...details
  });
  db.events = db.events.slice(0, 200);
}

function countEvents(events) {
  return events.reduce((counts, event) => {
    counts[event.type] = (counts[event.type] || 0) + 1;
    return counts;
  }, {});
}

function countActionPrefix(events, prefix) {
  return events.filter((event) => event.type.startsWith(prefix)).length;
}

function safeEventType(value) {
  return String(value || "player_action")
    .replace(/[^a-z0-9_:-]/gi, "_")
    .slice(0, 64) || "player_action";
}

function safeEventDetails(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .slice(0, 12)
      .map(([key, item]) => [safeEventType(key), safeEventValue(item)])
  );
}

function safeEventValue(value) {
  if (typeof value === "number") return safeNumber(value);
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.slice(0, 160);
  return String(value ?? "").slice(0, 160);
}

function safeStateSummary(state) {
  return {
    score: safeNumber(state?.score),
    energy: safeNumber(state?.energy),
    resonance: safeNumber(state?.resonance),
    sessions: safeNumber(state?.sessions),
    artifact: safeNumber(state?.artifact)
  };
}

function validateTelegramInitData(initData) {
  if (!initData) {
    return { ok: true, user: null, verified: false };
  }

  const params = new URLSearchParams(initData);
  const userJson = params.get("user");
  const user = userJson ? JSON.parse(userJson) : null;

  if (!botToken) {
    return { ok: true, user, verified: false };
  }

  const hash = params.get("hash");
  params.delete("hash");

  if (!hash || !/^[a-f0-9]{64}$/i.test(hash)) {
    return { ok: false, error: "Invalid Telegram initData hash." };
  }

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  const secret = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const calculatedHash = crypto.createHmac("sha256", secret).update(dataCheckString).digest("hex");

  if (!crypto.timingSafeEqual(Buffer.from(calculatedHash, "hex"), Buffer.from(hash, "hex"))) {
    return { ok: false, error: "Telegram initData validation failed." };
  }

  return { ok: true, user, verified: true };
}

async function serveStatic(pathname, response) {
  const cleanPath = pathname === "/" ? "/index.html" : decodeURIComponent(pathname);
  const filepath = normalize(join(root, cleanPath));

  if (!filepath.startsWith(root) || filepath.includes(`${join(root, ".data")}`)) {
    return sendJson(response, 403, { error: "Forbidden" });
  }

  try {
    const body = await readFile(filepath);
    response.writeHead(200, {
      "Content-Type": contentTypes[extname(filepath)] || "application/octet-stream",
      "Cache-Control": extname(filepath) === ".html" ? "no-store" : "public, max-age=60"
    });
    response.end(body);
  } catch (error) {
    if (error.code === "ENOENT") {
      const fallback = await readFile(join(root, "index.html"));
      response.writeHead(200, { "Content-Type": contentTypes[".html"], "Cache-Control": "no-store" });
      response.end(fallback);
      return;
    }
    throw error;
  }
}

async function readDatabase() {
  try {
    return normalizeDatabase(JSON.parse(await readFile(dataFile, "utf8")));
  } catch {
    return normalizeDatabase({});
  }
}

async function saveDatabase() {
  await mkdir(dirname(dataFile), { recursive: true });
  await writeFile(dataFile, JSON.stringify(db, null, 2));
}

function normalizeDatabase(value) {
  return {
    players: value?.players && typeof value.players === "object" ? value.players : {},
    events: Array.isArray(value?.events) ? value.events : []
  };
}

function sendJson(response, status, value, headers = {}) {
  response.writeHead(status, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8",
    ...headers
  });
  response.end(status === 204 ? "" : JSON.stringify(value));
}

function isAdminAuthenticated(request) {
  const token = parseCookies(request.headers.cookie || "")[adminCookieName];
  if (!token) return false;

  const [expiresAt, signature] = token.split(".");
  const expires = Number(expiresAt);
  if (!Number.isFinite(expires) || expires < Date.now() || !signature) return false;

  const expected = signAdminSession(expiresAt);
  return safeSecretCompare(signature, expected);
}

function createAdminCookie(request) {
  const expiresAt = String(Date.now() + 24 * 60 * 60 * 1000);
  const token = `${expiresAt}.${signAdminSession(expiresAt)}`;
  return [
    `${adminCookieName}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=86400",
    shouldUseSecureCookie(request) ? "Secure" : ""
  ]
    .filter(Boolean)
    .join("; ");
}

function clearAdminCookie(request) {
  return [
    `${adminCookieName}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
    shouldUseSecureCookie(request) ? "Secure" : ""
  ]
    .filter(Boolean)
    .join("; ");
}

function signAdminSession(value) {
  return crypto.createHmac("sha256", adminCookieSecret).update(value).digest("hex");
}

function shouldUseSecureCookie(request) {
  return request.headers["x-forwarded-proto"] === "https" || String(request.headers.host || "").includes("onrender.com");
}

function parseCookies(rawCookie) {
  return rawCookie.split(";").reduce((cookies, part) => {
    const separator = part.indexOf("=");
    if (separator === -1) return cookies;
    const key = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (key) cookies[key] = value;
    return cookies;
  }, {});
}

function safeSecretCompare(left, right) {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function readBody(request) {
  return new Promise((resolve) => {
    let raw = "";
    request.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        request.destroy();
        resolve({});
      }
    });
    request.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        resolve({});
      }
    });
    request.on("error", () => resolve({}));
  });
}

async function loadDotEnv() {
  try {
    const raw = await readFile(join(root, ".env"), "utf8");
    raw.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const separator = trimmed.indexOf("=");
      if (separator === -1) return;
      const key = trimmed.slice(0, separator).trim();
      const value = trimmed.slice(separator + 1).trim();
      if (key && process.env[key] === undefined) process.env[key] = value;
    });
  } catch {
    // Hosting providers can inject environment variables directly.
  }
}

function displayName(user, fallback) {
  if (!user) return fallback;
  return [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username || fallback;
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.round(number)) : 0;
}

function safeId(value) {
  return String(value || "browser")
    .replace(/[^a-z0-9_-]/gi, "")
    .slice(0, 64) || "browser";
}
