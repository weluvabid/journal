---
id: jsonplus
title: 'JSON+'
summary: 'A versioned, graph-aware serialization format for JavaScript values that preserves cycles, shared object identity, built-ins and binary views.'
status: released
tags: [typescript, javascript, serialization, graph-theory, data-structures]
stack: [TypeScript, JavaScript, Node.js, Vitest]
github: 'https://github.com/weluvabid/jsonplus'
stackblitz: 'https://stackblitz.com/edit/jsonplus?file=index.js'
journal:
  primary: building-jsonplus
featured: false
order: 7
---

## Overview

Dependency-free, versioned serialization for a bounded subset of JavaScript values. Referenceable objects are a graph. Cycles, shared identity, sparse arrays, the built-ins it supports, and shared binary backing buffers survive the round trip.

## Engineering notes

The encoder registers an object's identity before walking outgoing edges. The node table is the work queue, so there isn't a second traversal structure or a recursive walk of the source. Decode validates the versioned schema, duplicate object keys, references, reachability, binary payloads, and the configured limits before it allocates and wires the graph. Properties and collection entries sit in flat alternating buffers. Failures use stable `JSONPlusError` codes.

Documented subset, not a picture of the whole runtime. Functions, symbols, arbitrary class instances, weak collections, shared or resizable buffers, and cross-realm objects are outside the contract.


## What to explore

- [Source repository](https://github.com/weluvabid/jsonplus)
- [Version 1 specification](https://github.com/weluvabid/jsonplus/blob/main/SPEC.md)
- [README and API examples](https://github.com/weluvabid/jsonplus#readme)
