# Release 2 Mandate

> Status: refined by [Stars Value Pivot](VALUE_FIRST_PIVOT.md).
> Stars remain central to the business model. The correction is that Stars must convert proven desire, not create payment pressure before value is felt.

## North Star

Release 2 must turn the current prototype into a simple, elegant, high-technology product without losing the working infrastructure that already has value.

The product direction is fixed:

```text
Farm hooks.
Lab retains.
Zen differentiates.
Stars monetizes.
Admin controls.
```

Farm is the first gameplay surface. Lab is the second progression layer. Zen is a separate meditation experience and emotional premium layer, not a confusing extra mechanic in the first 30 seconds.

## Product Standard

Release 2 should feel like a calm technological system, not a pile of screens.

Every player-facing decision must pass these checks:

- Is the first action obvious in under 5 seconds?
- Does the player understand the reward without reading a tutorial?
- Does the screen show progress visually before it explains it with text?
- Does the mechanic make the player want to return tomorrow?
- Does the purchase offer save time, unlock capacity, or deepen the experience without feeling forced?

The product should be sophisticated, but the interaction must be simple.

## What Must Survive

These are protected assets. Release 2 must preserve them unless there is a direct decision to replace one.

- Telegram Mini App entry flow.
- Telegram identity and `initData` validation direction.
- GitHub to Render deploy flow.
- Production URL and current deployment path.
- `server.mjs` as the working backend base for now.
- Stars invoice creation and successful payment handling.
- Payment order logging.
- Admin dashboard and payment visibility.
- Player state sync.
- Existing room model: Farm, Lab, Zen, Tasks, Stars Shop, Admin.
- Existing legal/support pages.
- Existing asset library where it still supports the direction.

Release 2 is not a reset of the business infrastructure. It is a rebuild of the gameplay core inside the working technology shell.

## What Must Change

The current product has too much gameplay logic inside `app.js`. Release 2 must move the product rules into a small core.

Target structure:

```text
game-core/
  config.js       # product constants, strains, recipes, currencies, prices
  state.js        # default state, migration, normalization
  economy.js      # currency rules, costs, reward validation helpers
  farm.js         # plant, boost, harvest, slot progress, drone effects
  lab.js          # inventory, formulas, reactor queue, claim, artifact results
  zen.js          # session flow, sound modes, DNA/energy rewards
  telemetry.js    # event names and payload contract
```

`app.js` should gradually become:

```text
UI renderer + Telegram adapter + server adapter
```

It should not remain the place where all product math is invented.

## Technology Principle

Keep the stack boring and reliable until the product proves the loop.

- Plain HTML/CSS/JS is acceptable for Release 2.
- No build system unless it clearly reduces complexity.
- No heavy WebGL or shader work for MVP.
- Canvas is allowed only where it gives a real product effect, such as Lab reaction energy or Zen breathing visuals.
- Visual effects must pause when the room is hidden.
- Server authority should increase step by step, starting with valuable rewards and paid entitlements.

Technical elegance here means fewer moving parts, stronger contracts, and easier debugging.

## Room Roles

### Farm

Farm is the entry game.

Purpose:

- Teach the player the product through action.
- Create immediate progress.
- Generate resources for Lab.
- Support Stars purchases naturally through slots, speed, capacity, and boosters.

Release 2 Farm must be obvious, fast, and satisfying. It should not require understanding Lab or Zen to feel good.

### Lab

Lab is the retention engine.

Purpose:

- Convert Farm output into artifacts.
- Make inventory visually meaningful.
- Create waiting, claiming, upgrading, and progression loops.
- Support multi-reactor capacity and Stars speed-up later.

Release 2 Lab must replace vague mutation clicks with a clear flow:

```text
choose formula -> see required inputs -> load reactor -> wait/progress -> claim artifact
```

CRC should not be a formula ingredient if the product decision says it is not used in synthesis. Stars may speed time or unlock reactor capacity, but paid value must be visible in Admin.

### Zen

Zen is a separate meditation product layer.

Purpose:

- Give the user a calm ritual, not just another resource screen.
- Create emotional differentiation from Telegram tap games.
- Later support premium sound, ritual, focus, and companion features.

Zen should not be forced into the first 30 seconds. It should open as a deeper experience after the player has a reason to care.

### Stars

Stars is the monetization layer.

Purpose:

- Sell time savings, capacity, premium access, and convenience.
- Never deliver paid value from frontend-only logic.
- Always write payment and entitlement signals into Admin.

Every Stars feature needs:

- product id
- price
- reward
- server confirmation path
- admin visibility
- refund/support implication

### Admin

Admin is the truth layer.

Purpose:

- Show all users.
- Show payments and Stars operations.
- Show room activity.
- Show inventory/progression when mechanics become serious.
- Help decide what to build next.

Admin is not decoration. It is how the product owner controls the business.

## Release 2 Phases

### Phase 0: Product Lock

Output:

- This mandate accepted.
- Farm/Lab/Zen roles frozen.
- Currencies and paid entitlements listed.
- First 30 seconds defined.

Definition of done:

- A new developer can explain the product in one minute.

### Phase 1: Core Skeleton

Output:

- `game-core/economy.js`
- `game-core/farm.js`
- `game-core/lab.js`
- `game-core/zen.js`
- `game-core/telemetry.js`
- No visible redesign required.

Definition of done:

- UI calls core helpers instead of inventing math inline for the first migrated mechanic.

### Phase 2: Farm First

Output:

- Clean slot model.
- Clean plant/harvest/boost rules.
- Farm rewards connected to inventory.
- Paid slots remain compatible with Stars.

Definition of done:

- A new user can play Farm without needing Lab explanation.

### Phase 3: Lab Reactor

Output:

- Inventory categories.
- Formula cards.
- Reactor queue.
- Claim result.
- Artifact inventory.
- Hooks for extra reactor modules and Stars speed-up.

Definition of done:

- The player visually understands what is missing, what is loaded, what is crafting, and what was created.

### Phase 4: Zen Ritual

Output:

- Zen session model.
- Sound/mode selection.
- Reward logic.
- Clear separation from Farm/Lab UI.

Definition of done:

- Zen feels like a calm premium space, not a leftover game tab.

### Phase 5: Server and Admin Truth

Output:

- Critical rewards validated or prepared for server validation.
- Admin sees users, payments, Stars, room activity, and key progression.
- Events are named consistently.

Definition of done:

- The owner can see if users are playing, paying, getting stuck, or abusing a flow.

## Non-Negotiable Rules

- Do not delete or replace Stars infrastructure during Release 2.
- Do not delete or replace Admin during Release 2.
- Do not start a full visual rewrite before Farm core is clean.
- Do not make Zen carry the first-time user experience.
- Do not add new paid mechanics without Admin visibility.
- Do not let visual effects create economy truth.
- Do not make the first screen explain the whole product.
- Do not expand `app.js` with new core mechanics unless it is a temporary bridge with a planned extraction.

## Quality Bar

Release 2 succeeds when the product feels technically simple from the inside and magical from the outside.

Code quality:

- small functions
- clear state shape
- named product rules
- predictable events
- visible errors
- no hidden reward paths

UX quality:

- visual first
- low text
- no noisy panels
- one clear action per moment
- readable on Telegram mobile
- strong progress feedback

Business quality:

- first action is obvious
- first reward is fast
- first purchase offer is understandable
- retention loop is visible
- Admin can prove what is happening

## Final Decision

The correct strategy is:

```text
Preserve infrastructure.
Replace gameplay core.
Simplify first experience.
Make Lab meaningful.
Let Zen become the premium emotional layer.
```

This is the Release 2 direction.
