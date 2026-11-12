# 0001 — Keep the site static-first

## Context

Journal is editorial content: writing, project descriptions, metadata and links. Most pages can be generated at build time and served directly from the edge.

## Decision

Use Astro static generation. Keep interactive behaviour in small, client-hydrated Svelte components where it provides real value.

## Consequences

- No application server, database or account system is required.
- Content is validated at build time.
- Search data is generated as a static JSON index.
- Cloudflare Pages can serve the complete site.
- Dynamic infrastructure is introduced only when a concrete requirement justifies it.
