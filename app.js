const tg = window.Telegram?.WebApp;
tg?.ready();
tg?.expand();

if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

window.addEventListener("load", () => window.scrollTo({ top: 0, left: 0 }));

const GROW_DURATION_MS = 30_000;
const BOOST_MS = 4_500;
const ZEN_DEFAULT_DURATION_MS = 60_000;
const ZEN_DURATION_OPTIONS = [60_000, 120_000, 180_000];
const ZEN_SOUND_OPTIONS = ["deep", "rain", "pulse"];
const ZEN_GENE_OPTIONS = ["sprout", "crystal", "aura"];
const ZEN_DNA_WINDOW_MS = 9_000;
const ZEN_DNA_SHOW_START_MS = 900;
const ZEN_DNA_SHOW_END_MS = 7_600;
const ZEN_SOUND_PRESETS = {
  deep: { master: 0.105, filter: 330, lfo: 0.045, lfoGain: 76, a: 87.31, b: 130.81, shimmer: 261.63, air: 680, airGain: 0.038 },
  rain: { master: 0.095, filter: 420, lfo: 0.03, lfoGain: 54, a: 73.42, b: 110, shimmer: 196, air: 1180, airGain: 0.075 },
  pulse: { master: 0.11, filter: 510, lfo: 0.075, lfoGain: 96, a: 98, b: 146.83, shimmer: 293.66, air: 860, airGain: 0.044 }
};
const BREATH_LOOP_MS = 12_000;
const MISSION_WAIT_MS = 10_000;
const MISSIONS = [
  {
    id: "telegram_channel",
    type: "telegram",
    title: "Green Channel",
    label: "Join",
    url: "https://t.me/Qwanttarium_bot",
    reward: { energy: 25 },
    note: "Starter energy"
  },
  {
    id: "youtube_signal",
    type: "youtube",
    title: "YouTube Signal",
    label: "Open",
    url: "https://www.youtube.com/",
    reward: { energy: 15 },
    note: "Watch path"
  },
  {
    id: "instagram_growth",
    type: "instagram",
    title: "Instagram Growth",
    label: "Open",
    url: "https://www.instagram.com/",
    reward: { energy: 15 },
    note: "Social pulse"
  },
  {
    id: "tiktok_pulse",
    type: "tiktok",
    title: "TikTok Pulse",
    label: "Open",
    url: "https://www.tiktok.com/",
    reward: { energy: 15 },
    note: "Viral sprout"
  }
];
const PLANT_VARIANTS = Array.from({ length: 100 }, (_, index) => {
  const seed = index + 1;
  return {
    id: index,
    leafHue: 82 + ((seed * 37) % 66),
    stemHue: 92 + ((seed * 19) % 48),
    accentHue: 166 + ((seed * 29) % 82),
    coreHue: 52 + ((seed * 11) % 54),
    branchSpread: 0.78 + (((seed * 17) % 46) / 100),
    leafScale: 0.68 + (((seed * 13) % 36) / 100),
    filamentSpeed: 0.82 + (((seed * 23) % 44) / 100)
  };
});

const DRONE_SKINS = [
  {
    id: "bubbles",
    name: "Bubbles",
    tag: "Base",
    route: "Owned",
    note: "Soft balloon shell with a calm floating service pulse.",
    effect: "Air float"
  },
  {
    id: "smile",
    name: "Smile",
    tag: "Fun reward",
    route: "Tasks",
    note: "Friendly face shell for a warmer farm-control feeling.",
    effect: "Mood glow"
  },
  {
    id: "aurora",
    name: "Aurora Core",
    tag: "Stars rare",
    route: "Stars",
    note: "Premium prism shell for rare drops and future paid skins.",
    effect: "Prism aura"
  }
];

const defaultState = {
  score: 0,
  energy: 10,
  resonance: 0,
  growth: 0,
  plantedAt: 0,
  growthDuration: GROW_DURATION_MS,
  boostUntil: 0,
  artifact: 0,
  labUniqueMutations: 0,
  labRareUntil: 0,
  sessions: 0,
  plantVariant: 0,
  autoCollect: false,
  mutationAuto: false,
  zenDuration: ZEN_DEFAULT_DURATION_MS,
  zenStartedAt: 0,
  zenPausedAt: 0,
  zenElapsed: 0,
  zenSound: "deep",
  zenGene: "sprout",
  zenEnergy: 0,
  zenSessionDna: 0,
  zenDnaClaims: {},
  soundOn: true,
  soundVolume: 70,
  vibrationOn: true,
  vibrationLevel: 60,
  playerName: "You",
  droneLevel: 1,
  droneSkin: "bubbles",
  dataModuleLevel: 1,
  unlockedSlots: { "0": true },
  missions: {
    opened: {},
    claimed: {}
  }
};

let state = loadState();

const $ = (selector) => document.querySelector(selector);
const setText = (selector, value) => {
  const node = $(selector);
  if (node) node.textContent = value;
};
const setStyle = (selector, prop, value) => {
  const node = $(selector);
  if (node) node.style.setProperty(prop, value);
};
const setInputValue = (selector, value) => {
  const node = $(selector);
  if (node) {
    node.value = value;
    node.style.setProperty("--range-fill", `${value}%`);
  }
};
const setClass = (selector, className, enabled) => {
  const node = $(selector);
  if (node) node.classList.toggle(className, enabled);
};

const rooms = {
  farm: $("#farmRoom"),
  lab: $("#labRoom"),
  zen: $("#zenRoom"),
  missions: $("#missionsRoom")
};

let audioContext;
let autoCollectTimer;
let zenAmbient;
const API_BASE = (window.GREEN_FARM_API_URL || "").replace(/\/$/, "");
const CLIENT_ID = getClientId();
let backendState = {
  available: false,
  status: "Local",
  syncing: false,
  lastSyncAt: 0,
  lastSnapshot: "",
  playerId: null,
  rank: null,
  leaderboard: []
};
const loadingState = {
  progress: 0,
  hidden: false,
  startedAt: Date.now()
};

function settingPercent(value, fallback = 70) {
  const number = Number(value);
  return clamp(Number.isFinite(number) ? number : fallback, 0, 100);
}

function triggerHaptic(type = "tap") {
  if (!state.vibrationOn) return;
  const level = settingPercent(state.vibrationLevel, 60);
  if (level <= 0) return;
  const style = level >= 75 || type === "stars" || type === "collect" ? "heavy" : level >= 40 ? "medium" : "light";
  try {
    tg?.HapticFeedback?.impactOccurred(style);
  } catch {}
  try {
    navigator.vibrate?.(style === "heavy" ? 34 : style === "medium" ? 22 : 12);
  } catch {}
}

function playTone(type = "tap") {
  triggerHaptic(type);
  const volume = settingPercent(state.soundVolume, 70) / 100;
  if (!state.soundOn || volume <= 0) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === "suspended") audioContext.resume();

    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    const presets = {
      grow: [220, 360, 0.16, "sine"],
      boost: [420, 720, 0.12, "triangle"],
      collect: [520, 880, 0.18, "sine"],
      stars: [620, 980, 0.14, "triangle"],
      lab: [180, 540, 0.22, "sawtooth"],
      zen: [174, 261, 0.7, "sine"],
      nav: [260, 330, 0.08, "sine"],
      tap: [260, 340, 0.08, "sine"]
    };
    const [startFreq, endFreq, duration, wave] = presets[type] || presets.tap;

    osc.type = wave;
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(type === "zen" ? 620 : 1200, now);
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime((type === "zen" ? 0.055 : 0.075) * volume, now + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  } catch {
    state.soundOn = false;
  }
}

function createNoiseSource(context) {
  const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * 0.28;
  }
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  return source;
}

function playZenBreathCue() {
  if (!state.soundOn || !audioContext || !zenAmbient) return;
  const now = audioContext.currentTime;
  const gain = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();
  const notes = [261.63, 392, 523.25];

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(920, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.026 * (settingPercent(state.soundVolume, 70) / 100), now + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);
  filter.connect(gain);
  gain.connect(zenAmbient.master);

  notes.forEach((note, index) => {
    const osc = audioContext.createOscillator();
    osc.type = index === 1 ? "triangle" : "sine";
    osc.frequency.setValueAtTime(note / (index === 0 ? 2 : 1), now + index * 0.08);
    osc.connect(filter);
    osc.start(now + index * 0.08);
    osc.stop(now + 2.9);
  });
}

function startZenAmbient() {
  if (!state.soundOn || zenAmbient) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === "suspended") audioContext.resume();

    const now = audioContext.currentTime;
    const preset = ZEN_SOUND_PRESETS[normalizeZenSound(state.zenSound)] || ZEN_SOUND_PRESETS.deep;
    const volume = settingPercent(state.soundVolume, 70) / 100;
    const master = audioContext.createGain();
    const droneFilter = audioContext.createBiquadFilter();
    const airFilter = audioContext.createBiquadFilter();
    const lfo = audioContext.createOscillator();
    const lfoGain = audioContext.createGain();
    const droneA = audioContext.createOscillator();
    const droneB = audioContext.createOscillator();
    const shimmer = audioContext.createOscillator();
    const droneGain = audioContext.createGain();
    const airGain = audioContext.createGain();
    const noise = createNoiseSource(audioContext);

    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(Math.max(0.0001, preset.master * volume), now + 1.8);
    master.connect(audioContext.destination);

    droneFilter.type = "lowpass";
    droneFilter.frequency.setValueAtTime(preset.filter, now);
    droneFilter.Q.setValueAtTime(0.8, now);

    lfo.type = "sine";
    lfo.frequency.setValueAtTime(preset.lfo, now);
    lfoGain.gain.setValueAtTime(preset.lfoGain, now);
    lfo.connect(lfoGain);
    lfoGain.connect(droneFilter.frequency);

    droneA.type = "sine";
    droneB.type = "sine";
    shimmer.type = "triangle";
    droneA.frequency.setValueAtTime(preset.a, now);
    droneB.frequency.setValueAtTime(preset.b, now);
    shimmer.frequency.setValueAtTime(preset.shimmer, now);

    droneGain.gain.setValueAtTime(0.18, now);
    droneA.connect(droneGain);
    droneB.connect(droneGain);
    shimmer.connect(droneGain);
    droneGain.connect(droneFilter);
    droneFilter.connect(master);

    airFilter.type = "bandpass";
    airFilter.frequency.setValueAtTime(preset.air, now);
    airFilter.Q.setValueAtTime(0.32, now);
    airGain.gain.setValueAtTime(preset.airGain * volume, now);
    noise.connect(airFilter);
    airFilter.connect(airGain);
    airGain.connect(master);

    [droneA, droneB, shimmer, lfo, noise].forEach((node) => node.start(now));

    zenAmbient = {
      master,
      nodes: [droneA, droneB, shimmer, lfo, noise],
      cueTimer: window.setInterval(playZenBreathCue, 12_000)
    };
    playZenBreathCue();
  } catch {
    state.soundOn = false;
    zenAmbient = null;
  }
}

function stopZenAmbient(fadeSeconds = 1.2) {
  if (!zenAmbient || !audioContext) return;
  const ambient = zenAmbient;
  zenAmbient = null;
  window.clearInterval(ambient.cueTimer);
  const now = audioContext.currentTime;
  ambient.master.gain.cancelScheduledValues(now);
  ambient.master.gain.setValueAtTime(Math.max(ambient.master.gain.value, 0.0001), now);
  ambient.master.gain.exponentialRampToValueAtTime(0.0001, now + fadeSeconds);
  window.setTimeout(() => {
    ambient.nodes.forEach((node) => {
      try {
        node.stop();
      } catch {}
    });
    try {
      ambient.master.disconnect();
    } catch {}
  }, fadeSeconds * 1000 + 80);
}

function loadState() {
  const saved = localStorage.getItem("green-farm-mvp");
  const user = tg?.initDataUnsafe?.user;
  const base = { ...defaultState };
  if (user?.first_name) base.playerName = user.first_name;
  if (!saved) return base;

  try {
    const restored = { ...base, ...JSON.parse(saved) };
    restored.growthDuration ||= GROW_DURATION_MS;
    restored.missions = normalizeMissionState(restored.missions);
    restored.soundVolume = settingPercent(restored.soundVolume, 70);
    restored.vibrationOn = restored.vibrationOn !== false;
    restored.vibrationLevel = settingPercent(restored.vibrationLevel, 60);
    restored.zenDuration = ZEN_DURATION_OPTIONS.includes(Number(restored.zenDuration))
      ? Number(restored.zenDuration)
      : ZEN_DEFAULT_DURATION_MS;
    restored.zenSound = normalizeZenSound(restored.zenSound);
    restored.zenGene = normalizeZenGene(restored.zenGene);
    restored.zenEnergy = Math.max(0, Math.floor(Number(restored.zenEnergy) || 0));
    restored.zenSessionDna = Math.max(0, Math.floor(Number(restored.zenSessionDna) || 0));
    restored.zenDnaClaims = restored.zenDnaClaims && typeof restored.zenDnaClaims === "object" ? restored.zenDnaClaims : {};
    restored.labUniqueMutations = Math.max(0, Math.floor(Number(restored.labUniqueMutations) || 0));
    restored.labRareUntil = Math.max(0, Number(restored.labRareUntil) || 0);
    restored.droneLevel = safeDroneLevel(restored.droneLevel);
    restored.droneSkin = normalizeDroneSkin(restored.droneSkin);
    restored.dataModuleLevel = safeDataModuleLevel(restored.dataModuleLevel);
    restored.unlockedSlots = normalizeUnlockedSlots(restored.unlockedSlots);
    if (!restored.plantedAt && restored.growth > 0) {
      restored.plantedAt = Date.now() - (restored.growth / 100) * restored.growthDuration;
    }
    return restored;
  } catch {
    return base;
  }
}

function saveState() {
  localStorage.setItem("green-farm-mvp", JSON.stringify(state));
}

function normalizeZenSound(value = state.zenSound) {
  return ZEN_SOUND_OPTIONS.includes(value) ? value : "deep";
}

function normalizeZenGene(value = state.zenGene) {
  return ZEN_GENE_OPTIONS.includes(value) ? value : "sprout";
}

function safeDroneLevel(value = state.droneLevel) {
  const level = Math.floor(Number(value) || 1);
  return clamp(level, 1, 9);
}

function droneSkinById(value = state.droneSkin) {
  return DRONE_SKINS.find((skin) => skin.id === value) || DRONE_SKINS[0];
}

function normalizeDroneSkin(value = state.droneSkin) {
  return droneSkinById(String(value || "")).id;
}

function normalizeUnlockedSlots(value = state.unlockedSlots) {
  const slots = { "0": true };
  if (!value || typeof value !== "object") return slots;
  Object.entries(value).forEach(([key, item]) => {
    const index = clamp(Math.floor(Number(key) || 0), 0, 8);
    if (item) slots[String(index)] = true;
  });
  return slots;
}

function isSlotUnlocked(index) {
  return Boolean(normalizeUnlockedSlots()[String(index)]);
}

function unlockSlot(index) {
  state.unlockedSlots = normalizeUnlockedSlots();
  state.unlockedSlots[String(index)] = true;
}

function droneUpgradeCost(level = safeDroneLevel()) {
  return {
    score: 32 + level * 24,
    energy: 3 + level * 2
  };
}

function droneSpeedBonus(level = safeDroneLevel()) {
  return level * 1_150;
}

function droneHarvestBonus(level = safeDroneLevel()) {
  return level * 2;
}

function safeDataModuleLevel(value = state.dataModuleLevel) {
  const level = Math.floor(Number(value) || 1);
  return clamp(level, 1, 9);
}

function dataModuleUpgradeCost(level = safeDataModuleLevel()) {
  return {
    score: 44 + level * 26,
    resonance: 1 + level
  };
}

function dataModuleSignalBonus(level = safeDataModuleLevel()) {
  return level * 6;
}

function normalizeMissionState(value = {}) {
  return {
    opened: value.opened && typeof value.opened === "object" ? value.opened : {},
    claimed: value.claimed && typeof value.claimed === "object" ? value.claimed : {}
  };
}

function mergeMissionState(localValue = {}, remoteValue = {}) {
  const local = normalizeMissionState(localValue);
  const remote = normalizeMissionState(remoteValue);
  return {
    opened: { ...remote.opened, ...local.opened },
    claimed: { ...remote.claimed, ...local.claimed }
  };
}

function claimedMissionCount() {
  return MISSIONS.filter((mission) => state.missions.claimed[mission.id]).length;
}

function missionRewardText(mission) {
  const parts = [];
  if (mission.reward.energy) parts.push(`+${mission.reward.energy} energy`);
  if (mission.reward.resonance) parts.push(`+${mission.reward.resonance} zen`);
  if (mission.reward.score) parts.push(`+${mission.reward.score} score`);
  return parts.join(" · ");
}

function getClientId() {
  const key = "green-farm-client-id";
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const id = window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  localStorage.setItem(key, id);
  return id;
}

function telegramUserLabel(user) {
  if (!user) return "No Telegram user";
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username || "Telegram user";
  const handle = user.username ? `@${user.username}` : `id ${user.id}`;
  return `${name} · ${handle}`;
}

function renderTelegramStatus() {
  const user = tg?.initDataUnsafe?.user;
  const isTelegram = Boolean(tg?.initData || user);
  const statusText = isTelegram ? "Telegram connected" : "Browser preview";
  const userText = telegramUserLabel(user);
  setText("#telegramStatusText", statusText);
  setText("#telegramUserText", userText);
  setClass("#telegramStatus", "connected", isTelegram);
  setClass("#telegramStatus", "preview", !isTelegram);
}

function apiUrl(path) {
  return `${API_BASE}${path}`;
}

function playerSnapshot() {
  return JSON.stringify({
    score: state.score,
    energy: state.energy,
    resonance: state.resonance,
    sessions: state.sessions,
    artifact: state.artifact,
    labUniqueMutations: state.labUniqueMutations,
    droneLevel: safeDroneLevel(),
    droneSkin: normalizeDroneSkin(),
    dataModuleLevel: safeDataModuleLevel(),
    unlockedSlots: normalizeUnlockedSlots(),
    missions: state.missions
  });
}

function renderLeaderboard() {
  setText("#backendState", backendState.status);
  setText("#leagueTitle", leagueName());
  const rows = $("#leaderboardRows");
  if (!rows) return;

  const players = backendState.leaderboard.length
    ? backendState.leaderboard
    : [
        { rank: 1, id: "mock:nova", name: "Nova", score: 920 },
        { rank: backendState.rank || Math.max(2, 12 - Math.floor(state.score / 80)), id: backendState.playerId || "local", name: state.playerName, score: state.score }
      ];

  rows.innerHTML = players.map((player) => {
    const isYou = player.id === backendState.playerId || (!backendState.playerId && player.name === state.playerName);
    const rank = String(player.rank).padStart(2, "0");
    const username = player.username ? ` @${escapeHtml(player.username)}` : "";
    const name = escapeHtml(player.name || "Player");
    return `
      <div class="leader-row ${isYou ? "you" : ""}">
        <span>${rank}</span>
        <b>${name}${username}</b>
        <strong>${player.score}</strong>
      </div>
    `;
  }).join("");
}

function leagueName(score = state.score) {
  if (score >= 1200) return "Zen League";
  if (score >= 700) return "Crystal League";
  if (score >= 300) return "Sprout League";
  if (score >= 100) return "Green League";
  return "Seed League";
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function updateLoadingSplash(progress, message) {
  if (loadingState.hidden) return;
  const safeProgress = clamp(Math.round(progress), loadingState.progress, 100);
  loadingState.progress = safeProgress;
  setText("#loadingPercent", `${safeProgress}%`);
  setText("#loadingText", message);
  setStyle("#loadingBar", "--loading-progress", `${safeProgress}%`);

  document.querySelectorAll(".loading-segments i").forEach((segment, index) => {
    segment.classList.toggle("is-active", index < Math.ceil((safeProgress / 100) * 8));
  });
}

function hideLoadingSplash() {
  if (loadingState.hidden) return;
  updateLoadingSplash(100, "Capsule ready");
  loadingState.hidden = true;
  const splash = $("#loadingSplash");
  window.setTimeout(() => {
    splash?.classList.add("is-hidden");
  }, 360);
  window.setTimeout(() => {
    if (splash?.classList.contains("is-hidden")) splash.hidden = true;
  }, 920);
}

function scheduleLoadingCompletion() {
  const elapsed = Date.now() - loadingState.startedAt;
  const delay = Math.max(3800, 4800 - elapsed);
  window.setTimeout(hideLoadingSplash, delay);
}

function scheduleBackendSync(force = false) {
  const now = Date.now();
  const snapshot = playerSnapshot();
  if (backendState.syncing) return;
  if (!force && snapshot === backendState.lastSnapshot && now - backendState.lastSyncAt < 15_000) return;
  if (!force && now - backendState.lastSyncAt < 5_000) return;
  backendState.syncing = true;
  backendState.lastSyncAt = now;
  backendState.lastSnapshot = snapshot;
  syncPlayer().finally(() => {
    backendState.syncing = false;
  });
}

async function syncPlayer() {
  try {
    updateLoadingSplash(78, "Connecting server");
    const response = await fetch(apiUrl("/api/player/sync"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: CLIENT_ID,
        initData: tg?.initData || "",
        state: {
          score: state.score,
          energy: state.energy,
          resonance: state.resonance,
          sessions: state.sessions,
          artifact: state.artifact,
          droneLevel: safeDroneLevel(),
          droneSkin: normalizeDroneSkin(),
          dataModuleLevel: safeDataModuleLevel(),
          unlockedSlots: normalizeUnlockedSlots(),
          missions: state.missions
        }
      })
    });
    if (!response.ok) throw new Error("Backend sync failed");
    const data = await response.json();
    backendState.available = true;
    backendState.status = data.player?.verified ? "Live TG" : "Live";
    backendState.playerId = data.player?.id || backendState.playerId;
    backendState.rank = data.rank || backendState.rank;
    backendState.leaderboard = data.leaderboard || backendState.leaderboard;
    if (data.player?.droneLevel) {
      state.droneLevel = Math.max(safeDroneLevel(), safeDroneLevel(data.player.droneLevel));
    }
    if (data.player?.droneSkin) {
      state.droneSkin = normalizeDroneSkin(data.player.droneSkin);
    }
    if (data.player?.dataModuleLevel) {
      state.dataModuleLevel = Math.max(safeDataModuleLevel(), safeDataModuleLevel(data.player.dataModuleLevel));
    }
    if (data.player?.missions) {
      state.missions = mergeMissionState(state.missions, data.player.missions);
    }
    if (data.player?.unlockedSlots) {
      state.unlockedSlots = { ...normalizeUnlockedSlots(state.unlockedSlots), ...normalizeUnlockedSlots(data.player.unlockedSlots) };
    }
    renderLeaderboard();
    updateLoadingSplash(94, "Leaderboard synced");
    scheduleLoadingCompletion();
  } catch {
    backendState.available = false;
    backendState.status = "Local";
    renderLeaderboard();
    updateLoadingSplash(88, "Offline preview ready");
    scheduleLoadingCompletion();
  }
}

function stateSummary() {
  return {
    score: state.score,
    energy: state.energy,
    resonance: state.resonance,
    sessions: state.sessions,
    artifact: state.artifact,
    droneLevel: safeDroneLevel(),
    unlockedSlots: normalizeUnlockedSlots(),
    missions: state.missions
  };
}

function trackAction(type, details = {}) {
  const payload = {
    clientId: CLIENT_ID,
    initData: tg?.initData || "",
    type,
    details,
    state: stateSummary()
  };

  fetch(apiUrl("/api/player/event"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true
  }).catch(() => {});
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function toast(message) {
  const node = $("#toast");
  if (!node) return;
  node.textContent = message;
  node.classList.add("show");
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => node.classList.remove("show"), 1800);
}

function growthProgress() {
  if (!state.plantedAt) return 0;
  return clamp(((Date.now() - state.plantedAt) / state.growthDuration) * 100, 0, 100);
}

function remainingSeconds(progress) {
  if (!state.plantedAt || progress >= 100) return 0;
  return Math.ceil((state.growthDuration - (Date.now() - state.plantedAt)) / 1000);
}

function formatTime(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function zenElapsed() {
  if (!state.zenStartedAt) return state.zenElapsed || 0;
  if (state.zenPausedAt) return state.zenElapsed || 0;
  return Date.now() - state.zenStartedAt;
}

function zenPhase(elapsed) {
  const loop = elapsed % BREATH_LOOP_MS;
  if (loop < 4_000) {
    return {
      label: "Inhale",
      scale: 1 + (loop / 4_000) * 0.16,
      breathProgress: (loop / 4_000) * 42
    };
  }
  if (loop < 6_000) {
    return { label: "Hold", scale: 1.16, breathProgress: 50 };
  }
  const exhale = (loop - 6_000) / 6_000;
  return {
    label: "Exhale",
    scale: 1.16 - exhale * 0.16,
    breathProgress: 50 + exhale * 50
  };
}

function zenDnaCycle(elapsed) {
  return Math.max(0, Math.floor(elapsed / ZEN_DNA_WINDOW_MS));
}

function zenDnaIsVisible(elapsed, isActive, isPaused) {
  if (!isActive || isPaused) return false;
  const windowProgress = elapsed % ZEN_DNA_WINDOW_MS;
  return windowProgress >= ZEN_DNA_SHOW_START_MS && windowProgress <= ZEN_DNA_SHOW_END_MS;
}

function zenDnaClaimKey(elapsed, index) {
  return `${zenDnaCycle(elapsed)}:${index}`;
}

function growthStage(progress) {
  if (!state.plantedAt) return "Seed";
  if (progress >= 100) return "Ready";
  if (progress >= 72) return "Bloom";
  if (progress >= 36) return "Grow";
  return "Sprout";
}

function currentPlantVariant() {
  const safeId = Number.isFinite(state.plantVariant) ? state.plantVariant : 0;
  state.plantVariant = ((safeId % PLANT_VARIANTS.length) + PLANT_VARIANTS.length) % PLANT_VARIANTS.length;
  return PLANT_VARIANTS[state.plantVariant];
}

function applyPlantVariant(variant, progress, motion) {
  const plant = $("#plantVisual");
  const capsule = $("#plantCapsule");
  if (!plant || !capsule) return;

  plant.dataset.variant = String(variant.id + 1).padStart(3, "0");
  plant.style.setProperty("--leaf-hue", variant.leafHue);
  plant.style.setProperty("--stem-hue", variant.stemHue);
  plant.style.setProperty("--accent-hue", variant.accentHue);
  plant.style.setProperty("--core-hue", variant.coreHue);
  plant.style.setProperty("--branch-spread", variant.branchSpread.toFixed(2));
  plant.style.setProperty("--leaf-scale", variant.leafScale.toFixed(2));
  plant.style.setProperty("--filament-speed", variant.filamentSpeed.toFixed(2));
  plant.style.setProperty("--maturity", (0.55 + progress / 220).toFixed(2));
  capsule.style.setProperty("--accent-hue", variant.accentHue);
  capsule.style.setProperty("--motion", motion.toFixed(2));
}

function renderSpecimenPods(progress, motion) {
  document.querySelectorAll(".specimen-pod").forEach((pod, index) => {
    const variant = PLANT_VARIANTS[(state.plantVariant + index * 13) % PLANT_VARIANTS.length];
    const slotUnlocked = isSlotUnlocked(index);
    const isFuturePremium = index >= 4;
    const isGrowing = Boolean(state.plantedAt && progress < 100);

    pod.classList.toggle("active-pod", index === 0);
    pod.classList.toggle("empty-pod", index > 0);
    pod.classList.toggle("locked-pod", index === 1 || index === 2);
    pod.classList.toggle("paid-pod", index === 3 && !slotUnlocked);
    pod.classList.toggle("unlocked-pod", index === 3 && slotUnlocked);
    pod.classList.toggle("future-pod", isFuturePremium);
    pod.classList.toggle("growing", index === 0 && isGrowing);
    pod.classList.toggle("bursting", index === 0 && state.boostUntil > Date.now());
    pod.style.setProperty("--chamber-index", index);

    if (index > 0) {
      pod.style.setProperty("--leaf-hue", variant.leafHue);
      pod.style.setProperty("--stem-hue", variant.stemHue);
      pod.style.setProperty("--accent-hue", variant.accentHue);
      pod.style.setProperty("--core-hue", variant.coreHue);
      pod.style.setProperty("--pod-growth", "0.42");
      pod.style.setProperty("--motion", "0.35");
      pod.classList.remove("ready", "artifact-ready");

      if (index === 3 && !slotUnlocked) {
        setText("#podSun3", "");
        setText("#podArtifact3", "★ 10");
        setText("#podId3", "START");
        return;
      }

      if (index === 3 && slotUnlocked) {
        setText("#podSun3", "ON");
        setText("#podArtifact3", "Ready");
        setText("#podId3", "OPEN");
        return;
      }

      if (isFuturePremium) {
        setText(`#podSun${index}`, "");
        setText(`#podArtifact${index}`, "Stars");
        setText(`#podId${index}`, "NEXT");
        return;
      }

      setText(`#podSun${index}`, "--");
      setText(`#podArtifact${index}`, "Empty");
      setText(`#podId${index}`, "LOCK");
      return;
    }

    const podProgress = state.plantedAt ? clamp(progress + index * 9 - (index % 2) * 14, 8, 100) : 0;
    const artifactChance = clamp(10 + index * 4 + state.artifact * 3 + Math.floor(podProgress / 14), 8, 64);
    const sunValue = clamp(54 + ((variant.coreHue + progress + index * 11) % 43), 48, 99);
    const artifactActive = podProgress >= 70 && ((state.score + index + variant.id) % 3 === 0 || progress >= 100);

    pod.style.setProperty("--leaf-hue", variant.leafHue);
    pod.style.setProperty("--stem-hue", variant.stemHue);
    pod.style.setProperty("--accent-hue", variant.accentHue);
    pod.style.setProperty("--core-hue", variant.coreHue);
    pod.style.setProperty("--pod-growth", (0.48 + podProgress / 150).toFixed(2));
    pod.style.setProperty("--pod-progress", `${podProgress}%`);
    pod.style.setProperty("--motion", motion.toFixed(2));
    pod.classList.toggle("ready", podProgress >= 100);
    pod.classList.toggle("artifact-ready", artifactActive);

    setText(`#podSun${index}`, sunValue);
    setText(`#podArtifact${index}`, artifactActive ? "NEW" : `${artifactChance}%`);
    setText(`#podId${index}`, String(variant.id + 1).padStart(3, "0"));
  });
  updateChamberNav();
}

function scrollSpecimenChambers(direction) {
  const grid = $("#specimenGrid");
  if (!grid) return;

  const podWidth = grid.querySelector(".specimen-pod")?.getBoundingClientRect().width || 140;
  grid.scrollBy({
    left: direction * (podWidth + 14),
    behavior: "smooth"
  });
  playTone("tap");
  window.setTimeout(updateChamberNav, 260);
}

function updateChamberNav() {
  const grid = $("#specimenGrid");
  const prev = $("#chamberPrevBtn");
  const next = $("#chamberNextBtn");
  if (!grid || !prev || !next) return;

  const maxScroll = Math.max(0, grid.scrollWidth - grid.clientWidth - 2);
  prev.disabled = grid.scrollLeft <= 2;
  next.disabled = grid.scrollLeft >= maxScroll;
}

function renderCapsuleBaseCubes(progress) {
  document.querySelectorAll(".capsule-base i").forEach((cube, index) => {
    const fill = clamp(progress * 6 - index * 100, 0, 100);
    cube.style.setProperty("--cube-fill", `${fill}%`);
    cube.classList.toggle("active", fill > 0);
    cube.classList.toggle("full", fill >= 100);
  });
}

function renderTokenFlow(progress, secondsLeft) {
  const map = $("#tokenFlowMap");
  if (!map) return;

  const level = safeDroneLevel();
  const isBoosting = state.boostUntil > Date.now();
  const isGrowing = Boolean(state.plantedAt && progress < 100);
  const isReady = progress >= 100;
  const reservoirFill = clamp(Math.round((state.energy / 30) * 100), 0, 100);
  const pipeFill = isReady
    ? 100
    : isGrowing
      ? clamp(Math.round(progress + 16 + level * 3), 20, 98)
      : clamp(Math.round(reservoirFill / 2), 8, 44);
  const pressure = clamp(24 + level * 7 + (isGrowing ? 24 : 0) + (isBoosting ? 20 : 0), 18, 100);
  const speed = Math.max(3.8, 9 - level * 0.45 - (isBoosting ? 1.5 : 0));

  map.classList.toggle("flow-active", isGrowing);
  map.classList.toggle("flow-ready", isReady);
  map.classList.toggle("flow-low", state.energy <= 2);
  map.style.setProperty("--token-fill", `${reservoirFill}%`);
  map.style.setProperty("--token-pipe", `${pipeFill}%`);
  map.style.setProperty("--token-pressure", `${pressure}%`);
  map.style.setProperty("--token-speed", `${speed.toFixed(1)}s`);

  setText("#tokenPoolValue", `${reservoirFill}%`);
  setText("#tokenFarmValue", isReady ? "MAX" : isGrowing ? `${secondsLeft}s` : "Idle");
  setText("#tokenDroneValue", `L${level}`);
  setText("#tokenZenValue", state.resonance);
}

function renderMutationLab(progress) {
  const variant = currentPlantVariant();
  const labLevel = 4 + Math.min(9, state.artifact);
  const uniqueCount = Math.max(0, Math.floor(Number(state.labUniqueMutations) || 0));
  const fusionProgress = clamp(46 + state.artifact * 7 + uniqueCount * 3 + Math.round(progress / 5), 42, 99);
  const rareChance = clamp(12 + state.artifact * 3 + uniqueCount * 6 + Math.round(progress / 12), 12, 88);
  const familyA = ["Neon Lettuce", "Crystal Sprout", "Solar Moss", "Aqua Fern"][variant.id % 4];
  const familyB = ["Prism Root", "Glow Chard", "Lunar Mint", "Cyan Basil"][(variant.id + state.artifact) % 4];
  const tier = rareChance >= 72 ? "Unique chance" : rareChance >= 42 ? "Epic chance" : rareChance >= 24 ? "Rare chance" : "Stable chance";
  const rareActive = state.labRareUntil > Date.now();

  setText("#fusionProgressLabel", `${fusionProgress}%`);
  setStyle("#fusionProgressBar", "--fusion", `${fusionProgress}%`);
  setText("#fusionDnaA", `DNA A: ${familyA}`);
  setText("#fusionDnaB", `DNA B: ${familyB}`);
  setText("#rareChance", `${rareChance}%`);
  setText("#mutationTier", tier);
  setText("#labLevelValue", labLevel);
  setText("#mutationAutoState", state.mutationAuto ? "On" : "Off");
  setText("#uniqueMutationCount", `${uniqueCount} rare cores`);
  setClass("#mutationAutoBtn", "active", state.mutationAuto);
  setClass("#labRoom", "rare-active", rareActive);
}

function completeZenSession() {
  const reward = 3 + Math.min(9, state.artifact);
  const dnaHits = Math.max(0, Math.floor(Number(state.zenSessionDna) || 0));
  const energyBonus = 1 + Math.min(5, Math.floor(dnaHits / 3));
  state.sessions += 1;
  state.resonance += reward + energyBonus;
  state.score += 8;
  state.zenEnergy = Math.max(0, Math.floor(Number(state.zenEnergy) || 0)) + energyBonus;
  trackAction("zen_completed", {
    reward,
    energyBonus,
    dnaHits,
    durationMs: state.zenDuration || ZEN_DEFAULT_DURATION_MS
  });
  state.zenStartedAt = 0;
  state.zenPausedAt = 0;
  state.zenElapsed = 0;
  state.zenSessionDna = 0;
  state.zenDnaClaims = {};
  stopZenAmbient(2.2);
  playTone("zen");
  toast(`Zen energy +${energyBonus} · Zen +${reward}`);
}

function renderZen() {
  const elapsed = zenElapsed();
  const duration = state.zenDuration || ZEN_DEFAULT_DURATION_MS;
  const isActive = state.zenStartedAt > 0;
  const isPaused = state.zenPausedAt > 0;
  const progress = clamp((elapsed / duration) * 100, 0, 100);
  const phase = zenPhase(elapsed);
  const remaining = Math.max(0, duration - elapsed);

  if (isActive && !isPaused && elapsed >= duration) {
    completeZenSession();
    return;
  }

  setText("#zenTimer", formatTime(remaining || duration));
  setText("#zenPhase", isActive ? phase.label : "Breathe");
  setText("#zenSessionTimer", formatTime(remaining || duration));
  setText("#zenSessionPhase", isActive ? phase.label : "Ready");
  setText("#zenActionIcon", isActive && !isPaused ? "\u23f8" : "\u25ce");
  setText("#zenActionText", isActive ? (isPaused ? "Resume" : "Pause") : "Start");
  setText("#zenState", isActive ? (isPaused ? "Paused" : phase.label) : state.sessions > 0 ? `x${state.sessions}` : "Calm");
  setText("#zenDepthValue", Math.round(progress));
  setText("#zenFlowValue", isActive ? phase.label : "Quiet");
  setText("#zenRewardValue", `+${3 + Math.min(9, state.artifact)}`);
  setText("#zenPotLevel", `N${clamp(1 + Math.floor((state.sessions || 0) / 3), 1, 9)}`);
  setStyle("#zenOrb", "--zen-progress", `${progress}%`);
  setStyle("#zenOrb", "--zen-scale", phase.scale.toFixed(3));
  setStyle("#zenBreathLine", "--breath", `${phase.breathProgress}%`);
  setStyle("#zenRoom", "--zen-progress", `${progress}%`);
  setClass("#zenRoom", "zen-running", isActive && !isPaused);
  setClass("#zenRoom", "zen-paused", isPaused);

  const zenGene = normalizeZenGene(state.zenGene);
  const zenRoom = $("#zenRoom");
  if (zenRoom) {
    ZEN_GENE_OPTIONS.forEach((gene) => zenRoom.classList.toggle(`zen-gene-${gene}`, gene === zenGene));
  }

  if (isActive && !isPaused && $(".app")?.classList.contains("room-zen")) {
    startZenAmbient();
  } else if (!isActive || isPaused || !state.soundOn) {
    stopZenAmbient(isPaused ? 0.7 : 1.4);
  }

  document.querySelectorAll(".zen-mode").forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.zenDuration) === duration);
    button.disabled = isActive && !isPaused;
  });

  document.querySelectorAll(".zen-sound").forEach((button) => {
    button.classList.toggle("active", button.dataset.zenSound === normalizeZenSound(state.zenSound));
  });

  document.querySelectorAll(".zen-gene-card").forEach((button) => {
    button.classList.toggle("active", button.dataset.zenGene === zenGene);
  });

  const dnaVisible = zenDnaIsVisible(elapsed, isActive, isPaused);
  document.querySelectorAll(".zen-dna-target").forEach((button) => {
    const index = Number(button.dataset.dnaIndex) || 0;
    const claimed = Boolean(state.zenDnaClaims?.[zenDnaClaimKey(elapsed, index)]);
    button.classList.toggle("active", dnaVisible && !claimed);
    button.classList.toggle("claimed", dnaVisible && claimed);
    button.disabled = !dnaVisible || claimed;
  });
}

function renderMissions() {
  const grid = $("#missionsGrid");
  const now = Date.now();
  const claimed = claimedMissionCount();
  const totalEnergy = MISSIONS.reduce((sum, mission) => sum + (state.missions.claimed[mission.id] ? Number(mission.reward.energy || 0) : 0), 0);

  setText("#missionsClaimed", `${claimed}/${MISSIONS.length}`);
  setText("#missionsEnergy", `+${totalEnergy}`);
  setStyle("#missionsProgress", "--missions-progress", `${(claimed / Math.max(1, MISSIONS.length)) * 100}%`);

  if (!grid) return;
  grid.innerHTML = MISSIONS.map((mission) => {
    const openedAt = Number(state.missions.opened[mission.id] || 0);
    const claimedMission = Boolean(state.missions.claimed[mission.id]);
    const readyAt = openedAt + MISSION_WAIT_MS;
    const secondsLeft = Math.max(0, Math.ceil((readyAt - now) / 1000));
    const isReady = openedAt > 0 && secondsLeft <= 0;
    const status = claimedMission ? "Claimed" : isReady ? "Ready" : openedAt ? `${secondsLeft}s` : "Locked";

    return `
      <article class="mission-card ${claimedMission ? "claimed" : ""} ${isReady ? "ready" : ""}" data-mission="${mission.id}">
        <div class="mission-icon ${mission.type}">${missionIcon(mission.type)}</div>
        <div class="mission-copy">
          <span>${escapeHtml(mission.note)}</span>
          <strong>${escapeHtml(mission.title)}</strong>
          <small>${escapeHtml(missionRewardText(mission))}</small>
        </div>
        <b class="mission-status">${escapeHtml(status)}</b>
        <div class="mission-actions">
          <button type="button" data-open-mission="${mission.id}" ${claimedMission ? "disabled" : ""}>${escapeHtml(mission.label)}</button>
          <button type="button" data-claim-mission="${mission.id}" ${!isReady || claimedMission ? "disabled" : ""}>Claim</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderDrone() {
  const level = safeDroneLevel();
  const skin = droneSkinById();
  const cost = droneUpgradeCost(level);
  const speedSeconds = Math.round(droneSpeedBonus(level) / 100) / 10;
  const harvestBonus = droneHarvestBonus(level);
  const canUpgrade = level < 9 && state.score >= cost.score && state.energy >= cost.energy;

  setText("#droneLevelBadge", `L${level}`);
  setText("#droneSheetLevel", `Level ${level}`);
  setText("#droneSpeedValue", `-${speedSeconds}s`);
  setText("#droneHarvestValue", `+${harvestBonus}`);
  setText("#droneCostValue", level >= 9 ? "MAX" : `${cost.score} score · ${cost.energy} energy`);
  setText("#droneUpgradeText", level >= 9 ? "Max level" : "Upgrade");
  setText("#droneSignalValue", state.plantedAt ? "Scanning" : "Idle");
  setText("#droneSkinName", skin.name);
  setText("#droneSkinNote", skin.note);
  setText("#droneSkinValue", skin.tag);
  setClass("#capsuleDrone", "active", Boolean(state.plantedAt));
  setClass("#capsuleDrone", "ready", growthProgress() >= 100);
  setStyle("#capsuleDrone", "--drone-power", `${Math.min(100, 26 + level * 8)}%`);

  const drone = $("#capsuleDrone");
  if (drone) {
    drone.dataset.level = String(level);
    drone.dataset.tier = String(Math.min(5, Math.ceil(level / 2)));
    drone.dataset.skin = skin.id;
  }

  const miniDrone = $(".mini-drone");
  if (miniDrone) miniDrone.dataset.skin = skin.id;
  const sheet = $("#droneSheet");
  if (sheet) sheet.dataset.skin = skin.id;

  renderDroneSkins(skin.id);

  const button = $("#droneUpgradeBtn");
  if (button) button.disabled = !canUpgrade;
}

function renderDroneSkins(activeId = normalizeDroneSkin()) {
  const grid = $("#droneSkinGrid");
  if (!grid) return;

  grid.innerHTML = DRONE_SKINS.map((skin) => {
    const active = skin.id === activeId;
    return `
      <button class="drone-skin-card ${active ? "active" : ""}" type="button" data-drone-skin="${skin.id}" aria-pressed="${active ? "true" : "false"}">
        <span class="skin-swatch skin-${skin.id}" aria-hidden="true"><i></i><b></b></span>
        <strong>${escapeHtml(skin.name)}</strong>
        <small>${escapeHtml(skin.route)}</small>
        <em>${escapeHtml(skin.effect)}</em>
      </button>
    `;
  }).join("");
}

function selectDroneSkin(id) {
  const skin = droneSkinById(id);
  state.droneSkin = skin.id;
  playTone(skin.id === "aurora" ? "boost" : "tap");
  toast(`${skin.name} skin`);
  trackAction("drone_skin_selected", {
    skin: skin.id,
    route: skin.route
  });
  render();
  scheduleBackendSync(true);
}

function upgradeDrone() {
  const level = safeDroneLevel();
  if (level >= 9) {
    toast("Drone max");
    return;
  }

  const cost = droneUpgradeCost(level);
  if (state.score < cost.score || state.energy < cost.energy) {
    toast("Need resources");
    trackAction("drone_upgrade_blocked", {
      level,
      needScore: cost.score,
      needEnergy: cost.energy,
      score: state.score,
      energy: state.energy
    });
    render();
    return;
  }

  state.score -= cost.score;
  state.energy -= cost.energy;
  state.droneLevel = level + 1;
  playTone("boost");
  toast(`Drone L${state.droneLevel}`);
  trackAction("drone_upgraded", {
    level: state.droneLevel,
    spentScore: cost.score,
    spentEnergy: cost.energy
  });
  render();
  scheduleBackendSync(true);
}

function renderDataModule(progress = growthProgress()) {
  const level = safeDataModuleLevel();
  const cost = dataModuleUpgradeCost(level);
  const syncActive = Boolean(state.plantedAt && progress < 100);
  const ready = progress >= 100;
  const signal = syncActive ? "SYNC" : ready ? "READY" : "IDLE";
  const canUpgrade = level < 9 && state.score >= cost.score && state.resonance >= cost.resonance;

  setText("#dataModuleLevelBadge", `D${level}`);
  setText("#dataModuleSignal", signal);
  setText("#dataModuleSheetLevel", `Level ${level}`);
  setText("#dataSyncValue", signal);
  setText("#dataSignalValue", `+${dataModuleSignalBonus(level)}%`);
  setText("#dataMemoryValue", String(8 + level * 4));
  setText("#dataModuleCostValue", level >= 9 ? "MAX" : `${cost.score} score · ${cost.resonance} zen`);
  setText("#dataModuleUpgradeText", level >= 9 ? "Max core" : "Upgrade core");
  setClass("#plantCapsule", "data-syncing", syncActive);
  setClass("#plantCapsule", "data-ready", ready);

  const module = $("#dataModuleBtn");
  if (module) {
    module.dataset.level = String(level);
    module.dataset.signal = signal.toLowerCase();
  }

  const button = $("#dataModuleUpgradeBtn");
  if (button) button.disabled = !canUpgrade;
}

function upgradeDataModule() {
  const level = safeDataModuleLevel();
  if (level >= 9) {
    toast("Core max");
    return;
  }

  const cost = dataModuleUpgradeCost(level);
  if (state.score < cost.score || state.resonance < cost.resonance) {
    toast("Need core resources");
    trackAction("data_module_upgrade_blocked", {
      level,
      needScore: cost.score,
      needResonance: cost.resonance,
      score: state.score,
      resonance: state.resonance
    });
    render();
    return;
  }

  state.score -= cost.score;
  state.resonance -= cost.resonance;
  state.dataModuleLevel = level + 1;
  playTone("boost");
  toast(`Core D${state.dataModuleLevel}`);
  trackAction("data_module_upgraded", {
    level: state.dataModuleLevel,
    spentScore: cost.score,
    spentResonance: cost.resonance
  });
  render();
  scheduleBackendSync(true);
}

function missionIcon(type) {
  const icons = {
    telegram: "✈",
    youtube: "▶",
    instagram: "◉",
    tiktok: "♪"
  };
  return icons[type] || "✦";
}

function openMission(id) {
  const mission = MISSIONS.find((item) => item.id === id);
  if (!mission) return;

  state.missions.opened[mission.id] = Date.now();
  playTone("tap");
  toast("Mission opened");
  trackAction("mission_opened", {
    missionId: mission.id,
    missionType: mission.type,
    rewardEnergy: mission.reward.energy || 0
  });

  if (tg?.openLink) {
    tg.openLink(mission.url);
  } else {
    window.open(mission.url, "_blank", "noopener");
  }
  render();
}

function claimMission(id) {
  const mission = MISSIONS.find((item) => item.id === id);
  if (!mission || state.missions.claimed[mission.id]) return;

  const openedAt = Number(state.missions.opened[mission.id] || 0);
  if (!openedAt || Date.now() - openedAt < MISSION_WAIT_MS) {
    toast("Open mission first");
    return;
  }

  state.energy += Number(mission.reward.energy || 0);
  state.resonance += Number(mission.reward.resonance || 0);
  state.score += Number(mission.reward.score || 0);
  state.missions.claimed[mission.id] = new Date().toISOString();
  playTone("collect");
  toast(`${missionRewardText(mission)} claimed`);
  trackAction("mission_claimed", {
    missionId: mission.id,
    missionType: mission.type,
    rewardEnergy: mission.reward.energy || 0,
    claimedCount: claimedMissionCount()
  });
  render();
  scheduleBackendSync(true);
}

function setFarmStageClass(stage) {
  const farmRoom = $("#farmRoom");
  if (!farmRoom) return;
  farmRoom.classList.remove("stage-seed", "stage-sprout", "stage-grow", "stage-bloom", "stage-ready", "boosted");
  farmRoom.classList.add(`stage-${stage.toLowerCase()}`);
  farmRoom.classList.toggle("boosted", state.boostUntil > Date.now());
}

function render() {
  const progress = Math.round(growthProgress());
  state.growth = progress;

  const rank = Math.max(2, 12 - Math.floor(state.score / 80));
  const stage = growthStage(progress);
  const isGrowing = state.plantedAt && progress < 100;
  const actionState = progress >= 100 ? "collect" : state.plantedAt ? "boost" : "grow";
  const action = progress >= 100 ? ["", "Collect"] : state.plantedAt ? ["", "Boost"] : ["", "Grow"];
  const processState = progress >= 100 ? "Ready" : isGrowing ? "Run" : "Idle";
  const plantScale = state.plantedAt ? 0.92 + (progress / 100) * 0.34 : 0.76;
  const motion = state.plantedAt ? 0.7 + progress / 180 : 0.42;
  const variant = currentPlantVariant();
  const secondsLeft = remainingSeconds(progress);
  const waterLevel = clamp(Math.round((state.energy / 20) * 100), 0, 99);
  const lightLevel = state.boostUntil > Date.now() ? 99 : clamp(56 + Math.round(progress / 3), 56, 92);
  const growthStep = clamp(Math.ceil(progress / 9), 1, 12);

  setText("#scoreValue", state.score);
  setText("#energyValue", state.energy);
  setText("#resonanceValue", state.resonance);
  setText("#growthPercent", `${progress}%`);
  setStyle("#growthRing", "--progress", `${progress}%`);
  setStyle("#growthRing", "--progress-angle", `${progress * 3.6}deg`);
  setText("#processPercent", `${progress}%`);
  setText("#processState", processState);
  setStyle("#processMeter", "--process", `${progress}%`);
  setStyle("#processMeter", "--process-angle", `${progress * 3.6}deg`);
  setClass(".process-rail", "running", progress > 0 && progress < 100);
  setClass(".process-rail", "ready", progress >= 100);
  setClass("#plantCapsule", "is-growing", isGrowing);
  setClass("#plantCapsule", "is-ready", progress >= 100);
  setClass("#plantCapsule", "is-idle", !state.plantedAt);
  setStyle("#plantCapsule", "--growth", `${progress}%`);
  setStyle("#plantCapsule", "--motion", motion.toFixed(2));
  setStyle("#plantVisual", "--plant-scale", plantScale.toFixed(2));
  setStyle("#plantVisual", "--motion", motion.toFixed(2));
  applyPlantVariant(variant, progress, motion);
  renderSpecimenPods(progress, motion);
  renderCapsuleBaseCubes(progress);
  renderTokenFlow(progress, secondsLeft);
  setText("#plantStage", stage);
  setText("#mainActionIcon", action[0]);
  setText("#mainActionText", action[1]);
  const mainActionButton = $("#mainActionBtn");
  if (mainActionButton) mainActionButton.dataset.action = actionState;
  setText("#leaderScore", state.score);
  setText("#rankValue", backendState.rank || rank);
  setText("#playerName", state.playerName);
  setText("#leaderName", state.playerName);
  setText("#avatar", state.playerName.slice(0, 1).toUpperCase());
  setText("#leagueBadge", leagueName());
  setText("#leagueTitle", leagueName());
  setText("#artifactLabel", state.artifact > 0 ? `x${state.artifact}` : "Empty");
  renderMutationLab(progress);
  renderZen();
  renderMissions();
  renderDrone();
  renderDataModule(progress);
  setText("#waterModule", waterLevel);
  setText("#lightModule", lightLevel);
  setText("#timeModule", progress >= 100 ? "OK" : state.plantedAt ? `${secondsLeft}s` : "--");
  setText("#growthBubbleA", `+${growthStep}%`);
  setText("#growthBubbleB", `+${growthStep + 1}%`);
  setText("#growthBubbleC", progress >= 100 ? "MAX" : `+${growthStep + 2}%`);
  setText("#autoCollectState", state.autoCollect ? "On" : "Off");
  setClass("#autoCollectBtn", "active", state.autoCollect);
  setClass("#autoCollectBtn", "armed", state.autoCollect && state.plantedAt && progress < 100);
  setText("#soundIcon", state.soundOn ? "\u266a" : "\u2022");
  setText("#soundState", state.soundOn ? "On" : "Off");
  setText("#soundVolumeValue", `${Math.round(settingPercent(state.soundVolume, 70))}%`);
  setInputValue("#soundVolume", settingPercent(state.soundVolume, 70));
  setText("#vibrationIcon", state.vibrationOn ? "\u25a6" : "\u25a1");
  setText("#vibrationState", state.vibrationOn ? "On" : "Off");
  setText("#vibrationValue", state.vibrationOn ? `${Math.round(settingPercent(state.vibrationLevel, 60))}%` : "Off");
  setInputValue("#vibrationLevel", settingPercent(state.vibrationLevel, 60));
  setClass("#soundBtn", "active", state.soundOn);
  setClass("#vibrationBtn", "active", state.vibrationOn);
  renderTelegramStatus();
  renderLeaderboard();
  scheduleBackendSync();

  setFarmStageClass(stage);
  saveState();
  scheduleAutoCollect(progress);
}

function collectHarvest(auto = false) {
  const harvest = 18 + state.artifact * 4 + droneHarvestBonus();
  state.score += harvest;
  state.resonance += state.artifact > 0 ? 1 : 0;
  state.plantedAt = 0;
  state.growth = 0;
  state.growthDuration = GROW_DURATION_MS;
  state.boostUntil = 0;
  state.plantVariant = (state.plantVariant + 1 + state.artifact) % PLANT_VARIANTS.length;
  playTone("collect");
  toast(auto ? `Auto +${harvest} \u2726` : `+${harvest} \u2726`);
  trackAction(auto ? "farm_auto_collected" : "farm_collected", {
    harvest,
    artifact: state.artifact
  });
  render();
}

function scheduleAutoCollect(progress) {
  if (!state.autoCollect || progress < 100 || !state.plantedAt || autoCollectTimer) return;
  autoCollectTimer = window.setTimeout(() => {
    autoCollectTimer = null;
    if (state.autoCollect && growthProgress() >= 100 && state.plantedAt) {
      collectHarvest(true);
    }
  }, 700);
}

function farmAction() {
  const progress = growthProgress();
  if (progress >= 100) {
    collectHarvest(false);
    return;
  }

  if (state.energy <= 0) {
    toast("Need \u26a1");
    trackAction("farm_blocked_no_energy", { progress: Math.round(progress) });
    return;
  }

  state.energy -= 1;
  if (!state.plantedAt) {
    state.growthDuration = Math.max(18_000, GROW_DURATION_MS - state.artifact * 1_500);
    state.growthDuration = Math.max(12_000, state.growthDuration - droneSpeedBonus());
    state.plantedAt = Date.now();
    playTone("grow");
    toast("Planted");
    trackAction("farm_grow_clicked", {
      growthDuration: state.growthDuration,
      plantVariant: state.plantVariant
    });
  } else {
    state.plantedAt -= BOOST_MS + state.artifact * 450 + safeDroneLevel() * 260;
    state.boostUntil = Date.now() + 2_800;
    playTone("boost");
    toast("Boost");
    trackAction("farm_boost_clicked", {
      progress: Math.round(progress),
      boostMs: BOOST_MS + state.artifact * 450
    });
  }
  render();
}

function applyStarsReward(product = {}) {
  if (product.id === "farm_slot_4" || product.reward?.slot !== undefined) {
    const slot = Number(product.reward?.slot ?? 3);
    unlockSlot(slot);
    playTone("stars");
    toast(`Slot ${slot + 1} unlocked`);
    trackAction("stars_slot_unlocked", {
      productId: product.id || "farm_slot_4",
      slot: slot + 1
    });
    render();
    scheduleBackendSync(true);
    return;
  }

  if (product.id === "unique_mutation_10" || product.reward?.uniqueMutation) {
    applyUniqueMutationReward(product);
    return;
  }

  const rewardEnergy = Number(product.reward?.energy || 12);
  state.energy += rewardEnergy;
  playTone("stars");
  toast(`Stars paid +${rewardEnergy} \u26a1`);
  render();
  scheduleBackendSync(true);
}

function mockStarsBuy(productId = "energy_pack_10") {
  if (productId === "farm_slot_4") {
    applyStarsReward({
      id: "farm_slot_4",
      reward: { slot: 3 }
    });
    trackAction("stars_preview_mock", {
      stars: 10,
      productId,
      slot: 4,
      mode: "preview"
    });
    return;
  }

  if (productId === "unique_mutation_10") {
    applyStarsReward({
      id: "unique_mutation_10",
      reward: { uniqueMutation: 1, artifact: 2, resonance: 3, score: 24 }
    });
    trackAction("stars_preview_mock", {
      stars: 10,
      productId,
      uniqueMutation: 1,
      mode: "preview"
    });
    return;
  }

  state.energy += 12;
  playTone("stars");
  toast("Mock \u2605 +12 \u26a1");
  trackAction("stars_preview_mock", {
    stars: 10,
    productId,
    energyAdded: 12,
    mode: "mock"
  });
  render();
}

async function buyStarsProduct(productId = "energy_pack_10") {
  const platform = telegramPlatform();
  trackAction("stars_button_clicked", {
    stars: 10,
    productId,
    mode: tg?.initData ? "telegram" : "preview",
    platform
  });

  if (!tg?.initData || typeof tg.openInvoice !== "function") {
    toast("Stars only in Telegram");
    mockStarsBuy(productId);
    return;
  }

  try {
    toast("Opening Stars");
    const response = await fetch(apiUrl("/api/stars/invoice"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: CLIENT_ID,
        initData: tg.initData,
        productId,
        platform,
        state: stateSummary()
      })
    });
    const data = await response.json();
    if (!response.ok || !data.invoiceLink) throw new Error(data.error || "Invoice failed");

    trackAction("stars_invoice_opened", {
      orderId: data.orderId,
      productId: data.product?.id || productId,
      stars: data.product?.stars || 10,
      platform
    });

    tg.openInvoice(data.invoiceLink, (status) => {
      trackAction("stars_invoice_closed", {
        orderId: data.orderId,
        status,
        platform
      });

      if (status === "paid") {
        applyStarsReward(data.product || { id: productId });
        return;
      }

      if (status === "pending") {
        toast("Payment pending");
        return;
      }

      toast(status === "cancelled" ? "Payment cancelled" : "Payment failed");
    });
  } catch (error) {
    toast("Stars unavailable");
    trackAction("stars_invoice_error", {
      message: error.message
    });
  }
}

function buyStarsEnergy() {
  return buyStarsProduct("energy_pack_10");
}

function buyFarmSlot4() {
  if (isSlotUnlocked(3)) {
    toast("Slot already open");
    return null;
  }
  return buyStarsProduct("farm_slot_4");
}

function applyUniqueMutationReward(product = {}) {
  const reward = product.reward || {};
  const artifactGain = Math.max(1, Number(reward.artifact || 2));
  const resonanceGain = Math.max(1, Number(reward.resonance || 3));
  const scoreGain = Math.max(8, Number(reward.score || 24));

  state.artifact += artifactGain;
  state.resonance += resonanceGain;
  state.score += scoreGain;
  state.labUniqueMutations = Math.max(0, Math.floor(Number(state.labUniqueMutations) || 0)) + 1;
  state.labRareUntil = Date.now() + 7_000;
  state.plantVariant = (state.plantVariant + 17 + state.labUniqueMutations) % PLANT_VARIANTS.length;
  playTone("stars");
  toast(`Unique mutation +${artifactGain}`);
  trackAction("lab_unique_mutation_created", {
    productId: product.id || "unique_mutation_10",
    artifactGain,
    resonanceGain,
    scoreGain,
    uniqueMutations: state.labUniqueMutations
  });
  render();
  scheduleBackendSync(true);
}

function buyUniqueMutation() {
  return buyStarsProduct("unique_mutation_10");
}

function telegramPlatform() {
  const value = String(tg?.platform || "web").toLowerCase();
  if (value.includes("ios") || value.includes("iphone") || value.includes("ipad")) return "ios";
  if (value.includes("android")) return "android";
  if (value.includes("tdesktop") || value.includes("macos") || value.includes("windows") || value.includes("linux")) return "desktop";
  return value || "web";
}

function synthArtifact() {
  if (state.energy < 5) {
    toast("Need 5 \u26a1");
    trackAction("lab_blocked_no_energy", {
      energy: state.energy,
      cost: 5
    });
    return;
  }
  state.energy -= 5;
  state.artifact += 1;
  state.plantVariant = (state.plantVariant + 7) % PLANT_VARIANTS.length;
  state.score += 8;
  playTone("lab");
  toast("Artifact +1");
  trackAction("lab_mutation_clicked", {
    artifact: state.artifact,
    energyCost: 5
  });
  render();
}

function claimZenDna(index) {
  const elapsed = zenElapsed();
  if (!state.zenStartedAt || state.zenPausedAt || !zenDnaIsVisible(elapsed, true, false)) return;

  const claimKey = zenDnaClaimKey(elapsed, index);
  state.zenDnaClaims ||= {};
  if (state.zenDnaClaims[claimKey]) return;

  state.zenDnaClaims[claimKey] = true;
  state.zenSessionDna = Math.max(0, Math.floor(Number(state.zenSessionDna) || 0)) + 1;
  playTone("zen");
  toast("DNA locked");
  trackAction("zen_dna_collected", {
    index,
    cycle: zenDnaCycle(elapsed)
  });
  render();
}

function meditate() {
  if (!state.zenStartedAt) {
    state.zenStartedAt = Date.now();
    state.zenPausedAt = 0;
    state.zenElapsed = 0;
    state.zenSessionDna = 0;
    state.zenDnaClaims = {};
    playTone("zen");
    startZenAmbient();
    toast("Zen started");
    trackAction("zen_started", {
      durationMs: state.zenDuration || ZEN_DEFAULT_DURATION_MS
    });
    render();
    return;
  }

  if (state.zenPausedAt) {
    state.zenStartedAt = Date.now() - state.zenElapsed;
    state.zenPausedAt = 0;
    playTone("tap");
    startZenAmbient();
    toast("Zen resumed");
    trackAction("zen_resumed", {
      elapsedMs: state.zenElapsed
    });
    render();
    return;
  }

  state.zenElapsed = zenElapsed();
  state.zenPausedAt = Date.now();
  playTone("tap");
  stopZenAmbient(0.8);
  toast("Zen paused");
  trackAction("zen_paused", {
    elapsedMs: state.zenElapsed
  });
  render();
}

function switchRoom(name) {
  closeSheets();
  playTone("nav");
  const app = $(".app");
  if (app) {
    app.classList.remove("room-farm", "room-lab", "room-zen", "room-missions");
    app.classList.add(`room-${name}`);
  }
  Object.entries(rooms).forEach(([key, room]) => {
    if (room) room.classList.toggle("active", key === name);
  });
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.room === name);
  });
  if (name === "zen" && state.zenStartedAt && !state.zenPausedAt) startZenAmbient();
  if (name !== "zen") stopZenAmbient(1);
  trackAction("room_opened", { room: name });
}

function openSheet(selector) {
  const sheet = $(selector);
  if (!sheet) return;
  closeSheets(selector);
  sheet.hidden = false;
  sheet.classList.add("open");
  window.requestAnimationFrame(() => sheet.classList.add("open"));
}

function closeSheets(exceptSelector = "") {
  document.querySelectorAll(".control-sheet").forEach((sheet) => {
    if (exceptSelector && sheet.matches(exceptSelector)) return;
    sheet.classList.remove("open");
    window.setTimeout(() => {
      if (!sheet.classList.contains("open")) sheet.hidden = true;
    }, 180);
  });
}

$("#mainActionBtn")?.addEventListener("click", farmAction);
$("#starsBtn")?.addEventListener("click", buyStarsEnergy);
$("#autoCollectBtn")?.addEventListener("click", () => {
  state.autoCollect = !state.autoCollect;
  playTone("tap");
  toast(state.autoCollect ? "Auto collect on" : "Auto collect off");
  trackAction("farm_auto_collect_toggled", {
    enabled: state.autoCollect
  });
  render();
});
$("#mutationAutoBtn")?.addEventListener("click", () => {
  state.mutationAuto = !state.mutationAuto;
  playTone("tap");
  toast(state.mutationAuto ? "Mutation auto on" : "Mutation auto off");
  trackAction("lab_auto_toggled", {
    enabled: state.mutationAuto
  });
  render();
});
$("#synthBtn")?.addEventListener("click", synthArtifact);
$("#rareMutationBtn")?.addEventListener("click", buyUniqueMutation);
$("#meditateBtn")?.addEventListener("click", meditate);
$("#capsuleDrone")?.addEventListener("click", () => {
  openSheet("#droneSheet");
  playTone("tap");
  trackAction("drone_menu_opened", {
    level: safeDroneLevel()
  });
  render();
});
$("#dataModuleBtn")?.addEventListener("click", () => {
  openSheet("#dataModuleSheet");
  playTone("tap");
  trackAction("data_module_opened", {
    level: safeDataModuleLevel()
  });
  render();
});
$("#droneUpgradeBtn")?.addEventListener("click", upgradeDrone);
$("#dataModuleUpgradeBtn")?.addEventListener("click", upgradeDataModule);
$("#droneSkinGrid")?.addEventListener("click", (event) => {
  const skinButton = event.target.closest("[data-drone-skin]");
  if (!skinButton) return;
  selectDroneSkin(skinButton.dataset.droneSkin);
});
$("#specimenGrid")?.addEventListener("click", (event) => {
  const paidPod = event.target.closest('.paid-pod[data-buy-slot="stars"]');
  if (!paidPod) return;
  playTone("tap");
  buyFarmSlot4();
  trackAction("farm_slot_buy_clicked", {
    slot: Number(paidPod.dataset.pod || 3) + 1,
    stars: 10
  });
});
$("#chamberPrevBtn")?.addEventListener("click", () => scrollSpecimenChambers(-1));
$("#chamberNextBtn")?.addEventListener("click", () => scrollSpecimenChambers(1));
$("#specimenGrid")?.addEventListener("scroll", updateChamberNav, { passive: true });
$("#missionsGrid")?.addEventListener("click", (event) => {
  const openButton = event.target.closest("[data-open-mission]");
  const claimButton = event.target.closest("[data-claim-mission]");
  if (openButton) openMission(openButton.dataset.openMission);
  if (claimButton) claimMission(claimButton.dataset.claimMission);
});
$("#leagueBtn")?.addEventListener("click", () => {
  renderLeaderboard();
  openSheet("#leagueSheet");
  playTone("tap");
  trackAction("league_opened", {
    rank: backendState.rank,
    league: leagueName()
  });
});
$("#settingsBtn")?.addEventListener("click", () => {
  openSheet("#settingsSheet");
  playTone("tap");
  trackAction("settings_opened");
});
document.querySelectorAll("[data-close-sheet]").forEach((button) => {
  button.addEventListener("click", () => {
    closeSheets();
    playTone("tap");
  });
});
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeSheets();
});
document.querySelectorAll(".zen-mode").forEach((button) => {
  button.addEventListener("click", () => {
    if (state.zenStartedAt && !state.zenPausedAt) return;
    state.zenDuration = Number(button.dataset.zenDuration) || ZEN_DEFAULT_DURATION_MS;
    state.zenStartedAt = 0;
    state.zenPausedAt = 0;
    state.zenElapsed = 0;
    state.zenSessionDna = 0;
    state.zenDnaClaims = {};
    playTone("tap");
    trackAction("zen_duration_selected", {
      durationMs: state.zenDuration
    });
    render();
  });
});
document.querySelectorAll(".zen-sound").forEach((button) => {
  button.addEventListener("click", () => {
    state.zenSound = normalizeZenSound(button.dataset.zenSound);
    if (state.zenStartedAt && !state.zenPausedAt && $(".app")?.classList.contains("room-zen")) {
      stopZenAmbient(0.25);
      window.setTimeout(startZenAmbient, 280);
    }
    playTone("tap");
    trackAction("zen_sound_selected", {
      sound: state.zenSound
    });
    render();
  });
});
document.querySelectorAll(".zen-gene-card").forEach((button) => {
  button.addEventListener("click", () => {
    state.zenGene = normalizeZenGene(button.dataset.zenGene);
    playTone("zen");
    trackAction("zen_gene_selected", {
      gene: state.zenGene
    });
    render();
  });
});
document.querySelectorAll(".zen-dna-target").forEach((button) => {
  button.addEventListener("click", () => claimZenDna(Number(button.dataset.dnaIndex) || 0));
});
$("#soundBtn")?.addEventListener("click", () => {
  state.soundOn = !state.soundOn;
  if (!state.soundOn) stopZenAmbient(0.4);
  if (state.soundOn && state.zenStartedAt && !state.zenPausedAt && $(".app")?.classList.contains("room-zen")) {
    startZenAmbient();
  }
  playTone("tap");
  toast(state.soundOn ? "Sound on" : "Sound off");
  trackAction("sound_toggled", {
    enabled: state.soundOn
  });
  render();
});
$("#soundVolume")?.addEventListener("input", (event) => {
  state.soundVolume = settingPercent(event.target.value, 70);
  if (state.soundVolume > 0) state.soundOn = true;
  render();
});
$("#soundVolume")?.addEventListener("change", () => playTone("tap"));
$("#vibrationBtn")?.addEventListener("click", () => {
  state.vibrationOn = !state.vibrationOn;
  triggerHaptic("tap");
  toast(state.vibrationOn ? "Vibration on" : "Vibration off");
  trackAction("vibration_toggled", {
    enabled: state.vibrationOn
  });
  render();
});
$("#vibrationLevel")?.addEventListener("input", (event) => {
  state.vibrationLevel = settingPercent(event.target.value, 60);
  if (state.vibrationLevel > 0) state.vibrationOn = true;
  render();
});
$("#vibrationLevel")?.addEventListener("change", () => triggerHaptic("tap"));
$("#resetBtn")?.addEventListener("click", () => {
  state = {
    ...defaultState,
    soundOn: state.soundOn,
    soundVolume: state.soundVolume,
    vibrationOn: state.vibrationOn,
    vibrationLevel: state.vibrationLevel,
    playerName: state.playerName,
    missions: normalizeMissionState()
  };
  playTone("tap");
  toast("Reset");
  trackAction("progress_reset_clicked");
  render();
});

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => switchRoom(button.dataset.room));
});

updateLoadingSplash(18, "Initializing capsule");
window.setTimeout(() => updateLoadingSplash(42, "Growing microculture"), 220);
window.setTimeout(() => updateLoadingSplash(64, tg?.initData ? "Telegram signal found" : "Browser preview"), 520);
trackAction("app_opened", {
  room: "farm",
  telegram: Boolean(tg?.initData || tg?.initDataUnsafe?.user)
});
render();
window.setInterval(render, 500);
