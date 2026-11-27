# Journal

A personal engineering journal and project portfolio. I use it to write about the software I build, the decisions behind it, the experiments that shape it and the things I learn along the way.

Journal entries and project pages share one content collection. The site generates the journal, project archive, category and tag pages from that content.

## What you'll find

- Engineering notes, build logs, technical deep dives and retrospectives.
- Project pages with implementation details and links to source repositories.
- Search, category and tag browsing.
- Keyboard navigation and accessible interactive components.

## Stack

- Astro static generation
- Svelte 5 for existing interactive UI
- Tailwind CSS 4
- Iris component library
- MDX content collections
- Cloudflare Pages deployment

## Development

Requirements: Node.js 26 LTS and pnpm 12.

```sh
git clone --recurse-submodules https://github.com/weluvabid/journal.git
cd journal
pnpm install --frozen-lockfile
pnpm dev
```

If the repository was cloned without submodules, initialise the retained branding submodule:

```sh
git submodule update --init --recursive
```

## Content

Journal entries live in `src/content/journal/*.mdx`. Each entry has frontmatter:

```yaml
---
id: a-stable-kebab-case-id
title: A useful title
type: engineering-note
category: systems-engineering
summary: A concise description of the entry.
date: 2026-11-12
tags: [rust, systems]
searchTerms: [ownership, concurrency]
kind: article
draft: false
---
```

Supported entry types: `engineering-note`, `build-log`, `deep-dive`, `retrospective`.

Supported categories: `systems-engineering`, `frontend-engineering`, `product-engineering`, `engineering-thinking`.

## Documentation

- [Architecture](docs/architecture.md) — runtime, content and UI boundaries.
- [Content architecture](docs/content-architecture.md) — collections, project associations and frontmatter.
- [Accessibility](docs/accessibility.md) — keyboard, focus and assistive-technology behaviour.
- [Performance](docs/performance.md) — rendering, loading and performance decisions.
- [Security and privacy](docs/security-and-privacy.md) — site security headers and data handling.
- [Development](docs/development.md) — checks, tests and local workflows.
- [Architecture diagrams](docs/diagrams/README.md) — maintained SVG diagrams linked from project pages.
