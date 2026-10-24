# Atlesque Play playthrough sync

The guide uses the existing Atlesque Play Worker and D1 database in `atlesque/mbp-games`.
Its client id is `expedition-33-guide`, registered in that service's `src/clients.js`.
No additional database or migrations are needed. Production origin: `https://coe33.atlesque.dev`.

Players open **Sign in → Sign in with Atlesque Play** and use the hosted email sign-in.
The callback uses PKCE and a random state, validates the pending request, and exchanges
its one-time code for an account token. Tokens stay out of query parameters. An unfinished
setup URL is restored after sign-in. Signing out keeps the local playthroughs.

Progress is always saved locally first. While signed in, edits are collected for 800 ms
and sent to `GET/PUT /api/games/expedition-33-guide/progress`. The account stores
`{ version: 1, save: SaveData | null }`. A null save represents deleting the last playthrough.
The service enforces account isolation and uses revisions to reject stale writes with 409.
The guide retries with a three-way merge against its last agreed save:

- Independent playthroughs combine.
- Changes on one device replace unchanged copies on another.
- Deletions remove unchanged copies; a concurrent edit is preserved.
- Different edits to the same playthrough preserve the cloud copy and a local version
  named “(recovered copy)” with a new id.

Requests are serialized within a tab. Edits made during a request remain queued. Other
devices are checked every 30 seconds and when a tab gains focus or comes online. Sync
waits while progress or expedition dialogs are open. Failed requests retain local saves
and retry. Authentication failures require signing in again. Remote data is validated
before it can replace local saves; failed browser-storage writes are reported.

A different account does not inherit another account's local data: a per-account browser
backup is retained before switching. Setup drafts remain in the URL and are not account
saves until a playthrough is created.

Validation: merge unit tests; desktop/phone browser tests with two independent browser
contexts and a revisioned mock endpoint; Atlesque Play's SQLite-backed API tests for
sign-in, CORS, private recovery, and stale-write rejection. The hosted sign-in UI sends
real email in production, so automated browser tests use a mocked code exchange.
