# Development

Requirements: Node.js 26 LTS and pnpm 12.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

## Quality gates

```sh
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm build
```

Run all checks with `pnpm check`.

## Adding a journal entry

Create an MDX file under `src/content/journal/` and follow the schema in `src/content.config.ts`. Keep IDs stable once published. Use `draft: true` to exclude an entry from generated public routes and search.

## Adding a project

Create the canonical project article as an MDX file under `src/content/journal/`. Set `kind: project`, a stable `project` ID, the `project` tag, and `projectDetails` (status, stack, repository links, curated resources and display order). Related engineering notes use the same `project` ID with `kind: article`; do not duplicate project metadata. The Projects archive and article-end resource section are generated from the canonical entry.

## Submodule

The `brand/me` submodule is retained. Clone with `--recurse-submodules`, or run `git submodule update --init --recursive`.
