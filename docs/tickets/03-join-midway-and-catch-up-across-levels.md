## Parent

[Specification #1 — Build a spoiler-free leveling companion with named playthroughs](https://github.com/atlesque/clair-obscur-expedition-33-guide/issues/1)

## What to build

A player who starts using the guide partway through a playthrough, or returns after gaining several levels, can enter current progress and receive one combined attribute recommendation for the points still available. Players can record different actual choices instead of being forced back onto a prescribed allocation.

Covers parent user stories 18–21, 41–43, 47, 49. This is approved slice 3 of the implementation breakdown.

## Acceptance criteria

- [ ] Extend setup for initial characters to accept current level, actual invested attributes, and available attribute points, using verified validation rules and clear field errors.
- [ ] Accept a direct jump to a later current level per character without replaying intermediate level-ups. Do not change other characters' levels.
- [ ] Before generating advice, allow reconciliation of points spent outside the app. Only actual remaining balances can be recommended for spending.
- [ ] Generate one combined pending recommendation from the reconciled state. Existing investments are retained; no in-game reset is required.
- [ ] Allow players to record actual choices that differ from a pending recommendation, then recalculate future guidance from those choices.
- [ ] Correcting a level, allocation, or balance invalidates stale advice and cannot apply the same newly reported points more than once.
- [ ] Provide a coherent progress-correction flow that the skill-guidance ticket can extend to unlocked skills and skill balances when present; do not invent skill data before that feature is implemented.
- [ ] Demonstrate a mid-playthrough import and a level-10-to-level-16 catch-up with some points already spent, including reload and differing actual choices.
- [ ] Deliver the complete behavior through the interface and local persistence, with browser-level acceptance coverage; use focused public-rule tests only when combinations justify them. Do not rely on live external sources during tests.
- [ ] Verify the slice at phone and desktop sizes with keyboard-accessible forms/dialogs and spoiler-safe accessible labels; the production build passes.
- [ ] Preserve existing saved progress, playthrough isolation, and pending-versus-applied semantics as later slices add fields or workflows.

## Blocked by

- [#3 — Guide and confirm attribute spending](https://github.com/atlesque/clair-obscur-expedition-33-guide/issues/3)

