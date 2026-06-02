# System Map

This is the anti-chaos map for Telegram Tycoon / Croclis.

Before changing anything, identify:

- which room/system is touched
- which layer is touched
- what must not move
- how we verify it

## Main Systems

| System | Purpose | Primary Layer | Must Not Own |
| --- | --- | --- | --- |
| `Telegram Player` | Mini App entry, Telegram identity, Stars opening | platform-adapter, player-ui | final rewards or economy truth |
| `Web Player` | browser fallback and testing version | platform-adapter, player-ui | Telegram-only assumptions |
| `Farm` | starter resource loop, capsules, drone, growth | player-ui, simulation, visual-engine | Stars grant logic |
| `Lab` | mutation, synthesis, artifacts, rare reveals | simulation, visual-engine, player-ui | payment settlement |
| `Zen` | meditation, calm energy, breathing ritual, wellness identity | player-ui, simulation, audio, analytics | medical claims or paid completion |
| `Tasks` | starter bonuses and external action campaigns | player-ui, analytics, anti-abuse | high-value rewards without validation |
| `Stars Shop` | Telegram Stars products and grants | billing, backend, admin | frontend-only delivery |
| `Admin` | control center, players, payments, room activity, errors | operator-ui, analytics | unaudited hidden economy changes |
| `Backend Core` | state, auth, economy, ledgers, simulation | backend, infra | visual-only assumptions |
| `Visual Engine` | capsule/lab/zen procedural look | visual-engine | economy truth |
| `Legal/Compliance` | terms, privacy, deletion, support, billing wording | legal, support | gameplay tuning |

## Layers

| Layer | Meaning |
| --- | --- |
| `player-ui` | what the player sees |
| `visual-engine` | CSS/SVG/canvas state-driven visuals |
| `simulation` | game/economy logic |
| `billing` | Stars orders, payments, grants, refunds |
| `backend` | API, database, saved state |
| `operator-ui` | Admin/dashboard/control panels |
| `analytics` | events, charts, funnels, anomaly signals |
| `platform-adapter` | Telegram, web, bot/channel |
| `legal` | Terms, Privacy, deletion, support wording |
| `audio` | UI sounds, Zen soundscapes, preferences |

## Change Routing

| If task is about... | Start in | Also check |
| --- | --- | --- |
| capsule layout, plant, drone | Farm | visual-engine, simulation |
| paid slot or Stars button | Stars Shop | billing, backend, Admin |
| mutation, artifact, rare result | Lab | simulation, billing if paid |
| meditation, breathing, sound | Zen | audio, simulation, legal |
| external bonus actions | Tasks | analytics, anti-abuse |
| charts, players, payments | Admin | analytics, backend |
| resource balances or rewards | Backend Core | simulation, Admin |
| policy, privacy, deletion | Legal/Compliance | Account/Settings |

## Isolation Rules

- Frontend never grants paid value.
- Telegram `tg_id` is identity data, not the whole product state.
- Valuable rewards should be backend-controlled.
- Stars delivery requires Telegram `successful_payment`.
- Admin actions must be visible/auditable.
- Visual effects consume state; they do not create economy truth.
- Zen may say relaxation/focus/calm, but must avoid medical promises.
- Heavy GPU effects are not part of MVP.

## Visual Performance Rule

MVP visuals should use:

- CSS gradients
- SVG shapes
- lightweight particles only when needed
- small reusable components
- slow, calm animations

Avoid:

- heavy WebGL scenes
- complex shaders
- large video backgrounds
- too many moving objects
- canvas loops that run when a room is hidden

## Safe Task Packet

```text
ROOM:
SYSTEM:
GOAL:
SMALLEST RESULT:
DO NOT TOUCH:
RISK:
VERIFY:
```
