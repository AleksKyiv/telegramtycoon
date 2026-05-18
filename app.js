const tg = window.Telegram?.WebApp;
tg?.ready();
tg?.expand();

if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

window.addEventListener("load", () => window.scrollTo({ top: 0, left: 0 }));

const GROW_DURATION_MS = 30_000;
const BOOST_MS = 4_500;
const ZEN_DEFAULT_DURATION_MS = 300_000;
const BREATH_LOOP_MS = 12_000;
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

const defaultState = {
  score: 0,
  energy: 10,
  resonance: 0,
  growth: 0,
  plantedAt: 0,
  growthDuration: GROW_DURATION_MS,
  boostUntil: 0,
  artifact: 0,
  sessions: 0,
  plantVariant: 0,
  autoCollect: false,
  mutationAuto: false,
  zenDuration: ZEN_DEFAULT_DURATION_MS,
  zenStartedAt: 0,
  zenPausedAt: 0,
  zenElapsed: 0,
  soundOn: true,
  playerName: "You"
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
const setClass = (selector, className, enabled) => {
  const node = $(selector);
  if (node) node.classList.toggle(className, enabled);
};

const rooms = {
  farm: $("#farmRoom"),
  lab: $("#labRoom"),
  zen: $("#zenRoom")
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

function playTone(type = "tap") {
  if (!state.soundOn) return;
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
    gain.gain.exponentialRampToValueAtTime(type === "zen" ? 0.055 : 0.075, now + 0.018);
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
  gain.gain.exponentialRampToValueAtTime(0.026, now + 0.08);
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
    master.gain.exponentialRampToValueAtTime(0.115, now + 1.8);
    master.connect(audioContext.destination);

    droneFilter.type = "lowpass";
    droneFilter.frequency.setValueAtTime(340, now);
    droneFilter.Q.setValueAtTime(0.8, now);

    lfo.type = "sine";
    lfo.frequency.setValueAtTime(0.045, now);
    lfoGain.gain.setValueAtTime(82, now);
    lfo.connect(lfoGain);
    lfoGain.connect(droneFilter.frequency);

    droneA.type = "sine";
    droneB.type = "sine";
    shimmer.type = "triangle";
    droneA.frequency.setValueAtTime(87.31, now);
    droneB.frequency.setValueAtTime(130.81, now);
    shimmer.frequency.setValueAtTime(261.63, now);

    droneGain.gain.setValueAtTime(0.18, now);
    droneA.connect(droneGain);
    droneB.connect(droneGain);
    shimmer.connect(droneGain);
    droneGain.connect(droneFilter);
    droneFilter.connect(master);

    airFilter.type = "bandpass";
    airFilter.frequency.setValueAtTime(760, now);
    airFilter.Q.setValueAtTime(0.32, now);
    airGain.gain.setValueAtTime(0.055, now);
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
    artifact: state.artifact
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
  loadingState.hidden = true;
  updateLoadingSplash(100, "Capsule ready");
  window.setTimeout(() => {
    $("#loadingSplash")?.classList.add("is-hidden");
  }, 360);
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
          artifact: state.artifact
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
    artifact: state.artifact
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
    const podProgress = state.plantedAt ? clamp(progress + index * 9 - (index % 2) * 14, 8, 100) : 0;
    const artifactChance = clamp(10 + index * 4 + state.artifact * 3 + Math.floor(podProgress / 14), 8, 64);
    const sunValue = clamp(54 + ((variant.coreHue + progress + index * 11) % 43), 48, 99);
    const artifactActive = podProgress >= 70 && ((state.score + index + variant.id) % 3 === 0 || progress >= 100);

    pod.style.setProperty("--leaf-hue", variant.leafHue);
    pod.style.setProperty("--stem-hue", variant.stemHue);
    pod.style.setProperty("--accent-hue", variant.accentHue);
    pod.style.setProperty("--core-hue", variant.coreHue);
    pod.style.setProperty("--pod-growth", (0.48 + podProgress / 150).toFixed(2));
    pod.style.setProperty("--motion", motion.toFixed(2));
    pod.classList.toggle("ready", podProgress >= 100);
    pod.classList.toggle("artifact-ready", artifactActive);

    setText(`#podSun${index}`, sunValue);
    setText(`#podArtifact${index}`, artifactActive ? "NEW" : `${artifactChance}%`);
    setText(`#podId${index}`, String(variant.id + 1).padStart(3, "0"));
  });
}

function renderCapsuleBaseCubes(progress) {
  document.querySelectorAll(".capsule-base i").forEach((cube, index) => {
    const fill = clamp(progress * 6 - index * 100, 0, 100);
    cube.style.setProperty("--cube-fill", `${fill}%`);
    cube.classList.toggle("active", fill > 0);
    cube.classList.toggle("full", fill >= 100);
  });
}

function renderMutationLab(progress) {
  const variant = currentPlantVariant();
  const labLevel = 4 + Math.min(9, state.artifact);
  const fusionProgress = clamp(46 + state.artifact * 7 + Math.round(progress / 5), 42, 99);
  const rareChance = clamp(12 + state.artifact * 3 + Math.round(progress / 12), 12, 64);
  const familyA = ["Neon Lettuce", "Crystal Sprout", "Solar Moss", "Aqua Fern"][variant.id % 4];
  const familyB = ["Prism Root", "Glow Chard", "Lunar Mint", "Cyan Basil"][(variant.id + state.artifact) % 4];
  const tier = rareChance >= 42 ? "Epic chance" : rareChance >= 24 ? "Rare chance" : "Stable chance";

  setText("#fusionProgressLabel", `${fusionProgress}%`);
  setStyle("#fusionProgressBar", "--fusion", `${fusionProgress}%`);
  setText("#fusionDnaA", `DNA A: ${familyA}`);
  setText("#fusionDnaB", `DNA B: ${familyB}`);
  setText("#rareChance", `${rareChance}%`);
  setText("#mutationTier", tier);
  setText("#labLevelValue", labLevel);
  setText("#mutationAutoState", state.mutationAuto ? "On" : "Off");
  setClass("#mutationAutoBtn", "active", state.mutationAuto);
}

function completeZenSession() {
  const reward = 3 + Math.min(9, state.artifact);
  state.sessions += 1;
  state.resonance += reward;
  state.score += 8;
  trackAction("zen_completed", {
    reward,
    durationMs: state.zenDuration || ZEN_DEFAULT_DURATION_MS
  });
  state.zenStartedAt = 0;
  state.zenPausedAt = 0;
  state.zenElapsed = 0;
  stopZenAmbient(2.2);
  playTone("zen");
  toast(`Zen +${reward} \u26a1`);
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
  setText("#zenActionIcon", isActive && !isPaused ? "\u23f8" : "\u25ce");
  setText("#zenActionText", isActive ? (isPaused ? "Resume" : "Pause") : "Start");
  setText("#zenState", isActive ? (isPaused ? "Paused" : phase.label) : state.sessions > 0 ? `x${state.sessions}` : "Calm");
  setText("#zenDepthValue", Math.round(progress));
  setText("#zenFlowValue", isActive ? phase.label : "Quiet");
  setText("#zenRewardValue", `+${3 + Math.min(9, state.artifact)}`);
  setStyle("#zenOrb", "--zen-progress", `${progress}%`);
  setStyle("#zenOrb", "--zen-scale", phase.scale.toFixed(3));
  setStyle("#zenBreathLine", "--breath", `${phase.breathProgress}%`);
  setClass("#zenRoom", "zen-running", isActive && !isPaused);
  setClass("#zenRoom", "zen-paused", isPaused);

  if (isActive && !isPaused && $(".app")?.classList.contains("room-zen")) {
    startZenAmbient();
  } else if (!isActive || isPaused || !state.soundOn) {
    stopZenAmbient(isPaused ? 0.7 : 1.4);
  }

  document.querySelectorAll(".zen-mode").forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.zenDuration) === duration);
    button.disabled = isActive && !isPaused;
  });
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
  const action = progress >= 100 ? ["\u2726", "Collect"] : state.plantedAt ? ["\u21af", "Boost"] : ["\u25cf", "Grow"];
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
  setText("#plantStage", stage);
  setText("#mainActionIcon", action[0]);
  setText("#mainActionText", action[1]);
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
  renderTelegramStatus();
  renderLeaderboard();
  scheduleBackendSync();

  setFarmStageClass(stage);
  saveState();
  scheduleAutoCollect(progress);
}

function collectHarvest(auto = false) {
  const harvest = 18 + state.artifact * 4;
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
    state.plantedAt = Date.now();
    playTone("grow");
    toast("Planted");
    trackAction("farm_grow_clicked", {
      growthDuration: state.growthDuration,
      plantVariant: state.plantVariant
    });
  } else {
    state.plantedAt -= BOOST_MS + state.artifact * 450;
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

function mockStarsBuy() {
  state.energy += 12;
  playTone("stars");
  toast("Mock \u2605 +12 \u26a1");
  trackAction("stars_button_clicked", {
    stars: 10,
    energyAdded: 12,
    mode: "mock"
  });
  render();
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

function meditate() {
  if (!state.zenStartedAt) {
    state.zenStartedAt = Date.now();
    state.zenPausedAt = 0;
    state.zenElapsed = 0;
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
    app.classList.remove("room-farm", "room-lab", "room-zen");
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
$("#starsBtn")?.addEventListener("click", mockStarsBuy);
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
$("#meditateBtn")?.addEventListener("click", meditate);
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
    playTone("tap");
    trackAction("zen_duration_selected", {
      durationMs: state.zenDuration
    });
    render();
  });
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
$("#resetBtn")?.addEventListener("click", () => {
  state = { ...defaultState, soundOn: state.soundOn, playerName: state.playerName };
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
