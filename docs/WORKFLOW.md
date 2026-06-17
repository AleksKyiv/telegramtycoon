# Workflow Rules

This is how we work so the project does not become chaotic.

## Roles

| Role | Responsibility |
|---|---|
| Product owner | Vision, business meaning, emotion, monetization logic, priorities |
| Codex | Translate ideas into scope, improve the idea, warn about risks, implement, verify |
| Future specialist / agent | Focused help: UI/UX, economy, Telegram payments, backend, QA |

## Source Of Truth

Use these docs before large changes:

1. `docs/SYSTEM_MAP.md` - system boundaries and routing.
2. `docs/rooms/ROOM_INDEX.md` - room passports.
3. `docs/BLUEPRINT_ADOPTION.md` - what we took from the detailed brainstorm.
4. `docs/VALUE_FIRST_PIVOT.md` - Stars-native value and monetization authority.
5. `docs/blueprint/` - archived detailed brainstorm documents.
6. `docs/AI_CHANGE_GUARDRAILS.md` - scope lock rules for Codex changes.
7. `docs/PRODUCT_MIRROR.md` - operator map of product modules, statuses, layers, and protected boundaries.
8. `docs/AI_OPERATOR_PROTOCOL.md` - exact behavior Codex must follow before and after changes.
9. `docs/AAA_OPERATOR_LAYER_TECH_PACKAGE.md` - full technical package for external review of the product/control architecture.

The `New project` visual code is not the source of truth. The useful part is the product documentation.

## Stars Direction Rule

If the product owner explicitly says that Stars are important, central, or should be used for a feature, Codex must treat that as a binding product direction.

Codex should still protect the product from bad execution, but not argue against the Stars strategy itself.

Correct behavior:

- Convert the Stars direction into scope, UI, server, Admin, and verification steps.
- Preserve confirmed payment handling.
- Make paid value visible in Admin.
- Call out trust or compliance risks briefly.
- Continue implementing once the safe scope is clear.

Incorrect behavior:

- Demoting Stars to an afterthought.
- Reframing the product as non-monetized.
- Blocking Stars because monetization can be risky.
- Building frontend-only paid rewards.

## Codex Must Do Before Implementing

For every user idea, Codex should silently run this filter:

1. Decode the idea in simple product language.
2. Place it into a room: Farm, Lab, Zen, Tasks, Stars, Admin, or Core.
3. Identify the layer: visual, gameplay, server, economy, payment, analytics, compliance, audio, platform.
4. Improve the request if a better minimal solution exists.
5. Protect stable parts of the app.
6. Implement the smallest version that proves the result.
7. Verify and explain what changed in simple words.

For concrete UI/gameplay requests, `docs/AI_CHANGE_GUARDRAILS.md` overrides the "improve the idea" instinct. Codex must lock scope first and must not change adjacent systems without confirmation.

For complex or repeated refinement work, `docs/PRODUCT_MIRROR.md` and `docs/AI_OPERATOR_PROTOCOL.md` are mandatory. Codex must map the request to a mirror ID, name the layer, avoid new layers unless justified, and report the result using the mirror format.

Before asking the owner to refresh or inspect a local page, Codex must follow the Server Visibility Gate in `docs/AI_OPERATOR_PROTOCOL.md`: prove `localhost:4173` is alive, `/api/health` returns ok, and the target route returns its expected marker.

## Task Packet

The owner can write freely, but Codex should convert it into this packet:

```text
ROOM:
SYSTEM:
GOAL:
SMALLEST RESULT:
DO NOT TOUCH:
RISK:
VERIFY:
```

Example:

```text
ROOM: Farm
SYSTEM: Visual Engine
GOAL: Make the drone feel like a slow service robot.
SMALLEST RESULT: Drone moves from bottom to top slowly and does not distract.
DO NOT TOUCH: Bottom buttons, Stars slot, Telegram payment flow.
RISK: Animation can shift layout or overload mobile.
VERIFY: Browser mobile-width check and button position check.
```

## Delivery Levels

| Level | Meaning |
|---|---|
| Idea | Interesting, not designed yet |
| Prototype | Visible in UI, may be temporary |
| MVP | Works with server/state/payment as needed |
| Controlled | Visible in Admin and testable |
| Production-ready | Stable, logged, deployable, documented |

## When To Stop And Think

Stop before coding if:

- the change touches Stars or payment delivery;
- player progress may be lost or duplicated;
- a visual request would require a room redesign;
- the request mixes more than one room;
- Telegram, database, and UI all need changes at once;
- the request may add heavy GPU work;
- Zen wording could look like a medical claim.

## Performance Rule

Visuals must be implementation-aware.

Prefer:

- CSS
- SVG
- light canvas only when needed
- slow state-driven animation
- no animation loops in hidden rooms

Avoid in MVP:

- heavy 3D
- complex shaders
- large video backgrounds
- many simultaneous particle systems
- effects that overload Telegram WebView or phone GPU

## Token Saving Rule

Use the room passports instead of re-explaining the full product. If the task is about Farm, open Farm passport first. If the task is about payments, open Stars passport first. If the task is broad, open `SYSTEM_MAP.md` first.
