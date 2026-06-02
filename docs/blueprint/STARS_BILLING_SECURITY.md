# Stars Billing Security

## Purpose
Stars monetization must be treated as a secure backend system, not a frontend button.

This document defines the baseline for Telegram Stars payments, grants, refunds, and audit safety.

## Core Rule
The frontend never grants paid value.

The player UI can:
- show offers
- request invoice creation
- open Telegram payment flow
- show pending/completed status

Only the backend can:
- create signed/internal order records
- validate Telegram payment updates
- grant paid items
- write ledger entries
- issue refunds

## Telegram Requirements
For digital goods and services inside Telegram apps:
- use Telegram Stars
- use `XTR` as currency
- create invoices through the Bot API
- answer `pre_checkout_query` quickly
- grant goods only after `successful_payment`
- store `telegram_payment_charge_id`
- support `/paysupport`
- support refunds through Telegram refund flow

## Payment Flow

```text
Player taps Stars offer
Frontend asks backend to create order
Backend creates pending order
Backend creates Telegram invoice link / invoice
Frontend opens Telegram invoice
Telegram sends pre_checkout_query to bot/backend
Backend validates order and answers pre_checkout_query
Telegram sends successful_payment
Backend verifies payload and charge id
Backend writes payment ledger
Backend grants item idempotently
Frontend refreshes player state
```

## Do Not Grant On
Never grant paid value based on:
- button click
- frontend state
- localStorage
- invoice opened
- invoice link generated
- `pre_checkout_query` only
- client saying payment completed

Grant only after the backend receives and validates `successful_payment`.

## Idempotency
Every paid grant must be idempotent.

Required unique keys:
- internal `order_id`
- Telegram `invoice_payload`
- `telegram_payment_charge_id`
- `tg_id`
- product id

If Telegram sends the same update twice, the backend must not grant twice.

Recommended rule:

```text
UNIQUE(telegram_payment_charge_id)
UNIQUE(order_id)
```

Grant process:

```text
BEGIN TRANSACTION
Find order by payload
Check order status is pending
Check charge id not used
Insert payment ledger row
Insert grant ledger row
Apply entitlement
Mark order paid/granted
COMMIT
```

## Ledger
Payments need a ledger from the beginning.

Minimum tables:

```text
payment_orders
- id
- tg_id
- product_id
- invoice_payload
- amount_stars
- status
- created_at
- paid_at
- granted_at
- failed_reason

payment_ledger
- id
- order_id
- tg_id
- telegram_payment_charge_id
- currency
- amount
- raw_update_json
- created_at

grant_ledger
- id
- order_id
- tg_id
- product_id
- grant_type
- grant_ref_id
- created_at

refund_ledger
- id
- order_id
- tg_id
- telegram_payment_charge_id
- reason
- status
- created_at
```

## Product Catalog
Paid products must come from server config.

Do not trust price/product info from the frontend.

Example MVP products:

```json
[
  {
    "id": "capsule_4_quantum",
    "title": "Quantum Capsule",
    "amountStars": 299,
    "grantType": "capsule_slot",
    "grantValue": "capsule_4"
  },
  {
    "id": "lab_finish_now_small",
    "title": "Finish Lab Synthesis",
    "amountStars": 49,
    "grantType": "lab_acceleration",
    "grantValue": "finish_active_small"
  }
]
```

## MVP Paid Offers
Phase 1 should keep Stars offers simple.

Recommended:
- unlock Capsule 4 / Quantum Capsule
- accelerate active Lab synthesis
- optional premium visual frame later

Avoid early:
- paid random loot without clear disclosure
- pay-to-win huge multipliers
- marketplace
- NFT/TON purchases
- direct sale of final rare results

## Abuse Controls
Minimum controls:
- rate limit invoice creation per user
- rate limit failed payment attempts
- validate Telegram init data for Mini App sessions
- validate bot webhook source/signature strategy
- keep bot token secret server-side
- never expose catalog grant logic to frontend
- log all payment updates
- alert on duplicate charge ids
- alert on grant failures
- admin/operator actions must be audited

## Failure States
The product must handle:
- invoice created, not paid
- pre-checkout rejected
- successful payment received but grant failed
- duplicated Telegram update
- player closes Mini App during payment
- refund requested
- Telegram webhook delayed

User-facing state:
- `Pending`
- `Paid, granting`
- `Granted`
- `Refunded`
- `Failed, contact support`

## Support
The bot must support `/paysupport`.

Support view should allow operator to see:
- player tg_id
- order id
- product id
- Stars amount
- payment status
- grant status
- Telegram charge id
- raw update reference
- refund status

## Refunds
Refunds must be recorded.

Refund flow:

```text
User requests support
Operator reviews order
Backend calls refund method if eligible
Backend writes refund ledger
Backend revokes entitlement if possible/needed
Operator sees final status
```

Revocation must be product-specific.
For example, accelerating a completed synthesis may not be reversible, but a failed grant should be refunded.

## Operator Requirements
Operator panel needs:
- Stars revenue summary
- orders table
- failed grants alert
- duplicate update alert
- refund queue
- manual reconcile button later
- player payment history

Manual corrections must always create audit records.

## Testing
Before real launch:
- Telegram Stars test environment
- duplicate update test
- failed grant recovery test
- refund test
- webhook retry test
- database transaction rollback test
- support command test

## Security Principle
Paid value is never trusted from the client.

The only safe source of paid truth is:

```text
Telegram successful_payment -> backend validation -> payment ledger -> grant ledger -> player entitlement
```
