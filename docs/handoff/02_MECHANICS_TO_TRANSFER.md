# Mechanics To Transfer

This document says what should be transferred from the donor mechanics file and from the current project.

## Donor File

Path:

`C:\Users\komir\Desktop\bunkers_volume_cybericons_3d.html`

Use it as a working mechanics reference.

Do not copy its visual design.

## Best Mechanics From Donor

### 1. Farm Slots

Donor has real slots:

```js
slots: [
  { id: 0, plant: "chroma", start, dur },
  { id: 1, plant: "basil", start, dur },
  { id: 2, plant: "sunflower", start, dur },
  { id: 3, plant: null },
  ...
]
```

Transfer idea:

- Each capsule/pod is a real gameplay object.
- Each slot has its own plant/strain.
- Each slot has its own timer.
- Ready slots can be harvested independently.
- Empty slots can be planted independently.
- Locked slots can be opened later through progression or Stars.

Current project already partially has this in `app.js?v=48`:

- `FARM_STRAINS`
- `farmSlots`
- `activeSlot`
- `farmActionV2`
- `collectHarvestV2`
- `serverStatePayload().farm.slots`
- `server.mjs` safe storage for `farm.slots`.

### 2. Plants / Strains

Donor has:

- `NeonBasil`
- `CyberRukola`
- `GlitchSunflower`
- `PixelWheat`
- `ChromaMint`

GDD has:

- Common strains.
- Rare strains.
- Legendary strains later.

MVP should use:

```text
Neon Basil      -> fast starter, low reward.
Cyber Rukola    -> medium, gives small synthesis bonus.
Glitch Sunflower -> slower, gives GeneStrands.
Chroma Mint     -> rare/premium, feeds Zen bonuses.
```

### 3. Random Harvest Multipliers

Donor harvest has random quality:

```text
Light
Stable
Enhanced
Quantum
```

Transfer idea:

- Keep this mechanic.
- It creates emotion without needing complex UI.
- It should feed reward text, effects, and analytics.

Current v48 already added a simple version:

- `farmRewardTier()`
- `Light / Stable / Enhanced / Quantum`

### 4. Inventory

Donor has inventory:

- `gs`
- `qn`
- harvested plant items
- created strains

GDD names:

- `BioCredits`
- `CyberSeeds`
- `GeneStrands`
- `Quantum Nutrients`
- `Zen Essence`

Current project should move toward this clean inventory:

```js
inventory: {
  bioCredits,
  cyberSeeds,
  geneStrands,
  quantumNutrients,
  zenEssence,
  harvests: {},
  strains: {}
}
```

Current v48 has a partial version:

```js
inventory: {
  geneStrands,
  quantumNutrients,
  harvests,
  strains
}
```

### 5. Lab Recipes

Donor recipes are the right direction:

- recipe costs
- synthesis queue
- stability chance
- claim when ready
- common/rare/legendary tiers

Transfer idea:

```text
Farm harvests + GeneStrands -> Lab synthesis -> Strain/artifact -> Zen effect
```

Current project only has a simplified `synthArtifact()` button.

This should be replaced next by:

- `LAB_RECIPES`
- `synthQueue`
- `startSynthesis(recipeId)`
- `claimSynthesis(jobId)`
- `stability / rare outcome`

### 6. Zen Modes

Donor has:

- `basic`
- `chroma`
- `neural`
- `void`

Transfer idea:

- Zen mode can depend on a strain.
- A strain can be consumed or activated.
- Different Zen sessions give different bonuses.

Current project already has:

- duration buttons
- sound buttons
- DNA core selector
- DNA tap targets
- Zen energy reward

Need next:

```text
Zen mode selected from available strains.
Zen completion gives Zen Essence.
Zen Essence boosts Farm/Lab.
```

### 7. Upgrades

Donor upgrade categories:

- UV Panel
- NutriBot
- BioSynth
- Gene Forge

Current project has:

- Drone upgrade.
- Data module upgrade.

Transfer idea:

Map donor upgrades into our visual modules:

```text
UV Panel       -> capsule light module
NutriBot       -> drone / feeder module
BioSynth       -> data module / lab helper
Gene Forge     -> Lab level
Zen Hub        -> Zen nano pot
```

## What To Avoid

- Do not add TON marketplace now.
- Do not add NFTs now.
- Do not add guilds now.
- Do not add Redis/BullMQ/Kubernetes now.
- Do not overbuild analytics before the core loop feels good.

## MVP Mechanical Core

The core to build now:

```text
Farm slots grow strains
-> harvest gives BioCredits + GeneStrands
-> Lab consumes harvest/GeneStrands
-> Lab creates rare strain/artifact
-> Zen consumes/activates rare strain
-> Zen gives Zen Essence
-> Zen Essence boosts Farm/Lab
-> Stars unlock premium acceleration/exclusive slots, not hard paywall
```

