# Playthrough management review

## Spec

- **P1, resolved:** A failed save while adding a revealed character could leave the setup dialog open without its candidate marker. A retry then treated the candidate as an existing character and never appended it. `submitProgress` now retains the candidate state until persistence succeeds, allowing a retry to append exactly once and advance reveal state once.
- **P2, resolved:** Reset, restoration, and switching now clear setup and reveal dialog references after a successful persistence operation. Failed writes retain the prior state and keep the management dialog available for retry.

## Validation

The core browser suite includes a regression for a one-time failed save during later-character setup, followed by retry, reload, and verification that the next reveal advances exactly once. Type checking and diff checks were run; repository generated test-cache permissions prevented a clean local Playwright/Vitest completion in this worktree.

## Standards

- **Optional character fields:** downstream persistence validation accepts and preserves skill setup, unlocked skills, skill points, loadout, and scaling fields; validated by `5f5d88c` and its 10 focused tests.
- **Independent records:** playthrough creation now deep-clones character records so later mutations cannot leak between runs; fixed by `ba017fb` and covered by its 10 focused tests.
