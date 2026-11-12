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

Projects live in `src/content/projects/*.md`. Add a project document and its metadata; the projects listing and search index are generated from the collection.

The repository includes 20 seed entries with Lorem Ipsum bodies. Replace those bodies with original writing before treating them as published articles.

## Quality gates

```sh
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm build
```

Or run all gates with `pnpm check`.

## Cloudflare Pages

The GitHub Actions deployment workflow builds the static site and deploys `dist/` using Wrangler.

Configure these GitHub repository secrets:

- `CLOUDFLARE_API_TOKEN` — token with Cloudflare Pages edit permissions.
- `CLOUDFLARE_ACCOUNT_ID` — Cloudflare account identifier.

Create a Cloudflare Pages project named `journal`. The workflow deploys to that project on pushes to `main`.

The site is fully static. No Workers runtime, database, authentication or server-side adapter is required.

## Branding submodule

`brand/me` remains a Git submodule pointing to `weluvabid/me`. Keep it initialised for local development and CI so favicon and brand asset imports resolve.
