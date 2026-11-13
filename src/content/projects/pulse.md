---
id: pulse
title: 'Pulse'
summary: 'A framework-independent JavaScript reactive runtime built from signals, lazy computed values, tracked effects and batched synchronous scheduling.'
status: released
tags: [javascript, typescript, reactivity, runtime]
stack: [TypeScript, JavaScript, Vitest]
github: 'https://github.com/weluvabid/pulse'
journal:
  primary: pulse-reactive-runtime-from-first-principles
featured: false
order: 4
---

## Overview

`signal`, `computed`, `effect`, `batch`. Hybrid push-pull: writes invalidate dependents, computed values refresh lazily when pulled, effects run on a synchronous scheduler. No framework wrapped around it.

## Engineering notes

Effects run immediately, track what they read, support cleanup, and return a disposer. Batching groups writes and flushes at the outermost boundary. Optional instrumentation exposes runtime events and ids without exposing application values. A listener that throws stays isolated from the runtime.


## What to explore

- [Source repository](https://github.com/weluvabid/pulse)
- [Package README and API example](https://github.com/weluvabid/pulse#readme)
