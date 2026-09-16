## Parent

[Specification #1 — Build a spoiler-free leveling companion with named playthroughs](https://github.com/atlesque/clair-obscur-expedition-33-guide/issues/1)

## What to build

A player can use the skill setup, purchase guidance, and owned-skill loadout workflow for any deliberately added character, with researched character-specific progression behavior and explicit discovery gates for story-dependent skills.

Covers parent user stories 25–35, 43–49, 60. This is approved slice 7 of the implementation breakdown.

## Acceptance criteria

- [ ] Research and record skill costs, prerequisites, equip limits, ownership/acquisition rules, and visibility conditions for subsequently added characters. Do not assume all characters obtain skills through the same mechanism.
- [ ] Extend optional skill setup and honest incomplete-setup states to each added character using the inputs that their verified progression actually requires.
- [ ] Provide forgiving purchase/save advice where applicable and legal loadouts drawn from actually owned skills. For different acquisition mechanics, show the appropriate supported action rather than inventing a skill-point purchase.
- [ ] Show skills already visible in the character's in-game skill tree even when unpurchased. Keep story-dependent identities and descriptions hidden until explicit confirmation of discovering the relevant content.
- [ ] Make discovery confirmation itself spoiler-safe: no future skill names, counts, or story details before consent. Persist discovery state within that playthrough.
- [ ] Use actual available points and ownership; respect prerequisites, limits, and discovered content. Do not depend on undisclosed party members or future equipment.
- [ ] Corrections and confirmed actions update actual state once and invalidate stale advice. Newly recorded skill data works with existing catch-up, removal, restoration, and switching workflows when those are present.
- [ ] Demonstrate each researched progression pattern end-to-end, using representative fixtures for normal purchases, saving points, story discovery gates, and any acquisition exceptions. Include reload and ensure unowned skills never appear as immediately equippable.
- [ ] Provide source-backed coverage for every deliberately addable character without revealing the roster in user-facing summaries; report material verification limitations rather than filling gaps with invented rules.
- [ ] Deliver the complete behavior through the interface and local persistence, with browser-level acceptance coverage; use focused public-rule tests only when combinations justify them. Do not rely on live external sources during tests.
- [ ] Verify the slice at phone and desktop sizes with keyboard-accessible forms/dialogs and spoiler-safe accessible labels; the production build passes.
- [ ] Preserve existing saved progress, playthrough isolation, and pending-versus-applied semantics as later slices add fields or workflows.

## Blocked by

- [#5 — Recommend skill purchases and loadouts](https://github.com/atlesque/clair-obscur-expedition-33-guide/issues/5)
- [#7 — Reveal and add later characters safely](https://github.com/atlesque/clair-obscur-expedition-33-guide/issues/7)

