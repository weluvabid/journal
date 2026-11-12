# Content architecture

## Journal entries

Journal entries are MDX files in `src/content/journal/`. The collection schema validates:

- Stable kebab-case `id`.
- Title and summary.
- Entry type: `engineering-note`, `build-log`, `deep-dive`, `retrospective`.
- Category: `systems-engineering`, `frontend-engineering`, `product-engineering`, `engineering-thinking`.
- Date, tags, optional project association, search terms, featured and draft flags.

The route is derived from the stable ID: `/journal/<id>/`.

## Projects

Project pages are Markdown files in `src/content/projects/`. Metadata includes title, summary, status, technology stack, optional GitHub/demo URLs, featured flag and display order.

FulfillmentGuard is intentionally excluded from the initial public portfolio while it remains under development.

## Search

The generated `/search-index.json` includes published journal entries and projects. It preserves the existing search ranking and keyboard interaction implementation while using Journal-specific metadata and routes.

## Seed content

The repository contains 20 valid MDX seed entries with Lorem Ipsum bodies. These are structural seed content, not finished editorial copy. Replace the body text before presenting those entries as substantive published writing.
