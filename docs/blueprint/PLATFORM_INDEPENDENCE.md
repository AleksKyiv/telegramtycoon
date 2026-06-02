# Platform Independence

## Core Rule
Telegram is an entry layer, not the product core.

The product must be able to run as:
- Telegram Mini App
- normal web app
- future desktop/mobile wrapper if needed

All important state lives on our servers.

## What Telegram Is
Telegram is useful for:
- traffic acquisition
- user entry
- Telegram identity bootstrap
- Mini App shell
- Stars payments
- bot/news/channel communication
- social distribution

Telegram is not:
- the database
- the game state source of truth
- the inventory authority
- the card ownership authority
- the operator system
- the only frontend

## Product Architecture

```text
Telegram Mini App Client
Web Browser Client
Operator Client
Community News Bot
        |
        v
Backend API
        |
        v
Simulation Core / Billing Core / Content Core
        |
        v
Database / Ledger / Audit / Backups
```

## Client Types

### Telegram Player Client
Role:
- opens inside Telegram
- reads Telegram init data
- sends it to backend for validation
- uses Telegram WebApp SDK where useful
- opens Stars payment flow

Must not:
- decide rewards
- store final state
- grant paid items
- own inventory

### Web Player Client
Role:
- same player app in normal browser
- uses web login/session
- can be used if Telegram is unavailable
- useful for desktop play and testing

Must share:
- same backend API
- same simulation rules
- same inventory
- same player profile where identity is linked

### Operator Client
Role:
- internal control center
- reads analytics and player state
- manages content/live ops
- audits billing and grants

Must always use:
- admin auth
- audit logs
- server-side authorization

### Bot / Channel Layer
Role:
- news
- support
- payment events
- reminders
- community distribution

Must not:
- silently mutate economy
- grant paid value without backend billing flow

## Identity Model
The backend should support linked identities.

Working concept:

```text
player_account
- internal_player_id
- created_at
- status

player_identity
- id
- internal_player_id
- provider
- provider_user_id
- verified_at
```

Providers:
- `telegram`
- `web_email`
- `tonkeeper_later`
- `telegram_wallet_later`
- `ton_wallet_later`
- `web_wallet_later`
- `admin_manual_link_later`

Telegram `tg_id` is an identity provider value, not the main database primary key.

Use internal IDs for core data:
- inventory
- resources
- cards
- payments
- meditation stats
- lab processes
- messages

## API Rule
All clients talk to the same backend API.

The backend decides:
- current player state
- resource balances
- harvest outcomes
- card drops
- payment grants
- event eligibility
- message delivery

Frontend clients only render and request actions.

## Payments
Telegram Stars are only one payment adapter.

For Telegram digital goods:
- use Stars
- validate `successful_payment`
- grant backend-side only

For normal web later:
- use a separate web payment adapter only if allowed and needed
- never mix Telegram Stars assumptions into the core economy

Billing Core should expose product grants in a platform-neutral way.

Example:

```text
grantProduct(playerId, productId, source)
```

Source can be:
- `telegram_stars`
- `admin_grant`
- `event_reward`
- `web_payment_later`

## Data Ownership
Server owns:
- player account
- resources
- inventory
- BioCards
- payment ledger
- grant ledger
- event participation
- meditation stats
- lab/capsule timers
- account deletion lifecycle

Client owns:
- UI state
- selected tab
- local animation state
- local cached display data
- temporary drafts

Account deletion:
- user can request deletion from Settings
- backend controls deletion lifecycle
- payment/audit ledgers may be retained as required

## Why This Matters
This protects the product from:
- Telegram restriction or ban risk
- client-side cheating
- data loss
- payment disputes
- inability to launch web version
- future platform expansion problems

## MVP Implication
Even if the first build looks Telegram-native, the architecture must be:

```text
Telegram-first UX
Server-first truth
Web-compatible client
Platform-independent core
```

## Dashboard Rule
Any future task should identify whether it touches:
- core backend
- Telegram client
- web client
- operator client
- bot/news layer
- platform adapter

If a feature only works because Telegram exists, it should be marked as a Telegram adapter feature, not core product logic.

## Web Version Entry
The Player client should expose a clear action:

```text
Open Web Version
```

This action belongs in the Account / More menu.

It should help the player understand that the product is not locked inside Telegram.

## Wallet Connection Later
TON-compatible wallets can be added later as linked identity providers.

Examples:
- Tonkeeper
- Telegram Wallet
- other compatible TON wallets if needed

This is useful as an additional authentication, recovery, or verification layer.

For now:
- do not use TON for payments
- do not build NFT ownership
- do not make TON required
- show as `Coming later` only if visible in UI
