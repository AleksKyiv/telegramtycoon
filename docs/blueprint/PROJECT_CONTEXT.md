# Project Context

## Project
`CyberGreens Lab / LabOS`

Platform-independent LabOS meta-world with:
- a player-facing app that can open in Telegram
- a duplicate normal web app outside Telegram
- a private operator platform for control, analytics, and safety
- a server-authoritative simulation core

## Product Layers

### 1. Player App
What the player sees and uses.

The first acquisition/UX shell is Telegram Mini App, but the same product must also work as a normal web app.

Scope:
- farm / growth chambers
- lab / synthesis
- energy economy
- artifacts / strains / progression
- premium shop via Telegram Stars
- later: optional TON-compatible expansion layer

Telegram-specific parts:
- Telegram init data
- Telegram Mini App shell
- Stars payment adapter
- Telegram bot/channel entry points

Core player state must remain on our backend, not inside Telegram.

### 2. Operator Platform
Internal command center for the owner/operator.

Scope:
- player control
- economy monitoring
- live ops and balance controls
- payments visibility
- anomaly detection
- backups / audit / recovery
- analytics / AI summaries / experiments

### 3. Simulation Core
Authoritative backend logic.

Scope:
- user state
- inventory
- currencies and ledgers
- plant growth
- quantum harvest logic
- artifacts / recipes / mutations
- event logging
- anti-abuse and validation

### 4. Infrastructure Layer
Reliability and scale foundation.

Scope:
- database
- cache
- workers
- queues
- backups
- monitoring
- deployment

## Core Product Idea
The user controls a living futuristic laboratory. Different modules generate energy and resources, which feed a larger progression loop: growth, synthesis, mutation, rare states, and visual transformation of the lab.

The product is not just a game. It is a controllable meta-system with:
- progression
- economy
- procedural visuals
- operator oversight
- monetization

## Design Principles
- `Telegram is the distribution and identity entry layer, not the product core.`
- `The same product must have a web fallback that is not tied to Telegram.`
- `Backend is authoritative.`
- `Use internal player IDs; Telegram tg_id is an identity provider value.`
- `Every valuable resource must have a ledger or audit trail.`
- `Each module must have clear boundaries.`
- `Visual systems should be parameterized and procedural where possible.`
- `Operator controls must exist before heavy scaling.`
- `Changes should be isolated so one module does not silently break another.`

## Naming Convention For Work
To avoid confusion, we should always classify work into one of these domains:

| Domain | Meaning |
| --- | --- |
| `player-ui` | Telegram player interface |
| `operator-ui` | internal admin/operator platform |
| `simulation` | game logic and economy |
| `billing` | Stars, payments, grants, receipts |
| `infra` | hosting, database, cache, workers, backups |
| `analytics` | metrics, graphs, segmentation, AI summaries |
| `visual-engine` | procedural visuals and animations |
| `content` | items, recipes, lore, balancing, events |
| `platform-adapter` | Telegram, web, bot, and future platform-specific wrappers |

When you give tasks later, we can prefix them with one or more domains.

Example:
- `player-ui + visual-engine`: redesign the reactor panel
- `simulation + content`: add a new artifact recipe
- `billing + infra`: harden invoice flow and payment logging

## Current Stage
Current state appears to be an MVP prototype with:
- static frontend
- simple Node HTTP server
- mock Telegram Stars invoice endpoint
- early game loop already present

Next architecture work should focus on:
1. module boundaries
2. project tracking
3. risk-aware backend structure
4. operator platform planning
5. platform-independent backend/API structure
