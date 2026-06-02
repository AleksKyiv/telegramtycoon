# Capsule Upgrades

## Purpose
Capsules are not just empty planting slots.

Each capsule should become its own upgradeable object with:
- level
- modules
- visual identity
- planting controls
- probability effects
- monetization hooks

## Core UX

When the player taps/clicks a capsule:

```text
capsule expands
capsule detail panel opens
player sees status + plant action + upgrades
```

This panel is the main place where the player:
- plants specimens
- checks growth
- sees probabilities
- collects results
- upgrades the capsule
- sees premium options

## Capsule Detail Panel

### Empty Capsule
Show:
- enlarged capsule visual
- slot level
- capsule type
- `Plant` action
- plant selection entry
- upgrade modules
- next upgrade preview

### Growing Capsule
Show:
- enlarged live capsule
- plant/specimen inside
- timer
- growth phase
- current probability preview
- upgrade options that can affect future rituals

### Ready Capsule
Show:
- collect button
- collapse state preview/teaser
- expected reward range
- collect animation

### Locked Capsule
Show:
- unlock requirement
- cost
- preview of why it matters
- Stars option if premium

## Capsule Upgrade Types

### 1. Level Upgrade
Currency:
- Bio Credits

Effect:
- improves baseline output
- slightly improves state probabilities
- may reduce growth time a little

Example:

```text
Capsule Level 1 -> 2
Cost: 80 Bio Credits
Effect: +4% excited pressure, -3% growth time
```

### 2. Lens Module
Currency:
- Bio Credits
- later rare material

Effect:
- improves rare state visibility/probability
- improves probability preview accuracy

### 3. Stabilizer Module
Currency:
- Bio Credits
- Calm Energy

Effect:
- improves stability
- lowers waste
- makes meditation resource more valuable

### 4. Bioflow Module
Currency:
- Bio Credits
- Biomass

Effect:
- improves growth/material efficiency
- increases base reward floor

### 5. Premium Core
Currency:
- Telegram Stars

Effect:
- unlocks special capsule identity
- adds unique mutation category
- may improve rare floor
- should not simply be a huge reward multiplier

## Suggested Module Slots

Each capsule can have a few upgrade slots.

Phase 1:
- `Level`
- `Lens`
- `Stabilizer`

Later:
- `Bioflow`
- `Quantum Core`
- `Waste Filter`
- `Skin / Visual Shell`

## Coin vs Stars Philosophy

### Bio Credits Upgrades
Should feel like normal progression.

Good for:
- level
- small probability improvements
- growth time reduction
- stability
- efficiency

### Stars Upgrades
Should feel premium and unique.

Good for:
- unique capsule slot
- special visual shell
- guaranteed unique mutation category
- exclusive ritual type
- extra daily premium ritual

Avoid:
- raw pay-to-win multipliers
- making free capsules feel useless
- selling too many confusing boosts

## Capsule Slot Model

| Capsule | Unlock | Upgrade Path |
| --- | --- | --- |
| Capsule 1 | free | Bio Credits level path |
| Capsule 2 | Bio Credits | Bio Credits + Calm stabilizer path |
| Capsule 3 | Bio Credits / level gate | advanced Bio Credits path |
| Capsule 4 | Stars | premium unique path |

## Capsule Upgrade Effects On Formula

### Level
Feeds into:

```text
upgrade_tier
```

Effect in formula:

```text
shift += capsule_level * 0.04
```

### Lens
Feeds into:

```text
quantum_bias
```

Effect:

```text
quantum_bias += lens_level * 0.02
```

### Stabilizer
Feeds into:

```text
stability
```

Effect:

```text
stability += stabilizer_level * 0.06
waste -= stabilizer_level * 0.08
```

### Premium Core
Feeds into:

```text
unique_mutation_floor
premium_visual_identity
```

Effect:
- unlocks premium mutation family
- improves minimum result quality slightly
- does not bypass server collapse

## Capsule Detail UI Sections

Recommended layout:

```text
Capsule visual
Capsule status
Plant / Collect action
Probability preview
Upgrade modules
Next unlock / premium offer
```

## Upgrade Card Contents

Each upgrade card should show:
- name
- current level
- next effect
- cost
- currency icon
- action button

States:
- available
- unaffordable
- maxed
- premium
- locked

## Interaction

### Mobile
- tap capsule to open detail sheet
- sheet can expand to full screen
- tap upgrade card to select
- tap upgrade button to buy

### Desktop
- click capsule to open side panel or modal
- double click empty capsule can go directly to plant selection
- upgrade buttons always visible

## First MVP Recommendation
Build only these upgrades first:

1. `Capsule Level`
2. `Stabilizer`
3. `Premium Core` for Stars capsule

Defer:
- many tiny modules
- cosmetic shop
- complex upgrade trees

## Product Rule
The capsule should feel like:

```text
This is my lab device.
I can improve it.
It changes what I can create.
```

Not:

```text
This is just an empty timer slot.
```
