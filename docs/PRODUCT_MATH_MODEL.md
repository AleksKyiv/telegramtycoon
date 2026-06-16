# Product Math Model

## Active Principle

The product is Stars-native, but the economy must create desire before payment pressure.

The math rule is:

```text
Free loop proves value.
Stars amplify value.
Admin proves truth.
```

## Resource Roles

- Bio / main score: visible Farm progress and broad progression.
- CRC / energy: Farm action currency, not a Lab synthesis ingredient.
- GS / gene strands: biological stability for Lab formulas.
- SE: special enzyme for Lab and premium slot mechanics.
- ZEN / resonance: calm/ritual energy and advanced modifier.
- Stars: paid Telegram currency for capacity, acceleration, premium identity, and convenience.

## First Loop

The first Farm loop must finish in under 45 seconds.

Starter strain:

```text
Neon Basil
duration: 35 seconds
CRC cost: 1
expected harvest multiplier: ~1.136x
purpose: teach plant -> wait -> collect -> material
```

The first loop is not designed to monetize. It is designed to prove that the world reacts.

## Farm Balance

Farm should scale from fast proof to longer habit:

- Starter plants: seconds, tiny CRC cost, low reward.
- Common plants: minutes, meaningful material output.
- Rare plants: longer wait, ZEN or special cost.
- Epic plants: long wait, high progression value.

Farm harvest expected value uses the reward tier distribution:

```text
6% Quantum x4
17% Enhanced x1.8
32% Stable x1
45% Light x0.6
Expected multiplier ~= 1.136
```

### Algorithm: Expected Value

Every plant has expected harvest:

```text
expectedHarvest = baseScore * sum(probability_i * multiplier_i)
```

Current multiplier model:

```text
EV = 0.06*4 + 0.17*1.8 + 0.32*1 + 0.45*0.6
EV = 1.136
```

Volatility is tracked with standard deviation:

```text
stdDev = sqrt(sum(probability_i * (multiplier_i - EV)^2))
current stdDev ~= 0.838
```

This means rewards should feel variable, but the economy must be balanced on expected value, not lucky outcomes.

### Algorithm: Reward Rate

For each plant:

```text
bioPerHour = expectedHarvest * (60 / durationMinutes)
materialPerHour = materialAmount * (60 / durationMinutes)
genePerHour = geneStrands * (60 / durationMinutes)
netBioMean = expectedHarvest - CRC cost
```

This catches plants that look good visually but destroy progression mathematically.

Current starter output:

```text
Neon Basil
duration: 35 seconds
expectedHarvest: ~15.9
netBioMean: ~14.9
bioPerHour: ~1635.8
```

Starter is intentionally high per hour because it is an onboarding proof loop, not a long-term farming tier.

## Lab Balance

Lab formulas must not use CRC as a synthesis ingredient.

Allowed Lab inputs:

- Farm materials.
- GS.
- SE.
- time / queue.
- optional ZEN charge.

CRC can still be a Farm/game currency, but not formula fuel.

### Algorithm: Material Bottleneck Time

Lab recipe time is estimated by source material bottlenecks:

```text
materialRatePerHour = materialAmountPerHarvest * (60 / plantDurationMinutes)
materialHours = requiredAmount / bestMaterialRatePerHour
recipeHours = sum(materialHours)
```

Current model output:

```text
starter_bio_fusion ~= 0.69h at best material sources
capsule_growth_serum ~= 2.0h
quantum_rare_catalyst ~= 1.5h
```

This is not final release pacing. It is a calculation baseline. If we want Lab earlier, reduce material needs or introduce a guided starter recipe.

## Stars Balance

Stars are central to the business model.

Allowed Stars value:

- unlock capacity users already want;
- speed up long waits without making free waits feel punitive;
- premium identity/cosmetics;
- rare collectibles/status;
- comfort and convenience;
- extra reactor/module capacity after Lab desire exists.

Forbidden Stars value:

- blocking the first loop;
- forcing payment to understand the product;
- frontend-only paid rewards;
- paid mechanics invisible to Admin.

### Algorithm: Stars Value Ratio

Every Stars product gets an effective value calculation:

```text
effectiveCrc = directCrc + dailyCrc * passDays
effectiveSe = directSe + dailySe * passDays
crcPerStar = effectiveCrc / stars
sePerStar = effectiveSe / stars
```

Current values:

```text
Energy Pack: 120 CRC / 10 Stars = 12 CRC per Star
Farm Pass: 9000 CRC / 300 Stars = 30 CRC per Star, plus 90 SE and unique flower
```

This is intentional:

- one-time pack is simple and immediate;
- pass is stronger because it requires commitment and daily return;
- pass can be 2-3x better than one-time value;
- similar one-time products should stay within 3x unless there is a clear reason.

## Audit Contract

`game-core/economy.js` exposes `auditBalance()`.

It currently checks:

- starter strain exists;
- starter duration is 45 seconds or less;
- starter CRC cost is not excessive;
- Lab recipes do not use CRC;
- Stars products have id, positive price, and declared reward.

Any future system changing economy must run this audit mentally or programmatically before shipping.

## CLI Balance Audit

Run:

```bash
npm run balance:audit
```

The script uses calculation models for:

- weighted expected value;
- reward variance;
- Farm reward per hour;
- material per hour;
- Lab recipe bottleneck time;
- effective Stars value;
- Stars price spread.

The output is JSON so future systems can consume it directly.
