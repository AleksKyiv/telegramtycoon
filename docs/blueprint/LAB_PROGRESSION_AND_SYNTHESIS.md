# Lab Progression and Synthesis

## Purpose
The Laboratory is a progression engine.

It should not be just a results screen.

The Lab is where the player:
- uses capsule outputs
- spends resources
- starts synthesis processes
- waits for transformation
- optionally accelerates with Stars
- unlocks more unique plants/items through Lab Level
- creates unique things that can be used in Meditation

## Core Loop

```text
collect capsule output
choose lab synthesis
insert required items/resources
start process
wait
optionally accelerate
claim unique result
use result in capsules / meditation / upgrades
```

## Lab Inputs
Laboratory processes may use:
- Bio Credits
- Biomass
- Calm Energy
- strains
- waste/byproducts
- artifact fragments
- unique plant outputs

## Lab Outputs
Possible outputs:
- new plant access
- strains
- artifact fragments
- meditation artifacts
- capsule modules
- waste refinements
- rare recipe unlocks

## Lab Level
The Laboratory has its own level.

Lab Level unlocks:
- more plant tiers
- higher synthesis recipes
- better mutation recipes
- meditation-compatible artifacts
- advanced capsule modules
- waste processing options
- weekly event recipes when active

Example:

| Lab Level | Unlock |
| ---: | --- |
| 1 | Starter synthesis |
| 2 | Growth plants and basic stabilizers |
| 3 | Rare Bio plants |
| 4 | meditation artifacts |
| 5 | advanced mutation recipes |
| 6 | premium/event synthesis paths |

## Synthesis Timing
Lab processes take time.

Suggested timing:

| Process Type | Time | Purpose |
| --- | ---: | --- |
| Tutorial synthesis | 30-60 sec | teach lab loop |
| Basic synthesis | 3-10 min | short return |
| Rare synthesis | 30-120 min | longer goal |
| Advanced artifact | 4-12h | deep retention |
| Event/premium | variable | special drops |

## Stars Acceleration
Stars can accelerate lab processes.

This should be framed as:

```text
accelerate active synthesis
```

Not:

```text
buy final result directly
```

Why:
- keeps the system fairer
- preserves gameplay logic
- creates monetization without destroying progression

## Acceleration Rules
Phase 1 recommendation:
- Stars can reduce remaining synthesis time
- Stars should not change the already-determined result unless explicitly designed
- acceleration must be idempotent and logged
- backend must validate all payments and grants

Possible acceleration options:
- `small boost`: reduce 15 minutes
- `major boost`: reduce 50% remaining time
- `finish now`: premium, only for eligible processes

## Lab Recipes
Each recipe should define:
- required Lab Level
- inputs
- duration
- output table
- Stars acceleration eligibility
- visual reaction type

Example:

```json
{
  "id": "basic_strain_refinement",
  "requiredLabLevel": 1,
  "inputs": {
    "bioCredits": 40,
    "basil_strain": 1
  },
  "durationSec": 300,
  "outputs": ["stabilized_basil_strain"],
  "canAccelerateWithStars": true
}
```

## Meditation Link
Unique lab results can be used in Meditation.

This is important because Meditation should not be isolated.

Lab-created meditation items may:
- improve Calm Energy generation
- change meditation visuals
- unlock meditation sessions
- give temporary capsule stability buffs
- reduce waste after a meditation ritual

Examples:

| Lab Output | Meditation Effect |
| --- | --- |
| `calm_lotus_fragment` | +Calm gain |
| `stabilized_basil_strain` | lower waste in next ritual |
| `chroma_breath_orb` | rare meditation visual + capsule stability buff |
| `quiet_resonance_artifact` | boosts clean rare outcomes |

Some unique lab results can also create BioCards.
These cards represent important discoveries, not every ordinary output.

## Unique Things
Unique lab outputs should have two lives:

1. In the game economy
2. In the meditation room

Example:

```text
You synthesize a Chroma Breath Orb in the Lab.
Then you use it in Meditation to create a special calm field.
That field improves the next capsule ritual.
```

## Lab Visuals
Lab processes should be visually procedural.

Visual inputs:
- recipe type
- inserted materials
- strains
- waste amount
- calm energy
- lab level

Visual outputs:
- reactor color
- synthesis rings
- particle type
- container pattern
- anomaly level
- cleanliness/stability glow

## First MVP Lab Scope
Build only:
- one tutorial synthesis
- one strain refinement
- one meditation artifact recipe
- one Stars acceleration mock
- Lab Level 1-3 gates
- one weekly event recipe mock

Do not build:
- huge recipe tree
- marketplace
- complex crafting economy
- many acceleration products

## Product Rule
The Lab should feel like:

```text
I transform what I grew into something more meaningful.
```

Not:

```text
I only click upgrade buttons.
```
