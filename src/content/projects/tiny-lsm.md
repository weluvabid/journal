---
id: tiny-lsm
title: 'Tiny-LSM'
summary: 'An inspectable Rust LSM-style key-value store exploring ordered memtables, immutable sorted runs, tombstones, compaction and validated recovery.'
status: experimental
tags: [rust, storage-engines, algorithms, databases]
stack: [Rust, Cargo, BTreeMap, Storage engines]
github: 'https://github.com/weluvabid/tiny-lsm'
journal:
  primary: a-small-lsm-tree
featured: true
order: 5
---

## Overview

Synchronous, single-writer educational engine for opaque byte-string keys and values. Ordered memtable, immutable sorted runs, newest-first reads, tombstones, k-way compaction. Built to make the storage decisions inspectable, not to grow into a database product.

## Engineering notes

Flush publishes the sorted run before it clears the memtable. Tombstones have to survive flush and compaction or a delete is optional. Run files are versioned and structurally validated on recovery. `Engine::inspect` is the deterministic look inside. Deliberately absent: a WAL, concurrent access, background maintenance, Bloom filters, a block cache, transactions.


## What to explore

- [Architecture and invariants](https://github.com/weluvabid/tiny-lsm/blob/main/docs/ARCHITECTURE.md)
- [Sorted-run format](https://github.com/weluvabid/tiny-lsm/blob/main/docs/SORTED-RUNS.md)
- [Compaction](https://github.com/weluvabid/tiny-lsm/blob/main/docs/COMPACTION.md)
- [Recovery](https://github.com/weluvabid/tiny-lsm/blob/main/docs/RECOVERY.md)
- [Benchmark methodology](https://github.com/weluvabid/tiny-lsm/blob/main/docs/BENCHMARKS.md)
