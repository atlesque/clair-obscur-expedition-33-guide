## Parent

[Specification #1 — Build a spoiler-free leveling companion with named playthroughs](https://github.com/atlesque/clair-obscur-expedition-33-guide/issues/1)

## What to build

A player can correct the tracked party by hiding a character and later restoring their recorded progress. They can also reset one selected playthrough, including removed records and discovery state, without affecting other runs.

Covers parent user stories 50–54, 55. This is approved slice 9 of the implementation breakdown.

## Acceptance criteria

- [ ] Remove a tracked character from the visible party while retaining that character's level, attribute allocation, available points, and any saved skill/loadout/scaling records in the same playthrough.
- [ ] Restore a removed character through the interface with their saved progress rather than asking the player to enter it again. Do not create duplicate character records.
- [ ] Removal and restoration do not advance recruitment or automatically reveal another character. The permanent add control and no-count rules continue to hold.
- [ ] Retain removed-character progress across reloads and playthrough switches. Removed status does not make that record accessible through another playthrough.
- [ ] Resetting the selected playthrough clears its progress, retained removed records, and reveal/discovery state, returning it to fresh setup. No other playthrough is changed.
- [ ] Reset and restoration clear stale dialogs and pending advice that reference discarded or changed state. Any later optional character fields inherit the same retention/reset behavior.
- [ ] Demonstrate remove → reload → restore with actual progression, and a reset beside an independent playthrough whose progress and reveals stay intact.
- [ ] Include empty-visible-party and reset-after-removal cases, verifying no hidden record resurfaces after the reset and no next-character identity is exposed by the correction.
- [ ] Deliver the complete behavior through the interface and local persistence, with browser-level acceptance coverage; use focused public-rule tests only when combinations justify them. Do not rely on live external sources during tests.
- [ ] Verify the slice at phone and desktop sizes with keyboard-accessible forms/dialogs and spoiler-safe accessible labels; the production build passes.
- [ ] Preserve existing saved progress, playthrough isolation, and pending-versus-applied semantics as later slices add fields or workflows.

## Blocked by

- [#7 — Reveal and add later characters safely](https://github.com/atlesque/clair-obscur-expedition-33-guide/issues/7)
- [#9 — Switch between independent playthroughs](https://github.com/atlesque/clair-obscur-expedition-33-guide/issues/9)

