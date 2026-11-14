# Journal

A personal engineering journal and project portfolio. Journal records the reasoning behind the work: experiments, implementation notes, technical deep dives and retrospectives.

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

Journal entries live in `src/content/journal/*.mdx`. Each entry has validated frontmatter:

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
featured: false
draft: false
---
```

Supported entry types: `engineering-note`, `build-log`, `deep-dive`, `retrospective`.

Supported categories: `systems-engineering`, `frontend-engineering`, `product-engineering`, `engineering-thinking`.

Projects are canonical Journal entries, not a second content collection. Mark the primary article with `kind: project`, set its stable `project` ID, add the `project` tag, and put status, stack, repository links and curated repository resources in `projectDetails`. Related articles use the same `project` ID but keep `kind: article`. The Projects archive and the resource section at the end of the canonical article are generated from that single record. See `docs/content-architecture.md` for the schema.
