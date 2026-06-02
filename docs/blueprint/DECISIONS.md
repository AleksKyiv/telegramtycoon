# Decisions

This file is for short architecture and product decisions.

Use one block per decision.

## Template

```md
## DEC-XXX: Title
Date: YYYY-MM-DD
Status: proposed | accepted | superseded
Domains: player-ui, operator-ui, simulation, billing, infra, analytics, visual-engine, content

Context:
- why this decision exists

Decision:
- what we chose

Consequences:
- good outcomes
- tradeoffs
- follow-up work
```

## DEC-001: Use Telegram as distribution and identity entry layer, not as system of record
Date: 2026-05-31
Status: accepted
Domains: player-ui, billing, infra

Context:
- The product is deeply Telegram-native.
- Telegram is strong for growth, payments, and multi-device access.
- But platform dependence creates product and compliance risk.
- The product must also exist as a normal website outside Telegram.

Decision:
- Telegram will be the main acquisition, identity bootstrap, UX shell, and Stars monetization channel.
- The same player product must have a web client that uses the same backend.
- Core state, economy, audit, and operator logic will live in independent backend infrastructure.
- Telegram `tg_id` is an identity provider value, not the core player primary key.

Consequences:
- safer long-term architecture
- easier fallback web layer later
- slightly more complex backend from the start
- requires platform adapters and an internal player account model

## DEC-002: Build with explicit domain boundaries
Date: 2026-05-31
Status: accepted
Domains: player-ui, operator-ui, simulation, billing, infra, analytics, visual-engine

Context:
- The product already spans gameplay, visuals, payments, operations, and analytics.
- Without boundaries, later tasks will collide and create regressions.

Decision:
- All future work should be tagged by domain.
- We will maintain a system map and route changes through it.

Consequences:
- clearer tasking
- easier collaboration
- more discipline required in planning changes

## DEC-003: Phase 1 excludes NFT and TON
Date: 2026-05-31
Status: accepted
Domains: product, billing, infra

Context:
- NFT and TON were mentioned only as possible future directions.
- Bringing them in early would increase platform, payment, trust, and delivery risk.

Decision:
- Phase 1 will not include NFT, TON, or tokenized ownership.
- Phase 1 focuses on retention, core loop, procedural identity, Stars monetization, and operator control.

Consequences:
- cleaner MVP
- lower compliance and product complexity
- future blockchain work remains optional, not foundational

## DEC-004: Player shell procedural focus lives in reactor and capsule
Date: 2026-05-31
Status: accepted
Domains: player-ui, visual-engine, simulation

Context:
- We want a visually strong player app without overbuilding fragile effects.
- Procedural visuals are a differentiator, but must remain feasible inside Telegram Mini App.

Decision:
- Phase 1 procedural emphasis will be concentrated in the `central reactor` and `main capsule`.
- Other UI regions remain mostly component-driven and lightweight.

Consequences:
- stronger visual focus
- safer performance envelope
- easier incremental expansion later

## DEC-005: Assistant is operator-only in phase 1
Date: 2026-05-31
Status: accepted
Domains: operator-ui, assistant, product

Context:
- Adding an assistant to player UX would increase complexity and distract from the core product loop.
- The strongest immediate value of the assistant is on the operator side: summaries, analysis, navigation, and interpretation.

Decision:
- The assistant exists only inside `OPERATOR` in phase 1.
- `PLAYER` remains assistant-free.

Consequences:
- cleaner player UX
- simpler scope
- better separation between product and operations tooling

## DEC-006: Assistant is text-only in phase 1
Date: 2026-05-31
Status: accepted
Domains: assistant, operator-ui

Context:
- Voice adds integration and UX complexity.
- The operator assistant already has clear value in text form.
- We want to keep phase 1 focused and clean.

Decision:
- Assistant MVP for phase 1 is text-only.
- Voice output and voice input are deferred.

Consequences:
- faster delivery
- lower integration complexity
- easier operator UX validation before adding voice

## DEC-007: Player MVP is Telegram-first
Date: 2026-05-31
Status: accepted
Domains: player-ui, billing, product

Context:
- The player product must run naturally inside Telegram Mini App.
- The MVP must include events/external actions, shop, and Stars monetization hooks.

Decision:
- Build the first player MVP as a Telegram-first shell, not a generic web page.
- Include local shop, event cards, and a Stars premium capsule concept.

Consequences:
- clearer product direction
- better monetization path
- more constraints on layout and performance

## DEC-008: Marketplace is not phase 1
Date: 2026-05-31
Status: accepted
Domains: player-ui, simulation, billing

Context:
- A player-to-player marketplace is interesting but adds fraud, moderation, ownership, pricing, and economy risk.

Decision:
- Phase 1 includes only local shop.
- Player marketplace is deferred.

Consequences:
- simpler MVP
- safer economy
- marketplace can be designed later on top of real item ownership data

## DEC-009: Player app must support Telegram and desktop web
Date: 2026-05-31
Status: accepted
Domains: player-ui, product

Context:
- Telegram is the main distribution layer.
- A browser fallback is important if Telegram access is limited or if desktop usage becomes valuable.

Decision:
- Player MVP must work in Telegram Mini App and normal desktop browser.
- Touch shortcuts can exist, but visible buttons must remain for all critical actions.

Consequences:
- better resilience
- easier testing
- slightly more UX work per interaction

## DEC-010: Capsules are upgradeable objects
Date: 2026-05-31
Status: accepted
Domains: player-ui, simulation, billing

Context:
- Capsules are central to the player loop, progression, and monetization.
- They should feel like lab devices, not empty timer slots.

Decision:
- Each capsule can have its own level and upgrade modules.
- Bio Credits handle normal progression upgrades.
- Stars are reserved for premium uniqueness, special capsule identity, or unique mutation paths.

Consequences:
- stronger player attachment to capsules
- clearer monetization path
- requires a capsule detail panel in MVP

## DEC-011: Laboratory is a timed synthesis progression engine
Date: 2026-05-31
Status: accepted
Domains: player-ui, simulation, billing

Context:
- The Lab must transform capsule outputs into deeper progression.
- Lab results should connect to Meditation and higher-tier plants.
- Stars can monetize acceleration without directly selling rare outcomes.

Decision:
- Laboratory has its own level, recipes, timed synthesis, and unique outputs.
- Stars can accelerate active synthesis processes.
- Unique Lab outputs can be used in Meditation for special effects.

Consequences:
- stronger long-term progression
- better link between Capsule, Lab, and Meditation
- requires clear recipe and timing data model

## DEC-012: Stars paid value is backend-only and ledgered
Date: 2026-05-31
Status: accepted
Domains: billing, infra, audit, simulation

Context:
- Telegram Stars will be a real monetization path.
- Paid features create security, abuse, support, and refund risk.
- Frontend-only payment handling would be unsafe.

Decision:
- The frontend can request invoices and display payment status, but cannot grant paid value.
- The backend grants paid value only after validated `successful_payment`.
- All Stars payments require idempotency, payment ledger, grant ledger, support path, and refund records.

Consequences:
- safer monetization
- fewer duplicate-grant and fraud risks
- more backend work before real Stars launch

## DEC-013: Operator messaging is audited Live Ops, not raw chat
Date: 2026-05-31
Status: accepted
Domains: operator-ui, player-ui, content, analytics, audit

Context:
- The operator needs to announce events, rewards, maintenance, and player-specific messages.
- Messaging can create spam, abuse, unsafe links, or accidental rewards if uncontrolled.

Decision:
- Operator messages will be created through a Live Ops composer.
- Player delivery starts with in-app Inbox, Home banners, and event CTAs.
- Telegram bot push notifications are deferred until opt-out, rate limiting, and logging exist.
- All published messages require audit records.

Consequences:
- safer communication with players
- better event launches and retention loops
- more structure required before mass notifications

## DEC-014: Community News Bot is a content channel, not payment authority
Date: 2026-05-31
Status: accepted
Domains: content, operator-ui, analytics, billing

Context:
- The product needs a living news/community layer to keep players engaged.
- News posts can announce cards, events, and world changes.
- Mixing public news with payment grants or hidden rewards would create risk.

Decision:
- Community News Bot can publish news, event reminders, BioCard drops, and community updates.
- It does not grant paid value or silently mutate player state.
- Personal DMs require opt-out, rate limits, and delivery logs before scaling.

Consequences:
- stronger retention and community feeling
- safer separation between communication and economy
- requires content planning and operator publishing tools

## DEC-015: Ads are future media monetization, not MVP dependency
Date: 2026-05-31
Status: accepted
Domains: content, analytics, monetization, operator-ui

Context:
- A large Telegram audience can become monetizable through sponsor posts, partner events, or ads.
- Early ads can damage trust if the product is not yet valuable.
- Ads must not impersonate game rewards or payment flows.

Decision:
- Advertising/sponsor posts are allowed as a future layer of the Community News Bot/Channel.
- MVP focuses on retention and trust first.
- Sponsored posts must be labeled, allowlisted, and tracked.

Consequences:
- future revenue path beyond Stars
- less pressure to monetize too early
- requires content quality and analytics before sponsor sales

## DEC-016: Core product must be platform-independent
Date: 2026-05-31
Status: accepted
Domains: infra, player-ui, billing, simulation, platform-adapter

Context:
- Telegram is valuable for acquisition, identity bootstrap, Stars payments, and communication.
- The product should survive outside Telegram as a normal website.
- Core state and economy cannot depend on a platform client.

Decision:
- Build one backend core used by Telegram client, web client, operator client, and bot/news layer.
- Treat Telegram-specific logic as a platform adapter.
- Use internal player IDs and link Telegram identity to the internal account.

Consequences:
- stronger resilience if Telegram limits access
- easier desktop/web launch
- cleaner backend authority
- more upfront architecture work for identity and API contracts
