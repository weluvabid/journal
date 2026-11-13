---
id: wordweave
title: 'WordWeave'
summary: 'An experimental deterministic text codec that maps selected terms to reversible four-word phrases and evaluates accidental collisions against real-text corpora.'
status: experimental
tags: [typescript, encoding, information-theory, text-processing]
stack: [TypeScript, Node.js, Vitest, fast-check]
github: 'https://github.com/weluvabid/wordweave'
journal:
  primary: wordweave-ordinary-words-as-a-codec
featured: false
order: 10
---

## Overview

A fixed set of source terms maps to reserved four-word phrases. Punctuation, whitespace, and letter casing stay. Deterministic, and reversible for text that doesn't already contain a reserved phrase. Encoding, not encryption.

## Engineering notes

Each position draws from 64 words, so the ideal model has `64⁴` ordered phrases. The corpus scanner checks documents independently, which keeps a phrase from being stitched across a file boundary. The vocabulary is versioned. Change the mapping and you changed the protocol.

*Example I'd add:* `encode` of one sentence with the comma still there, and `findCodewordCollisions` on a line that already contains a reserved phrase.

## What to explore

- [Source repository](https://github.com/weluvabid/wordweave)
- [Collision analysis command](https://github.com/weluvabid/wordweave#collision-analysis)
