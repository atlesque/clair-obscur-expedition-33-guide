# Skills and scaling review

Initial review: `c7d34f6...1386668`. Final follow-up: `1386668...c72785c`.
Two independent Luna agents reviewed Standards and Spec in parallel.

## Standards

Final result: no actionable findings. Optional persistence validation covers
skill, loadout, discovery, and scaling records, cross-field invariants, and
legacy pending advice. UI updates use transactional snapshots. Purchase
confirmation checks actual points, ownership, prerequisites, cost, visibility,
and revision. Compact component code remains a maintainability judgment rather
than a documented-standard violation.

Follow-up review confirms weighted deficit targeting and normalized editorial
scaling bonuses preserve meaningful catch-up priorities. Ordinary loadouts are
strictly filtered through catalog visibility and ownership; the manual fallback
is limited to the learned-acquisition path. Regression tests cover both fixes.
Hydration and responsive presentation changes introduce no correctness finding.

## Spec

Final result: no actionable findings. Optional setup, later completion, pending
purchase confirmation, actual ownership, separate recorded loadouts, generic
weapon scaling, explicit discovery, and acquisition exceptions match the
specified workflows. Corrections, removal/restoration, reset, and switching
preserve actual-versus-pending semantics and independent playthrough records.

Follow-up review confirms large catch-up recommendations preserve actual
investments and caps, scaling alters priorities without claiming a damage
formula, and hidden ordinary skills cannot be suggested through a fallback.
Research notes state community-source and manually entered skill limitations.

## Verification

- 50 browser cases across desktop and phone pass.
- 20 public-rule tests pass, including the inherited attribute suite.
- Type checking and Astro checks pass with no diagnostics.
- Static production build passes.
- In-app visual checks covered phone attribute cards, dialog scrolling, control
  contrast, and keyboard focus restoration.

Final totals: Standards 0 actionable findings; Spec 0 actionable findings.
