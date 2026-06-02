# Lab Procedural Reaction

## Purpose
The laboratory and capsule visuals must react immediately to what the player inserts.

This is the first wow effect.

The player should feel the system is alive within the first minute.

## Core Rule

```text
Every inserted plant/resource changes the capsule visually immediately.
```

Harvest is not the first moment of feedback.
Planting is.

## What Changes Instantly
When the player plants or inserts material, the capsule should update:

- fluid color
- glow intensity
- particle density
- internal shape
- root/branch pattern
- pulse rhythm
- ring motion
- mutation flicker
- calm wave layer

## Inputs

### Plant / Specimen
Controls:
- base palette
- internal shape family
- organic pattern
- starting particle style

Examples:

| Plant | Visual Family | Feel |
| --- | --- | --- |
| `Basil` | soft sprout / leaf vein | stable, starter |
| `Rukola` | sharper branching veins | quicker, more active |
| `Sunflower` | radial growth core | warmer, stronger |
| `Chroma` | crystalline bio-lattice | rare, unstable |

### Main Coin / Bio Credits
Controls:
- gold rim intensity
- reward expectation glow
- primary energy pulse

### Biomass
Controls:
- fluid density
- organic particles
- internal growth mass
- branching roots

### Calm Energy
Controls:
- teal halo
- smoother pulse
- clean wave layer
- lower visual noise

### Mutation Pressure
Controls:
- flicker
- anomaly cracks
- branching instability
- irregular pulse

### Capsule Upgrades
Controls:
- ring count
- lens overlays
- stabilizer fields
- visual quality tier

## Visual Genome
The lab should derive a visual genome for the active capsule.

```json
{
  "seed": "stable deterministic seed",
  "plantFamily": "sprout",
  "palette": "emerald-gold",
  "fluidDensity": 0.42,
  "particleDensity": 0.35,
  "branchComplexity": 0.22,
  "pulseSpeed": 0.8,
  "goldRimIntensity": 0.5,
  "calmWave": 0.2,
  "mutationNoise": 0.1,
  "ringCount": 2
}
```

## First Minute Wow
In the first minute, the player should see:

```text
empty capsule -> plant selected -> capsule fills -> sprout pattern appears -> pulse starts -> timer begins
```

Minimum visual sequence:
1. empty capsule has faint idle glow
2. selecting plant previews color/pattern
3. planting triggers fill animation
4. particles appear
5. plant-specific pattern forms
6. capsule enters living growth state

## First Plant: Basil Trial
Basil Trial should be quick but beautiful.

Visuals:
- emerald fluid fills the capsule
- small leaf-vein pattern appears
- gold rim pulses once
- teal particles drift upward
- reactor lightly responds

This teaches:
- plants create visual identity
- the system is procedural
- this is more than a timer game

## Lab Screen Role
The Lab screen is where deeper transformations happen.

Phase 1 Lab should show:
- active capsule visual
- result history
- strains / fragments
- waste/byproduct
- upgrade hooks

Later Lab can add:
- artifact synthesis
- fusion
- mutation recipes
- waste processing
- branch evolution
- timed synthesis with Stars acceleration
- meditation artifact creation

Progression reference:
- `docs/LAB_PROGRESSION_AND_SYNTHESIS.md`

## Capsule vs Lab

### Capsule
Focus:
- live growth
- immediate reaction
- planting
- harvest/collapse

### Lab
Focus:
- what results become
- strains
- upgrades
- synthesis
- artifacts later

They should share the same procedural visual language.

## Implementation Strategy

### Phase 1
Use:
- CSS gradients
- SVG capsule shell
- light canvas particles
- data-driven classes/variables

Do not require:
- heavy 3D
- real fluid simulation
- complex shader pipeline

### Later
Can add:
- WebGL capsule shader
- Three.js ritual scene
- animated specimen models

## Visual Variables
Recommended CSS/custom property bridge:

```css
--capsule-primary: #42f0b3;
--capsule-secondary: #57e5da;
--capsule-gold: #c7a22b;
--fluid-density: 0.42;
--particle-density: 0.35;
--pulse-speed: 2.4s;
--mutation-noise: 0.1;
```

## Product Rule
The first visual reaction must happen before the first reward.

The player should think:

```text
I put something in, and the lab responded.
```
