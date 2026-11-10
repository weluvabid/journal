# Progress QR transfer protocol

The QR feature exists because progress is local, but people use more than one device. I did not want
to add accounts and a sync backend just to solve that one problem.

The export is a compact binary payload rendered as a QR image. Import reads an image, validates the
payload, previews the contents, and only then lets the user merge or replace local progress.

This is a portability format, not encryption. Anyone who gets the QR image can inspect its progress
data.

## Two different version numbers

There are two versioned things in this feature:

- The **progress snapshot schema** is currently version `2` (`PROGRESS_VERSION`). It describes the
  in-memory and LocalStorage model.
- The **QR wire format** is currently format version `1`. Its textual prefix is `FATL1:`.

Do not treat these numbers as interchangeable. The storage model can evolve independently of the
QR encoding.

## Text representation

An exported payload looks like this:

```text
FATL1:<base64url-encoded-binary-payload>
```

The Base64URL form avoids `+`, `/`, and padding characters in the text payload. The QR library turns
that text into an SVG and then a PNG data URL for download.

## Binary layout

All multi-byte integer fields are stored big-endian.

| Section              |                                Size | Meaning                                                         |
| -------------------- | ----------------------------------: | --------------------------------------------------------------- |
| Magic                |                             4 bytes | ASCII `FATL` (`46 41 54 4C`).                                   |
| Format version       |                              1 byte | Currently `1`.                                                  |
| Question count       |                              1 byte | Number of IDs represented by this payload.                      |
| Manifest fingerprint |                             8 bytes | FNV-1a 64-bit fingerprint of the represented ordered ID prefix. |
| Status bitset        | `ceil(questionCount × 2 / 8)` bytes | Two bits per question.                                          |
| Reading-entry count  |                              1 byte | Number of records with a saved reading position.                |
| Reading entries      |                        7 bytes each | Manifest index (1), position (2), timestamp (4).                |
| CRC                  |                             2 bytes | CRC-16/CCITT-FALSE checksum over all preceding bytes.           |

### Two-bit question state

Each question gets two bits, packed from the most significant bits of each byte:

| Bits | State       | Meaning                              |
| ---- | ----------- | ------------------------------------ |
| `00` | Not started | No completion or reading record.     |
| `01` | In progress | A reading-position entry must exist. |
| `10` | Completed   | Explicitly completed.                |
| `11` | Reserved    | Rejected by the decoder.             |

The status bitset follows the question order in the manifest prefix. It does not store question IDs
one by one; the manifest fingerprint and stable ordering let the decoder map each index back to an
ID.

### Reading entry

Each reading entry is seven bytes:

| Field          |    Size | Meaning                                                |
| -------------- | ------: | ------------------------------------------------------ |
| Question index |  1 byte | Zero-based index into the represented manifest prefix. |
| Position       | 2 bytes | Unsigned normalized position, `1..65535`.              |
| Timestamp      | 4 bytes | Unsigned seconds since `2020-01-01T00:00:00Z`.         |

The timestamp field supports dates from the 2020 epoch through the unsigned 32-bit range. The
maximum representable value lands in February 2156. The current encoder error message describes
the range as 2020–2155, which is slightly conservative; values outside the actual unsigned 32-bit
range are rejected rather than truncated.

A completed question also has a reading position of `65535`, so completed states normally have a
reading entry. The decoder checks that state and reading-entry data agree.

## Manifest fingerprint and compatibility

`src/data/question-manifest.ts` is an ordered, append-only list of immutable question IDs. The
encoder fingerprints the exact ordered list represented by the payload using FNV-1a 64-bit over the
UTF-8 encoding of IDs joined with a NUL separator.

The decoder takes the current manifest and checks the prefix whose length is stored in the payload.
That allows an older export to remain readable after new question IDs are appended.

This compatibility rule only works if existing slots are never reordered, removed, or reused. A
reorder is not a harmless cleanup: it changes the meaning of every index in the payload.

The fingerprint is an identity check, not a cryptographic security mechanism. It is not a signature
and does not prove who created the payload.

## Integrity check

The final two bytes contain a CRC-16 checksum calculated over every preceding payload byte. The
implementation initializes the CRC to `0xFFFF` and uses polynomial `0x1021`.

This catches accidental corruption and malformed transfers. CRC is not authentication: a person who
can modify the payload can also calculate a new CRC.

## Validation before mutation

The decoder rejects payloads with:

- An unknown textual prefix, magic value, or wire-format version.
- Invalid Base64URL characters or truncated sections.
- A question count larger than the current manifest.
- A manifest fingerprint that does not match the current manifest prefix.
- A failed CRC check.
- Reserved state bits.
- An invalid reading-entry count or section length.
- Duplicate/out-of-range question indexes, zero reading positions, or state/position conflicts.
- In-progress states that have no corresponding reading entry.

The UI decodes and validates the selected image before showing the import preview. The user must
then choose merge or replace. Import does not silently overwrite local progress.

Image handling also has bounds: the selected file must be an image no larger than 10 MiB, and its
decoded dimensions may not exceed 16 megapixels. The image bitmap is closed after processing.

## Why binary instead of JSON?

A QR code has a finite amount of room before it becomes unpleasant to scan. Repeating every question
ID, property name, and timestamp as JSON would waste a lot of that room.

The manifest already gives both sides a shared ordered dictionary of question IDs. The payload can
therefore store compact indexes, two-bit states, 16-bit positions, and 32-bit timestamps. The tests
exercise the 150-question cap with a reading position for every question and assert that the encoded
text stays at or below 1,500 characters.

That is the trade-off: a smaller payload in exchange for a stricter compatibility contract. The
append-only manifest is part of the protocol, not just a content list.

## What the QR contains

- The current editorial cap is 150 questions.
- The QR image is a portable copy of progress, not an encrypted backup.
- Anyone with the QR image can read the learning states and reading positions.
- The manifest fingerprint and CRC detect mismatches/corruption; neither prevents intentional
  modification.
- There is no sender identity, signature, or remote revocation.
- Do not put secrets or personal information into the progress payload. The current model contains
  question IDs, completion state, positions, and timestamps only.

## Implementation and tests

- Encoder/decoder: `src/lib/progress/qr.ts`
- UI and image processing: `src/components/progress/ProgressQrTransfer.svelte`
- Stable IDs: `src/data/question-manifest.ts`
- Tests: `tests/progress-qr.test.mjs`
