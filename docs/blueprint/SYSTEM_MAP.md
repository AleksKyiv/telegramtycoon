# System Map

## Why This Exists
This file is the main anti-chaos map.

Before changing anything, we should be able to answer:
- what room / app / subsystem are we touching
- what the source of truth is
- what neighboring systems may be affected
- how we verify we did not break something else

## Main Rooms / Subsystems

| Room / System | Purpose | Primary Domain | Depends On | Must Not Directly Own |
| --- | --- | --- | --- | --- |
| `Telegram Player Client` | Telegram entry shell, Mini App UX, Telegram init data, Stars entry | `player-ui`, `platform-adapter` | backend API, simulation, billing | business logic or final state |
| `Web Player Client` | browser fallback with same player product outside Telegram | `player-ui`, `platform-adapter` | backend API, simulation, web auth | Telegram-only assumptions |
| `Player Shell` | shared player navigation, rooms, session bootstrap | `player-ui` | platform adapter, simulation, billing | business logic |
| `Account Menu` | Settings, Support, Web Version entry, identity status, future wallet link | `player-ui`, `platform-adapter`, `support` | identity model, support, preferences | gameplay economy or payment grants |
| `Account Deletion` | deletion request flow, privacy rights, account status, retention rules | `player-ui`, `backend`, `legal`, `audit` | identity model, database, ledgers | instant client-side deletion |
| `Legal Pages` | Terms, Privacy, policy links, launch/legal baseline | `legal`, `content`, `player-ui` | product rules, billing, privacy data | gameplay state or rewards |
| `Farm / Growth Chambers` | planting, timers, growth, harvest entry points | `player-ui`, `simulation` | user state, plants, inventory | payment rules |
| `Laboratory` | synthesis, mutation, artifacts, reactor state | `player-ui`, `simulation`, `visual-engine` | resources, recipes, event log | auth or billing |
| `Meditation Room` | breathing loop, Calm Energy, procedural calm field, player stats | `player-ui`, `content`, `simulation`, `visual-engine`, `analytics` | player state, Lab artifacts, rewards | global economy balancing |
| `Shop / Premium` | Stars purchases and grants | `player-ui`, `billing` | catalog, payment state | inventory truth without backend validation |
| `Collection / BioCards` | digital collectible cards, series, reveal moments, future physical/NFT path | `player-ui`, `content`, `simulation` | player state, card definitions, events | trading or ownership settlement in phase 1 |
| `Operator Dashboard` | global platform visibility | `operator-ui`, `analytics` | read models, logs, metrics | direct player-side UX |
| `Live Ops Console` | balance changes, events, feature flags | `operator-ui`, `content`, `simulation` | config, flags, audit log | payment settlement |
| `Operator Messaging` | announcements, inbox messages, event launches, targeted player communication | `operator-ui`, `content`, `analytics` | player segments, events, audit log | silent economy grants |
| `Community News Bot` | public news, BioCard posts, event reminders, audience warmth | `content`, `operator-ui`, `analytics` | events, card definitions, posting schedule | payment grants or hidden rewards |
| `Player Control Center` | inspect one player deeply | `operator-ui` | user profile, inventory, payments, logs | raw simulation mutation without audit |
| `Billing Core` | invoices, receipts, grants, payment journal | `billing` | Telegram APIs, ledger, audit | gameplay tuning |
| `Simulation Core` | source of truth for progression and resources | `simulation` | database, config | presentation-specific state |
| `Visual Engine` | procedural reactor, artifacts, state visuals | `visual-engine` | simulation outputs | economic state ownership |
| `UI Sound System` | short action feedback sounds, ambient hooks, sound preferences | `player-ui`, `operator-ui`, `audio` | user interaction, sound prefs | reward logic or payment state |
| `Analytics & AI` | graphs, summaries, anomaly detection | `analytics` | events, read models | write authority to core state |
| `Infrastructure` | deploy, db, cache, queue, backups | `infra` | environment, ops tooling | product-specific decisions |
| `Platform Adapters` | Telegram, web auth, bot/news, future wrappers | `platform-adapter`, `infra` | backend API, identity model | simulation truth |

## Change Routing
Use this table before starting work.

| If the task is about... | Start Here | Also Check |
| --- | --- | --- |
| screen layout, windows, panels | `player-ui` or `operator-ui` | `visual-engine` |
| energy formulas, item rewards, harvest state | `simulation` | `content`, `analytics` |
| new paid feature or shop pack | `billing` | `player-ui`, `simulation`, `audit` |
| Telegram-specific behavior | `platform-adapter` | `player-ui`, `billing`, `identity` |
| web fallback behavior | `platform-adapter` | `player-ui`, `auth`, `infra` |
| settings, support, web link, wallet identity | `player-ui` | `platform-adapter`, `support`, `identity` |
| graphs, dashboards, system visibility | `analytics` | `operator-ui`, `infra` |
| rare visuals, reactor look, lab animation | `visual-engine` | `player-ui`, `simulation` |
| backups, scaling, queues, reliability | `infra` | `billing`, `simulation` |
| admin controls, toggles, force actions | `operator-ui` | `audit`, `simulation` |

## Isolation Rules
- `player-ui` never decides rewards or balances.
- `Telegram tg_id` is not the main player primary key; use internal player IDs.
- Telegram client and web client must share the same backend truth.
- `billing` never grants value without server confirmation.
- `simulation` should expose outputs, not UI assumptions.
- `visual-engine` should consume state descriptors, not raw business logic.
- `operator-ui` changes must be auditable.
- `analytics` may explain or predict, but not silently mutate state.

## Safe Task Template
For any meaningful task, we should define:

| Field | What To Write |
| --- | --- |
| `Task` | short action |
| `Primary domain` | one main domain |
| `Secondary domains` | optional supporting domains |
| `Systems touched` | exact rooms/modules |
| `Risk level` | low / medium / high |
| `Can break` | what might be affected |
| `Validation` | how we confirm it still works |

## Current High-Level Architecture Direction
- Start from a `modular monolith`.
- Keep boundaries explicit even before splitting services.
- Build operator visibility early.
- Treat payments, economy, and audit as first-class systems.
- Keep procedural visuals driven by parameters from state, not hardcoded scenes.
- Treat Telegram, Web, Bot, and future platforms as adapters around the same backend.
