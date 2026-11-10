# 0001 — Build the handbook as a static site

- **Status:** Accepted
- **Date:** 2026-11-07

## Context

Frontend Atlas is mostly editorial content: questions, explanations, links, and metadata. The pages
do not need per-request personalization or server-side data fetching. A runtime application server
would add deployment and operational work without solving a current product problem.

## Decision

Use Astro with `output: 'static'`. Generate pages and the search index at build time. Use Svelte
islands for the interactions that need browser state, and leave the content pages as HTML.

## Consequences

Good:

- Hosting is simple and inexpensive.
- Pages can be served from a static host/CDN.
- Most content does not require client-side JavaScript to render.
- Content and graph validation happen during the build.

Trade-offs:

- Content changes require a new build and deployment.
- Features that need shared server state require a separate architectural decision.
- Search downloads a generated index before ranking locally.

## Why not a full-stack app?

Because the problem is a handbook, not a collaborative workspace. Adding a backend before the
product needs one would be a hobby project inside the hobby project.
