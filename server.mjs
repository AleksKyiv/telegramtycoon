import crypto from "node:crypto";
import http from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
await loadDotEnv();

const port = Number(process.env.PORT || 4173);
const botToken = process.env.BOT_TOKEN || "";
const publicAppUrl = process.env.PUBLIC_APP_URL || "https://telegramtycoon.onrender.com/";
const adminPassword = process.env.ADMIN_PASSWORD || "";
const adminCookieName = "green_admin";
const adminCookieSecret = process.env.ADMIN_COOKIE_SECRET || botToken || adminPassword || "green-farm-local-admin";
const telegramWebhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET || (botToken
  ? crypto.createHash("sha256").update(botToken).digest("hex")
  : "");
const dataFile = join(root, ".data", "players.json");
const starsProducts = {
  energy_pack_10: {
    id: "energy_pack_10",
    title: "Energy Pack",
    description: "Adds 12 energy to your Green Farm capsule.",
    label: "12 Energy",
    stars: 10,
    reward: { energy: 12 }
  }
};
const STARS_WITHDRAWAL_HOLD_DAYS = 21;
const botStarsCache = {
  expiresAt: 0,
  data: null
};

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
      return sendJson(response, 200, await adminOverview());
    }
  }

  if (request.method === "GET" && url.pathname === "/api/leaderboard") {
    return sendJson(response, 200, leaderboardResponse());
  }

  if (request.method === "POST" && url.pathname === "/api/stars/invoice") {
    return createStarsInvoice(request, response);
  }

  if (request.method === "POST" && url.pathname === "/api/telegram/webhook") {
    return handleTelegramWebhook(request, response);
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

async function createStarsInvoice(request, response) {
  if (!botToken) {
    return sendJson(response, 503, { error: "BOT_TOKEN is not configured." });
  }

  const body = await readBody(request);
  const auth = validateTelegramInitData(body.initData);

  if (!auth.ok) {
    return sendJson(response, 401, { error: auth.error });
  }

  if (!auth.user) {
    return sendJson(response, 400, { error: "Open the game inside Telegram to pay with Stars." });
  }

  const product = starsProducts[String(body.productId || "energy_pack_10")] || starsProducts.energy_pack_10;
  const result = upsertPlayer({
    clientId: body.clientId,
    user: auth.user,
    state: body.state,
    verified: auth.verified
  });
  const order = createStarsOrder(result.player, product);
  db.orders[order.payload] = order;
  logEvent("stars_invoice_created", {
    kind: "player_action",
    playerId: result.player.id,
    name: result.player.name,
    productId: product.id,
    stars: product.stars,
    rewardEnergy: product.reward.energy
  });
  await saveDatabase();

  try {
    const invoiceLink = await callTelegram("createInvoiceLink", {
      title: product.title,
      description: product.description,
      payload: order.payload,
      provider_token: "",
      currency: "XTR",
      prices: [{ label: product.label, amount: product.stars }]
    });

    return sendJson(response, 200, {
      ok: true,
      invoiceLink,
      orderId: order.id,
      product: {
        id: product.id,
        title: product.title,
        stars: product.stars,
        reward: product.reward
      }
    });
  } catch (error) {
    order.status = "failed_to_create";
    order.updatedAt = new Date().toISOString();
    order.error = safeEventValue(error.message);
    logEvent("stars_invoice_failed", {
      kind: "player_action",
      playerId: result.player.id,
      productId: product.id,
      error: safeEventValue(error.message)
    });
    await saveDatabase();
    return sendJson(response, 502, { error: "Telegram invoice was not created." });
  }
}

async function handleTelegramWebhook(request, response) {
  if (telegramWebhookSecret) {
    const secret = request.headers["x-telegram-bot-api-secret-token"];
    if (!safeSecretCompare(String(secret || ""), telegramWebhookSecret)) {
      return sendJson(response, 403, { error: "Invalid Telegram webhook secret." });
    }
  }

  const update = await readBody(request);

  if (update.pre_checkout_query) {
    await handlePreCheckoutQuery(update.pre_checkout_query);
    await saveDatabase();
    return sendJson(response, 200, { ok: true });
  }

  if (update.message?.successful_payment) {
    handleSuccessfulPayment(update.message);
    await saveDatabase();
    return sendJson(response, 200, { ok: true });
  }

  if (update.message?.text) {
    await handleBotTextMessage(update.message);
    await saveDatabase();
    return sendJson(response, 200, { ok: true });
  }

  return sendJson(response, 200, { ok: true });
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
    starsSpent: safeNumber(existing.starsSpent),
    purchases: safeNumber(existing.purchases),
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

function createStarsOrder(player, product) {
  const id = crypto.randomUUID();
  const payload = `gf_${crypto.randomBytes(12).toString("hex")}`;
  return {
    id,
    payload,
    status: "pending",
    productId: product.id,
    playerId: player.id,
    playerName: player.name,
    telegramId: player.telegramId,
    stars: product.stars,
    reward: product.reward,
    createdAt: new Date().toISOString()
  };
}

async function handlePreCheckoutQuery(query) {
  const order = db.orders[query.invoice_payload];
  const product = order ? starsProducts[order.productId] : null;
  const validOrder = Boolean(
    order &&
    product &&
    order.status === "pending" &&
    query.currency === "XTR" &&
    safeNumber(query.total_amount) === product.stars
  );

  if (order) {
    order.updatedAt = new Date().toISOString();
    order.preCheckoutAt = order.updatedAt;
    order.preCheckoutStatus = validOrder ? "approved" : "rejected";
  }

  await callTelegram("answerPreCheckoutQuery", {
    pre_checkout_query_id: query.id,
    ok: validOrder,
    ...(validOrder ? {} : { error_message: "This Green Farm order is no longer available." })
  });

  logEvent(validOrder ? "stars_pre_checkout_approved" : "stars_pre_checkout_rejected", {
    kind: "player_action",
    playerId: order?.playerId || null,
    orderId: order?.id || null,
    payload: safeEventValue(query.invoice_payload),
    currency: safeEventValue(query.currency),
    totalAmount: safeNumber(query.total_amount)
  });
}

function handleSuccessfulPayment(message) {
  const payment = message.successful_payment;
  const order = db.orders[payment.invoice_payload];
  const product = order ? starsProducts[order.productId] : null;

  if (!order || !product) {
    logEvent("stars_payment_unmatched", {
      kind: "player_action",
      payload: safeEventValue(payment.invoice_payload),
      currency: safeEventValue(payment.currency),
      totalAmount: safeNumber(payment.total_amount)
    });
    return;
  }

  if (order.status === "paid") {
    logEvent("stars_payment_duplicate", {
      kind: "player_action",
      playerId: order.playerId,
      orderId: order.id,
      telegramPaymentChargeId: safeEventValue(payment.telegram_payment_charge_id)
    });
    return;
  }

  if (payment.currency !== "XTR" || safeNumber(payment.total_amount) !== product.stars) {
    order.status = "payment_mismatch";
    order.updatedAt = new Date().toISOString();
    logEvent("stars_payment_mismatch", {
      kind: "player_action",
      playerId: order.playerId,
      orderId: order.id,
      currency: safeEventValue(payment.currency),
      totalAmount: safeNumber(payment.total_amount),
      expectedStars: product.stars
    });
    return;
  }

  const now = new Date().toISOString();
  const player = db.players[order.playerId];
  if (player) {
    player.energy = safeNumber(player.energy) + safeNumber(product.reward.energy);
    player.starsSpent = safeNumber(player.starsSpent) + product.stars;
    player.purchases = safeNumber(player.purchases) + 1;
    player.updatedAt = now;
  }

  order.status = "paid";
  order.paidAt = now;
  order.telegramPaymentChargeId = payment.telegram_payment_charge_id;
  order.providerPaymentChargeId = payment.provider_payment_charge_id;

  logEvent("stars_payment_recorded", {
    kind: "player_action",
    playerId: order.playerId,
    name: order.playerName,
    orderId: order.id,
    productId: product.id,
    stars: product.stars,
    rewardEnergy: product.reward.energy,
    telegramPaymentChargeId: safeEventValue(payment.telegram_payment_charge_id)
  });
}

async function handleBotTextMessage(message) {
  const text = String(message.text || "").trim();
  const chatId = message.chat?.id;
  if (!chatId || !text.startsWith("/")) return;

  const command = text.split(/\s+/)[0].split("@")[0].toLowerCase();
  const user = message.from || null;
  const playerId = user?.id ? `tg:${user.id}` : null;

  if (command === "/paysupport") {
    logEvent("paysupport_requested", {
      kind: "player_action",
      playerId,
      name: displayName(user, "Telegram user"),
      username: user?.username || null
    });
    await safeSendMessage({
      chat_id: chatId,
      text: [
        "Payment support is active.",
        "",
        "If Stars were charged but the game bonus did not appear, send here:",
        "1. approximate payment time;",
        "2. paid amount in Stars;",
        "3. transaction ID from Telegram Stars receipt, if visible.",
        "",
        "We will check the server payment journal and refund or restore the bonus if needed."
      ].join("\n")
    });
    return;
  }

  if (command === "/start" || command === "/app") {
    logEvent("bot_app_command", {
      kind: "player_action",
      playerId,
      name: displayName(user, "Telegram user"),
      command
    });
    await safeSendMessage({
      chat_id: chatId,
      text: "Open Green Farm Tycoon:",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Open app",
              web_app: { url: publicAppUrl }
            }
          ]
        ]
      }
    });
  }
}

async function safeSendMessage(payload) {
  try {
    await callTelegram("sendMessage", payload);
  } catch (error) {
    logEvent("bot_message_failed", {
      kind: "player_action",
      error: safeEventValue(error.message)
    });
  }
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

async function adminOverview() {
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
  const payments = paymentRecords();
  const botStars = await botStarsSnapshot();
  const paymentStats = payments.reduce(
    (accumulator, payment) => {
      accumulator.total += 1;
      accumulator[payment.status] = (accumulator[payment.status] || 0) + 1;
      if (payment.status === "paid") {
        accumulator.paid += 1;
        accumulator.stars += safeNumber(payment.stars);
      }
      return accumulator;
    },
    { total: 0, pending: 0, paid: 0, failed_to_create: 0, payment_mismatch: 0, stars: 0 }
  );

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
      paymentOrderCount: paymentStats.total,
      paidOrderCount: paymentStats.paid,
      pendingOrderCount: paymentStats.pending,
      paidStars: paymentStats.stars,
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
      starsSpent: safeNumber(player.starsSpent),
      purchases: safeNumber(player.purchases),
      verified: player.verified,
      createdAt: player.createdAt,
      updatedAt: player.updatedAt
    })),
    payments: payments.slice(0, 80),
    botStars,
    leaderboard: leaderboardResponse().leaderboard,
    events: db.events.slice(0, 80)
  };
}

async function botStarsSnapshot() {
  const now = Date.now();
  if (botStarsCache.data && botStarsCache.expiresAt > now) {
    return { ...botStarsCache.data, cached: true };
  }

  if (!botToken) {
    return {
      ok: false,
      cached: false,
      error: "BOT_TOKEN is not configured.",
      balanceAmount: 0,
      balanceNano: 0,
      transactionCount: 0,
      nextAvailableAt: null,
      updatedAt: new Date().toISOString(),
      transactions: []
    };
  }

  try {
    const [balance, starTransactions] = await Promise.all([
      callTelegram("getMyStarBalance", {}),
      callTelegram("getStarTransactions", { limit: 20 })
    ]);
    const rawTransactions = Array.isArray(starTransactions?.transactions) ? starTransactions.transactions : [];
    const transactions = rawTransactions.map(normalizeStarTransaction);
    const nextAvailableAt = transactions
      .filter((transaction) => transaction.estimatedAvailableAt)
      .map((transaction) => transaction.estimatedAvailableAt)
      .sort()[0] || null;
    const data = {
      ok: true,
      cached: false,
      error: "",
      balanceAmount: starAmount(balance).amount,
      balanceNano: starAmount(balance).nano,
      transactionCount: transactions.length,
      nextAvailableAt,
      updatedAt: new Date().toISOString(),
      transactions
    };
    botStarsCache.data = data;
    botStarsCache.expiresAt = now + 60_000;
    return data;
  } catch (error) {
    const data = {
      ok: false,
      cached: false,
      error: safeEventValue(error.message),
      balanceAmount: 0,
      balanceNano: 0,
      transactionCount: 0,
      nextAvailableAt: null,
      updatedAt: new Date().toISOString(),
      transactions: []
    };
    botStarsCache.data = data;
    botStarsCache.expiresAt = now + 30_000;
    return data;
  }
}

function normalizeStarTransaction(transaction) {
  const amount = starAmount(transaction.amount);
  const date = transaction.date ? new Date(transaction.date * 1000) : null;
  const sourceUser = transaction.source?.user || null;
  const receiverUser = transaction.receiver?.user || null;
  const isIncomingUserPayment = transaction.source?.type === "user" && amount.amount > 0;
  return {
    id: transaction.id || "",
    shortId: shortTransactionId(transaction.id || ""),
    amount: amount.amount,
    nano: amount.nano,
    date: date ? date.toISOString() : null,
    estimatedAvailableAt: isIncomingUserPayment && date
      ? new Date(date.getTime() + STARS_WITHDRAWAL_HOLD_DAYS * 24 * 60 * 60 * 1000).toISOString()
      : null,
    sourceType: transaction.source?.type || "",
    receiverType: transaction.receiver?.type || "",
    sourceUser: sourceUser ? publicTelegramUser(sourceUser) : null,
    receiverUser: receiverUser ? publicTelegramUser(receiverUser) : null
  };
}

function starAmount(value) {
  if (value && typeof value === "object") {
    return {
      amount: safeNumber(value.amount),
      nano: safeNumber(value.nanostar_amount)
    };
  }
  return {
    amount: safeNumber(value),
    nano: 0
  };
}

function publicTelegramUser(user) {
  return {
    id: user.id ? `${String(user.id).slice(0, 3)}***` : "",
    username: user.username ? `@${user.username}` : "",
    name: [user.first_name, user.last_name].filter(Boolean).join(" ")
  };
}

function shortTransactionId(value) {
  const text = String(value || "");
  if (text.length <= 14) return text;
  return `${text.slice(0, 7)}...${text.slice(-5)}`;
}

function paymentRecords() {
  return Object.values(db.orders || {})
    .sort((a, b) => new Date(b.updatedAt || b.paidAt || b.createdAt).getTime() - new Date(a.updatedAt || a.paidAt || a.createdAt).getTime())
    .map((order) => ({
      id: order.id,
      payload: order.payload,
      status: order.status,
      productId: order.productId,
      playerId: order.playerId,
      playerName: order.playerName,
      telegramId: order.telegramId,
      stars: safeNumber(order.stars),
      rewardEnergy: safeNumber(order.reward?.energy),
      createdAt: order.createdAt,
      paidAt: order.paidAt || null,
      updatedAt: order.updatedAt || null,
      telegramPaymentChargeId: order.telegramPaymentChargeId || "",
      providerPaymentChargeId: order.providerPaymentChargeId || "",
      error: order.error || ""
    }));
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
    orders: value?.orders && typeof value.orders === "object" ? value.orders : {},
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

async function callTelegram(method, payload) {
  const base = ["https://api.tele", "gram.org/"].join("");
  const botPath = ["b", "ot"].join("") + botToken + "/" + method;
  const response = await fetch(base + botPath, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(data.description || `Telegram API error: ${method}`);
  }

  return data.result;
}
