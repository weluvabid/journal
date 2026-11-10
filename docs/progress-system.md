# Progress without accounts

I wanted the site to remember what someone had read. I did not want to manage users.

The usual account lifecycle comes with password storage, login flows, sessions, email verification,
account recovery, user records, deletion requests, and the occasional "I changed my email address
and now I'm locked out" support adventure. I was not interested in signing up for that job.

So progress belongs to the browser instead. Open the site, read things, mark questions complete,
and the browser remembers. If you want to move that progress to another device, export a QR image
and import it there.

No account. No login. No progress API. No cloud sync pretending to be free.

## What gets tracked

There are two separate concepts:

1. **Completion:** a deliberate action by the reader using the "Mark as complete" control (or the
   `M` shortcut when the page supports it).
2. **Reading depth:** the furthest normalized position reached in an article.

Reaching the bottom of an article does not silently mark it complete. Reading and completion mean
different things, so the data model keeps them separate. Explicit completion also sets the saved
reading position to `65535`, the maximum representable position, so the two views stay consistent.

Reading position is an integer from `0` to `65535`. The UI converts it to a percentage for display.
This is compact, deterministic, and more than precise enough for a reading indicator.

A saved reading position is a maximum, not a scroll-restoration command. The current implementation
remembers how far down the article the reader got; it does not automatically jump the page back to
that exact scroll offset on the next visit.

## Where the data lives

The current storage key is:

```text
frontend-atlas:progress:v2
```

The stored JSON is a version-2 `ProgressSnapshot`:

```ts
interface ReadingProgress {
  position: number; // integer: 1..65535
  updatedAt: string; // ISO timestamp
}

interface ProgressSnapshot {
  version: 2;
  completed: string[]; // sorted, unique question IDs
  readingProgress: Record<string, ReadingProgress>;
  updatedAt: string; // ISO timestamp for the snapshot
}
```

The real TypeScript interfaces are readonly. The snippet above is the shape, not a recommendation to
mutate it.

`src/lib/progress/model.ts` owns snapshot creation, validation, normalization, and merging.
`src/lib/progress/storage.ts` owns browser storage access and migration. `src/lib/progress/service.ts`
is the mutation boundary used by the UI. `src/lib/progress/events.ts` handles notifications.

That separation matters: the UI should not need to know how legacy data is migrated or how a corrupt
snapshot is handled.

## Persistence and failure behaviour

`localStorage` is accessed lazily because merely reading `window.localStorage` can throw in restricted
browser contexts.

The storage layer distinguishes expected browser failures from unknown failures:

- A `SecurityError` or `QuotaExceededError` is treated as storage unavailable for the relevant
  operation.
- Invalid JSON or a malformed snapshot is reported as invalid data.
- Unexpected exceptions are allowed to propagate. They are not quietly converted into success.

When storage is unavailable, the service keeps a volatile snapshot in module memory so interactions
in the current page session can continue. The UI reports that the progress is available only in the
current tab/session. It is not durable: closing or reloading the page can discard it.

If saved data is malformed, ordinary save and merge operations refuse to overwrite it. This is
intentional. Silently replacing unreadable data with an empty snapshot would turn a recoverable
problem into data loss. The user can recover by importing a valid QR snapshot and choosing replace.

The current schema is version 2. A version-1 snapshot is accepted and normalized to version 2 on
read; the migrated value is written under the v2 key. Clearing progress removes both v1 and v2 keys.

## Merge rules

Import offers two explicit choices:

- **Merge:** combine the current and imported snapshots.
- **Replace:** replace the current snapshot with the imported one.

Merge is monotonic for completion and reading depth:

- A question completed in either snapshot remains completed.
- For a question with reading records in both snapshots, the greater `position` wins.
- A completion is normalized to position `65535`.
- A lower reading position never rolls a higher one backwards.

This is a maximum-progress merge, not a last-write-wins database. In particular, the timestamp
alone does not decide which reading position wins. If two records have the same position, the
existing record is retained.

There is no conflict-resolution UI because the current data model has a deliberately simple rule:
progress moves forward unless the reader explicitly chooses replace or clear.

## Reading-position write strategy

`ReadingProgress.svelte` measures article position on scroll and resize. It uses
`requestAnimationFrame` to coalesce measurements and a 1.2-second debounce before writing. It skips
small changes (less than 655 units, approximately one percent of the normalized range) to avoid
writing constantly while someone scrolls.

The component forces a final measurement/write when the document becomes hidden and on `pagehide`.
It also uses a monotonic maximum so scrolling back up does not erase the furthest position already
reached.

This keeps scroll handling cheap and avoids writing the full snapshot on every movement. As with
any debounced write, a sudden process kill before the next write or lifecycle flush can lose the
most recent small amount of reading progress.

## Same-tab and cross-tab updates

The progress service announces updates in the current tab with a custom
`frontend-atlas:progress-change` event. Other tabs receive the browser's native `storage` event when
the v2 or legacy key changes.

Subscribers receive an initial read and can unsubscribe during component teardown. This keeps the
progress controls, page indicators, and overview in sync without polling or a server-side pub/sub
system.

## Clearing progress

The Manage Progress dialog can clear local progress. This removes both known storage keys and
publishes an empty snapshot to current-tab subscribers. Clearing is destructive; there is no server
backup or account recovery. Export a QR image first if you want a portable backup.

## Relevant implementation

- `src/lib/progress/model.ts`
- `src/lib/progress/storage.ts`
- `src/lib/progress/service.ts`
- `src/lib/progress/events.ts`
- `src/components/progress/ReadingProgress.svelte`
- `src/components/progress/ProgressControl.svelte`
- `src/components/progress/ProgressOverview.svelte`
- `tests/progress.test.mjs`

The cross-device format is documented separately in [QR transfer protocol](progress-transfer-protocol.md).
