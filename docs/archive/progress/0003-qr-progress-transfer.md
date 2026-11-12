# 0003 — Use a QR image for explicit progress transfer

- **Status:** Accepted
- **Date:** 2026-11-07

## Context

Progress is local by design, but a reader may want to move it to another device. Building account
sync would undo the simplicity of the accountless model.

## Decision

Encode a bounded progress snapshot into a compact binary payload, render it as a QR image, and let
the destination browser import that image. Validate and preview the payload before the user chooses
merge or replace.

The payload uses a format version, manifest fingerprint, packed two-bit states, indexed reading
records, and a CRC. See [the protocol document](../progress-transfer-protocol.md) for the exact
layout.

## Consequences

Good:

- Cross-device transfer without accounts or a server.
- A user-controlled export that can also act as a backup.
- Compact payloads because question IDs are represented by manifest indexes.
- Old exports remain compatible when new question IDs are appended.

Trade-offs:

- The user must move the image themselves.
- The payload is readable, not encrypted.
- The manifest order becomes a compatibility contract.
- The format needs explicit versioning and strict validation.
- QR images can be lost, copied, or modified; CRC is not authentication.

## Why not JSON in the QR?

The manifest already gives both ends the ordered question IDs. Repeating every ID and JSON property
name in the QR would be wasteful. A compact binary format keeps the payload smaller, at the cost of
having to maintain a protocol. That's a fair trade for a feature whose data shape is intentionally
small and bounded.
