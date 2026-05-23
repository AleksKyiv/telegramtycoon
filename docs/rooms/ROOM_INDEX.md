# Room Index

This is the room-level structure for the project.

```mermaid
flowchart LR
  Farm["Farm: grow resources"] --> Lab["Lab: mutate artifacts"]
  Lab --> Zen["Zen: meditate and generate core energy"]
  Tasks["Tasks: earn starter bonuses"] --> Farm
  Stars["Stars Shop: paid boosts and unlocks"] --> Farm
  Stars --> Lab
  Admin["Admin: control and analytics"] --> Farm
  Admin --> Lab
  Admin --> Zen
  Admin --> Stars
```

## Passports

- [Farm](FARM.md)
- [Lab](LAB.md)
- [Zen](ZEN.md)
- [Tasks](TASKS.md)
- [Stars Shop](STARS_SHOP.md)
- [Admin](ADMIN.md)

## Room Rule

One task should usually touch one room. If it touches two or more rooms, it becomes a system task and needs a smaller scope.

