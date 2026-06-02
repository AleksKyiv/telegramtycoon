# Telegram-First Player MVP

## Goal
Build the first player MVP as a Telegram Mini App experience, not a generic web page.

The MVP should prove:
- the capsule ritual loop is interesting
- the main coin feels valuable
- events can drive external actions
- Stars can monetize a premium capsule slot
- collectible BioCards can make rare results feel valuable
- UI sounds make actions feel alive
- the app can expand into shop and future marketplace later
- the first player session teaches the loop in under 3-5 minutes
- the first visual wow happens within the first minute

## MVP Screens

### 1. Home
Contents:
- top resource bar
- main coin counter with reference coin visual
- current league status
- Account / More button
- central living capsule
- active ritual status
- quick actions
- daily/event strip

### 2. Grow / Capsules
Contents:
- capsule slot list
- slot 1 free
- slot 2 coin unlock
- slot 3 coin unlock
- slot 4 Stars unlock / premium unique capsule
- capsule detail panel
- capsule-specific upgrades
- specimen selection
- resource input
- start ritual
- tiered plant selection panel
- mobile double tap / desktop double click shortcut
- persistent `Plant` button

### 3. Lab
Contents:
- results
- strains
- artifact fragments later
- waste/byproduct
- upgrade hooks
- Lab Level
- synthesis processes
- Stars acceleration for active synthesis
- meditation artifact outputs

### 4. Meditate
Contents:
- calm energy generator
- daily calming ritual
- social/meaningful framing
- calm energy claim
- breathing cycle UI
- procedural meditation field
- session progress scales
- meditation statistics and charts
- Lab artifact resonance hooks
- artifact slot/drawer
- distant artifact/trophy shelf
- soundscape selection
- 45 sec / 2 min / 5 min sessions
- 3 attention points during each session
- focus score from attention points

### 5. Shop
Contents:
- local upgrade shop
- capsule unlocks
- boosts
- Stars offers

### 6. Events
Can be secondary screen or section.

Contents:
- Telegram channel link
- TikTok link
- partner program link
- event tasks
- reward claim placeholders
- weekly limited plant
- time-limited recipe/event reward
- event announcement messages from Operator
- Home banner / inbox CTA

### 6A. Inbox
Can be a simple panel in MVP.

Contents:
- operator announcements
- event launches
- reward messages
- maintenance notices
- read/unread state
- CTA button

### 7. League
Can be a button/panel, not necessarily a full bottom tab in MVP.

Contents:
- current league
- lifetime Bio Credits
- progress to next league
- five league ladder
- light reward preview

### 8. Collection
Can be later than the first MVP screen set.

Contents:
- BioCards
- card series
- rare mutation cards
- event cards
- card backs
- rarity filters later
- collection completion later
- future physical/NFT-ready identity

### 9. Account / More
System menu, not a bottom tab.

Contents:
- Settings
- Support
- Open Web Version
- identity status
- future `Connect Wallet` with Tonkeeper / Telegram Wallet options

Settings must include:
- master/music volume
- music on/off
- UI sounds on/off
- vibration/haptics on/off
- Terms and Conditions
- Privacy Policy
- Delete Account

## Bottom Navigation
Recommended phase 1 tabs:
- `Home`
- `Capsules`
- `Lab`
- `Meditate`
- `Shop`

Events can be shown as:
- top strip on Home
- small icon/action card
- secondary route

League can be shown as:
- top status pill
- Home card
- Profile/secondary panel

## Shop Boundaries

### Phase 1: Local Shop
Build this first.

Includes:
- upgrades
- boosts
- capsule slot unlocks
- Stars premium offer

### Later: Marketplace
Do not build this in phase 1.

Reasons:
- player-to-player trade adds fraud risk
- unique item listing requires ownership model
- economy can break quickly
- moderation is needed

## Stars MVP
The first Stars mechanic should be simple and high-value:

`Premium Capsule Slot`

Secondary Stars mechanic:

```text
accelerate active Lab synthesis
```

This should reduce time, not directly sell final rare results.

Working offer:
- unlock Capsule 4
- premium visual identity
- guaranteed unique category or rare-floor improvement
- not just speed

Payment lifecycle later must include:
- invoice creation
- payment confirmation
- idempotent grant
- ledger entry
- audit log
- `/paysupport`

Detailed Stars billing security rules live in `STARS_BILLING_SECURITY.md`.

## Event Cards
Event cards should support:
- title
- description
- action button
- external URL
- reward preview
- status

Examples:
- `Join Telegram`
- `Visit TikTok`
- `Partner Program`
- `Season Drop`
- `Weekly Limited Plant`

## First Build Recommendation
Build `player.html` as a Telegram-first MVP shell with:
- Home
- Capsules
- Meditate
- Shop
- Events strip
- mock Stars premium capsule
- plant selection panel with Starter/Growth/Rare/Premium tiers
- capsule detail panel with Level/Stabilizer/Premium Core upgrades
- one mocked weekly event with a limited plant
- inbox/Home banner mock for Operator announcements
- Meditate room with `45 sec / 2 min / 5 min` breathing sessions, artifact slot, distant trophy shelf, soundscape selection, procedural field, 3 attention points, Calm reward, focus score, and basic charts
- one BioCard reward reveal for a rare/quantum result
- BioCard rarity and series labels
- duplicate count support in local state
- global sound toggle and basic UI action sounds
- Account / More drawer with Settings, Support, Open Web Version, and disabled wallet connection placeholder
- Settings controls for music volume, sound toggles, vibration, Terms and Privacy links
- Delete Account button with confirmation flow
- legal pages available at `terms.html` and `privacy.html`

Use local state first, then connect backend.

First session tuning:
- first plant should grow in `20-45 sec`
- capsule should visually react immediately after plant selection/planting
- first harvest should show collapse state
- first next goal should be `unlock Capsule 2`
- Stars capsule should be visible but not pushed too aggressively

## Desktop Fallback
The player product should also work as a normal browser app.

Reason:
- Telegram is the main distribution layer
- but the core product should survive outside Telegram
- desktop web is also useful for testing and future fallback

Rules:
- all core actions must work with mouse
- double click may mirror mobile double tap
- visible buttons must always exist for important actions
- no Telegram-only gesture should be required

## Key Product Rule
The player should understand within 10 seconds:

```text
I grow living capsule rituals.
The main coin unlocks progress.
Meditation creates calm energy.
Stars unlock a special capsule.
Events give extra ways to earn.
Rare discoveries become collectible BioCards.
```

## Meditation Spec
Detailed Meditation room rules live in `MEDITATION_ROOM.md`.

## UI Sound Spec
Short button/action feedback sounds are defined in `UI_SOUND_SYSTEM.md`.

## Account Menu Spec
Settings, Support, Web Version, and future wallet identity live in `ACCOUNT_MENU.md`.

## Legal Pages Spec
Terms and Privacy requirements live in `LEGAL_PAGES.md`.
