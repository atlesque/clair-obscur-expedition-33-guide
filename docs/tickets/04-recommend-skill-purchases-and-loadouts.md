## Parent

[Specification #1 — Build a spoiler-free leveling companion with named playthroughs](https://github.com/atlesque/clair-obscur-expedition-33-guide/issues/1)

## What to build

A player tracking Gustave or Lune can optionally record unlocked skills and remaining skill points, receive a next-purchase or save-points recommendation, and see a useful skill loadout made only from owned skills. This extends the existing pending/confirm workflow through real skill choices.

Covers parent user stories 25–35, 43–49, 60. This is approved slice 4 of the implementation breakdown.

## Acceptance criteria

- [ ] Research the initial characters' skills, costs, prerequisites, equip limits, starting ownership, and visibility boundaries. Record sources and distinguish verified mechanics from editorial skill priorities.
- [ ] Offer skill setup with unlocked-skill selection and a player-entered unspent skill-point balance; do not infer all available skill points solely from level.
- [ ] Set up later preserves attribute guidance while withholding personalized skill purchases and loadouts. Completing skill setup later immediately enables relevant guidance.
- [ ] Display unpurchased skills only when already visible in the relevant in-game skill tree. Do not disclose story-dependent skills or future character information.
- [ ] Recommend an affordable unowned skill with satisfied prerequisites, or explicitly advise saving points. Do not purchase an owned skill or overspend.
- [ ] Recommend a legal skill loadout from the current unlocked set only. Distinguish ownership, a suggested loadout, and any recorded equipped loadout; equipping does not spend skill points.
- [ ] Skill purchase advice remains pending until the player confirms applying it in-game. Confirmation records ownership and remaining points once; loadout suggestions alone do not assert they were equipped.
- [ ] Allow correction of unlocked skills and remaining points, including different choices made in-game. Integrate with catch-up reconciliation if that workflow is already present.
- [ ] Demonstrate skipped setup → later completion → save-points advice → legal purchase confirmation → updated owned-skill loadout; test insufficient points, prerequisites, ownership, stale advice, and repeat confirmation.
- [ ] Deliver the complete behavior through the interface and local persistence, with browser-level acceptance coverage; use focused public-rule tests only when combinations justify them. Do not rely on live external sources during tests.
- [ ] Verify the slice at phone and desktop sizes with keyboard-accessible forms/dialogs and spoiler-safe accessible labels; the production build passes.
- [ ] Preserve existing saved progress, playthrough isolation, and pending-versus-applied semantics as later slices add fields or workflows.

## Blocked by

- [#3 — Guide and confirm attribute spending](https://github.com/atlesque/clair-obscur-expedition-33-guide/issues/3)

