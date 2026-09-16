## Parent

[Specification #1 — Build a spoiler-free leveling companion with named playthroughs](https://github.com/atlesque/clair-obscur-expedition-33-guide/issues/1)

## What to build

For Gustave and Lune, a player can report a single level-up, see a forgiving recommended attribute allocation with a short explanation, apply it in-game, and then confirm it in the companion. The recommendation is useful and researched, while recorded spending remains unchanged until confirmed.

Covers parent user stories 20–24, 40, 44–46, 48, 49, 60. This is approved slice 2 of the implementation breakdown.

## Acceptance criteria

- [ ] Research attribute meanings, point acquisition, verified limits/caps, and initial-character progression. Record sources and separate verified mechanics from editorial recommended-build priorities.
- [ ] Provide exactly one recommended build per initial character, balancing survivability and reliable damage. No alternative-build selector or unsupported optimality claim.
- [ ] Record a character's single-level update and available attribute balance, then recommend legal spending within that balance and verified caps. Preserve existing investments.
- [ ] With no points available, explain that there is nothing to allocate. When a cap or other verified limit constrains spending, never invent an illegal allocation.
- [ ] Explain why the suggested allocation helps. State that general advice does not yet account for equipped-weapon scaling.
- [ ] Viewing, dismissing, or reloading a pending recommendation does not spend recorded points. The player can return and regenerate the advice from saved actual progress.
- [ ] An I've applied these action records the allocation and updates the available balance once. Repeated confirmation cannot spend twice.
- [ ] Changing relevant progress invalidates or recalculates a pending recommendation; an old plan cannot overwrite newer actual state.
- [ ] Demonstrate level-up → pending advice → reload without spending → confirmation → reload with updated actual values. Include legal caps, zero points, and duplicate confirmation.
- [ ] Deliver the complete behavior through the interface and local persistence, with browser-level acceptance coverage; use focused public-rule tests only when combinations justify them. Do not rely on live external sources during tests.
- [ ] Verify the slice at phone and desktop sizes with keyboard-accessible forms/dialogs and spoiler-safe accessible labels; the production build passes.
- [ ] Preserve existing saved progress, playthrough isolation, and pending-versus-applied semantics as later slices add fields or workflows.

## Blocked by

- [#2 — Create and resume a playthrough](https://github.com/atlesque/clair-obscur-expedition-33-guide/issues/2)

