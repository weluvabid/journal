# Frontend Atlas

A field guide to frontend engineering. Fewer questions, better explanations, and a bias toward
understanding why the browser does what it does.

Frontend Atlas is an open-source collection of questions and explanations covering JavaScript,
browser internals, CSS, UI architecture, accessibility, performance, and frontend system design.
It is built as a static Astro site, with a small amount of Svelte where the page needs to be
interactive.

I wanted a useful handbook. I did not want to accidentally create a SaaS product with user
accounts, password resets, email verification, sessions, and a database to babysit. That decision
shaped quite a bit of the architecture. The progress system, for example, works without accounts
and can move between devices using a QR image.

## Have a look

**Live site:** <https://weluvabid.github.io/frontend-atlas/>

**Source:** <https://github.com/weluvabid/frontend-atlas>

## What is in here?

- Eight topic areas covering the frontend stack, from language fundamentals to system design.
- Carefully selected questions with explanations, examples, prerequisites, and related topics.
- Search across the handbook, with ranking performed in the browser after the index loads.
- Reading progress and explicit completion tracking stored locally in the browser.
- QR export/import so progress can be moved between devices without signing in.
- Keyboard shortcuts, article navigation, light/dark themes, and responsive layouts.

The goal is not to collect the largest possible pile of interview questions. Each article should
help explain what is happening, why it happens, where the edge cases live, and what trade-offs show
up in real software.

## A few decisions worth a look

- **No accounts.** I wanted to avoid the entire user-management lifecycle. Progress stays in the
  browser; QR transfer handles the occasional device change.
- **Static-first.** The handbook is content. It does not need a server rendering every page on every
  visit. Astro builds the pages ahead of time and ships HTML.
- **A stable question manifest.** Progress exports refer to question IDs in a fixed order. Moving
  those IDs around would make old QR exports lie about what someone completed. So the manifest is
  append-only.
- **Monochrome UI.** I am extremely picky about colour. There are roughly 16.7 million RGB colours
  to audition, and I would rather not spend the project choosing one. Monochrome won.

These are the decisions that most visibly shaped the project. The [architecture notes](docs/architecture.md)
show how the pieces fit together, and the [decision records](docs/decisions/) go deeper into the
trade-offs.

## What's next?

A few ideas are rattling around: favourites, learning paths, progress-aware discovery, and a way to
pick a random question when you cannot decide what to read. Nothing is scheduled; I'm mostly curious
which of these would be useful beyond my own browser. The [longer list](docs/whats-next.md) has the
current thinking.

## Run it locally

### Requirements

- Node.js `26.13.0` (see `.node-version`).
- pnpm `12.0.0` (pinned in `package.json`).

### Setup

```sh
git submodule update --init --recursive
pnpm install --frozen-lockfile
pnpm dev
```

The committed lockfile is the source of truth for the dependency graph. Use
`pnpm install --frozen-lockfile` rather than casually regenerating it.

### Useful commands

| Command             | What it does                                                  |
| ------------------- | ------------------------------------------------------------- |
| `pnpm dev`          | Start the Astro development server.                           |
| `pnpm build`        | Build the static site into `dist/`.                           |
| `pnpm preview`      | Preview the production build locally.                         |
| `pnpm typecheck`    | Run Astro diagnostics.                                        |
| `pnpm lint`         | Run ESLint with warnings treated as errors.                   |
| `pnpm test`         | Run the Node.js test suite.                                   |
| `pnpm format`       | Format supported project files.                               |
| `pnpm format:check` | Check formatting without changing files.                      |
| `pnpm check`        | Run lint, formatting, typecheck, tests, and production build. |

## Adding content

Questions live in `src/content/questions/`, grouped by domain. Each article is an MDX file whose
frontmatter is validated by `src/content.config.ts`.

When adding a question:

1. Add the MDX file under the correct domain directory.
2. Give it a unique, lowercase kebab-case `id`.
3. Fill in the required metadata and follow the existing article structure.
4. Add its ID to the **end** of `src/data/question-manifest.ts`.
5. Update prerequisites/related references if needed, and make sure every referenced ID exists.
6. Run `pnpm check`.

Question IDs are immutable. Manifest entries are append-only: do not reorder, reuse, or remove a
slot, even if an article is retired. The manifest has a hard limit of 150 questions because the QR
transfer format is deliberately bounded.

The content tests enforce metadata, article structure, relationship integrity, manifest coverage,
and the editorial cap. See [Content architecture](docs/content-architecture.md) before changing
how articles are identified or loaded.

## Documentation

- [Architecture](docs/architecture.md)
- [Progress system](docs/progress-system.md)
- [QR transfer protocol](docs/progress-transfer-protocol.md)
- [Content architecture](docs/content-architecture.md)
- [Performance](docs/performance.md)
- [Accessibility and keyboard navigation](docs/accessibility.md)
- [Security and privacy](docs/security-and-privacy.md)
- [Development](docs/development.md)
- [What's next?](docs/whats-next.md)
- [Architecture decision records](docs/decisions/)

## Licenses

- Application source code: [MIT](LICENSE).
- Original educational articles: [CC BY 4.0](CONTENT-LICENSE.md).
- Third-party dependencies and separately identified third-party material retain their own
  licenses.
