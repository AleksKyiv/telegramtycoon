# Operator Messaging And Live Ops

## Purpose
The Operator panel needs a controlled way to communicate with players and launch live content.

This includes:
- announcements
- event messages
- inbox messages
- reward notifications
- maintenance notices
- targeted player messages
- optional Telegram bot notifications
- public/community news posts later

The goal is to let the operator create something once and deliver it safely to the right players.

## Product Role
Messaging connects the Operator platform to the Player app.

Operator can create:

```text
Moon Basil Week starts now.
Open the event and plant your limited Moon Basil.
Reward: event BioCard + Calm bonus.
```

Players can receive:
- in-app inbox message
- Home banner
- event card
- push-style Telegram bot message later
- reward claim prompt

## Delivery Channels

| Channel | MVP? | Description |
| --- | --- | --- |
| `Player Inbox` | yes | messages stored and shown inside Player app |
| `Home Banner` | yes | high-priority active announcement |
| `Event Card` | yes | message connected to an active event |
| `Telegram Bot Message` | later/controlled | direct Telegram notification |
| `Operator Notes` | yes | internal-only message on player profile |

MVP should start with `Player Inbox`, `Home Banner`, and `Event Card`.

Bot push messages should be added carefully because Telegram users can treat spam badly.

## Message Types

| Type | Use |
| --- | --- |
| `Announcement` | general news |
| `Event Launch` | weekly event starts |
| `Reward Available` | claimable reward |
| `Maintenance` | downtime / degraded state |
| `Personal` | targeted message to one player |
| `Segment Campaign` | message to selected group |
| `System Alert` | automated system-generated notice |

## Targeting
Messages should support targeting.

MVP targeting:
- all players
- single `tg_id`
- league
- event participants
- players active in last N days

Later targeting:
- payer/non-payer
- capsule level
- lab level
- meditation streak
- card collection status
- churn risk segment

Important:
Targeting should be backend-side.
The frontend should only display messages assigned to the player.

## Operator Message Composer
The operator UI should include:
- title
- body
- message type
- target audience
- start time
- end time
- priority
- CTA label
- CTA destination
- reward id optional
- preview as player
- save draft
- publish

CTA destinations:
- `open_event`
- `open_capsules`
- `open_lab`
- `open_meditation`
- `open_shop`
- external URL
- claim reward

## Player Inbox
Player app should show:
- unread badge
- message list
- priority message card
- read/unread state
- CTA button
- reward claim if attached

Messages should be short and mobile-friendly.

## Home Banner
Home can show one active high-priority banner.

Rules:
- do not show too many banners
- player can dismiss non-critical banners
- event banners should have countdown
- maintenance banners cannot be hidden until resolved

## Event Launch Flow

```text
Operator creates event config
Operator creates event announcement
Operator previews player card/banner
Operator publishes event
Backend assigns message to target players
Player sees Home banner and Inbox message
Player taps CTA
Player opens Event page
```

## Telegram Bot Notification
Direct bot messages can be powerful, but risky.

Use for:
- important event launch
- reward ready
- payment/support issue
- maintenance/security notice

Avoid:
- too many promotional messages
- repeated reminders
- vague marketing spam

Rules:
- respect opt-out/mute preference
- rate limit per player
- log every outbound bot message
- keep copy short
- include clear action

MVP can delay bot push and rely on in-app inbox first.

## Community News Bot Link
There is also a separate Community News Bot/news layer.

Difference:
- Operator Messaging targets player state and in-app communication.
- Community News Bot keeps the public/community audience alive with news, BioCard drops, and event stories.

The same Operator composer can later publish to both, but MVP should keep the concepts separate.

## Safety And Audit
All operator-published messages must be auditable.

Store:
- who created it
- who approved/published it
- target rules
- exact text
- created time
- published time
- modified time
- delivery counts
- clicks
- claim counts

Manual messages to a single player should also be logged.

## Abuse Prevention
Messaging can damage the product if misused.

Controls:
- draft/preview before publish
- confirmation for all-player messages
- rate limit campaigns
- restrict operator roles later
- audit log required
- disable external URLs unless allowlisted later
- no hidden rewards from frontend-only messages

## Data Model

```text
operator_messages
- id
- type
- title
- body
- priority
- target_type
- target_rules_json
- cta_type
- cta_value
- reward_id
- starts_at
- ends_at
- status
- created_by
- published_by
- created_at
- published_at

player_messages
- id
- message_id
- tg_id
- status
- delivered_at
- read_at
- clicked_at
- claimed_at

outbound_bot_messages
- id
- message_id
- tg_id
- telegram_message_id
- status
- error
- sent_at
```

## MVP Build Recommendation
For the first Operator/Player integration:
- create message composer in Operator
- support all-player announcement
- support event launch announcement
- show Player inbox mock
- show Home banner mock
- store messages in local/backend state
- add audit fields from the beginning

Do not start with mass Telegram bot pushes.
Build in-app messaging first, then add bot notifications carefully.
