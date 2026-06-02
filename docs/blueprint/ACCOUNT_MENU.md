# Account Menu

## Purpose
The Player app needs one clear system button for non-gameplay actions.

Working name:

```text
Account / More
```

This prevents Settings, Support, Web version, and future wallet identity from cluttering the main gameplay tabs.

## Placement
Recommended placement:
- top-right button in the Player top bar
- avatar/profile button can open the same menu
- not part of bottom navigation

Reason:
Bottom navigation should stay focused on core gameplay:
- Home
- Capsules
- Lab
- Meditate
- Shop

## MVP Menu Items

| Item | Purpose | MVP? |
| --- | --- | --- |
| `Settings` | sound, language, notifications, display options | yes |
| `Support` | payment/support/help entry | yes |
| `Open Web Version` | go to browser version outside Telegram | yes |
| `Inbox` | messages/announcements if not shown elsewhere | yes/optional |
| `Account ID` | show internal player id / Telegram linked status | yes |
| `Connect Wallet` | future wallet identity link | later |

## Settings
Settings should include:
- sound on/off
- master volume
- music volume
- UI/action sounds on/off
- ambient/meditation sounds on/off
- vibration/haptics on/off where supported
- UI sounds on/off
- ambient/meditation sound on/off
- language later
- notification preferences
- reduced motion later
- data/account info later
- Terms and Conditions
- Privacy Policy
- Delete Account

MVP:
- master volume
- music toggle
- UI sounds toggle
- vibration toggle
- open support
- open web version
- show account identity status
- legal links
- Delete Account with confirmation

Legal links:
- `Terms and Conditions` -> `terms.html`
- `Privacy Policy` -> `privacy.html`

Delete Account:
- must be in Settings / Privacy area
- must require confirmation
- should use deletion request lifecycle, not instant accidental deletion
- detailed rules live in `ACCOUNT_DELETION.md`

## Support
Support should include:
- payment help
- `/paysupport` direction
- contact/support message
- order/payment issue entry later
- FAQ later

Payment support must connect to Stars billing audit.
Support must not manually grant paid value without backend audit.

## Open Web Version
This button is important because Telegram is only an entry layer.

Behavior:
- if inside Telegram, open external web URL
- if already on web, show current web session/account state
- web version should use same backend account where identity is linked

MVP label:

```text
Open Web Version
```

Later:
- `Copy web login link`
- `Link web account`
- `Continue in browser`

## Wallet Identity
Wallet connection is future identity/verification, not phase 1 payment.

This button can support several provider options later:
- Tonkeeper
- Telegram Wallet
- other compatible TON wallets if needed

The purpose is to let the player link a wallet to the same internal account.
This can act as an additional authentication/recovery/verification factor.

Allowed future uses:
- link wallet as identity provider
- additional account verification
- account recovery support later
- prove ownership of future assets
- optional profile verification
- future NFT/card ownership layer if later approved

Not phase 1:
- TON payments
- token economy
- NFT ownership
- marketplace settlement

Rule:
If wallet connection appears in the Account Menu before implementation, it should be marked:

```text
Coming later
```

## Identity Display
The menu should show simple identity status.

Examples:
- `Telegram linked`
- `Web account linked`
- `Wallet not connected`
- `Tonkeeper linked`
- `Telegram Wallet linked`
- `Player ID: GF-8A21`

Do not expose sensitive internal database IDs if avoidable.
Use a public player code later.

## Data Model Hooks
This connects to the platform-independent identity model:

```text
player_identity
- provider: telegram | web_email | tonkeeper_later | telegram_wallet_later | ton_wallet_later
- provider_user_id
- verified_at
```

## MVP Build Recommendation
For the first player build:
- add top-right `Account` button
- create Account drawer/sheet
- include Settings
- include Support
- include Open Web Version
- include identity status
- show `Connect Wallet` as disabled/coming later

This gives us room for future identity expansion without confusing the main gameplay.
