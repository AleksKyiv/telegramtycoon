# Player Shell

## Purpose
This file defines the real, buildable structure of the player-facing Telegram Mini App.

The goal is not to mirror concept art exactly.
The goal is to deliver:
- `80-90%` of the approved LabOS feeling
- with realistic implementation complexity
- using scalable UI components
- and leaving room for future modules

## Product Role
The player app is the main user-facing shell of the product.

It should feel like:
- a personal living laboratory
- a daily ritual product
- a progression game
- a lightweight wellness-driven system

It must not feel like:
- a generic admin panel
- a cluttered dashboard
- a tap-to-earn clone

## Phase 1 Product Scope
Phase 1 excludes:
- NFT
- TON
- external tokenized ownership
- heavy social systems
- advanced 3D scenes
- player-to-player marketplace

Phase 1 includes:
- player home shell
- core resource display
- growth loop
- lab loop
- meditation loop
- artifact/progression loop
- Stars monetization
- Telegram-first navigation/events
- local upgrade shop
- Stars capsule slot offer

## Main Screen Structure

### 1. Top Bar
Purpose:
- immediate orientation
- identity
- access to the core economy

Contents:
- player avatar / profile
- level or lab status
- `3 resource counters`
- settings / inbox / alerts entry point
- `Account / More` button for Settings, Support, Web Version, and future wallet identity

Rule:
- the primary resource must visually dominate
- the other two resources must remain clearly legible but secondary

### 2. Central Reactor
Purpose:
- emotional center of the product
- visual summary of player state
- state-driven procedural object

Implementation:
- SVG-based layered rings
- gradients
- soft glow
- slow pulse animation
- optional light canvas particle layer

The reactor should react to:
- main energy balance
- active experiments
- meditation influence
- rare/quantum state modifiers

### 3. Capsule Zone
Purpose:
- show live growth / synthesis objects
- become the main procedural visual feature

Implementation:
- 1 main focus capsule in MVP
- optional secondary mini-capsules later
- SVG shell + procedural inner state

This is where the strongest procedural identity of the player app lives.

### 4. Module Entry Cards
Purpose:
- route the player into the product rooms

MVP modules:
- `Growth Chambers`
- `Laboratory`
- `Meditation`
- `Artifacts`
- `Collection / BioCards`
- `Events`
- `Shop`

Rules:
- each card must show status, not just a button
- cards must communicate active progress
- meditation card must feel calmer and more meaningful than the others

### 5. Active Timers / Ritual Strip
Purpose:
- create return loops
- expose what is happening now

Examples:
- growth ready in `12m`
- synthesis stable for `2h`
- meditation charge available
- daily ritual reward ready

### 6. Bottom Navigation
MVP tabs:
- `Home`
- `Grow`
- `Lab`
- `Meditate`
- `Shop`

Secondary entries can include:
- `Events`
- `Profile`
- `Partners`

Do not put Settings, Support, or wallet linking in bottom navigation.
These live in the `Account / More` menu.

Rule:
- no deep navigation complexity in phase 1
- room transitions should feel clear and controlled

## Visual Implementation Rules

### Keep
- dark LabOS atmosphere
- glass cards
- layered depth
- subtle pseudo-3D
- curved geometry
- glow and soft motion

### Avoid
- heavy 3D
- complex shaders
- large video backgrounds
- dense moving scenes
- anything fragile in Telegram WebView

## Sound Implementation Rules
Player actions should have short sound feedback.

Examples:
- button press
- tab change
- plant
- harvest
- BioCard reveal
- shop action
- meditation attention point

Rules:
- sounds are optional
- mute must be available
- audio starts only after user interaction
- meditation soundscapes are separate from short UI sounds

Detailed rules live in `UI_SOUND_SYSTEM.md`.

## Resource Model For UI
There will be `3 main resource slots` in the top bar.

Current working model:
- `R1: Main Coin / Main Energy`
- `R2: Growth / Material Resource`
- `R3: Meditation / Social or Calm Energy`

Notes:
- the final names can change later
- the layout should already support 3 resource counters
- one resource is primary and must have the strongest visual hierarchy
- the primary resource visual is now anchored by `assets/main-coin-reference.png`

## Meditation Module Role
Meditation is not a decorative side feature.

It is a core identity module because it:
- creates a socially meaningful layer
- gives the product a healthier differentiation
- can generate one of the important resources
- balances the product away from pure extraction mechanics
- adds a recognizable breathing/progress loop
- gives the player beautiful personal statistics
- lets Lab artifacts change the meditation field procedurally

Meditation should feel:
- calm
- intentional
- rewarding
- integrated into the lab world

It should not feel like:
- a random wellness popup
- generic breathing app UI detached from the product

Meditation must keep:
- breathing effect
- session progress
- inhale / hold / exhale rhythm
- Calm Energy reward
- daily streaks and statistics
- visual graphs
- artifact input slot
- distant trophy/artifact shelf
- soundscape selector
- soft attention-point interaction
- session durations of `45 sec`, `2 min`, and `5 min`

The procedural part should change the chamber around the breathing core, not replace the breathing core.

The meditation room should also gradually show player achievements through distant shelves, niches, or trophy plinths.
These objects represent earned artifacts from Lab, events, capsule milestones, and meditation streaks.

Meditation should not show the entire BioCards collection.
It should only show selected trophies, featured series, or the active artifact/card connected to the current session.

## Scaling Strategy
The player shell must be easy to scale.

That means:
- cards are modular
- resource bar is generic
- procedural core is parameter-driven
- future rooms can plug into the shell without redesigning everything

## Telegram-First Requirements
The player app must be designed as a Telegram Mini App from the start.

That means:
- mobile-first layout
- safe-area friendly spacing
- short labels
- touch-first controls
- Telegram WebApp init support
- external links through controlled buttons
- Stars-ready shop flows
- clear `Open Web Version` action in Account menu

## Account / More Menu
The Player shell needs one system menu outside the main gameplay tabs.

MVP items:
- Settings
- Support
- Open Web Version
- Inbox shortcut optional
- identity status
- disabled `Connect Wallet` future item for Tonkeeper / Telegram Wallet

Detailed rules live in `ACCOUNT_MENU.md`.

## Events / External Actions
The app should support event/action cards.

Examples:
- visit Telegram channel
- visit TikTok
- open partner program
- complete event task
- claim event reward

These should be treated as `Events`, not core navigation.

Phase 1 events can be simple:
- button opens external link
- player can mark/claim if backend confirms later
- reward can be manual/mock until backend validation exists

## Shop Model
There are two different shop concepts.

### 1. Local Shop
Phase 1.

Purpose:
- buy upgrades
- unlock capsule slots
- buy boosts
- buy premium ritual access

Currencies:
- main coin
- bio material
- calm energy
- Telegram Stars for premium offers

### 2. Player Marketplace
Future phase.

Purpose:
- players list rare items/strains/artifacts
- players trade or buy unique outputs

This is not phase 1 because it requires:
- moderation
- pricing rules
- fraud controls
- item ownership logic
- economy safety

## Capsule Slot Monetization
Capsules are a core monetization and progression surface.

Working model:

| Slot | Unlock Method | Role |
| --- | --- | --- |
| Capsule 1 | free | starter ritual |
| Capsule 2 | main coin | progression unlock |
| Capsule 3 | main coin / higher requirement | deeper progression |
| Capsule 4 | Telegram Stars | premium unique capsule |

Capsule 4 must feel special.

Rules for Stars capsule:
- must not be only faster
- should guarantee a unique quality or unique ritual category
- should have distinct visual identity
- should still respect balance

Possible value:
- guaranteed unique mutation category
- exclusive capsule skin
- better rare floor
- special artifact fragment path
- daily premium ritual charge

## MVP Build Order
1. Top bar with 3 resources
2. Central reactor
3. Capsule zone
4. Module cards
5. Active timers strip
6. Bottom nav
7. State wiring to real backend data

## Approved Direction
The current approved player direction is:
- close in spirit to the selected operator reference
- simpler and warmer
- mobile-first
- implementation-aware
- procedural visuals focused in `reactor + capsule`
