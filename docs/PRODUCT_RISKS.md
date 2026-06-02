# Product Risks And Long-Term Work

This file lists the main problems we must solve to build the product long-term without being blocked by unclear process, bureaucracy, payments, or chaotic scope.

## Founder / Product Problems To Solve

| Problem | Why it hurts | What we do |
|---|---|---|
| Ideas are bigger than the current prototype | Good ideas can break the small MVP if added too early | Split every idea into room, layer, MVP, later version |
| Visual taste is high, prototype tools are rough | CSS-only visuals can disappoint if we expect final art quality | Separate prototype visuals from final art direction and asset pipeline |
| Monetization is central but bureaucratic | Stars, payouts, refunds, platform rules, taxes, and KYC can block launch | Treat payments as a controlled system, not as UI buttons |
| Telegram identity must be trusted | Browser data can be fake if not validated | Use server-side `initData` validation |
| Progress and purchases must never be lost | Users will not trust a game that loses paid or earned items | Move important state to server and log all changes |
| Scope can explode | Farm, Lab, Zen, Tasks, skins, Stars, NFT and analytics can become too much at once | Work by room passports and one controlled task at a time |
| The owner should not be forced to think like a developer | This wastes energy and tokens | Codex translates product language into technical tasks |
| Admin visibility is still limited | If we cannot see what happened, we cannot manage the product | Every serious mechanic must appear in Admin |

## Bureaucracy / External Risks

| Area | Risk | Control |
|---|---|---|
| Telegram Stars | Digital goods inside Telegram must use Stars / `XTR` | Keep all in-app digital purchases in Stars |
| Payment delivery | `pre_checkout_query` is not proof of payment | Deliver only after `successful_payment` |
| Refunds / disputes | Paid items may need traceable charge IDs | Store `telegram_payment_charge_id` and order state |
| Apple / Google | Platform rules influence Stars purchase experience | Keep platform split in payment logs |
| Payout | Stars withdrawal / conversion depends on Telegram and Fragment rules | Keep owner payout separate from player purchase flow |
| Crypto / TON / USDT | Off-ramp can require KYC, taxes, and regional checks | Treat this as owner finance operations, not game UI |
| Privacy | Player IDs, usernames, payments, analytics are personal/product data | Add Privacy Policy, Terms, and data minimization before wider launch |
| NFT / Getgems | NFT adds wallet, ownership, metadata, marketplace, and legal complexity | Do not add NFT until game inventory and artifact logic are stable |

## Long-Term Operating Rule

The product should be built as a controlled financial-game system:

```text
Idea -> room passport -> MVP scope -> server state -> admin visibility -> payment/compliance check -> deploy
```

If a mechanic affects money, progress, identity, rewards, or inventory, it is not "just UI".

