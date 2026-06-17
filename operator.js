let mirror = null;
let selectedModuleId = "F03";

const statusLabels = {
  green: "Stable",
  yellow: "In work",
  blue: "Review",
  red: "Problem",
  gray: "Planned"
};

const $ = (selector) => document.querySelector(selector);

init();

function init() {
  $("#refreshBtn")?.addEventListener("click", loadMirror);
  $("#sessionForm")?.addEventListener("submit", startSession);
  loadMirror();
}

async function loadMirror() {
  try {
    const response = await fetch("/api/operator/mirror", { headers: { Accept: "application/json" } });
    if (response.status === 401) {
      renderAuthRequired();
      return;
    }
    if (!response.ok) throw new Error(`Operator API ${response.status}`);
    mirror = await response.json();
    selectedModuleId = mirror.modules.some((item) => item.id === selectedModuleId)
      ? selectedModuleId
      : mirror.modules[0]?.id || "";
    render();
  } catch (error) {
    renderError(error);
  }
}

function render() {
  if (!mirror) return;
  renderGate(mirror.releaseGate);
  renderSummary(mirror.summary);
  renderModules(mirror.modules);
  renderModuleSelect(mirror.modules);
  renderDetail(mirror.modules.find((item) => item.id === selectedModuleId));
  renderSessions(mirror.sessions || []);
  renderAudits(mirror.layerAudits || []);
}

function renderGate(gate = {}) {
  const root = $("#releaseGate");
  root?.classList.toggle("blocked", Boolean(gate.blocked));
  root?.classList.toggle("warning", !gate.blocked && Boolean(gate.warnings?.length));
  setText("#gateTitle", gate.blocked ? "Blocked" : gate.warnings?.length ? "Warnings" : "Clear");
  setText(
    "#gateText",
    gate.blocked
      ? `${gate.blockers.length} blocker(s). Do not deploy critical changes.`
      : gate.warnings?.length
        ? `${gate.warnings.length} warning(s). Review before deploy.`
        : "No critical blockers in current mirror."
  );
}

function renderSummary(summary = {}) {
  const items = [
    ["Modules", summary.modules || 0, "total"],
    ["Red", summary.red || 0, "blocked"],
    ["Yellow", summary.yellow || 0, "in work"],
    ["Blue", summary.blue || 0, "review"],
    ["Green", summary.green || 0, "stable"],
    ["Warnings", summary.warnings || 0, "gate"]
  ];
  setHTML("#summaryGrid", items.map(([label, value, note]) => `
    <article class="summary-card">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <small>${escapeHtml(note)}</small>
    </article>
  `).join(""));
}

function renderModules(modules = []) {
  setText("#moduleCount", `${modules.length}`);
  setHTML("#moduleGrid", modules.map((item) => `
    <button class="module-card status-${escapeHtml(item.status)} ${item.id === selectedModuleId ? "active" : ""}" type="button" data-module-id="${escapeHtml(item.id)}">
      <span>${escapeHtml(item.id)} · ${escapeHtml(item.room)}</span>
      <strong>${escapeHtml(item.name)}</strong>
      <small>${escapeHtml(statusLabels[item.status] || item.status)} / ${escapeHtml(item.primaryLayer)}</small>
    </button>
  `).join(""));

  document.querySelectorAll("[data-module-id]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedModuleId = button.dataset.moduleId || selectedModuleId;
      render();
    });
  });
}

function renderModuleSelect(modules = []) {
  const select = $("#sessionModule");
  if (!select) return;
  const previous = select.value || selectedModuleId;
  select.innerHTML = modules.map((item) => `
    <option value="${escapeHtml(item.id)}">${escapeHtml(item.id)} · ${escapeHtml(item.name)}</option>
  `).join("");
  select.value = modules.some((item) => item.id === previous) ? previous : selectedModuleId;
}

function renderDetail(module) {
  if (!module) return;
  setText("#detailTitle", `${module.id} ${module.name}`);
  setText("#detailStatus", statusLabels[module.status] || module.status);
  setHTML("#moduleDetail", `
    <dl class="detail-list">
      <dt>Room</dt><dd>${escapeHtml(module.room)}</dd>
      <dt>Layer</dt><dd>${escapeHtml(module.primaryLayer)}</dd>
      <dt>Role</dt><dd>${escapeHtml(module.role)}</dd>
      <dt>Critical</dt><dd>${module.critical ? "yes" : "no"}</dd>
      <dt>Do not touch</dt><dd>${renderPills(module.doNotTouch)}</dd>
      <dt>Updated</dt><dd>${escapeHtml(formatDate(module.updatedAt))}</dd>
    </dl>
  `);
}

function renderSessions(sessions = []) {
  setText("#sessionCount", `${sessions.length}`);
  if (!sessions.length) {
    setHTML("#sessionList", `<article class="empty-card">No change sessions yet. Start one before the next product edit.</article>`);
    return;
  }
  setHTML("#sessionList", sessions.slice(0, 20).map((item) => `
    <article class="session-card status-${escapeHtml(item.status)}">
      <header>
        <span>${escapeHtml(item.id)}</span>
        <b>${escapeHtml(item.moduleId)} / ${escapeHtml(statusLabels[item.status] || item.status)}</b>
      </header>
      <strong>${escapeHtml(item.decodedGoal || item.ownerRequest || "Controlled change")}</strong>
      <p>${escapeHtml(item.exactChange || "No exact change recorded.")}</p>
      <small>Visual: ${escapeHtml(item.visualStatus || "not_verified")} · Risk: ${escapeHtml(item.risk || "none")}</small>
      <div class="session-actions">
        <button type="button" data-review="${escapeHtml(item.id)}" data-decision="accept">Accept</button>
        <button type="button" data-review="${escapeHtml(item.id)}" data-decision="reject">Reject</button>
      </div>
    </article>
  `).join(""));

  document.querySelectorAll("[data-review]").forEach((button) => {
    button.addEventListener("click", () => reviewSession(button.dataset.review, button.dataset.decision));
  });
}

function renderAudits(audits = []) {
  if (!audits.length) {
    setHTML("#auditList", `<article class="empty-card">No layer audits yet. Each refinement should record the existing layer before changing it.</article>`);
    return;
  }
  setHTML("#auditList", audits.slice(0, 12).map((item) => `
    <article class="audit-card">
      <span>${escapeHtml(item.sessionId)}</span>
      <strong>${escapeHtml(item.existingLayerFound || "Layer not recorded")}</strong>
      <p>${escapeHtml(item.problemInsideLayer || "No problem text.")}</p>
      <small>New layer: ${item.newLayerAdded ? "yes" : "no"} · Dead layer removed: ${item.deadLayerRemoved ? "yes" : "no"}</small>
    </article>
  `).join(""));
}

async function startSession(event) {
  event.preventDefault();
  const payload = {
    moduleId: $("#sessionModule")?.value || selectedModuleId,
    ownerRequest: $("#sessionRequest")?.value || "Owner request not pasted yet",
    decodedGoal: $("#sessionGoal")?.value || "Controlled product change",
    layer: $("#sessionLayer")?.value || "process",
    risk: $("#sessionRisk")?.value || "Needs owner review"
  };

  try {
    const response = await fetch("/api/operator/session/start", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error(`Start session failed: ${response.status}`);
    $("#sessionForm")?.reset();
    toast("Session started");
    await loadMirror();
  } catch (error) {
    toast(error.message || "Session failed");
  }
}

async function reviewSession(sessionId, decision) {
  if (!sessionId) return;
  try {
    const response = await fetch(`/api/operator/session/${encodeURIComponent(sessionId)}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        decision,
        reason: decision === "accept" ? "Owner accepted in Operator Mirror" : "Owner rejected in Operator Mirror"
      })
    });
    if (!response.ok) throw new Error(`Review failed: ${response.status}`);
    toast(decision === "accept" ? "Accepted" : "Rejected");
    await loadMirror();
  } catch (error) {
    toast(error.message || "Review failed");
  }
}

function renderAuthRequired() {
  setText("#gateTitle", "Login required");
  setText("#gateText", "Open Admin and login first. Operator uses the same admin session.");
  setHTML("#summaryGrid", "");
  setHTML("#moduleGrid", `<article class="empty-card">Operator API returned 401.</article>`);
}

function renderError(error) {
  setText("#gateTitle", "Operator offline");
  setText("#gateText", error.message || "Could not load mirror state.");
  setHTML("#moduleGrid", `<article class="empty-card">Check server and /api/operator/mirror.</article>`);
}

function renderPills(items = []) {
  return items.length
    ? items.map((item) => `<span class="mini-pill">${escapeHtml(item)}</span>`).join("")
    : `<span class="mini-pill">none</span>`;
}

function setText(selector, value) {
  const node = $(selector);
  if (node) node.textContent = value;
}

function setHTML(selector, value) {
  const node = $(selector);
  if (node) node.innerHTML = value;
}

function toast(message) {
  const node = $("#toast");
  if (!node) return;
  node.textContent = message;
  node.classList.add("show");
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => node.classList.remove("show"), 2200);
}

function formatDate(value) {
  if (!value) return "never";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
