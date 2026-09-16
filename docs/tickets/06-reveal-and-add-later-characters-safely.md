## Parent

[Specification #1 — Build a spoiler-free leveling companion with named playthroughs](https://github.com/atlesque/clair-obscur-expedition-33-guide/issues/1)

## What to build

A player can deliberately reveal and add later characters one at a time, enter their actual progress, and receive researched attribute guidance without learning future identities or the roster size. This connects recruitment consent to the already working setup and recommendation loop.

Covers parent user stories 8–16, 18–24, 60. This is approved slice 6 of the implementation breakdown.

## Acceptance criteria

- [ ] Research the introduction order and attribute-progression/default rules for later characters without publishing their identities or the total count in the issue, summaries, or anonymous interface.
- [ ] The generic add control first opens an anonymous warning advising continuation only if someone new has joined. No identity, portrait, identifying silhouette, or count appears before explicit Reveal character consent.
- [ ] After consent, reveal only the next character. Add to playthrough is a separate action that initializes tracking through the current-progress setup flow.
- [ ] Cancellation before reveal discloses nothing. Cancellation after reveal adds nothing and retains the same next candidate rather than silently skipping ahead.
- [ ] Newly added characters can enter current level, investments, and remaining attribute points and receive a researched forgiving attribute recommendation that respects their actual state.
- [ ] Store reveal/addition progression per playthrough. Do not equate the next introduction with the current number of visible party cards.
- [ ] Keep the same generic add control at the terminal state; explain that no further character is available only after the normal reveal consent. Never show full-roster, remaining-count, or completion indicators.
- [ ] Guard initial rendering, visible and accessible labels, and dialogs. Do not render unrevealed identities into the initial page or expose a full-roster page.
- [ ] Demonstrate sequential additions, both cancellations, reload during the flow, setup of a newly added character, and the terminal state. Unsupported personalized skill advice stays withheld until the later-character skill ticket supplies verified rules.
- [ ] Deliver the complete behavior through the interface and local persistence, with browser-level acceptance coverage; use focused public-rule tests only when combinations justify them. Do not rely on live external sources during tests.
- [ ] Verify the slice at phone and desktop sizes with keyboard-accessible forms/dialogs and spoiler-safe accessible labels; the production build passes.
- [ ] Preserve existing saved progress, playthrough isolation, and pending-versus-applied semantics as later slices add fields or workflows.

## Blocked by

- [#4 — Join midway and catch up across levels](https://github.com/atlesque/clair-obscur-expedition-33-guide/issues/4)

