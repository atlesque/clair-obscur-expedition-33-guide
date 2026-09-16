# Core review record

Base: `b9296b3`  
Reviewed head: `fa2aba8`

## Standards

- The original `Guide.vue` combined setup, cards, guidance, progress, and reveal responsibilities, contrary to `docs/spec.md`'s focused component requirement. Resolved by extracting `SetupPanel.vue`, `CharacterCard.vue`, and `FocusDialog.vue`.
- Nested save records were only shallowly validated in `storage.ts`. Resolved with nested guards for playthroughs, characters, attributes, and pending recommendations; malformed raw storage remains untouched and blocks setup.
- Placeholder skill data violated the research requirement. Removed `src/domain/skills.ts`; the skill slice owns its sourced catalog separately.
- Editorial priorities are now named in `data.ts` with source notes and consumed by `rules.ts`.

## Spec

- Invalid progress submissions previously threw through the Vue event handler. Resolved by rendering an accessible `role=alert` error in the focused progress dialog.
- Failed writes previously left unsaved state visible. Mutations now snapshot and restore state on a failed save, preserving a truthful error.
- Dialogs now focus their first control, trap Tab navigation, inert the background, close on Escape, and restore focus to the invoking control.

Validation: `pnpm test`, `pnpm run typecheck`, and `pnpm run check` pass. The static build was attempted; Astro could not write its generated `.astro/content.d.ts` in this managed worktree.
