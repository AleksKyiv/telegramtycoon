# Visual Shell Freeze

The current visual direction must be preserved. Future work should change mechanics and structure without replacing the visual identity.

## Visual Parts To Keep

### Farm

Keep:

- Main capsule scene.
- `#plantCapsule`.
- Drone on the left side of the capsule.
- Data module near the drone.
- Chamber carousel / pod visual system.
- Root/light energy details.
- Bottom action dock.
- Compact resource bar.
- Dark neon cyber-green atmosphere.

Key files/selectors:

- `index.html`
  - `#farmRoom`
  - `#plantCapsule`
  - `#specimenGrid`
  - `.specimen-pod`
  - `#capsuleDrone`
  - `#dataModuleBtn`
  - `.action-dock`
- `styles.css`
  - Farm capsule blocks.
  - `#farmRoom .specimen-grid`
  - `.specimen-pod`
  - `.capsule-drone`
  - `.capsule-data-module`
  - `.token-flow-map`

### Lab

Keep:

- Biotech mutation capsule visual.
- DNA helix / reactor mood.
- Confirm mutation panel.
- 10 Stars unique mutation button.

Key files/selectors:

- `index.html`
  - `#labRoom`
  - `.mutation-lab`
  - `#mutationCapsule`
  - `#synthBtn`
  - `#rareMutationBtn`
- `styles.css`
  - `.mutation-lab`
  - `.mutation-capsule`
  - `.lab-reactor-field`
  - `#labRoom.rare-active`

### Zen

Keep:

- Zen floor/capsule base mood.
- Nano pot.
- DNA core selector.
- Soft breathing effect.
- 1/2/3 minute buttons.
- Sound buttons.
- DNA tap targets.

Key files/selectors:

- `index.html`
  - `#zenRoom`
  - `.zen-space`
  - `.zen-nano-pot`
  - `.zen-gene-capsule`
  - `.zen-dna-target`
  - `.zen-mode`
  - `.zen-sound`
- `styles.css`
  - `.app.room-zen .zen-space`
  - `.zen-nano-chamber`
  - `.zen-gene-capsule`
  - `.zen-nano-pot`
  - `.zen-dna-target`

### Assets

Keep:

- `assets/bunker-capsule-scene.png`
- `assets/green-loading.png`
- `assets/croclis-token-mark.png`

## What Must Not Happen

- Do not replace current UI with the donor HTML UI.
- Do not add a marketing landing page.
- Do not redesign all rooms at once.
- Do not make visual changes while rebuilding math unless the visual is broken.
- Do not move buttons or panels without checking mobile fit.

## Visual Rule

The donor file is a mechanics reference, not a design source.

The target is:

```text
Current CyberGreen/Croclis visual shell
+ donor-style mechanical depth
+ clean server state
+ Telegram Stars safety
```

