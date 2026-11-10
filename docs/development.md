# Running and changing the project

This page covers the local toolchain and where the main pieces live. The architecture and content
documents explain the deeper implementation details.

## Toolchain

The repository pins:

- Node.js `26.13.0` in `.node-version`.
- pnpm `12.0.0` through the `packageManager` field.

Install the exact toolchain before debugging dependency or build behaviour. The lockfile is
committed and CI installs with `--frozen-lockfile`.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

## Scripts

```sh
pnpm dev          # Astro development server
pnpm build        # Static production build
pnpm preview      # Preview dist/
pnpm typecheck    # Astro diagnostics
pnpm lint         # ESLint, no warnings allowed
pnpm lint:fix     # Apply ESLint fixes where possible
pnpm test         # Node.js test suite
pnpm format       # Format supported files
pnpm format:check # Verify formatting
pnpm check        # Full quality gate and production build
```

`pnpm check` runs lint, Prettier validation, Astro diagnostics, tests, and the production build.
It is the check used by CI and the pre-commit hook.

## Adding a question

See [Content architecture](content-architecture.md) for the full schema and identity rules. The
short checklist:

1. Add an MDX file under the appropriate `src/content/questions/` domain.
2. Validate the frontmatter against `src/content.config.ts`.
3. Use a new immutable kebab-case ID.
4. Append the ID to `src/data/question-manifest.ts` without moving existing entries.
5. Check prerequisites and related references.
6. Run `pnpm check`.

## Changing progress behaviour

Progress has a few boundaries that should stay intact:

- Keep snapshot validation and normalization in `src/lib/progress/model.ts`.
- Keep browser storage access and legacy migration in `storage.ts`.
- Route mutations through `service.ts`.
- Use `events.ts` for same-tab and cross-tab notifications.
- Keep QR encoding/decoding in `qr.ts`, separate from the dialog UI.
- Update tests when changing schema, merge semantics, or the transfer format.

A progress schema change may require a storage migration. A QR format change may require a wire
format version bump. Those are separate compatibility concerns; do not bump one just because the
other changed.

The manifest order is part of the QR protocol. Never reorder or reuse existing IDs.

## Tests

Tests use Node's built-in test runner and import the TypeScript source through Node's type-stripping
support. They cover content validation, graph rules, search ranking, keyboard sequence helpers,
article swipe direction, progress storage/model behaviour, and QR round-trips and corruption cases.

## CI and deployment

`.github/workflows/ci.yml` runs `pnpm check` for pushes and pull requests targeting `main`.
`.github/workflows/deploy.yml` runs the same quality gate, builds with the GitHub Pages base path,
and deploys the `dist/` artifact to GitHub Pages.

Both workflows use pinned action SHAs where shown in the workflow files, Node from `.node-version`,
and the frozen pnpm lockfile.
