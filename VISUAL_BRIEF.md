# Green Farm Tycoon Visual Brief

## Goal

Build a premium Telegram Mini App farm screen that feels like a biotech bunker: calm, dark, glowing, collectible, and easy to understand visually without long text.

The visual target is not a regular farm. It should feel like a lab-grown microculture system where plants, roots, light, artifacts, and meditation energy are connected.

## First Target Screen

Farm screen, version `Prototype 0.2`.

The screen should include:

- Four plant chambers visible at once.
- Each plant should look like a light, precise bio-structure, not a chunky cartoon plant.
- A root/energy network under the chambers.
- Light or sun signal on one side of each plant.
- Artifact chance or artifact signal on the other side.
- Main controls: Grow, Boost, Auto Collect, Stars.
- Bottom navigation: Farm, Lab, Zen.
- Top resource bar: growth/resource, water/energy, resonance, Stars, sound.

## Visual Direction

Keywords:

- biotech bunker
- glowing microculture
- nano roots
- premium Telegram game
- dark glass
- cyan/green/gold highlights
- soft animated energy
- collectible specimens

Avoid:

- bulky cartoon plants
- random decorative clutter
- huge buttons that dominate the screen
- flat UI
- too much text
- generic farming visuals

## Plant Language

Plants should be built as collectible structures.

Each plant can have:

- thin stem lines
- glowing nodes
- small light leaves or dots
- root filaments
- color hue
- core color
- energy pulse speed
- rarity/artifact affinity

This supports future NFT metadata.

Example metadata fields:

- `variantId`
- `family`
- `rarity`
- `stemHue`
- `leafHue`
- `coreHue`
- `rootPattern`
- `artifactChance`
- `growthSpeed`
- `mutationLevel`

## Reference Needs

Send 5-10 references if possible:

- Capsule or lab chamber reference.
- Plant/microculture reference.
- Glowing root/energy reference.
- Button/UI reference.
- Bunkers or similar Telegram Mini App screen.
- NFT collectible card/reference if relevant.

For each reference, we should mark:

- What to copy: color, layout, button style, plant shape, mood, lighting.
- What not to copy.

## Figma Task

Create one polished Farm screen mockup first.

Figma file:

- https://www.figma.com/design/vaidZh8Bn513BGV6Kf15M0

Required frame:

- Mobile viewport: `390 x 844`.
- Farm screen only.
- 4 plant chambers.
- Root energy layer.
- Left sun/light indicators.
- Right artifact indicators.
- Compact, raised controls.
- Bottom nav.

Deliverable:

- One approved visual frame.
- Then Codex ports the frame into HTML/CSS.

## Current Prototype Notes

Current code already has:

- `PLANT_VARIANTS` generator for 100 plant variants.
- 4 plant chambers in the Farm screen.
- Grow / Boost / Auto Collect.
- basic root energy visualization.
- Lab and Zen rooms.

Next visual work should focus on:

- making plant structures more elegant;
- improving the root energy composition;
- making the capsule layout more premium;
- replacing rough UI with a coherent Figma-approved style.

## Reference Direction Added

Primary reference:

- `C:\Users\komir\Desktop\photo_2026-05-16_23-43-38.jpg`

What this changes:

- Lab should become a full Mutation room, not just a simple artifact room.
- The Lab hero should be a central glass capsule with DNA / fusion spiral.
- Mutation odds should appear as a right-side neon panel.
- Fusion process should appear as a left-side neon panel.
- Stars purchase button should feel like a premium confirm action.
- Auto-harvest / automation should be a compact glowing toggle.
- Farm can borrow the capsule material and root energy, but Lab should be more intense and technical.

New target screen:

- `Prototype 0.3: Lab Mutation Screen`

Required Lab elements:

- central mutation capsule;
- DNA or fusion helix;
- left fusion-process panel;
- right mutation-odds panel;
- lab level indicator;
- confirm mutation button with Stars price;
- auto-harvest toggle;
- bottom navigation.
