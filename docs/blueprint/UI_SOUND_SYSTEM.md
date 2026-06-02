# UI Sound System

## Purpose
The product should feel alive through subtle sound feedback.

Every important action should have a short sound response:
- button press
- tab change
- capsule select
- plant action
- harvest reveal
- lab start/complete
- card reveal
- shop action
- message open
- meditation attention point tap

Sound should support the interface, not annoy the player.

## Core Rule
All UI sounds must be:
- short
- soft
- optional
- theme-consistent
- user-initiated
- safe for Telegram/browser autoplay rules

The user must always have:
- mute toggle
- master volume setting
- music volume setting
- UI/action sound toggle
- ambient sound toggle
- vibration/haptics toggle where supported
- persistent sound preference

## Sound Categories

| Category | Example Use | Sound Feel |
| --- | --- | --- |
| `tap` | normal button press | small glass/soft click |
| `nav` | tab/room switch | low whoosh / interface sweep |
| `confirm` | plant/start/claim | warm chime |
| `error` | blocked action / not enough resource | soft low pulse |
| `reward` | Bio Credits / Calm gained | bright shimmer |
| `rare` | rare/quantum reveal | layered rising glow |
| `card` | BioCard flip/reveal | card snap + holo shimmer |
| `lab` | synthesis start/complete | reactor pulse |
| `meditation` | attention point / breath phase | very soft bell/tone |
| `operator` | alert/notification | clean system ping |

## MVP Sound Map

| Action | Sound |
| --- | --- |
| any primary button | `tap_soft` |
| bottom navigation | `nav_sweep` |
| open capsule detail | `glass_open` |
| select plant | `bio_select` |
| plant specimen | `confirm_chime` |
| harvest ready | `reward_shimmer` |
| quantum state | `quantum_rise` |
| open Lab process | `reactor_pulse` |
| start synthesis | `lab_start` |
| synthesis complete | `lab_complete` |
| start meditation | `breath_start` |
| attention point tapped | `calm_ping` |
| BioCard reveal | `card_holo_flip` |
| shop purchase click | `shop_tap` |
| payment success | `premium_confirm` |
| error/blocked | `soft_denied` |

## Implementation Approach
Use one shared sound controller.

Frontend calls:

```js
sound.play("tap_soft");
sound.play("reward_shimmer");
sound.setMuted(true);
sound.setVolume(0.4);
```

The controller handles:
- preload after first user interaction
- mute preference
- volume
- missing sound fallback
- rate limiting repeated sounds
- separate ambient loops from short effects

## Telegram And Browser Rules
Browsers and Telegram WebView may block autoplay.

Rules:
- do not start sound before user interaction
- first tap can unlock audio context
- ambient loops start only after explicit action
- keep mute visible
- save preference in local state and backend later

## Player Requirements
Player should include:
- global sound toggle
- master volume slider
- music volume slider
- UI/action sounds toggle
- vibration/haptics toggle where supported
- sound feedback on core actions
- separate meditation soundscape selection
- soft haptic-style UI sound feeling

Do not make the interface noisy.
Repeated actions should be rate-limited.

## Operator Requirements
Operator should include:
- subtle alert sounds
- mute toggle
- no loud gameplay sounds
- clear sound for critical billing/security alerts later

Operator sounds should feel more like a command center than a game.

## Sound Design Direction
Use:
- glass clicks
- soft bio-electric pulses
- low synth sweeps
- small chimes
- holographic shimmer
- gentle bells for meditation

Avoid:
- harsh beeps
- casino sounds
- loud alarms
- childish arcade sounds
- long effects on every click

## Data / Preferences
Minimum state:

```text
sound_preferences
- player_id
- muted
- master_volume
- music_volume
- ui_volume
- ui_sounds_enabled
- music_enabled
- ambient_enabled
- haptics_enabled
- selected_meditation_soundscape
```

Local MVP:
- save in `localStorage`

Backend later:
- sync sound preferences across Telegram and Web clients

## MVP Build Recommendation
For first implementation:
- create shared `soundController`
- add mute toggle
- add basic Settings controls for master/music/UI sounds/haptics
- add 6-8 generated or simple synthesized UI sounds
- wire normal buttons to `tap_soft`
- wire special actions to distinct sounds
- keep meditation soundscape separate from UI click sounds

This gives the product life without requiring a full sound library from day one.
