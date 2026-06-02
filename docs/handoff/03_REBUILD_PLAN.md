# Rebuild Plan

Goal:

Keep the current visual shell, but rebuild the math and mechanics so they can match the donor mechanics and the GDD.

## Core Problem

The current prototype works, but too much lives inside `app.js`:

- UI rendering.
- Farm rules.
- Lab rules.
- Zen rules.
- Stars.
- Telegram.
- Server sync.
- Settings.
- Missions.

This is why every new idea feels expensive and risky.

## Correct Direction

Do not rewrite the visual.

Do not rebuild the whole project from zero.

Create a separate game core and make the current UI talk to it.

## Proposed File Structure

Keep the no-build simple deployment for now.

Recommended next files:

```text
game-core/
  config.js          # strains, recipes, currencies, upgrade constants
  state.js           # create default state, normalize/migrate state
  farm.js            # plant, boost, harvest, auto-harvest, slot progress
  lab.js             # recipes, synthesis queue, claim, mutation chance
  zen.js             # session modes, DNA taps, Zen Essence reward
  economy.js         # currencies, costs, rewards, anti-paywall rules
  telemetry.js       # event names and payload rules
```

Because the current app is plain HTML/JS, the first version can expose:

```js
window.CyberGreenCore = {
  config,
  createInitialState,
  normalizeState,
  farm,
  lab,
  zen,
  economy
};
```

Then `app.js` becomes:

```text
UI renderer + Telegram adapter + server adapter
```

## Migration Steps

### Step 1: Freeze Current Visual

Do not touch:

- `styles.css` visual blocks.
- Farm capsule layout.
- Lab mutation screen layout.
- Zen room layout.
- loading screen.
- resource/header/nav layout.

Only fix obvious overlaps/bugs.

### Step 2: Create Core Config

Move constants into config:

- currencies.
- strains.
- farm slots.
- recipes.
- zen modes.
- upgrades.
- Stars products.

This makes the game editable without rewriting UI.

### Step 3: Make Farm Fully Slot-Based

Current v48 already started this.

Next refinement:

- each slot has type: normal / premium / future.
- each slot has strain, plantedAt, duration, boosts.
- each slot can be selected.
- auto-harvest works by slot.
- server saves every slot.

### Step 4: Replace Lab Button With Recipe Queue

Current `synthArtifact()` is a temporary bridge.

Replace it with:

- recipe list.
- recipe costs.
- synthesis queue.
- claim result.
- stability chance.
- rare/legendary output later.

### Step 5: Connect Zen To Strains

Zen should not be generic only.

Zen should ask:

```text
Which strain/artifact is active?
Which Zen mode is available?
What bonus is created?
How much Zen Essence is earned?
```

### Step 6: Server Authority Pass

Current server sync is MVP-friendly, not final anti-cheat.

Later, important actions should be server-validated:

- plant.
- boost.
- harvest.
- start synthesis.
- claim synthesis.
- start/complete Zen.
- Stars reward delivery.

### Step 7: Admin Visibility

Every serious mechanic must appear in Admin:

- active slots.
- inventory.
- synthesis queue.
- Zen Essence.
- Stars purchases.
- progression.
- suspicious events.

## What To Keep From Current Code

Keep:

- `server.mjs` as monolith for now.
- Telegram auth/initData validation.
- Stars invoice endpoint.
- payment order logging.
- static serving.
- admin routes.
- `index.html` structure.
- `styles.css` visual shell.
- `assets/`.

Refactor:

- `app.js` state and gameplay logic.

Do not refactor:

- deployment system.
- Render setup.
- GitHub repo.
- BotFather setup.
- current production URL.

## New Chat Working Rule

In the new chat, start with architecture, not visual experiments.

Every task should state:

```text
Room:
Layer: visual / mechanic / server / payment / admin
Goal:
Files allowed:
Test:
Deploy: yes/no
```

Example:

```text
Room: Farm
Layer: mechanic
Goal: move Farm math into game-core/farm.js and keep current UI unchanged
Files allowed: app.js, game-core/*
Test: local slot plant/harvest/server sync
Deploy: no
```

