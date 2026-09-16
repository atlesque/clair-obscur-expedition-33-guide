## Parent

[Specification #1 — Build a spoiler-free leveling companion with named playthroughs](https://github.com/atlesque/clair-obscur-expedition-33-guide/issues/1)

## What to build

People sharing a device, or one person keeping multiple runs, can create additional named playthroughs and switch through the menu. The app remembers the last selection while keeping each run's progress and reveals independent.

Covers parent user stories 2–5, 55. This is approved slice 8 of the implementation breakdown.

## Acceptance criteria

- [ ] Create additional named playthroughs through the interface without overwriting existing ones; initialize each with its own character selection and independent state.
- [ ] Provide a menu option to switch playthroughs, using names to distinguish them. Use stable identifiers so matching names cannot accidentally merge records.
- [ ] Opening or reloading resumes the last selected playthrough and its party; do not add a mandatory launch picker.
- [ ] All currently supported character progress, optional inputs, skill records, and reveal/discovery state remain scoped to the selected playthrough. Subsequent features must preserve this contract.
- [ ] Switching clears open character-specific dialogs, unsaved display, and pending-recommendation display from the previous selection so no old-party content appears in the newly selected playthrough.
- [ ] Creating or switching a playthrough never imports another playthrough's discoveries. Existing saves from the single-playthrough slice remain readable.
- [ ] Demonstrate two playthroughs with different initial parties and progress, switching both directions and reloading into the last selection. Extend the same acceptance journey with reveals and skills when those features are available; they do not gate this ticket's initial delivery.
- [ ] Deliver the complete behavior through the interface and local persistence, with browser-level acceptance coverage; use focused public-rule tests only when combinations justify them. Do not rely on live external sources during tests.
- [ ] Verify the slice at phone and desktop sizes with keyboard-accessible forms/dialogs and spoiler-safe accessible labels; the production build passes.
- [ ] Preserve existing saved progress, playthrough isolation, and pending-versus-applied semantics as later slices add fields or workflows.

## Blocked by

- [#2 — Create and resume a playthrough](https://github.com/atlesque/clair-obscur-expedition-33-guide/issues/2)

