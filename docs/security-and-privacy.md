# Security and privacy

There is no account or application backend. Learning progress stays in the visitor's browser;
Frontend Atlas does not receive a copy of it. That avoids collecting account details just to remember
which questions someone has read.

## Progress data

The progress snapshot contains:

- Stable question IDs.
- Which questions were explicitly completed.
- Normalized reading positions.
- Timestamps associated with reading positions and the snapshot.

It does not contain names, email addresses, passwords, or account identifiers.

The data is stored in `localStorage` for the current site origin and browser profile. Anyone with
access to that browser profile or developer tools may be able to inspect it. Clearing site data or
using a different browser/profile can make the local copy unavailable.

If browser storage is blocked or full, the app can keep progress in memory for the current session,
but it warns that the data is not persisted. That volatile copy can disappear on reload or tab
closure.

## QR exports are readable data

A QR export contains completion states, reading positions, question IDs through the manifest, and
reading timestamps. It is not encrypted and is not signed.

The manifest fingerprint checks that the payload belongs to the expected question ordering. The
CRC checks for accidental corruption. Neither one protects against someone deliberately editing the
payload. Do not treat a QR image as a secret or as proof of identity.

Keep exported images somewhere appropriate. Anyone who obtains one can read its progress data and
can attempt to import a modified payload. The import decoder validates structure and consistency,
but it does not authenticate the source.

## Import safety

Import is a user-initiated local file operation. The UI checks the file type and size, limits decoded
images to 16 megapixels, validates the QR payload, and shows a preview before applying it. The user
must explicitly choose merge or replace.

Malformed snapshots are not silently written over. Save and merge operations refuse to overwrite
invalid local data. The user can choose to replace it with a valid imported snapshot if they have a
backup.

## Browser storage errors

Expected browser storage failures such as `SecurityError` and `QuotaExceededError` are handled as
storage-unavailable conditions. Unexpected errors are allowed to propagate rather than being
swallowed. This is important for both debugging and data integrity: an unknown failure should not
masquerade as a successful save.

## Static hosting and third parties

The site is built as static files and currently hosted on GitHub Pages. The application does not
implement analytics, account tracking, or a progress API in the source shown here. The project does
use third-party packages and a component library; their own code and policies are separate from the
application's progress model.

The browser still downloads pages, the search index, fonts, scripts, styles, and third-party
packages used by the site. Static hosting removes the application backend; it does not make the
website network-free.

Progress has no server-side backup. Clearing site data removes the browser's copy, so export a QR
image if you want to keep a portable copy outside that browser profile.
