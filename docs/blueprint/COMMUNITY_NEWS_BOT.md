# Community News Bot

## Purpose
The Community News Bot keeps the audience warm between app sessions.

It is not only a utility/payment bot.
It is the product's living voice in Telegram.

The bot should make players feel:
- the world is alive
- events are happening
- new cards and artifacts appear
- other players are progressing
- it is worth returning today

## Product Role
The Player app is where users play.
The Operator panel is where we control.
The Community News Bot is where the world speaks.

It supports:
- retention
- event launches
- BioCard reveals
- content drops
- community energy
- lightweight storytelling
- return-to-app calls
- future sponsor/ad monetization

It can also become a media asset later.
If the audience grows, public news surfaces can support sponsor posts, partner promotions, affiliate links, or event sponsorships.

## Content Types

| Type | Example |
| --- | --- |
| `News` | New Moon Basil event is live |
| `BioCard Drop` | New rare GF-MZ83 card discovered |
| `Event Reminder` | 24h left to finish Moon Basil Week |
| `Lab Report` | Global mutation stability increased today |
| `Community Milestone` | Players completed 10,000 rituals |
| `Meditation Prompt` | Quick Calm session is ready |
| `Shop Notice` | Quantum Capsule offer is active |
| `Maintenance` | Scheduled update notice |
| `Sponsor/Partner` | clearly labeled partner post later |

## Voice
The bot should feel like a living LabOS broadcast.

Tone:
- short
- energetic
- atmospheric
- not spammy
- slightly mysterious
- clear CTA

Example:

```text
GreenFarm Signal:
Moon Basil Week has opened.

A limited BioCard series is now active.
Grow Moon Basil, synthesize Quiet Moon Fragment, and unlock the Moon Calm field.

Open LabOS
```

## Channels
There may be multiple Telegram surfaces:

| Surface | Role |
| --- | --- |
| `Bot DM` | personalized service/news messages |
| `Telegram Channel` | public news feed |
| `Telegram Group` | community discussion later |
| `Mini App Inbox` | player-specific in-app messages |

MVP should prioritize:
- Telegram channel for public news
- in-app inbox for player-specific messages
- bot DM only for important or opted-in notifications

## Relationship To Operator Messaging
Operator Messaging and Community News Bot are related but not identical.

Operator Messaging:
- targets players inside the app
- can attach rewards/CTAs
- is tied to player state
- requires audit

Community News Bot:
- broadcasts world/news/content
- supports community presence
- can post BioCard reveals and event stories
- may not always be player-specific

The Operator panel should eventually publish to both:
- `In-App Message`
- `Home Banner`
- `Telegram Channel Post`
- `Bot DM Notification`

## Content Calendar
To feel alive, the bot needs a lightweight content rhythm.

Example weekly rhythm:

| Day | Content |
| --- | --- |
| Monday | event launch |
| Tuesday | featured BioCard |
| Wednesday | Lab report / player milestone |
| Thursday | meditation prompt |
| Friday | premium/rare teaser |
| Weekend | event reminder / recap |

This does not need to be heavy.
Even 3 good posts per week can make the project feel alive.

## BioCard Posts
BioCards are perfect for news.

Post types:
- new event card revealed
- rare card discovered
- community unlock card
- weekly featured card
- behind-the-card story

Example:

```text
New BioCard detected:
GF-MZ83 Mutation Zone
Rare Class
Mutation Success: 83%

Available during Moon Basil Week.
```

## Anti-Spam Rules
The bot must not annoy players.

Rules:
- do not send too many DMs
- separate public channel posts from personal messages
- support mute/opt-out for bot DMs
- keep event reminders limited
- avoid vague hype without useful action
- never fake scarcity dishonestly
- log all outgoing automated messages
- clearly label ads/sponsored posts
- do not let ads impersonate game rewards

Suggested DM limit:
- max 1 promotional/event DM per day
- support/payment/security messages can bypass this
- channel posts can be more frequent but should still be high quality

## Advertising Monetization
Advertising is a possible future monetization layer if the audience becomes large enough.

Possible formats:
- sponsored Telegram channel post
- partner event
- sponsored BioCard reveal
- partner quest/task
- branded limited event
- affiliate link inside partner post

Rules:
- ads must be clearly labeled
- ads should fit the world/theme
- partner links should be allowlisted
- paid promotions should not promise gameplay rewards unless backed by real backend reward config
- avoid low-quality spam offers
- do not sell direct access to player data
- keep payment/billing systems separate from ad operations

Good example:

```text
Partner Signal:
This week's Meditation Soundscape is sponsored by [Partner].
Open the event to claim a cosmetic sound badge.
```

Bad example:

```text
Click this unknown link to get rare cards.
```

## Ad Readiness
Do not build ad monetization before retention exists.

Minimum before ads:
- stable weekly audience
- clear content calendar
- basic post analytics
- link click tracking
- operator approval flow
- partner link allowlist
- clear sponsored label

Useful metrics:
- channel subscribers
- post views
- CTA clicks
- Mini App opens from news
- event participation after news
- unsubscribe/mute rate

## News To App Loop
The bot/channel should constantly create reasons to open the app.

Loop:

```text
News post appears
Player sees new card/event/story
CTA opens Mini App
Player performs action
Player earns progress/card/artifact
Future news references the living world again
```

This is the core retention value of the news bot.

## Personalization Later
Later, the bot can personalize:
- card collection reminders
- meditation streak reminders
- lab synthesis ready
- capsule ready
- league promotion
- event progress
- abandoned premium purchase support

But MVP should not over-personalize.
Start with public news and simple event notices.

## Data Model

```text
news_posts
- id
- type
- title
- body
- media_ref
- cta_type
- cta_value
- target_surface
- status
- scheduled_at
- published_at
- created_by
- sponsor_id
- is_sponsored
- sponsored_label

news_delivery_log
- id
- post_id
- surface
- tg_id
- telegram_message_id
- status
- error
- sent_at

news_preferences
- tg_id
- bot_dm_enabled
- event_reminders_enabled
- meditation_reminders_enabled
- card_news_enabled
```

## Operator Requirements
Operator should eventually have:
- News composer
- card post generator
- event announcement generator
- scheduled posts
- preview as Telegram post
- publish to channel
- publish to in-app inbox
- send DM to segment
- delivery/click stats
- sponsored post flag
- partner link allowlist
- sponsor/partner metadata

## MVP Build Recommendation
For MVP:
- define one Telegram channel/news surface
- create news post templates
- create Operator news composer mock
- post manually at first if needed
- connect event launch to a reusable news message
- create BioCard news template
- track CTA from news into Mini App if simple

Do not automate mass DM until opt-out, logging, and rate limits exist.
Do not start ad monetization until the channel has real retention and trust.
