## Parent

[Specification #1 — Build a spoiler-free leveling companion with named playthroughs](https://github.com/atlesque/clair-obscur-expedition-33-guide/issues/1)

## What to build

A player can open the static companion, create a named playthrough, choose Gustave and/or Lune, and return to the same saved party after a reload. This first usable slice establishes Astro with Vue, Tailwind, and TypeScript as part of that end-to-end experience; it does not stop at scaffolding. Later tickets add recommendations and additional playthroughs.

Covers parent user stories 1, 2, 6, 7, 17, 55–59. This is approved slice 1 of the implementation breakdown.

## Acceptance criteria

- [ ] On first use, create a named playthrough and select the initial characters to track. Offer no later identities, total roster size, or remaining-character clues.
- [ ] Research and document sources for the initial characters' starting values. Supply verified level-one defaults without manual allocation entry; do not assume all values are zero.
- [ ] Show the selected party with each tracked character's recorded starting level and attributes. Reserve a generic anonymous add affordance without pretending later-character recruitment works before its ticket lands.
- [ ] Use stable playthrough and character identifiers and a versioned, validated local save. Support an active-playthrough concept so additional independent playthroughs can be introduced without replacing existing saves.
- [ ] Reloading restores the selected playthrough, name, and party without flashing unrevealed character content. Empty storage opens setup.
- [ ] An unsuccessful write produces a clear save failure, not a saved-success claim. Malformed or unsupported saved data is handled without silently erasing the original record.
- [ ] Keep domain data, progression behavior, saved-state handling, and Vue presentation cohesive and separate. Do not add a database, account system, runtime AI, or public hosting dependency.
- [ ] Demonstrate setup → save → reload with researched defaults, plus unwritable storage and malformed-save scenarios.
- [ ] Deliver the complete behavior through the interface and local persistence, with browser-level acceptance coverage; use focused public-rule tests only when combinations justify them. Do not rely on live external sources during tests.
- [ ] Verify the slice at phone and desktop sizes with keyboard-accessible forms/dialogs and spoiler-safe accessible labels; the production build passes.
- [ ] Preserve existing saved progress, playthrough isolation, and pending-versus-applied semantics as later slices add fields or workflows.

## Blocked by

None — can start immediately.

