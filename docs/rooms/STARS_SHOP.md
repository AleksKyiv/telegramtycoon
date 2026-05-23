# Stars Shop Passport

## Role

Stars Shop is the monetization layer. It should sell useful progression, not random buttons.

## Current Elements

- Stars invoice flow exists
- Payment test was successful
- Admin can show payment data
- Platform split Android / Apple was started

## Future Direction

Stars should unlock slot access, drone upgrades, Lab boosts, Zen premium modifiers, and special event content.

## Stable Rules

- Use Telegram Stars currency `XTR` for digital goods.
- Do not deliver paid goods after only `pre_checkout_query`.
- Deliver only after `successful_payment`.
- Store `telegram_payment_charge_id`.
- Every paid entitlement must be visible in Admin.

## Data To Save

- Invoice created
- Pre-checkout received
- Successful payment received
- Charge ID
- Product ID
- Platform
- Entitlement delivered
- Refund status later

## Admin Needs

- Payment list
- User
- Product
- Stars amount
- Platform
- Status
- Delivery result
- Errors

## Next Useful Work

1. Turn one paid slot into a real product.
2. Connect payment success to entitlement delivery.
3. Save entitlement server-side.
4. Show entitlement in Admin.

