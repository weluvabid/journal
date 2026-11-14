# Architecture

Journal is a static-first Astro site. Astro generates editorial, category, tag and Projects archive routes at build time. Svelte is reserved for interactions that need client-side state or browser APIs.

## Runtime

- Astro static output, deployed to Cloudflare Pages.
- One MDX Journal collection; canonical project articles and related notes share its schema.
- Astro Content Collections validate content at build time.
- Iris supplies the shared UI primitives, theme tokens, icons and interaction primitives.
- Svelte islands power navigation, search, keyboard shortcuts, pagination and resource tooltips.
- A generated, versioned JSON search index is fetched on demand by the search dialog.

There is no application server, database, authentication, account system or reading-progress subsystem.

## Content boundaries

- `src/content/journal/` contains all journal entries and canonical project articles.
- `kind: project` marks canonical project articles; `project` associates related notes.
- `projectDetails` exists only on canonical project articles.
- `src/content.config.ts` validates the single Journal collection.
- `src/data/categories.ts` is the canonical category registry.
- `src/pages/search-index.v2.json.ts` generates the public search index.
- `src/pages/journal/` renders writing, category and tag routes.
- `src/pages/projects/` renders a generated project index and legacy redirects to canonical Journal articles.

## UI boundaries

- `ContentCard.svelte` owns the shared card surface and stretched native navigation link.
- `JournalEntryCard.svelte` and `ProjectCard.svelte` own their respective card content layouts.
- `TagList.svelte` owns independent tag links and responsive overflow behaviour.
- Iris components provide buttons, badges, tooltips, dialogs and other shared primitives.
- Astro owns page composition and static content rendering; Svelte components are hydrated only where interaction requires it.

## Search

The search index contains only the fields the UI consumes: stable ID, title, summary, tags, search terms, searchable text, destination URL and document kind. Ranking and payload validation live under `src/lib/search/`.

## Deployment

The site builds to `dist/` and deploys as static output to Cloudflare Pages. No server adapter is required.
