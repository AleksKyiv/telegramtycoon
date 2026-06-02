# Weekly Events

## Purpose
Weekly events create freshness and reasons to return.

They can introduce:
- limited plants
- event recipes
- special capsule visuals
- temporary meditation effects
- partner tasks
- seasonal rewards
- limited BioCard series

## Core Idea

```text
This week only: unique plant / ritual / reward path
```

The event should be visible but not required for normal progress.

## Event Types

### 1. Limited Plant
One plant is available only during the event window.

Example:

```text
Moon Basil
Available: 7 days
Trait: higher Calm interaction
Drop: moon_basil_strain
```

### 2. Limited Lab Recipe
A temporary synthesis recipe appears in the Lab.

Example:

```text
Moon Basil Strain + Calm Energy -> Quiet Moon Fragment
```

### 3. Meditation Event
Meditation room uses event artifacts for special Calm effects.

Example:

```text
Quiet Moon Fragment unlocks Moon Calm session.
```

Event artifacts can also appear on the distant Meditation trophy shelf so the player sees limited rewards as part of their personal room.
They can also unlock a limited BioCard from the event series.

### 4. Partner / Social Event
External task event.

Examples:
- join Telegram channel
- visit TikTok
- partner program action
- claim reward after validation/mock

### 5. Premium Event Hook
Stars may accelerate or unlock premium convenience, but should not be the only way to participate.

Good:
- event premium capsule skin
- accelerated event synthesis
- extra event ritual attempt

Avoid:
- pay-only event plant as the only meaningful event content

## Event Data Model

```json
{
  "id": "week_01_moon_basil",
  "title": "Moon Basil Week",
  "startsAt": "2026-06-01T00:00:00Z",
  "endsAt": "2026-06-08T00:00:00Z",
  "limitedPlants": ["moon_basil"],
  "recipes": ["quiet_moon_fragment"],
  "tasks": ["join_telegram", "visit_tiktok"],
  "rewards": ["moon_badge", "bioCredits"],
  "starsOffers": ["event_synthesis_boost"]
}
```

## Limited Plant Data

```json
{
  "id": "moon_basil",
  "name": "Moon Basil",
  "tier": "event",
  "durationSec": 600,
  "baseReward": 38,
  "eigenstates": [0.42, 0.34, 0.18, 0.06],
  "eventId": "week_01_moon_basil",
  "tags": ["event", "calm-linked"]
}
```

## UI Placement

### Home
Show:
- weekly event strip
- limited plant preview
- time remaining
- primary action

### Plant Selection
Add:
- `Event` category/tab
- limited plant card
- countdown badge

### Lab
Show:
- event recipe
- active synthesis timer
- acceleration option if eligible

### Meditation
Show:
- event artifact usage if unlocked
- event session effect
- event trophy on the distant Meditation shelf

### Shop
Show:
- event-related Stars offer only if it is clear and not predatory

## Event Progression

Recommended event loop:

```text
plant event plant
collect event strain
use strain in Lab recipe
create event artifact
use artifact in Meditation
receive special Calm/capsule effect
```

This connects:
- Capsule
- Lab
- Meditation
- Events

## Event Rewards

Good rewards:
- event badge
- cosmetic capsule shell
- event strain
- meditation artifact
- limited event BioCard
- event BioCard mini-series
- small Bio Credits reward
- event league points later

Avoid early:
- huge economy boosts
- tradable marketplace items
- complex rarity market

## Live Ops Requirements
Events should be config-driven.

Operator should eventually control:
- event start/end
- event plant
- recipe availability
- reward table
- event task URLs
- Stars offer availability

Phase 1 can hardcode one event mock, but structure should match future config.

## First MVP Event
Recommended:

```text
Moon Basil Week
```

Why:
- close to starter Basil
- easy to understand
- visually distinct
- can connect to Calm/Meditation

## Product Rule
Weekly events should make the world feel alive.

They should answer:

```text
What is special this week?
```
