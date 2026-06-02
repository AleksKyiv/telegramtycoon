# Living Capsule Mechanic

## Purpose
This is the core phase 1 mechanic for the player product direction:

`Living Capsule Ritual`

It is based on the original quantum harvest formula:

```text
eigenstates -> Hamiltonian shift -> wave collapse -> reward/state/result
```

## Core Fantasy
The player places biological or energetic material into a living capsule.

The capsule grows, stabilizes, mutates, and finally collapses into one of several states.

The result gives:
- main coin / Bio Credits
- possible strains
- possible artifact fragments later
- waste / byproducts
- visual mutation of the capsule

## Phase 1 Loop

```text
choose specimen
add resources
start capsule ritual
wait / influence
collapse state
collect reward
use reward to upgrade / repeat
```

## Main Inputs

### Specimen Type
Defines the base eigenstate profile.

Example:

| Specimen | Ground | First | Excited | Quantum | Meaning |
| --- | ---: | ---: | ---: | ---: | --- |
| `basil` | 0.50 | 0.32 | 0.13 | 0.05 | stable starter |
| `rukola` | 0.45 | 0.33 | 0.16 | 0.06 | slightly sharper |
| `sunflower` | 0.40 | 0.35 | 0.18 | 0.07 | stronger growth |
| `chroma` | 0.30 | 0.35 | 0.25 | 0.10 | rare high-potential |

### Resources
Phase 1 has 3 resource lanes:

| Resource | Working Role | Effect |
| --- | --- | --- |
| `main_coin` | reward and progression currency | earned after collapse |
| `bio_material` | growth/material input | shifts probabilities upward |
| `calm_energy` | meditation/social resource | stabilizes and cleans the result |

### Upgrade Tier
Lab upgrades increase upward state pressure.

Example:
- UV panel
- capsule lens
- stabilizer ring
- bio-reactor core

Capsule-specific upgrades are defined in:
- `docs/CAPSULE_UPGRADES.md`

## State Model
Capsule collapse states:

| State | Meaning | Reward Multiplier | Visual Feel |
| --- | --- | ---: | --- |
| `ground` | weak/basic result | 0.6 | dim, dense, slow |
| `first` | normal clean result | 1.0 | stable glow |
| `excited` | strong result | 1.8 | bright pulse, active particles |
| `quantum` | rare result | 4.0 | high glow, anomaly rings, strain drop |

## Base Formula

### 1. Select Base Eigenstates

```js
const base = PLANT_EIGENSTATES[specimenType];
```

### 2. Calculate Inputs

Clamp resource influence so the economy does not explode.

```text
bio_material_factor = min(bio_material_used, 10)
calm_energy_factor = min(calm_energy_used, 10)
```

### 3. Hamiltonian Shift

Working formula:

```text
shift =
  upgrade_tier * 0.07 +
  capsule_level * 0.04 +
  bio_material_factor * 0.02 +
  calm_energy_factor * 0.015 +
  quantum_bias * 0.03
```

Then shift the distribution:

```text
ground  = base.ground  - shift * 2.0
first   = base.first   + shift * 0.5
excited = base.excited + shift * 0.8
quantum = base.quantum + shift * 0.7
```

Clamp values:

```text
ground >= 0.05
quantum <= 0.35
all values >= 0
```

Then normalize:

```text
probability = value / sum(values)
```

## Calm Energy Role
`calm_energy` should not simply make everything more profitable.

It should:
- improve stability
- reduce waste
- make rare results feel cleaner
- create a meaningful meditation link

Suggested stability formula:

```text
stability =
  base_stability
  + calm_energy_factor * 0.045
  + stabilizer_upgrade * 0.06
  - mutation_pressure * 0.04
```

Clamp:

```text
stability = clamp(stability, 0, 1)
```

## Mutation Pressure
Mutation pressure makes the capsule more exciting but riskier.

```text
mutation_pressure =
  bio_material_factor * 0.04
  + quantum_bias * 0.08
  + risky_artifact_bonus
```

High mutation pressure:
- increases anomaly visuals
- can improve rare output later
- increases waste
- may require calm energy to stabilize

## Collapse
Use weighted random selection after normalization:

```text
roll 0..1
collapse into ground / first / excited / quantum
```

Important:
- the server must perform collapse
- the client only displays results
- no reward calculation should be trusted from the frontend

## Reward

```text
earned_main_coin = round(base_reward * state_multiplier * ritual_bonus)
```

Baseline:

```text
ground   = 0.6
first    = 1.0
excited  = 1.8
quantum  = 4.0
```

`ritual_bonus` can later include:
- daily streak
- meditation completion
- artifact passive
- event modifier

## Strain Drop
When collapse is `quantum`:

```text
add item: specimen_type + "_strain"
```

Optional phase 1 chance:

```text
if state === "quantum": guaranteed strain
if state === "excited": small strain_fragment chance
```

## Waste / Byproduct
Every ritual can produce byproduct.

```text
waste =
  base_waste
  + mutation_pressure * 0.5
  + quantum_unstable_bonus
  - calm_energy_factor * 0.04
```

Clamp:

```text
waste >= 0
```

Meaning:
- high-risk rituals create more waste
- meditation makes the system cleaner
- waste can later become a separate branch of gameplay

## Visual Mapping

The same result must drive capsule visuals.

| Input / State | Visual Output |
| --- | --- |
| high `bio_material` | denser fluid, more organic particles |
| high `calm_energy` | smoother waves, teal halo, cleaner capsule |
| high `mutation_pressure` | unstable flickers, branching lines |
| high `stability` | smooth pulse and clean glow |
| `ground` | muted green, low activity |
| `first` | stable emerald glow |
| `excited` | bright pulse, gold rim flash |
| `quantum` | intense emerald/cyan glow, anomaly rings, rare strain reveal |

## Player Decisions
The mechanic should give the player simple but meaningful choices:

| Player Choice | Tradeoff |
| --- | --- |
| add more bio material | higher output, more mutation/waste |
| use calm energy | cleaner, more stable, less waste |
| wait for daily ritual | possible bonus |
| upgrade lab | better baseline probabilities |
| use risky artifact later | more rare chance, more instability |
| unlock premium capsule | Stars-only unique ritual path |
| upgrade capsule | better stability, rare pressure, or unique path |

## Capsule Slots

Phase 1 slot model:

| Slot | Unlock | Mechanic |
| --- | --- | --- |
| `capsule_1` | free | starter ritual |
| `capsule_2` | main coin | extra growth capacity |
| `capsule_3` | main coin / progression | advanced ritual capacity |
| `capsule_4` | Telegram Stars | premium unique capsule |

Premium capsule rule:
- it should guarantee some form of uniqueness
- it must not break economy balance by only multiplying rewards
- best use is unique category, visual identity, or rare-floor improvement

## MVP Implementation Shape

### UI
- specimen selector
- tiered plant selection panel
- resource input controls
- capsule preview
- start ritual button
- timer/state display
- collapse result screen

### Backend
- validates inputs
- calculates probabilities
- performs collapse
- writes reward ledger
- writes item drops
- writes waste/byproduct
- returns result payload

### Result Payload

```json
{
  "state": "excited",
  "earnedMainCoin": 86,
  "waste": 3.2,
  "strainDrop": null,
  "probabilities": {
    "ground": 0.31,
    "first": 0.36,
    "excited": 0.24,
    "quantum": 0.09
  },
  "visualGenome": {
    "palette": "emerald-gold",
    "pulseSpeed": 1.24,
    "particleDensity": 0.58,
    "anomalyLevel": 0.21,
    "calmSignature": 0.44
  }
}
```

## Design Rule
The player should feel:

```text
I am not just harvesting.
I am preparing a living experiment.
```

That is the emotional difference between this product and a generic farming game.
