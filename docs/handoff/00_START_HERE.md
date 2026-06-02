# New Chat Handoff

This folder is the transfer package for continuing the project in a new chat without losing the product logic.

## Current Situation

We are not starting from zero. The project already has valuable working parts:

- Telegram Mini App launch flow.
- GitHub -> Render deploy flow.
- Render production URL: `https://telegramtycoon.onrender.com/`.
- Current deployed app script version: `app.js?v=48`.
- Telegram Stars invoice flow and basic payment logging.
- Server state sync for player progress.
- Admin dashboard foundation.
- Visual shell for Farm, Lab, Zen, loading screen, settings, drone, data module, and bottom navigation.

But the internal code has become too mixed:

- `app.js` contains visual rendering, economy, Farm, Lab, Zen, Telegram, Stars, settings, missions, and server sync in one file.
- Visual experiments and mechanic experiments are interleaved.
- Farm/Lab/Zen now have a basic connected loop, but the final math should be replaced by a clean mechanical core.

## Expert Decision

Do not throw the project away.

Do not copy donor design over our design.

Do a clean internal rebuild:

```text
Keep current visual shell.
Extract and freeze product rules.
Move math/mechanics into a clean core.
Use current UI only as the display/controller layer.
Replace messy mechanics step by step, not all at once.
```

## Files To Read First In New Chat

1. `docs/handoff/01_VISUAL_SHELL_FREEZE.md`
2. `docs/handoff/02_MECHANICS_TO_TRANSFER.md`
3. `docs/handoff/03_REBUILD_PLAN.md`
4. `docs/handoff/04_NEW_CHAT_PROMPT.md`

## Source Reference Files

- Main project: `C:\Users\komir\Documents\telegramtycoon`
- GDD reference: `C:\Users\komir\Desktop\CyberGreen_GDD_6.md`
- Mechanics donor: `C:\Users\komir\Desktop\bunkers_volume_cybericons_3d.html`

## Immediate Next Step

Start the new chat and paste the text from `docs/handoff/04_NEW_CHAT_PROMPT.md`.

