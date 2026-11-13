---
id: frontend-atlas
title: 'Frontend Atlas'
summary: 'A static-first frontend engineering handbook with local reading progress, browser-side search and a compact QR protocol for carrying learning state between devices.'
status: released
tags: [astro, svelte, typescript, frontend, accessibility, progress-tracking, qr-codes, bit-packing]
stack: [Astro, Svelte, TypeScript, Tailwind CSS, Iris, QR]
github: 'https://github.com/weluvabid/frontend-atlas'
mermaid: 'https://mermaid.live/edit#pako:eNpVjb1ug0AQhF_ltFUigUWMMT9FpBgnbiwlhauAixMsHLK5Q8sh2wHePQdWlGSrHc03Mz1kKkeIoDirSyY4aXbYppKZe0liQVWra94emW0_DzvUrFYSbwPbPOwUa4VqmkqWj3d-M0Es7vcThkyLSp7GuxXP-XeJA9sme95o1Rz_OoeLGthrUn0IU__fEYQm9ZYUPCq4nXFiMacZAQtKqnKINHVoQY1U80lCP7kpaIE1phCZlzDvrnbO6WRn6qwohVSOJt9w-alU_VNBqisFmJ1za1TX5FzjtuIl8V8EZY4Uq05qiLy5AaIerkb4C8fzQ9cPloETesHaghtEy2W4cNau6z95KzcMQ2c1WvA1bzqLwPfGb103d4U'
journal:
  primary: frontend-atlas-progress-without-accounts
featured: true
order: 2
---

## Overview

A static field guide. Astro for the pages, Svelte where something has to move. Questions, explanations, examples, prerequisites, related topics, and search in the browser. Pages are built ahead of time. Hydration is for the islands that hold state, not for the article.

## Engineering notes

No accounts and no progress backend. Completion and a normalized reading depth live in a shared local progress service. Updates coalesce on `requestAnimationFrame`, then debounce, and they stay monotonic. Scrolling backwards does not erase the furthest point reached.

Carrying that to another device is a versioned QR protocol, not a login. The question manifest is append-only so an older export keeps its indexes. Two bits per question. Fixed-width records for reading position and timestamps. The decoder checks manifest fingerprint, CRC, section lengths, and state consistency before it offers merge or replace. The cap is 150 questions, and tests cover the maximum payload, not only a short sample.

Astro owns static content and routing. Svelte owns the islands. Iris is the shared UI. Search is a static JSON index, ranked in memory after it loads. The handbook can remember a reader without knowing who they are.

*Example I'd add:* a short manifest, the packed payload size, and a merge onto a profile that already had a completion the QR didn't.

## What to explore

- [Source repository](https://github.com/weluvabid/frontend-atlas)
- [Architecture](https://github.com/weluvabid/frontend-atlas/blob/main/docs/architecture.md)
- [Progress system](https://github.com/weluvabid/frontend-atlas/blob/main/docs/progress-system.md)
- [QR transfer protocol](https://github.com/weluvabid/frontend-atlas/blob/main/docs/progress-transfer-protocol.md)
- [Content architecture](https://github.com/weluvabid/frontend-atlas/blob/main/docs/content-architecture.md)
