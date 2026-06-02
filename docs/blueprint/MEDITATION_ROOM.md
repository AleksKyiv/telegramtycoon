# Meditation Room

## Purpose
Meditation is a core player room, not a small bonus screen.

It should feel like:
- a calm breathing app
- a living procedural chamber
- a meaningful daily ritual
- a resource generator for Calm Energy
- a statistics and progress space

The room must connect wellness, gameplay, and procedural visuals.

## Product Role
Meditation gives the product a healthier identity.

It balances the main loop:
- Growth creates plant outputs.
- Lab transforms outputs into artifacts.
- Meditation stabilizes the player system and generates Calm Energy.
- Calm Energy improves capsule and lab outcomes.

This makes the app feel less like pure farming and more like a living LabOS ritual system.

## MVP Experience
The first version should be simple, readable, and beautiful.

Core flow:

```text
Open Meditation
Choose session type
Start breathing cycle
Watch procedural chamber react
Complete session
Receive Calm Energy
Save stats
Show progress charts
```

Meditation must not be a passive timer.

The player should stay gently present through:
- guided breathing
- ambient sound
- procedural visual changes
- artifact selection
- soft attention points during the session

## Main UI Blocks

### 1. Breathing Core
This is the center of the screen.

It should include:
- expanding and contracting orb / chamber
- inhale, hold, exhale labels
- countdown timer
- soft pulse animation
- current session progress
- calm gain preview

The breathing effect must remain recognizable even when procedural modifiers change the scene.

### 2. Procedural Meditation Field
Every added item or modifier changes the visual field.

Inputs can include:
- Lab artifacts
- rare strains
- weekly event fragments
- capsule residue
- Calm boosters
- player streak level

The generated field can change:
- color palette
- particle density
- wave pattern
- halo shape
- breathing rhythm softness
- background geometry
- sound-reactive style later
- floating artifact silhouettes

Rule:
The breathing rhythm stays stable. The procedural field changes around it.

The background should not feel like a normal laboratory.

It should feel like a wide bio-conscious space:
- deep organic atmosphere
- soft living fog
- distant bio-luminescent structures
- distant artifact shelves / trophy niches
- slow neural/root-like waves
- floating pollen/particles
- calm horizon depth
- subtle energy streams connected to the breathing core

Visual reference direction:
`bio-spiritual chamber`, not `medical lab`.

## Artifact Shelf / Trophy Space
The meditation room should slowly become the player's personal achievement space.

In the distance, the room can show:
- shelves
- glowing niches
- floating plinths
- small trophy capsules
- event relics
- Lab-created artifacts

When the player earns a unique artifact through events, Lab synthesis, achievements, or special meditation sessions, it can appear in the meditation room as a visible object.

This should not display every collectible card.
The meditation room shows selected trophies, special series objects, or one featured card/artifact.
The full BioCards collection should live elsewhere later.

Purpose:
- gives long-term emotional ownership
- shows progress without opening inventory
- makes event rewards feel real
- makes meditation feel personal
- creates a reason to return even outside resource farming

MVP version:
- show 3-5 distant empty shelf slots
- show 1 starter artifact placeholder
- allow one selected artifact to glow during meditation
- show one `Featured Series` trophy/card display

Later version:
- artifact shelves become fully dynamic
- rare items have unique silhouettes
- event trophies get limited-time visual effects
- clicking a shelf item opens its story/effect panel
- shelves can be filtered by `Lab`, `Events`, `Meditation`, `Capsules`

Rules:
- shelves must stay in the background during active breathing
- trophies should not distract from the inhale / hold / exhale core
- rare artifacts can subtly affect the procedural field
- achievements should be visual, but rewards still come from backend state
- do not turn Meditation into the full card inventory

### 3. Session Control
MVP session types:

| Session | Duration | Role |
| --- | --- | --- |
| `Quick Calm` | 45 sec | first-session tutorial and daily claim |
| `Deep Focus` | 2 min | better Calm Energy and streak progress |
| `Long Resonance` | 5 min | stronger artifact effects and deeper stats |

Phase 1 should start with `Quick Calm`.

`Artifact Resonance` is a mode/modifier, not necessarily a separate duration.
It can be applied to any session when the player inserts an artifact.

## Artifact Input
The meditation room needs a clear place where the player can add items.

Recommended UI:
- right-side artifact rail on desktop
- bottom artifact drawer on mobile
- 1 active artifact slot in MVP
- 2-3 slots later through progression
- visible `Add Artifact` button
- artifact preview before starting session
- distant shelf preview showing owned special artifacts

The player flow:

```text
Open Meditate
Tap Add Artifact
Choose artifact / strain / fragment
Preview visual effect and reward effect
Start session
Procedural field changes based on selected item
```

Artifact categories:

| Category | Example | Meditation Effect |
| --- | --- | --- |
| `Calm Fragment` | `calm_lotus_fragment` | more Calm Energy |
| `Event Fragment` | `quiet_moon_fragment` | special palette and event bonus |
| `Strain Echo` | `stabilized_basil_strain` | next capsule stability bonus |
| `Rare Orb` | `chroma_breath_orb` | stronger procedural field and focus score |
| `BioCard Feature` | `GF-MZ83` | featured series/trophy display, not full inventory |

The artifact rail must communicate:
- what is inserted
- what it changes visually
- what reward it affects
- whether it will be consumed or charged

MVP rule:
Artifacts should not be consumed automatically unless the UI says so clearly.

## Attention Points
Meditation needs a light interaction mechanic so the player does not just start a timer and leave.

During each session, `3 attention points` appear at semi-random moments.

Player action:
- tap/click the glowing point
- continue breathing
- receive focus/stability score improvement

The points should feel calm, not stressful.

Recommended behavior:
- point fades in softly
- stays visible for `4-7 sec`
- moves/appears in safe visual zones around the breathing core
- never blocks the main breathing text
- tap creates a soft ripple
- missed point slightly lowers focus score, but does not fail the session

Purpose:
- encourages presence
- adds anti-idle protection
- creates a small game loop
- makes the player feel they are participating

Distribution by session:

| Session | Attention Points |
| --- | --- |
| `Quick Calm` 45 sec | 3 points |
| `Deep Focus` 2 min | 3 points, wider timing gaps |
| `Long Resonance` 5 min | 3 points, stronger reward value |

Random timing rule:

```text
Divide session into 3 time windows.
Spawn 1 point in each window.
Avoid first 5 seconds and final 5 seconds.
```

This feels random, but stays fair.

### 4. Progress And Scales
Meditation should show clear progress like normal meditation apps.

Required indicators:
- session progress ring
- inhale / hold / exhale phase
- Calm Energy earned
- daily streak
- weekly minutes
- stability score
- focus score
- attention points hit/missed

The player should always understand:

```text
I am breathing now.
I am progressing.
This session is generating Calm Energy.
My stats are improving.
```

## Statistics
Meditation needs beautiful graphs, not just numbers.

MVP stats:
- total sessions
- current streak
- weekly meditation minutes
- Calm Energy earned this week
- average stability score
- best session

Recommended chart types:
- 7-day bar chart for minutes
- line chart for stability score
- circular progress for daily goal
- small heatmap later for long-term streaks

Stats should be available inside Meditation and summarized on Home.

## Game Outputs
Meditation can produce:
- Calm Energy
- stability bonus for next capsule ritual
- lower waste chance
- better Lab synthesis stability
- event-specific Calm effect
- artifact resonance charge
- focus score from attention points

MVP output:

```text
Quick Calm -> +Calm Energy
3-day streak -> small capsule stability bonus
Lab artifact session -> special visual + bonus Calm
3/3 attention points -> higher focus score and small bonus
```

## Procedural Formula
Meditation visuals should use a deterministic visual genome.

Working model:

```text
meditationSeed = hash(
  playerId,
  sessionType,
  selectedArtifactId,
  calmStreak,
  weeklyEventId,
  dayKey,
  attentionPointSeed
)
```

Visual parameters:

| Parameter | Driven By |
| --- | --- |
| `breathScale` | breathing phase |
| `waveSpeed` | session type |
| `haloColor` | selected artifact |
| `particleDensity` | Calm Energy level |
| `fieldSoftness` | stability score |
| `geometryComplexity` | Lab artifact rarity |
| `eventTint` | weekly event |
| `anomalyNoise` | unstable residue or mutation |
| `attentionPointPositions` | session seed and safe zones |

Important rule:
Breathing state should be real-time and smooth. Procedural identity should be seeded and stable for the session.

## Visual Direction
Meditation should be calmer than Capsule and Lab.

Palette examples:
- teal and emerald for normal Calm
- moon blue for event meditation
- gold for premium artifact resonance
- violet for rare Lab artifacts
- red/magenta only for unstable or legendary event effects

Avoid:
- aggressive flashing
- too many particles during breathing
- visual chaos that makes breathing hard to follow
- heavy 3D that may fail in Telegram WebView

Implementation target:
- CSS/SVG breathing orb
- canvas particles behind it
- layered gradients
- simple procedural wave lines
- chart components in HTML/SVG
- WebAudio ambient loop later
- muted-by-default sound toggle for Telegram

## Data Model
Minimum state:

```text
meditation_sessions
- id
- tg_id
- session_type
- started_at
- completed_at
- duration_sec
- calm_earned
- stability_score
- focus_score
- attention_points_hit
- attention_points_total
- artifact_id
- event_id

player_meditation_stats
- tg_id
- total_sessions
- total_minutes
- current_streak
- best_streak
- calm_earned_total
- weekly_minutes
- average_stability
- average_focus
- last_session_at
```

In local MVP, this can live in browser state first.
Backend storage should be added before real rewards matter.

## Home Integration
Home should show:
- Calm Energy counter
- Meditation ready card
- daily streak
- quick `Start Quick Calm` action
- last session result
- new artifact/trophy unlock if earned

This makes Meditation visible without forcing the player to open the room.

## Lab Integration
Lab outputs can unlock special meditation sessions.

Examples:

| Lab Output | Meditation Effect |
| --- | --- |
| `calm_lotus_fragment` | higher Calm Energy gain |
| `quiet_moon_fragment` | moon-blue breathing field |
| `stabilized_basil_strain` | next capsule stability bonus |
| `chroma_breath_orb` | rare violet/gold resonance session |

## Stars Boundary
Do not sell meditation completion directly.

Allowed later:
- premium visual breathing field
- extra artifact resonance slot
- optional session theme
- accelerate artifact recharge

Avoid:
- pay-to-skip meditation
- pay-for-health claims
- medical promises

## Sound
Sound is part of the intended experience, but it must be safe for Telegram and browser rules.

Rules:
- sound starts only after user taps `Start`
- default volume should be low
- visible mute button is required
- no sudden audio spikes
- breathing phase can have subtle tones later
- player can choose the meditation soundscape before starting

MVP sound can be:
- soft ambient pad
- low wind / bio-field texture
- gentle tap ripple sound

If implementation time is limited, start with UI hooks and add audio after the visual MVP is stable.

General button/action feedback sounds are defined in `UI_SOUND_SYSTEM.md`.
Meditation soundscapes are separate from short UI sounds.

## Soundscape Selection
Meditation should include a clear sound selection control.

Recommended UI:
- small `Sound` selector near the session controls
- expandable sound drawer
- preview button for each sound
- volume slider later
- selected sound saved as player preference

MVP sound options:

| Soundscape | Feeling | Best For |
| --- | --- | --- |
| `Ocean Breath` | sea waves, slow and safe | first sessions |
| `Forest Pulse` | leaves, soft wind, distant birds | calm daily ritual |
| `Deep Space` | low ambient drone, cosmic air | bio-spiritual chamber |
| `Rain Chamber` | gentle rain and glassy echoes | focus and relaxation |
| `Bio Resonance` | subtle organic hum, soft energy tones | artifact sessions |

Phase 1 should start with `Ocean Breath`, `Forest Pulse`, and `Deep Space`.

Sound should not change rewards directly in MVP.
It changes mood and player preference.

Later, rare artifacts or events can unlock special soundscapes:
- `Moon Tide`
- `Golden Field`
- `Chroma Choir`
- `Quantum Silence`

Telegram/browser rule:
Audio must be user-initiated, so the app should load the selected sound only after the player taps `Start Session` or `Preview`.

## MVP Build Recommendation
For the first player MVP, build:
- `Meditate` tab
- three session options: `45 sec`, `2 min`, `5 min`
- breathing orb with inhale / hold / exhale
- procedural background affected by selected mock artifact
- artifact drawer / slot
- background shelf with a few artifact/trophy slots
- soundscape selector with `Ocean Breath`, `Forest Pulse`, and `Deep Space`
- 3 attention points per session
- focus score based on attention points
- Calm Energy reward on completion
- 7-day minutes chart
- daily streak display
- Home summary card

This is enough to prove that Meditation is a real room, while keeping the build manageable.
