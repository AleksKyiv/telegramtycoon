# Green Farm Tycoon

Prototype 0 visual MVP for a Telegram Mini App tycoon.

## What is included

- Mobile-first visual interface inspired by the first generated concept.
- Three rooms: Farm, Lab, Zen.
- One microgreen plant with growth progress and collect action.
- Mock Telegram Stars button for the first purchase flow placeholder.
- Local progress storage for the visual prototype.
- Lightweight leaderboard preview.

## Next technical layer

This is a frontend MVP only. The next step is to add the real Telegram backend:

- Telegram `initData` validation.
- Server-authoritative player progress.
- PostgreSQL persistence.
- Real Stars invoice flow through Bot API.
- Telegram webhook for `pre_checkout_query` and `successful_payment`.
