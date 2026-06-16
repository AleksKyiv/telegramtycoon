# Telegram Stars Test Plan

## Goal

Prove the technical payment path before rebuilding the whole product:

1. Open the game as a Telegram Mini App.
2. Read Telegram user identity.
3. Accept a small Telegram Stars payment.
4. Credit an internal CRC resource in the game.
5. Understand the owner payout path from earned Stars to TON, then optionally to USDT.

## Important Clarification

There are two different flows:

## Player Payment Flow

This is what we implement in the game.

```txt
Player opens Telegram Mini App
↓
Player presses Buy / Boost / Zen Energy
↓
Bot creates Stars invoice
↓
Telegram payment UI opens
↓
Player pays in Stars
↓
Bot receives successful_payment
↓
Backend credits game resource
```

For digital goods and services inside Telegram apps, Telegram requires Telegram Stars. The invoice currency is `XTR`.

## Owner Payout Flow

This is not an in-game player action.

```txt
Game earns Stars
↓
Earned Stars become eligible for withdrawal
↓
Owner withdraws via Telegram / Fragment
↓
Stars convert to TON
↓
TON goes to owner TON wallet
↓
Owner may move TON to exchange
↓
Owner may convert TON to USDT
↓
Owner may withdraw USDT through exchange/off-ramp
```

This flow depends on Telegram/Fragment eligibility, withdrawal rules, region, KYC/exchange rules, and current Telegram policies.

## What We Can Build First

## Sprint 1: Telegram Identity

Result:

- game opens from Telegram;
- frontend receives `initData`;
- backend verifies Telegram init data;
- game shows real Telegram `id`, `first_name`, `username`;
- local browser test still works.

Files likely needed:

- `telegram.js`
- backend endpoint: `POST /auth/telegram`
- frontend identity display/debug panel.

## Sprint 2: Stars Test Purchase

Result:

- button `★ 10`;
- backend creates a Telegram Stars invoice with `currency: XTR`;
- Mini App opens the invoice with `Telegram.WebApp.openInvoice`;
- backend answers `pre_checkout_query` through the Telegram webhook;
- backend receives `successful_payment`;
- backend credits the player's internal CRC balance;
- frontend syncs updated balance.

Minimal test product:

```txt
Product: +120 CRC
Price: 10 Stars for test
Currency: XTR
```

Current MVP endpoints:

- `POST /api/stars/invoice` creates an invoice link.
- `POST /api/telegram/webhook` receives `pre_checkout_query` and `successful_payment`.

To configure the live bot after deploy:

```bash
node scripts/configure-telegram-bot.mjs
```

## Sprint 3: Progress Save

Result:

- user progress is stored by Telegram user ID;
- Farm/Lab/Zen state survives device/browser changes;
- localStorage becomes fallback only.

## Sprint 4: Owner Payout Documentation

Result:

- document exact withdrawal route;
- minimum withdrawal requirements;
- Fragment + TON wallet setup;
- USDT/off-ramp options;
- risks and compliance notes.

## Required From Owner

- Telegram bot token from BotFather.
- Mini App short name from BotFather.
- HTTPS URL for the web app.
- Backend hosting decision.
- TON wallet for payout testing later.
- Exchange/off-ramp account only after TON withdrawal is confirmed.

## Technical Stack Recommendation

For the fastest MVP:

- Frontend: current HTML/CSS/JS, later Vite if needed.
- Backend: Node.js + Express.
- Database: Supabase Postgres.
- Hosting frontend: Vercel or Netlify.
- Hosting backend: Render, Railway, Fly, or Supabase Edge Functions.
- Bot: grammY or Telegraf.

## Risks

- Stars payments require correct Bot API flow.
- `pre_checkout_query` must be answered quickly.
- The backend must not credit resources until `successful_payment`.
- Earned Stars payout is not the same as player payment.
- Purchased personal Stars cannot simply be withdrawn as developer revenue.
- TON to USDT is a crypto/off-ramp process and may involve KYC, exchange rules, taxes, and regional restrictions.

## Official References

- Telegram Stars payments for bots: https://core.telegram.org/bots/payments-stars
- Telegram Payments API: https://core.telegram.org/api/payments
- Telegram Stars terms: https://telegram.org/tos/stars
- TON / Fragment explanation: https://www.ton.org/ach/fragment-explained

