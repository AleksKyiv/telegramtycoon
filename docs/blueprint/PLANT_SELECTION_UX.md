# Plant Selection UX

## Purpose
This file defines how players choose what to plant in capsule slots.

The flow must work for:
- Telegram Mini App on mobile
- desktop web fallback
- future browser version outside Telegram

## Core Flow

```text
tap capsule
open plant selection panel
choose plant category/tier
select plant
preview cost / time / probabilities
plant via button or double tap
capsule starts ritual
```

## Capsule Interaction

When the player taps an empty capsule:
- open plant selection sheet/panel
- show available plants first
- show locked plants with unlock hints
- highlight cheapest starter options
- also show capsule upgrade access in the detail panel

When the player taps a planted capsule:
- show progress
- show remaining time
- show current visual state
- show possible outcomes
- show collect action if ready
- show upgrades that affect future rituals

## Plant Catalog Structure

Plants should be divided into progression zones.

### Suggested Phase 1 Tiers

| Tier | Name | Role | Example Plants |
| --- | --- | --- | --- |
| `T1` | Starter | cheap and stable | Basil, Rukola |
| `T2` | Growth | better output, longer time | Sunflower, Mint |
| `T3` | Rare Bio | stronger mutation profile | Chroma, Neon Fern |
| `T4` | Premium / Event | special access | Quantum Bloom |

## Starter Plants
The player should start with cheap, understandable plants.

Starter goals:
- fast first success
- low waste
- stable probability profile
- low cost
- visually satisfying enough

Good starter examples:
- `Basil`
- `Rukola`

First-session special:
- `Basil Trial`
- grows in `20-45 sec`
- teaches the loop before the player leaves

## Progression
The catalog should gradually reveal stronger plants.

Unlock methods:
- player level
- capsule upgrade
- Bio Credits cost
- quest/event reward
- Stars premium capsule path later

The player should always understand:
- what is unlocked now
- what is next
- what is needed to unlock it

Starter timing should be intentionally short.

Recommended timing:
- Tutorial: `20-45 sec`
- Starter: `1-3 min`
- Growth: `5-15 min`
- Rare Bio: `30-90 min`
- Premium/Event: custom

## UI Layout

### Mobile Telegram
Use a bottom sheet or full-screen drawer.

Sections:
- plant tier tabs
- plant cards
- selected plant preview
- `Plant` button

### Desktop Web
Use a side panel or modal.

Sections:
- left: tier/category list
- center: plant grid
- right/bottom: selected plant details
- persistent `Plant` button

## Plant Cards
Each plant card should show:
- plant icon/visual
- name
- tier
- cost
- growth time
- expected reward
- rare chance indicator
- lock state if unavailable

Card states:
- available
- selected
- locked
- unaffordable
- recommended

## Selection Behavior

### Mobile
Supported actions:
- tap plant to select
- double tap plant to plant immediately
- tap `Plant` button to confirm

### Desktop
Supported actions:
- click plant to select
- double click plant to plant immediately
- click `Plant` button to confirm

Rule:
- always keep a visible `Plant` button
- double tap/double click is a shortcut, not the only path

## Selected Plant Preview
After selecting a plant, show:
- larger plant visual
- cost
- growth time
- base eigenstate probabilities
- expected reward range
- possible drops
- waste risk

Example:

```text
Basil
Cost: 12 Bio Credits
Time: 2m
Profile: stable starter
Ground 50% / First 32% / Excited 13% / Quantum 5%
```

## Probability Preview
The preview should show the current expected probabilities after:
- plant base eigenstate
- capsule upgrade
- selected resource inputs
- calm energy influence

This helps the player understand the system without exposing too much math.

## Catalog Filters
Phase 1:
- `Starter`
- `Growth`
- `Rare`
- `Premium`
- `Event`

Later:
- `Owned seeds`
- `Meditation-linked`
- `High mutation`
- `Low waste`

Event plants:
- appear only during active weekly events
- show countdown
- should remain visible as locked/expired after the event only if useful for collection memory

## Empty State
If the player has no available plant in a tier:
- show locked cards
- explain the unlock requirement
- suggest the next action

Example:

```text
Reach Lab Level 3 to unlock Rare Bio plants.
```

## Planting Validation
The backend should validate:
- capsule is empty
- plant is unlocked
- player can pay cost
- capsule type allows this plant
- Stars capsule rules if premium slot

Frontend can preview, but backend owns truth.

## MVP Plant Data Shape

```json
{
  "id": "basil",
  "name": "Basil",
  "tier": "starter",
  "cost": { "bioCredits": 12 },
  "durationSec": 120,
  "baseReward": 22,
  "eigenstates": [0.5, 0.32, 0.13, 0.05],
  "unlock": { "type": "default" },
  "tags": ["stable", "low-waste"]
}
```

## UX Rule
Plant selection should feel like choosing an experiment, not filling a spreadsheet.

The UI should be:
- visual
- tiered
- fast
- readable
- touch-friendly
- desktop-friendly
