import crypto from "node:crypto";
import http from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
await loadDotEnv();

const port = Number(process.env.PORT || 4173);
const botToken = process.env.BOT_TOKEN || "";
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

  if (request.method === "GET" && url.pathname === "/api/leaderboard") {
    return sendJson(response, 200, leaderboardResponse());
  }

  if (request.method === "POST" && url.pathname === "/api/player/sync") {
    const body = await readBody(request);
    const auth = validateTelegramInitData(body.initData);

    if (!auth.ok) {
      return sendJson(response, 401, { error: auth.error });
    }

    const player = upsertPlayer({
      clientId: body.clientId,
      user: auth.user,
      state: body.state,
      verified: auth.verified
    });
    await saveDatabase();

    return sendJson(response, 200, {
      ok: true,
      player,
      ...leaderboardResponse(player.id)
    });
  }

  return sendJson(response, 404, { error: "API route not found" });
}

function upsertPlayer({ clientId, user, state, verified }) {
  const now = new Date().toISOString();
  const id = user?.id ? `tg:${user.id}` : `guest:${safeId(clientId)}`;
  const existing = db.players[id] || {};
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
  return player;
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
    leaderboard: players.slice(0, 10),
    rank: currentPlayerId ? players.findIndex((player) => player.id === currentPlayerId) + 1 || null : null
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
    return JSON.parse(await readFile(dataFile, "utf8"));
  } catch {
    return { players: {} };
  }
}

async function saveDatabase() {
  await mkdir(dirname(dataFile), { recursive: true });
  await writeFile(dataFile, JSON.stringify(db, null, 2));
}

function sendJson(response, status, value) {
  response.writeHead(status, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=utf-8"
  });
  response.end(status === 204 ? "" : JSON.stringify(value));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let raw = "";
    request.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        request.destroy();
        reject(new Error("Request too large"));
      }
    });
    request.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
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
