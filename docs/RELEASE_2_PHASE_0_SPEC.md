# Release 2 Phase 0 Spec

> Status: refined by [Stars Value Pivot](VALUE_FIRST_PIVOT.md).
> This spec remains useful as a technical extraction plan. The product strategy must be Stars-native, but desire-led rather than pressure-led.

## Goal

Phase 0 turns the Release 2 mandate into a buildable product lock.

The goal is to stop redesigning the idea every time we touch the code and start moving toward a working result.

Release 2 starts from this product truth:

```text
Farm is the game.
Lab is retention.
Zen is a separate meditation value.
Stars is monetization.
Admin is control.
```

## First 30 Seconds

The first user experience must focus on Farm only.

The user should not need to understand Lab, Zen, artifacts, formulas, or the full economy to enjoy the first session.

### First Screen

Show:

- one active Farm capsule
- one obvious plant/grow action
- one visible growth reaction
- resource counters
- bottom navigation
- locked hints for Lab and Zen, but not deep explanations

Do not show:

- full Lab formula logic
- Zen as a required step
- long text tutorials
- multiple competing CTAs
- complex upgrade trees

### First Action

The first action is:

```text
start a fast starter grow cycle
```

Preferred first specimen:

```text
Basil Trial
duration: 20-45 seconds
reward: small Bio output + first green DNA/material signal
```

The capsule should react immediately when the grow cycle starts. The visual reaction matters before the final reward.

### First Reward

The first reward must be easy to read:

- Bio/CRC-like farm value for progress
- one visible DNA/material icon for later Lab
- a small clear progress change

The user should feel:

```text
I started growth.
The capsule changed.
I collected something.
Now I can do more.
```

## Product Loop

Release 2 must keep the loop simple:

```text
Farm -> collect resources -> unlock/prepare Lab -> create artifact -> deepen progression -> optional Zen ritual
```

Farm owns the first loop. Lab and Zen should not compete for the first action.

## Currency and Resource Model

Release 2 needs clear separation between currencies, materials, and artifacts.

### Currencies

Core currencies:

- `Bio` or main growth score: general Farm progression
- `CRC`: farm/game currency, not a Lab formula ingredient unless a later decision changes it
- `SE`: special lab/energy resource
- `Stars`: paid Telegram currency

### Materials

Materials come from Farm harvests.

Categories:

- Greens
- Flowers
- Mushrooms

Each category should have its own visual DNA/material identity.

Example direction:

- greens: green helix / leaf sample
- flowers: violet/pink helix / bloom sample
- mushrooms: amber/yellow helix / spore sample

### Artifacts

Artifacts are Lab outputs.

Artifacts should be visual objects, not just counters.

Artifact roles:

- progression depth
- Zen modifier later
- reactor unlock / recipe unlock later
- collection layer later

## Farm Lock

Farm is the first Release 2 build target.

Minimum Farm loop:

```text
select or auto-load starter specimen
start growth
see capsule reaction
wait short timer
collect output
see inventory/resource change
repeat or unlock next slot/strain
```

Farm must support:

- clean slot state
- plant/grow/harvest math
- server-save compatibility
- Stars slot compatibility
- visual feedback for ready/locked/growing
- Admin event tracking

Farm should not require:

- Lab understanding
- Zen understanding
- reading a long tutorial

## Lab Lock

Lab comes after Farm is understandable.

Minimum Lab loop:

```text
choose formula
see required visual inputs
load reactor
start synthesis
watch progress
claim artifact
artifact enters inventory
```

Lab must support future:

- 3 simultaneous reactor chambers
- one permanent extra chamber purchase
- one rented extra chamber option
- Stars speed-up for long artifacts
- clear claim flow
- Admin visibility

CRC is not used as a formula ingredient in the current product decision. Lab formulas should use Farm materials, DNA/material categories, SE, and time.

## Zen Lock

Zen is not the first 30-second hook.

Zen is a separate meditation experience.

Minimum Zen loop later:

```text
open Zen
choose short session
choose optional sound/artifact
start calm breathing
complete session
receive Zen/Calm Energy
save session
```

Zen should feel different from Farm and Lab. It should be calm, spacious, and valuable.

Zen must avoid medical claims. It may promise calm ritual, focus, relaxation, and atmosphere, not treatment.

## Stars Lock

Stars must remain part of the technology shell.

Allowed Stars offers for Release 2:

- unlock Farm slot
- speed up long Lab synthesis
- unlock extra reactor capacity
- rent temporary reactor capacity
- premium visual/sound identity later

Rules:

- paid value must require confirmed payment
- frontend must not be the final source of paid reward truth
- every paid action must appear in Admin
- product id, price, reward, and entitlement must be explicit

## Admin Lock

Admin must remain the business truth layer.

Release 2 Admin must continue to show:

- all users
- payments
- Stars operations
- events
- locales
- room activity

Release 2 Admin should later add:

- Farm slot state summary
- inventory totals
- Lab synthesis queue
- artifacts created
- Zen starts/completions
- paid speed-ups and extra reactor usage

## Technical Lock

Release 2 keeps the current infrastructure.

Do not replace:

- Telegram Mini App entry
- Stars infrastructure
- Admin dashboard
- Render deploy
- GitHub repository
- production URL
- current backend base

Do create:

- `game-core/economy.js`
- `game-core/farm.js`
- `game-core/lab.js`
- `game-core/zen.js`
- `game-core/telemetry.js`

First implementation target:

```text
Move Farm slot/grow/harvest rules into game-core/farm.js while keeping the current Farm UI visually stable.
```

## Phase 0 Definition of Done

Phase 0 is complete when:

- Release 2 mandate exists.
- First 30 seconds are defined.
- Farm/Lab/Zen roles are fixed.
- CRC/SE/Stars boundaries are fixed.
- Stars and Admin preservation are explicit.
- First technical implementation target is known.

After Phase 0, the next task is:

```text
Phase 1: create Core Skeleton and migrate the first Farm mechanic.
```

## Phase 1 Progress Log

- `game-core/farm.js` created as the first Farm rules module.
- Farm progress, ready state, growth duration, planting cost, cost spending, reward tier, and harvest reward started moving out of `app.js`.
- `game-core/economy.js` created as the first Stars-aware economy module.
- Frontend Stars product catalog, Farm Pass config, slot unlock metadata, Farm Pass normalization, and Stars product lookup are now available through core helpers.
- `game-core/lab.js`, `game-core/zen.js`, and `game-core/telemetry.js` created as lightweight skeleton modules for future extraction.
- Server payment catalog remains intentionally unchanged until a smaller payment-safe migration step.

## Build Packet for Next Task

```text
ROOM: Farm
SYSTEM: game-core + player-ui
GOAL: create game-core/farm.js and move first Farm growth helpers out of app.js
SMALLEST RESULT: current UI still works, but plant/harvest readiness uses farm core helpers
DO NOT TOUCH: Stars payment flow, Admin, Lab layout, Zen layout, deploy setup
RISK: breaking current Farm progression or server sync
VERIFY: node --check app.js, browser Farm grow/collect, server sync still saves player state
DEPLOY: no until local verification
```
