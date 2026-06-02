# Blueprint Adoption

This document explains what we take from the detailed `New project` brainstorm and what we intentionally do not copy into Telegram Tycoon.

## Source

The folder `C:\Users\komir\Documents\New project\docs` contains a strong product blueprint:

- platform-independent architecture
- room/module boundaries
- Telegram Stars billing safety
- capsule ritual logic
- lab synthesis progression
- meditation room design
- BioCards collection concept
- operator/liveops/dashboard thinking
- legal/account/settings baseline

The code and visual implementation in that project is not the target. The documents are the useful part.

## What We Adopt

### 1. Room-based project structure

Every task must be routed to one primary room or system:

- `Farm`
- `Lab`
- `Zen`
- `Tasks`
- `Stars Shop`
- `Admin`
- `Core / Backend`
- `Visual Engine`
- `Analytics`
- `Legal / Compliance`

This reduces chaotic changes and prevents one request from accidentally breaking the whole app.

### 2. Telegram is an adapter, not the product core

Telegram gives us:

- Mini App entry
- identity bootstrap
- Stars payments
- bot/channel traffic

But the real product state must live on our backend:

- resources
- capsule slots
- lab results
- Zen sessions
- paid entitlements
- BioCards
- admin logs

### 3. Server-authoritative economy

The frontend can show and request actions. The backend must decide valuable results:

- rewards
- mutation results
- paid product delivery
- account progress
- card drops
- task rewards when they become meaningful

### 4. Stars are a billing system, not a UI button

Paid value is delivered only after Telegram `successful_payment` is received and validated server-side.

Required long-term pieces:

- product catalog on server
- payment order
- payment ledger
- grant ledger
- Telegram charge id
- idempotency
- admin visibility
- refund/support path

### 5. Capsules are upgradeable living devices

A capsule is not just a plant slot. It should become:

- a visual device
- a timer/progress object
- an upgrade surface
- a probability/rarity surface
- a monetization surface

Slot direction:

- Capsule 1: free starter
- Capsule 2: Bio Credits unlock
- Capsule 3: progression unlock
- Capsule 4: Stars premium unique capsule

### 6. Lab transforms Farm output into meaning

Lab should not be a simple button screen. It should become the place where Farm outputs are converted into:

- strains
- artifacts
- rare mutation outputs
- meditation modifiers
- BioCards
- event results

### 7. Zen is the core product identity

The game exists to guide people into meditation through curiosity and progression.

Zen must become:

- calm
- premium
- audio-aware
- visually soft
- connected to Lab artifacts
- rewarding through internal energy, not medical promises

### 8. Operator/Admin is a cockpit

If a mechanic matters, Admin should eventually show it:

- players
- payments
- room opens
- Farm actions
- Lab mutation attempts
- Zen sessions
- task claims
- paid entitlements
- errors
- revenue

### 9. Performance rule

We do not adopt heavy visual code from the other project.

Avoid in MVP:

- heavy 3D
- complex shaders
- large video backgrounds
- expensive particle systems
- many simultaneous live canvases
- fragile Telegram WebView effects

Prefer:

- CSS
- SVG
- lightweight canvas only where needed
- state-driven classes
- small procedural parameters
- reduced motion support later

## What We Do Not Adopt

- The second project's full player UI.
- Heavy GPU visuals.
- Any visual system that makes the laptop/phone hot.
- NFT/TON implementation in phase 1.
- Marketplace/trading in phase 1.
- Player-facing AI assistant in phase 1.
- Complex random paid loot before the billing/audit model is mature.

## Working Rule From Now On

Before implementation, Codex should silently convert every request into:

```text
ROOM:
SYSTEM:
GOAL:
SMALLEST RESULT:
DO NOT TOUCH:
RISK:
VERIFY:
```

For example:

```text
ROOM: Farm
SYSTEM: Visual Engine
GOAL: Add a premium capsule slot preview.
SMALLEST RESULT: Slot 4 looks special and opens Stars product.
DO NOT TOUCH: Bottom nav, payment backend, Zen room.
RISK: UI overlap on mobile.
VERIFY: Browser mobile-width check and payment button still visible.
```

## Blueprint Files

The original detailed documents are copied to:

`docs/blueprint/`

Use them as reference material, not as direct code instructions.
