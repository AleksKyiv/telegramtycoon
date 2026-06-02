# Stars Shop Passport

## Role

Stars Shop is the monetization and paid entitlement layer. It should sell useful progression and premium uniqueness, not random disconnected buttons.

## Current Elements

- Stars invoice flow exists
- Payment test was successful
- Admin can show payment data
- Platform split Android / Apple was started
- Unique mutation test product exists

## Adopted Blueprint Direction

Stars must be treated as backend billing, not frontend UI.

Payment lifecycle:

```text
Player taps offer
Backend creates order
Telegram invoice opens
Telegram sends pre_checkout_query
Backend validates quickly
Telegram sends successful_payment
Backend writes payment ledger
Backend grants entitlement idempotently
Frontend refreshes state
Admin shows payment and grant
```

## MVP Paid Offers

Recommended first real paid products:

1. Premium Capsule 4 unlock
2. Lab synthesis acceleration or unique mutation attempt
3. Premium visual shell later

Avoid early:

- many boosts
- confusing bundles
- paid random loot without clear disclosure
- marketplace
- NFT/TON purchases
- direct sale of final rare results

## Stable Rules

- Use Telegram Stars currency `XTR` for digital goods.
- Do not deliver paid goods after only `pre_checkout_query`.
- Deliver only after `successful_payment`.
- Store `telegram_payment_charge_id`.
- Every paid entitlement must be visible in Admin.
- Every paid grant must be idempotent.
- Product price/grant must come from server catalog, not frontend.

## Data To Save

- Invoice created
- Order id
- Invoice payload
- Pre-checkout received
- Successful payment received
- Telegram charge ID
- Product ID
- Stars amount
- Platform
- Entitlement delivered
- Grant ledger row
- Refund status later
- Raw update reference if possible

## Admin Needs

- Payment list
- User
- Product
- Stars amount
- Platform
- Status
- Delivery result
- Errors
- Duplicate charge alerts
- Failed grant alerts
- Refund/support view later

## Next Useful Work

1. Turn one paid slot into a real server entitlement.
2. Connect payment success to entitlement delivery.
3. Save entitlement server-side.
4. Show entitlement in Admin.
5. Add duplicate-payment/idempotency guard.
6. Add `/paysupport` support path.
