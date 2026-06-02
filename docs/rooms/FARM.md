# Farm Room Passport

## Role

Farm is the starter room and resource engine. It teaches the player the loop through visual growth, capsule slots, drone support, and first resource pressure.

Farm should feel like a premium microculture system, not a generic farm.

## Current Elements

- Capsule chamber
- Plant chamber carousel
- One active product and locked/future slots
- Drone on the left side
- Drone skin chamber prototype
- Energy / water / power indicators
- Auto collect
- Stars slot concept
- Bottom navigation

## Adopted Blueprint Direction

Farm should become the `Living Capsule Ritual` entry point:

```text
choose specimen
start growth / ritual
watch capsule react immediately
collect result
use result to upgrade / feed Lab / support Zen
```

The first visual reaction should happen before the reward.

Minimum feeling:

```text
I put something in, and the lab responded.
```

## Capsule Slot Model

| Slot | Unlock | Role |
| --- | --- | --- |
| Capsule 1 | free | starter loop |
| Capsule 2 | main coin / Bio Credits | early progression |
| Capsule 3 | main coin / level gate | deeper progression |
| Capsule 4 | Telegram Stars | premium unique capsule |

Capsule 4 must feel special and should not be only faster. It can offer unique category, premium shell, better rare floor, or special mutation path.

## Capsule Upgrade Direction

First upgrade types:

- Level: better baseline output
- Stabilizer: more stable, less waste, uses Zen/Calm Energy
- Premium Core: Stars-linked special identity

Later:

- Lens
- Bioflow
- Waste filter
- Skin / visual shell

## Plant Selection Direction

The plant selector should be visual and tiered:

- Starter: Basil, Rukola
- Growth: Sunflower, Mint
- Rare Bio: Chroma, Neon Fern
- Premium/Event: Quantum Bloom, limited event plants

First session should use a very fast starter plant:

```text
Basil Trial: 20-45 sec
```

## Stable Rules

- Bottom buttons must not move.
- Bottom navigation must not move.
- Main plant/capsule must stay readable on mobile.
- Stars payment buttons must be visually obvious when paid content is involved.
- Any paid slot unlock must be connected to server state before it becomes real.
- Heavy GPU visuals are not allowed in Farm MVP.
- Hidden rooms should not run expensive animations.

## Data To Save

- Active plant state
- Slot ownership
- Resources
- Lifetime earned main coin / Bio Credits
- Drone level
- Drone skin
- Auto collect state
- Last collect time
- Farm actions history
- Capsule upgrade levels
- Capsule visual seed later

## Admin Needs

- Opens of Farm
- Grow clicks
- Collects
- Auto collect enabled/disabled
- Drone skin selections
- Slot unlock attempts
- Stars purchases tied to Farm
- Capsule ownership
- Capsule upgrade purchases

## Next Useful Work

1. Stabilize Farm layout rules.
2. Define slot economy and saved ownership.
3. Make Capsule 4 a real Stars entitlement.
4. Move Farm state from local-only to server-backed.
5. Add clear visual feedback for `what should I press`.
6. Add first-session Basil Trial loop.
