# Product Mirror

This is the operator map for AI-assisted development.

The owner should not manage technical scope manually. Codex must use this mirror to convert free-form product direction into controlled work.

## Status Colors

| Color | Meaning | Codex behavior |
|---|---|---|
| Green | Stable | Do not touch unless named directly |
| Yellow | In work | Change only the active target |
| Blue | Needs owner review | Explain changed / not touched / risk |
| Red | Broken or disputed | Fix before new feature work |
| Gray | Not built or placeholder | Design before implementation |

## Layer Model

Every change belongs to one or more layers. Codex must name the layer before editing.

| Layer | Meaning | Stop condition |
|---|---|---|
| Product | Why the element exists | Ask if the business meaning changes |
| UX | What the player understands | Ask if controls or clarity may change |
| Visual | How it looks | Keep changes inside the named component |
| Gameplay | What the player can do | Ask if progress, rewards, or timing change |
| Economy | CRC, SE, Zen, DNA, Stars math | Ask before changing numbers |
| Payment | Telegram Stars purchase and delivery | Full chain required |
| Persistence | Saved state and backend records | Server + client consistency required |
| Admin | Owner visibility and reporting | Keep financial/user data auditable |

## Current Mirror

| ID | Module | Room | Status | Primary layer | Current role | Do not touch without naming |
|---|---|---|---|---|---|---|
| F01 | Farm room shell | Farm | Yellow | Visual / UX | First 30-second product impression | Lab, Zen, Shop, Admin |
| F02 | Farm capsule slots | Farm | Yellow | Gameplay / Visual | Planting, growing, harvesting | Economy math, Stars, drone skin |
| F03 | Drone rail | Farm | Red | Visual | Service drone inside farm scene | Beam, skins, capsule, rewards |
| F04 | Drone skins | Farm | Blue | Payment / Persistence / Visual | Free skins plus paid 50 Stars skin | Drone rail position, Farm rewards |
| F05 | Farm reward clarity | Farm | Yellow | UX / Economy | Show what plants produce without clutter | Shop, Lab formulas |
| L01 | Lab room shell | Lab | Gray | Product / Visual | Future advanced crafting room | Farm fast-start loop |
| L02 | Lab reactor | Lab | Gray | Gameplay / Visual | Future artifact synthesis process | Stars math until designed |
| L03 | Lab formulas | Lab | Gray | Economy / UX | Future artifact recipes from DNA/materials | CRC formula cost |
| Z01 | Zen room | Zen | Green | Emotional / Visual | Separate meditation state | Farm core loop, Stars |
| S01 | Settings shell | Core | Blue | UX | Compact settings entry | Farm layout |
| S02 | Sound and vibration | Core | Blue | Audio / UX | Sound panel inside settings | TON wallet, policy links |
| S03 | TON wallet button | Core | Blue | Platform / UX | Placeholder connect entry | Payment logic unless requested |
| P01 | Stars products | Core | Yellow | Payment / Economy | Paid pass, slot, mutation, drone skin | Frontend-only rewards |
| A01 | Admin payments | Admin | Yellow | Admin / Payment | Owner sees Stars operations | Game visuals |
| A02 | Admin users | Admin | Yellow | Admin / Analytics | Owner sees unique users and locale | Payment rows |
| C01 | Product docs | Core | Yellow | Process | Prevent uncontrolled AI changes | Runtime code unless requested |

## Active Work Rule

Before code, Codex must declare one active mirror ID.

```text
ACTIVE MIRROR ID:
OWNER REQUEST:
LAYER:
EXACT CHANGE:
DO NOT TOUCH:
EXPECTED FILES:
VERIFY:
```

If more than one mirror ID is needed, Codex must explain why before editing.

## No New Layer Rule

For refinement tasks, Codex must edit the existing layer instead of adding a new visual or logic layer.

Required before editing:

```text
Existing layer found:
Problem inside that layer:
Change inside that layer:
New layer avoided:
Dead layer removed:
```

If Codex cannot find the existing layer, it must inspect the code first. It must not add an override at the bottom of CSS as the default solution.

## Owner Burden Rule

The owner may speak naturally.

Codex is responsible for:

- mapping the request to mirror ID;
- detecting layers;
- protecting stable modules;
- asking only when consequences are non-obvious;
- writing the smallest safe change;
- reporting what changed and what was not touched.

The owner is not responsible for writing technical packets.

## Release Focus

Current product priority:

```text
Farm fast-start loop -> visible value -> Stars value -> Admin visibility -> Lab depth.
```

Do not build deep Lab complexity before Farm, Stars, and Admin are stable enough to trust.

