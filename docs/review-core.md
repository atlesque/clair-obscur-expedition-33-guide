# Core review record

Base: `b9296b3`  
Reviewed head: `7c9e732` plus the follow-up fixes in this branch

## Standards

- The original `Guide.vue` combined setup, cards, guidance, progress, and reveal responsibilities, contrary to `docs/spec.md`'s focused component requirement. Resolved by extracting `SetupPanel.vue`, `CharacterCard.vue`, and `FocusDialog.vue`.
- Nested save records were only shallowly validated in `storage.ts`. Resolved with nested guards for playthroughs, characters, attributes, and pending recommendations; malformed raw storage remains untouched and blocks setup.
- Placeholder skill data violated the research requirement. Removed `src/domain/skills.ts`; the skill slice owns its sourced catalog separately.
- Editorial priorities are now named in `data.ts` with source notes and consumed by `rules.ts`.

## Spec

- Invalid progress submissions previously threw through the Vue event handler. Resolved by rendering an accessible `role=alert` error in the focused progress dialog.
- Failed writes previously left unsaved state visible. Mutations now snapshot and restore state on a failed save, preserving a truthful error.
- Dialogs now focus their first control, trap Tab navigation, inert the background, close on Escape, and restore focus to the invoking control.
- Progress forms use explicit domain validation with `novalidate`, so invalid values consistently render the accessible inline error instead of being intercepted by native browser validation.
- Pending advice can be dismissed and that dismissal persists. Later-character setup cancellation clears the candidate state, and deselecting a midway character discards its draft so a later re-selection starts from defaults.
- Extracted component styling restores readable headings, stat grids, controls, and modal contrast after the Tailwind reset.

Validation: `pnpm test`, `pnpm run typecheck`, `pnpm run check`, `pnpm run build`, and `pnpm run test:browser` pass. Browser coverage runs 28 cases across desktop and phone projects, including invalid progress, advice dismissal persistence, later-character cancellation, midway draft reset, and restoration of verified defaults when midway setup is turned off.
