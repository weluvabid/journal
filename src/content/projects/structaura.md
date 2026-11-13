---
id: structaura
title: 'StructAura'
summary: 'Deterministic JavaScript and TypeScript AST fingerprinting built with Tree-sitter, a shared Rust core, SHA-256 Merkle hashing and WebAssembly.'
status: experimental
tags: [rust, webassembly, tree-sitter, javascript, typescript, hashing]
stack: [Rust, WebAssembly, Tree-sitter, JavaScript, TypeScript]
github: 'https://github.com/weluvabid/structaura'
journal:
  primary: building-structaura
featured: false
order: 6
---

## Overview

Deterministic, versioned structural fingerprints for JavaScript and TypeScript. Tree-sitter parses. A bounded normalization policy drops the syntax noise that isn't part of the contract. What's left is hashed with a SHA-256 Merkle scheme.

Native Rust and the browser package share that core. The browser side parses with `web-tree-sitter` and exposes ESM as `@weluvabid/structaura`.

## Engineering notes

Parser adapters are not the fingerprint. Both sides emit the same flat preorder records, and the Rust core validates and rebuilds that representation iteratively. Canonical encoding uses domain separation, length-prefixed values, fixed-width integers, typed properties, and ordered child hashes.

A fingerprint carries a format version, a language identifier, and a language-specific normalization version. Mismatched identities are rejected. You don't compare bare digests and hope. Normalization removes comments and selected syntax noise. It is not a semantic-equivalence engine.

*Example I'd add:* two sources that differ only by a comment (same fingerprint), one structural edit (different fingerprint), version fields visible.

## What to explore

- [Source repository](https://github.com/weluvabid/structaura)
- [Architecture documentation](https://github.com/weluvabid/structaura/blob/main/docs/architecture.md)
- [Fingerprint contract](https://github.com/weluvabid/structaura/blob/main/docs/fingerprint-contract.md)
- [Benchmark methodology and results](https://github.com/weluvabid/structaura/blob/main/docs/benchmarks.md)
