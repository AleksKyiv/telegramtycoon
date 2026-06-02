# BioCards Collection

## Purpose
BioCards are collectible visual cards connected to discoveries, strains, artifacts, events, and special progression moments.

They are inspired by physical collectible cards, but phase 1 should keep them fully digital.

Future possibilities:
- printable cards
- premium physical drops
- NFT/TON ownership layer
- event-limited collectible series

Phase 1 rule:
Do not build NFT or physical fulfillment yet.
Build the digital card identity first.

## Product Role
BioCards give rewards emotional weight.

Instead of only receiving:

```text
+42 Bio Credits
```

the player can receive:

```text
New BioCard discovered: GreenFarm Mutation Zone GF-MZ83
Rare Class
Mutation Success: 83%
Toxicity: Low / Stable
```

This creates:
- collection motivation
- visual progression
- event retention
- future merchandise/NFT path
- a stronger reveal moment after Lab/Capsule outcomes

## What BioCards Are
BioCards are not every single plant.

They represent meaningful discoveries:
- rare capsule mutation
- Lab-created artifact
- weekly event reward
- league milestone
- premium Stars capsule output
- meditation streak milestone
- special series completion

There can still be mass/common cards.
The rule is not that every card must be rare.
The rule is that cards should be part of a collection system, not raw inventory spam.

Common cards can teach collecting.
Rare cards create desire.
Event cards create urgency.
Ultra-rare cards create long-term obsession.

## Card Types

| Type | Example | Source |
| --- | --- | --- |
| `Mutation Card` | `GF-MZ83` | Capsule quantum/rare collapse |
| `Artifact Card` | `Quiet Moon Fragment` | Lab synthesis |
| `Event Card` | `Moon Basil Week` | Weekly event |
| `Series Back Card` | `GreenFarm Dinamik` | Collection/album branding |
| `Premium Card` | `Golden Strain Core` | Stars capsule or premium event |
| `Meditation Card` | `7-Day Calm Resonance` | Meditation streak/milestone |

## Card Anatomy
Recommended fields:
- card name
- series name
- card id
- rarity
- class
- HP or stability score
- DNA sequence id
- mutation success
- toxicity/stability label
- source room
- season/event id
- QR code placeholder later
- visual frame style

Example:

```text
GreenFarm Mutation Zone
DNA Sequence #83
Rare Class
GF-MZ83
HP 150
Mutation Success: 83%
Toxicity: Low / Stable
Source: Capsule Ritual
```

## Rarity
Working rarity ladder:
- `Common`
- `Uncommon`
- `Rare`
- `Epic`
- `Legendary`
- `Quantum`

Alternative display names can be more collectible:
- `Common`
- `Green`
- `Rare`
- `Gold`
- `Mythic`
- `Quantum`

Visual mapping:
- Common: green/black
- Uncommon: emerald/teal
- Rare: violet/green
- Epic: gold/violet
- Legendary: red/magenta
- Quantum: prismatic/glitch/gold

## Card Supply Types
Cards should have supply/availability categories.

| Supply Type | Meaning | Example |
| --- | --- | --- |
| `Mass` | common cards many players can get | starter plant card |
| `Progression` | tied to level, league, or lab unlock | first Rare Lab card |
| `Event Limited` | only available during event window | Moon Basil Week card |
| `Premium` | connected to Stars capsule or paid cosmetic path | Golden Core card |
| `Ultra Rare` | very low drop chance, long-term chase | Quantum Mutation card |
| `Founder / Legacy` | early-user or special campaign card | Genesis Tester card |

MVP should use:
- `Mass`
- `Event Limited`
- `Rare`

Do not build complex scarcity or trading in phase 1.

## Drop Logic
Cards can drop from:
- capsule harvest
- quantum/rare collapse
- Lab synthesis
- event task completion
- league promotion
- meditation streak
- premium capsule output

Suggested drop approach:

| Source | Common | Rare | Event | Ultra Rare |
| --- | ---: | ---: | ---: | ---: |
| Starter Capsule | high | very low | none | none |
| Rare Capsule | medium | medium | event-only | low |
| Stars Capsule | medium | high | event-only | low/medium |
| Lab Synthesis | low | medium | event-only | low |
| Weekly Event | medium | medium | high | very low |

The exact percentages should be controlled by server config later.

Important:
Card drop logic must be server-authoritative before real value, trading, or payments exist.

## Series System
Cards should be grouped into series.

Examples:
- `Bio-Genesis Series`
- `Mutation Zone Series`
- `Moon Basil Week`
- `Calm Resonance Series`
- `Quantum Capsule Series`
- `Lab Relic Series`

Series matter because the Meditation room should not show every card.

Instead, Meditation can show:
- selected series trophy
- completed series marker
- one featured card from a series
- event relic connected to a series
- special card display for active meditation artifact

## Collection Completion
Cards should become more interesting when collected as sets.

Examples:

| Collection Goal | Reward Idea |
| --- | --- |
| collect 5/5 Starter Bio-Genesis cards | small Bio Credits reward |
| collect 3 Moon Basil event cards | Moon shelf trophy |
| collect all Mutation Zone rare cards | special capsule frame |
| collect 7 Calm Resonance cards | meditation soundscape unlock |
| collect Quantum set | legendary profile/title later |

Rewards in phase 1 should be mostly cosmetic or small utility.
Avoid large economy boosts until balancing is mature.

## Duplicate Cards
Duplicates are useful later, but should stay simple in MVP.

Possible future uses:
- convert duplicates into card dust
- upgrade card frame
- trade/sell if marketplace exists
- merge duplicates into animated card version
- donate/burn for event points

MVP:
- allow duplicates in state
- show count
- do not build merging/trading yet

## Card Frames
Frames communicate rarity and source.

Frame examples:
- `Common Lab Frame`
- `Rare Mutation Frame`
- `Gold Premium Frame`
- `Event Limited Frame`
- `Quantum Animated Frame`

Frame upgrades can become a future cosmetic sink.
They should not be required for MVP.

## Collection Logic Later
The card system can later support:
- card albums
- set completion rewards
- rarity filters
- animated cards
- print-ready cards
- QR verification
- marketplace/trading
- NFT-backed ownership
- physical limited drops

But these are later layers.
The first job is to make collecting feel good.

## Meditation Link
The meditation room should not become a full card gallery.

It should show only special things:
- series trophies
- rare artifacts
- meditation milestones
- event relics
- one currently active card/artifact

The full card collection should live in a separate `Collection` or `Profile` area later.

MVP approach:
- keep cards generated/visible in reward reveal
- show one `Featured Series` object on the distant Meditation shelf
- show selected active artifact/card during meditation

## Reveal Moments
BioCards should appear after meaningful moments:
- rare/quantum capsule harvest
- Lab synthesis completed
- weekly event reward claimed
- meditation streak milestone achieved
- premium capsule output

Reveal flow:

```text
Result calculated
Card frame appears
Card flips from back side
Glow/rarity reveal
Stats animate in
Player claims card
Card added to collection
```

## Physical / NFT Future
BioCards are designed to allow future expansion.

Possible future mapping:
- `digital card` -> printable collectible
- `limited event card` -> physical promo drop
- `premium rare card` -> NFT-backed ownership
- `QR code` -> verify card in web profile

Important:
This is future optionality, not phase 1 dependency.

Phase 1 should store:
- card id
- owner/player id
- card definition id
- source event/action
- rarity
- supply type
- series id
- generated visual seed
- created timestamp

This makes later physical/NFT mapping easier without committing now.

## Data Model
Minimum local/backend model:

```text
card_definitions
- id
- name
- series_id
- rarity
- supply_type
- type
- base_visual_style
- metadata_schema
- is_limited
- starts_at
- ends_at

player_cards
- id
- tg_id
- card_definition_id
- source_type
- source_id
- visual_seed
- rarity_roll
- created_at
- is_featured
- duplicate_index
```

## MVP Build Recommendation
For the first player MVP:
- create one card reveal after a rare/quantum harvest
- create one event card for `Moon Basil Week`
- create one card back design inspired by `GreenFarm Dinamik`
- create one `Featured Series` slot in Meditation
- show card rarity and series clearly
- support duplicate count in local state
- do not build trading, NFT, marketplace, or physical print flow

This gives the product the collectible feeling without adding unsafe economy complexity too early.
