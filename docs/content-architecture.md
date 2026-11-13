# Content architecture

## Journal entries

Journal entries are MDX files in `src/content/journal/`. The collection schema in `src/content.config.ts` validates:

- Stable kebab-case `id` used for the public route.
- Title, summary, publication date and entry type.
- One of the canonical category IDs from `src/data/categories.ts`.
- One to eight tags and up to twelve search terms.
- Optional project association and optional Git, StackBlitz and Mermaid resource URLs.
- Featured and draft flags.

The public route is derived from the stable ID: `/journal/<id>/`. Draft entries are excluded from public routes, listing data and search.

## Projects

Project pages are Markdown files in `src/content/projects/`. Metadata includes a stable ID, title, summary, status, technology stack, tags, optional GitHub/demo/StackBlitz/Mermaid URLs, featured flag and display order.

Project tags use the same canonical tag URL model as journal tags but live under `/projects/tag/<slug>/`.

## Categories

`src/data/categories.ts` is the single category registry. It supplies human-readable labels, descriptions and stable IDs to the homepage, category selector and category archive routes. The content schema constrains journal category values to the supported IDs.

## Search

The generated `/search-index.v2.json` contains only the fields consumed by the client search UI: ID, title, summary, tags, search terms, searchable text, destination URL and document kind. Its payload is versioned and strictly validated before ranking. Search ranking and validation live in `src/lib/search/`.

## Editorial content

The collection began with 20 structural seed entries. The first has been replaced with a substantive
Journal article; the remaining placeholders still need real editorial copy before being presented
as finished writing.
