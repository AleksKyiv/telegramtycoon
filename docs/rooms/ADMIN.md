# Admin Passport

## Role

Admin is the control center. If a mechanic is not visible in Admin, we cannot control it.

Admin should become the project cockpit: players, payments, room activity, conversion, errors, economy balance, campaigns, and operational safety.

## Current Elements

- Protected dashboard
- Player list
- Leaderboard data
- Payment view
- Basic events / process view

## Adopted Blueprint Direction

Admin should cover three levels:

1. What happened?
2. Is anything broken?
3. What should the owner do next?

MVP should prioritize reliable event logs before fancy charts.

## Core Admin Areas

- Players
- Payments / Stars
- Room activity
- Farm actions
- Lab mutation attempts
- Zen sessions
- Task claims
- Errors
- Revenue / Stars totals
- Live Ops messages later
- Event config later

## Assistant Direction

The AI assistant belongs in Admin/Operator only, not in the player app.

Phase 1 assistant should be text-first and safe:

- explain system state
- summarize payments
- summarize room activity
- highlight anomalies
- navigate to safe views

It must not silently mutate economy or payments.

## Stable Rules

- Admin must stay private.
- It should explain what happened, not just show raw data.
- Payment and progress problems must be visible here.
- Add charts only after raw events are reliable.
- Manual admin actions must create audit records later.
- Do not add heavy visual dashboards that slow down the game client.

## Data To Show

- Players
- Payments
- Room opens
- Farm actions
- Lab mutation attempts
- Zen sessions
- Task claims
- Errors
- Revenue / Stars totals
- Entitlements
- Failed grant alerts

## Next Useful Work

1. Add clear event log.
2. Add room activity counters.
3. Add payment delivery status.
4. Add simple charts after events are stable.
5. Add Zen session metrics.
6. Add Lab rarity distribution.
