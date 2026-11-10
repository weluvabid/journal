# 0004 — Make question IDs immutable and the manifest append-only

- **Status:** Accepted
- **Date:** 2026-11-07

## Context

Progress records and QR exports refer to questions by stable identity. The QR format stores indexes
into an ordered manifest rather than repeating every question ID.

If an existing manifest entry moves, an old export could point at a different question. That would
be worse than rejecting the import: it would silently attach someone's progress to the wrong
article.

## Decision

Every question gets an immutable lowercase kebab-case ID. The ordered manifest in
`src/data/question-manifest.ts` is append-only. New IDs go at the end. Existing slots are never
reordered, reused, or removed. Retired questions keep their slot.

The build verifies that the manifest contains every current question exactly once and stays within
the 150-question cap.

## Consequences

- Article URLs remain stable when filenames or content organization change.
- Progress and relationships can use IDs rather than display titles.
- QR exports from an older manifest prefix can still be decoded after new questions are appended.
- Removing or reordering an ID is a data/protocol migration, not housekeeping.
- The manifest is a small maintenance constraint we accept to avoid silent data corruption.
