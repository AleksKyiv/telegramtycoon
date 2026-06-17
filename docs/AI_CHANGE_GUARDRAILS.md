# AI Change Guardrails

This file exists because uncontrolled "helpful" changes have repeatedly damaged the product flow.

The goal is simple: when the owner asks for a concrete change, Codex must implement that exact change and must not redesign adjacent systems.

## Core Rule

Specific request beats assistant creativity.

If the owner names a concrete element, position, label, icon, room, price, or behavior, Codex must treat that as a scope lock.

Examples:

- "Move the drone rail left" means move the drone rail left.
- It does not mean remove the beam, change the drone skin, redesign the capsule, or touch Shop.
- "Add visual rewards in Farm" means Farm first.
- It does not mean Shop first.

## Anti-Nonsense Algorithm

Before writing code, Codex must run this filter. If any answer is "no", stop and reduce scope.

```text
1. Did the owner explicitly name this room or element?
2. Does this change directly solve the named problem?
3. Can the product still work if this change is the only thing shipped?
4. Am I avoiding unrelated visual redesign?
5. Am I avoiding unrelated economy/backend changes?
6. Did I leave existing working elements in place unless removal was requested?
7. Can I explain the change in one sentence without saying "also"?
```

If the explanation needs "also", the change is probably bundled and must be split.

## Stop Conditions

Codex must stop and ask instead of improvising when:

- the request could affect Stars, paid ownership, or monetization;
- the request could hide a core mobile control;
- the requested object visually overlaps another core object;
- the fix requires touching more than one room;
- the assistant wants to add a new panel, badge, copy block, animation, or reward strip that the owner did not name.

Default action under uncertainty: do less, not more.

## Pre-Change Scope Lock

Before any UI or gameplay edit, Codex must write a short internal task packet:

```text
ROOM:
TARGET ELEMENT:
EXACT CHANGE:
DO NOT TOUCH:
FILES LIKELY TO CHANGE:
VERIFY:
```

If `DO NOT TOUCH` is not clear, infer conservatively:

- Do not touch other rooms.
- Do not touch payment flow.
- Do not touch economy numbers.
- Do not touch existing working controls.
- Do not remove visual elements unless the owner explicitly says remove.

## User Confirmation Rule

Ask before coding only when the requested change has non-obvious consequences.

Do not ask when the change is concrete and safe.

Do ask when:

- it changes Stars, payments, or ownership;
- it changes resource math;
- it removes an existing product mechanic;
- it moves layout across rooms;
- it may hide controls on Telegram mobile;
- it changes backend persistence.

## No Adjacent Fixes

Codex must not bundle adjacent fixes into a concrete task.

Allowed:

- Fixing a syntax error caused by the current edit.
- Updating cache query params for edited files.
- Adding minimal CSS needed for the requested visual change.

Not allowed without confirmation:

- Changing copy in a different card.
- Moving unrelated panels.
- Adding new animations.
- Changing product prices.
- Removing beams, tails, badges, buttons, or labels not named in the request.
- Reworking a whole room because one element looks wrong.

## Visual Change Budget

For small visual requests, default to a tight change budget:

- 1 room.
- 1 target component.
- 1 to 3 files.
- No economy changes.
- No backend changes.
- No new product system.

If a request requires more, say why before doing it.

## Verification Checklist

Every change must end with:

```text
Changed:
Not touched:
Verified:
Not deployed:
```

For frontend changes, verify at minimum:

- JS syntax check.
- Server syntax check if server files are touched.
- `git diff --check`.
- Local HTML cache params include the new versions.

If browser visual inspection is unavailable, say that directly and do not pretend the UI was visually checked.

## Regression Ledger

When the owner says a change was wrong, Codex must classify the failure:

```text
FAILURE:
CAUSE:
CORRECTIVE RULE:
```

Example:

```text
FAILURE: Owner asked to keep beam, Codex removed it.
CAUSE: Codex treated "move drone left" as permission to simplify drone visuals.
CORRECTIVE RULE: Movement requests do not permit removal of visual effects.
```

## Farm Priority Rule

Farm is the fast-start core loop. If the owner mentions "what the player gets", "reward visual", "plant value", or "quick start", Codex must check Farm first.

Shop, Lab, Zen, and Admin are secondary unless the owner names them.

## Stars Rule

Stars are product-critical.

But every Stars change must be complete:

- visible UI;
- server product;
- reward delivery;
- persisted ownership/state;
- admin/payment visibility when relevant;
- verification.

No frontend-only paid feature.

## Tone Rule

When the owner is frustrated, Codex must not defend the previous change.

Correct response:

- acknowledge the exact mistake;
- name the cause;
- fix only the requested thing;
- avoid extra ideas.

Incorrect response:

- "But I thought..."
- "This is better because..."
- adding a new design concept while fixing a mistake.
