# Leagues

## Purpose
Leagues give the player a visible long-term status.

League is based on lifetime collected primary currency, not current balance.

Primary currency:
- `Bio Credits`

Use:
- motivation
- progression identity
- future leaderboards
- event eligibility
- social status later

## Rule

```text
league_progress = lifetime_earned_bio_credits
```

Do not use current balance, because players should not lose league progress when spending.

## Five Leagues

| League | Lifetime Bio Credits | Meaning |
| --- | ---: | --- |
| `Sprout League` | 0+ | first experiments, starter capsules |
| `Cultivator League` | 1,000+ | player understands growth and upgrades |
| `Synth League` | 7,500+ | player uses lab synthesis and better plants |
| `Chroma League` | 35,000+ | rare bio states and unique outputs become common goals |
| `Quantum League` | 150,000+ | high-status endgame / seasonal goal |

## League Flavor

### 1. Sprout League
Theme:
- starter growth
- first capsule
- learning loop

Visual:
- emerald seed
- small gold rim
- soft glow

### 2. Cultivator League
Theme:
- stable grower
- second capsule
- better resources

Visual:
- leaf-ring
- stronger gold rim
- brighter green core

### 3. Synth League
Theme:
- lab progression
- recipes
- strain refinement

Visual:
- lab triangle/circuit
- cyan synthesis lines
- rotating ring

### 4. Chroma League
Theme:
- rare bio outputs
- mutation paths
- deeper capsule builds

Visual:
- emerald/cyan crystal bloom
- subtle rainbow/chroma edge
- anomaly sparks

### 5. Quantum League
Theme:
- elite progression
- rare states
- premium-level mastery

Visual:
- quantum coin halo
- gold/emerald double ring
- high-energy core

## UI Placement

Add a visible `League` button/entry.

Possible locations:
- Home top bar as small status pill
- Profile section
- bottom nav secondary action
- Events/season panel

MVP recommendation:
- show current league in top resource bar
- add `League` card on Home
- clicking opens League panel

## League Panel
Show:
- current league
- lifetime Bio Credits
- progress to next league
- next league reward preview
- 5 league ladder

Example:

```text
Cultivator League
2,450 / 7,500 Bio Credits to Synth League
Next unlock: Lab recipe slot preview
```

## Rewards
League rewards should be light in MVP.

Possible rewards:
- cosmetic badge
- event eligibility
- small one-time Bio Credits grant
- unlock hint
- future leaderboard tier

Avoid:
- huge economy multipliers
- making league rewards mandatory for balance

## Integration
Leagues can later connect to:
- seasons
- leaderboards
- event eligibility
- referral rewards
- partner campaigns

## Product Rule
Leagues should answer:

```text
How far have I grown in this world?
```

Not:

```text
How much currency do I have right now?
```
