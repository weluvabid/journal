# 0002 — Keep learning progress accountless

- **Status:** Accepted
- **Date:** 2026-11-07

## Context

A conventional progress system often starts with accounts and server-side persistence. That brings
registration, authentication, password resets, sessions, email delivery, user records, account
recovery, deletion workflows, and the ongoing responsibility of keeping all of that working.

I wanted to track which questions someone had completed. I did not want to manage users. Lazy? Yes.
Also a useful constraint.

## Decision

Store progress in the visitor's browser using `localStorage`. Keep the progress model and mutation
logic behind a shared service. Provide explicit QR export/import for people who want to move progress
between devices.

## Consequences

Good:

- No accounts or authentication flow.
- No user database or progress API.
- Progress is available without signing in.
- The application does not need to receive or store progress on a server.

Trade-offs:

- Progress is tied to the browser profile and site origin until exported.
- Clearing browser data can remove the local copy.
- There is no automatic cross-device sync or account recovery.
- Users are responsible for keeping a QR export if they want a portable backup.
- Storage can be unavailable or quota-limited; the app must explain when progress is only volatile.

## Revisit when

Revisit this decision only if there is a real product requirement for automatic sync, shared
progress, or account-bound features. Do not add accounts just because most websites have them.
