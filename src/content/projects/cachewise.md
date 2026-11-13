---
id: cachewise
title: 'Cachewise'
summary: 'A TypeScript in-memory cache with a logical byte budget, cost-aware admission and eviction, TTL handling and per-key single-flight computation.'
status: released
tags: [typescript, caching, benchmarking, performance, concurrency]
stack: [TypeScript, Node.js, pnpm, Vitest]
github: 'https://github.com/weluvabid/cachewise'
journal:
  primary: building-a-cache-from-first-principles
  related: [cost-aware-eviction-policies, benchmarking-without-lying-to-yourself]
featured: true
order: 1
---

## Overview

In-memory cache for one JavaScript agent. The default policy is cost-aware: recency, estimated reuse, a caller-supplied recomputation cost, and logical entry size. LRU stays, because a clever policy with nothing to lose to is just a story.

## Engineering notes

Size is an estimate the caller provides. Not a hard heap cap, and I don't describe it as one. Admission picks victims before it mutates what's already resident. Per-key single-flight runs one factory, and each caller can still cancel on their own. Invalidation and a cache-wide epoch stop a late factory from writing back after `set`, `delete`, or `clear`.


## What to explore

- [Architecture](https://github.com/weluvabid/cachewise/blob/main/docs/architecture.md)
- [Eviction and admission](https://github.com/weluvabid/cachewise/blob/main/docs/eviction-and-admission.md)
- [Concurrency](https://github.com/weluvabid/cachewise/blob/main/docs/concurrency.md)
- [Memory accounting](https://github.com/weluvabid/cachewise/blob/main/docs/memory-accounting.md)
- [Benchmark methodology](https://github.com/weluvabid/cachewise/blob/main/docs/benchmarking.md)
