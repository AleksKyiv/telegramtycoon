# Procedural Capsule V1

## Purpose
This file defines how the capsule should work in phase 1.

The capsule is not just an illustration.
It is the bridge between:
- player inputs
- simulation state
- visual identity
- rewards / outcomes

We should treat the capsule as a `state-driven procedural object`.

Primary gameplay mechanic reference:
- `docs/LIVING_CAPSULE_MECHANIC.md`

Primary immediate visual reaction reference:
- `docs/LAB_PROCEDURAL_REACTION.md`

## What The Capsule Represents
Each capsule represents a live experiment or growth process.

It visually reflects:
- what was inserted into it
- the current growth or synthesis phase
- the energy/resource mix
- the stability or chaos of the process
- rare / quantum influence
- meditation influence

Important:
- visual reaction starts immediately after selection/planting
- do not wait until harvest to show procedural changes

It may later produce:
- harvested value
- rare states
- strains
- artifacts
- byproducts / waste

Some outputs feed Lab synthesis:
- strains
- artifact fragments
- waste/byproducts
- unique plant outputs

Lab progression reference:
- `docs/LAB_PROGRESSION_AND_SYNTHESIS.md`

## Two-Layer Model
To avoid chaos, capsule logic is split into two layers.

### 1. Simulation Layer
This determines the actual gameplay outcome.

Examples:
- state probabilities
- rewards
- rare drops
- mutation flags
- byproducts

### 2. Visual Layer
This determines how the capsule looks and moves.

Examples:
- color palette
- ring count
- particle density
- pulse rhythm
- anomaly effects
- internal geometry

The visual layer must reflect the simulation layer, but not own it.

## Phase 1 Inputs
These are the core inputs to capsule generation.

### Identity Inputs
- `internal_user_id`
- `capsule_id`
- `experiment_type`
- `specimen_type`

### Resource Inputs
- `main_resource_amount`
- `material_resource_amount`
- `meditation_resource_amount`

### Progress Inputs
- `growth_phase` in range `0..1`
- `stability` in range `0..1`
- `mutation_level` in range `0..1`
- `upgrade_tier`

### Rare-State Inputs
- `quantum_bias`
- `artifact_modifiers`
- `special_event_flags`

## Deterministic Seed
The capsule should have a deterministic visual seed.

Suggested formula:

```text
capsule_seed = hash(
  internal_user_id,
  capsule_id,
  experiment_type,
  specimen_type,
  created_at_bucket,
  server_seed_version
)
```

Purpose:
- stable visuals across reloads
- reproducible state
- safe procedural identity

## Normalized Resource Mix
First derive normalized resource weights:

```text
total = main + material + meditation

rm = main / total
rg = material / total
rd = meditation / total
```

If total is zero:

```text
rm = 1
rg = 0
rd = 0
```

These normalized values drive both visual and gameplay modulation.

## Simulation Formula
Phase 1 should stay close to the existing quantum-harvest logic already discussed.

### Step 1: Base Eigenstate Profile
Each specimen has a base probability profile:

```text
[ground, first, excited, quantum]
```

Example concept:
- basil-like specimen -> more stable, lower rare chance
- chroma-like specimen -> stronger upper states

### Step 2: Apply Hamiltonian Shift
We shift the profile upward using controlled factors.

Working formula direction:

```text
shift =
  upgrade_tier * 0.07 +
  material_resource_factor * 0.02 +
  meditation_resource_factor * 0.015 +
  quantum_bias * 0.03
```

Then modify the base profile:

```text
ground   -= shift * 2.0
first    += shift * 0.5
excited  += shift * 0.8
quantum  += shift * 0.7
```

After clamping, always normalize probabilities.

### Step 3: Stability and Mutation Influence
Stability and mutation influence the distribution.

Working direction:
- higher `stability` reduces bad collapse variance
- higher `mutation_level` increases rare outcomes but also chaos and byproduct risk
- meditation should nudge the system toward `clean rare` rather than `chaotic rare`

### Step 4: Collapse
Use weighted random collapse:

```text
ground | first | excited | quantum
```

### Step 5: Outcome
The collapsed state drives:
- reward multiplier
- strain chance
- artifact chance
- byproduct/waste amount
- visual anomaly level

## Working Reward Logic
Baseline multiplier direction:

```text
ground   = 0.6
first    = 1.0
excited  = 1.8
quantum  = 4.0
```

This stays close to the original logic already shown in the quantum engine.

## Byproduct / Waste Logic
Waste should exist from phase 1 in a simple form.

Suggested direction:

```text
waste =
  base_waste
  + mutation_level * 0.5
  + quantum_if_unstable_bonus
  - meditation_cleanliness_bonus
```

Interpretation:
- aggressive high-reward runs create more waste
- meditation can act as a stabilizing or cleansing force

## Visual Genome Formula
The capsule visual should be derived from a compact genome object.

### Base Genome

```text
visual_genome = {
  seed,
  palette_family,
  core_shape_family,
  ring_count,
  pulse_speed,
  particle_density,
  fluid_opacity,
  anomaly_level,
  meditation_signature
}
```

### Derivation Rules

#### Palette
Driven by:
- specimen type
- resource mix
- meditation presence
- rare state

Direction:
- main resource -> brighter energy accent
- material resource -> denser bio/organic accent
- meditation resource -> softer teal/calm glow
- quantum state -> rare high-contrast accent

#### Core Shape Family
Driven by:
- specimen type
- seed
- mutation level

Possible families:
- orb
- bud
- lattice
- root-knot
- crystalline nucleus

#### Ring Count
Driven by:
- growth phase
- upgrade tier
- quantum intensity

Suggested direction:

```text
ring_count = 2 + floor(growth_phase * 3) + quantum_bonus
```

#### Pulse Speed
Driven by:
- main resource intensity
- stability
- active state

Direction:
- more stability -> smoother pulse
- more mutation -> irregular pulse
- meditation -> slower, calmer modulation

#### Particle Density
Driven by:
- material resource
- quantum state
- mutation level

#### Fluid Opacity
Driven by:
- specimen type
- growth phase
- material resource

#### Anomaly Level
Driven by:
- collapsed state
- mutation level
- special event flags

This controls:
- flickers
- micro-fractures
- distortion rings
- rare branching filaments

#### Meditation Signature
Meditation should leave a visible mark.

It may appear as:
- calm secondary halo
- smoother particle drift
- softer teal wave layer
- cleaner capsule atmosphere

This is important because meditation must feel socially meaningful, not abstract.

## What The Capsule Can Create
In phase 1 and later, capsule outputs can evolve in this order:

### Phase 1
- main resource reward
- rare state result
- strain drop
- simple waste/byproduct

### Phase 2
- artifact fragments
- recipe unlocks
- stronger mutation branches
- cleaner vs chaotic progression routes

### Phase 3
- unique artifact classes
- persistent rare specimen variants
- event-specific experimental outputs

## Implementation Strategy

### Easy Layer
Implement first with:
- HTML/CSS layout
- SVG shell
- SVG gradients
- CSS animations

### Controlled Procedural Layer
Add:
- generated parameters from `visual_genome`
- optional light canvas particles
- state-based class modifiers

### Avoid In V1
- real 3D
- complex fluid simulation
- expensive physics
- too many simultaneous live capsules

## Phase 1 Success Criteria
Procedural capsule v1 succeeds if:
- it clearly changes based on inserted inputs
- it is visually stable and attractive
- it reflects rare/meditation states
- it is cheap enough to run in Telegram Mini App
- it is easy to expand without redesigning the whole system
