# AAA Telegram Product + Operator Layer Technical Package

## Purpose

This document is intended for external technical review.

The project is a Telegram Mini App game/product with Farm, Lab, Zen, Stars monetization, Admin analytics, and a proposed Operator Layer that controls AI-assisted development quality.

The central question:

```text
Can we turn the current product into a controlled, premium Telegram product while preventing AI/code iteration from creating "layer over layer" chaos?
```

The proposed answer:

```text
Yes, but only if the product is managed as a system:
Game Product + Server Truth + Payments + Admin + Operator Control Layer.
```

This is not just a game feature request. It is a proposed production methodology and technical control system for building complex visual products with AI.

## Current Product Snapshot

Repository: `telegramtycoon`

Current shape:

- Frontend: static HTML/CSS/JS.
- Runtime server: `server.mjs`.
- Game core: `game-core/`.
- Admin surfaces: `admin.html`, `admin.js`, `admin.css`.
- Operator placeholders already exist: `operator.html`, `operator.js`, `operator.css`.
- Product docs exist in `docs/`.
- Telegram Stars are already part of the product direction.
- Farm, Lab, Zen, Shop, Admin concepts already exist.

Important existing docs:

- `docs/SYSTEM_MAP.md`
- `docs/PRODUCT_MATH_MODEL.md`
- `docs/WORKFLOW.md`
- `docs/PRODUCT_MIRROR.md`
- `docs/AI_OPERATOR_PROTOCOL.md`
- `docs/AI_CHANGE_GUARDRAILS.md`

Current technical risk:

```text
The product has visible ambition, but iteration currently creates too many overlapping UI/CSS/logic layers.
The main risk is not lack of ideas. The main risk is uncontrolled refinement.
```

## Product Target

The target is not a generic clicker.

The target is a premium Telegram product with:

- a strong first 30 seconds;
- Farm as the fast-start loop;
- Stars as a central monetization system;
- Lab as deeper crafting/progression;
- Zen as emotional/meditative retention;
- Admin as owner truth for users, payments, and activity;
- visual clarity without excessive text;
- mobile-first Telegram WebView performance;
- controlled AI-assisted development.

For this project, "AAA Telegram product" means:

```text
Premium feeling inside Telegram constraints.
Not heavy 3D.
Not console-scale production.
Not random visual overload.
```

Quality bar:

- immediate visual comprehension;
- minimal clutter;
- clear value loop;
- server-backed paid value;
- measurable retention and revenue;
- every change auditable.

## Core Diagnosis

The project did not fail because the product idea is impossible.

The recurring failure pattern is:

```text
Initial big feature can look promising.
Refinements add new blocks, overrides, wrappers, handlers, or copy.
Existing layers are not audited before changing.
The product slowly becomes "layer over layer".
```

This causes:

- visual clutter;
- CSS overrides fighting each other;
- unexpected layout shifts;
- unclear ownership of modules;
- frontend/backend drift;
- payment features without full operational visibility;
- wasted implementation time;
- loss of trust in iteration.

The required fix is not "better prompts" only.

The required fix is a technical operating system:

```text
Product Mirror + Operator Layer + Change Sessions + Layer Audit + Review Gate + Release Gate.
```

## Existing Industry Solutions To Reuse

Most pieces already exist in the software industry. We should not reinvent them blindly.

Relevant existing categories:

| Need | Existing class of solution | Examples / analogs |
|---|---|---|
| Work tracking | Issue/task system | Linear, Jira, GitHub Issues |
| Design state | Design system governance | Figma libraries, Storybook |
| Visual regression | Screenshot comparison | Chromatic, Percy, Playwright screenshots |
| Feature rollout | Flags and gates | LaunchDarkly, Unleash, GrowthBook |
| Product analytics | Events/funnels | PostHog, Amplitude, Mixpanel |
| Error monitoring | Runtime diagnostics | Sentry, OpenTelemetry |
| Admin reporting | BI/admin dashboard | Retool, Metabase, custom admin |
| Payments audit | Ledger/event sourcing | Stripe-style ledgers, append-only payment logs |
| Release quality | CI/CD gates | GitHub Actions, Vercel checks, custom deploy gates |

What is custom here:

```text
A domain-specific Operator Layer that connects product modules, visual layers, AI changes, review status, and release permission.
```

Recommendation:

Do not build a huge proprietary system first.

Use existing patterns:

- Playwright for visual checks;
- append-only change logs;
- simple DB tables;
- admin/operator page;
- CI-style release gate;
- optional future integration with GitHub/Linear/Sentry/PostHog.

## Proposed Architecture

### 1. Player App

Purpose:

- user-facing Telegram Mini App;
- Farm, Lab, Zen, Shop, Tasks;
- visual and interaction layer.

Rules:

- frontend never grants paid value alone;
- visuals consume state, not create economy truth;
- Telegram mobile constraints first;
- hidden rooms should not run heavy animation loops.

### 2. Server Core

Purpose:

- player identity;
- saved state;
- economy validation;
- Stars product registry;
- payment delivery;
- admin data;
- operator data.

Rules:

- valuable rewards are backend-controlled;
- Stars delivery requires Telegram successful payment;
- every paid grant is auditable;
- operator state is stored separately from gameplay state.

### 3. Admin Layer

Purpose:

- show all payments;
- show unique users;
- show locale;
- show daily/monthly purchase charts;
- show suspicious or missing data;
- show revenue-relevant state.

Rules:

- no hidden money;
- no "only last 20 if more exists";
- empty state should clearly say zero, not look broken.

### 4. Operator Layer

Purpose:

- control product-building process;
- prevent layer-over-layer implementation;
- expose module status;
- record AI change sessions;
- enforce review and release gates.

This is not a player feature.

It is a product control system.

## Operator Layer Data Model

Minimum viable tables or JSON collections:

### `operator_modules`

```json
{
  "id": "F03",
  "room": "Farm",
  "name": "Drone rail",
  "status": "red",
  "primaryLayer": "visual",
  "role": "Service drone inside farm scene",
  "doNotTouch": ["beam", "skins", "capsule", "rewards"],
  "critical": true,
  "updatedAt": "2026-06-17T00:00:00.000Z"
}
```

Statuses:

```text
green = stable
yellow = in work
blue = owner review
red = broken/disputed
gray = not built
```

### `operator_change_sessions`

```json
{
  "id": "chg_001",
  "moduleId": "F03",
  "ownerRequest": "Drone goes off screen",
  "decodedGoal": "Move drone rail inside mobile viewport",
  "layer": "visual",
  "exactChange": "Adjust rail position only",
  "doNotTouch": ["beam", "skins", "capsule", "shop"],
  "filesChanged": ["styles.css"],
  "status": "blue",
  "visualStatus": "not_verified",
  "risk": "Needs mobile visual check",
  "createdAt": "2026-06-17T00:00:00.000Z"
}
```

### `operator_layer_audits`

```json
{
  "sessionId": "chg_001",
  "existingLayerFound": ".donor-robot-layer / .donor-side-drone",
  "problemInsideLayer": "position overflows viewport",
  "changeInsideLayer": "adjust left/width/transform",
  "newLayerAdded": false,
  "deadLayerRemoved": false,
  "notes": "No new reward strip, no shop edits."
}
```

### `operator_review_events`

```json
{
  "sessionId": "chg_001",
  "reviewer": "owner",
  "decision": "reject",
  "reason": "Drone moved onto capsule",
  "nextStatus": "red",
  "createdAt": "2026-06-17T00:00:00.000Z"
}
```

### `operator_release_gates`

```json
{
  "id": "gate_001",
  "target": "deploy",
  "blocked": true,
  "blockers": [
    { "moduleId": "F03", "status": "red", "reason": "visual disputed" }
  ],
  "checks": {
    "syntax": "pass",
    "diffCheck": "pass",
    "visual": "missing",
    "balanceAudit": "not_run"
  }
}
```

## API Proposal

Minimum endpoints:

```text
GET  /api/operator/mirror
POST /api/operator/session/start
POST /api/operator/session/:id/audit
POST /api/operator/session/:id/complete
POST /api/operator/session/:id/review
GET  /api/operator/release-gate
POST /api/operator/release-gate/check
```

Optional later:

```text
POST /api/operator/visual-snapshot
POST /api/operator/diff-summary
POST /api/operator/link-git-commit
POST /api/operator/link-deploy
```

## Operator UI Proposal

The operator page should show:

1. Product module grid.
2. Color status per module.
3. Active change session.
4. What changed / not touched.
5. Files changed.
6. Visual verification status.
7. Owner review buttons.
8. Release gate status.

Example module tile:

```text
F03 Drone rail
Status: RED
Layer: Visual
Risk: overlaps capsule
Do not touch: beam, skins, rewards
Last session: chg_001
Action: Fix / Hold / Accept
```

This page is for the product owner and technical operators, not players.

## AI Workflow Contract

Before code:

```text
ACTIVE MIRROR ID:
OWNER REQUEST:
DECODED GOAL:
LAYER:
EXACT CHANGE:
DO NOT TOUCH:
EXPECTED FILES:
VERIFY:
```

During code:

```text
Modify existing layer first.
Do not add late CSS overrides unless justified.
Do not change unrelated room.
Do not touch Stars/payment unless explicitly in scope.
```

After code:

```text
Mirror ID:
Changed:
Removed:
Not touched:
Verified:
Visual status:
Risk:
Not deployed:
```

When owner rejects:

```text
FAILURE:
CAUSE:
FIX NOW:
RULE ADDED:
```

## Release Gate

Deploy should be blocked or at least warned when:

- critical module is red;
- active session is yellow;
- completed session is blue but not accepted;
- payment code changed without server verification;
- Stars product exists only on frontend;
- visual task has no visual verification;
- balance model changed without audit;
- admin payment/user reporting is broken;
- syntax check failed.

Recommended first version:

```text
Warn only, do not hard-block.
```

After team agrees:

```text
Hard-block production deploy for payment/server/economy critical failures.
```

## Visual QA Strategy

Minimum:

- Playwright screenshot of Farm mobile viewport.
- Playwright screenshot of Settings sheet.
- Playwright screenshot of Shop.
- Playwright screenshot of Admin payments/users.
- Store latest snapshots locally or in CI artifact.

Recommended viewports:

```text
390x844 iPhone-like
360x740 Android small
430x932 large mobile
```

Visual checks should answer:

- Is main action visible?
- Is navigation visible?
- Are critical controls not overlapped?
- Does drone stay inside viewport?
- Are capsule slots readable?
- Are Settings panels fully visible?
- Are payment/shop cards understandable?

Future:

- visual diff baseline;
- per-module screenshot linked to mirror ID;
- owner can approve visual state.

## Product Development Roadmap

### Phase 0: Stabilize

Goal:

```text
Stop uncontrolled iteration.
```

Tasks:

- finalize Product Mirror;
- remove obvious dead layers from recent changes;
- create operator server state;
- create read-only operator page;
- define release gate warnings;
- do not add new gameplay features.

Exit criteria:

- every critical module has status;
- current uncommitted changes are classified;
- no critical red module is ignored.

### Phase 1: Farm Trust Loop

Goal:

```text
Make first 30 seconds clear and satisfying.
```

Tasks:

- Farm capsule clarity;
- drone visual stability;
- plant reward clarity without clutter;
- starter loop under 45 seconds;
- resource icons understandable;
- no Shop/Lab distraction.

Exit criteria:

- user understands plant -> wait -> collect;
- mobile viewport is clean;
- core controls visible;
- visual check passed.

### Phase 2: Stars Trust

Goal:

```text
Stars feel valuable and safe.
```

Tasks:

- paid slot;
- paid pass;
- paid drone skin;
- server reward delivery;
- admin visibility;
- payment test plan;
- refund/duplicate safety.

Exit criteria:

- every paid product has full chain;
- admin shows purchases;
- no frontend-only value.

### Phase 3: Admin Truth

Goal:

```text
Owner sees the business.
```

Tasks:

- all purchases;
- monthly/day charts;
- unique users;
- locale;
- active players;
- suspicious errors;
- export or clear filters.

Exit criteria:

- no hidden payment records;
- no silent empty state;
- owner can audit revenue.

### Phase 4: Lab Depth

Goal:

```text
Give retained users a reason to continue.
```

Tasks:

- simple reactor;
- formulas from DNA/materials/SE/ZEN;
- no CRC as formula fuel;
- queue/time;
- Stars speedup after desire exists;
- claim flow.

Exit criteria:

- recipe inputs are visual;
- result is clear;
- timing and acceleration are balanced;
- Lab does not block Farm onboarding.

### Phase 5: Zen Retention

Goal:

```text
Separate emotional mode, not medical claim.
```

Tasks:

- calm loop;
- sound/vibration preferences;
- Zen rewards/modifiers;
- safe wording;
- retention analytics.

Exit criteria:

- Zen feels different from Farm;
- no medical claims;
- session completion is satisfying.

## Recommended Technical Stack Evolution

Current stack can support MVP, but risk grows with complexity.

### Short-term

Keep:

- static frontend;
- `server.mjs`;
- simple JSON or current persistence if already working;
- docs and operator files.

Add:

- operator API;
- visual QA script;
- balance audit in release checklist;
- payment ledger consistency check.

### Mid-term

Consider:

- SQLite or Postgres/Supabase for durable state;
- Playwright test suite;
- Sentry for frontend/server errors;
- PostHog or lightweight custom analytics;
- GitHub Actions or deploy script gates;
- feature flags for risky modules.

### Long-term

Consider:

- TypeScript migration for core game/server logic;
- component architecture if frontend becomes unmanageable;
- design system/storybook for UI modules;
- event-sourced payments and economy ledgers;
- separate operator/admin app if needed.

## Build vs Buy Recommendations

Build custom:

- Product Mirror domain model;
- AI change session records;
- module review status;
- release gate rules specific to this product;
- owner-facing operator dashboard.

Use existing tools:

- Playwright for browser screenshots;
- Sentry or similar for errors;
- PostHog/analytics if budget allows;
- GitHub issues/commits for development linkage;
- database instead of hand-rolled persistence when scale requires.

Do not build custom yet:

- full Jira clone;
- complex design diff engine;
- advanced CI/CD platform;
- custom observability stack;
- heavy 3D engine.

## Key Technical Questions For Reviewers

1. Is the current `server.mjs` architecture enough for Operator Layer v1?
2. Should operator state live in JSON first, or move directly to DB?
3. What is the safest path for Telegram Stars ledger integrity?
4. How should payment records be modeled to avoid hidden or duplicated grants?
5. Can Playwright screenshots be stable enough on this project?
6. Should the product remain static JS for Release 2, or migrate selected modules to TypeScript?
7. What is the minimal visual regression setup for mobile Telegram WebView?
8. How should Admin and Operator be separated for permissions?
9. What should hard-block deploys, and what should only warn?
10. Which current layers should be deleted before new feature work?

## Critical Risks

### Risk 1: Operator Layer becomes another layer of chaos

Mitigation:

- keep v1 small;
- module grid + sessions + review only;
- no complex workflow engine.

### Risk 2: AI still ignores the process

Mitigation:

- store active session server-side;
- require mirror ID in every change report;
- block or warn deploy without session.

### Risk 3: Visual QA is not reliable

Mitigation:

- use deterministic viewport screenshots;
- compare manually first;
- automate only after baseline stabilizes.

### Risk 4: Stars trust breaks

Mitigation:

- backend-only reward delivery;
- append-only payment ledger;
- admin visibility;
- duplicate-payment protection.

### Risk 5: Product ambition exceeds execution capacity

Mitigation:

- Farm first;
- Stars trust second;
- Admin truth third;
- Lab depth fourth;
- Zen polish after core loop.

## Recommended Immediate Implementation

Implement Operator Layer v1 in three small steps:

### Step 1: Server State

Add:

```text
.data/operator-state.json
GET /api/operator/mirror
POST /api/operator/session/start
POST /api/operator/session/:id/complete
POST /api/operator/session/:id/review
```

No gameplay changes.

### Step 2: Operator UI

Use existing:

```text
operator.html
operator.css
operator.js
```

Show:

- module grid;
- active sessions;
- status colors;
- review buttons;
- release gate warning.

No game UI changes.

### Step 3: Release Gate

Add:

```text
GET /api/operator/release-gate
```

Check:

- red critical modules;
- unreviewed blue modules;
- active yellow sessions;
- payment/economy changes without verification notes.

Warn first. Hard-block later.

## Final Assessment

The product has a real chance if the team stops treating it as a simple visual toy.

It is already a multi-system product:

```text
Telegram platform + game loop + visual identity + Stars payment + admin analytics + AI-assisted iteration.
```

The hard part is not only coding features.

The hard part is preserving product integrity while features evolve.

The proposed Operator Layer is valuable if it remains practical:

```text
small server-backed mirror,
clear module statuses,
change sessions,
layer audit,
review gate,
release warnings.
```

Recommendation:

```text
Do not restart from zero immediately.
First build the control layer.
Then stabilize Farm and Stars.
Only then expand Lab and Zen.
```

If external reviewers agree with the direction, the next task should be:

```text
Implement Operator Layer v1 without changing player gameplay.
```

