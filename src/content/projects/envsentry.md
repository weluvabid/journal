---
id: envsentry
title: 'EnvSentry'
summary: 'A Rust CLI that detects structural configuration drift across dotenv, JSON and TOML while keeping compared values out of diagnostics.'
status: experimental
tags: [rust, cli, configuration, security, developer-tools]
stack: [Rust, Cargo, Serde, TOML]
github: 'https://github.com/weluvabid/envsentry'
journal:
  primary: envsentry-configuration-drift-without-secrets
featured: false
order: 8
---

## Overview

Compares a reference config to a target. Missing keys, duplicates, unexpected keys, empty values, value and type mismatches. Dotenv, JSON, and TOML, through one canonical model.

## Engineering notes

Core model and comparison, parsers, and the CLI stay split. Entries keep duplicate occurrences and explicit container paths, so folding into a map can't hide a repeated key. Diagnostics are deterministic and omit raw values in both text and JSON. Strict mode makes warnings fail the process without changing their severity. Check stays on structural findings.


## What to explore

- [Architecture](https://github.com/weluvabid/envsentry/blob/main/docs/architecture.md)
- [Design decisions](https://github.com/weluvabid/envsentry/blob/main/docs/design-decisions.md)
- [Security model](https://github.com/weluvabid/envsentry/blob/main/docs/security.md)
- [Diagnostics](https://github.com/weluvabid/envsentry/blob/main/docs/diagnostics.md)
