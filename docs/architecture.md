# Architecture

Journal is a static-first Astro site. Astro generates all editorial and project routes at build time; Svelte is used only for existing interactive interface components.

## Runtime

- Astro static output.
- MDX journal collection.
- Markdown project collection.
- Existing Iris components and theme.
- Existing Svelte search, keyboard and dialog interactions.
- Generated JSON search index.
- Cloudflare Pages static hosting.

There is no application server, database, authentication, user account or progress-tracking subsystem.

## Content boundaries

- `src/content/journal/` contains writing.
- `src/content/projects/` contains project portfolio entries.
- `src/content.config.ts` validates both collections.
- `src/pages/search-index.json.ts` generates the browser search index.
- `src/pages/journal/` renders entries.
- `src/pages/projects/` renders projects.

## Shared foundation

The header, footer, theme bootstrap, navigation transition loader, skip link, typography, design tokens, Iris components, search UI, keyboard controller, notification surface, and accessibility conventions are inherited from Frontend Atlas. Prefer adapting these components over introducing replacements.

## Deployment

The site builds to `dist/` and deploys to Cloudflare Pages. No adapter is required for static output.
