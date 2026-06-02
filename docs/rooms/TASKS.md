# Tasks Room Passport

## Role

Tasks give starter energy and guide users toward external channels: Telegram channel, YouTube, TikTok, Instagram, partner campaigns, and weekly events.

Tasks solve early-game friction: the user has little energy at the start, so simple actions unlock first movement.

## Current Elements

- Tasks room exists in bottom navigation
- Bonus action concept

## Adopted Blueprint Direction

Tasks should be treated as campaign/event actions, not random buttons.

Good first actions:

- join Telegram channel
- open YouTube
- open TikTok
- open Instagram
- visit partner campaign
- participate in weekly event

The task flow should be simple:

```text
show task
player opens action
backend/client records click
player claims starter reward
Admin sees conversion
```

## Weekly Event Link

Tasks can support weekly events.

Example:

```text
Moon Basil Week
1. Join Telegram channel
2. Plant event plant
3. Use event strain in Lab
4. Use artifact in Zen
5. Claim event BioCard
```

This connects Tasks with Farm, Lab, Zen, and BioCards.

## Reward Direction

Good MVP rewards:

- small starter energy
- Bio Credits
- event points
- visual badge
- event plant access later

Avoid early:

- large paid-equivalent rewards
- high-value rewards without validation
- unclear external ads
- spammy task walls

## Stable Rules

- Rewards must not be abusable.
- External actions should be easy to understand visually.
- Verification can start simple, but paid/reward-heavy tasks need stronger checks later.
- Ads/sponsored tasks must be clearly labeled later.
- Tasks must not impersonate Telegram/Stars payment rewards.

## Data To Save

- Task viewed
- Task clicked
- Task claimed
- Reward amount
- Verification status
- Campaign id
- Source channel
- Claim timestamp

## Admin Needs

- Which tasks are clicked
- Which rewards are claimed
- User conversion by campaign
- Fraud/duplicate checks later
- Campaign source performance
- Event participation from task clicks

## Next Useful Work

1. Define first 3 starter tasks.
2. Add claim button and reward.
3. Save claimed tasks server-side.
4. Show task metrics in Admin.
5. Connect one weekly event mock to Tasks.