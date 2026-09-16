## Parent

[Specification #1 — Build a spoiler-free leveling companion with named playthroughs](https://github.com/atlesque/clair-obscur-expedition-33-guide/issues/1)

## What to build

A player can enter or update the equipped weapon's scaling attributes and letter grades and receive attribute advice informed by those inputs. Players who skip the step still receive clear general guidance, without browsing a weapon catalogue.

Covers parent user stories 36–39, 49, 60. This is approved slice 5 of the implementation breakdown.

## Acceptance criteria

- [ ] Research scaling behavior relevant to the accepted attribute/letter-grade inputs and document the supported assumptions. Do not treat the inputs as a full equipment optimizer.
- [ ] Offer optional, validated scaling-attribute and grade inputs using only generic attribute labels and grades, with no named weapon catalogue or future equipment details.
- [ ] Save scaling inputs per tracked character within the selected playthrough and restore them after reload.
- [ ] Use provided scaling inputs to inform the forgiving attribute recommendation while preserving existing investments, available-point limits, and caps.
- [ ] Show a concise explanation of the scaling-informed recommendation. When inputs are absent, clearly state that equipped-weapon scaling is not considered.
- [ ] Allow editing or clearing inputs when a weapon changes; immediately invalidate or recalculate stale advice without changing actual invested points.
- [ ] Demonstrate at least one independently researched case in which scaling inputs change appropriate attribute advice, plus skipped inputs, corrected inputs, and reload persistence.
- [ ] Deliver the complete behavior through the interface and local persistence, with browser-level acceptance coverage; use focused public-rule tests only when combinations justify them. Do not rely on live external sources during tests.
- [ ] Verify the slice at phone and desktop sizes with keyboard-accessible forms/dialogs and spoiler-safe accessible labels; the production build passes.
- [ ] Preserve existing saved progress, playthrough isolation, and pending-versus-applied semantics as later slices add fields or workflows.

## Blocked by

- [#3 — Guide and confirm attribute spending](https://github.com/atlesque/clair-obscur-expedition-33-guide/issues/3)

