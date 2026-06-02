# Lab Room Passport

## Role

Lab is the mutation, synthesis, and artifact room. It receives Farm output and turns it into rare, exciting results that later influence Zen and future collectible logic.

Lab should feel like a high-value reveal machine, not a normal upgrade screen.

## Current Elements

- Mutation screen inspired by biotech capsule reference
- Fusion process concept
- Mutation odds concept
- Stars confirm action concept
- Artifact result idea
- Unique mutation Stars test flow

## Adopted Blueprint Direction

Lab is a progression engine:

```text
collect capsule output
choose synthesis
insert resources/items
start process
wait or accelerate
claim unique result
use result in Farm / Zen / BioCards
```

The Lab should transform what the player grew into something more meaningful.

## First MVP Lab Scope

Build only a few controlled flows first:

- one tutorial synthesis
- one strain refinement
- one meditation artifact recipe
- one Stars acceleration or premium mutation product
- Lab Level 1-3 gates
- one event recipe mock

Avoid early:

- huge recipe tree
- marketplace
- complex crafting economy
- direct sale of final rare results

## Lab Outputs

Possible outputs:

- strains
- artifact fragments
- meditation artifacts
- capsule modules
- waste refinements
- rare recipe unlocks
- BioCard reveal moments

## Stars Boundary

Stars can:

- accelerate active synthesis
- unlock a premium mutation attempt
- unlock premium visual identity

Stars should not silently grant final rare results from the frontend.

## Stable Rules

- Lab must not be treated as a simple button screen.
- Mutation results must be server-controlled when they matter.
- Randomness must be logged.
- Paid mutation boosts must use confirmed Stars payments only.
- The Lab should feed Zen, not stay isolated.
- Heavy 3D/shader visuals are not MVP.

## Data To Save

- Mutation attempts
- Inputs consumed
- Synthesis process started/completed
- Result artifact
- Rarity
- Odds at the moment of mutation
- Payment boost used or not
- Lab level
- Recipe id
- Result visual seed later

## Admin Needs

- Mutation attempts by player
- Success/fail/result
- Rarity distribution
- Paid boost usage
- Artifact inventory history
- Failed grants or duplicate payment alerts
- Lab process duration and completion rate

## Next Useful Work

1. Define first 5 artifact types.
2. Define rarity levels.
3. Create server-side mutation/synthesis endpoint.
4. Show mutation history in Admin.
5. Connect one Lab artifact to Zen visual/reward effect.
