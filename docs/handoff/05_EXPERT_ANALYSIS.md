# Expert Analysis

## Are We Stuck?

Partly yes.

Not because the project is bad.

We are stuck because prototype layers are mixed:

- Visual experiments were built directly into the app.
- Mechanics were added directly into the same file.
- Server sync was added while mechanics were still changing.
- Stars and Admin were added before the economy model was fully clean.

This is normal for a prototype, but now the prototype has reached the point where it needs an architecture pass.

## What Is Valuable

The valuable parts are:

- The live Telegram/Render/GitHub path works.
- Stars flow exists.
- The current visual direction exists.
- The visual rooms exist.
- Farm/Lab/Zen are already connected conceptually.
- Server state exists.
- Admin exists.
- We now understand the real product:
  - game as entry point;
  - Zen/meditation as the real core product;
  - Farm and Lab as preparation layers for Zen.

## What Is Dangerous

The dangerous parts are:

- `app.js` is too large and mixed.
- More visual edits will keep increasing chaos.
- More mechanics directly inside `app.js` will become expensive.
- If Stars purchases are tied to unstable mechanics, future corrections become painful.
- If server logic trusts client values too much, cheating becomes easy later.

## Best Strategy

Use a two-layer strategy:

```text
Visual Shell = current project UI
Mechanical Core = clean rules extracted from donor/GDD
```

The UI should ask the core:

```text
What is this slot state?
Can this player plant?
Can this player harvest?
What does this recipe cost?
What does Zen reward?
What should be saved to server?
```

The UI should not decide the math itself.

## What To Transfer To New Chat

Transfer all of this:

- Current repo path.
- Production URL.
- Current deployed commit.
- Current visual shell freeze.
- Donor mechanics file path.
- GDD file path.
- This handoff folder.
- Rule: no visual replacement.
- Rule: no deploy without direct approval.

## Best Next Technical Move

Create a small core module first.

Do not split everything at once.

Recommended first concrete task:

```text
Create game-core/config.js and game-core/farm.js.
Move FARM_STRAINS, slot normalization, slot progress, plant/boost/harvest reward math there.
Keep app.js rendering the same UI.
Run node --check and local API test.
No deploy until confirmed.
```

This gives us a clean base without breaking the visual shell.

