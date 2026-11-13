---
id: needle
title: 'Needle'
summary: 'An esoteric language that compiles to Brainfuck, with a Rust reference interpreter, source mappings, reversible stepping and a WebAssembly-powered playground.'
status: experimental
tags: [rust, compilers, interpreters, webassembly, debugging]
stack: [Rust, Brainfuck, WebAssembly, wasm-bindgen, TypeScript, Web Workers]
github: 'https://github.com/weluvabid/needle'
journal:
  primary: needle-language-compiler-and-reversible-debugger
featured: false
order: 11
---

## Overview

A tiny eight-command language, a direct Brainfuck compiler, and a reference interpreter that doesn't need a browser. The playground steps in both directions and maps back to source through a WebAssembly adapter in a Web Worker.

## Engineering notes

Tape, byte arithmetic, input and output, and execution limits are part of the language contract, not a comment beside it. Counted operations are atomic at the source level. Reversible history keeps bounded deltas instead of a full tape snapshot after every step. Differential tests run the reference interpreter against an independent Brainfuck runner.

*Example I'd add:* a short program, one forward step and the reverse of it, with the source span still attached.

## What to explore

- [Source repository](https://github.com/weluvabid/needle)
- [Language and runtime contract](https://github.com/weluvabid/needle#language-at-a-glance)
