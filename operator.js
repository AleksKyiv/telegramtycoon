const statusCards = [
  { label: "Online now", value: "1,284", note: "41 new sessions in 10m" },
  { label: "Revenue today", value: "3,820 XTR", note: "12.4% above baseline" },
  { label: "System health", value: "99.94%", note: "Primary services healthy" },
  { label: "Open alerts", value: "3", note: "1 needs review now" }
];

const assistantQuick = [
  "Summarize the system",
  "Show payment anomalies",
  "Check meditation economy",
  "Open suspicious players"
];

const assistantProfiles = {
  bloom: {
    label: "Bloom",
    sigil: "BLM",
    status: "online / bloom oracle",
    title: "Bloom Oracle",
    summary: "I am tracking soft growth signals, safe payment flow and the next premium pulse.",
    mood: "Warm empathy",
    signal: "Watching plant rhythm and healthy user progress.",
    locketLabel: "Sealed",
    locketText: "No reward pulse has surfaced yet.",
    locketState: "sealed",
    quick: [
      "Summarize growth rhythm",
      "Show safe spend loops",
      "Check healthy cohorts",
      "Open soft anomalies"
    ]
  },
  cipher: {
    label: "Cipher",
    sigil: "CPF",
    status: "online / cipher analyst",
    title: "Cipher Analyst",
    summary: "I cut through payment spikes, reactor pressure and suspicious economy drift without extra noise.",
    mood: "Sharp focus",
    signal: "Reading payment pressure and unstable mutation paths.",
    locketLabel: "Charged",
    locketText: "Priority signals are gathering around revenue and alerts.",
    locketState: "charged",
    quick: [
      "Show payment anomalies",
      "Trace reactor pressure",
      "Open suspicious players",
      "Find unstable cohorts"
    ]
  },
  velvet: {
    label: "Velvet",
    sigil: "VLT",
    status: "online / velvet curator",
    title: "Velvet Curator",
    summary: "I frame premium desire, collectible value and VIP mood so the offer feels deliberate, not loud.",
    mood: "Treasure gaze",
    signal: "Tracking premium pull, rarity desire and reward timing.",
    locketLabel: "Open",
    locketText: "A premium reward path is ready for a player-facing moment.",
    locketState: "open",
    quick: [
      "Review VIP intent",
      "Check collectible pull",
      "Open reward timing",
      "Show premium signals"
    ]
  }
};

const economyMetrics = [
  { label: "Minted energy", value: "248k", trend: "+6.8% vs yesterday" },
  { label: "Spent energy", value: "219k", trend: "88% of minted total" },
  { label: "Meditation charge", value: "31k", trend: "+14% social contribution" },
  { label: "Rare strains", value: "472", trend: "Within expected range" }
];

const watchlist = [
  {
    name: "tg_884120",
    text: "High mutation gain and elevated spend rate in the last 2 hours.",
    tags: ["review", "economy"]
  },
  {
    name: "tg_903551",
    text: "Returned after 9 days and triggered four premium purchases quickly.",
    tags: ["vip", "payments"]
  },
  {
    name: "tg_771204",
    text: "Meditation-heavy progression path with clean rare outcomes.",
    tags: ["healthy", "insight"]
  }
];

const experiments = [
  {
    title: "Calm energy boost",
    text: "Testing higher meditation contribution to clean rare states.",
    tags: ["live", "player"]
  },
  {
    title: "Waste pressure check",
    text: "Observing whether mutation-heavy users generate too much unstable waste.",
    tags: ["balance", "risk"]
  },
  {
    title: "Starter conversion",
    text: "Comparing first-day reward intensity for new players.",
    tags: ["onboarding", "revenue"]
  }
];

const payments = [
  {
    title: "VIP 24h pack",
    text: "118 successful purchases, no unresolved errors.",
    tags: ["stable", "stars"]
  },
  {
    title: "Growth booster",
    text: "A small drop in conversion after midnight traffic spike.",
    tags: ["watch", "funnel"]
  },
  {
    title: "Energy 150",
    text: "Highest volume item today with normal refund pattern.",
    tags: ["healthy", "volume"]
  }
];

const alerts = [
  {
    title: "Mutation outlier segment",
    text: "A small user cohort is reaching quantum states faster than forecast.",
    tone: "critical"
  },
  {
    title: "Payment latency spike resolved",
    text: "Invoice response time returned to normal after a brief queue delay.",
    tone: "ok"
  },
  {
    title: "Backup replica lag",
    text: "Read replica is 4 minutes behind target and should be checked.",
    tone: "warn"
  }
];

const backups = [
  {
    label: "Primary snapshot",
    value: "12 minutes ago",
    note: "Last verified restore check passed"
  },
  {
    label: "Audit export",
    value: "1 hour ago",
    note: "Admin action log safely archived"
  },
  {
    label: "Worker queue",
    value: "Healthy",
    note: "No stuck jobs in current operator mock"
  }
];

renderList("statusStrip", statusCards, renderStatusCard);
renderList("assistantQuick", assistantQuick, renderQuickButton);
renderList("economyGrid", economyMetrics, renderMetricCard);
renderList("watchlist", watchlist, renderWatchCard);
renderList("experimentList", experiments, renderTagCard("experiment-card"));
renderList("paymentList", payments, renderTagCard("payment-card"));
renderList("alertList", alerts, renderAlertCard);
renderList("backupList", backups, renderBackupCard);
initAssistantForms();
initAssistantModeSwitch();
initAssistant3d();

function renderList(id, items, renderer) {
  const root = document.getElementById(id);
  if (!root) return;
  root.innerHTML = items.map(renderer).join("");
}

function renderStatusCard(item) {
  return `
    <article class="status-card">
      <span>${item.label}</span>
      <strong>${item.value}</strong>
      <p>${item.note}</p>
    </article>
  `;
}

function renderQuickButton(label) {
  return `<button type="button">${label}</button>`;
}

function initAssistantForms() {
  const panel = document.querySelector(".assistant-panel");
  const root = document.getElementById("assistantFormStrip");
  if (!panel || !root) return;

  const saved = localStorage.getItem("labos-assistant-form");
  const initialKey = assistantProfiles[saved] ? saved : "bloom";

  root.innerHTML = Object.entries(assistantProfiles).map(([key, profile]) => `
    <button class="assistant-form-chip" type="button" data-assistant-form="${key}">
      <span>${profile.label}</span>
    </button>
  `).join("");

  root.querySelectorAll("[data-assistant-form]").forEach((button) => {
    button.addEventListener("click", () => applyAssistantForm(button.dataset.assistantForm || "bloom"));
  });

  applyAssistantForm(initialKey);
}

function applyAssistantForm(formKey) {
  const panel = document.querySelector(".assistant-panel");
  const profile = assistantProfiles[formKey] || assistantProfiles.bloom;
  if (!panel) return;

  panel.dataset.form = formKey;
  setText("assistantStatusLabel", profile.status);
  setText("assistantTitleLabel", profile.title);
  setText("assistantSummaryLabel", profile.summary);
  setText("assistantMoodLabel", profile.mood);
  setText("assistantSignalText", profile.signal);
  setText("assistantLocketLabel", profile.locketLabel);
  setText("assistantLocketText", profile.locketText);
  setText("assistantFigureSigil", profile.sigil);
  renderList("assistantQuick", profile.quick, renderQuickButton);

  const locket = document.getElementById("assistantLocket");
  if (locket) {
    locket.dataset.state = profile.locketState;
  }

  const figureLocket = document.getElementById("assistantFigureLocket");
  if (figureLocket) {
    figureLocket.dataset.state = profile.locketState;
  }

  document.querySelectorAll("[data-assistant-form]").forEach((button) => {
    button.classList.toggle("active", button.dataset.assistantForm === formKey);
  });

  if (typeof window.applyAssistantSceneProfile === "function") {
    window.applyAssistantSceneProfile(formKey);
  }

  localStorage.setItem("labos-assistant-form", formKey);
}

function renderMetricCard(item) {
  return `
    <article class="metric-item">
      <span>${item.label}</span>
      <strong>${item.value}</strong>
      <div class="trend">${item.trend}</div>
    </article>
  `;
}

function renderWatchCard(item) {
  return `
    <article class="watch-card">
      <strong>${item.name}</strong>
      <p>${item.text}</p>
      <div class="watch-meta">${item.tags.map(renderTag).join("")}</div>
    </article>
  `;
}

function renderTagCard(className) {
  return (item) => `
    <article class="${className}">
      <strong>${item.title}</strong>
      <p>${item.text}</p>
      <div class="payment-meta">${item.tags.map(renderTag).join("")}</div>
    </article>
  `;
}

function renderAlertCard(item) {
  const toneClass = item.tone === "critical" ? "critical" : item.tone === "ok" ? "ok" : "";
  return `
    <article class="alert-card ${toneClass}">
      <span class="alert-dot" aria-hidden="true"></span>
      <div>
        <strong>${item.title}</strong>
        <p>${item.text}</p>
      </div>
    </article>
  `;
}

function renderBackupCard(item) {
  return `
    <article class="backup-item">
      <span>${item.label}</span>
      <strong>${item.value}</strong>
      <p>${item.note}</p>
    </article>
  `;
}

function renderTag(tag) {
  const tone = tag === "review" || tag === "watch" ? " warn" : tag === "risk" ? " danger" : "";
  return `<span class="mini-pill${tone}">${tag}</span>`;
}

function setText(id, value) {
  const node = document.getElementById(id);
  if (node) {
    node.textContent = value;
  }
}

function initAssistantModeSwitch() {
  const panel = document.querySelector(".assistant-panel");
  const buttons = [...document.querySelectorAll("[data-assistant-mode]")];
  if (!panel || !buttons.length) return;

  const setMode = (mode) => {
    panel.classList.toggle("reference-mode", mode === "reference");
    buttons.forEach((button) => {
      button.classList.toggle("active", button.dataset.assistantMode === mode);
    });
    localStorage.setItem("labos-assistant-mode", mode);
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => setMode(button.dataset.assistantMode));
  });

  setMode(localStorage.getItem("labos-assistant-mode") || "agent");
}

async function initAssistant3d() {
  const canvas = document.getElementById("assistantCanvas");
  const host = canvas?.closest(".assistant-figure");
  if (!canvas || !host) return;

  let THREE;
  try {
    THREE = await import("https://unpkg.com/three@0.160.0/build/three.module.js");
  } catch {
    return;
  }

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  camera.position.set(0, 0.24, 6.6);

  const group = new THREE.Group();
  scene.add(group);

  const cyan = new THREE.Color("#57e5da");
  const lime = new THREE.Color("#b4ff67");
  const skin = new THREE.Color("#d8b29f");
  const skinLight = new THREE.Color("#f0cfbf");
  const hair = new THREE.Color("#17222d");
  const ink = new THREE.Color("#07111b");
  const sceneProfiles = {
    bloom: {
      iris: new THREE.Color("#7bf8cf"),
      accent: new THREE.Color("#b4ff67"),
      ring: new THREE.Color("#57e5da"),
      suit: new THREE.Color("#07111b"),
      hair: new THREE.Color("#17222d"),
      rim: new THREE.Color("#57e5da"),
      fill: new THREE.Color("#b4ff67"),
      haloSpeed: 0.34,
      shoulderSpeed: -0.24,
      amplitude: 0.14
    },
    cipher: {
      iris: new THREE.Color("#8ed8ff"),
      accent: new THREE.Color("#57e5da"),
      ring: new THREE.Color("#8ed8ff"),
      suit: new THREE.Color("#061826"),
      hair: new THREE.Color("#102130"),
      rim: new THREE.Color("#8ed8ff"),
      fill: new THREE.Color("#57e5da"),
      haloSpeed: 0.52,
      shoulderSpeed: -0.36,
      amplitude: 0.09
    },
    velvet: {
      iris: new THREE.Color("#ff9dcc"),
      accent: new THREE.Color("#ffd36b"),
      ring: new THREE.Color("#ff8fc7"),
      suit: new THREE.Color("#1a0d16"),
      hair: new THREE.Color("#2b1322"),
      rim: new THREE.Color("#ff8fc7"),
      fill: new THREE.Color("#ffd36b"),
      haloSpeed: 0.28,
      shoulderSpeed: -0.16,
      amplitude: 0.17
    }
  };
  const sceneState = {
    current: "bloom",
    target: "bloom"
  };

  const skinMaterial = new THREE.MeshPhysicalMaterial({
    color: skin,
    emissive: new THREE.Color("#2e1715"),
    emissiveIntensity: 0.06,
    roughness: 0.42,
    metalness: 0,
    clearcoat: 0.18,
    clearcoatRoughness: 0.55
  });

  const blushMaterial = new THREE.MeshBasicMaterial({
    color: skinLight,
    transparent: true,
    opacity: 0.18
  });

  const hairMaterial = new THREE.MeshStandardMaterial({
    color: hair,
    emissive: new THREE.Color("#071a22"),
    emissiveIntensity: 0.28,
    roughness: 0.34,
    metalness: 0.06
  });

  const suit = new THREE.MeshStandardMaterial({
    color: ink,
    emissive: new THREE.Color("#0b3940"),
    emissiveIntensity: 0.38,
    metalness: 0.34,
    roughness: 0.36
  });

  const accent = new THREE.MeshStandardMaterial({
    color: lime,
    emissive: lime,
    emissiveIntensity: 1.35,
    roughness: 0.18
  });

  const softCyan = new THREE.MeshBasicMaterial({
    color: cyan,
    transparent: true,
    opacity: 0.42,
    side: THREE.DoubleSide
  });

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.62, 56, 36), skinMaterial);
  head.scale.set(0.82, 1.08, 0.72);
  head.position.y = 0.98;
  group.add(head);

  const faceGlow = new THREE.Mesh(new THREE.SphereGeometry(0.46, 32, 20), blushMaterial);
  faceGlow.scale.set(0.82, 0.72, 0.08);
  faceGlow.position.set(0, 0.98, 0.47);
  group.add(faceGlow);

  const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.66, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.58), hairMaterial);
  hairCap.scale.set(0.9, 0.72, 0.78);
  hairCap.position.set(0, 1.22, -0.03);
  hairCap.rotation.x = -0.18;
  group.add(hairCap);

  const backHair = new THREE.Mesh(new THREE.CapsuleGeometry(0.5, 0.9, 10, 30), hairMaterial);
  backHair.scale.set(0.92, 1.08, 0.42);
  backHair.position.set(0, 0.62, -0.24);
  group.add(backHair);

  const sideHairGeo = new THREE.CapsuleGeometry(0.13, 0.86, 8, 18);
  const leftHair = new THREE.Mesh(sideHairGeo, hairMaterial);
  const rightHair = new THREE.Mesh(sideHairGeo, hairMaterial);
  leftHair.position.set(-0.48, 0.76, 0.04);
  rightHair.position.set(0.48, 0.76, 0.04);
  leftHair.rotation.z = -0.12;
  rightHair.rotation.z = 0.12;
  group.add(leftHair, rightHair);

  const eyeWhite = new THREE.MeshBasicMaterial({ color: "#efffff" });
  const eyeIris = new THREE.MeshStandardMaterial({
    color: "#1befe0",
    emissive: cyan,
    emissiveIntensity: 0.7,
    roughness: 0.2
  });

  const eyeGeo = new THREE.SphereGeometry(0.072, 20, 14);
  const leftEye = new THREE.Mesh(eyeGeo, eyeWhite);
  const rightEye = new THREE.Mesh(eyeGeo, eyeWhite);
  leftEye.scale.set(1.35, 0.72, 0.18);
  rightEye.scale.set(1.35, 0.72, 0.18);
  leftEye.position.set(-0.22, 1.03, 0.46);
  rightEye.position.set(0.22, 1.03, 0.46);
  group.add(leftEye, rightEye);

  const irisGeo = new THREE.SphereGeometry(0.03, 16, 10);
  const leftIris = new THREE.Mesh(irisGeo, eyeIris);
  const rightIris = new THREE.Mesh(irisGeo, eyeIris);
  leftIris.position.set(-0.22, 1.03, 0.52);
  rightIris.position.set(0.22, 1.03, 0.52);
  group.add(leftIris, rightIris);

  const browMaterial = new THREE.MeshStandardMaterial({ color: hair, roughness: 0.4 });
  const browGeo = new THREE.BoxGeometry(0.18, 0.018, 0.014);
  const leftBrow = new THREE.Mesh(browGeo, browMaterial);
  const rightBrow = new THREE.Mesh(browGeo, browMaterial);
  leftBrow.position.set(-0.22, 1.17, 0.5);
  rightBrow.position.set(0.22, 1.17, 0.5);
  leftBrow.rotation.z = 0.08;
  rightBrow.rotation.z = -0.08;
  group.add(leftBrow, rightBrow);

  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.16, 16), skinMaterial);
  nose.position.set(0, 0.93, 0.52);
  nose.rotation.x = Math.PI / 2;
  group.add(nose);

  const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.018, 0.012), new THREE.MeshBasicMaterial({ color: "#9f5f66" }));
  mouth.position.set(0, 0.78, 0.52);
  group.add(mouth);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.42, 32), skinMaterial);
  neck.position.y = 0.28;
  group.add(neck);

  const shoulders = new THREE.Mesh(new THREE.CapsuleGeometry(0.86, 0.74, 8, 36), suit);
  shoulders.scale.set(1.05, 0.52, 0.46);
  shoulders.position.y = -0.58;
  shoulders.rotation.z = Math.PI / 2;
  group.add(shoulders);

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.58, 0.78, 8, 32), suit);
  torso.scale.set(0.95, 0.82, 0.5);
  torso.position.y = -0.5;
  group.add(torso);

  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.018, 8, 96), softCyan);
  collar.position.y = -0.12;
  collar.rotation.x = Math.PI / 2.25;
  group.add(collar);

  const core = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24, 16), accent);
  core.position.set(0, -0.52, 0.48);
  group.add(core);

  const ringMaterial = softCyan.clone();
  ringMaterial.opacity = 0.38;
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.96, 0.01, 8, 96), ringMaterial);
  halo.position.y = 1.02;
  halo.rotation.x = Math.PI / 2.6;
  group.add(halo);

  const shoulder = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.012, 8, 96), ringMaterial.clone());
  shoulder.material.opacity = 0.28;
  shoulder.position.y = -0.44;
  shoulder.rotation.x = Math.PI / 2.25;
  group.add(shoulder);

  const key = new THREE.PointLight("#ffe1d2", 2.4, 7);
  key.position.set(-1.4, 2.2, 3);
  const rim = new THREE.PointLight("#57e5da", 2.1, 6);
  rim.position.set(1.7, 1.2, 2.8);
  const fill = new THREE.PointLight("#b4ff67", 0.9, 5);
  fill.position.set(1.5, -0.4, 2.4);
  scene.add(key, rim, fill, new THREE.AmbientLight("#bdf8f0", 0.64));

  const crestMaterial = softCyan.clone();
  crestMaterial.opacity = 0.26;
  const crest = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.018, 8, 64, Math.PI), crestMaterial);
  crest.position.set(0, 1.62, 0.02);
  crest.rotation.z = Math.PI;
  group.add(crest);

  const crestShardGeo = new THREE.ConeGeometry(0.06, 0.22, 12);
  const crestShardLeft = new THREE.Mesh(crestShardGeo, softCyan.clone());
  const crestShardRight = new THREE.Mesh(crestShardGeo, softCyan.clone());
  crestShardLeft.position.set(-0.23, 1.55, 0.08);
  crestShardRight.position.set(0.23, 1.55, 0.08);
  crestShardLeft.rotation.z = -0.46;
  crestShardRight.rotation.z = 0.46;
  group.add(crestShardLeft, crestShardRight);

  const pendantRing = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.012, 8, 64), softCyan.clone());
  pendantRing.position.set(0, -0.54, 0.52);
  pendantRing.rotation.x = Math.PI / 2.15;
  group.add(pendantRing);

  const pendantShard = new THREE.Mesh(new THREE.OctahedronGeometry(0.08, 0), accent.clone());
  pendantShard.position.set(0, -0.78, 0.56);
  pendantShard.scale.set(0.82, 1.16, 0.62);
  group.add(pendantShard);

  const interpolateColor = (target, color, alpha = 0.08) => {
    target.lerp(color, alpha);
  };

  const applySceneProfile = (profileKey) => {
    sceneState.target = sceneProfiles[profileKey] ? profileKey : "bloom";
  };

  window.applyAssistantSceneProfile = applySceneProfile;
  applySceneProfile(localStorage.getItem("labos-assistant-form") || "bloom");

  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
  }

  let frame = 0;
  function render(time = 0) {
    frame = requestAnimationFrame(render);
    const t = time * 0.001;
    const profile = sceneProfiles[sceneState.target] || sceneProfiles.bloom;
    group.rotation.y = Math.sin(t * 0.55) * profile.amplitude;
    group.rotation.x = Math.sin(t * 0.42) * 0.025;
    group.position.y = Math.sin(t * 1.1) * 0.045;
    halo.rotation.z = t * profile.haloSpeed;
    shoulder.rotation.z = t * profile.shoulderSpeed;
    core.scale.setScalar(1 + Math.sin(t * 2.4) * 0.08);
    leftIris.position.x = -0.22 + Math.sin(t * 0.9) * 0.01;
    rightIris.position.x = 0.22 + Math.sin(t * 0.9) * 0.01;
    crest.rotation.z = Math.PI + Math.sin(t * 0.9) * 0.08;
    crestShardLeft.rotation.y = Math.sin(t * 1.4) * 0.18;
    crestShardRight.rotation.y = -Math.sin(t * 1.4) * 0.18;
    pendantRing.rotation.z = -t * (profile.haloSpeed * 0.9);
    pendantShard.rotation.y = t * 1.1;
    pendantShard.rotation.z = Math.sin(t * 1.8) * 0.12;
    interpolateColor(eyeIris.color, profile.iris);
    interpolateColor(eyeIris.emissive, profile.iris);
    interpolateColor(accent.color, profile.accent);
    interpolateColor(accent.emissive, profile.accent);
    interpolateColor(ringMaterial.color, profile.ring);
    interpolateColor(shoulder.material.color, profile.ring);
    interpolateColor(pendantRing.material.color, profile.ring);
    interpolateColor(collar.material.color, profile.ring);
    interpolateColor(crestMaterial.color, profile.ring);
    interpolateColor(crestShardLeft.material.color, profile.ring);
    interpolateColor(crestShardRight.material.color, profile.ring);
    interpolateColor(suit.color, profile.suit);
    interpolateColor(suit.emissive, profile.ring, 0.05);
    interpolateColor(hairMaterial.color, profile.hair, 0.05);
    interpolateColor(rim.color, profile.rim, 0.08);
    interpolateColor(fill.color, profile.fill, 0.08);
    interpolateColor(pendantShard.material.color, profile.accent);
    interpolateColor(pendantShard.material.emissive, profile.accent);
    renderer.render(scene, camera);
  }

  resize();
  host.classList.add("has-3d");
  render();
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(frame);
    } else {
      resize();
      render();
    }
  });

  window.addEventListener("beforeunload", () => {
    delete window.applyAssistantSceneProfile;
  });
}
