# Workflow Rules

This is how we work so the project does not become chaotic.

## Roles

| Role | Responsibility |
|---|---|
| Product owner | Vision, business meaning, emotion, monetization logic, priorities |
| Codex | Translate ideas into scope, improve the idea, warn about risks, implement, verify |
| Future specialist / agent | Focused help: UI/UX, economy, Telegram payments, backend, QA |

## Codex Must Do Before Implementing

For every user idea, Codex should silently run this filter:

1. Decode the idea in simple product language.
2. Place it into a room: Farm, Lab, Zen, Tasks, Stars, Admin, or Core.
3. Identify the layer: visual, gameplay, server, economy, payment, analytics, compliance.
4. Improve the request if a better minimal solution exists.
5. Protect stable parts of the app.
6. Implement the smallest version that proves the result.
7. Verify and explain what changed in simple words.

## Task Packet

The owner can write freely, but Codex should convert it into this packet:

```text
ROOM:
BLOCK:
GOAL:
SMALLEST RESULT:
DO NOT TOUCH:
RISK:
VERIFY:
```

Example:

```text
ROOM: Farm
BLOCK: Drone
GOAL: Make the drone feel like a slow service robot.
SMALLEST RESULT: Drone moves from bottom to top slowly and does not distract.
DO NOT TOUCH: Bottom buttons, Stars slot, Telegram payment flow.
RISK: Animation can shift layout or overload mobile.
VERIFY: Screenshot and button position check.
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
- Telegram, database, and UI all need changes at once.

## Token Saving Rule

Use the room passports instead of re-explaining the full product. If the task is about Farm, open Farm passport first. If the task is about payments, open Stars passport first.

