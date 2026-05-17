# Agents Status Board

This board tracks background agents used for Green Farm Tycoon.

## Status Legend

- `Planned` - not started yet.
- `Running` - agent was started and has not returned a final report.
- `Review` - agent returned work and Codex needs to inspect it.
- `Accepted` - changes/report were reviewed and accepted.
- `Restart` - task should be relaunched with a smaller scope.
- `Closed` - agent is no longer needed.

## Active Agents

| Agent | Role | Status | Stage | Scope | Last Check | Decision |
|---|---|---:|---|---|---|---|
| Pascal | Zen Experience Designer | Accepted | Completed Zen UX brief | No file edits | 2026-05-17 Kyiv | Breathing loop, 5-minute timer, circular Zen core applied |
| Ampere | Capsule UX / Plant Systems Designer | Accepted | Completed interaction plan | No file edits | 2026-05-16 22:45 Kyiv | Time growth, plant stages, and capsule modules applied |
| Carver | Visual Asset Director | Accepted | Completed asset plan and prompt specs | No file edits | 2026-05-16 22:28 Kyiv | Asset-based scene integrated |
| Ohm | Capsule Visual Fidelity Agent | Closed | Shutdown before final report | `styles.css`, optional capsule markup in `index.html` | 2026-05-16 22:03 Kyiv | Manual capsule polish applied by Codex instead |
| Einstein | Visual Fidelity Agent | Closed | Shutdown before final report | `index.html`, `styles.css`, optional UI-only `app.js` | 2026-05-16 21:57 Kyiv | Restart with smaller inspect-first task |

## Completed Agents

| Agent | Role | Result |
|---|---|---|
| Archimedes | Telegram Backend + Stars Architect | Returned Prototype 0 backend/payment architecture |
| Carver | Visual Asset Director | Returned asset plan for background, capsule hero, plant variants, and integration risks |
| Ampere | Capsule UX / Plant Systems Designer | Returned MVP plan for procedural plant, time-based growth, boost state, and live capsule indicators |
| Pascal | Zen Experience Designer | Returned luxury pause-room brief with breathing loop, minimal UI, sound, rewards, and mobile risks |

## Operating Rules

1. One agent gets one narrow role.
2. Every agent must have a clear write scope.
3. Agents do not decide product direction; Codex and the user review their output here.
4. If an agent stays `Running` too long without a report, restart the task with a smaller scope.
5. Real progress percentage is manual unless the agent reports stages. Use stages instead of fake precision.

## Recommended Stages

For implementation agents:

1. Inspect
2. Plan
3. Edit
4. Verify
5. Report

For research/design agents:

1. Read brief
2. Identify risks
3. Propose structure
4. Produce final brief
5. Review
