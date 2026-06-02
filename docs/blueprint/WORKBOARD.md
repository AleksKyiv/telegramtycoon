# Workboard

## How To Use
This is the living control board for the project.

Use it to track:
- where we are going
- what is done
- what is next
- what is blocked
- what questions still need answers

Recommended status labels:
- `idea`
- `planned`
- `in-progress`
- `blocked`
- `done`

## North Star
Build a Telegram-native LabOS product with:
- strong player experience
- strong operator control
- safe monetization
- scalable backend
- procedural visual identity

## Current Tracks

| Track | Status | Goal | Next Move |
| --- | --- | --- | --- |
| Product concept | `in-progress` | lock the project vision and module boundaries | keep gathering and consolidating context |
| Player LabOS | `planned` | define the player-facing shell and rooms | design screen map |
| Operator platform | `planned` | define command center and control tools | list core operator screens |
| Assistant | `planned` | define operator-only AI copilot | map UI and context flow |
| Simulation core | `idea` | formalize economy, harvest, synthesis, progression | write system specs |
| Billing | `idea` | safe Stars flow with auditability | define payment lifecycle |
| Infrastructure | `idea` | make the system safe for growth | define target architecture |
| Visual engine | `in-progress` | implementation-aware art direction | define reusable procedural modules |

## Milestones

| Milestone | Status | Definition of Done |
| --- | --- | --- |
| `M1 Context Locked` | `in-progress` | project context, system map, risks, and major modules documented |
| `M2 Architecture Skeleton` | `planned` | folders, module boundaries, data flow, and ownership defined |
| `M3 Player MVP Spec` | `planned` | player screens, core loop, economy rules documented |
| `M4 Operator MVP Spec` | `planned` | operator screens, analytics, audit, and controls documented |
| `M4A Assistant MVP Spec` | `done` | operator-only assistant scope and architecture documented |
| `M5 Backend Safety Plan` | `planned` | payments, backups, observability, and scaling baseline defined |

## Active Questions

| ID | Question | Domain | Priority | Status |
| --- | --- | --- | --- | --- |
| `Q-001` | What exact rooms/modules exist in the player super-app at MVP stage? | `player-ui` | high | open |
| `Q-002` | What is the first version of the operator control center? | `operator-ui` | high | open |
| `Q-003` | Which resources require ledger-grade tracking from day one? | `simulation`, `billing` | high | open |
| `Q-004` | Which procedural visuals are core to MVP, and which are later? | `visual-engine` | high | open |
| `Q-005` | What parts of the future TON/NFT idea stay outside initial Telegram MVP? | `billing`, `product` | medium | open |
| `Q-006` | What exact operator questions should the assistant answer in MVP? | `assistant`, `operator-ui` | medium | open |
| `Q-007` | When should voice be added to the operator assistant after text-first validation? | `assistant` | low | open |

## Decision Queue

| ID | Decision Needed | Domain | Why It Matters | Status |
| --- | --- | --- | --- | --- |
| `D-001` | Final MVP room structure | `player-ui` | avoids chaotic expansion | pending |
| `D-002` | Operator platform scope for phase 1 | `operator-ui` | enables safe control | pending |
| `D-003` | Ledger model for currencies and items | `simulation`, `billing` | protects economy and payments | pending |
| `D-004` | Visual implementation stack | `visual-engine` | affects feasibility and performance | pending |
| `D-005` | Assistant panel placement and interaction mode | `assistant`, `operator-ui` | affects operator UX | pending |

## Backlog

| ID | Task | Primary Domain | Status | Notes |
| --- | --- | --- | --- | --- |
| `T-001` | Convert brainstorm into a formal concept document | `product` | `planned` | use current conversation material |
| `T-002` | Define player room map | `player-ui` | `planned` | room-by-room breakdown |
| `T-003` | Define operator screen map | `operator-ui` | `planned` | dashboard, players, economy, billing |
| `T-004` | Draft system architecture | `infra` | `planned` | modular monolith first |
| `T-005` | Draft economy map | `simulation` | `planned` | resources, sinks, progression |
| `T-006` | Draft risk map | `infra`, `billing` | `planned` | Telegram, scaling, abuse, recovery |
| `T-007` | Formalize player shell structure | `player-ui` | `done` | see `PLAYER_SHELL.md` |
| `T-008` | Formalize procedural capsule v1 | `visual-engine`, `simulation` | `done` | see `PROCEDURAL_CAPSULE_V1.md` |
| `T-009` | Formalize assistant MVP | `assistant`, `operator-ui` | `done` | see `ASSISTANT_MVP.md` |
| `T-010` | Capture main coin reference | `player-ui`, `visual-engine` | `done` | see `RESOURCE_VISUALS.md` |
| `T-011` | Define Living Capsule gameplay mechanic | `simulation`, `player-ui` | `done` | see `LIVING_CAPSULE_MECHANIC.md` |
| `T-012` | Define Telegram-first Player MVP scope | `player-ui`, `billing` | `done` | see `PLAYER_MVP_TELEGRAM.md` |
| `T-013` | Define plant selection UX | `player-ui`, `simulation` | `done` | see `PLANT_SELECTION_UX.md` |
| `T-014` | Define first session retention loop | `player-ui`, `simulation` | `done` | see `FIRST_SESSION_RETENTION.md` |
| `T-015` | Define capsule upgrade system | `player-ui`, `simulation`, `billing` | `done` | see `CAPSULE_UPGRADES.md` |
| `T-016` | Define lab procedural reaction system | `visual-engine`, `player-ui` | `done` | see `LAB_PROCEDURAL_REACTION.md` |
| `T-017` | Define lab progression and synthesis | `simulation`, `player-ui`, `billing` | `done` | see `LAB_PROGRESSION_AND_SYNTHESIS.md` |
| `T-018` | Define league progression | `player-ui`, `simulation` | `done` | see `LEAGUES.md` |
| `T-019` | Define weekly events | `player-ui`, `content`, `simulation` | `done` | see `WEEKLY_EVENTS.md` |
| `T-020` | Define meditation procedural room and stats | `player-ui`, `visual-engine`, `simulation`, `analytics` | `done` | see `MEDITATION_ROOM.md` |
| `T-021` | Define BioCards collectible system | `player-ui`, `content`, `simulation` | `done` | see `BIOCARDS_COLLECTION.md` |
| `T-022` | Define Stars billing security baseline | `billing`, `infra`, `audit` | `done` | see `STARS_BILLING_SECURITY.md` |
| `T-023` | Define operator messaging and live ops | `operator-ui`, `content`, `analytics` | `done` | see `OPERATOR_MESSAGING_LIVEOPS.md` |
| `T-024` | Define community news bot/content layer | `content`, `operator-ui`, `analytics` | `done` | see `COMMUNITY_NEWS_BOT.md` |
| `T-025` | Create visual project dashboard | `product`, `management` | `done` | see `dashboard.html` |
| `T-026` | Define platform independence architecture | `infra`, `player-ui`, `platform-adapter` | `done` | see `PLATFORM_INDEPENDENCE.md` |
| `T-027` | Define shared UI sound system | `player-ui`, `operator-ui`, `audio` | `done` | see `UI_SOUND_SYSTEM.md` |
| `T-028` | Define Account / More menu | `player-ui`, `platform-adapter`, `support` | `done` | see `ACCOUNT_MENU.md` |
| `T-029` | Define Settings legal and sound controls | `player-ui`, `audio`, `legal` | `done` | see `ACCOUNT_MENU.md`, `UI_SOUND_SYSTEM.md`, `LEGAL_PAGES.md` |
| `T-030` | Define account deletion flow | `player-ui`, `backend`, `legal`, `audit` | `done` | see `ACCOUNT_DELETION.md` |
| `T-031` | Build first clickable Player MVP shell | `player-ui`, `simulation`, `audio` | `done` | see `player.html` |

## Notes Log

Use this area as a freeform running log.

### 2026-05-31
- Initial control docs created.
- Project direction currently points toward `Telegram-native LabOS`.
- Existing repository already contains MVP pieces for game loop and Stars mock flow.
- Operator reference accepted as the control-panel direction.
- Player shell and procedural capsule v1 have now been documented.
- Assistant is now fixed as operator-only in phase 1.
- Assistant is text-only in phase 1.
- Main coin reference captured as `assets/main-coin-reference.png`.
- Living Capsule Ritual mechanic documented from the original quantum formula.
- Player MVP scope updated for Telegram-first shell, events, shop, and Stars capsule.
- Plant selection UX defined for Telegram touch and desktop web.
- First session loop defined: fast first plant, collapse reveal, next goal, monetization hooks.
- Capsule-specific upgrades defined with coin and Stars paths.
- Lab procedural reaction defined as the first-minute wow effect.
- Laboratory progression defined with timed synthesis, Stars acceleration, and Meditation item outputs.
- League progression defined from lifetime Bio Credits.
- Weekly event system defined with limited plants and event recipes.
- Meditation room defined with breathing loop, procedural bio-field, artifact input, trophy shelf, soundscape selection, 3 attention points, Calm Energy, progress scales, and stats charts.
- BioCards defined as digital collectible card series with common, event-limited, gold/premium, ultra-rare, set-completion, and future physical/NFT optionality.
- Stars billing security baseline defined with backend-only grants, idempotency, ledger, support, refunds, and operator audit.
- Operator messaging/live ops defined with inbox, Home banners, event announcements, targeting, audit, and later Telegram bot notifications.
- Community News Bot defined as public/news/content layer for event updates, BioCard posts, community warmth, retention, and future sponsor/ad monetization.
- Visual project dashboard created at `dashboard.html`; when the user says `Dashboard`, update this control page.
- Platform independence defined: Telegram is acquisition/identity/Stars adapter, while core product state lives on our backend and also supports a normal web client.
- Shared UI sound system defined for button/action feedback, mute preferences, Telegram/browser audio rules, and meditation sound separation.
- Account / More menu defined for Settings, Support, Open Web Version, identity status, and future TON wallet link.
- Settings expanded with music volume, sound toggles, vibration/haptics, Terms and Conditions, and Privacy Policy.
- Account deletion flow defined with confirmation, deletion pending state, retention rules, and backend-controlled lifecycle.
- First clickable Player MVP shell is now available as `player.html` with capsules, lab, meditation, shop, account/settings, BioCards, and local simulation state.
