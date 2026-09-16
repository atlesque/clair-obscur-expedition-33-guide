# Spoiler-conscious leveling companion — MVP build plan

Status: shared understanding confirmed by the user; synthesized into the [MVP specification](spec.md). This plan implements the [accepted product decisions](product-decisions.md), using the [domain glossary](../CONTEXT.md). Application implementation has not started.

## Intended experience

Create a named playthrough and select the initial characters already encountered. Add other characters individually through the anonymous warning, explicit reveal, and separate add action. Set each tracked character's current level and attribute investments, with optional skill and weapon-scaling setup.

The party view shows tracked characters and a permanent generic add action. A character's guidance explains where to spend available attribute points, which skill to unlock next or save toward, and which owned skills to equip. The only build targets a forgiving first playthrough. Existing investments are respected.

Players can report one or several new levels and correct their recorded choices and point balances. Advice stays pending until confirmed; viewing it never spends recorded points. Reopening resumes the last playthrough. A menu supports switching or creating named playthroughs, restoring removed characters, and resetting a playthrough.

## Technical approach

Use Astro for a static page with a Vue application composed of small components for setup, party cards, character guidance, reveal dialogs, and playthrough management. Use Tailwind for styling and TypeScript for game data and progression rules. Astro's [official Vue integration](https://docs.astro.build/en/guides/integrations-guide/vue/) supports rendering and client-side hydration of Vue components.

Keep game data, recommendation rules, saved-state handling, and interface components separate. Store named playthroughs and the last selected playthrough locally, with a versioned save format and validation. No database, account system, or runtime AI service is needed. Show a clear save failure if browser storage cannot be written; do not silently discard saved data.

All visible character and skill information must respect the selected playthrough's reveal state, including dialogs, accessibility labels, and initial rendering. Switching playthroughs must clear any open character-specific dialogs and pending display from the previous playthrough. Do not generate a public full-roster page or render hidden identities into the initial page.

## Research before encoding recommendations

Verify character introduction order, starting allocations, level limits, attribute caps and scaling, point acquisition, skill costs and prerequisites, equip limits, and any character-specific progression rules. Do not assume every character gains skills in the same way. Keep spoilers out of user-facing research summaries.

Record sources alongside the game data. Separate verified mechanics from editorial build recommendations. Author a survivability-focused attribute strategy and skill priorities for each character; adapt them to actual investments and optional scaling inputs. Do not infer all available skill points from character level alone. Use entered point balances to reconcile progress.

Verify which skills are visible on joining and which require later discovery. Recommendations must obey the accepted visibility boundary and must not depend on undisclosed characters or future equipment. Level-one setup defaults must be verified rather than assuming every starting value is zero. If a mechanic cannot be verified, resolve it before presenting precise spending instructions that rely on it.

## Verification

- Check that recommendations respect available points, attribute caps, owned skills, prerequisites, and equip limits, including saving points when appropriate.
- Check that recommendations do not mutate actual allocations until confirmed, cannot be applied twice, and are recalculated when their inputs change.
- Check direct multi-level updates and reconciliation after spending points outside the app.
- Check persistence after reload, reopening the last playthrough, independent reveal states, and removal/restoration without losing character progress.
- Check that resetting affects only the selected playthrough, including its removed characters and reveal state.
- Exercise reveal cancellation before and after identity disclosure, restoring removed characters, and the final reveal state without roster totals or changing the add control.
- Verify setup and daily use in the browser at phone and desktop sizes, with keyboard-accessible forms and dialogs, then run the production build.

## Delivery

Provide a working local preview and the verified static build. Record any material limitations in recommendation coverage. Public hosting can be selected separately; it is not needed to establish that the MVP works.
